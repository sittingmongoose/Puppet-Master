// Jared's Settings review, 2026-11-21 (on the landed concept page, again): "When you scroll in settings, the highlight on
// the submenu doesnt work properly ... This is still not fixed!", his Nov 20 picture being Media & Output › Abilities with
// "For the whole project" lit; and, of the 1 px line right of the side index, "This line needs to be removed. on the themes
// where it is there" (not in Glass).
// Stream P's repro on main b3a0ccaa74 (plain PMConcept7 and the concept page alike, 1440x900, T3's sandbox and normal):
// - kit.d/22-index.js pm51AdoptAnchors put the "Media abilities" entry (media-abilities, a group Media & Output draws
//   itself: PM51.page owns) on the card of its first drawn row, the Defaults card inside the shown ability's details,
//   ~750-900 px below the top of the abilities list, so "For the whole project" stayed lit while the list filled the
//   screen. settings-index-spy passed: it reads "the section in view" from the same adopted anchors.
// - Round 2 (Neon's batch 16 deep review, neon-max-16, on 1367b816c4): with Media abilities moved onto the list/detail
//   block, the Defaults card it freed was adopted by "Where results go" (media-files, a group of the Pictures & files
//   tab) because its "Saves to" row is drawn there; pm51AdoptAnchors walked every group of the page, not the open tab's,
//   so "Where results go" lit for the last ~335 px of the list and was listed under Abilities. Clicking it there set the
//   tab to Pictures & files without redrawing the page (the adopted anchor counted as "drawn"), so the page stayed on
//   Abilities while the index opened Pictures & files; Providers & Accounts › Services listed "Moving between accounts"
//   (Limits & switching) the same way. The walk now wants Media abilities lit for the whole list, and a click on any entry
//   under an open tab must leave the page and the index on that tab.
// - Round 3 (neon-p-recheck-r2 F1, on dc227633a8): Settings Search to another tab redraws the page in place and kept
//   the old tab's adopted anchors on the reused cards (Commands listed Keyboard shortcuts; Events listed Notifications);
//   the search tests compare the new tab's entries with those it lists when opened from the index.
// - Reached by the top tabs (Media & Output, then its Abilities tab), Abilities listed no entries at all: the tab redraw
//   morphs the page body, the leaving copy still held the adopted anchors, so the arriving copy got none.
// - FO-S1 (batch 18, two reviewers on main 804031ee16): selecting another item in Personas, Goals > Templates,
//   History > Sessions or Servers swaps the detail (kit.d/20-motion.js PM51.swapDetail) without telling the index:
//   the leaving copy took the detail groups' adopted anchors with it, the highlight stalled on "Your personas" or
//   the tab caption instead of the group being read, and Sessions kept listing "Session details" while the new
//   detail's More options was closed. The FO-S1 rows at the end fail on that base and pass once the swap resyncs
//   the index through the same adoption path (pm51AdoptAnchors / PM51.syncIndex).
// - pm4-settings-css.css gave .page-index a 1 px right border: drawn in Basic, Friendly, Retro and NieR, both modes.
// - liquid-glass glass.css coloured the lit entry under an open tab with --pm-switch-ink-on, the ink for words on the
//   switcher's chip, while drawing no chip there: 1.0-1.3:1 in Basic, Friendly Dark, Retro and NieR (a bare dot).
// The walk here is judged from the manager's own markup (the "For the whole project" card, .o55-media-switches, and the
// list/detail block, .pm51-split) and the index entries' labels, never from data-section-id anchors.
//   browser-check run Concepts/pm7-tools/browser-check/checks/settings-index-anchors.check.mjs --set page=<build>
// --set size=1440x900 and --set step=120 change the walk; --sandbox runs it in T3's preview frame.
import { LOOKS } from '../browser-check.config.mjs';

