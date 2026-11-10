// browser-check config for the Projects concept (Split v2), a runtime layer over PMConcept7.
//   python3 Concepts/projects-redesign/opus-5.5/tools/build_standalone.py <dir>      (writes <dir>/projects-concepts.html)
//   browser-check run Concepts/projects-redesign/opus-5.5/tools/checks --set page=<dir>/projects-concepts.html
// The single file carries PMConcept7 in the review page's frame (#pm7, srcdoc), so it opens as file:// with no server.
// Every helper below reaches into that frame; the review strip stays outside it, as it does for Jared.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const LOOKS = ['basic', 'friendly', 'retro', 'glass', 'nier'].flatMap((f) => [`${f}-dark`, `${f}-light`]);

export default (ctx) => {
	const page = ctx.args.page;
	if (!page) throw new Error('pass --set page=<dir>/projects-concepts.html (build it with tools/build_standalone.py <dir>)');
	const url = /^[a-z][a-z0-9+.-]+:/i.test(page) ? page : pathToFileURL(path.resolve(page)).href;
	if (/^file:/.test(url) && !fs.existsSync(new URL(url))) throw new Error(`no built page at ${page}`);
	ctx.log(`page ${url}`);
	let cb = 0;
	return {
		name: 'projects-concept',
		pageUrl: url,
		isolate: true,
		viewport: { width: 1920, height: 1080 },
		testTimeoutMs: 600000,
		lateWorkMs: 3000,
		consoleErrors: { fail: true, allow: [] },
		failedRequests: { fail: false },
		helpers: {
			/* Load the review page fresh, wait for the layer to answer, and return PMConcept7's frame (a Playwright Frame). */
			async open(t, { width = null, reduced = true } = {}) {
				if (reduced) await t.emulate({ reducedMotion: 'reduce' });
				await t.goto(`${url}${url.includes('?') ? '&' : '?'}cb=${Date.now()}-${++cb}`, { settleMs: 200 });
				await t.until('layer ready', () => !!(window.PJX_HOST && window.PJX_HOST.isLive()), null, { timeout: 90000, hard: true });
				if (width) await t.page.selectOption('#width', String(width));
				const f = t.page.frame({ name: 'pm7' }) || t.page.frames().find((x) => x !== t.page.mainFrame());
				await f.waitForFunction(() => !!(window.PJX && window.PJX.split && document.querySelector('#pjxc')), null, { timeout: 60000 });
				return f;
			},
			frame(t) { return t.page.frames().find((x) => x !== t.page.mainFrame()); },
			/* a real mouse press on a control inside PMConcept7's frame. The frame keeps animating (the chat's working card,
			   Home's live readings), so Playwright's two-still-frames wait never settles there: press it the way a person does */
			async click(t, f, sel, o = {}) {
				const l = typeof sel === 'string' ? f.locator(sel, o.hasText ? { hasText: o.hasText } : undefined).first() : sel;
				// (noScroll: menus and the title bar, which a scroll would move or close)
				if (!o.noScroll) {
					await l.scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => {});
					// a control inside a sticky card or an inner scroller: centre it in every scroller around it
					await l.evaluate((e) => e.scrollIntoView({ block: 'center', inline: 'nearest' })).catch(() => {});
					await t.page.waitForTimeout(80);
				}
				if (o.noScroll) await f.evaluate(() => { document.documentElement.scrollTop = 0; document.body.scrollTop = 0; }).catch(() => {});
				await t.quickClick(l, { hover: o.hover == null ? 90 : o.hover });
				// the app shell never scrolls itself: put its root back where a person sees it
				if (!o.noScroll) await f.evaluate(() => { document.documentElement.scrollTop = 0; document.body.scrollTop = 0; }).catch(() => {});
				await t.page.waitForTimeout(o.wait == null ? 200 : o.wait);
			},
			/* a checkbox is pressed where a person presses it: on its label */
			async tick(t, f, key) { await t.app.click(t, f, `label:has(> input[data-c-key="${key}"])`); },
			/* wait for a condition inside PMConcept7's frame (t.until looks at the top page) */
			async until(t, f, name, fn, arg, timeout = 20000) {
				const ok = await f.waitForFunction(fn, arg, { timeout }).then(() => true).catch(() => false);
				return t.check(name, ok, ok ? '' : 'not true within ' + timeout + ' ms');
			},
			async menuPick(t, f, text) { await t.app.click(t, f, '.pmr-menu.is-open [role="menuitem"]', { hasText: text, wait: 350, noScroll: true }); },
			/* the review strip's own controls (outside the frame) */
			async moment(t, name) { await t.page.selectOption('#moment', name); await t.page.waitForTimeout(250); },
			async act(t, name) { await t.page.click(`.pc-bar [data-act="${name}"]`); await t.page.waitForTimeout(250); },
			async page(t, f, name) { await f.evaluate((n) => window.PM_PAGES && window.PM_PAGES.go(n), name); await t.page.waitForTimeout(350); },
			/* one of the ten looks through the strip's Look menu (PMConcept7's own theme menu inside) */
			async look(t, name) {
				await t.page.selectOption('#look', name);
				await t.page.waitForFunction(() => !document.getElementById('look').disabled, null, { timeout: 20000 }).catch(() => {});
				await t.page.waitForTimeout(400);
			}
		}
	};
};
