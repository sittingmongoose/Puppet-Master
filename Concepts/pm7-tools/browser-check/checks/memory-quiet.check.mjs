// FO-167 (stream F, 2026-11-12): the quiet Memory design Jared approved on 2026-11-11
// (share/puppet-master/2026-11-11-memory-review: PACKET section 3, the mock and its screens 01 to 10), by real clicks,
// on each surface (--set sandbox=0 / 1).
// - Settings > Memory & Automation > Memory is one page and has exactly these parts: the switch "Remember things
//   between chats", the line "Crews, reviews and the chat's helpers can read these notes too, including notes about
//   you.", search, a level filter (All / This project / Every project) that opens as a popover over the page (the list
//   does not move), the notes (text, level, when saved), Add memory, Edit, Delete, and a collapsed Archived group that
//   search still reaches. Nothing ranks, pins, confirms, verifies, cites sources, fades by hand, exports or tidies: no
//   tabs, no stats, no More options, no other setting row, none of those words on the page. The rows the page drew
//   before are found in their new homes; the 43 waiting for Plans are drawn in Advanced Settings (or nowhere, once
//   Plans/settings_inventory.json drops them), never on the Memory page.
// - Add (a dialog: the text and "Where it's available", a dropdown popover with This project / Every project), Edit,
//   Delete (one confirm), the level filter, search into Archived and the Archived group work, and the switch off says
//   so and dims the list.
// - The chat's Memory button (chat header) and the wand's Memory row open the same page as a sheet over the chat (mock
//   10); its filter and Add work inside it; Escape closes it.
// - Replies: Demo Studio's Memory examples (memory-saved, memory-remember) show "Saved to memory · View" at the end of
//   a reply that saved a note (mock 08) and "Got it. Saved to memory for every project. View" (mock 09); View opens
//   the sheet with that note lit; typing "Remember that I always use pnpm" saves a note and answers the same way; a
//   normal reply carries nothing about memory (no Noted or Verified mark, no hover naming a note, no rule-change
//   line, no next-message ribbon, cards, counts or previews), and the chat's threads draw none of those either.
// - The sheet follows the look: in every look its switch, card and Add button paint like the Settings page's.
// - FO-199/200/202 (sol-max-12b F12B-SOL-M1/M2/L1): a held real chat resize keeps the sheet on the chat column at
//   every sampled frame; a quick Escape then Enter on the restored header button reopens the sheet and it stays open
//   (the close timer never hides a reopen); under Reduce Motion set before load, Demo Studio's memory-saved then a
//   real View paints a static highlight on the note (computed paint plus a pixel difference), without any animation.
// --set looks=basic-dark,nier-dark limits the look test (none skips it).
import { LOOKS } from '../browser-check.config.mjs';
import { setLookBySetting, setMotionMedia } from '../helpers/settings-look.mjs';
import { decodePng } from '../../../onboarding/opus-5.5/tools/pm7_parity_png.mjs';

const WS = 'context-memory';
const BODY = `[data-continuous-workspace-body="${WS}"]`;
const SHARE = 'Crews, reviews and the chat’s helpers can read these notes too, including notes about you.';
const HELP_OFF = 'Off: nothing new is saved and nothing is used. Your saved notes stay here.';
const BANNED = /\b(pin|pinned|pins|unpin|unconfirmed|confirmed?|confirm|verif(y|ied|ies)|conflicts?|disagree|rank(ing|ed)?|sources?|fade times?|forget|forgotten|try a question|brought in|confidence|diagnostics|tidy|export|candidates|context space|finding memories|keeping & privacy|rule packs?|notes it took|your next message|recently forgotten|protected memories)\b/i;
// what the old chat drew about memory (reply marks and their hover, the rule-change line, the sheet's ribbon and cards)
const MEMORY_UI = '.pmx-mem-tick, [data-hover-key^="mtick:"], .pmx-mem-proposal, .pmx-mem-plate, .pmx-mem-ribbon, .pmx-mem-card, .pmx-mem-meter, .pmx-mem-sheet, [data-capsule-gist], [data-capsule-teaching], .memory-demo-guide';
const REPLY_WORDS = /\b(noted|verified|recalled|remembered|memor(y|ies)|brought in|notes? it took|your next message|label checks)\b/i;
// rows PACKET hides or removes (placement.d/30-memory.json retire_with_canon): a sample of each kind
const WAITING = ['memory.retention.pinned-unverified-injection', 'memory.retention.gist-review-filter', 'memory.retention.half-life-by-kind', 'memory.retention.subagent-access', 'memory.assembly.max-injected-memories', 'memory.limits.budget-buckets'];
const MOVED = { 'memory.assembly.app-rules': 'personas', 'memory.assembly.project-rules': 'personas', 'memory.retention.history-retention': 'project-history', 'general.interaction.context-usage': 'app-input', 'memory.limits.manual-compact': 'app-input', 'memory.limits.max-context-ktokens': 'providers' };

