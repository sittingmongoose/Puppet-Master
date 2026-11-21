// What does PERF-USAGE-HOVER (card A: pause hover highlights on Usage while the mouse wheel turns) buy on this machine?
// A diagnostic, asserts nothing about speed. Two pages in one browser session, loaded in --set order (default main,
// pause, pause, main): origin/main's page (--set main=<url>, Usage's board already on its own scrolling layer) and the
// pause's page (--set page=<url>). Each load runs every look's window: the kit check's equal work (perf-usage-scroll),
// 48 wheel ticks of 40 px (--set ticks=) from the board's top, turning every 12, the pointer resting at the page's centre
// (55 % down), traced from the first tick to 400 ms after the last. Logged per window and as means per look: frames never
// presented, presented with a partial update and of unknown presentation a second (helpers/frame-trace.mjs, each
// DroppedFrame classified by its frame reporter's final state), main-thread, paint (+ pre-paint + layerize) and
// GPU-thread ms a second, frames drawn, scroll and pointerover events.
// (Until 2026-11-17 this tool switched a prototype inside one page, a transparent layer over the board; the shipped
// pause gates the hover effects instead, which cannot be switched off in a page, so the comparison is now page against
// page in the same session.)
//   NODE_OPTIONS=--max-old-space-size=8192 browser-check run diagnostics/usage-hover-pause-price.check.mjs \
//     --host windows --set page=http://192.168.50.179:18644/vh-<n>.html --set main=http://192.168.50.179:18644/vh-main.html \
//     --set looks=basic-dark,glass-dark,retro-dark --set out=<file.json> --out <run folder>
//   --set order=main,pause,pause,main   --set ticks=48   --set settle=25000   --set sandbox=0|1 (the kit's switch)
import { writeFileSync } from 'node:fs';
import { traceWindow } from '../helpers/frame-trace.mjs';
import { muteSound } from '../helpers/quiet-page.mjs';

