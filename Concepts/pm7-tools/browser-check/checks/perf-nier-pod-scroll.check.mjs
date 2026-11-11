// NieR's Pod looks for the chat's controls under it only when a scroll can have moved them there (2026-11-11, lane D,
// cd298af186).
//
// PMConcept7's Pod fades back while a button of the hosted chat lies under it (pm7-port/js/70-nier-pod-shy.js). It
// finds out with a 5 x 5 grid of hit tests, 25 calls to document.elementsFromPoint, and it used to run them after every
// scroll event anywhere in the page: several runs a second while Usage's board or Settings scrolled, 4.8 ms a run on an
// M3, for a scroll that cannot move the chat. Now only a scroll inside the chat, or of a box that holds the chat,
// starts a run.
//
// In each NieR look, with real wheel input:
//   - scrolling Usage's board and scrolling Settings for 2 s: the page really scrolled (scroll events were seen, none of
//     them inside the chat or on a box holding it) and that file made at most --set runs (default 3) runs of 25
//     elementsFromPoint calls. Not zero: the Pod also looks after each render of the chat (its afterRender slot), and
//     the chat may render once while the other page scrolls. First runs, 2026-11-11, Windows: 8 to 14 runs (200 to 350
//     calls) before the fix, 0 or 1 after;
//   - scrolling the chat's own transcript on Home: that file did call it (the Pod still looks, so it still steps back).
// Calls are attributed by the asking stack: its innermost page frame must lie inside the file's lines in the built page
// (the build's own marker `/* ---- pm7-port/js/70-nier-pod-shy.js ---- */`, helpers/built-source.mjs).
//
// --set looks=nier-dark,nier-light (default both)   --set settle=<ms> (default 25000)
// Both surfaces. No Pod in the page, a view that did not scroll, or a transcript too short to scroll fails as
// "could not judge".
import { muteSound, parkPointer } from '../helpers/quiet-page.mjs';
import { pageSource, fileRegion, linesOfSite } from '../helpers/built-source.mjs';

const FILE = 'pm7-port/js/70-nier-pod-shy.js';

// Counts document.elementsFromPoint by asking site, and scroll events by where they happened, while armed.
const PROBE = () => {
	const P = window.__pod = { armed: false, calls: new Map(), scrolls: { n: 0, chat: 0 } };
	const real = Document.prototype.elementsFromPoint;
	Document.prototype.elementsFromPoint = function (...a) {
		if (P.armed) {
			const lines = String(new Error().stack || '').split('\n').slice(2, 6).map((l) => l.trim().replace(/^at /, '').replace(/\(?(file|https?|about):[^:)]*(?=:\d+:\d+)/, '').replace(/[()]/g, ''));
			const k = lines.filter(Boolean).slice(0, 2).join(' < ') || '?';
			P.calls.set(k, (P.calls.get(k) || 0) + 1);
		}
		return real.apply(this, a);
	};
	window.addEventListener('scroll', (e) => {
		if (!P.armed) return;
		P.scrolls.n++;
		const t = e.target, host = document.querySelector('.pm56-host');
		if (!host || !t || t.nodeType !== 1 || t.closest('.pm56-host') || t.contains(host)) P.scrolls.chat++;
	}, { capture: true, passive: true });
	P.arm = () => { P.calls.clear(); P.scrolls = { n: 0, chat: 0 }; P.armed = true; };
	P.read = () => { P.armed = false; return { calls: [...P.calls], scrolls: P.scrolls }; };
};