async function settings(t, surface, [w, h] = [1390, 900]) {
	await t.viewport(w, h);
	const f = await t.app.open({ sandbox: surface === 'sandbox' });
	await t.app.resetLayout();
	// at a phone's width the page tabs fold into their overflow menu: the Settings tab is pressed where it is
	if (w <= 600) await f.evaluate(() => document.getElementById('tab-settings').click());
	else await f.locator('#tab-settings').click({ timeout: 15000 }).catch(() => f.evaluate(() => document.getElementById('tab-settings').click()));
	await t.settle();
	await f.evaluate((ws) => PM51.go('memory', ws), WS);
	await f.waitForSelector(`${BODY}[data-workspace-mounted="true"]`, { timeout: 15000 });
	await t.settle();
	await t.page.waitForTimeout(400);
	return f;
}
// what a place shows: page (Settings) or sheet (over the chat)
const READ = (place) => {
	const root = place === 'sheet' ? document.querySelector('.pm7-mem-layer:not([hidden]) .pm7-mem-sheet') : document.querySelector('[data-continuous-workspace-body="context-memory"]');
	if (!root) return null;
	const vis = (x) => !!x && x.getClientRects().length > 0 && getComputedStyle(x).visibility !== 'hidden';
	const txt = (x) => (x ? x.textContent.replace(/\s+/g, ' ').trim() : '');
	const rows = [...root.querySelectorAll('.mm-row')].filter(vis);
	const cur = rows.filter((r) => !r.classList.contains('is-archived'));
	const arch = rows.filter((r) => r.classList.contains('is-archived'));
	const sw = root.querySelector('.mm-intro .toggle[role="switch"][data-setting="memory.retention.enabled"]');
	const rowsOf = (list) => list.map((r) => ({ text: txt(r.querySelector('.mm-row-text')), level: txt(r.querySelector('.mm-level')), when: txt(r.querySelector('.mm-when')), edit: !!r.querySelector('[data-action="pm51-memory-edit"]'), del: !!r.querySelector('[data-action="pm51-memory-delete"]'), flash: r.classList.contains('is-flash') }));
	const settingRows = [...root.querySelectorAll('.setting-row')].filter(vis);
	return {
		tabs: [...root.querySelectorAll('.pm51-tabs .manager-tab, .manager-tabs [role="tab"]')].filter(vis).map(txt),
		advanced: [...root.querySelectorAll('details.pm51-advanced')].filter(vis).length,
		settingRows: settingRows.map((r) => r.getAttribute('data-setting-id') || r.id || txt(r.querySelector('.setting-label'))),
		switchOn: sw ? sw.getAttribute('aria-checked') : null,
		switchLabel: txt(root.querySelector('.mm-intro .setting-label')),
		switchHelp: (() => { const d = root.querySelector('.mm-intro .setting-description'); if (!d) return ''; const spans = [...d.querySelectorAll('.mm-help')]; return spans.length ? txt(spans.find((x) => getComputedStyle(x).visibility !== 'hidden')) : txt(d); })(),
		helpBox: (() => { const d = root.querySelector('.mm-intro'); return d ? Math.round(d.getBoundingClientRect().height) : 0; })(),
		share: txt(root.querySelector('.mm-share-line')),
		search: (() => { const i = root.querySelector('.mm-search input[type="search"]'); return i ? { ph: i.placeholder, v: i.value, vis: vis(i) } : null; })(),
		level: txt(root.querySelector('.mm-level .pm51-dd-value')),
		add: txt(root.querySelector('.mm-add')),
		count: txt(root.querySelector('.mm-count')),
		paused: !!root.querySelector('.mm-list.is-paused'),
		cur: rowsOf(cur), arch: rowsOf(arch),
		archTitle: txt(root.querySelector('.mm-archived-title')), archCount: txt(root.querySelector('.mm-archived-count')), archHint: txt(root.querySelector('.mm-archived-hint')),
		archOpen: !!root.querySelector('.mm-archived.is-open'),
		empty: txt(root.querySelector('.mm-empty')),
		words: root.innerText.replace(/\s+/g, ' '),
		listTop: (() => { const l = root.querySelector('.mm-list'); return l ? Math.round(l.getBoundingClientRect().top * 10) / 10 : null; })()
	};
};
const read = (f, place = 'page') => f.evaluate(READ, place);
const scope = (place) => (place === 'sheet' ? '.pm7-mem-layer:not([hidden]) .pm7-mem-sheet' : BODY);
// the open dropdown popover: its title, options, and where it sits (in <body>, fixed, over the page)
const POP = () => {
	const p = [...document.querySelectorAll('.pm51-popout.pm51-dd-list')].find((x) => x.getClientRects().length);
	if (!p) return null;
	const r = p.getBoundingClientRect();
	return { title: (p.querySelector('.pm51-popout-title') || {}).textContent || '', options: [...p.querySelectorAll('[role="option"]')].map((o) => ({ label: (o.querySelector('.pm51-popout-label') || o).textContent.trim(), meta: (o.querySelector('.pm51-popout-meta') || {}).textContent || '', on: o.getAttribute('aria-selected') === 'true' })), fixed: getComputedStyle(p).position === 'fixed', inBody: p.parentElement === document.body, rect: { x: r.x, y: r.y, w: r.width, h: r.height } };
};
async function pickLevel(t, f, place, label) {
	await f.locator(`${scope(place)} .mm-level .pm51-dd-trigger`).first().click();
	await f.waitForFunction(() => [...document.querySelectorAll('.pm51-popout.pm51-dd-list')].some((x) => x.getClientRects().length), null, { timeout: 8000 });
	const pop = await f.evaluate(POP);
	await f.getByRole('option', { name: label, exact: true }).first().click({ timeout: 8000 });
	await f.waitForFunction(() => ![...document.querySelectorAll('.pm51-popout.pm51-dd-list')].some((x) => x.getClientRects().length), null, { timeout: 8000 }).catch(() => {});
	await t.page.waitForTimeout(250);
	return pop;
}
const dialog = (place) => (place === 'sheet' ? '.pm7-mem-layer:not([hidden]) .pm7-mem-portal .overlay .dialog' : '#pm-settings-portals .overlay .dialog');
const DIALOG = (sel) => {
	const d = document.querySelector(sel); if (!d || !d.getClientRects().length) return null;
	const r = d.getBoundingClientRect();
	return { title: (d.querySelector('.dialog-title') || {}).textContent || '', sub: (d.querySelector('.dialog-sub') || {}).textContent || '', text: d.innerText.replace(/\s+/g, ' '), area: (d.querySelector('textarea[name="text"]') || {}).value, level: ((d.querySelector('.pm51-dd-value') || {}).textContent || '').trim(), help: ((d.querySelector('.mm-level-help') || {}).textContent || '').trim(), ok: ((d.querySelector('.dialog-footer button[type="submit"]') || {}).textContent || '').trim(), rect: { x: r.x, y: r.y, w: r.width, h: r.height } };
};

