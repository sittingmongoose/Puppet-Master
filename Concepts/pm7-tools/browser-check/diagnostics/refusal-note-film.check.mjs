// FO87-N1 film: the refusal note during a screen's entry, for a 60 fps GPU recording read frame by frame
// (tools/refusal-note-film-reader.py). At 1280x500 (the page held at the window's top left, so film = page
// coordinates), for each look and cycle: AI and Name, a real press on the disabled Continue as soon as it can be hit
// during the entry, and a real double-click on the screen before (Begin with New, Creating once done). Mark "press <tag>"
// at the click; the log line FO87N1-FILM gives, per case, the note's rect and colours and the wall-clock times the note
// was shown and the entry ended (.o55-entering gone), which the reader maps onto the film through the press mark, so it
// can say, frame by frame, whether the note's box shows its own paint.
//   browser-check run diagnostics/refusal-note-film.check.mjs --record /abs/film.mp4 --set page=<build> [--set cycles=2]
const LAYER = '#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out)';
export default async function (t) {
	await t.viewport(1280, 500);
	const f = await t.app.open({ onboarding: true, query: 'o55=fresh' });
	await f.waitForFunction(() => window.O55?.S?.open, null, { timeout: 30000 });
	await t.emulate({ reducedMotion: 'no-preference' });
	const fe = f === t.page.mainFrame() ? null : await f.frameElement(), off = fe ? await fe.boundingBox() : { x: 0, y: 0 };
	const settle = () => f.waitForFunction(() => !document.querySelector('#pm-o55-onboarding .o55-layer.o55-entering, #pm-o55-onboarding .o55-layer.o55-out') && !O55.nierLook.busy() && !document.getElementById('o55np-reboot'), null, { timeout: 15000 }).catch(() => {});
	const rows = [];
	for (const look of (t.args.look ? String(t.args.look).split(',') : ['basic-light', 'glass-dark', 'friendly-light'])) {
		await t.page.mouse.move(2, 2);
		await f.evaluate(([fam, mode]) => { document.documentElement.setAttribute('data-motion', 'full'); O55.ui.applyLook(fam, mode); }, look.split('-'));
		await f.waitForTimeout(1600); await settle();
		for (let i = 0; i < (Number(t.args.cycles) || 2); i++) {
			for (const screen of ['ai', 'name']) for (const route of ['press', 'double']) {
				const tag = `${screen} ${route} ${look} ${i}`;
				let at = null;
				if (route === 'press') {
					await f.evaluate((s) => { if (s === 'name') O55.S.draft().project_name = ''; O55.ui.go(s, { noHistory: true }); }, screen);
					at = await f.waitForFunction(() => { const l = document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer.o55-entering:not(.o55-out)'), b = l && l.querySelector('.o55-foot .o55-primary'); if (!b) return null; const r = b.getBoundingClientRect(), e = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return e && b.contains(e) ? { x: r.x + r.width / 2, y: r.y + r.height / 2 } : null; }, null, { timeout: 4000, polling: 'raf' }).then((h) => h.jsonValue(), () => null);
				} else {
					if (screen === 'name') { await f.evaluate(() => { O55.S.draft().project_name = ''; O55.ui.go('begin', { noHistory: true }); }); await settle(); await f.waitForTimeout(300); await f.locator(LAYER + ' .o55-card[data-arg="new"]').first().click(); await f.waitForTimeout(400); }
					else { await f.evaluate(() => { O55.S.sess.commit = Object.assign(O55.S.sess.commit || {}, { state: 'done' }); O55.S.sess.backup = Object.assign(O55.S.sess.backup || {}, { dest: null }); O55.ui.go('creating', { noHistory: true }); }); await f.waitForFunction((L) => { const b = document.querySelector(L + ' .o55-foot .o55-primary'); return O55.S.sess.screen === 'creating' && b && b.getAttribute('aria-disabled') !== 'true'; }, LAYER, { timeout: 15000 }).catch(() => {}); await settle(); }
					at = await f.evaluate((L) => { const b = document.querySelector(L + ' .o55-foot .o55-primary'); if (!b || b.getAttribute('aria-disabled') === 'true') return null; const r = b.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, LAYER);
				}
				await t.check(`film fixture reaches the disabled Continue ${tag}`, !!at);
				if (!at) { await settle(); continue; }
				/* the entry's end, timed in the page from the press */
				/* wall-clock times, mapped onto the film through the press mark: when the note is shown (it gets o55-reason-show)
				   and when the entry ends (.o55-entering gone) */
				await f.evaluate(() => { window.__n1 = { noteWall: null, endWall: null }; const pane = document.querySelector('#pm-o55-onboarding .o55-pane'); const mo = new MutationObserver(() => { const l = document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out)'); if (window.__n1.noteWall == null && l && l.querySelector('.o55-reason.o55-reason-show')) { window.__n1.noteWall = Date.now(); if (!l.classList.contains('o55-entering') && !document.querySelector('#pm-o55-onboarding .o55-layer.o55-out')) window.__n1.endWall = window.__n1.noteWall; } if (window.__n1.noteWall != null && window.__n1.endWall == null && l && !l.classList.contains('o55-entering') && !document.querySelector('#pm-o55-onboarding .o55-layer.o55-out')) window.__n1.endWall = Date.now(); }); mo.observe(pane, { subtree: true, attributes: true, attributeFilter: ['class'], childList: true }); window.__n1.mo = mo; });
				await t.mark(`press ${tag}`);
				if (route === 'press') await t.page.mouse.click(off.x + at.x, off.y + at.y);
				else { await t.page.mouse.click(off.x + at.x, off.y + at.y); await t.page.waitForTimeout(150); await t.page.mouse.click(off.x + at.x, off.y + at.y, { clickCount: 2 }); }
				await f.waitForTimeout(2200);
				const info = await f.evaluate(() => { const rs = document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) .o55-reason'); window.__n1.mo && window.__n1.mo.disconnect(); if (!rs) return null; const s = getComputedStyle(rs), m = new DOMMatrix(s.transform === 'none' ? undefined : s.transform), q = rs.getBoundingClientRect(), rgb = (c) => (c.match(/[\d.]+/g) || []).slice(0, 3).map(Number); return { rect: [q.x - m.m41, q.y - m.m42, q.width, q.height].map((v) => Math.round(v * 100) / 100), ground: rgb(s.backgroundColor), ink: rgb(s.color), noteWall: window.__n1.noteWall, endWall: window.__n1.endWall, screen: O55.S.sess.screen }; });
				rows.push({ tag, ...info });
				await settle(); await f.waitForTimeout(600);
			}
		}
	}
	t.log('FO87N1-FILM ' + JSON.stringify({ off, rows }));
}
