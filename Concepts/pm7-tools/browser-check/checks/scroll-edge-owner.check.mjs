// FO-87: a screen's scroller owns its whole visible box, and the footer under it begins at its own top edge. Native
// elementFromPoint across the scroller's width, 0.95, 0.5 and 0.05 px above the boundary (the scroller's visible
// bottom, the footer's top) must reach the scroller or something in it; 0.05 and 0.5 px below must reach the footer.
// (On 611e505ecf the positioned footer took the scroller's last visible row in every look; where a whole-pixel scroll
// left a control's last row there, Retro's Server guest checkbox, a press at its bottom row reached the footer.)
// Then the refusal reason the footer floats over the scroller (a press on a disabled Continue) is painted on top of the
// scroller's words: with the reason alone taking the pointer for the read, the top box at its centre is the reason.
// Ten looks, 1920x1080, 1390, 1024, 860x900, 740x768, 1280x500, both motion preferences, both surfaces.
//   --set size=1920x1080   --set look=retro-dark   --set motion=no-preference
import { LOOKS } from '../browser-check.config.mjs';

const SIZES = [[1920, 1080], [1390, 900], [1024, 900], [860, 900], [740, 768], [1280, 500]];
const list = (v, all) => (v ? String(v).split(',').map((s) => s.trim()).filter(Boolean) : all);