export default async function (t) {
	const looks = String(t.args.looks || 'basic-dark,glass-dark,retro-dark').split(',').filter(Boolean);
	const order = String(t.args.order || 'main,pause,pause,main').split(',').filter(Boolean);
	const url = { main: String(t.args.main || ''), pause: String(t.args.page || '') };
	const TICKS = Number(t.args.ticks || 48), MS = 8000, TAIL = 400, W = 1920, H = 1080;
	const sandbox = t.app.surfaces()[0] === 'sandbox';
	if (!url.main || !url.pause) { await t.check('could judge: --set main and --set page are given', false); return; }
	await t.viewport(W, H);
	await muteSound(t.page);
	const out = [];
	let n = 0;
	for (const name of order) {
		const base = url[name];
		const u = `${base}${base.includes('?') ? '&' : '?'}cb=${Date.now()}-${++n}&o55=off&pm-warm=0`;
		if (sandbox) await t.openInSandbox(u, { settleMs: 300 }); else await t.goto(u, { settleMs: 300 });
		await t.until('page ready', () => document.documentElement.getAttribute('data-pmr-ready') === '1' && !!window.PM_THEME, null, { timeout: 60000, hard: true });
		const f = t.root === t.page ? t.page.mainFrame() : t.root;
		await f.evaluate(() => document.fonts.ready.then(() => true));
		await t.page.waitForTimeout(Number(t.args.settle ?? 25000));
		const cdp = await t.page.context().newCDPSession(t.page);
		for (const look of looks) {
			await t.app.look(look);
			await f.waitForFunction(() => !(window.PM_THEME_TRANSITION?.busy?.() || window.PM_LOOK_COVERED?.()), null, { timeout: 20000 }).catch(() => {});
			await f.evaluate(() => PM_PAGES.go('usage'));
			await t.page.waitForTimeout(Number(t.args.viewSettle ?? 10000));
			const range = await f.evaluate(() => { const s = document.getElementById('pmuScroll'); return s ? s.scrollHeight - s.clientHeight : 0; });
			if (range < 200) { await t.check(`${name} ${look}: could judge: Usage's board is there and can scroll`, false, `range ${range}`); continue; }
			const turn = Math.max(3, Math.min(12, Math.floor(range / 40) - 2));
			await t.page.mouse.move(W - 6, Math.round(H / 2));
			await t.page.waitForTimeout(2000);
			const at = await f.evaluate(() => {
				const pane = document.getElementById('pmuScroll');
				pane.scrollTop = 0;
				const page = (document.querySelector('.page.active') || document.body).getBoundingClientRect();
				const bounds = pane.getBoundingClientRect();
				return { x: Math.round(page.left + page.width / 2), y: Math.round(page.top + page.height * 0.55),
					left: bounds.left, top: bounds.top };
			});
			await t.page.waitForTimeout(400);
			const pane = await f.locator('#pmuScroll').boundingBox();
			if (!pane || !await f.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.closest('#pmuScroll')?.id === 'pmuScroll', at)) {
				await t.check(name + ' ' + look + ': could judge: the centre pointer hits the Usage pane', false);
				continue;
			}
			await t.page.mouse.move(at.x + pane.x - at.left, at.y + pane.y - at.top);
			await t.page.waitForTimeout(600);
			await f.evaluate(() => {
				const pane = document.getElementById('pmuScroll'), legs = [];
				const wheel = (event) => {
					if (!event.isTrusted || !event.deltaY) return;
					const direction = Math.sign(event.deltaY);
					let leg = legs.at(-1);
					if (leg?.direction !== direction) {
						if (leg) leg.end = pane.scrollTop;
						leg = { direction, start: pane.scrollTop, wheels: 0 };
						legs.push(leg);
					}
					leg.wheels++;
				};
				pane.addEventListener('wheel', wheel, { capture: true, passive: true });
				window.__uhpPriceTravel = () => {
					pane.removeEventListener('wheel', wheel, true);
					if (legs.length) legs.at(-1).end = pane.scrollTop;
					return legs;
				};
			});
			let ticks = 0, inputStart, lastWheelAck, inputEnd, tailEnd, x, legs;
			try {
				x = await traceWindow(cdp, { ms: 1, url: f.url(), during: async () => {
					inputStart = Date.now(); const until = inputStart + MS; let i = 0;
					while (i < TICKS && Date.now() < until) {
						await t.page.mouse.wheel(0, (Math.floor(i++ / turn) % 2 ? -1 : 1) * 40);
						lastWheelAck = Date.now(); await new Promise((r) => setTimeout(r, 14));
					}
					ticks = i; inputEnd = Date.now(); await new Promise((r) => setTimeout(r, TAIL)); tailEnd = Date.now();
				} });
			} finally {
				legs = await f.evaluate(() => window.__uhpPriceTravel());
			}
			const travelled = legs.length === Math.ceil(TICKS / turn) && legs.every((leg, i) => {
				const requested = Math.min(turn, TICKS - i * turn);
				return leg.direction === (i % 2 ? -1 : 1) && leg.wheels === requested &&
					leg.direction * (leg.end - leg.start) >= requested * 40 * 0.6;
			});
			const sp = x.split, fr = x.frames;
			const row = { look, name, load: n, ticks, legs, travelled, secs: x.secs, dataLoss: x.dataLoss, main: Math.round(x.cost.main), paint: Math.round((sp.paint || 0) + (sp.prepaint || 0) + (sp.layerize || 0)), gpu: Math.round(x.cost.gpuMain), notPresented: fr.notPresentedPerSec, partial: fr.partialPerSec, unknown: fr.presentationUnknownPerSec, dropped: fr.droppedPerSec, drawn: x.drawn.perSec, scrolls: x.dispatched.scroll || 0, pointerover: x.dispatched.pointerover || 0 };
			// Observation only: serial wheel acknowledgments, requested sleeps and trace event span have different clocks.
			// Do not infer wheel duration from x.secs (the trace-wide event span).
			row.timing = { wheelAckMs: lastWheelAck - inputStart, inputLoopMs: inputEnd - inputStart,
				tailMs: tailEnd - inputEnd, traceDuringMs: tailEnd - x.at };
			out.push(row);
			t.log(`${look} ${name} (load ${n}): main ${row.main} ms/s, paint ${row.paint}, GPU ${row.gpu} ms/s | never presented ${row.notPresented}/s, partial ${row.partial}/s, unknown ${row.unknown}/s (all DroppedFrame ${row.dropped}/s) | drawn ${row.drawn}/s over ${row.secs} s, ${ticks} ticks, ${row.scrolls} scroll events, ${row.pointerover} pointerover${row.dataLoss ? ' | TRACE LOST DATA' : ''}`);
			t.log(`${look} ${name} timing: wheel acknowledgments ${row.timing.wheelAckMs} ms, input loop ${row.timing.inputLoopMs} ms, tail ${row.timing.tailMs} ms, trace callback ${row.timing.traceDuringMs} ms, trace events ${row.secs * 1000} ms`);
			if (t.args.out) writeFileSync(String(t.args.out), JSON.stringify(out, null, 1));
		}
		await cdp.detach().catch(() => {});
	}
	const keys = ['main', 'paint', 'gpu', 'notPresented', 'partial', 'unknown', 'drawn'];
	for (const look of looks) {
		const rows = out.filter((r) => r.look === look);
		const mean = (nm, k) => { const v = rows.filter((r) => r.name === nm && r.travelled && !r.dataLoss).map((r) => r[k] || 0); return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length * 10) / 10 : null; };
		t.log(`${look} SUMMARY main -> pause (means): ` + keys.map((k) => `${k} ${mean('main', k)} -> ${mean('pause', k)}`).join(', '));
		await t.check(`${look}: could judge: every window scrolled its ${TICKS} ticks and each trace is whole`, rows.length === order.length && rows.every((r) => r.ticks === TICKS && r.travelled && r.scrolls > 0 && !r.dataLoss), rows.map((r) => `${r.name} ${r.ticks} ticks ${r.scrolls} scrolls${r.dataLoss ? ' lost data' : ''}`).join(', '));
	}
}