const READ = () => {
	const sc = document.querySelector('#settings-document');
	if (!sc) return null;
	const b = sc.getBoundingClientRect();
	let readTop = b.top;
	for (const s of document.querySelectorAll('#settings-document .pm51-mgr.has-manager-tabs > .pm51-tabs')) {
		if (!s.checkVisibility()) continue;
		const r = s.getBoundingClientRect();
		if (r.top <= b.top + 2 && r.bottom > b.top) readTop = Math.max(readTop, r.bottom);
	}
	const line = readTop + 30;
	const body = document.querySelector('[data-continuous-workspace-body="media"]');
	const live = (sel) => body && [...body.querySelectorAll(sel)].find((el) => !el.closest('.o55-leaving') && el.getClientRects().length);
	const sw = live('.o55-media-switches'), sp = live('.pm51-split');
	const rs = sw && sw.getBoundingClientRect(), rp = sp && sp.getBoundingClientRect();
	let reading = null;
	if (rs && rs.top <= line - 40 && rs.bottom >= line + 40) reading = 'switches';
	else if (rp && rp.top <= line - 40 && rp.bottom >= line + 40) reading = 'list';
	const lit = [...document.querySelectorAll('#pm-settings-root .page-index-card .index-link.is-active')].map((l) => l.textContent.trim());
	const max = sc.scrollHeight - sc.clientHeight;
	return { top: Math.round(sc.scrollTop), atEnd: sc.scrollTop >= max - 2, reading, lit, past: !!rp && rp.bottom < line, mid: { x: b.left + b.width / 2, y: b.top + b.height * 0.6 } };
};
const ENTRIES = () => {
	const tab = document.querySelector('#pm-settings-root .page-index-card .pm51-index-tab.is-open[data-workspace="media"][data-tab="abilities"]');
	const sub = tab && tab.nextElementSibling && tab.nextElementSibling.classList.contains('pm51-index-sub') ? tab.nextElementSibling : null;
	return { open: !!tab, entries: sub ? [...sub.querySelectorAll('.index-link')].map((l) => l.textContent.trim()) : [] };
};

async function still(t, f) {
	let prev = -2;
	for (let k = 0; k < 30; k++) { await t.page.waitForTimeout(60); const now = await f.evaluate(() => (document.querySelector('#settings-document') || {}).scrollTop); if (Math.abs(now - prev) < 0.5) break; prev = now; }
	await f.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 60)))));
}
async function wheelPoint(t, f, mid) {
	const frame = f === t.page.mainFrame() ? null : await f.frameElement();
	const box = frame && await frame.boundingBox();
	await t.page.mouse.move(mid.x + (box?.x ?? 0), mid.y + (box?.y ?? 0));
}
async function openAbilities(t, route) {
	const [w, h] = String(t.args.size || '1440x900').split('x').map(Number);
	const f = await t.app.open();
	await t.emulate({ reducedMotion: 'no-preference' });
	await t.viewport(w, h);
	await f.locator('#tab-settings').click();
	await t.settle();
	await f.locator('#pm-settings-root [data-action="navigate-domain"][data-domain="ai"]:visible').first().click();
	await t.settle();
	if (route === 'top tabs') {
		await f.locator('#pm-settings-root .workspace-tabs [data-workspace="media"]:visible').first().click();
		await t.settle();
		await f.locator('#pm-settings-root [data-workspace-block="media"] .pm51-tabs [data-tab="abilities"]:visible').first().click();
	} else {
		await f.locator('#pm-settings-root .page-index-card .pm51-index-tab[data-workspace="media"][data-tab="abilities"]:visible').first().click();
	}
	await t.settle();
	await t.page.waitForTimeout(700);
	await still(t, f);
	return f;
}

/* A click on an entry under an open tab: where the page and the index are afterwards. */
const AFTER = (ws) => {
	const card = document.querySelector('#pm-settings-root .page-index-card');
	const open = card && card.querySelector(`.pm51-index-tab.is-open[data-workspace="${ws}"]`);
	const body = document.querySelector(`[data-continuous-workspace-body="${ws}"]`);
	const pageTab = body && [...body.querySelectorAll('.pm51-mgr > .pm51-tabs .manager-tab.active')].find((b) => !b.closest('.o55-leaving'));
	return { indexTab: open ? open.dataset.tab : null, pageTab: pageTab ? pageTab.dataset.tab : null, lit: card ? [...card.querySelectorAll('.index-link.is-active')].map((l) => l.textContent.trim()) : [] };
};
const SUB = ([ws, tab]) => {
	const el = document.querySelector(`#pm-settings-root .page-index-card .pm51-index-tab.is-open[data-workspace="${ws}"][data-tab="${tab}"]`);
	const sub = el && el.nextElementSibling && el.nextElementSibling.classList.contains('pm51-index-sub') ? el.nextElementSibling : null;
	return sub ? [...sub.querySelectorAll('.index-link')].map((l) => l.textContent.trim()) : [];
};
async function openTab(t, f, ws, tab) {
	await f.locator(`#pm-settings-root .page-index-card .pm51-index-tab[data-workspace="${ws}"][data-tab="${tab}"]:visible`).first().click();
	await t.settle();
	await t.page.waitForTimeout(500);
	await still(t, f);
}
const TABBED = { media: ['abilities', 'files'], providers: ['services', 'models', 'limits', 'usage'] };
/* Settings Search to a setting on another tab redraws the page in place (PM51.refresh, 28-in-place.js), unlike a tab
   click (PM51.switchTab, a fresh body): neon-p-recheck-r2 F1 found the old tab's adopted anchors kept on the reused
   cards, listed under the new tab, and a click on one sending the page back to the old tab. */