// the page and its parts, the filter, search, Archived, Add, Edit, Delete and the switch, in one place
async function workThePlace(t, f, place, tag) {
	let r = await read(f, place);
	await t.check(`${tag}: the switch “Remember things between chats” is on and says what memory does`, r && r.switchLabel === 'Remember things between chats' && r.switchOn === 'true' && /keeps short notes/.test(r.switchHelp) && /Only you delete them/.test(r.switchHelp), r && JSON.stringify({ l: r.switchLabel, on: r.switchOn, h: r.switchHelp }));
	await t.check(`${tag}: one quiet line says who else reads the notes`, r.share === SHARE, r.share);
	await t.check(`${tag}: search, the level filter (All) and Add memory`, r.search && r.search.vis && r.search.ph === 'Search memories' && r.level === 'All' && r.add === 'Add memory', JSON.stringify({ s: r.search, l: r.level, a: r.add }));
	await t.check(`${tag}: six notes, each with its words, its level, when it was saved, Edit and Delete`, r.cur.length === 6 && r.cur.every((x) => x.text && /^(This project|Every project)$/.test(x.level) && /^Saved /.test(x.when) && x.edit && x.del), JSON.stringify(r.cur.slice(0, 3)));
	await t.check(`${tag}: Archived (3) is collapsed and says search still finds it`, r.archTitle === 'Archived' && r.archCount === '3' && !r.archOpen && r.arch.length === 0 && (place === 'sheet' || r.archHint === 'Not used in a while. Still searchable.'), JSON.stringify({ t: r.archTitle, c: r.archCount, o: r.archOpen, n: r.arch.length, h: r.archHint }));
	await t.check(`${tag}: no tabs, no More options and no setting row but the switch`, r.tabs.length === 0 && r.advanced === 0 && r.settingRows.length === 1, JSON.stringify({ tabs: r.tabs, adv: r.advanced, rows: r.settingRows }));
	const banned = (r.words.match(BANNED) || [])[0];
	await t.check(`${tag}: nothing ranks, pins, confirms, verifies, cites sources, fades by hand, exports or tidies`, !banned, banned ? `“${banned}” in: ${r.words.slice(Math.max(0, r.words.search(BANNED) - 60), r.words.search(BANNED) + 60)}` : 'none');
	if (place === 'page') await t.check(`${tag}: the page counts its notes quietly (6 notes)`, r.count === '6 notes', r.count);

	// the level filter: a popover over the page (the list does not move), All / This project / Every project
	const top = r.listTop;
	await f.locator(`${scope(place)} .mm-level .pm51-dd-trigger`).first().click();
	await f.waitForFunction(() => [...document.querySelectorAll('.pm51-popout.pm51-dd-list')].some((x) => x.getClientRects().length), null, { timeout: 8000 });
	const pop = await f.evaluate(POP);
	const during = await read(f, place);
	await t.check(`${tag}: the level filter opens as a popover over the page, titled Show, with All, This project and Every project`, pop && pop.fixed && pop.inBody && /show/i.test(pop.title) && pop.options.map((o) => o.label).join('|') === 'All|This project|Every project' && pop.options[0].on, JSON.stringify(pop));
	await t.check(`${tag}: opening it pushes nothing (the list stays where it was)`, during.listTop === top, `list top ${top} -> ${during.listTop}`);
	await f.getByRole('option', { name: 'Every project', exact: true }).first().click({ timeout: 8000 });
	await t.page.waitForTimeout(300);
	r = await read(f, place);
	await t.check(`${tag}: Every project shows only those notes (2), and 1 archived`, r.level === 'Every project' && r.cur.length === 2 && r.cur.every((x) => x.level === 'Every project') && r.archCount === '1', JSON.stringify({ l: r.level, cur: r.cur.map((x) => x.level), a: r.archCount }));
	await pickLevel(t, f, place, 'This project');
	r = await read(f, place);
	await t.check(`${tag}: This project shows only its notes (4), and 2 archived`, r.cur.length === 4 && r.cur.every((x) => x.level === 'This project') && r.archCount === '2', JSON.stringify({ cur: r.cur.map((x) => x.level), a: r.archCount }));
	await pickLevel(t, f, place, 'All');

	// search reaches into Archived
	const box = f.locator(`${scope(place)} .mm-search input[type="search"]`).first();
	await box.click();
	await box.fill('docs');
	await t.page.waitForTimeout(300);
	r = await read(f, place);
	await t.check(`${tag}: searching “docs” opens Archived on the one archived note that matches (1 of 3)`, r.cur.length === 0 && r.archOpen && r.arch.length === 1 && r.arch[0].text === 'The old docs site was built with Hugo.' && r.archCount === '1 of 3', JSON.stringify({ cur: r.cur.length, open: r.archOpen, arch: r.arch, c: r.archCount }));
	await box.fill('zzqq');
	await t.page.waitForTimeout(250);
	r = await read(f, place);
	await t.check(`${tag}: a search with no match says so`, r.cur.length === 0 && r.arch.length === 0 && /No saved notes match “zzqq”/.test(r.empty), r.empty);
	await box.fill('');
	await t.page.waitForTimeout(250);

	// Archived opens and closes
	await f.locator(`${scope(place)} .mm-archived-toggle`).first().click();
	await t.page.waitForTimeout(250);
	r = await read(f, place);
	await t.check(`${tag}: Archived opens on its three notes, each marked Archived`, r.archOpen && r.arch.length === 3, JSON.stringify(r.arch.map((x) => x.text)));
	await f.locator(`${scope(place)} .mm-archived-toggle`).first().click();
	await t.page.waitForTimeout(250);

	// Add memory: a dialog with the text and "Where it's available" (a dropdown popover, two lines each)
	await f.locator(`${scope(place)} .mm-add`).first().click();
	await f.waitForSelector(dialog(place), { timeout: 8000 });
	await t.page.waitForTimeout(300);
	let d = await f.evaluate(DIALOG, dialog(place));
	await t.check(`${tag}: Add memory opens a dialog: the words to remember and Where it’s available (This project first)`, d && d.title === 'Add memory' && /What should Puppet Master remember\?/.test(d.text) && /Where it’s available/.test(d.text) && /^This project/.test(d.level) && d.ok === 'Add memory', JSON.stringify(d));
	await f.locator(`${dialog(place)} .pm51-dd-trigger`).first().click();
	await f.waitForFunction(() => [...document.querySelectorAll('.pm51-popout.pm51-dd-list')].some((x) => x.getClientRects().length), null, { timeout: 8000 });
	const lp = await f.evaluate(POP);
	await t.check(`${tag}: Where it’s available is a popover with This project and Every project, each saying who uses it`, lp && lp.fixed && lp.options.length === 2 && /^This project/.test(lp.options[0].label) && lp.options[1].label === 'Every project' && /use it/.test(lp.options[0].meta) && /all your projects/.test(lp.options[1].meta), JSON.stringify(lp));
	await f.getByRole('option', { name: 'Every project' }).first().click({ timeout: 8000 });
	await t.page.waitForTimeout(250);
	d = await f.evaluate(DIALOG, dialog(place));
	await t.check(`${tag}: picking Every project says who uses it`, d && d.level === 'Every project' && d.help === 'Every chat, in all your projects.', JSON.stringify({ l: d && d.level, h: d && d.help }));
	const NEW = `Demo accounts always use the staging database (${place}).`;
	await f.locator(`${dialog(place)} textarea[name="text"]`).first().fill(NEW);
	await f.locator(`${dialog(place)} .dialog-footer button[type="submit"]`).first().click();
	await f.waitForSelector(dialog(place), { state: 'detached', timeout: 8000 }).catch(() => {});
	await t.page.waitForTimeout(400);
	r = await read(f, place);
	await t.check(`${tag}: the new note leads the list, for every project, saved today`, r.cur[0] && r.cur[0].text === NEW && r.cur[0].level === 'Every project' && r.cur[0].when === 'Saved today' && r.cur.length === 7 && (place === 'sheet' || r.count === '7 notes'), JSON.stringify({ first: r.cur[0], n: r.cur.length, c: r.count }));

	// Edit
	await f.locator(`${scope(place)} .mm-row[data-mm-note] [data-action="pm51-memory-edit"]`).first().click();
	await f.waitForSelector(dialog(place), { timeout: 8000 });
	await t.page.waitForTimeout(300);
	d = await f.evaluate(DIALOG, dialog(place));
	await t.check(`${tag}: Edit opens the same dialog with the note's words and level`, d && d.title === 'Edit memory' && d.area === NEW && d.level === 'Every project' && d.ok === 'Save changes', JSON.stringify(d));
	const EDITED = NEW.replace('staging', 'QA staging');
	await f.locator(`${dialog(place)} textarea[name="text"]`).first().fill(EDITED);
	await f.locator(`${dialog(place)} .dialog-footer button[type="submit"]`).first().click();
	await f.waitForSelector(dialog(place), { state: 'detached', timeout: 8000 }).catch(() => {});
	await t.page.waitForTimeout(400);
	r = await read(f, place);
	await t.check(`${tag}: the edit shows in place`, r.cur[0] && r.cur[0].text === EDITED && r.cur.length === 7, JSON.stringify(r.cur[0]));

	// Delete, with one confirm
	await f.locator(`${scope(place)} .mm-row[data-mm-note] [data-action="pm51-memory-delete"]`).first().click();
	await f.waitForSelector(dialog(place), { timeout: 8000 });
	await t.page.waitForTimeout(300);
	d = await f.evaluate(DIALOG, dialog(place));
	await t.check(`${tag}: Delete asks once, showing the note, and says it can't be undone`, d && d.title === 'Delete this memory?' && d.text.includes(EDITED) && /stops using it right away/.test(d.text) && d.ok === 'Delete', JSON.stringify(d));
	await f.locator(`${dialog(place)} .dialog-footer button[type="submit"]`).first().click();
	await f.waitForSelector(dialog(place), { state: 'detached', timeout: 8000 }).catch(() => {});
	await t.page.waitForTimeout(400);
	r = await read(f, place);
	await t.check(`${tag}: the note is gone`, r.cur.length === 6 && !r.cur.some((x) => x.text === EDITED) && (place === 'sheet' || r.count === '6 notes'), JSON.stringify({ n: r.cur.length, c: r.count }));

	// the switch: off says so and dims the list; the notes stay
	const before = await read(f, place);
	await f.locator(`${scope(place)} .mm-intro .toggle[role="switch"]`).first().click();
	await t.page.waitForTimeout(500);
	r = await read(f, place);
	const hBox = before.helpBox;
	await t.check(`${tag}: switched off, it says nothing new is saved or used, keeps the notes and dims the list`, r.switchOn === 'false' && r.switchHelp === HELP_OFF && r.paused && r.cur.length === 6, JSON.stringify({ on: r.switchOn, h: r.switchHelp, p: r.paused }));
	await t.check(`${tag}: the switch's card keeps its height (nothing below moves)`, Math.abs(r.helpBox - hBox) <= 1, `${hBox} -> ${r.helpBox}`);
	await f.locator(`${scope(place)} .mm-intro .toggle[role="switch"]`).first().click();
	await t.page.waitForTimeout(500);
	r = await read(f, place);
	await t.check(`${tag}: and back on`, r.switchOn === 'true' && !r.paused, JSON.stringify({ on: r.switchOn, p: r.paused }));
}

