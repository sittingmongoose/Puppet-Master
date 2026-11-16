// What would PERF-USAGE-HOVER (card A: pause hover highlights on Usage while the mouse wheel turns) buy on this machine?
// A diagnostic, asserts nothing about speed. One page with fix 1 (Usage's board scrolls on the compositor), the pause
// switched on and off inside the same session as a prototype: a transparent sticky layer over the board's view from the
// first wheel or scroll event to 150 ms after the last, so nothing under a resting pointer takes hover while the wheel
// turns (the shipped pause would gate the hover effects instead and keep hit-testing as it is; what it saves is the
// same work: no hover restyles, transitions, hover light or tool fitting while scrolling).
// Per look, four windows in --set order (default asis,paused,paused,asis), each the kit check's equal work
// (perf-usage-scroll): 48 wheel ticks of 40 px (--set ticks=) from the board's top, turning every 12, the pointer resting
// at the page's centre (55 % down), traced from the first tick to 400 ms after the last. Logged per window and as means:
// frames never presented, presented with a partial update and of unknown presentation a second (helpers/frame-trace.mjs,
// each DroppedFrame classified by its frame reporter's final state), main-thread, paint (+ pre-paint + layerize) and
// GPU-thread ms a second, scroll events, frames drawn.
//   NODE_OPTIONS=--max-old-space-size=8192 browser-check run diagnostics/usage-hover-pause-price.check.mjs \
//     --host windows --set page=http://192.168.50.179:18644/v-3.html --set looks=basic-dark,retro-dark \
//     --set out=<file.json> --out <run folder>
//   --set order=asis,paused,paused,asis   --set ticks=48   --set settle=25000   --set sandbox=0|1 (the kit's switch)
import { writeFileSync } from 'node:fs';
import { traceWindow } from '../helpers/frame-trace.mjs';
import { muteSound } from '../helpers/quiet-page.mjs';

// the prototype pause, installed once in the app's frame; window.__pausePriceOn turns it on and off
const INSTALL = () => {
	const sc = document.getElementById('pmuScroll'); if (!sc || window.__pausePriceShield) return !!sc;
	const sh = window.__pausePriceShield = document.createElement('div');
	sh.style.cssText = 'position:sticky;top:0;grid-area:1/1;align-self:start;z-index:50;display:none;background:transparent;';
	sc.appendChild(sh);
	let tm = 0;
	const show = () => { if (!window.__pausePriceOn) return; if (sh.style.display !== 'block') { sh.style.height = sc.clientHeight + 'px'; sh.style.display = 'block'; } clearTimeout(tm); tm = setTimeout(() => { sh.style.display = 'none'; }, 150); };
	sc.addEventListener('wheel', show, { passive: true }); sc.addEventListener('scroll', show, { passive: true });
	return true;
};

export default async function (t) {
	const looks = String(t.args.looks || 'basic-dark,retro-dark').split(',').filter(Boolean);
	const order = String(t.args.order || 'asis,paused,paused,asis').split(',').filter(Boolean);
	const TICKS = Number(t.args.ticks || 48), MS = 8000, TAIL = 400, W = 1920, H = 1080;
	await t.viewport(W, H);
	await muteSound(t.page);
	const f = await t.app.open({ query: 'pm-warm=0' });
	await f.evaluate(() => document.fonts.ready.then(() => true));
	await t.page.waitForTimeout(Number(t.args.settle ?? 25000));
	const cdp = await t.page.context().newCDPSession(t.page);
	const out = [];
	for (const look of looks) {
		await t.app.look(look);
		await f.waitForFunction(() => !(window.PM_THEME_TRANSITION?.busy?.() || window.PM_LOOK_COVERED?.()), null, { timeout: 20000 }).catch(() => {});
		await f.evaluate(() => PM_PAGES.go('usage'));
		await t.page.waitForTimeout(Number(t.args.viewSettle ?? 10000));
		const ok = await f.evaluate(INSTALL);
		const range = await f.evaluate(() => { const s = document.getElementById('pmuScroll'); return s ? s.scrollHeight - s.clientHeight : 0; });
		if (!ok || range < 200) { await t.check(`${look}: could judge: Usage's board is there and can scroll`, false, `range ${range}`); continue; }
		const turn = Math.max(3, Math.min(12, Math.floor(range / 40) - 2));
		const rows = [];
		for (const name of order) {
			await f.evaluate((on) => { window.__pausePriceOn = on; }, name === 'paused');
			await t.page.mouse.move(W - 6, Math.round(H / 2));
			await t.page.waitForTimeout(2000);
			const at = await f.evaluate(() => { const s = document.getElementById('pmuScroll'); s.scrollTop = 0; const p = document.querySelector('.page.active') || document.body, r = p.getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height * 0.55) }; });
			await t.page.waitForTimeout(400);
			await t.page.mouse.move(at.x, at.y);
			await t.page.waitForTimeout(600);
			let ticks = 0;
			const x = await traceWindow(cdp, { ms: 1, url: f.url(), during: async () => { const until = Date.now() + MS; let i = 0; while (i < TICKS && Date.now() < until) { await t.page.mouse.wheel(0, (Math.floor(i++ / turn) % 2 ? -1 : 1) * 40); await new Promise((r) => setTimeout(r, 14)); } ticks = i; await new Promise((r) => setTimeout(r, TAIL)); } });
			const sp = x.split, fr = x.frames;
			const row = { look, name, ticks, secs: x.secs, dataLoss: x.dataLoss, main: Math.round(x.cost.main), paint: Math.round((sp.paint || 0) + (sp.prepaint || 0) + (sp.layerize || 0)), gpu: Math.round(x.cost.gpuMain), notPresented: fr.notPresentedPerSec, partial: fr.partialPerSec, unknown: fr.presentationUnknownPerSec, dropped: fr.droppedPerSec, drawn: x.drawn.perSec, scrolls: x.dispatched.scroll || 0, pointerover: x.dispatched.pointerover || 0 };
			rows.push(row); out.push(row);
			t.log(`${look} ${name}: main ${row.main} ms/s, paint ${row.paint}, GPU ${row.gpu} ms/s | never presented ${row.notPresented}/s, partial ${row.partial}/s, unknown ${row.unknown}/s (all DroppedFrame ${row.dropped}/s) | drawn ${row.drawn}/s over ${row.secs} s, ${ticks} ticks, ${row.scrolls} scroll events, ${row.pointerover} pointerover${row.dataLoss ? ' | TRACE LOST DATA' : ''}`);
			if (t.args.out) writeFileSync(String(t.args.out), JSON.stringify(out, null, 1));
		}
		await f.evaluate(() => { window.__pausePriceOn = false; });
		const mean = (n, k) => { const v = rows.filter((r) => r.name === n).map((r) => r[k] || 0); return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length * 10) / 10 : null; };
		const keys = ['main', 'paint', 'gpu', 'notPresented', 'partial', 'unknown', 'drawn'];
		t.log(`${look} SUMMARY as is -> paused (means): ` + keys.map((k) => `${k} ${mean('asis', k)} -> ${mean('paused', k)}`).join(', '));
		await t.check(`${look}: could judge: every window scrolled its ${TICKS} ticks and each trace is whole`, rows.every((r) => r.ticks === TICKS && r.scrolls > 0 && !r.dataLoss), rows.map((r) => `${r.name} ${r.ticks} ticks ${r.scrolls} scrolls${r.dataLoss ? ' lost data' : ''}`).join(', '));
	}
	await cdp.detach().catch(() => {});
}