const SEARCHES = [
	{ domain: 'code', ws: 'commands', from: 'shortcuts', to: 'commands', query: 'Custom Slash Commands' },
	{ domain: 'general', ws: 'notifications', from: 'destinations', to: 'events', query: 'Alert Me About' }
];
async function openDomain(t, domain) {
	const [w, h] = String(t.args.size || '1440x900').split('x').map(Number);
	const f = await t.app.open();
	await t.emulate({ reducedMotion: 'no-preference' });
	await t.viewport(w, h);
	await f.locator('#tab-settings').click();
	await t.settle();
	await f.locator(`#pm-settings-root [data-action="navigate-domain"][data-domain="${domain}"]:visible`).first().click();
	await t.settle();
	return f;
}
async function searchJump(t, f, query) {
	const input = f.locator('#pm-settings-root [data-global-search]:visible').first();
	await input.click();
	await input.fill('');
	await input.type(query, { delay: 15 });
	/* the best match (titles are the row's words, not the query); the list opens in the app's portal, outside #pm-settings-root */
	const hit = f.locator('.search-results[data-mode="rail"] .search-result').first();
	await hit.waitFor({ state: 'visible', timeout: 5000 });
	await hit.click();
	await t.settle();
	await t.page.waitForTimeout(900);
	await still(t, f);
}

/* FO-S1: the index after a detail swap. Judged from the manager's own cards and rows (the group card being read,
   the template's kind row) and from which index entry is lit under the open tab, never from adopted anchors. */
