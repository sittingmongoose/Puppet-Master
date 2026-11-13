// FO-185 (Jared's Settings review, 2026-11-13, item 6): "When you scroll in settings, the highlight on the submenu doesnt
// work properly." Stream P's repro on main 564ed6a467: at 1920x1080 on AI & Providers, scrolling in 90 px steps lit the
// wrong section in 20 of 60 steps: the highlight moved to the next section about 180 px early (kit.d/22-index.js's
// reading line, scrollTop + min(140, 30% of the height)), and Answers (providers-answers, the short last section of
// Providers & Accounts) was never lit.
// The walk: AI & Providers from its top, real wheel steps of 90 px over the Settings page until it stops moving, each
// step read once the page has stopped and the tracker has had its frames. The section in view is the last section
// (document order, shown) whose top has reached the top of the readable view: the scroller's top, or the bottom of a
// manager's tab strip stuck there, plus a 30 px allowance for the heading's own padding; at the very end of the page, the
// last section whose heading is in the upper half of the view. A step where any section's top is within 40 px of that line
// is not judged (the tracker reads where a jump lands, a few pixels from it), and neither is one whose section has no
// index entry. Asserted: every judged step lights the section in view, and Answers is lit on at least one step.
//   browser-check run Concepts/pm7-tools/browser-check/checks/settings-index-spy.check.mjs --set page=<build> --set sandbox=0
// --set step=90 --set size=1920x1080 --set chapter=ai change the walk.

const VIEW = () => {
	const sc = document.querySelector('#settings-document');
	if (!sc) return null;
	const b = sc.getBoundingClientRect();
	/* the readable top: under a manager's tab strip when one is stuck at the top of the page */
	let readTop = b.top;
	for (const s of document.querySelectorAll('#settings-document .pm51-mgr.has-manager-tabs > .pm51-tabs')) {
		if (!s.checkVisibility()) continue;
		const r = s.getBoundingClientRect();
		if (r.top <= b.top + 2 && r.bottom > b.top) readTop = Math.max(readTop, r.bottom);
	}
	const line = readTop + 30;
	const shown = (el) => el.getClientRects().length > 0 && !el.closest('details:not([open]), [hidden], [inert], .o55-sec-off, .o55-leaving');
	const anchors = [...sc.querySelectorAll('[data-workspace-block] [data-section-id]')].filter(shown).map((el) => ({ id: el.getAttribute('data-section-id'), ws: el.closest('[data-workspace-block]').getAttribute('data-workspace-block'), top: el.getBoundingClientRect().top }));
	const max = sc.scrollHeight - sc.clientHeight, atEnd = max > 0 && sc.scrollTop >= max - 4;
	let want = null;
	for (const a of anchors) if (a.top <= line || (atEnd && a.top < b.top + sc.clientHeight * 0.5)) want = a;
	const near = anchors.filter((a) => Math.abs(a.top - line) < 40).map((a) => a.id);
	const lit = [...document.querySelectorAll('#pm-settings-root .page-index-card .index-link.is-active')].map((l) => ({ id: l.dataset.section, ws: l.dataset.workspace }));
	const listed = want ? !!document.querySelector(`#pm-settings-root .page-index-card .index-link[data-section="${CSS.escape(want.id)}"]`) : false;
	return { top: Math.round(sc.scrollTop), max, atEnd, want: want && want.id, wantWs: want && want.ws, near, lit, listed, mid: { x: b.left + b.width / 2, y: b.top + b.height / 2 } };
};

export const tests = {
	'FO-185 the index lights the section in view while scrolling': async (t) => {
		const [w, h] = String(t.args.size || '1920x1080').split('x').map(Number);
		const step = Number(t.args.step || 90), chapter = String(t.args.chapter || 'ai');
		const f = await t.app.open();
		await t.emulate({ reducedMotion: 'no-preference' });
		await t.viewport(w, h);
		await f.locator('#tab-settings').click();
		await t.settle();
		await f.locator(`#pm-settings-root [data-action="navigate-domain"][data-domain="${chapter}"]`).first().click();
		await t.settle();
		await t.page.waitForTimeout(800);
		/* the frame's own offset in the window (the sandbox), for the wheel's position */
		let ox = 0, oy = 0;
		if (f !== t.page.mainFrame()) { const el = await f.frameElement().catch(() => null); const fb = el && (await el.boundingBox()); if (fb) { ox = fb.x; oy = fb.y; } }
		const v0 = await f.evaluate(VIEW);
		await t.check('the Settings page and its index are drawn', !!v0 && v0.lit.length >= 0, 'no #settings-document');
		if (!v0) return;
		await t.page.mouse.move(v0.mid.x + ox, v0.mid.y + oy);
		let judged = 0, wrong = [], answers = false, last = -1, n = 0;
		for (n = 0; n < 200; n++) {
			await t.page.mouse.wheel(0, step);
			/* the page has stopped moving, then the tracker's frames */
			let prev = -2;
			for (let k = 0; k < 30; k++) { await t.page.waitForTimeout(60); const now = await f.evaluate(() => (document.querySelector('#settings-document') || {}).scrollTop); if (Math.abs(now - prev) < 0.5) break; prev = now; }
			await f.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 60)))));
			const v = await f.evaluate(VIEW);
			if (v.lit.some((x) => x.id === 'providers-answers')) answers = true;
			if (v.want && !v.near.length && v.listed) {
				judged++;
				if (!v.lit.some((x) => x.id === v.want)) wrong.push(`${v.top}px: ${v.lit.map((x) => x.id).join(',') || 'none'} lit, ${v.want} in view`);
			}
			if (v.top === last || v.atEnd) break;
			last = v.top;
		}
		t.log(`walk: ${n + 1} steps of ${step} px, ${judged} judged`);
		await t.check(`FO-185 every judged step lights the section in view (${judged - wrong.length} of ${judged}, ${n + 1} steps of ${step} px)`, judged >= 20 && wrong.length === 0, wrong.slice(0, 6).join(' | ') + (wrong.length > 6 ? ` and ${wrong.length - 6} more` : ''));
		if (chapter === 'ai') await t.check('FO-185 Answers, the short last section of Providers & Accounts, is lit on the way down', answers, 'never lit');
	}
};
