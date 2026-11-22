// Stream F batch 18, FO-S2 (pre-existing on main): a second tab click while the first tab change is still morphing
// drops the arriving body. PM51.switchTab reads the old body with ':scope > .manager-body', which matches the
// .o55-leaving copy still animating out (it precedes the arriving body in document order). The interrupted morph
// then removes that leaving copy — its own oldEl — before inserting the new one, so the fresh body is never placed:
// the strip names the last-clicked tab while the previous tab's body stays on screen (and the manager keeps the
// interrupted morph's data-o55-morph and overflow:clip). Real mouse clicks: tab B, then tab C 55/85/115 ms later,
// mid-morph (the morph runs about 300 ms plus its after-paint start), on three tabbed managers in three chapters.
// The page's own click log measures the interval the two trusted clicks actually landed at (a busy main thread can
// stretch the sent interval) and the morph state at click 2; each rep is judged only when click 2 really landed
// mid-morph (.o55-leaving or data-o55-morph present on the host), else it is logged as not judged. Four looks at
// 1440x900 and 860x900, both surfaces; a Reduced Motion case keeps the immediate swap covered (no morph state is
// asked for there: every swap is immediate by design). Asserts after the animation: exactly one body, no
// .o55-leaving copy, the visible body is tab C's (its own marker present, tab B's marker absent, strip active on C),
// its rows are drawn, and no morph state is stuck on the manager. --set looks=, gaps= pick subsets; each gap is one rep.
// The same file carries FO-S1b, the detail-swap twin (batch 18): a second item click mid-morph keeps the arriving
// detail, and FO-S1b-insp, the Details-inspector twin: a second About click mid-morph keeps the arriving inspector
// page. Their rows, helpers and judges are below the tab ones; --set dws= picks the detail managers.
// Neon's FO-S2 recheck lows are fixed here: the look is saved ({ save: true }) and asserted still painted every rep
// (PM51.go used to paint glass-light and retro-light back to the saved basic-dark), the crops are taken right after
// the second click lands (before the reset to the start tab), and mid-morph is qualified by the host's state at
// click 2, not only by the click interval (a height-equal morph can finish at dur * 0.6).

