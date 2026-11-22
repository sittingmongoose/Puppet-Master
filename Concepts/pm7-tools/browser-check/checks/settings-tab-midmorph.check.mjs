// Stream F batch 18, FO-S2 (pre-existing on main): a second tab click while the first tab change is still morphing
// drops the arriving body. PM51.switchTab reads the old body with ':scope > .manager-body', which matches the
// .o55-leaving copy still animating out (it precedes the arriving body in document order). The interrupted morph
// then removes that leaving copy — its own oldEl — before inserting the new one, so the fresh body is never placed:
// the strip names the last-clicked tab while the previous tab's body stays on screen (and the manager keeps the
// interrupted morph's data-o55-morph and overflow:clip). Real mouse clicks: tab B, then tab C 55/85/115 ms later,
// mid-morph (the morph runs about 300 ms plus its after-paint start), on three tabbed managers in three chapters.
// The page's own click log measures the interval the two trusted clicks actually landed at (a busy main thread can
// stretch the sent interval); each rep must land mid-morph. Four looks at 1440x900 and 860x900, both surfaces; a
// Reduced Motion case keeps the immediate swap covered. Asserts after the animation: exactly one body, no
// .o55-leaving copy, the visible body is tab C's (its own marker present, tab B's marker absent, strip active on C),
// its rows are drawn, and no morph state is stuck on the manager. --set looks=, gaps= pick subsets; each gap is one rep.

const LOOKS = ['basic-dark', 'glass-light', 'nier-dark', 'retro-light'];
const SIZES = [[1440, 900], [860, 900]];
const GAPS = [55, 85, 115];
const ROWS = '.pm51-row, .pm51-item, .resource-row, .pm51-acc-item';
const CONTENT = ROWS + ', .pm51-section-title, .pm51-note, .o55-quiet-line';
const MANAGERS = [
	{ domain: 'general', ws: 'notifications', start: 'destinations', B: 'events', C: 'sounds', bMark: '.pm51-event-list', cMark: '.pm51-sound-styles' },
	{ domain: 'code', ws: 'testing', start: 'profiles', B: 'when', C: 'browser-native', bMark: '[data-action="pm51-testing-trigger"]', cMark: '[data-action="pm51-testing-native"]' },
	{ domain: 'ai', ws: 'web', start: 'limits', B: 'services', C: 'abilities', bMark: '.o55-web-services', cMark: '.resource-detail' },
];

