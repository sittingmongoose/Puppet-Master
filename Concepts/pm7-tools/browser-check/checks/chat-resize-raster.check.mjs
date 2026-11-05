import {mkdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {captureResize, classifyResize} from '../helpers/resize-raster.mjs';

// SW-36: Basic Dark, chat column 760, selected agent Detail docked at 1390x900, the frame shrinks to 1177x900 (the
// boundary where it must cover). Painted frames, not a rAF sampler. In T3's opaque iframe the child runs its resize
// event before its first new-sized frame, so that frame must already be the settled cover (no docked panel beside under
// 360 px of messages, no panel fading back in), and the parent must not show the old child image clipped to the new
// width for longer than on the control build. On a normal page Chrome lays a same-process frame out at its new size in
// the parent's frame and fires its resize event one rendering update later, so the first new-sized frame is the column
// at its old width beside the shrunk centre (the dock still beside 479 px), on every build; there the cover must arrive
// no later than on the control and stay once shown. The 360 px floor in every frame is also chat-sweep's rAF case.
// --set control=<page> measures a control build in the same browser, order-balanced (C H H C ...), --set reps=N pairs.
// --set sandbox=1 opaque only, =0 normal only; both by default.
const FROM = 1390, TO = 1177, HEIGHT = 900;
const url = p => /^https?:/.test(p) ? p : pathToFileURL(p).href;
const median = a => { const s = [...a].sort((x, y) => x - y); return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : null; };

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
	if (opaque) await (await f.frameElement()).evaluate(e => e.setAttribute('sandbox', 'allow-scripts allow-forms allow-popups allow-downloads'));
	const head = t.args.page || new URL('../../../PMConcept7.html', import.meta.url).pathname;
	const control = t.args.control;
	const reps = Number(t.args.reps || 3);
	const order = [];
	for (let i = 0; i < reps; i++) order.push(...(control ? (i % 2 ? ['head', 'control'] : ['control', 'head']) : ['head']));
	const dir = join(t.run.dir, opaque ? 'opaque' : 'normal');
	const runs = {head: [], control: []};
	let n = 0;
	for (const which of order) {
		const r = await shrinkOnce(t, f, which === 'head' ? head : control, opaque, which + '-' + (n++), dir);
		runs[which].push(r);
		if (which !== 'head') continue;
		const tag = (opaque ? 'opaque ' : 'normal ') + (runs.head.length - 1);
		await t.check(tag + ' settles to the cover at 1177', r.settledState.w === TO && r.settledState.cover, JSON.stringify(r.settledState));
		await t.check(tag + ' frames classified', !r.error && r.firstNewMs != null && r.settled, r.error || JSON.stringify({firstNewMs: r.firstNewMs, settled: r.settled}));
		if (opaque) await t.check(tag + ' first new-sized frame is the settled cover, no docked or other intermediate frame', !r.error && r.firstNewKind === 'final' && r.intermediate.length === 0, JSON.stringify({firstNewKind: r.firstNewKind, intermediate: r.intermediate}));
		await t.check(tag + ' the cover stays once shown', !r.error && r.unsettled.length === 0, JSON.stringify({unsettled: r.unsettled}));
	}
	const key = opaque ? 'retainedMs' : 'settledMs';
	const stat = which => runs[which].map(r => r[key]).filter(v => v != null);
	const summary = {surface: opaque ? 'opaque' : 'normal', measure: key, head: stat('head'), control: stat('control'), headMedian: median(stat('head')), controlMedian: median(stat('control')),
		controlIntermediate: runs.control.map(r => r.intermediate?.length ?? null), headFirstNew: runs.head.map(r => r.firstNewMs), controlFirstNew: runs.control.map(r => r.firstNewMs),
		headSettled: runs.head.map(r => r.settledMs), controlSettled: runs.control.map(r => r.settledMs)};
	t.log('resize raster ' + JSON.stringify(summary));
	writeFileSync(join(dir, 'summary.json'), JSON.stringify(summary, null, 1));
	if (opaque) await t.check('opaque parent shows the old image clipped (measured) on the head', stat('head').length === runs.head.length, JSON.stringify(summary));
	if (control && opaque) await t.check('opaque settledMs head median <= control median', median(summary.headSettled) != null && median(summary.headSettled) <= median(summary.controlSettled), JSON.stringify(summary));
	if (control) await t.check(`${summary.surface} ${key} head median <= control median`, summary.headMedian != null && summary.controlMedian != null && summary.headMedian <= summary.controlMedian, JSON.stringify(summary));
	if (t.args.maxMs) await t.check(`${summary.surface} ${key} head median <= ${t.args.maxMs} ms`, summary.headMedian != null && summary.headMedian <= Number(t.args.maxMs), JSON.stringify(summary));
}

export const tests = {
	'SW36 opaque resize raster': async t => { if (t.args.sandbox == null || Number(t.args.sandbox) === 1) await surface(t, true); },
	'SW36 normal resize first frame': async t => { if (t.args.sandbox == null || Number(t.args.sandbox) === 0) await surface(t, false); }
};