import { lookHeld } from '../helpers/settings-look.mjs';

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
	/* Capture-phase click log: what was clicked, when, trusted, and the morph state of the click's own host at the
	   moment of the click (before the engine's handler runs), so click 2 can be qualified as mid-morph by state. */
	await f.evaluate(() => {
		window.__foS2Clicks = [];
		window.__foS1bClicks = [];
		window.__foS1bInspClicks = [];
		const morphState = (host) => host ? { leaving: host.querySelectorAll('.o55-leaving').length, morph: host.dataset.o55Morph || null } : { leaving: 0, morph: null };
		document.addEventListener('click', (e) => {
			const el = e.target && e.target.closest ? e.target : null;
			if (!el) return;
			const b = el.closest('.manager-tab');
			if (b) window.__foS2Clicks.push({ tab: b.dataset.tab, ws: b.dataset.manager, at: performance.now(), trusted: e.isTrusted, ...morphState(b.closest('.pm51-mgr')) });
			const r = el.closest('.resource-row');
			if (r) {
				const pg = r.closest('.pm51-mgr');
				window.__foS1bClicks.push({ id: r.dataset.id, ws: r.dataset.manager, at: performance.now(), trusted: e.isTrusted, ...morphState(r.closest('.pm51-split')), tabMorph: pg ? (pg.dataset.o55Morph || null) : null, tabLeaving: pg ? pg.querySelectorAll(':scope > .manager-body.o55-leaving').length : 0 });
			}
			const d = el.closest('[data-action="setting-details"]');
			if (d) {
				const layout = d.closest('.document-layout');
				const insp = layout && layout.querySelector('.detail-inspector');
				window.__foS1bInspClicks.push({ setting: d.dataset.setting, at: performance.now(), trusted: e.isTrusted, ...morphState(insp) });
			}
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
/* What is painted right now, the settings-look helper's own read (NieR is its family switch plus the mode's slug). */
const paintedRead = (f) => f.evaluate(() => {
	const theme = document.documentElement.getAttribute('data-theme') || '';
	return { theme, nier: !!(window.PM_NIER && PM_NIER.on()) || theme.startsWith('nier') || document.documentElement.getAttribute('data-o55-nier') === 'on' };
});
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

/* Returns true/false for a judged rep, or 'unjudged' when click 2 landed after the first morph had already settled
   (such a rep does not exercise the bug; it is logged, not counted). Reduced motion swaps immediately: no morph
   state is asked for, every landed rep is judged. */
async function judge(t, f, m, timing, look, reduced = false) {
	const { gap, landed, clicks } = timing;
	const tag = `${m.ws} ${m.B}->${m.C} gap ${gap} ms`;
	const pair = clicks.length >= 2 ? clicks.slice(-2) : [];
	const inPage = pair.length === 2 ? Math.round(pair[1].at - pair[0].at) : null;
	const landed2 = pair.length === 2 && pair[0].tab === m.B && pair[1].tab === m.C && pair.every((x) => x.trusted) && inPage > 5 && inPage < 450;
	await t.check(`${tag}: two trusted clicks landed (sent ${gap} ms apart, ${landed} ms wall)`, landed2,
		`clicks ${JSON.stringify(pair.map((x) => ({ tab: x.tab, trusted: x.trusted })))}, in-page interval ${inPage} ms (must be 5-450 ms)`);
	if (!landed2) return false;
	const got = await paintedRead(f);
	await t.check(`${tag}: still painted ${look}`, lookHeld(look, got), `painted ${got.theme}${got.nier ? ', NieR on' : ''}`);
	if (!reduced) {
		const midState = pair[1].leaving > 0 || pair[1].morph != null;
		if (!midState) {
			t.log(`${tag}: rep not judged — the first morph had already settled at click 2 (leaving ${pair[1].leaving}, data-o55-morph ${pair[1].morph}); in-page interval ${inPage} ms`);
			return 'unjudged';
		}
		t.log(`${tag}: mid-morph at click 2 (leaving ${pair[1].leaving}, data-o55-morph ${pair[1].morph}); two trusted clicks ${inPage} ms apart in the page (sent ${gap} ms, wall ${landed} ms)`);
	}
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

/* ---------- FO-S1b: the detail-swap twin ------------------------------------------------------------------------
   A second item click while the first detail swap is still morphing (about 260 ms) drops the arriving detail:
   PM51.swapDetail read the old detail with '.resource-detail', which matches the .o55-leaving copy of the interrupted
   morph (it precedes the arriving detail in document order). o55Morph then removes that leaving copy — its own oldEl —
   before inserting the new one, so oldEl.after(newEl) places nothing: the roster highlight, the item's More button and
   the state move to the last-clicked item while the first-clicked item's detail stays on screen, and the split keeps
   the interrupted morph's data-o55-morph and inline position:relative (the arriving detail never connects, so its
   ResizeObserver never fires and no cleanup runs). Real mouse clicks: item B, then item C 55/85/115 ms later, on
   Personas, Goals > Templates and Servers (two roster items there: B, then back to the first as C), in four looks at
   1440x900, both surfaces. Asserts after the animation: the visible detail is item C's (its title, the roster's active
   row), its content drawn, the side index names the open tab and its group anchors are live (none stranded in a stale
   detail), and no .o55-leaving copy or stuck morph state remains on the split. Fails on the base page; the fix selects
   '.resource-detail:not(.o55-leaving)'. */
const DETAIL_MANAGERS = [
	{ domain: 'memory', ws: 'personas', tab: 'personas' },
	{ domain: 'memory', ws: 'goals', tab: 'templates' },
	{ domain: 'system', ws: 'servers', tab: 'servers' },
];
const rowBtn = (f, ws, id) => f.locator(`${BODY(ws)} .resource-roster .resource-row[data-id="${id}"]`).first();
async function slowRow(t, f, ws, id) {
	const b = rowBtn(f, ws, id);
	await b.scrollIntoViewIfNeeded();
	await b.click();
	await t.settle();
	await t.page.waitForTimeout(450);
}
const readRoster = (f, ws) => f.evaluate((w) => {
	const body = document.querySelector(`[data-continuous-workspace-body="${w}"]`);
	const rows = body ? [...body.querySelectorAll('.resource-roster .resource-row')] : [];
	return rows.map((r) => { const b = r.getBoundingClientRect(); return { id: r.dataset.id, name: ((r.querySelector('.resource-row-name') || {}).textContent || '').trim(), laid: b.width > 0 && b.height > 0 }; }).filter((r) => r.laid && r.id);
}, ws);
const readRestPos = (f, ws) => f.evaluate((w) => {
	const body = document.querySelector(`[data-continuous-workspace-body="${w}"]`);
	const split = body && [...body.querySelectorAll('.pm51-split')].find((el) => !el.closest('.o55-leaving'));
	return split ? getComputedStyle(split).position : null;
}, ws);
/* Two real mouse clicks at the roster rows' own centres, gap ms apart; no actionability wait between them. */
async function rapidRows(t, f, ws, B, C, gap) {
	const b = rowBtn(f, ws, B.id), c = rowBtn(f, ws, C.id);
	await b.scrollIntoViewIfNeeded();
	const bb = await b.boundingBox(), cb = await c.boundingBox();
	if (!bb || !cb) throw new Error(`${ws}: roster row ${B.id} or ${C.id} has no box on screen`);
	await f.evaluate((w) => { window.__foS1bClicks = window.__foS1bClicks.filter((x) => x.ws !== w); }, ws);
	const t0 = Date.now();
	await t.page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
	await t.page.waitForTimeout(gap);
	await t.page.mouse.click(cb.x + cb.width / 2, cb.y + cb.height / 2);
	const landed = Date.now() - t0;
	await t.page.waitForTimeout(800);
	await t.settle();
	const clicks = await f.evaluate((w) => window.__foS1bClicks.filter((x) => x.ws === w), ws);
	return { gap, landed, clicks };
}
/* Everything judged is scoped to the manager's own split: the in-flow detail (never a leaving copy), the roster,
   the side index's anchors, and the split's own morph state against its position at rest. */
const readDetailState = (f, m, restPos) => f.evaluate(([ws, rest]) => {
	const body = document.querySelector(`[data-continuous-workspace-body="${ws}"]`);
	const page = body && body.querySelector('.pm51-mgr');
	if (!page) return { err: 'no manager page' };
	const split = [...page.querySelectorAll('.pm51-split')].find((el) => !el.closest('.o55-leaving'));
	if (!split) return { err: 'no live split' };
	const details = [...split.querySelectorAll(':scope > .resource-detail')];
	const flow = details.find((d) => !d.classList.contains('o55-leaving')) || null;
	const laid = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
	const title = flow ? ((flow.querySelector('.pm51-detail-title') || {}).textContent || '').trim() : '';
	const content = flow ? [...flow.querySelectorAll('.setting-row, .pm51-row, .pm51-step, .pm51-kv-row, .pm51-section-title, .pm51-note, .o55-quiet-line, .o55-goals-phase')].filter((el) => laid(el) && (el.innerText || '').trim().length > 0) : [];
	const active = [...page.querySelectorAll('.resource-roster .resource-row.active')].map((r) => r.dataset.id);
	const group = document.querySelector(`.pm51-index-group[data-index-ws="${ws}"]`);
	const entries = group ? [...group.querySelectorAll('.index-link:not(.pm51-index-tab)')].map((b) => b.dataset.section) : [];
	const anchors = entries.map((id) => {
		const els = [...body.querySelectorAll(`[data-section-id="${id}"]`)].filter((el) => !el.closest('.o55-leaving'));
		const el = els[0] || null;
		const det = el && el.closest('.resource-detail');
		return { id, found: !!el, stranded: !!(det && det !== flow) };
	});
	const openTab = group ? ((group.querySelector('.pm51-index-tab.is-open') || {}).dataset || {}).tab || null : null;
	const r = flow ? flow.getBoundingClientRect() : null;
	return {
		details: details.length,
		leaving: page.querySelectorAll('.o55-leaving').length,
		title, active,
		rows: content.length,
		text: flow ? (flow.innerText || '').trim().length : 0,
		opacity: flow ? getComputedStyle(flow).opacity : null,
		overlap: r ? Math.min(r.bottom, innerHeight) - Math.max(r.top, 0) : 0,
		morph: split.dataset.o55Morph || null,
		inlinePos: split.style.position || '', inlineOverflow: split.style.overflow || '',
		pos: getComputedStyle(split).position, restPos: rest,
		entries: entries.length, anchors, openTab,
	};
}, [m.ws, restPos]);
async function judgeDetail(t, f, m, B, C, timing, restPos, look) {
	const { gap, landed, clicks } = timing;
	const tag = `${m.ws} ${B.id}->${C.id} gap ${gap} ms`;
	const pair = clicks.length >= 2 ? clicks.slice(-2) : [];
	const inPage = pair.length === 2 ? Math.round(pair[1].at - pair[0].at) : null;
	const landed2 = pair.length === 2 && pair[0].id === B.id && pair[1].id === C.id && pair.every((x) => x.trusted) && inPage > 5 && inPage < 450;
	await t.check(`${tag}: two trusted item clicks landed (sent ${gap} ms apart, ${landed} ms wall)`, landed2,
		`clicks ${JSON.stringify(pair.map((x) => ({ id: x.id, trusted: x.trusted })))}, in-page interval ${inPage} ms (must be 5-450 ms)`);
	if (!landed2) return false;
	const got = await paintedRead(f);
	await t.check(`${tag}: still painted ${look}`, lookHeld(look, got), `painted ${got.theme}${got.nier ? ', NieR on' : ''}`);
	const midState = pair[1].leaving > 0 || pair[1].morph != null;
	if (!midState) {
		t.log(`${tag}: rep not judged — the first morph had already settled at click 2 (leaving ${pair[1].leaving}, data-o55-morph ${pair[1].morph}); in-page interval ${inPage} ms`);
		return 'unjudged';
	}
	t.log(`${tag}: mid-morph at click 2 (leaving ${pair[1].leaving}, data-o55-morph ${pair[1].morph}); two trusted clicks ${inPage} ms apart in the page (sent ${gap} ms, wall ${landed} ms)`);
	const s = await readDetailState(f, m, restPos);
	if (s.err) { await t.check(`${tag}: manager page present`, false, s.err); return false; }
	const right = await t.check(`${tag}: visible detail is item ${C.id}'s`, s.title.startsWith(C.name) && !s.title.startsWith(B.name) && s.active.join(',') === C.id,
		`detail title "${s.title}" (want "${C.name}", not "${B.name}"), roster active [${s.active.join(',')}]`);
	const one = await t.check(`${tag}: one detail, no leaving copy left`, s.details === 1 && s.leaving === 0, `${s.details} details, ${s.leaving} leaving`);
	const drawn = await t.check(`${tag}: item ${C.id}'s detail content is drawn`, s.rows >= 3 && s.overlap >= 100 && s.text >= 40 && s.opacity === '1',
		`${s.rows} laid-out content elements, overlap ${Math.round(s.overlap)} px, ${s.text} chars, opacity ${s.opacity}`);
	const settled = await t.check(`${tag}: no stuck morph state on the split`, s.morph === null && s.inlinePos === '' && s.inlineOverflow === '' && s.pos === s.restPos,
		`data-o55-morph ${s.morph}, inline position "${s.inlinePos}", inline overflow "${s.inlineOverflow}", position ${s.pos} (at rest ${s.restPos})`);
	const index = await t.check(`${tag}: side index names the open tab, its group anchors live (none stranded in a stale detail)`, s.openTab === m.tab && s.anchors.every((a) => a.found && !a.stranded),
		`open tab ${s.openTab} (want ${m.tab}), ${s.entries} group entries, anchors ${JSON.stringify(s.anchors)}`);
	return right && one && drawn && settled && index;
}

/* ---------- FO-S1b-insp: the Details-inspector twin -------------------------------------------------------------
   populateDetailInspector (kit.d/30-inspector.js) read the current page with ':scope > .o55-insp-page', the same
   gap: mid-morph it matches the .o55-leaving copy, o55Morph removes that copy (its own oldEl), and the arriving
   page is never placed — the panel keeps the first-clicked setting while the row's About button and the state name
   the last-clicked one, with data-o55-morph stuck on .detail-inspector. Its sibling PM51.syncInspector already
   selects ':scope > .o55-insp-page:not(.o55-leaving)'. The panel is an absolute overlay, so once open the rows'
   About buttons are covered; the real clicks that move it are its "Next to it" neighbour buttons. A's About opens
   the panel (General > App & Input), then neighbour B, then neighbour C 55/85/115 ms later (C's box re-read from the
   arriving page so the press lands mid-morph). Asserts: the visible inspector page is C's (its own Setting name),
   one page, no leaving copy, its now-value and title drawn, no stuck morph state. */
const INSP_WS = 'app-input';
const INSP = '#panel-settings .detail-inspector';
const aboutBtn = (f, setting) => f.locator(`${BODY(INSP_WS)} [data-action="setting-details"][data-setting="${setting}"]`).first();
const readAbouts = (f) => f.evaluate((ws) => {
	const body = document.querySelector(`[data-continuous-workspace-body="${ws}"]`);
	const seen = new Set();
	return [...body.querySelectorAll('[data-action="setting-details"][data-setting]')].map((b) => {
		const r = b.getBoundingClientRect();
		return { setting: b.dataset.setting, laid: r.width > 0 && r.height > 0 };
	}).filter((x) => x.laid && x.setting && !seen.has(x.setting) && seen.add(x.setting));
}, INSP_WS);
/* About buttons re-render when the panel opens or closes (the row's aria-expanded flips), so a Playwright
   locator.click waits on a node that keeps being replaced and times out. Press at the button's own centre with the
   mouse instead, scrolling it into view through the page (no actionability wait). boundingBox is window coordinates,
   correct in the sandbox's offset frame too. */
const scrollAbout = (f, setting) => f.evaluate((s) => {
	const b = document.querySelector(`[data-continuous-workspace-body="app-input"] [data-action="setting-details"][data-setting="${s}"]`);
	if (b) b.scrollIntoView({ block: 'center' });
}, setting);
async function clickAbout(t, f, setting) {
	await scrollAbout(f, setting);
	await t.page.waitForTimeout(120);
	const box = await aboutBtn(f, setting).boundingBox();
	if (!box || box.width <= 0) throw new Error(`inspector: About ${setting} has no box on screen`);
	await t.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
	await t.settle();
	await t.page.waitForTimeout(550);
}
/* The panel is an absolute overlay over the document's right edge, so once it is open the rows' own About buttons
   are covered (a press there hits the panel). The real way to move to another setting while it is open is its
   "Next to it" neighbour buttons. The first open is the engine's (head+body directly under .detail-inspector); a
   morph wraps the outgoing content in .o55-insp-page, so a neighbour lives either in the flow .o55-insp-page or,
   before any morph, directly in .detail-body. */
const neighLoc = (f, setting) => f.locator(`${INSP} .o55-insp-page:not(.o55-leaving) .o55-insp-near [data-setting="${setting}"], ${INSP} > .detail-body .o55-insp-near [data-setting="${setting}"]`).first();
const readNeighbours = (f) => f.evaluate((insp) => {
	const el = document.querySelector(insp);
	return el ? [...el.querySelectorAll('.o55-insp-near [data-setting]')].filter((b) => !b.closest('.o55-leaving')).map((b) => b.dataset.setting) : [];
}, INSP);
const inspRestPos = (f) => f.evaluate((insp) => {
	const el = document.querySelector(insp);
	return el ? getComputedStyle(el).position : null;
}, INSP);
/* "Next to it" sits at the foot of the panel body, which scrolls; bring the neighbour into view before measuring,
   else its box is below the fold and the press lands on nothing. Scope to the flow page (never a leaving copy). */
const scrollNeigh = (f, setting) => f.evaluate(([insp, s]) => {
	const el = document.querySelector(insp);
	if (!el) return;
	const flow = [...el.querySelectorAll(':scope > .o55-insp-page')].find((p) => !p.classList.contains('o55-leaving')) || el;
	const b = flow.querySelector(`.o55-insp-near [data-setting="${s}"]`);
	if (b) b.scrollIntoView({ block: 'center' });
}, [INSP, setting]);
/* B is pressed at its settled box in A's page; C's box is re-read from the flow page after the gap, so the press
   lands on C's neighbour where the arriving page actually paints it mid-morph (the neighbour row reflows between
   settings, so a box measured before B would miss). Both are real mouse clicks at the button's own centre. */
async function rapidInsp(t, f, B, C, gap) {
	await scrollNeigh(f, B.setting);
	await t.page.waitForTimeout(120);
	const bb = await neighLoc(f, B.setting).boundingBox();
	if (!bb) throw new Error(`inspector: neighbour ${B.setting} has no box on screen`);
	await f.evaluate(() => { window.__foS1bInspClicks = []; });
	const t0 = Date.now();
	await t.page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
	await t.page.waitForTimeout(gap);
	await scrollNeigh(f, C.setting);
	const cb = await neighLoc(f, C.setting).boundingBox();
	if (!cb) throw new Error(`inspector: neighbour ${C.setting} has no box mid-morph`);
	await t.page.mouse.click(cb.x + cb.width / 2, cb.y + cb.height / 2);
	const landed = Date.now() - t0;
	await t.page.waitForTimeout(800);
	await t.settle();
	const clicks = await f.evaluate(() => window.__foS1bInspClicks);
	return { gap, landed, clicks };
}
const readInspState = (f, restPos) => f.evaluate(([ws, rest]) => {
	const body = document.querySelector(`[data-continuous-workspace-body="${ws}"]`);
	const layout = body && body.closest('.document-layout');
	const insp = layout && layout.querySelector('.detail-inspector');
	if (!insp) return { err: 'no inspector' };
	const pages = [...insp.querySelectorAll(':scope > .o55-insp-page')];
	const flow = pages.find((p) => !p.classList.contains('o55-leaving')) || insp;
	const code = flow && flow.querySelector('.o55-insp-tech code');
	const title = flow ? ((flow.querySelector('.o55-insp-title') || {}).textContent || '').trim() : '';
	const now = flow ? ((flow.querySelector('.o55-insp-now-value') || {}).textContent || '').trim() : '';
	const r = flow ? flow.getBoundingClientRect() : null;
	return {
		pages: pages.length,
		leaving: insp.querySelectorAll('.o55-leaving').length,
		settingId: code ? code.textContent.trim() : '',
		title, now,
		laid: !!(r && r.width > 0 && r.height > 0),
		opacity: flow ? getComputedStyle(flow).opacity : null,
		morph: insp.dataset.o55Morph || null,
		inlinePos: insp.style.position || '', inlineOverflow: insp.style.overflow || '',
		pos: getComputedStyle(insp).position, restPos: rest,
	};
}, [INSP_WS, restPos]);
async function judgeInsp(t, f, B, C, timing, restPos, look) {
	const { gap, landed, clicks } = timing;
	const tag = `inspector ${B.setting}->${C.setting} gap ${gap} ms`;
	const pair = clicks.length >= 2 ? clicks.slice(-2) : [];
	const inPage = pair.length === 2 ? Math.round(pair[1].at - pair[0].at) : null;
	const landed2 = pair.length === 2 && pair[0].setting === B.setting && pair[1].setting === C.setting && pair.every((x) => x.trusted) && inPage > 5 && inPage < 450;
	await t.check(`${tag}: two trusted About clicks landed (sent ${gap} ms apart, ${landed} ms wall)`, landed2,
		`clicks ${JSON.stringify(pair.map((x) => ({ setting: x.setting, trusted: x.trusted })))}, in-page interval ${inPage} ms (must be 5-450 ms)`);
	if (!landed2) return false;
	const got = await paintedRead(f);
	await t.check(`${tag}: still painted ${look}`, lookHeld(look, got), `painted ${got.theme}${got.nier ? ', NieR on' : ''}`);
	const midState = pair[1].leaving > 0 || pair[1].morph != null;
	if (!midState) {
		t.log(`${tag}: rep not judged — the first morph had already settled at click 2 (leaving ${pair[1].leaving}, data-o55-morph ${pair[1].morph}); in-page interval ${inPage} ms`);
		return 'unjudged';
	}
	t.log(`${tag}: mid-morph at click 2 (leaving ${pair[1].leaving}, data-o55-morph ${pair[1].morph}); two trusted clicks ${inPage} ms apart in the page (sent ${gap} ms, wall ${landed} ms)`);
	const s = await readInspState(f, restPos);
	if (s.err) { await t.check(`${tag}: inspector present`, false, s.err); return false; }
	const right = await t.check(`${tag}: visible inspector page is ${C.setting}'s`, s.settingId === C.setting && s.settingId !== B.setting,
		`inspector Setting name "${s.settingId}" (want "${C.setting}", not "${B.setting}"), title "${s.title}"`);
	const one = await t.check(`${tag}: one inspector page, no leaving copy left`, s.pages === 1 && s.leaving === 0, `${s.pages} pages, ${s.leaving} leaving`);
	const drawn = await t.check(`${tag}: the arriving page's content is drawn`, s.laid && s.now.length > 0 && s.title.length > 0 && s.opacity === '1',
		`laid ${s.laid}, now-value "${s.now}", title "${s.title}", opacity ${s.opacity}`);
	const settled = await t.check(`${tag}: no stuck morph state on the inspector`, s.morph === null && s.inlinePos === '' && s.inlineOverflow === '' && s.pos === s.restPos,
		`data-o55-morph ${s.morph}, inline position "${s.inlinePos}", inline overflow "${s.inlineOverflow}", position ${s.pos} (at rest ${s.restPos})`);
	return right && one && drawn && settled;
}

/* ---------- FO-S1b tab-then-item (Astra's second path) ----------------------------------------------------------
   A tab morph marks the whole outgoing .manager-body .o55-leaving, but the .resource-detail inside it is not itself
   leaving, so '.resource-detail:not(.o55-leaving)' still matched the detail in the LEAVING tab body. Clicking an item
   as the new tab body arrives (Toolchain > Formatters, rustfmt) then morphed the wrong detail: the roster selected
   rustfmt while the title stayed Prettier and Edit still targeted prettier. The fix scopes swapDetail to the live
   ':scope > .manager-body:not(.o55-leaving)'. Real clicks: the Formatters tab, then the rustfmt row ~200-290 ms later
   while the tab body is still arriving. Asserts the detail is rustfmt's (title + Edit data-id + roster), its content
   drawn, and no stuck detail or tab morph. --set tigaps= picks the gaps. */
const TI_WS = 'toolchain', TI_TAB = 'formatters', TI_ITEM = 'rustfmt', TI_NAME = 'rustfmt';
const TI_GAPS = [150, 200, 250];
async function rapidTabItem(t, f, gap) {
	const tb = tabBtn(f, TI_WS, TI_TAB);
	await tb.scrollIntoViewIfNeeded();
	const tbox = await tb.boundingBox();
	if (!tbox) throw new Error('toolchain: Formatters tab has no box');
	await f.evaluate(() => { window.__foS2Clicks = window.__foS2Clicks.filter((x) => x.ws !== 'toolchain'); window.__foS1bClicks = window.__foS1bClicks.filter((x) => x.ws !== 'toolchain'); });
	const t0 = Date.now();
	await t.page.mouse.click(tbox.x + tbox.width / 2, tbox.y + tbox.height / 2);
	await t.page.waitForTimeout(gap);
	const ib = f.locator(`${BODY(TI_WS)} .resource-roster .resource-row[data-id="${TI_ITEM}"]`).first();
	const ibox = await ib.boundingBox();
	if (!ibox) throw new Error('toolchain: rustfmt row has no box mid-tab-morph');
	await t.page.mouse.click(ibox.x + ibox.width / 2, ibox.y + ibox.height / 2);
	const landed = Date.now() - t0;
	await t.page.waitForTimeout(900);
	await t.settle();
	const tabClicks = await f.evaluate(() => window.__foS2Clicks.filter((x) => x.ws === 'toolchain' && x.tab === 'formatters'));
	const itemClicks = await f.evaluate(() => window.__foS1bClicks.filter((x) => x.ws === 'toolchain'));
	return { gap, landed, tabClicks, itemClicks };
}
async function judgeTabItem(t, f, timing, restPos, look) {
	const { gap, landed, tabClicks, itemClicks } = timing;
	const tag = `toolchain formatters->rustfmt gap ${gap} ms`;
	const tc = tabClicks.length ? tabClicks[tabClicks.length - 1] : null;
	const ic = itemClicks.length ? itemClicks[itemClicks.length - 1] : null;
	const inPage = tc && ic ? Math.round(ic.at - tc.at) : null;
	const landed2 = !!tc && !!ic && tc.trusted && ic.trusted && ic.id === TI_ITEM && inPage > 5;
	await t.check(`${tag}: trusted tab then item clicks landed (sent ${gap} ms apart, ${landed} ms wall)`, landed2,
		`tab ${tc && tc.tab} trusted ${tc && tc.trusted}, item ${ic && ic.id} trusted ${ic && ic.trusted}, in-page ${inPage} ms`);
	if (!landed2) return false;
	const got = await paintedRead(f);
	await t.check(`${tag}: still painted ${look}`, lookHeld(look, got), `painted ${got.theme}${got.nier ? ', NieR on' : ''}`);
	const midState = (ic.tabLeaving > 0 || ic.tabMorph != null) && inPage < 450;
	if (!midState) {
		t.log(`${tag}: rep not judged — the tab morph had settled at the item click (tabLeaving ${ic.tabLeaving}, tabMorph ${ic.tabMorph}); in-page ${inPage} ms`);
		return 'unjudged';
	}
	t.log(`${tag}: mid-tab-morph at item click (tabLeaving ${ic.tabLeaving}, tabMorph ${ic.tabMorph}); in-page ${inPage} ms`);
	const s = await readDetailState(f, { ws: TI_WS }, restPos);
	if (s.err) { await t.check(`${tag}: manager page present`, false, s.err); return false; }
	const extra = await f.evaluate((ws) => {
		const body = document.querySelector(`[data-continuous-workspace-body="${ws}"]`);
		const page = body && body.querySelector('.pm51-mgr');
		const split = page && [...page.querySelectorAll('.pm51-split')].find((el) => !el.closest('.o55-leaving'));
		const flow = split && [...split.querySelectorAll(':scope > .resource-detail')].find((d) => !d.classList.contains('o55-leaving'));
		const btn = flow && flow.querySelector('[data-action="pm51-toolchain-edit-fmt"]');
		return { editId: btn ? btn.dataset.id : null, pageMorph: page ? (page.dataset.o55Morph || null) : null, tabLeaving: page ? page.querySelectorAll(':scope > .manager-body.o55-leaving').length : 0 };
	}, TI_WS);
	const right = await t.check(`${tag}: detail is rustfmt's (title, Edit target, roster)`, s.title.startsWith(TI_NAME) && extra.editId === TI_ITEM && s.active.join(',') === TI_ITEM,
		`title "${s.title}" (want rustfmt), Edit data-id ${extra.editId}, roster active [${s.active.join(',')}]`);
	const one = await t.check(`${tag}: one detail, no leaving copy left`, s.details === 1 && s.leaving === 0 && extra.tabLeaving === 0, `${s.details} details, ${s.leaving} leaving, ${extra.tabLeaving} tab bodies leaving`);
	const drawn = await t.check(`${tag}: rustfmt's detail content is drawn`, s.rows >= 3 && s.overlap >= 100 && s.text >= 40 && s.opacity === '1',
		`${s.rows} content els, overlap ${Math.round(s.overlap)} px, ${s.text} chars, opacity ${s.opacity}`);
	const settled = await t.check(`${tag}: no stuck detail or tab morph`, s.morph === null && extra.pageMorph === null && s.inlinePos === '' && s.inlineOverflow === '' && s.pos === s.restPos,
		`split morph ${s.morph}, page morph ${extra.pageMorph}, inline pos "${s.inlinePos}", pos ${s.pos} (rest ${s.restPos})`);
	return right && one && drawn && settled;
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
				await t.app.look(t, look, { save: true });
				for (const m of MANAGERS) {
					await go(t, f, m.domain, m.ws);
					await slowTab(t, f, m.ws, m.start);
					let ok = true, judged = 0, failCropped = false, passCropped = false;
					for (const gap of gaps(t)) {
						const timing = await rapid(t, f, m, gap);
						const r = await judge(t, f, m, timing, look);
						if (r !== 'unjudged') { judged++; ok = r && ok; }
						if (r === false && !failCropped) {
							failCropped = true;
							await t.crop(`${m.ws}-after-midmorph`, f.locator(`${BODY(m.ws)} .pm51-mgr`), 'the manager right after the rapid B then C clicks: which body is on screen');
						}
						if (r === true && !passCropped && look === 'basic-dark' && w === 1440 && surface === 'normal' && m.ws === 'notifications') {
							passCropped = true;
							await t.crop('notifications-after-midmorph', f.locator(`${BODY(m.ws)} .pm51-mgr`), 'the last-clicked tab body, fully drawn, right after the rapid clicks');
						}
						await slowTab(t, f, m.ws, m.start);
					}
					await t.check(`${m.ws}: at least one rep landed mid-morph`, judged > 0, `${judged} of ${gaps(t).length} reps judged mid-morph by the host's state at click 2`);
				}
			});
		}
	}

	T('FO-S2 mid-morph tab click under Reduced Motion — basic-dark 1440x900', async (t) => {
		await t.emulate({ reducedMotion: 'reduce' });
		const f = await settings(t, surface, [1440, 900]);
		await t.app.look(t, 'basic-dark', { save: true });
		await t.check('the page reads Reduced Motion', await f.evaluate(() => O55.motion.reduced()));
		for (const m of MANAGERS) {
			await go(t, f, m.domain, m.ws);
			await slowTab(t, f, m.ws, m.start);
			for (const gap of gaps(t)) {
				const timing = await rapid(t, f, m, gap);
				await judge(t, f, m, timing, 'basic-dark', true);
				await slowTab(t, f, m.ws, m.start);
			}
		}
		await t.emulate({ reducedMotion: 'no-preference' });
	});

	for (const look of LOOKS) {
		T(`FO-S1b mid-morph item click keeps the arriving detail — ${look} 1440x900`, async (t) => {
			if (!looks(t).includes(look)) { await t.check(`${look} not asked for`, true); return; }
			const dws = String(t.args.dws || DETAIL_MANAGERS.map((m) => m.ws).join(',')).split(',').map((x) => x.trim()).filter(Boolean);
			const f = await settings(t, surface, [1440, 900]);
			await t.app.look(t, look, { save: true });
			for (const m of DETAIL_MANAGERS) {
				if (!dws.includes(m.ws)) continue;
				await go(t, f, m.domain, m.ws);
				await slowTab(t, f, m.ws, m.tab);
				const rows = await readRoster(f, m.ws);
				if (rows.length < 2) { await t.check(`${m.ws}: roster has two or more items`, false, `${rows.length} laid-out rows`); continue; }
				const B = rows[1], C = rows[2] || rows[0];
				await slowRow(t, f, m.ws, rows[0].id);
				let ok = true, judged = 0, failCropped = false, passCropped = false;
				for (const gap of gaps(t)) {
					const restPos = await readRestPos(f, m.ws);
					const timing = await rapidRows(t, f, m.ws, B, C, gap);
					const r = await judgeDetail(t, f, m, B, C, timing, restPos, look);
					if (r !== 'unjudged') { judged++; ok = r && ok; }
					if (r === false && !failCropped) {
						failCropped = true;
						await t.crop(`${m.ws}-after-detail-midmorph`, f.locator(`${BODY(m.ws)} .pm51-split`), 'the split right after the rapid item B then C clicks: which detail is on screen');
					}
					if (r === true && !passCropped && look === 'basic-dark' && surface === 'normal' && m.ws === 'personas') {
						passCropped = true;
						await t.crop('personas-after-detail-midmorph', f.locator(`${BODY(m.ws)} .pm51-split`), 'the last-clicked item detail, fully drawn, right after the rapid clicks');
					}
					await slowRow(t, f, m.ws, rows[0].id);
				}
				await t.check(`${m.ws}: at least one rep landed mid-morph`, judged > 0, `${judged} of ${gaps(t).length} reps judged mid-morph by the split's state at click 2`);
			}
		});
	}

	for (const look of LOOKS) {
		T(`FO-S1b-insp mid-morph About click keeps the arriving inspector page — ${look} 1440x900`, async (t) => {
			if (!looks(t).includes(look)) { await t.check(`${look} not asked for`, true); return; }
			const f = await settings(t, surface, [1440, 900]);
			await t.app.look(t, look, { save: true });
			await go(t, f, 'general', INSP_WS);
			const btns = await readAbouts(f);
			if (btns.length < 1) { await t.check('app-input shows an About button', false, `${btns.length} laid-out About buttons`); return; }
			const A = btns[0];
			await clickAbout(t, f, A.setting);
			const open = await f.evaluate((insp) => {
				const el = document.querySelector(insp);
				return !!(el && el.getBoundingClientRect().width > 0);
			}, INSP);
			await t.check(`About ${A.setting} opens the Details panel`, open, 'the inspector has a box after the first About click');
			const neigh = await readNeighbours(f);
			if (neigh.length < 2) { await t.check(`${A.setting} lists two Next-to-it neighbours`, false, `${neigh.length} neighbours`); return; }
			const B = { setting: neigh[0] }, C = { setting: neigh[1] };
			let ok = true, judged = 0, failCropped = false, passCropped = false;
			for (const gap of gaps(t)) {
				/* reset to A: close the panel (its own X), then reopen A from the now-uncovered document row */
				const xb = await f.locator(`${INSP} [data-action="close-details"]`).first().boundingBox();
				if (xb) { await t.page.mouse.click(xb.x + xb.width / 2, xb.y + xb.height / 2); await t.settle(); await t.page.waitForTimeout(350); }
				await clickAbout(t, f, A.setting);
				/* let the panel's open spring land before the rapid pair, so the neighbour boxes are at rest */
				await f.waitForSelector(`${INSP}.is-open.is-settled`, { timeout: 8000 }).catch(() => {});
				const restPos = await inspRestPos(f);
				const timing = await rapidInsp(t, f, B, C, gap);
				const r = await judgeInsp(t, f, B, C, timing, restPos, look);
				if (r !== 'unjudged') { judged++; ok = r && ok; }
				if (r === false && !failCropped) {
					failCropped = true;
					await t.crop('inspector-after-midmorph', f.locator('.detail-inspector'), 'the Details panel right after the rapid neighbour B then C clicks: which setting is on screen');
				}
				if (r === true && !passCropped && look === 'basic-dark' && surface === 'normal') {
					passCropped = true;
					await t.crop('inspector-after-midmorph-pass', f.locator('.detail-inspector'), 'the last-clicked setting inspector page, fully drawn, right after the rapid neighbour clicks');
				}
			}
			await t.check('inspector: at least one rep landed mid-morph', judged > 0, `${judged} of ${gaps(t).length} reps judged mid-morph by the inspector's state at click 2`);
		});
	}

	for (const look of LOOKS) {
		T(`FO-S1b tab-then-item click keeps the arriving detail — ${look} 1440x900`, async (t) => {
			if (!looks(t).includes(look)) { await t.check(`${look} not asked for`, true); return; }
			const f = await settings(t, surface, [1440, 900]);
			await t.app.look(t, look, { save: true });
			await go(t, f, 'code', TI_WS);
			await slowTab(t, f, TI_WS, 'servers');
			const tiGaps = String(t.args.tigaps || TI_GAPS.join(',')).split(',').map((x) => parseInt(x, 10)).filter((x) => x > 0);
			let ok = true, judged = 0, failCropped = false, passCropped = false;
			for (const gap of tiGaps) {
				await slowTab(t, f, TI_WS, 'servers');
				const restPos = await readRestPos(f, TI_WS);
				const timing = await rapidTabItem(t, f, gap);
				const r = await judgeTabItem(t, f, timing, restPos, look);
				if (r !== 'unjudged') { judged++; ok = r && ok; }
				if (r === false && !failCropped) {
					failCropped = true;
					await t.crop('toolchain-after-tab-then-item', f.locator(`${BODY(TI_WS)} .pm51-split`), 'the Formatters split right after the Formatters-tab then rustfmt clicks: which detail is on screen');
				}
				if (r === true && !passCropped && look === 'basic-dark' && surface === 'normal') {
					passCropped = true;
					await t.crop('toolchain-after-tab-then-item-pass', f.locator(`${BODY(TI_WS)} .pm51-split`), 'rustfmt detail, fully drawn, right after the tab then item clicks');
				}
			}
			await t.check('toolchain: at least one rep landed mid-tab-morph', judged > 0, `${judged} of ${tiGaps.length} reps judged mid-tab-morph by the page's state at the item click`);
		});
	}
}