async function settings(t, surface, [w, h]) {
	await t.viewport(w, h);
	const f = await t.app.open({ sandbox: surface === 'sandbox' });
	await t.app.resetLayout();
	await f.locator('#tab-settings').click();
	await t.settle();
	await f.evaluate(() => {
		window.__foS2Clicks = [];
		document.addEventListener('click', (e) => {
			const b = e.target && e.target.closest && e.target.closest('.manager-tab');
			if (b) window.__foS2Clicks.push({ tab: b.dataset.tab, ws: b.dataset.manager, at: performance.now(), trusted: e.isTrusted });
		}, true);
	});
	return f;
}
const BODY = (ws) => `[data-continuous-workspace-body="${ws}"]`;
async function go(t, f, domain, ws) {
	await f.evaluate(([d, w]) => PM51.go(d, w), [domain, ws]);
	await f.waitForSelector(`${BODY(ws)}[data-workspace-mounted="true"]`, { timeout: 15000 });
	await t.settle();
}
const tabBtn = (f, ws, tab) => f.locator(`${BODY(ws)} .pm51-tabs .manager-tab[data-tab="${tab}"]`).first();
async function slowTab(t, f, ws, tab) {
	const b = tabBtn(f, ws, tab);
	await b.scrollIntoViewIfNeeded();
	await b.click();
	await t.settle();
	await t.page.waitForTimeout(450);
}
/* Two real mouse clicks at the tabs' own centres, gap ms apart; no actionability wait between them. */
async function rapid(t, f, m, gap) {
	const b = tabBtn(f, m.ws, m.B), c = tabBtn(f, m.ws, m.C);
	await b.scrollIntoViewIfNeeded();
	const bb = await b.boundingBox(), cb = await c.boundingBox();
	if (!bb || !cb) throw new Error(`${m.ws}: tab ${m.B} or ${m.C} has no box on screen`);
	await f.evaluate((ws) => { window.__foS2Clicks = window.__foS2Clicks.filter((x) => x.ws !== ws); }, m.ws);
	const t0 = Date.now();
	await t.page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
	await t.page.waitForTimeout(gap);
	await t.page.mouse.click(cb.x + cb.width / 2, cb.y + cb.height / 2);
	const landed = Date.now() - t0;
	await t.page.waitForTimeout(800);
	await t.settle();
	const clicks = await f.evaluate((ws) => window.__foS2Clicks.filter((x) => x.ws === ws), m.ws);
	return { gap, landed, clicks };
}
/* Everything judged is scoped to the manager's own page: the in-flow body (never a leaving copy), the strip, the rows. */
const readState = (f, m) => f.evaluate(([ws, bMark, cMark, rowsSel, contentSel]) => {
	const body = document.querySelector(`[data-continuous-workspace-body="${ws}"]`);
	const page = body && body.querySelector('.pm51-mgr');
	if (!page) return { err: 'no manager page' };
	const laid = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
	const bodies = [...page.querySelectorAll(':scope > .manager-body')];
	const flow = bodies.find((b) => !b.classList.contains('o55-leaving')) || null;
	const rows = flow ? [...flow.querySelectorAll(rowsSel)].filter((el) => laid(el) && (el.innerText || '').trim().length > 0) : [];
	const content = flow ? [...flow.querySelectorAll(contentSel)].filter((el) => laid(el) && (el.innerText || '').trim().length > 0) : [];
	const inView = content.filter((el) => { const r = el.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; });
	const active = [...page.querySelectorAll(':scope > .pm51-tabs .manager-tab')].filter((b) => b.classList.contains('active')).map((b) => b.dataset.tab);
	const rect = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return [r.top, r.bottom].map((v) => Math.round(v)); };
	const scroller = document.querySelector('#settings-document');
	return {
		bodies: bodies.length,
		leaving: page.querySelectorAll('.o55-leaving').length,
		cMark: flow ? !!flow.querySelector(cMark) : false,
		bMark: flow ? !!flow.querySelector(bMark) : false,
		rows: rows.length, inView: inView.length,
		text: flow ? (flow.innerText || '').trim().length : 0,
		opacity: flow ? getComputedStyle(flow).opacity : null,
		active, morph: page.dataset.o55Morph || null,
		overflow: getComputedStyle(page).overflow,
		geo: { body: rect(flow), strip: rect(page.querySelector(':scope > .pm51-tabs')), firstRow: rect(rows[0]), scrollTop: scroller ? Math.round(scroller.scrollTop) : null, vh: innerHeight },
	};
}, [m.ws, m.bMark, m.cMark, ROWS, CONTENT]);