export default async function (t) {
	const looks = String(t.args.looks || 'nier-dark,nier-light').split(',').filter(Boolean);
	const W = 1920, H = 1080, runs = Number(t.args.runs || 3);
	await t.viewport(W, H);
	await muteSound(t.page);
	await t.page.addInitScript(PROBE);
	const region = fileRegion(await pageSource(t), FILE);
	await t.check(`the built page marks ${FILE}`, !!region, region ? `lines ${region.from}-${region.to}` : 'marker missing or not unique: the file\'s calls cannot be told apart');
	if (!region) return;
	const fromFile = (calls) => calls.filter(([site]) => { const l = linesOfSite(site)[0]; return l >= region.from && l <= region.to; }).reduce((a, [, n]) => a + n, 0);

	const f = await t.app.open({ query: 'pm-warm=0' });
	await f.evaluate(() => document.fonts.ready.then(() => true));
	await t.page.waitForTimeout(Number(t.args.settle ?? 25000));

	// wheel over a point for `ms`, down then up in turns, as a hand does; then let the Pod's 90 ms timer run
	const wheel = async (x, y, ms) => {
		await t.page.mouse.move(Math.round(x), Math.round(y));
		await t.page.waitForTimeout(300);
		await f.evaluate(() => window.__pod.arm());
		const until = Date.now() + ms; let i = 0;
		while (Date.now() < until) { await t.page.mouse.wheel(0, (Math.floor(i++ / 30) % 2 ? -1 : 1) * 40); await new Promise((r) => setTimeout(r, 14)); }
		await t.page.waitForTimeout(450);
		return f.evaluate(() => window.__pod.read());
	};
	const centre = (sel) => f.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return r.width > 40 && r.height > 40 ? { x: r.left + r.width / 2, y: r.top + r.height * 0.55, scrollable: e.scrollHeight - e.clientHeight } : null; }, sel);

	for (const look of looks) {
		await t.app.look(look);
		await f.waitForFunction(() => !(window.PM_THEME_TRANSITION?.busy?.() || window.PM_LOOK_COVERED?.()), null, { timeout: 20000 }).catch(() => {});
		await t.page.waitForTimeout(Number(t.args.lookSettle ?? 5000));
		const pod = await f.evaluate(() => {
			const html = document.documentElement, p = document.getElementById('o55np-pod'), r = p && p.getBoundingClientRect();
			return { nier: html.getAttribute('data-o55-nier'), parts: html.getAttribute('data-o55-nier-parts') || '', box: r ? [Math.round(r.width), Math.round(r.height)] : null };
		});
		const podOn = pod.nier === 'on' && (' ' + pod.parts + ' ').includes(' pod ') && !!pod.box && pod.box[0] > 0 && pod.box[1] > 0;
		await t.check(`${look}: NieR's Pod is on and has a box`, podOn, JSON.stringify(pod) + (podOn ? '' : ': could not judge'));
		if (!podOn) continue;

		for (const [view, pageId] of [['usage', 'usage'], ['settings', 'settings']]) {
			await f.evaluate((id) => PM_PAGES.go(id), pageId);
			await t.page.waitForTimeout(Number(t.args.viewSettle ?? 4000));
			const at = await f.evaluate(() => { const p = document.querySelector('.page.active') || document.body, r = p.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height * 0.55 }; });
			const r = await wheel(at.x, at.y, 2000), n = fromFile(r.calls);
			t.log(`${look} ${view}: ${r.scrolls.n} scroll events (${r.scrolls.chat} inside the chat or on a box holding it), elementsFromPoint from the Pod's file ${n}, from elsewhere ${r.calls.reduce((a, [, k]) => a + k, 0) - n}`);
			const judged = r.scrolls.n > 0 && r.scrolls.chat === 0;
			await t.check(`${look} ${view}: the wheel scrolled this page and not the chat`, judged, `${r.scrolls.n} scroll events, ${r.scrolls.chat} of them the chat's${judged ? '' : ': could not judge'}`);
			if (judged) await t.check(`${look} ${view}: scrolling it for 2 s starts at most ${runs} runs of the Pod's hit test`, n <= runs * 25, `${n} elementsFromPoint calls from ${FILE} = ${Math.ceil(n / 25)} runs of up to 25`);
			await parkPointer(t.page, W, H);
		}

		// the chat's own transcript still wakes the Pod
		await f.evaluate(() => PM_PAGES.go('dashboard'));
		await t.page.waitForTimeout(Number(t.args.viewSettle ?? 4000));
		const tr = await centre('.pm56-host .chat-stage .transcript');
		if (!tr || !(tr.scrollable > 40)) { await t.check(`${look} chat: the chat's transcript can be scrolled`, false, tr ? `only ${tr.scrollable} px to scroll: could not judge` : 'no .pm56-host .chat-stage .transcript with a box: could not judge'); continue; }
		const r = await wheel(tr.x, tr.y, 1500), n = fromFile(r.calls);
		t.log(`${look} chat: ${r.scrolls.n} scroll events (${r.scrolls.chat} the chat's), elementsFromPoint from the Pod's file ${n}`);
		await t.check(`${look} chat: the wheel scrolled the chat's transcript`, r.scrolls.chat > 0, `${r.scrolls.chat} of ${r.scrolls.n} scroll events${r.scrolls.chat ? '' : ': could not judge'}`);
		if (r.scrolls.chat > 0) await t.check(`${look} chat: scrolling the transcript still makes the Pod look under itself`, n > 0, `${n} elementsFromPoint calls from ${FILE}`);
		await parkPointer(t.page, W, H);
	}
}