const SWAP_VIEW = (ws) => {
	const sc = document.querySelector('#settings-document');
	if (!sc) return null;
	const b = sc.getBoundingClientRect();
	let readTop = b.top;
	for (const s of document.querySelectorAll('#settings-document .pm51-mgr.has-manager-tabs > .pm51-tabs')) {
		if (!s.checkVisibility()) continue;
		const r = s.getBoundingClientRect();
		if (r.top <= b.top + 2 && r.bottom > b.top) readTop = Math.max(readTop, r.bottom);
	}
	const line = readTop + 30;
	const body = document.querySelector(`[data-continuous-workspace-body="${ws}"]`);
	const live = (el) => el && !el.closest('.o55-leaving');
	const detail = body && [...body.querySelectorAll('.resource-detail')].find((el) => live(el) && el.getClientRects().length);
	const dr = detail && detail.getBoundingClientRect();
	const shown = (el) => el.getClientRects().length > 0 && !el.closest('details:not([open]), [hidden], [inert]');
	const cards = detail ? [...detail.querySelectorAll('.pm51-section')].filter((c) => live(c) && shown(c)).map((c) => {
		const head = c.querySelector(':scope > .pm51-section-head .pm51-section-title, :scope h3');
		const r = c.getBoundingClientRect();
		return { title: head ? head.textContent.trim() : '?', top: r.top, bottom: r.bottom };
	}) : [];
	const kindRow = detail && detail.querySelector('[data-setting-id="planning.verification.goal-template"]');
	const kr = kindRow && kindRow.getBoundingClientRect();
	const adv = detail && detail.querySelector('details.pm51-advanced');
	const tab = document.querySelector(`#pm-settings-root .page-index-card .pm51-index-tab.is-open[data-workspace="${ws}"]`);
	const sub = tab && tab.nextElementSibling && tab.nextElementSibling.classList.contains('pm51-index-sub') ? tab.nextElementSibling : null;
	const entries = sub ? [...sub.querySelectorAll('.index-link')].map((l) => l.textContent.trim()) : [];
	const litSub = sub ? [...sub.querySelectorAll('.index-link.is-active')].map((l) => l.textContent.trim()) : [];
	const litTab = !!(tab && tab.classList.contains('is-active'));
	const lit = [...document.querySelectorAll('#pm-settings-root .page-index-card .index-link.is-active')].map((l) => `${l.dataset.workspace}:${l.textContent.trim()}`);
	const activeRow = body && [...body.querySelectorAll('.resource-roster .resource-row')].find((r) => live(r) && r.classList.contains('active'));
	const max = sc.scrollHeight - sc.clientHeight;
	return {
		top: Math.round(sc.scrollTop), atEnd: sc.scrollTop >= max - 2, line,
		detail: dr ? { top: dr.top, bottom: dr.bottom } : null,
		detailTitle: detail ? (detail.querySelector('.pm51-detail-title') || {}).textContent : null,
		activeRow: activeRow ? (activeRow.querySelector('.resource-row-name') || {}).textContent : null,
		cards, kindTop: kr ? kr.top : null, advOpen: adv ? adv.open : null,
		entries, litSub, litTab, lit,
		mid: { x: b.left + b.width / 2, y: b.top + b.height * 0.6 }
	};
};
const SWAP_MGRS = [
	{
		ws: 'personas', domain: 'memory', tab: null, minJudged: 4,
		groups: ['Your personas', 'About this persona', 'How it answers', 'Model and cost', 'Tools and instructions'],
		want: (v) => {
			const map = { 'About': 'About this persona', 'How it answers': 'How it answers', 'Model and cost': 'Model and cost', 'Tools and instructions': 'Tools and instructions' };
			const card = v.cards.filter((c) => map[c.title]).find((c) => c.top + 40 <= v.line && v.line <= c.bottom - 40);
			return card ? map[card.title] : null;
		}
	},
	{
		ws: 'goals', domain: 'memory', tab: 'templates', minJudged: 2,
		groups: ['Kind of job'],
		want: (v) => (v.kindTop !== null && v.detail && v.kindTop + 40 <= v.line && v.line <= v.detail.bottom ? 'Kind of job' : null)
	},
	{
		ws: 'project-history', domain: 'projects', tab: 'sessions', advanced: true, minJudged: 1,
		groups: ['Session details'],
		want: (v) => {
			const card = v.cards.find((c) => c.title === 'Technical details');
			return card && card.top + 40 <= v.line && v.line <= card.bottom - 40 ? 'Session details' : null;
		}
	},
	{
		ws: 'servers', domain: 'system', tab: 'servers', minJudged: 2,
		groups: ['Servers', 'SSH computers', 'SSH keys', 'Setting up tools on servers'],
		want: (v) => {
			const card = v.cards.find((c) => c.title === 'Details');
			return card && v.detail && card.top + 40 <= v.line && v.line <= Math.min(card.bottom - 40, v.detail.bottom) ? 'Servers' : null;
		}
	}
];
const FO_S1_ROWS = SWAP_MGRS.map((m) => [`FO-S1 ${m.ws}${m.tab ? ' > ' + m.tab : ''} keeps the index on the new detail's groups after a swap`, async (t) => {
	const [w, h] = String(t.args.size || '1440x900').split('x').map(Number);
	const step = Number(t.args.step || 90);
	const f = await t.app.open();
	await t.emulate({ reducedMotion: 'no-preference' });
	await t.viewport(w, h);
	await f.locator('#tab-settings').click();
	await t.settle();
	await f.locator(`#pm-settings-root [data-action="navigate-domain"][data-domain="${m.domain}"]:visible`).first().click();
	await t.settle();
	await f.locator(`#pm-settings-root .workspace-tabs [data-workspace="${m.ws}"]:visible`).first().click();
	await t.settle();
	if (m.tab) {
		await f.locator(`#pm-settings-root [data-workspace-block="${m.ws}"] .pm51-tabs [data-tab="${m.tab}"]:visible`).first().click();
		await t.settle();
		await t.page.waitForTimeout(700);
		await still(t, f);
	}
	const detailSel = `#pm-settings-root [data-workspace-block="${m.ws}"] .resource-detail:not(.o55-leaving)`;
	if (m.advanced) {
		await f.locator(`${detailSel} details.pm51-advanced > summary`).first().click();
		await t.page.waitForTimeout(700);
		await still(t, f);
	}
	const v0 = await f.evaluate(SWAP_VIEW, m.ws);
	await t.check('the manager draws its list and detail, and the index lists the detail\'s groups', !!v0 && !!v0.detail && v0.entries.length > 0, JSON.stringify(v0 && { entries: v0.entries, detail: v0.detailTitle }));
	if (!v0 || !v0.detail) return;
	/* wheel into the detail, so the swap happens mid-read, as a reader does */
	await f.evaluate((ws) => {
		const sc = document.querySelector('#settings-document');
		const body = document.querySelector(`[data-continuous-workspace-body="${ws}"]`);
		const detail = body && [...body.querySelectorAll('.resource-detail')].find((el) => !el.closest('.o55-leaving'));
		if (sc && detail) sc.scrollTo({ top: sc.scrollTop + detail.getBoundingClientRect().top - sc.getBoundingClientRect().top - 60, behavior: 'instant' });
	}, m.ws);
	await t.page.waitForTimeout(600);
	await still(t, f);
	const vIn = await f.evaluate(SWAP_VIEW, m.ws);
	await wheelPoint(t, f, vIn.mid);
	for (let i = 0; i < 2; i++) { await t.page.mouse.wheel(0, step); await still(t, f); }
	/* select the second item with a real click */
	await f.locator(`#pm-settings-root [data-workspace-block="${m.ws}"] .resource-roster .resource-row:not(.o55-leaving)`).nth(1).click();
	await t.page.waitForTimeout(800);
	await still(t, f);
	const v1 = await f.evaluate(SWAP_VIEW, m.ws);
	t.log(`swap: ${v0.detailTitle} -> ${v1.detailTitle}; entries ${JSON.stringify(v1.entries)}; lit ${JSON.stringify(v1.lit)}; More options open: ${v1.advOpen}`);
	await t.check('the second item is selected and its detail is drawn', !!v1.detail && v1.detailTitle !== v0.detailTitle && v1.activeRow !== null, JSON.stringify({ title: v1.detailTitle, row: v1.activeRow }));
	if (m.advanced) {
		await t.check('after the swap the index does not list the group hidden in the new detail\'s closed More options', v1.advOpen === false && !v1.entries.includes('Session details'), `More options open: ${v1.advOpen}, entries ${JSON.stringify(v1.entries)}`);
		await f.locator(`${detailSel} details.pm51-advanced > summary`).first().click();
		await t.page.waitForTimeout(700);
		await still(t, f);
	}
	/* walk from the chapter top down through the new detail */
	await f.evaluate(() => { const sc = document.querySelector('#settings-document'); if (sc) sc.scrollTo({ top: 0, behavior: 'instant' }); });
	await t.page.waitForTimeout(800);
	await still(t, f);
	const vTop = await f.evaluate(SWAP_VIEW, m.ws);
	await wheelPoint(t, f, vTop.mid);
	let judged = 0; const wrong = []; let last = -1, n = 0;
	for (n = 0; n < 200; n++) {
		await t.page.mouse.wheel(0, step);
		await still(t, f);
		const v = await f.evaluate(SWAP_VIEW, m.ws);
		const want = v.detail ? m.want(v) : null;
		if (want) {
			judged++;
			if (!v.litSub.includes(want)) wrong.push(`${v.top}px: lit ${v.lit.join(',') || 'none'}${v.litTab ? ' (tab caption)' : ''}, reading ${want}`);
		}
		if (v.atEnd || v.top === last || (v.detail && v.detail.bottom < v.line - 300)) break;
		last = v.top;
	}
	const vEnd = await f.evaluate(SWAP_VIEW, m.ws);
	t.log(`walk: ${n + 1} steps of ${step}px, ${judged} judged; end entries ${JSON.stringify(vEnd.entries)}`);
	await t.check(`the walk read the new detail's groups (${judged} judged steps)`, judged >= m.minJudged, `${judged} judged`);
	await t.check('every judged step lights the group entry being read, under the open tab', wrong.length === 0, wrong.slice(0, 6).join(' | ') + (wrong.length > 6 ? ` and ${wrong.length - 6} more` : ''));
	const missing = m.groups.filter((g) => !vEnd.entries.includes(g));
	await t.check(`the index lists the new detail's groups (${m.groups.join(', ')})`, missing.length === 0, `missing ${JSON.stringify(missing)}; listed ${JSON.stringify(vEnd.entries)}`);
}]);