// Home with the chat on screen
async function home(t, surface, [w, h] = [1390, 900]) {
	await t.viewport(w, h);
	const f = await t.app.open({ sandbox: surface === 'sandbox' });
	await t.app.resetLayout();
	if (w <= 600) await f.evaluate(() => document.getElementById('tab-dashboard').click());
	else await f.locator('#tab-dashboard').click({ timeout: 15000 }).catch(() => f.evaluate(() => document.getElementById('tab-dashboard').click()));
	await f.waitForFunction(() => !!document.querySelector('#pmRoot .chat-header') && !!document.querySelector('#pmRoot .composer-box[data-k="composer-box"]'), null, { timeout: 30000 });
	// a narrow Home folds the chat to its edge strip; its button opens it over the page (PMW.chatCol.show, FO-142)
	if (w <= 860) { await t.page.waitForTimeout(500); await f.evaluate(() => { const c = window.PMW && PMW.chatCol; if (c && !c.isOpen()) c.show(); }); }
	await t.settle();
	await t.page.waitForTimeout(600);
	return f;
}
const SHEET = () => {
	const l = document.querySelector('.pm7-mem-layer'), s = l && l.querySelector('.pm7-mem-sheet'), c = document.getElementById('chatPanel');
	if (!l || l.hidden || !s) return { open: false };
	const r = s.getBoundingClientRect(), cr = c.getBoundingClientRect(), head = c.querySelector('.chat-header'), hr = head && head.getBoundingClientRect();
	const at = document.elementFromPoint(r.left + r.width / 2, r.top + 30);
	return { open: true, title: (s.querySelector('.pm7-mem-title') || {}).textContent || '', settings: ((s.querySelector('.pm7-mem-open') || {}).textContent || '').trim(), inChat: r.left >= cr.left - 1 && r.right <= cr.right + 1 && r.bottom <= cr.bottom + 1 && r.top >= cr.top - 1, underHeader: !hr || r.top >= hr.bottom - 2, w: Math.round(r.width), onTop: !!(at && at.closest && at.closest('.pm7-mem-sheet')) };
};
// a reply's words, without the save line, and what memory UI the transcript draws
const TRANSCRIPT = () => {
	const root = document.querySelector('#pmRoot');
	const replies = [...root.querySelectorAll('.message.message-assistant')];
	const words = replies.map((m) => { const c = m.querySelector('.message-body'); if (!c) return ''; const k = c.cloneNode(true); k.querySelectorAll('.pm7-mem-saved, .pm7-mem-view').forEach((x) => x.remove()); return k.textContent.replace(/\s+/g, ' ').trim(); });
	const ui = [...root.querySelectorAll('.pmx-mem-tick, [data-hover-key^="mtick:"], .pmx-mem-proposal, .pmx-mem-plate, .pmx-mem-ribbon, .pmx-mem-card, .pmx-mem-meter, .pmx-mem-sheet, [data-capsule-gist], [data-capsule-teaching], .memory-demo-guide')].filter((x) => x.getClientRects().length || x.matches('[data-hover-key^="mtick:"]')).map((x) => x.className || x.getAttribute('data-hover-key'));
	const saved = replies.map((m) => { const s = m.querySelector('.message-body .pm7-mem-saved'); return s ? s.textContent.replace(/\s+/g, ' ').trim() : ''; });
	const inline = replies.map((m) => { const v = m.querySelector('.message-body .pm7-mem-view.is-inline'); if (!v) return null; const p = v.previousElementSibling, pr = p && p.getClientRects(), vr = v.getBoundingClientRect(); const last = pr && pr[pr.length - 1]; return { words: (p ? p.textContent : '').trim(), sameLine: !!last && Math.abs((last.top + last.bottom) / 2 - (vr.top + vr.bottom) / 2) < 8 }; });
	const chrome = replies.map((m) => { const c = m.querySelector('.message-chrome'); return c ? c.textContent.replace(/\s+/g, ' ').trim() : ''; });
	return { n: replies.length, words, ui, saved, inline, chrome, title: ((root.querySelector('.pmx-chat-title') || {}).textContent || '').trim() };
};
async function runDemo(t, f, id) {
	const ok = await f.evaluate((g) => {
		const P = window.PM56_PORT && window.PM56_PORT.demo; if (!P) return { err: 'no demo bridge' };
		const list = P.guided().flatMap((x) => x.items).map((x) => x.id);
		if (!list.includes(g)) return { err: `no ${g} in Demo Studio (${list.filter((x) => /memory/.test(x)).join(',') || 'no memory examples'})` };
		return P.runGuided(g);
	}, id);
	await t.page.waitForTimeout(900);
	return ok;
}

