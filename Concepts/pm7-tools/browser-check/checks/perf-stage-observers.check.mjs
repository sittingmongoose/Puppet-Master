// Pip's stage draws itself in the onboarding window; the page's document-wide watchers must not do work for each of its
// draws (2026-11-11 performance pass).
//
// The stage writes its drawing, its bubble and its HUD (all aria-hidden decoration), and every MutationObserver on the
// document that listens for such a write hears it. The hover tags' observer (base/script/pm-hover-tags-js.js) then
// walked each record looking for something to tag: 10 to 16 ms of script a second at rest in the window, in every look
// but Retro, for records that can never change a hover tag. It now returns at once when every record of a batch comes
// from that decoration (#pm-o55-onboarding .pst [aria-hidden="true"]).
//
// With the onboarding window open on its first stage screen, the check keeps the stage drawing for the whole measured
// window whatever its loop does at rest: it keeps a swing going (the pendulum's speed topped up to .3 rad/s, the size of
// the kick Pip's idle life gives it, every 300 ms) and has Pip type a short line every 1.2 s. (Until stream F's PERF-1
// the stage redrew everything on every frame, about 240 to 350 heard batches a second; since then it draws only what
// moved a tenth of a pixel, and the hover tags hear only its new nodes and words, so a stage at rest shows nothing to
// judge.) A DevTools trace of that window gives the script time and the number of calls of every function that runs
// in script#pm-hover-tags-js (told by its lines in the built page, helpers/built-source.mjs):
//  - in all at most --set ms (default 7) ms a second (first runs, 2026-11-11, Windows, the stage redrawing every frame:
//    15.9, 14.9 and 25.1 before in Basic, Glass and NieR Dark; 2.0, 3.0 and 2.5 after);
//  - a call at most --set perCall (default 25) microseconds on average, judged when the trace holds at least --set calls
//    (default 15) calls a second, logged otherwise. Windows RTX 3090, Basic, Glass and NieR Dark (2026-11-12): main
//    77bae0c636 86, 52 and 81 a call (18, 16 and 25 ms a second); stream F's loop without the early return 56, 63 and 58
//    (6.3, 2.0 and 1.7 ms a second, so only this bound tells there); with the early return 10, 9 and 6 on the every-frame
//    loop and 13, 7 and 7 on stream F's. The bound sits midway between the dearest with (13) and the cheapest without (52).
// To know the stage really was drawing, the check counts the stage's own writes with an observer of its own on the
// stage's root (every attribute, nodes and text): at least --set draws (default 20) batches a second, or the cell fails
// as "could not judge". (It used to ask for 20 ms a second of script in js/58-rig.js, which the new loop does not
// spend.) The stage's script time, and Liquid Glass's (script#lg-js), are logged.
//
// --set looks=<a,b>  default basic-dark,glass-dark,nier-dark (Retro's stage steps 10 or 20 times a second: judged with
//                    looks=retro-dark and draws=8 if wanted)
// --set screen=<id>  default where   --set settle=<ms> (default 30000)   --set window=<ms> (default 5000)
// Both surfaces.
import { traceWindow } from '../helpers/frame-trace.mjs';
import { muteSound, parkPointer } from '../helpers/quiet-page.mjs';
import { pageSource, blocksOf, blockAt, fileRegion } from '../helpers/built-source.mjs';