async function cell(t, surface, w, h) {
	if (!t.app.surfaces().includes(surface)) { t.log(`skipped: the sandbox switch leaves out the ${surface} surface`); return; }
	await t.viewport(w, h);
	const f = await t.app.open({ onboarding: true, query: 'o55=fresh', sandbox: surface === 'sandbox' });
	await f.waitForFunction(() => window.O55?.S?.open, null, { timeout: 30000 });
	for (const motion of list(t.args.motion, ['no-preference', 'reduce'])) {
		await t.emulate({ reducedMotion: motion === 'attribute' ? 'no-preference' : motion });
		for (const look of list(t.args.look, LOOKS)) {
			await t.page.mouse.move(2, 2);
			await f.evaluate(([fam, mode, m]) => { document.documentElement.setAttribute('data-motion', m === 'attribute' ? 'reduced' : 'full'); O55.S.lookOpen = false; O55.ui.applyLook(fam, mode); }, [...look.split('-'), motion]);
			await f.waitForTimeout(1600);
			/* NieR's reboot moment covers the window until it lifts (O55.nierLook.busy, #o55np-reboot) */
			await f.waitForFunction(() => !O55.nierLook.busy() && !document.getElementById('o55np-reboot'), null, { timeout: 15000 }).catch(() => {});
			for (const screen of ['s-ready', 'look']) {
				const tag = `${screen} ${look} ${motion} ${surface} ${w}x${h}`;
				await f.evaluate((s) => {
					if (s === 's-ready') { O55.S.draft().remote_mode = 'reverse_proxy'; O55.S.draft().proxy_hostname = 'https://pm.example.net'; O55.ui.go('s-ready', { noHistory: true }); const sv = O55.S.sess.server; sv.candidates = [{ id: 'press-guest', name: 'Press phone', gen: sv.pairGen, state: 'waiting', confirmed: false }]; sv.runOk = { 'press-guest': true }; sv.pairUntil = Date.now() + 300000; O55.ui.refresh(); }
					else O55.ui.go(s, { noHistory: true });
				}, screen);
				await f.waitForFunction(() => !document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer.o55-out') && !!document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer .o55-foot'), null, { timeout: 8000 }).catch(() => {});
				await f.waitForTimeout(400);
				/* scrolled to its end where it scrolls (the place a control's last row meets the edge), else as it is */
				const r = await f.evaluate(() => {
					const layer = document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out)'), sc = layer.querySelector(':scope > .o55-scroll'), foot = layer.querySelector(':scope > .o55-foot');
					sc.scrollTop = sc.scrollHeight;
					const sr = sc.getBoundingClientRect(), fr = foot.getBoundingClientRect(), boundary = sr.top + sc.clientTop + sc.clientHeight;
					const name = (e) => !e ? null : e.tagName.toLowerCase() + '.' + String(e.className?.baseVal ?? e.className).split(' ')[0];
					const xs = Array.from({ length: 9 }, (_, i) => sr.left + 2 + (i * (sc.clientWidth - 4)) / 8);
					const above = [], below = [];
					for (const x of xs) {
						for (const dy of [0.95, 0.5, 0.05]) { const e = document.elementFromPoint(x, boundary - dy); if (!(e && sc.contains(e))) above.push({ x: Math.round(x), dy, top: name(e) }); }
						for (const dy of [0.05, 0.5]) { const e = document.elementFromPoint(x, boundary + dy); if (!(e && foot.contains(e))) below.push({ x: Math.round(x), dy, top: name(e) }); }
					}
					return { boundary, footTop: fr.top, scrolls: sc.scrollHeight > sc.clientHeight, scrollTop: sc.scrollTop, above: above.slice(0, 6), aboveN: above.length, below: below.slice(0, 6), belowN: below.length };
				});
				await t.check(`FO-87 the scroller owns its last visible row and the footer begins at its top edge ${tag}`, Math.abs(r.footTop - r.boundary) < 0.01 && r.aboveN === 0 && r.belowN === 0, JSON.stringify(r));
			}
			/* the refusal reason over the scroller: Name with no name, a real press on the disabled Continue */
			const tagR = `reason ${look} ${motion} ${surface} ${w}x${h}`;
			await f.evaluate(() => { O55.S.draft().project_name = ''; O55.ui.go('name', { noHistory: true }); });
			await f.waitForTimeout(700);
			const pri = f.locator('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) .o55-foot .o55-primary[aria-disabled="true"]').first();
			if (await pri.count()) {
				const fe = f === t.page.mainFrame() ? null : await f.frameElement(), off = fe ? await fe.boundingBox() : { x: 0, y: 0 }, b = await pri.boundingBox();
				await t.page.mouse.click(off.x + b.x + b.width / 2, off.y + b.y + b.height / 2);
				await f.waitForTimeout(500);
				const rr = await f.evaluate(() => {
					const rs = document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) .o55-reason.o55-reason-show'); /* (the layer's own since FO87-N1, no longer the footer's) */ if (!rs) return { reason: false };
					const q = rs.getBoundingClientRect(), x = q.left + q.width / 2, y = q.top + q.height / 2, old = rs.style.pointerEvents;
					rs.style.pointerEvents = 'auto'; const e = document.elementFromPoint(x, y); rs.style.pointerEvents = old;
					const sc = rs.closest('.o55-layer').querySelector(':scope > .o55-scroll'), s = sc.getBoundingClientRect();
					return { reason: true, overScroller: y < s.bottom, onTop: !!(e && rs.contains(e)), top: e && (e.tagName + '.' + String(e.className).split(' ')[0]) };
				});
				await t.check(`FO-87 the footer's refusal reason paints over the scroller ${tagR}`, rr.reason && rr.onTop, JSON.stringify(rr));
			} else await t.check(`FO-87 Name has a disabled Continue to refuse (fixture) ${tagR}`, false);
		}
	}
	await f.evaluate(() => document.documentElement.setAttribute('data-motion', 'full'));
	await t.emulate({ reducedMotion: 'no-preference' });
}

export const tests = {};
for (const surface of ['normal', 'sandbox']) for (const [w, h] of SIZES) {
	tests[`FO-87 scroll edge owner ${surface} ${w}x${h}`] = async (t) => {
		if (t.args.size && !list(t.args.size, []).includes(`${w}x${h}`)) { t.log(`skipped: --set size leaves out ${w}x${h}`); return; }
		return cell(t, surface, w, h);
	};
}