export const tests = {};
for (const surface of ['normal', 'sandbox']) {
	const T = (name, fn) => { tests[`${name} (${surface})`] = async (t) => { if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; } await fn(t); }; };

	T('FO-167 Settings > Memory is one quiet page that works', async (t) => {
		const f = await settings(t, surface);
		const label = await f.evaluate((ws) => { const b = [...document.querySelectorAll(`.workspace-tab[data-workspace="${ws}"]`)].find((x) => x.getClientRects().length); return b ? b.textContent.trim() : ''; }, WS);
		await t.check('the page is called Memory', label === 'Memory', label);
		await workThePlace(t, f, 'page', 'Settings › Memory');
		// where the page's old rows went
		const homes = await f.evaluate(([moved, waiting]) => {
			const e = (id) => (PM51.placement && PM51.placement.byId ? PM51.placement.byId[id] : null);
			return { moved: Object.fromEntries(Object.keys(moved).map((id) => [id, e(id) ? e(id).workspace : null])), waiting: Object.fromEntries(waiting.map((id) => [id, e(id) ? e(id).workspace : 'retired'])) };
		}, [MOVED, WAITING]);
		await t.check('the rows Memory keeps elsewhere are in their homes (rules: Personas & Crews; Chat history: Project History; meter and Squeeze now: App & Input; Largest working space: AI & Providers)', Object.entries(MOVED).every(([id, ws]) => homes.moved[id] === ws), JSON.stringify(homes.moved));
		await t.check('the rows waiting for Plans are not on the Memory page (Advanced Settings until the inventory drops them, then nowhere)', Object.values(homes.waiting).every((ws) => ws === 'advanced' || ws === 'retired'), JSON.stringify(homes.waiting));
	});

	T('FO-167 the chat opens the same page as a sheet', async (t) => {
		const f = await home(t, surface);
		const btn = f.locator('#pmRoot .chat-header .pm7-mem-btn').first();
		await t.check('the chat header has a Memory button', (await btn.count()) === 1 && (await btn.getAttribute('aria-label')) === 'Memory', `${await btn.count()} buttons`);
		if (!(await btn.count())) return;
		await btn.click();
		await f.waitForFunction(() => { const l = document.querySelector('.pm7-mem-layer'); return l && !l.hidden && l.classList.contains('is-open'); }, null, { timeout: 8000 });
		await t.page.waitForTimeout(400);
		const s = await f.evaluate(SHEET);
		await t.check('it opens the Memory sheet over the chat, under its header, on top', s.open && s.title === 'Memory' && s.settings === 'Open in Settings' && s.inChat && s.underHeader && s.onTop, JSON.stringify(s));
		await workThePlace(t, f, 'sheet', 'the chat’s Memory sheet');
		await t.page.keyboard.press('Escape');
		await t.page.waitForTimeout(450);
		const shut = await f.evaluate(() => ({ s: (() => { const l = document.querySelector('.pm7-mem-layer'); return !!(l && !l.hidden); })(), focus: !!(document.activeElement && document.activeElement.closest && document.activeElement.closest('.pm7-mem-btn')) }));
		await t.check('Escape closes it and the focus goes back to the Memory button', !shut.s && shut.focus, JSON.stringify(shut));
		// the wand's Memory row opens the same sheet
		await f.locator('#pmRoot [data-action="open-menu"][data-menu="wand"]').first().click();
		await t.page.waitForTimeout(400);
		// PMConcept7 groups the wand's rows (delivery-polish.js: Memory & teaching) and keeps each row's line as its title
		const group = f.locator('#pmOverlayRoot [data-action="polish-wand-group"][data-group="memory"]').first();
		if (await group.count()) { await group.click(); await t.page.waitForTimeout(400); }
		const row = f.locator('#pmOverlayRoot .af-wand-row[data-action="af-memory-open"]').first();
		const rowText = (await row.innerText().catch(() => '')).replace(/\s+/g, ' ').trim() + ' | ' + ((await row.getAttribute('title').catch(() => '')) || '');
		await t.check('the wand’s Memory row says what the page holds', /^Memory\b/.test(rowText) && /Notes Puppet Master keeps between chats/.test(rowText), rowText);
		await row.click();
		await t.page.waitForTimeout(500);
		const s2 = await f.evaluate(SHEET);
		const old = await f.evaluate(() => [...document.querySelectorAll('#pmOverlayRoot .pmx-mem-sheet, #pmOverlayRoot .pmx-mem-ribbon')].filter((x) => x.getClientRects().length).length);
		await t.check('it opens the same Memory sheet, never the old one', s2.open && s2.title === 'Memory' && old === 0, JSON.stringify({ s2, old }));
		await t.page.keyboard.press('Escape');
		await t.page.waitForTimeout(400);
	});

	T('FO-167 replies say only “Saved to memory · View”', async (t) => {
		const f = await home(t, surface);
		// a reply that saved something (mock 08)
		const ran = await runDemo(t, f, 'memory-saved');
		await t.check('Demo Studio has “A reply that saved something” and runs it', ran && ran.ok !== false && !ran.err, JSON.stringify(ran));
		let tx = await f.evaluate(TRANSCRIPT);
		const at = tx.saved.findIndex((x) => x);
		await t.check('the reply that saved a note ends with one small line: Saved to memory · View', at >= 0 && tx.saved[at] === 'Saved to memory · View' && /All 214 API tests pass now\.$/.test(tx.words[at]), JSON.stringify({ saved: tx.saved, words: tx.words[at] }));
		await t.check('no other memory mark, hover, card or count in the chat', tx.ui.length === 0, JSON.stringify(tx.ui));
		if (at >= 0) {
			await f.locator('#pmRoot .message-assistant .pm7-mem-saved .pm7-mem-view').first().click();
			await t.page.waitForTimeout(600);
			const lit = await f.evaluate(READ, 'sheet');
			await t.check('View opens the Memory sheet with that note lit', !!lit && lit.cur.some((x) => x.flash && /port 5433/.test(x.text)), lit && JSON.stringify(lit.cur.filter((x) => x.flash)));
			await t.page.keyboard.press('Escape');
			await t.page.waitForTimeout(400);
		}
		// "Remember that I always use pnpm" (mock 09)
		const ran2 = await runDemo(t, f, 'memory-remember');
		await t.check('Demo Studio has “Remember that I always use pnpm” and runs it', ran2 && ran2.ok !== false && !ran2.err, JSON.stringify(ran2));
		tx = await f.evaluate(TRANSCRIPT);
		const inl = tx.inline.findIndex((x) => x);
		await t.check('the answer is one line naming the level, with View at its end: Got it. Saved to memory for every project. View', inl >= 0 && tx.inline[inl].words === 'Got it. Saved to memory for every project.' && tx.inline[inl].sameLine, JSON.stringify(tx.inline));
		// typed in the composer
		const before = tx.n;
		const box = f.locator('#pmRoot textarea[data-input="composer"]').first();
		await box.click();
		await box.fill('Remember that I always run the linter before pushing');
		await f.locator('#pmRoot .composer [data-action="send"]').first().click();
		await f.waitForFunction((n) => document.querySelectorAll('#pmRoot .message.message-assistant').length > n, before, { timeout: 10000 }).catch(() => {});
		await t.page.waitForTimeout(500);
		tx = await f.evaluate(TRANSCRIPT);
		const last = tx.inline[tx.inline.length - 1];
		const note = await f.evaluate(() => (window.PM7_MEMORY ? window.PM7_MEMORY.notes().find((n) => /linter/.test(n.text)) : null));
		await t.check('typing “Remember that …” saves a note and answers in one line with View', last && last.words === 'Got it. Saved to memory for every project.' && last.sameLine && note && note.level === 'every' && note.text === 'Always run the linter before pushing.', JSON.stringify({ last, note }));
		// a normal reply: nothing about memory
		const n2 = tx.n;
		await box.click();
		await box.fill('What changed in the last build?');
		await f.locator('#pmRoot .composer [data-action="send"]').first().click();
		await f.waitForFunction((n) => { const r = [...document.querySelectorAll('#pmRoot .message.message-assistant')]; return r.length > n && !r[r.length - 1].hasAttribute('data-streaming'); }, n2, { timeout: 30000 }).catch(() => {});
		await t.page.waitForTimeout(3500);
		tx = await f.evaluate(TRANSCRIPT);
		const lastWords = tx.words[tx.words.length - 1] || '';
		await t.check('a normal reply arrives', tx.n > n2, `${tx.n} replies`);
		await t.check('a normal reply says nothing about memory and carries no mark: no Noted, no Verified, no note named in a hover', !REPLY_WORDS.test(lastWords) && !REPLY_WORDS.test(tx.chrome[tx.chrome.length - 1] || '') && !tx.saved[tx.saved.length - 1] && tx.ui.length === 0, JSON.stringify({ words: lastWords.slice(0, 160), chrome: tx.chrome[tx.chrome.length - 1], ui: tx.ui }));
		const ribbon = await f.evaluate(() => [...document.querySelectorAll('#pmRoot .composer .pmx-mem-plate, #pmRoot .composer .pmx-mem-ribbon, #pmRoot [data-capsule-gist]')].length);
		await t.check('the composer shows no “your next message will bring” ribbon', ribbon === 0, `${ribbon}`);
		// every thread the chat lists draws no memory UI
		const sweep = await f.evaluate(async (sel) => {
			const A = window.PM56_APP, c = A && A.ctx && A.ctx(); if (!c) return { err: 'no chat' };
			const out = [], ids = c.state.threads.filter((x) => !x.archived).map((x) => x.id).slice(0, 40);
			for (const id of ids) { c.switchThread(id); c.renderApp(); await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 30))); const hit = [...document.querySelectorAll(`#pmRoot ${sel.split(', ').join(', #pmRoot ')}`)].length; if (hit) out.push(`${id}:${hit}`); }
			return { n: ids.length, hits: out };
		}, MEMORY_UI);
		await t.check('no thread the chat lists draws a memory mark, card, count or rule-change line', !sweep.err && sweep.hits.length === 0, JSON.stringify(sweep));
	});

	T('FO-167 the sheet follows the look', async (t) => {
		if (String(t.args.looks) === 'none') { await t.check('looks skipped (--set looks=none)', true); return; }
		const looks = t.args.looks ? String(t.args.looks).split(',') : LOOKS;
		for (const look of looks) {
			const f = await settings(t, surface, [1390, 900]);
			await setLookBySetting(t, f, look);
			await f.evaluate((ws) => PM51.go('memory', ws), WS);
			await t.page.waitForTimeout(500);
			// what each part paints (a switch's own text colour paints nothing: its knob is its ::after)
			const PAINT = (sel) => { const pick = (s, pseudo, noFg) => { const e = [...document.querySelectorAll(s)].find((x) => x.getClientRects().length); if (!e) return null; const c = getComputedStyle(e, pseudo || null); const o = { bg: c.backgroundColor, bd: c.borderTopColor, r: c.borderTopLeftRadius, sh: c.boxShadow, font: `${c.fontSize} ${c.fontWeight}` }; if (!noFg) o.fg = c.color; return o; }; return { sw: pick(`${sel} .mm-intro .toggle[role="switch"]`, null, true), knob: pick(`${sel} .mm-intro .toggle[role="switch"]`, '::after', true), card: pick(`${sel} .mm-intro`), add: pick(`${sel} .mm-add`), row: pick(`${sel} .mm-row-text`), search: pick(`${sel} .mm-search input`) }; };
			// no hover or focus on either side: read the parts at rest
			const rest = async () => { await t.page.mouse.move(2, 300); await f.evaluate(() => { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); }); await t.page.waitForTimeout(400); };
			await rest();
			const page = await f.evaluate(PAINT, BODY);
			await f.locator('#tab-dashboard').click({ timeout: 15000 }).catch(() => f.evaluate(() => document.getElementById('tab-dashboard').click()));
			await f.waitForFunction(() => !!document.querySelector('#pmRoot .chat-header .pm7-mem-btn'), null, { timeout: 20000 }).catch(() => {});
			await t.page.waitForTimeout(500);
			await f.locator('#pmRoot .chat-header .pm7-mem-btn').first().click().catch(() => {});
			await t.page.waitForTimeout(600);
			await rest();
			const sheet = await f.evaluate(PAINT, '.pm7-mem-layer:not([hidden]) .pm7-mem-sheet');
			const diff = [];
			// Glass by design: a card on the wallpaper takes Liquid Glass's card tint, a card inside a frosted sheet (the sheet is a
			// data-lg-surface="menu") the plain inner fill (glass.css, Settings' "inside a sheet" rule), so the card's fill is left out there
			const skip = look.startsWith('glass') ? new Set(['card.bg']) : new Set();
			for (const k of Object.keys(page)) { if (!page[k] || !sheet[k]) { diff.push(`${k}: missing (page ${!!page[k]}, sheet ${!!sheet[k]})`); continue; } for (const f2 of Object.keys(page[k])) if (!skip.has(`${k}.${f2}`) && page[k][f2] !== sheet[k][f2]) diff.push(`${k}.${f2}: page ${page[k][f2].slice(0, 80)} / sheet ${String(sheet[k][f2]).slice(0, 80)}`); }
			await t.check(`${look}: the sheet's switch, knob, card, Add button, search box and note words paint like the Settings page's`, diff.length === 0, diff.join(' | ') || 'same');
			await t.page.keyboard.press('Escape');
			await t.app.resetLayout();
		}
	});

	T('FO-167 at a phone’s width', async (t) => {
		const f = await settings(t, surface, [390, 844]);
		const r = await read(f, 'page');
		const lay = await f.evaluate((b) => { const q = (s) => { const e = document.querySelector(`${b} ${s}`); return e ? e.getBoundingClientRect() : null; }; const s = q('.mm-search'), l = q('.mm-level .pm51-dd-trigger'), a = q('.mm-add'), list = q('.mm-list'); return { s: s && [s.left, s.right, s.top], l: l && [l.left, l.right, l.top], a: a && [a.left, a.right, a.top], list: list && [list.left, list.right], vw: innerWidth, sw: document.documentElement.scrollWidth }; }, BODY);
		await t.check('390x844: the page keeps its parts (switch, search, filter, Add, six notes)', r && r.switchOn === 'true' && r.search && r.level === 'All' && r.add === 'Add memory' && r.cur.length === 6, r && JSON.stringify({ s: r.search, l: r.level, n: r.cur.length }));
		await t.check('390x844: search has its own line, the filter and Add share the next, and nothing runs off the screen', lay.s && lay.l && lay.a && lay.l[2] > lay.s[2] && Math.abs(lay.l[2] - lay.a[2]) < 4 && lay.list[1] <= lay.vw && lay.a[1] <= lay.vw && lay.sw <= lay.vw + 1, JSON.stringify(lay));
		const g = await home(t, surface, [390, 844]);
		const btn = g.locator('#pmRoot .chat-header .pm7-mem-btn').first();
		if (await btn.count()) {
			await btn.click().catch(() => {});
			await t.page.waitForTimeout(600);
		}
		const s = await g.evaluate(SHEET);
		await t.check('390x844: the chat’s Memory button opens the sheet, inside the chat', s.open && s.inChat && s.onTop, JSON.stringify(s));
	});

	T('FO-199 the sheet follows a held chat resize, no spill at any frame', async (t) => {
		const f = await home(t, surface, [1920, 1080]);
		// the review's starting state: a 600 px chat column with Memory open over it
		await f.evaluate(() => PMW.chatCol.setWidth(600));
		await t.settle();
		await t.page.waitForTimeout(400);
		await f.locator('#pmRoot .chat-header .pm7-mem-btn').first().click();
		await f.waitForFunction(() => { const l = document.querySelector('.pm7-mem-layer'); return l && !l.hidden && l.classList.contains('is-open'); }, null, { timeout: 8000 });
		await t.page.waitForTimeout(400);
		// sample the sheet's edges against the chat's on every frame a drag move paints, and while the drag is held.
		// The chat column is right-anchored, so its right edge never moves; the spill is its left edge walking right
		// while the sheet stays put. Both edges are judged, so a sheet left behind cannot pass on the still right edge.
		await f.evaluate(() => {
			window.__fo199 = { samples: [], moves: 0 };
			const read = (why) => {
				const l = document.querySelector('.pm7-mem-layer'), c = document.getElementById('chatPanel');
				if (!l || l.hidden || !c) return;
				const s = l.querySelector('.pm7-mem-sheet').getBoundingClientRect(), r = c.getBoundingClientRect();
				window.__fo199.samples.push({ why, sheetLeft: s.left, chatLeft: r.left, sheetRight: s.right, chatRight: r.right, chatW: r.width, resizing: document.body.classList.contains('pm-resizing') });
			};
			window.__fo199.read = read;
			document.addEventListener('pointermove', () => {
				if (!document.body.classList.contains('pm-resizing')) return;
				window.__fo199.moves++;
			}, true);
			// sample what the frame paints: ResizeObserver callbacks run after layout and before paint, in the
			// observers' creation order. The sheet's own observer (openSheet made it) re-places the sheet first;
			// this one, created after it, reads the re-placed geometry. A rAF read would run before that step and
			// catch a one-step lag that never paints.
			new ResizeObserver(() => { if (document.body.classList.contains('pm-resizing')) read('move'); }).observe(document.getElementById('chatPanel'));
		});
		const fe = f === t.page.mainFrame() ? null : await f.frameElement(), off = fe ? await fe.boundingBox() : { x: 0, y: 0 };
		// the sheet's scrim covers the resizer's right half (the chat's left edge); only its left edge is exposed,
		// so grab there (the review's "exposed left edge"), not the centre, which lands on the scrim
		const box = await f.evaluate(() => { const r = document.getElementById('chatResizer'); if (!r) return null; const b = r.getBoundingClientRect(); const grab = document.elementFromPoint(b.x + 1.5, b.y + b.height / 2); return { x: b.x, y: b.y, w: b.width, h: b.height, hidden: r.classList.contains('hidden'), grabOnResizer: !!(grab && grab.closest && grab.closest('#chatResizer')) }; });
		await t.check('the chat resizer’s left edge is exposed beside the open sheet', !!box && !box.hidden && box.w >= 3 && box.h > 100 && box.grabOnResizer, JSON.stringify(box));
		if (!box || box.hidden || !box.grabOnResizer) return;
		const x0 = off.x + box.x + 1.5, y0 = off.y + box.y + box.h / 2;
		await t.page.mouse.move(x0, y0);
		await t.page.mouse.down();
		await t.page.waitForTimeout(120);
		// 600 -> 421 px: a real 179 px drag right in steps, then a ~600 ms hold (a 1 px breath keeps frames painting)
		for (let i = 1; i <= 12; i++) { await t.page.mouse.move(x0 + 179 * i / 12, y0); await t.page.waitForTimeout(16); }
		for (let k = 0; k < 6; k++) { await t.page.mouse.move(x0 + 179 + (k % 2 ? 1 : -1), y0); await t.page.waitForTimeout(100); }
		const held = await f.evaluate(() => { window.__fo199.read('hold'); return { resizing: document.body.classList.contains('pm-resizing'), chatW: document.getElementById('chatPanel').getBoundingClientRect().width }; });
		await t.page.mouse.up();
		await t.page.waitForTimeout(500);
		const after = await f.evaluate(() => {
			const l = document.querySelector('.pm7-mem-layer'), c = document.getElementById('chatPanel');
			const sr = l.querySelector('.pm7-mem-sheet').getBoundingClientRect(), cr = c.getBoundingClientRect();
			return { samples: window.__fo199.samples, moves: window.__fo199.moves, open: !l.hidden, final: { sheetLeft: sr.left, chatLeft: cr.left, sheetRight: sr.right, chatRight: cr.right, chatW: cr.width, sheetW: sr.width } };
		});
		const edgeGap = (s) => Math.max(Math.abs(s.sheetLeft - s.chatLeft), Math.abs(s.sheetRight - s.chatRight));
		const spill = after.samples.filter((s) => edgeGap(s) > 1);
		const worst = after.samples.reduce((m, s) => Math.max(m, edgeGap(s)), 0);
		await t.check('the drag was admitted and held the chat at about 421 px', held.resizing && held.chatW >= 415 && held.chatW <= 427 && after.moves >= 8, JSON.stringify({ held, moves: after.moves }));
		await t.check('every sampled frame keeps both the sheet’s edges within 1 px of the chat’s', after.samples.length >= 8 && spill.length === 0, `${after.samples.length} samples, worst ${worst.toFixed(1)} px${spill.length ? `, e.g. ${JSON.stringify(spill[0])}` : ''}`);
		await t.check('after release the sheet still fits the resized chat', after.open && Math.abs(after.final.sheetLeft - after.final.chatLeft) <= 1 && Math.abs(after.final.sheetRight - after.final.chatRight) <= 1 && Math.abs(after.final.sheetW - after.final.chatW) <= 2, JSON.stringify(after.final));
		await t.page.keyboard.press('Escape');
		await t.page.waitForTimeout(450);
	});

	T('FO-200 a quick Escape then Enter reopen stays open', async (t) => {
		const f = await home(t, surface);
		const btn = f.locator('#pmRoot .chat-header .pm7-mem-btn').first();
		await btn.click();
		await f.waitForFunction(() => { const l = document.querySelector('.pm7-mem-layer'); return l && !l.hidden && l.classList.contains('is-open'); }, null, { timeout: 8000 });
		await t.page.waitForTimeout(400);
		// watch the race: when Escape landed, when Enter reached the restored button, when the sheet came back,
		// and whether anything hid it again
		await f.evaluate(() => {
			window.__fo200 = { esc: 0, enter: 0, enterOnBtn: false, back: 0, hidden: 0 };
			const l = document.querySelector('.pm7-mem-layer'), w = window.__fo200;
			new MutationObserver(() => {
				const now = performance.now();
				if (!l.hidden && l.classList.contains('is-open') && w.esc && !w.back) w.back = now;
				if (l.hidden && w.back) w.hidden = now;
			}).observe(l, { attributes: true, attributeFilter: ['hidden', 'class'] });
			document.addEventListener('keydown', (e) => {
				if (e.key === 'Escape' && !w.esc) w.esc = performance.now();
				if (e.key === 'Enter' && w.esc && !w.enter) { w.enter = performance.now(); w.enterOnBtn = !!(document.activeElement && document.activeElement.closest && document.activeElement.closest('.pm7-mem-btn')); }
			}, true);
		});
		const reps = [];
		for (let i = 0; i < 3; i++) {
			await f.evaluate(() => { const w = window.__fo200; w.esc = 0; w.enter = 0; w.enterOnBtn = false; w.back = 0; w.hidden = 0; });
			await t.page.keyboard.press('Escape');
			await t.page.waitForTimeout(160);
			await t.page.keyboard.press('Enter');
			await t.page.waitForTimeout(1000);
			reps.push(await f.evaluate(() => {
				const l = document.querySelector('.pm7-mem-layer'), w = window.__fo200;
				return { open: !!l && !l.hidden && l.classList.contains('is-open'), escToEnter: w.enter && w.esc ? Math.round(w.enter - w.esc) : null, escToBack: w.back && w.esc ? Math.round(w.back - w.esc) : null, enterOnBtn: w.enterOnBtn, hiddenAgain: !!w.hidden };
			}));
		}
		// the race window is Escape -> Enter (the button's click opens the sheet synchronously); the is-open class
		// lands a frame later, which a slow surface can push past 220 ms without the reopen itself being late
		await t.check('each reopen landed on the restored header button inside the 220 ms close window', reps.every((r) => r.enterOnBtn && r.escToEnter !== null && r.escToEnter > 0 && r.escToEnter < 220), JSON.stringify(reps));
		await t.check('the sheet is still open 1 s after each quick reopen (no stale close timer hides it)', reps.every((r) => r.open && !r.hiddenAgain), JSON.stringify(reps));
		await t.page.keyboard.press('Escape');
		await t.page.waitForTimeout(450);
	});

	T('FO-202 under Reduce Motion, View paints a static highlight on the note', async (t) => {
		await setMotionMedia(t, 'reduce');
		try {
			const f = await home(t, surface);
			const reduced = await f.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
			await t.check('Reduce Motion is on before load', reduced, String(reduced));
			const ran = await runDemo(t, f, 'memory-saved');
			await t.check('Demo Studio runs the memory-saved reply', ran && ran.ok !== false && !ran.err, JSON.stringify(ran));
			await f.locator('#pmRoot .message-assistant .pm7-mem-saved .pm7-mem-view').first().click();
			await f.waitForFunction(() => { const l = document.querySelector('.pm7-mem-layer'); return l && !l.hidden; }, null, { timeout: 8000 });
			await t.page.mouse.move(2, 300);
			await t.page.waitForTimeout(500);
			const FLASH = () => {
				const row = document.querySelector('.pm7-mem-layer:not([hidden]) .mm-row.is-flash');
				if (!row) return null;
				const c = getComputedStyle(row);
				return { id: row.getAttribute('data-mm-note'), bg: c.backgroundColor, shadow: c.boxShadow, anim: c.animationName, reduced: matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.getAttribute('data-motion') === 'reduced' };
			};
			const lit = await f.evaluate(FLASH);
			await t.check('View opens the sheet with the note marked is-flash under reduced motion', !!lit && lit.reduced, JSON.stringify(lit));
			if (!lit) return;
			await t.check('the highlight is a visible static paint (background not transparent) with no animation', lit.bg !== 'rgba(0, 0, 0, 0)' && lit.bg !== 'transparent' && lit.anim === 'none', JSON.stringify({ bg: lit.bg, anim: lit.anim, shadow: lit.shadow }));
			const row = f.locator(`.pm7-mem-layer:not([hidden]) .mm-row[data-mm-note="${lit.id}"]`).first();
			const hot = decodePng(await row.screenshot());
			// the flash's own lifetime ends the highlight; the same note un-highlighted must paint differently
			await t.page.waitForTimeout(2600);
			const gone = await f.evaluate((id) => !document.querySelector(`.pm7-mem-layer:not([hidden]) .mm-row.is-flash[data-mm-note="${id}"]`), lit.id);
			await t.check('the highlight ends with the flash’s lifetime', gone, String(gone));
			const cold = decodePng(await row.screenshot());
			let diff = 0;
			if (hot.width === cold.width && hot.height === cold.height) for (let i = 0; i < hot.data.length; i += 4) { if (Math.max(Math.abs(hot.data[i] - cold.data[i]), Math.abs(hot.data[i + 1] - cold.data[i + 1]), Math.abs(hot.data[i + 2] - cold.data[i + 2])) > 8) diff++; }
			const px = hot.width * hot.height;
			await t.check('the highlighted note’s pixels differ from the same note un-highlighted', hot.width === cold.width && hot.height === cold.height && px > 0 && diff / px >= 0.2, `${diff}/${px} pixels changed`);
			await t.page.keyboard.press('Escape');
			await t.page.waitForTimeout(450);
		} finally {
			await setMotionMedia(t, 'no-preference');
		}
	});
}