const ROUTES = ['top tabs', 'side index'];
export const tests = Object.fromEntries(ROUTES.flatMap((route) => [
	[`Jared 2026-11-21 Media › Abilities lists its groups, reached by the ${route}`, async (t) => {
		const f = await openAbilities(t, route);
		const e = await f.evaluate(ENTRIES);
		await t.check(`Abilities is the open tab entry and lists For the whole project and Media abilities (${route})`,
			e.open && e.entries.includes('For the whole project') && e.entries.includes('Media abilities'), JSON.stringify(e));
	}],
	[`Jared 2026-11-21 Media › Abilities lights the card being read, reached by the ${route}`, async (t) => {
		const f = await openAbilities(t, route);
		const step = Number(t.args.step || 120);
		const v0 = await f.evaluate(READ);
		await t.check('the Settings page is drawn', !!v0, 'no #settings-document');
		if (!v0) return;
		await wheelPoint(t, f, v0.mid);
		const want = { switches: ['For the whole project'], list: ['Media abilities'] };
		const judged = { switches: 0, list: 0 }, wrong = [];
		let last = -1, n = 0;
		for (n = 0; n < 60; n++) {
			await t.page.mouse.wheel(0, step);
			await still(t, f);
			const v = await f.evaluate(READ);
			if (v.reading) {
				judged[v.reading]++;
				if (!v.lit.some((l) => want[v.reading].includes(l))) wrong.push(`${v.top}px reading ${v.reading}: lit ${v.lit.join(',') || 'none'}`);
			}
			if (v.past || v.atEnd || v.top === last) break;
			last = v.top;
		}
		t.log(`walk (${route}): ${n + 1} steps of ${step} px; judged ${JSON.stringify(judged)}`);
		await t.check(`the walk read the For the whole project card and the list (${route})`, judged.switches >= 1 && judged.list >= 2, JSON.stringify(judged));
		await t.check(`every judged step lights the card being read (${route}): For the whole project on its card, Media abilities on the whole list`, wrong.length === 0, wrong.slice(0, 6).join(' | ') + (wrong.length > 6 ? ` and ${wrong.length - 6} more` : ''));
	}]
]).concat(Object.entries(TABBED).map(([ws, tabs]) => [`Neon 2026-11-22 a click on an entry under an open tab of ${ws} keeps the page and the index on that tab`, async (t) => {
	const [w, h] = String(t.args.size || '1440x900').split('x').map(Number);
	const f = await t.app.open();
	await t.emulate({ reducedMotion: 'no-preference' });
	await t.viewport(w, h);
	await f.locator('#tab-settings').click();
	await t.settle();
	await f.locator('#pm-settings-root [data-action="navigate-domain"][data-domain="ai"]:visible').first().click();
	await t.settle();
	const bad = [], seen = [];
	for (const tab of tabs) {
		await openTab(t, f, ws, tab);
		const list = await f.evaluate(SUB, [ws, tab]);
		seen.push(`${tab}: ${list.join(', ') || 'none'}`);
		if (!list.length) bad.push(`${tab}: lists no entries`);
		for (const label of list) {
			await openTab(t, f, ws, tab);
			const link = f.locator(`#pm-settings-root .page-index-card .pm51-index-tab.is-open[data-workspace="${ws}"][data-tab="${tab}"] + .pm51-index-sub .index-link`, { hasText: label }).first();
			if (!(await link.count())) { bad.push(`${tab}: "${label}" gone before its click`); continue; }
			await link.click();
			await t.page.waitForTimeout(900);
			await still(t, f);
			const a = await f.evaluate(AFTER, ws);
			if (a.pageTab !== tab || a.indexTab !== tab) bad.push(`${tab} > "${label}": page on ${a.pageTab}, index open on ${a.indexTab}`);
			else if (!a.lit.includes(label)) bad.push(`${tab} > "${label}": lit ${a.lit.join(',') || 'none'}`);
		}
	}
	t.log(`${ws} entries: ${seen.join(' | ')}`);
	await t.check(`every entry under an open tab of ${ws} lands on that tab, on the page and in the index, and lights itself`, bad.length === 0, bad.slice(0, 8).join(' | ') + (bad.length > 8 ? ` and ${bad.length - 8} more` : ''));
}])).concat(SEARCHES.map((c) => [`Neon 2026-11-22 Settings Search from ${c.ws} › ${c.from} to a setting on ${c.to} lists only ${c.to}'s entries, and each stays on ${c.to}`, async (t) => {
	const f = await openDomain(t, c.domain);
	await openTab(t, f, c.ws, c.to);
	const own = await f.evaluate(SUB, [c.ws, c.to]);
	await openTab(t, f, c.ws, c.from);
	await searchJump(t, f, c.query);
	const a0 = await f.evaluate(AFTER, c.ws), listed = await f.evaluate(SUB, [c.ws, c.to]);
	t.log(`${c.ws}: ${c.to} opened from the index lists ${own.join(', ') || 'none'}; after the search it lists ${listed.join(', ') || 'none'} (page on ${a0.pageTab}, index on ${a0.indexTab})`);
	await t.check(`the search lands on ${c.to}, on the page and in the index`, a0.pageTab === c.to && a0.indexTab === c.to, JSON.stringify(a0));
	await t.check(`after the search, ${c.to} lists the entries it lists when opened from the index (${own.join(', ')})`, own.length > 0 && JSON.stringify(listed) === JSON.stringify(own), `listed ${JSON.stringify(listed)}`);
	const bad = [];
	for (const label of listed) {
		await openTab(t, f, c.ws, c.from);
		await searchJump(t, f, c.query);
		const link = f.locator(`#pm-settings-root .page-index-card .pm51-index-tab.is-open[data-workspace="${c.ws}"][data-tab="${c.to}"] + .pm51-index-sub .index-link`, { hasText: label }).first();
		if (!(await link.count())) { bad.push(`"${label}" not listed after the search`); continue; }
		await link.click();
		await t.page.waitForTimeout(900);
		await still(t, f);
		const a = await f.evaluate(AFTER, c.ws);
		if (a.pageTab !== c.to || a.indexTab !== c.to) bad.push(`"${label}": page on ${a.pageTab}, index open on ${a.indexTab}`);
		else if (!a.lit.includes(label)) bad.push(`"${label}": lit ${a.lit.join(',') || 'none'}`);
	}
	await t.check(`a click on each entry listed under ${c.to} after the search stays on ${c.to} and lights itself`, bad.length === 0, bad.join(' | '));
}])).concat([
	['Neon 2026-11-22 Web & Research › Search services lands on its services card and lights it', async (t) => {
		/* neon-max-16 (low): the group was anchored on its first listed row (provider-order), drawn in the second card,
		   ~580 px below the services accordion the entry is named after */
		const f = await openDomain(t, 'ai');
		await openTab(t, f, 'web', 'services');
		const link = f.locator('#pm-settings-root .page-index-card .pm51-index-tab.is-open[data-workspace="web"][data-tab="services"] + .pm51-index-sub .index-link', { hasText: 'Search services' }).first();
		await t.check('Search services is listed under the open Search services tab', (await link.count()) > 0, '');
		if (!(await link.count())) return;
		await link.click();
		await t.page.waitForTimeout(900);
		await still(t, f);
		const m = await f.evaluate(() => {
			const sc = document.querySelector('#settings-document'), b = sc.getBoundingClientRect();
			let readTop = b.top;
			for (const s of document.querySelectorAll('#settings-document .pm51-mgr.has-manager-tabs > .pm51-tabs')) {
				if (!s.checkVisibility()) continue;
				const r = s.getBoundingClientRect();
				if (r.top <= b.top + 2 && r.bottom > b.top) readTop = Math.max(readTop, r.bottom);
			}
			const body = document.querySelector('[data-continuous-workspace-body="web"]');
			const acc = body && [...body.querySelectorAll('.o55-web-services')].find((el) => !el.closest('.o55-leaving'));
			const card = acc && acc.closest('.pm51-section, .settings-section');
			const lit = [...document.querySelectorAll('#pm-settings-root .page-index-card .index-link.is-active')].map((l) => l.textContent.trim());
			return { card: card ? Math.round(card.getBoundingClientRect().top - readTop) : null, lit };
		});
		await t.check('the jump puts the services card at the top of the page, under the tabs (0-160 px below them)', m.card !== null && m.card >= -8 && m.card <= 160, JSON.stringify(m));
		await t.check('Search services is lit after the jump', m.lit.includes('Search services'), JSON.stringify(m.lit));
	}],
	['Jared 2026-11-21 the lit entry under Abilities reads at 4.5:1 or more, in every look', async (t) => {
		const f = await openAbilities(t, 'side index');
		await f.locator('#pm-settings-root .page-index-card .pm51-index-sub .index-link[data-section="media-abilities"]:visible').first().click();
		await t.page.waitForTimeout(900);
		await still(t, f);
		const low = [], seen = [];
		for (const look of LOOKS) {
			await t.app.look(look);
			await t.settle();
			const m = await f.evaluate(() => {
				const el = document.querySelector('#pm-settings-root .page-index-card .pm51-index-sub > .index-link.is-active');
				if (!el) return { none: true, theme: document.documentElement.getAttribute('data-theme') };
				const rgba = (c) => { const m = /rgba?\(([^)]+)\)/.exec(c); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { c: p.slice(0, 3), a: p.length > 3 ? p[3] : 1 }; };
				/* the ground under the words: the nearest ancestor fill that is mostly opaque (the entry's own fill counts) */
				let ground = null;
				for (let e = el; e && !ground; e = e.parentElement) { const v = rgba(getComputedStyle(e).backgroundColor); if (v && v.a >= 0.5) ground = v.c; }
				ground = ground || [0, 0, 0];
				const L = (c) => { const ch = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]; };
				const fg = rgba(getComputedStyle(el).color).c, a = L(fg), b = L(ground);
				return { theme: document.documentElement.getAttribute('data-theme'), label: el.textContent.trim(), ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05), fg: fg.join(','), ground: ground.join(',') };
			});
			seen.push(`${look}=${m.theme}`);
			if (m.none) { low.push(`${look}: no lit entry under Abilities`); continue; }
			if (m.label !== 'Media abilities' || m.ratio < 4.5) low.push(`${look} (${m.theme}): "${m.label}" ${m.ratio.toFixed(2)}:1, rgb(${m.fg}) on rgb(${m.ground})`);
		}
		t.log('looks measured: ' + seen.join(' '));
		await t.check('Media abilities is the lit entry and its words read at 4.5:1 or more in all ten looks', low.length === 0, low.join(' | '));
	}],
	['Jared 2026-11-21 the side index draws no line on its right, in every look', async (t) => {
		const f = await t.app.open();
		await t.viewport(1440, 900);
		await f.locator('#tab-settings').click();
		await t.settle();
		await f.locator('#pm-settings-root [data-action="navigate-domain"][data-domain="ai"]:visible').first().click();
		await t.settle();
		const lines = [], seen = [];
		for (const look of LOOKS) {
			await t.app.look(look);
			await t.settle();
			const m = await f.evaluate(() => {
				const idx = document.querySelector('#pm-settings-root .page-index');
				if (!idx || !idx.getClientRects().length) return { none: true };
				const theme = document.documentElement.getAttribute('data-theme') || '';
				const alpha = (c) => { const m = /rgba?\(([^)]+)\)/.exec(c); if (!m) return c === 'transparent' ? 0 : 1; const p = m[1].split(/[ ,/]+/).filter(Boolean); return p.length > 3 ? parseFloat(p[3]) : 1; };
				const edge = (el, side) => { if (!el) return null; const cs = getComputedStyle(el); const w = parseFloat(cs[`border${side}Width`]), s = cs[`border${side}Style`], c = cs[`border${side}Color`]; return w > 0 && s !== 'none' && s !== 'hidden' && alpha(c) > 0 ? `${w}px ${s} ${c}` : null; };
				const vertical = getComputedStyle(idx.querySelector('.page-index-card')).flexDirection === 'column';
				return { theme, vertical, right: edge(idx, 'Right'), next: edge(idx.nextElementSibling, 'Left') };
			});
			if (m.none) { lines.push(`${look}: no side index`); continue; }
			seen.push(`${look}=${m.theme}`);
			if (!m.vertical) lines.push(`${look}: the index is not a column at 1440x900`);
			if (m.right) lines.push(`${look} (${m.theme}): .page-index border-right ${m.right}`);
			if (m.next) lines.push(`${look} (${m.theme}): the page's border-left ${m.next}`);
		}
		t.log('looks measured: ' + seen.join(' '));
		const painted = new Set(seen.map((s) => s.split('=')[1].replace(/-(dark|light)$/, ''))).size;
		await t.check('each look was painted before it was measured (at least 4 theme families seen)', painted >= 4, seen.join(' '));
		await t.check('no look draws a line between the side index and the page', lines.length === 0, lines.join(' | '));
	}]
]).concat(FO_S1_ROWS));
