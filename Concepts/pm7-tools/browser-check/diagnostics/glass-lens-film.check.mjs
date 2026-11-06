// FO-83 film: Adjust NieR's editor opening over, and closing off, the Look screen in Glass Light and Dark, for a 60 fps
// GPU recording stepped frame by frame. Each cycle: the Look screen with its Light / Dark lens settled (mark "pre"),
// the editor opened (mark "open", its 260 ms rise unless motion is reduced), settled (mark "settled"), then a real press
// on the editor's Done (mark "close") and the screen again (mark "after"). The lens rect and the window rect are logged
// per cycle (film coordinates: the page is the 1920x1080 window at DPR 1), so a frame reader can judge, in each frame,
// whether the lens is drawn on top of the editor (the lens area keeps the "pre" pixels while the area round it turns
// into the editor) or under it (it changes with its surroundings). Record on the VM or Windows:
//   browser-check run diagnostics/glass-lens-film.check.mjs --record /abs/film.mp4 --set page=<build> [--set cycles=4] [--set marker=1]
// then: python3 tools/glass-lens-film-reader.py /abs/film.mp4 <run folder> <out.json> --marker   (wrong frames per cycle)
export default async function (t) {
	const f = await t.app.open({ onboarding: true, query: 'o55=fresh' });
	await f.waitForFunction(() => window.O55?.S?.open && !!document.querySelector('#pm-o55-onboarding .o55-lookbtn'), null, { timeout: 30000 });
	await t.emulate({ reducedMotion: 'no-preference' });
	/* --set marker=1: every Glass lens paints solid magenta (its glint, label copy and shadow hidden), a test-only paint
	   marker that leaves the stacking alone, so a frame reader can tell a lens on top (pure magenta) from one under a
	   rising panel (magenta mixed with the panel) */
	if (t.args.marker) await f.evaluate(() => { const s = document.createElement('style'); s.id = 'fo83-marker'; s.textContent = '.lg-lens { background: #f0f !important; box-shadow: none !important; } .lg-lens::after { display: none !important; } .lg-lens > * { visibility: hidden !important; }'; document.head.appendChild(s); });
	const cycles = Number(t.args.cycles) || 4, rows = [];
	for (const look of (t.args.look ? String(t.args.look).split(',') : ['glass-light', 'glass-dark'])) {
		await t.page.mouse.move(2, 2);
		await f.evaluate(([fam, mode]) => { O55.nierLook.closePanel({ silent: true }); O55.S.lookOpen = false; document.documentElement.setAttribute('data-motion', 'full'); O55.ui.applyLook(fam, mode); }, look.split('-'));
		await f.waitForTimeout(1800);
		for (let i = 0; i < cycles; i++) {
			const tag = `${look} ${i}`;
			await f.evaluate(() => O55.ui.go('look', { noHistory: true }));
			/* the screen's strip with its lens on its chosen button */
			const seg = await f.waitForFunction(() => {
				const b = document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) .o55-seg button.o55-on'); if (!b) return null;
				const r = b.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
				const l = [...document.querySelectorAll('#pm-o55-onboarding .lg-lens')].find((e) => { const q = e.getBoundingClientRect(); return q.width > 1 && q.left <= x && q.right >= x && q.top <= y && q.bottom >= y && +getComputedStyle(e).opacity > 0.5; });
				if (!l) return null;
				const q = l.getBoundingClientRect(), w = document.querySelector('#pm-o55-onboarding .o55-win').getBoundingClientRect();
				return { lens: [q.left, q.top, q.width, q.height].map(Math.round), win: [w.left, w.top, w.width, w.height].map(Math.round) };
			}, null, { timeout: 8000 }).then((h) => h.jsonValue(), () => null);
			await t.check(`film fixture: the strip has its lens ${tag}`, !!seg, JSON.stringify(seg));
			await f.waitForTimeout(700);
			await t.mark(`pre ${tag}`);
			await f.waitForTimeout(300);
			await t.mark(`open ${tag}`);
			await f.evaluate(() => O55.nierLook.adjust());
			await f.waitForTimeout(1200);
			const panel = await f.evaluate(() => { const p = document.querySelector('#pm-o55-onboarding .o55-nierpanel'); if (!p) return null; const r = p.getBoundingClientRect(); return [r.left, r.top, r.width, r.height].map(Math.round); });
			await t.mark(`settled ${tag}`);
			const done = f.locator('#pm-o55-onboarding .o55-nierpanel [data-o55nc-done], #pm-o55-onboarding .o55-nierpanel [data-o55-nierpanel="done"]').first();
			await done.scrollIntoViewIfNeeded();
			const b = await done.boundingBox();
			await t.page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await f.waitForTimeout(250);
			await t.mark(`close ${tag}`);
			await t.page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
			await f.waitForTimeout(900);
			await t.mark(`after ${tag}`);
			await t.page.mouse.move(2, 2);
			const closed = await f.evaluate(() => !O55.nierLook.panelOpen());
			await t.check(`film: Done closes the editor ${tag}`, closed);
			rows.push({ look, i, ...seg, panel });
		}
	}
	t.log('FO83-FILM ' + JSON.stringify(rows));
	await f.evaluate(() => { O55.nierLook.closePanel({ silent: true }); document.documentElement.setAttribute('data-motion', 'full'); });
}
