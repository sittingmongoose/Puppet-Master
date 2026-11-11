// Pip's stage redraws itself every frame in the onboarding window; the page's document-wide watchers must not do work
// for each of those redraws (2026-11-11 performance pass).
//
// The stage rewrites its drawing, its bubble and its HUD (all aria-hidden decoration) on every frame it draws, and every
// MutationObserver on the document hears each write. The hover tags' observer (base/script/pm-hover-tags-js.js) then
// walked each record looking for something to tag: 10 to 16 ms of script a second at rest in the window, in every look
// but Retro, for records that can never change a hover tag. It now returns at once when every record of a batch comes
// from that decoration (#pm-o55-onboarding .pst [aria-hidden="true"]).
//
// With the onboarding window open on its first stage screen and nobody touching it, a DevTools trace is taken and the
// script time of every function that runs in script#pm-hover-tags-js (told by its lines in the built page,
// helpers/built-source.mjs) is added up: at most --set ms (default 3) ms a second. To know the stage really was
// redrawing, the same trace must show the stage's own loop at work (script time in js/58-rig.js of 20 ms a second or
// more); a stage that stood still fails as "could not judge".
//
// --set looks=<a,b>  default basic-dark,glass-dark,nier-dark (Retro's stage steps 10 or 20 times a second and costs a
//                    fifth: judged with looks=retro-dark if wanted)
// --set screen=<id>  default where   --set settle=<ms> (default 30000)
// Both surfaces.
import { traceWindow } from '../helpers/frame-trace.mjs';
import { muteSound, parkPointer } from '../helpers/quiet-page.mjs';
import { pageSource, blocksOf, blockAt, fileRegion } from '../helpers/built-source.mjs';

export default async function (t) {
	const looks = String(t.args.looks || 'basic-dark,glass-dark,nier-dark').split(',').filter(Boolean);
	const max = Number(t.args.ms || 3), screen = String(t.args.screen || 'where');
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
		let x = null, err = '';
		try { x = await traceWindow(cdp, { ms: 4000, url: f.url(), allScripts: true }); } catch (e) { err = String(e && e.message || e); }
		if (!x || !(x.secs > 3)) { await t.check(`${look}: the trace could be judged`, false, err || `trace ${x ? x.secs + ' s' : 'missing'}`); continue; }
		let tagMs = 0, rigMs = 0; const tagRows = [];
		for (const [key, ms, n] of x.scripts) {
			const line = lineOf(key); if (line < 0) continue;
			if (line >= rig.from && line <= rig.to) rigMs += ms;
			const b = blockAt(blocks, line);
			if (b && b.id === 'pm-hover-tags-js') { tagMs += ms; tagRows.push(`${key} ${ms} ms/s x${n}/s`); }
		}
		t.log(`${look}: main thread ${Math.round(x.cost.main)} ms/s, ${x.mainFrames.perSec} main frames/s; the stage's own script ${rigMs.toFixed(1)} ms/s; hover tags ${tagMs.toFixed(2)} ms/s (${tagRows.slice(0, 4).join(' | ') || 'no call'})`);
		const moving = rigMs >= 20;
		await t.check(`${look}: Pip's stage is redrawing while measured`, moving, `${rigMs.toFixed(1)} ms/s of script in js/58-rig.js${moving ? '' : ': could not judge'}`);
		if (moving) await t.check(`${look}: the hover tags do at most ${max} ms of script a second for the stage's redraws`, tagMs <= max, `${tagMs.toFixed(2)} ms/s: ${tagRows.slice(0, 4).join(' | ') || 'no call'}`);
	}
}