export default async function (t) {
	const looks = String(t.args.looks || 'basic-dark,glass-dark,nier-dark').split(',').filter(Boolean);
	const max = Number(t.args.ms || 7), perCallMax = Number(t.args.perCall || 25), callsMin = Number(t.args.calls || 15), drawsMin = Number(t.args.draws || 20), screen = String(t.args.screen || 'where');
	const windowMs = Number(t.args.window || 5000);
	const W = 1920, H = 1080;
	await t.viewport(W, H);
	await muteSound(t.page);
	const src = await pageSource(t), blocks = blocksOf(src), rig = fileRegion(src, 'js/58-rig.js');
	const tags = blocks.filter((b) => b.kind === 'script' && b.id === 'pm-hover-tags-js');
	await t.check('the built page has script#pm-hover-tags-js and marks js/58-rig.js', tags.length === 1 && !!rig, `hover tags blocks ${tags.length}, rig ${rig ? rig.from + '-' + rig.to : 'not marked'}`);
	if (tags.length !== 1 || !rig) return;
	const lineOf = (key) => Number((/@(\d+):/.exec(key) || [])[1] || -1);

	const cdp = await t.page.context().newCDPSession(t.page);
	const f = await t.app.open({ onboarding: true, query: 'o55=screen=' + screen + '&pm-warm=0' });
	const open = await f.waitForFunction(() => !!document.querySelector('#pm-o55-onboarding .o55-win') && window.O55 && O55.ui && typeof O55.ui.applyLook === 'function', null, { timeout: 60000 }).then(() => true, () => false);
	await t.check('the onboarding window is open', open, open ? screen : 'no #pm-o55-onboarding .o55-win after 60 s: could not judge');
	if (!open) return;
	await f.evaluate(() => document.fonts.ready.then(() => true));
	await t.page.waitForTimeout(Number(t.args.settle ?? 30000));

	for (const look of looks) {
		const [fam, mode] = look.split('-');
		await f.evaluate(([fm, m]) => window.O55.ui.applyLook(fm, m), [fam, mode]);
		const ok = await f.waitForFunction(([fm, m]) => { const th = document.documentElement.getAttribute('data-theme') || '', nier = document.documentElement.getAttribute('data-o55-nier') === 'on'; return (fm === 'nier' ? nier : !nier && th.startsWith(fm + '-')) && th.endsWith('-' + m); }, [fam, mode], { timeout: 15000 }).then(() => true, () => false);
		await t.check(`${look}: the look is applied in the window`, ok, await f.evaluate(() => document.documentElement.getAttribute('data-theme') + ', NieR ' + document.documentElement.getAttribute('data-o55-nier')));
		if (!ok) continue;
		await parkPointer(t.page, W, H);
		await t.page.waitForTimeout(Number(t.args.lookSettle ?? 6000));
		// the stage's own writes, counted on its root; the swing and the typing that keep it drawing
		const armed = await f.evaluate(() => {
			const host = document.querySelector('#pm-o55-onboarding .o55-stage'), st = host && host.__pipStage;
			if (!st || !st.ps || !st.root || typeof st.say !== 'function') return 'no stage (#pm-o55-onboarding .o55-stage with its __pipStage, ps, root and say)';
			if (window.__pso) window.__pso.mo.disconnect();
			const W = window.__pso = { st, on: false, batches: 0, records: 0, t0: 0, said: 0 };
			W.mo = new MutationObserver((recs) => { if (W.on) { W.batches++; W.records += recs.length; } });
			W.mo.observe(st.root, { attributes: true, childList: true, characterData: true, subtree: true });
			W.drive = (n) => {
				const ps = st.ps;
				if (Math.abs(ps.thv) < .3) ps.thv = (ps.thv < 0 ? -1 : 1) * .3;
				if (typeof st.kick === 'function') st.kick();
				if (n % 4 === 0) st.say(W.said++ % 2 ? 'Counting what the page hears of this.' : 'Measuring the stage, one moment.', null, true);
			};
			return '';
		});
		if (armed) { await t.check(`${look}: the stage could be driven`, false, armed + ': could not judge'); continue; }
		let x = null, err = '', drawn = null;
		try {
			x = await traceWindow(cdp, { ms: windowMs, url: f.url(), allScripts: true, during: async (until) => {
				await f.evaluate(() => { const W = window.__pso; W.batches = 0; W.records = 0; W.t0 = performance.now(); W.on = true; });
				for (let n = 0; Date.now() < until - 300; n++) { await f.evaluate((k) => window.__pso.drive(k), n); await t.page.waitForTimeout(300); }
				drawn = await f.evaluate(() => { const W = window.__pso; W.on = false; W.mo.disconnect(); return { batches: W.batches, records: W.records, secs: (performance.now() - W.t0) / 1000 }; });
			} });
		} catch (e) { err = String(e && e.message || e); }
		if (!x || !(x.secs > 3) || !drawn) { await t.check(`${look}: the trace could be judged`, false, err || `trace ${x ? x.secs + ' s' : 'missing'}`); continue; }
		let tagMs = 0, tagCalls = 0, rigMs = 0, glassMs = 0; const tagRows = [], glassRows = [];
		for (const [key, ms, n] of x.scripts) {
			const line = lineOf(key); if (line < 0) continue;
			if (line >= rig.from && line <= rig.to) rigMs += ms;
			const b = blockAt(blocks, line);
			if (b && b.id === 'pm-hover-tags-js') { tagMs += ms; tagCalls += n; tagRows.push(`${key} ${ms} ms/s x${n}/s`); }
			if (b && b.id === 'lg-js') { glassMs += ms; glassRows.push(`${key} ${ms} ms/s x${n}/s`); }
		}
		const draws = drawn.batches / drawn.secs, perCall = tagCalls > 0 ? tagMs / tagCalls * 1000 : 0;
		t.log(`${look}: main thread ${Math.round(x.cost.main)} ms/s, ${x.mainFrames.perSec} main frames/s; the stage wrote ${draws.toFixed(1)} batches/s (${(drawn.records / drawn.secs).toFixed(0)} records/s), its own script ${rigMs.toFixed(1)} ms/s; hover tags ${tagMs.toFixed(2)} ms/s in ${tagCalls.toFixed(1)} calls/s, ${perCall.toFixed(1)} us a call (${tagRows.slice(0, 4).join(' | ') || 'no call'})`);
		t.log(`${look}: Liquid Glass's script (script#lg-js) ${glassMs.toFixed(2)} ms/s (${glassRows.slice(0, 5).join(' | ') || 'no call'})`);
		const moving = draws >= drawsMin;
		await t.check(`${look}: Pip's stage is drawing while measured`, moving, `${draws.toFixed(1)} batches of its own writes a second (at least ${drawsMin})${moving ? '' : ': could not judge'}`);
		if (!moving) continue;
		await t.check(`${look}: the hover tags do at most ${max} ms of script a second while the stage draws`, tagMs <= max, `${tagMs.toFixed(2)} ms/s: ${tagRows.slice(0, 4).join(' | ') || 'no call'}`);
		if (tagCalls >= callsMin) await t.check(`${look}: a call into the hover tags' script takes at most ${perCallMax} microseconds on average while the stage draws`, perCall <= perCallMax, `${perCall.toFixed(1)} us a call over ${tagCalls.toFixed(1)} calls/s (${tagMs.toFixed(2)} ms/s)`);
		else t.log(`${look}: NOTE the hover tags' script was called ${tagCalls.toFixed(1)} times a second (under ${callsMin}): the cost of a call is not judged here`);
	}
}
