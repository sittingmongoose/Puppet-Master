// QA round 2, lane chatpip: Astra's review findings F5 and F6, in a normal page and in a sandboxed iframe like T3's
// file preview (opaque origin, no storage). Glass Dark, asserted before each check.
//   browser-check run Concepts/pm7-tools/browser-check/checks/qa2-chatpip.check.mjs [--set page=<build>]
// F5: an internal key (the transcript's data-scroll-key) must never make an element a hover-tag target. The controller's
//     candidate test must reject the transcript and a whole message; the transcript is then sent down the live path a
//     mutation takes, and the pointer rests on empty chat background: no tag. A guided example then runs (real clicks) and
//     no message may be bound as a technical identifier.
// F6: Studio > Chat > Guided examples > To-Dos > Parallel outputs; Build; Open workspace; Studio > Chat > Reset chat. The
//     Batch 16 workspace must not throw while its artifacts are reset (console errors fail the run).
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const CONTAINER = 'article,section,div,p,ul,ol,li,table,form,header,footer,nav,main,aside,button,input,select,textarea';

async function frameFor(t, mode) {
	if (mode === 'normal') { await t.app.open(); return t.page.mainFrame(); }
	const html = path.join(t.run.dir, 'sandbox-qa2.html');
	fs.writeFileSync(html, `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;height:100%;overflow:hidden}iframe{border:0;width:100vw;height:100vh;display:block}</style><iframe sandbox="allow-scripts allow-popups allow-forms allow-modals" src="${t.cfg.pageUrl}${t.cfg.pageUrl.includes('?') ? '&' : '?'}cb=${Date.now()}&o55=off"></iframe>`);
	await t.goto(pathToFileURL(html).href, { settleMs: 1000 });
	let f = null;
	for (let i = 0; i < 150 && !f; i++) { f = t.page.frames().find((x) => /PMConcept7|cb=/.test(x.url()) && x !== t.page.mainFrame()); if (!f) await t.page.waitForTimeout(200); }
	await f.waitForFunction(() => document.documentElement.getAttribute('data-pmr-ready') === '1' && !!window.PM_THEME, null, { timeout: 60000 });
	await t.check('sandbox: opaque origin, storage blocked', await f.evaluate(() => { try { localStorage.getItem('x'); return false; } catch (e) { return true; } }));
	return f;
}
async function glassDark(t, f) {
	// NieR is its own switch over a family (a check run before this one may have left it on)
	await f.evaluate(async () => { if (window.PM_NIER && PM_NIER.on()) await PM_NIER.set(false, { persist: false }); PM_THEME.setFamily('glass', { persist: false }); PM_THEME.setMode('dark', { persist: false }); });
	await f.waitForFunction(() => document.documentElement.getAttribute('data-theme') === 'glass-dark' && !(window.PM_NIER && PM_NIER.on()), null, { timeout: 20000 }).catch(() => {});
	await t.page.waitForTimeout(600);
	await t.equal('look applied', await f.evaluate(() => document.documentElement.getAttribute('data-theme')), 'glass-dark');
}