async function judge(t, f, m, timing) {
	const { gap, landed, clicks } = timing;
	const tag = `${m.ws} ${m.B}->${m.C} gap ${gap} ms`;
	const pair = clicks.length >= 2 ? clicks.slice(-2) : [];
	const inPage = pair.length === 2 ? Math.round(pair[1].at - pair[0].at) : null;
	const midMorph = pair.length === 2 && pair[0].tab === m.B && pair[1].tab === m.C && pair.every((x) => x.trusted) && inPage > 5 && inPage < 450;
	await t.check(`${tag}: two trusted clicks landed mid-morph (sent ${gap} ms apart, ${landed} ms wall)`, midMorph,
		`clicks ${JSON.stringify(pair.map((x) => ({ tab: x.tab, trusted: x.trusted })))}, in-page interval ${inPage} ms (must be 5-450 ms: after the first morph starts, before it ends)`);
	t.log(`${tag}: two trusted clicks landed ${inPage} ms apart in the page (sent ${gap} ms, wall ${landed} ms)`);
	const s = await readState(f, m);
	if (s.err) { await t.check(`${tag}: manager page present`, false, s.err); return false; }
	const one = await t.check(`${tag}: one body, no leaving copy left`, s.bodies === 1 && s.leaving === 0, `${s.bodies} bodies, ${s.leaving} leaving`);
	const right = await t.check(`${tag}: visible body is tab ${m.C}'s`, s.cMark && !s.bMark && s.active.join(',') === m.C,
		`tab C marker ${s.cMark}, tab B marker still present ${s.bMark}, strip active [${s.active.join(',')}]`);
	const overlap = s.geo.body ? Math.min(s.geo.body[1], s.geo.vh) - Math.max(s.geo.body[0], 0) : 0;
	const drawn = await t.check(`${tag}: tab ${m.C}'s rows are drawn`, s.rows >= 3 && s.inView >= 1 && overlap >= 100 && s.text >= 40 && s.opacity === '1',
		`${s.rows} laid-out rows, ${s.inView} content elements on screen, body overlap ${overlap} px, ${s.text} chars, opacity ${s.opacity}; geometry ${JSON.stringify(s.geo)}`);
	const settled = await t.check(`${tag}: no stuck morph state`, s.morph === null && s.overflow !== 'clip', `data-o55-morph ${s.morph}, overflow ${s.overflow}`);
	return one && right && drawn && settled;
}

export const tests = {};
for (const surface of ['normal', 'sandbox']) {
	const T = (name, fn) => { tests[`${name} (${surface})`] = async (t) => { if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; } await fn(t); }; };
	const looks = (t) => String(t.args.looks || LOOKS.join(',')).split(',').map((x) => x.trim()).filter(Boolean);
	const gaps = (t) => String(t.args.gaps || GAPS.join(',')).split(',').map((x) => parseInt(x, 10)).filter((x) => x > 0);

	for (const look of LOOKS) {
		for (const [w, h] of SIZES) {
			T(`FO-S2 mid-morph tab click keeps the arriving body — ${look} ${w}x${h}`, async (t) => {
				if (!looks(t).includes(look)) { await t.check(`${look} not asked for`, true); return; }
				const f = await settings(t, surface, [w, h]);
				await t.app.look(t, look);
				let cropped = false;
				for (const m of MANAGERS) {
					await go(t, f, m.domain, m.ws);
					await slowTab(t, f, m.ws, m.start);
					let ok = true;
					for (const gap of gaps(t)) {
						const timing = await rapid(t, f, m, gap);
						ok = (await judge(t, f, m, timing)) && ok;
						await slowTab(t, f, m.ws, m.start);
					}
					if (!ok && !cropped) {
						cropped = true;
						await t.crop(`${m.ws}-after-midmorph`, f.locator(`${BODY(m.ws)} .pm51-mgr`), 'the manager after rapid B then C clicks: which body is on screen');
					}
					if (ok && look === 'basic-dark' && w === 1440 && surface === 'normal' && m.ws === 'notifications') {
						await t.crop('notifications-after-midmorph', f.locator(`${BODY(m.ws)} .pm51-mgr`), 'the last-clicked tab body, fully drawn, after the rapid clicks');
					}
				}
			});
		}
	}

	T('FO-S2 mid-morph tab click under Reduced Motion — basic-dark 1440x900', async (t) => {
		await t.emulate({ reducedMotion: 'reduce' });
		const f = await settings(t, surface, [1440, 900]);
		await t.app.look(t, 'basic-dark');
		await t.check('the page reads Reduced Motion', await f.evaluate(() => O55.motion.reduced()));
		for (const m of MANAGERS) {
			await go(t, f, m.domain, m.ws);
			await slowTab(t, f, m.ws, m.start);
			for (const gap of gaps(t)) {
				const timing = await rapid(t, f, m, gap);
				await judge(t, f, m, timing);
				await slowTab(t, f, m.ws, m.start);
			}
		}
		await t.emulate({ reducedMotion: 'no-preference' });
	});
}