async function f5(t, mode) {
	const f = await frameFor(t, mode);
	await glassDark(t, f);
	const box = await f.evaluate(() => { const q = document.querySelector('#pmRoot .transcript').getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; });
	// scroll the transcript with the wheel, as a person does: its scrollbar class changes and the census sees it
	await t.page.mouse.move(box.x, box.y);
	for (const dy of [-400, -400, 300, 300]) { await t.page.mouse.wheel(0, dy); await t.page.waitForTimeout(250); }
	// the rule itself: the controller's own candidate test rejects the transcript and a whole message
	const rule = await f.evaluate(() => {
		const c = window.PM_HOVER_TAG_CONTROLLER, tr = document.querySelector('#pmRoot .transcript'), msg = document.querySelector('#pmRoot article.message');
		return { transcript: !!c.prepare(tr), message: msg ? !!c.prepare(msg) : null };
	});
	await t.check('the hover rule rejects the transcript (data-scroll-key) and a whole message (data-message-id)', !rule.transcript && !rule.message, JSON.stringify(rule));
	// the live path a mutation on the transcript takes (Astra's sequence changed it deep in a guided run), then the pointer
	await f.evaluate(() => { const c = window.PM_HOVER_TAG_CONTROLLER; c.enqueueLive(document.querySelector('#pmRoot .transcript'), false); });
	await t.page.waitForTimeout(1500);
	// rest the pointer on empty chat background (a point whose top element is the transcript itself)
	const spot = await f.evaluate(() => {
		const tr = document.querySelector('#pmRoot .transcript'), q = tr.getBoundingClientRect();
		for (let y = q.top + 4; y < q.bottom - 4; y += 6) for (const x of [q.left + 6, q.right - 16, q.left + q.width / 2]) {
			const e = document.elementFromPoint(x, y); if (e === tr || (e && e.classList.contains('transcript-inner'))) return [x, y];
		}
		return null;
	});
	await t.check('found empty chat background', !!spot);
	if (spot) { await t.page.mouse.move(spot[0], spot[1], { steps: 6 }); await t.page.waitForTimeout(3400); }
	const r = await f.evaluate((C) => {
		const tr = document.querySelector('#pmRoot .transcript');
		const tech = [...document.querySelectorAll('[data-pm-hover-kind~="technical-identifier"]')];
		const big = tech.filter((e) => e.querySelector(C) && !e.hasAttribute('data-technical-id')).map((e) => e.tagName.toLowerCase() + '.' + String(e.className).split(/\s+/)[0]);
		const tag = document.getElementById('pm-hover-tag-visual'), tq = tag && tag.getBoundingClientRect(), cs = tag && getComputedStyle(tag);
		const shown = !!(tag && tq.width && tq.height && cs.visibility !== 'hidden' && cs.display !== 'none' && parseFloat(cs.opacity) > .05);
		return { transcriptKind: tr.getAttribute('data-pm-hover-kind'), transcriptBound: tr.getAttribute('data-pm-hover-bound'), bigTechnical: big.slice(0, 8), bigCount: big.length, tagShown: shown, tagText: shown ? tag.textContent.slice(0, 160) : '', tagSize: shown ? [Math.round(tq.width), Math.round(tq.height)] : null };
	}, CONTAINER);
	t.log(JSON.stringify(r));
	await t.check('the transcript is not a hover-tag target', !/technical-identifier/.test(r.transcriptKind || '') && r.transcriptBound !== 'true', JSON.stringify(r));
	await t.check('no container is bound as a technical identifier', r.bigCount === 0, r.bigTechnical.join(' '));
	await t.check('no tag over empty chat background', !r.tagShown, r.tagText);
	if (r.tagShown) await t.shot('f5-tag-' + mode, 'the tag shown over empty chat background');
	// a guided example, by real clicks: messages arrive and the live census binds what it finds
	const click = async (sel) => { await f.locator(sel).click(); await t.page.waitForTimeout(400); };
	if (!await f.locator('#o55-demo').evaluate((e) => e.hasAttribute('data-pmds-open'))) await click('.pmds-entry');
	await t.page.waitForTimeout(650); await click('[data-pmds-tab="chat"]'); await click('[data-pmds-do="chat-view"][data-arg="guided"]'); await click('[data-pmds-do="chat-guided"][data-arg="todo-parallel"]');
	await t.page.waitForTimeout(7000);
	const msgs = await f.evaluate((C) => ({ messages: document.querySelectorAll('#pmRoot article.message').length, technical: [...document.querySelectorAll('[data-pm-hover-kind~="technical-identifier"]')].filter((e) => e.querySelector(C) && !e.hasAttribute('data-technical-id')).map((e) => e.tagName.toLowerCase() + '.' + String(e.className).split(/\s+/)[0]) }), CONTAINER);
	await t.check('after a guided example no message or container is a technical identifier', msgs.messages > 0 && msgs.technical.length === 0, JSON.stringify(msgs));
}

async function f6(t, mode) {
	const f = await frameFor(t, mode);
	await glassDark(t, f);
	const wait = (ms) => t.page.waitForTimeout(ms), click = async (s) => { await f.locator(s).click(); await wait(400); };
	const studio = async (tab) => { if (!await f.locator('#o55-demo').evaluate((e) => e.hasAttribute('data-pmds-open'))) await click('.pmds-entry'); await wait(650); await click('[data-pmds-tab="' + tab + '"]'); };
	const errors = []; t.page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
	await studio('chat'); await click('[data-pmds-do="chat-view"][data-arg="guided"]'); await click('[data-pmds-do="chat-guided"][data-arg="todo-parallel"]');
	let done = false;
	for (let i = 0; i < 150; i++) {
		await wait(800);
		const guide = await f.locator('.pmx-guide-step:visible').innerText().catch(() => '');
		if (/^Done/.test(guide)) { done = true; break; }
		if (/Your move.*Build|Press Build/.test(guide)) { const build = f.locator('button:visible').filter({ hasText: /^Build$/ }).last(); if (await build.count()) await build.click(); }
	}
	await t.check('parallel example reached checked outputs', done, '', { hard: true });
	await f.locator('[data-action="b16-open"]:visible').last().click(); await wait(1500);
	await t.check('workspace renders before reset', await f.locator('.b16-workspace:visible').count() > 0);
	await studio('chat'); await click('[data-pmds-do="chat-reset"]'); await wait(1300); await click('[data-pmds-do="close"]'); await wait(1000);
	const thrown = errors.filter((e) => /TypeError|threw/.test(e));
	await t.check('Reset chat throws nothing', thrown.length === 0, thrown.join(' | '));
	await t.check('the workspace is gone after reset', await f.locator('.b16-workspace:visible').count() === 0);
}

export const tests = {
	'F5 normal': (t) => f5(t, 'normal'),
	'F5 sandbox': (t) => f5(t, 'sandbox'),
	'F6 normal': (t) => f6(t, 'normal'),
	'F6 sandbox': (t) => f6(t, 'sandbox')
};
