// Checks of the refined Settings managers (Concepts/settings-managers/fable-5.2-refine), by real clicks.
//   browser-check run Concepts/settings-managers/fable-5.2-refine/tools --set page=<refined page>
//     [--set before=<PMConcept7 page of the same base>]     needed by "nothing was dropped"
// Each test says what a person sees. A test that needs the unchanged page for comparison says so and is skipped
// without it, never passed.
const sleep = (f, ms) => f.waitForTimeout(ms);
const T = `(n) => (n ? n.textContent : '').replace(/\\s+/g, ' ').trim()`;

async function openSettings(t, size = [1600, 1000]) {
	await t.viewport(size[0], size[1]);
	const f = await t.app.open({ settleMs: 1500 });
	await f.locator('#tab-settings').click();
	await f.waitForSelector('#pm-settings-root .domain-link', { timeout: 20000 });
	await sleep(f, 600);
	return f;
}
const go = async (f, domain, ws) => { await f.evaluate(([d, w]) => window.PM51.go(d, w), [domain, ws]); await sleep(f, 1300); };
const block = (ws) => `#pm-settings-root .workspace-block[data-workspace-block="${ws}"]`;
const tab = async (f, ws, id) => { await f.locator(`${block(ws)} [role="tab"][data-action="pm51-tab"][data-tab="${id}"]`).first().click(); await sleep(f, 900); };
const shown = (f, sel) => f.evaluate((sel) => [...document.querySelectorAll(sel)].filter((n) => n.getClientRects().length && getComputedStyle(n).visibility !== 'hidden').length, sel);
async function closeAll(f) {
	for (let i = 0; i < 4; i++) {
		const b = f.locator('.pmt-cz-done:visible, .drawer-wrap:not([data-closing="1"]) .pm51-panel-close:visible, .overlay [data-action="close-overlay"]:visible').first();
		if (!(await b.count()) || !(await b.isVisible().catch(() => false))) break;
		await b.click().catch(() => {}); await sleep(f, 600);
	}
}
/* every setting row and every action of every Settings view: the page's own list of chapters and managers is walked */
async function inventory(f) {
	return f.evaluate(async () => {
		const wait = (ms) => new Promise((r) => setTimeout(r, ms));
		const ids = new Set(), actions = new Set(), views = [];
		for (const d of window.PM12_DATA.domains) for (const w of d.workspaces) {
			if (w.virtualAllSettings) continue;
			window.PM12_KIMI.navigate(d.id, w.id); await wait(1200);
			const find = () => [...document.querySelectorAll('#pm-settings-root .workspace-block')].find((b) => b.dataset.workspaceBlock === w.id);
			let b = find(); if (!b) continue;
			const tabs = [...b.querySelectorAll('[role=tablist]')].filter((n) => n.getClientRects().length)[0];
			const n = tabs ? tabs.querySelectorAll('[role=tab]').length : 1;
			for (let i = 0; i < n; i++) {
				/* wait for the clicked tab to be the chosen one, then for its page: a fixed wait once read the tab before */
				if (tabs) { const tl = () => find().querySelectorAll('[role=tablist]')[0].querySelectorAll('[role=tab]'); tl()[i].click(); for (let k = 0; k < 30; k++) { await wait(150); const cur = tl()[i]; if (cur && cur.getAttribute('aria-selected') === 'true') break; } await wait(700); }
				b = find(); if (!b) break;
				views.push(`${d.id}/${w.id}/${i}`);
				b.querySelectorAll('[id^="setting-"], [data-setting-id]').forEach((r) => ids.add((r.id && r.id.indexOf('setting-') === 0 ? r.id.slice(8) : '') || r.getAttribute('data-setting-id')));
				b.querySelectorAll('[data-action]').forEach((x) => actions.add(x.getAttribute('data-action')));
			}
		}
		return { ids: [...ids].sort(), actions: [...actions].sort(), views };
	});
}

export const tests = {
	async 'Servers & Remote Access is a chapter of its own, and old ways in still arrive'(t) {
		const f = await openSettings(t);
		const rail = await f.evaluate(() => [...document.querySelectorAll('#pm-settings-root .domain-list .domain-link .domain-name')].map((n) => n.textContent.trim()));
		const at = rail.indexOf('Servers & Remote Access');
		await t.check('the chapter list names it, right under AI & Providers', at > 0 && rail[at - 1] === 'AI & Providers', rail.join(' | '));
		await f.locator('#pm-settings-root .domain-link', { hasText: 'Servers & Remote Access' }).first().click();
		await sleep(f, 1300);
		const tabs = await f.evaluate((sel) => [...document.querySelectorAll(`${sel} [role="tab"][data-action="pm51-tab"]`)].map((n) => n.textContent.trim()), block('servers'));
		await t.check('it is the same manager with its five tabs', tabs.join('|') === 'Overview|Servers|Devices|Away From Home|Move & Copy', tabs.join('|'));
		await t.check('a chapter with one manager has no chapter tab strip', (await shown(f, '#pm-settings-root .workspace-tabs .workspace-tab')) === 0);
		await f.locator('#pm-settings-root .domain-link', { hasText: 'System' }).first().click(); await sleep(f, 1300);
		const sys = await f.evaluate(() => [...document.querySelectorAll('#pm-settings-root .workspace-tabs .workspace-tab')].map((n) => n.textContent.trim()));
		await t.check('System no longer lists it', sys.length >= 4 && !sys.some((x) => /Server/.test(x)), sys.join(' | '));
		await f.evaluate(() => window.PM51.go('system', 'servers')); await sleep(f, 1300);
		const st = await f.evaluate(() => { const s = window.PM12_KIMI.getState(); return { domain: s.domain, ws: s.workspace }; });
		await t.check('an old link to System › servers lands on the new chapter', st.domain === 'servers-access' && st.ws === 'servers', JSON.stringify(st));
	},

	async 'Explain: sentences are asked for, and the choice is kept'(t) {
		const f = await openSettings(t);
		await go(f, 'servers-access', 'servers');
		const help = `${block('servers')} .pm51-row-help`;
		await t.check('there are sentences to show', (await f.locator(help).count()) > 0);
		await t.check('off at first: a row is its name and its control', (await shown(f, help)) === 0);
		await f.locator('#pm-settings-root [data-action="pm51-rf-explain"]').first().click(); await sleep(f, 400);
		await t.check('on: the sentences show', (await shown(f, help)) > 0);
		await t.check('the button says it is on', (await f.locator('#pm-settings-root [data-action="pm51-rf-explain"]').first().getAttribute('aria-pressed')) === 'true');
		await go(f, 'general', 'app-input');
		await t.check('it stays on on another page', (await shown(f, `${block('app-input')} .setting-description`)) > 0);
		await f.locator('#pm-settings-root [data-action="pm51-rf-explain"]').first().click(); await sleep(f, 400);
		await t.check('off again: none show', (await shown(f, `${block('app-input')} .setting-description`)) === 0);
		await t.check('the row\'s own About button is still there', (await shown(f, `${block('app-input')} .o55-about`)) > 10);
	},

	async 'left as Jared asked: the tab strips are centred and the side column lists the chapter'(t) {
		/* FO-184. Since the sixth pass the chapter's strip shares its row with Explain, the project and the page options, and
		   stands over the middle of the page under it (the axis of the manager's own title and strip) whenever the row has
		   room on both sides; when it has not, the strip sits beside the buttons instead of somewhere in between. */
		const f = await openSettings(t);
		await go(f, 'general', 'notifications');
		const room = await f.evaluate((sel) => {
			const mid = (r) => r.left + r.width / 2, R = (n) => n.getBoundingClientRect();
			const track = document.querySelector('#pm-settings-root nav.workspace-tabs .rf-bar-track'), main = document.querySelector('#pm-settings-root .document-main');
			const page = document.querySelector(`${sel} .pm51-mgr > .pm51-tabs`), body = document.querySelector(`${sel} .pm51-mgr`);
			return { top: Math.round(mid(R(track)) - mid(R(main))), axis: Math.round(mid(R(track)) - mid(R(page))), page: Math.round(mid(R(page)) - mid(R(body))) };
		}, block('notifications'));
		await t.check('with room, the chapter\'s tab strip is centred over the page (FO-184)', Math.abs(room.top) <= 3 && Math.abs(room.axis) <= 3, JSON.stringify(room));
		await t.check('the manager\'s tab strip is centred (FO-184)', Math.abs(room.page) <= 3, `${room.page} px off`);
		/* a wide window opens the assistant beside Settings, which leaves the bar less room than four tabs and three buttons want */
		await t.viewport(1920, 1080); await go(f, 'ai', 'providers'); await sleep(f, 500);
		const got = await f.evaluate((sel) => {
			const mid = (r) => r.left + r.width / 2, R = (n) => n.getBoundingClientRect();
			const nav = document.querySelector('#pm-settings-root nav.workspace-tabs'), track = nav.querySelector('.rf-bar-track'), tools = nav.querySelector('.rf-bar-tools .page-actions'), main = document.querySelector('#pm-settings-root .document-main');
			const page = document.querySelector(`${sel} .pm51-mgr > .pm51-tabs`), body = document.querySelector(`${sel} .pm51-mgr`);
			const index = document.querySelector('#pm-settings-root .page-index');
			return { off: Math.round(mid(R(track)) - mid(R(main))), gap: Math.round(R(tools).left - R(track).right), inside: R(track).left >= R(nav).left - 0.5, rows: Math.round(R(nav).height), page: Math.round(mid(R(page)) - mid(R(body))),
				index: !!index && index.getClientRects().length > 0, groups: [...document.querySelectorAll('#pm-settings-root .page-index .pm51-index-group')].filter((n) => n.getClientRects().length).length };
		}, block('providers'));
		await t.check('without room to centre, the strip sits beside the buttons, whole, in the one row', Math.abs(got.off) <= 3 || (got.gap >= 12 && got.gap <= 20 && got.inside && got.rows <= 50), JSON.stringify(got));
		await t.check('the manager\'s tab strip is centred there too', Math.abs(got.page) <= 3, `${got.page} px off`);
		await t.check('the side column is there on a manager with tabs, with every manager of the chapter (FO-185)', got.index && got.groups === 4, JSON.stringify(got));
	},

	async 'Servers › Overview: where the files are kept, which computers do the work, what you steer from'(t) {
		for (const size of [[1600, 1000], [1280, 800]]) {
			const f = await openSettings(t, size), at = `${size[0]}x${size[1]}`;
			await go(f, 'servers-access', 'servers'); await tab(f, 'servers', 'home');
			const got = await f.evaluate((sel) => {
				const b = document.querySelector(sel), T = (n) => (n ? n.textContent : '').replace(/\s+/g, ' ').trim();
				const cards = [...b.querySelectorAll('.rf-map > .rf-map-card')];
				const clipped = [...b.querySelectorAll('.rf-map-name, .rf-map-code, .rf-map-qt, .rf-map-a')].filter((n) => n.scrollWidth > n.clientWidth + 1).map(T);
				const S = window.PM51.s().serverProject;
				return {
					asks: cards.map((c) => T(c.querySelector('.rf-map-qt'))), tops: cards.map((c) => Math.round(c.getBoundingClientRect().top)),
					path: T(b.querySelector('.rf-map-files .rf-map-code')), want: S.sourceLocation.path,
					home: !!b.querySelector('.rf-map-files [data-action="pm51-servers-home"]'), files: !!b.querySelector('.rf-map-files [data-action="pm51-servers-files"]'),
					work: [...b.querySelectorAll('.rf-map-work .rf-map-name')].map(T), exec: !!b.querySelector('.rf-map-work [data-action="pm51-servers-exec"]'), link: T(b.querySelector('.rf-map-work [data-action="pm51-servers-add"]')),
					devices: [...b.querySelectorAll('.rf-map-devices .rf-map-name')].map(T), connect: T(b.querySelector('.rf-map-devices [data-action="pm51-servers-pair"]')),
					away: [...b.querySelectorAll('.rf-map-away .rf-map-fl')].map(T), clipped, servers: S.servers.filter((x) => x.runsWork !== false).length
				};
			}, block('servers'));
			await t.check(`${at}: three cards ask the three things in order`, got.asks.join('|') === 'Files are kept on|Work runs on|You steer from', got.asks.join('|'));
			await t.check(`${at}: the cards start on one line, or stack where there is no room for three`, new Set(got.tops).size === 1 || new Set(got.tops).size === 3, got.tops.join(','));
			await t.check(`${at}: the files card shows the whole folder, with the home server and Change folder`, got.path === got.want && got.home && got.files, JSON.stringify([got.path, got.want, got.home, got.files]));
			await t.check(`${at}: every computer that runs work is listed, with where new work starts and Link a server`, got.work.length >= got.servers && got.exec && /Link a server/.test(got.link), JSON.stringify([got.work, got.servers, got.exec, got.link]));
			await t.check(`${at}: the devices are listed with Connect a device`, got.devices.length >= 1 && /Connect a device/.test(got.connect), JSON.stringify([got.devices, got.connect]));
			await t.check(`${at}: away from home says what is used now and when away`, got.away.join('|') === 'Right now|When away', got.away.join('|'));
			await t.check(`${at}: no name or path is cut off`, got.clipped.length === 0, got.clipped.join(' | '));
			if (size[0] === 1600) {
				const name = got.work[got.work.length > 2 ? 2 : 0];
				await f.locator(`${block('servers')} .rf-map-work .rf-map-row`).filter({ hasText: name }).first().click(); await sleep(f, 900);
				const open = await f.evaluate((sel) => { const b = document.querySelector(sel), T = (n) => (n ? n.textContent : '').replace(/\s+/g, ' ').trim(); return { tab: T(b.querySelector('[role="tab"][aria-selected="true"]')), title: T(b.querySelector('.pm51-detail-title')) }; }, block('servers'));
				await t.check('a computer on the map opens on the Servers tab', open.tab === 'Servers' && open.title.indexOf(name) === 0, JSON.stringify(open));
			}
		}
	},

	async 'what looked wrong: the band, the covered title, the chosen row, the light, the side column'(t) {
		const f = await openSettings(t);
		await go(f, 'memory', 'personas');
		const head = await f.evaluate((sel) => { const h = document.querySelector(`${sel} .pm51-roster .roster-head`); const a = h.querySelector('.roster-title').getBoundingClientRect(), b = h.querySelector('button').getBoundingClientRect(); return { titleRight: Math.round(a.right), buttonLeft: Math.round(b.left), title: h.querySelector('.roster-title').scrollWidth <= h.querySelector('.roster-title').clientWidth + 1 }; }, block('personas'));
		await t.check('the list\'s title is whole and clear of its add button', head.title && head.titleRight <= head.buttonLeft, JSON.stringify(head));
		const row = await f.evaluate((sel) => {
			const r = document.querySelector(`${sel} .pm51-roster .resource-row[aria-current="true"]`), o = document.querySelector(`${sel} .pm51-roster .resource-row[aria-current="false"]`);
			const lum = (c) => { const m = c.match(/[\d.]+/g).map(Number); return (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255; };
			return { name: lum(getComputedStyle(r.querySelector('.resource-row-name')).color), other: lum(getComputedStyle(o.querySelector('.resource-row-name')).color), icon: getComputedStyle(r.querySelector('.resource-avatar')).color, iconOther: getComputedStyle(o.querySelector('.resource-avatar')).color, image: getComputedStyle(r).backgroundImage };
		}, block('personas'));
		await t.check('the chosen row keeps light words and its icon\'s own colour, with no slab over it', row.name > 0.6 && row.icon === row.iconOther && row.image === 'none', JSON.stringify(row));
		await t.page.mouse.move(1100, 600); for (let i = 0; i < 4; i++) { await t.page.mouse.wheel(0, 240); await sleep(f, 120); }
		await sleep(f, 500);
		const strip = await f.evaluate((sel) => { const n = document.querySelector(`${sel} .manager-tabs.pm51-tabs`); const cs = getComputedStyle(n); return { stuck: n.classList.contains('is-stuck'), clip: cs.clipPath, wide: /\b(\d{4,})px/.test(cs.boxShadow) }; }, block('personas'));
		await t.check('scrolled, the tab strip is stuck and lays no band across the page', strip.stuck && strip.clip === 'none' && !strip.wide, JSON.stringify(strip));
		await go(f, 'ai', 'providers');
		const light = await f.evaluate((sel) => { const d = document.querySelector(`${sel} .pm51-roster .resource-row[aria-current="true"] .status-dot`); return d ? getComputedStyle(d).boxShadow : 'no light'; }, block('providers'));
		await t.check('the chosen service\'s light has no ring', light === 'none', light);
		await go(f, 'general', 'app-input');
		const before = await f.evaluate(() => [...document.querySelectorAll('#pm-settings-root .page-index-card .index-link')].filter((n) => n.getClientRects().length).map((n) => { const r = document.createRange(); r.selectNodeContents(n); const b = r.getBoundingClientRect(); return [(n.classList.contains('pm51-index-tab') ? 'tab:' : 'link:') + n.textContent.trim().slice(0, 24), Math.round(b.left), Math.round(b.width), getComputedStyle(n).fontWeight]; }));
		const wasAt = await f.evaluate(() => ((document.querySelector('#pm-settings-root .page-index-card .index-link.is-active') || {}).textContent || '').trim());
		await t.page.mouse.move(1100, 600); for (let i = 0; i < 8; i++) { await t.page.mouse.wheel(0, 300); await sleep(f, 140); }
		await sleep(f, 500);
		const after = await f.evaluate(() => ({ rows: [...document.querySelectorAll('#pm-settings-root .page-index-card .index-link')].filter((n) => n.getClientRects().length).map((n) => { const r = document.createRange(); r.selectNodeContents(n); const b = r.getBoundingClientRect(); return [(n.classList.contains('pm51-index-tab') ? 'tab:' : 'link:') + n.textContent.trim().slice(0, 24), Math.round(b.left), Math.round(b.width), getComputedStyle(n).fontWeight]; }), active: (document.querySelector('#pm-settings-root .page-index-card .index-link.is-active') || {}).textContent, lens: [...document.querySelectorAll('#pm-settings-root nav.page-index-card > .lg-lenses-under')].filter((n) => getComputedStyle(n).display !== 'none').length }));
		const moved = before.filter((b) => { const a = after.rows.find((x) => x[0] === b[0]); return a && (a[1] !== b[1] || a[2] !== b[2] || a[3] !== b[3]); });
		await t.check('scrolling moved the side column\'s mark to another entry', !!after.active && after.active.trim() !== wasAt, `${wasAt} -> ${String(after.active).trim()}`);
		await t.check('no entry\'s words moved or changed weight while it did, and the app\'s own chip marks the place', moved.length === 0 && after.lens >= 1, JSON.stringify({ moved, lens: after.lens }));
		/* Jared, 2026-11-23: "DO NOT USE THESE SIDE COLORED TABS!" A chosen row or entry has no stripe down one side. */
		const stripes = await f.evaluate(() => {
			const oneSide = (n) => { const c = getComputedStyle(n); const sh = c.boxShadow.split(/,(?![^(]*\))/).some((x) => /inset/.test(x) && /(^|\s)-?[1-9][\d.]*px\s+-?[\d.]+px\s+[\d.]+px\s+[\d.]+px/.test(x.replace(/(rgba?|color)\([^)]*\)/g, '').trim())); const w = [c.borderLeftWidth, c.borderRightWidth, c.borderTopWidth, c.borderBottomWidth].map(parseFloat); const col = [c.borderLeftColor, c.borderRightColor]; return sh || (w[0] >= 2 && w[0] > w[1] && col[0] !== 'rgba(0, 0, 0, 0)'); };
			return [...document.querySelectorAll('#pm-settings-root .page-index-card .index-link.is-active, #pm-settings-root .pm51-roster .resource-row[aria-current="true"], #pm-settings-root .domain-link.active')].filter((n) => n.getClientRects().length && oneSide(n)).map((n) => n.className + ':' + n.textContent.trim().slice(0, 20));
		});
		await t.check('no chosen row or side-column entry carries a coloured stripe down one side', stripes.length === 0, JSON.stringify(stripes));
		/* while the chip travels it carries copies of the rows' words; they must sit exactly on the words themselves */
		let seen = 0, worst = 0;
		for (let round = 0; round < 3 && !seen; round++) {
			await f.evaluate(() => {
				const nav = document.querySelector('#pm-settings-root nav.page-index-card'); window.__rfTw = { seen: 0, worst: 0 };
				const t0 = performance.now();
				(async () => { while (performance.now() - t0 < 1800) { await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));
					const hop = nav.querySelector('lg-over.lg-hops .lg-carry'); if (!hop) continue;
					const hopTf = new DOMMatrixReadOnly(getComputedStyle(hop).transform === 'none' ? undefined : getComputedStyle(hop).transform);
					const tw = nav.querySelector('lg-over.lg-hops .lg-carry-twins'); if (!tw) continue;
					for (const twin of tw.querySelectorAll('.lg-twin')) { const real = [...nav.querySelectorAll('.pm51-index-group > .index-link')].find((a) => a.textContent.trim() === twin.textContent.trim()); if (!real) continue;
						const rg = document.createRange(); rg.selectNodeContents(twin); const a = rg.getBoundingClientRect(); rg.selectNodeContents(real); const b = rg.getBoundingClientRect(); if (!a.width || !b.width) continue;
						window.__rfTw.seen++; window.__rfTw.worst = Math.max(window.__rfTw.worst, Math.abs(a.left - b.left)); }
				} })();
			});
			await t.page.mouse.move(1100, 600); await t.page.mouse.wheel(0, round % 2 ? -520 : 520); await sleep(f, 2000);
			const r = await f.evaluate(() => window.__rfTw); seen = r.seen; worst = r.worst;
		}
		await t.check('the words the travelling chip carries sit on the rows\' own words (they sat 9 px to the left)', seen > 0 && worst <= 1.5, JSON.stringify({ samples: seen, worstPx: Math.round(worst * 10) / 10 }));
	},
	async 'fourth pass: one card for a list and its detail, rows on one grid, Add shows what there is to add'(t) {
		const f = await openSettings(t);
		await go(f, 'ai', 'web');
		const col = await f.evaluate((sel) => { const s = document.querySelector(`${sel} .split-manager.pm51-split`), r = s.querySelector('.pm51-roster'); const c = getComputedStyle(s, '::before'); const sb = s.getBoundingClientRect(), rb = r.getBoundingClientRect(); return { split: Math.round(sb.height), list: Math.round(rb.height), column: c.content !== 'none' ? Math.round(parseFloat(c.height)) : 0, line: c.borderRightWidth, listLine: getComputedStyle(r).borderRightColor }; }, block('web'));
		await t.check('the list\'s column and its dividing line run the whole height of the card, however short the list', col.column >= col.split - 3 && col.split > col.list && parseFloat(col.line) >= 1, JSON.stringify(col));
		const webEdge = await f.evaluate((sel) => [...new Set([...document.querySelectorAll(`${sel} .pm51-detail-content .setting-row.o55-row > .setting-control > *:last-child`)].filter((n) => n.getClientRects().length && !n.closest('details')).map((n) => Math.round(n.getBoundingClientRect().right)))], block('web'));
		await t.check('Web & Research: every control of an ability ends at one edge, the wide rows too', webEdge.length === 1, JSON.stringify(webEdge));
		await tab(f, 'web', 'services');
		const svc = await f.evaluate((sel) => { const rows = [...document.querySelectorAll(`${sel} .o55-web-services .pm51-acc-head`)]; const L = (n) => (n ? Math.round(n.getBoundingClientRect().left) : null), R = (n) => (n ? Math.round(n.getBoundingClientRect().right) : null); return { n: rows.length, state: [...new Set(rows.map((r) => L(r.querySelector('.pm51-status'))))], sw: [...new Set(rows.map((r) => R(r.querySelector('.pm51-toggle'))).filter((x) => x != null))], btn: [...new Set(rows.map((r) => R(r.querySelector('.pm51-acc-toggle'))))], word: [...new Set(rows.map((r) => getComputedStyle(r.querySelector('.pm51-acc-toggle'), '::after').content))] }; }, block('web'));
		await t.check('Search services: every state starts at one place, the switches and the Manage buttons each end at one place', svc.n >= 6 && svc.state.length === 1 && svc.sw.length === 1 && svc.btn.length === 1 && svc.word.join() === '"Manage"', JSON.stringify(svc));
		await go(f, 'system', 'doctor');
		const doc = await f.evaluate((sel) => { const rows = [...document.querySelectorAll(`${sel} .pm51-doctor-row`)]; const L = (n) => (n ? Math.round(n.getBoundingClientRect().left) : null), R = (n) => (n ? Math.round(n.getBoundingClientRect().right) : null); return { n: rows.length, when: [...new Set(rows.map((r) => L(r.querySelector('.pm51-doctor-checked'))))], fix: [...new Set(rows.map((r) => L(r.querySelector('.pm51-row-control > .pm51-btn'))).filter((x) => x != null))], fixW: [...new Set(rows.map((r) => { const b = r.querySelector('.pm51-row-control > .pm51-btn'); return b ? Math.round(b.getBoundingClientRect().width) : null; }).filter((x) => x != null))], det: [...new Set(rows.map((r) => R(r.querySelector('.pm51-row-control > .pm51-icon-btn'))))], word: [...new Set(rows.map((r) => getComputedStyle(r.querySelector('.pm51-row-control > .pm51-icon-btn'), '::after').content))] }; }, block('doctor'));
		await t.check('Readiness & Doctor: the times, the fix buttons and Details each form one column', doc.n >= 8 && doc.when.length === 1 && doc.fix.length === 1 && doc.fixW.length === 1 && doc.det.length === 1 && doc.word.join() === '"Details"', JSON.stringify(doc));
		await f.locator(`${block('doctor')} .pm51-doctor-row .pm51-icon-btn[data-action="pm51-doctor-open"]`).first().click(); await sleep(f, 700);
		await t.check('Details still opens the check', (await shown(f, '.overlay .dialog, .overlay .drawer, .drawer-wrap .drawer')) > 0, '');
		await closeAll(f);
		for (const [d, ws, tabId, action, pick, selects, group] of [['general', 'notifications', 'destinations', 'pm51-notifications-add-dest', 'ntfy', { type: 'ntfy' }, 'Your phone'], ['system', 'backup', 'destinations', 'pm51-backup-dest-add', 'Folder / NAS share', { family: 'Another computer or NAS', type: 'Folder / NAS share' }, 'Another computer or NAS']]) {
			await go(f, d, ws); await tab(f, ws, tabId);
			await f.locator(`${block(ws)} [data-action="${action}"]`).first().click(); await sleep(f, 800);
			const sheet = await f.evaluate(`(() => { const p = document.querySelector('.rf-add-panel'); if (!p) return null; const T = ${T}; return { groups: [...p.querySelectorAll('.rf-add-title')].map((n) => T(n).replace(/\\s*\\d+$/, '')), kinds: p.querySelectorAll('.rf-add-row').length, needs: [...p.querySelectorAll('.rf-add-needs')].filter((n) => T(n)).length, clipped: [...p.querySelectorAll('.rf-add-name')].filter((n) => n.scrollWidth > n.clientWidth + 1).map(T) }; })()`);
			await t.check(`${ws}: Add opens a sheet of every kind, grouped, each with what it will ask for`, !!sheet && sheet.groups.includes(group) && sheet.kinds >= 8 && sheet.needs === sheet.kinds && !sheet.clipped.length, JSON.stringify(sheet));
			await f.locator(`.rf-add-panel [data-action="pm51-rf-cat-pick"][data-pick="${pick}"]`).first().click(); await sleep(f, 800);
			const form = await f.evaluate(() => { const o = document.querySelector('.overlay .dialog'); if (!o) return null; const fs = [...o.querySelectorAll('.dialog-body > .form-field')].filter((n) => n.getClientRects().length); return { title: (o.querySelector('.dialog-title') || {}).textContent, selects: Object.fromEntries([...o.querySelectorAll('select')].map((x) => [x.name, x.value])), gaps: fs.slice(1).map((n, i) => Math.round(n.getBoundingClientRect().top - fs[i].getBoundingClientRect().bottom)) }; });
			await t.check(`${ws}: picking a kind goes on to the form that was there before, with that kind chosen`, !!form && Object.entries(selects).every(([k, v]) => form.selects[k] === v) && form.title.includes(pick.split(' / ')[0]), JSON.stringify(form));
			await t.check(`${ws}: the form's fields stand apart`, !!form && form.gaps.length >= 2 && form.gaps.every((g) => g >= 10), JSON.stringify(form && form.gaps));
			await closeAll(f);
		}
		await go(f, 'safety', 'permissions');
		const pair = await f.evaluate((sel) => [...document.querySelectorAll(`${sel} .pm51-detail .pm51-row-control`)].filter((c) => c.querySelector('.pm51-row-value') && c.querySelector('.pm51-btn')).map((c) => { const v = c.querySelector('.pm51-row-value').getBoundingClientRect(), b = c.querySelector('.pm51-btn').getBoundingClientRect(); return { value: c.querySelector('.pm51-row-value').textContent.trim(), oneLine: Math.abs((v.top + v.bottom) / 2 - (b.top + b.bottom) / 2) < 8 }; }), block('permissions'));
		await t.check('Permissions: a short value sits beside its button, not over it', pair.length >= 2 && pair.every((x) => x.oneLine), JSON.stringify(pair));
		await go(f, 'source', 'source-manager');
		const edge = await f.evaluate((sel) => { const d = document.querySelector(`${sel} .pm51-detail-content`); const ends = [...d.querySelectorAll(':scope > .pm51-rows > .pm51-row > .pm51-row-control > *:last-child, .pm51-section-body .setting-row.o55-row > .setting-control > *:last-child, .pm51-section-body .pm51-rows > .pm51-row > .pm51-row-control > *:last-child')].filter((n) => n.getClientRects().length && !n.closest('details')).map((n) => Math.round(n.getBoundingClientRect().right)); return [...new Set(ends)]; }, block('source-manager'));
		await t.check('Source Control: the values and the controls of a service end at one edge', edge.length === 1, JSON.stringify(edge));
	},

	async 'Providers: the accounts line up, and Add a service is the catalogue'(t) {
		const f = await openSettings(t);
		await go(f, 'ai', 'providers'); await tab(f, 'providers', 'services');
		const rows = await f.evaluate((sel) => [...document.querySelectorAll(`${sel} .pm51-providers-acc .pm51-acc-item`)].map((it) => { const q = (s) => [...it.querySelectorAll(s)].map((n) => { const r = n.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.right), Math.round(r.height)]; }); return { tracks: q('.pm51-meter-track'), status: q('.pm51-status'), order: it.querySelectorAll('.pm51-providers-order button').length, manage: getComputedStyle(it.querySelector('.pm51-acc-toggle'), '::after').content }; }), block('providers'));
		const firsts = rows.filter((r) => r.tracks.length).map((r) => r.tracks[0].slice(0, 2).join('-')), seconds = rows.filter((r) => r.tracks.length > 1).map((r) => r.tracks[1].slice(0, 2).join('-'));
		await t.check('the service has several accounts to compare', rows.length >= 3, String(rows.length));
		await t.check('every usage bar starts and ends where the others do', new Set(firsts).size === 1 && new Set(seconds).size <= 1, JSON.stringify([firsts, seconds]));
		await t.check('every status starts at one place and is one line high', new Set(rows.map((r) => r.status[0][0])).size === 1 && rows.every((r) => r.status[0][2] < 26), JSON.stringify(rows.map((r) => r.status[0])));
		await t.check('two arrows change the order and a named button opens the account', rows.every((r) => r.order === 2 && /Manage/.test(r.manage)), JSON.stringify(rows.map((r) => [r.order, r.manage])));
		await f.locator(`${block('providers')} .pm51-providers-acc .pm51-acc-toggle`).first().click(); await sleep(f, 500);
		const open = await f.evaluate((sel) => { const it = document.querySelector(`${sel} .pm51-providers-acc .pm51-acc-item`); return { open: it.classList.contains('is-open'), label: getComputedStyle(it.querySelector('.pm51-acc-toggle'), '::after').content }; }, block('providers'));
		await t.check('Manage opens the account and reads Done', open.open && /Done/.test(open.label), JSON.stringify(open));
		await f.locator(`${block('providers')} .pm51-providers-acc .pm51-acc-toggle`).first().click(); await sleep(f, 300);
		const count = await f.evaluate(() => window.PM12_KIMI.getState().providers.length);
		await f.locator(`${block('providers')} #provider-roster .roster-head button`).first().click(); await sleep(f, 900);
		const sheet = await f.evaluate(() => { const p = document.querySelector('.rf-add-panel'), T = (n) => (n ? n.textContent : '').replace(/\s+/g, ' ').trim(); return p ? { groups: [...p.querySelectorAll('.rf-add-title')].map((n) => T(n).replace(/\d+$/, '').trim()), rows: p.querySelectorAll('.rf-add-group:not(.rf-add-other) .rf-add-row').length, other: T(p.querySelector('.rf-add-other .rf-add-name')), states: p.querySelectorAll('.rf-add-group:not(.rf-add-other) .rf-add-state .pm51-status').length } : null; });
		await t.check('Add a service opens the catalogue of every service, each with its state', !!sheet && sheet.rows === count && sheet.states === count, JSON.stringify([sheet, count]));
		await t.check('it is grouped by how you pay, and a service not in the list is its last row', !!sheet && sheet.groups.slice(0, 3).join('|') === 'Plans you already pay for|Pay as you go|Free, or on your own computer' && sheet.other === 'Another service', JSON.stringify(sheet));
		await f.locator('.rf-add-panel .rf-add-input').fill('local'); await sleep(f, 400);
		const found = await f.evaluate(() => [...document.querySelectorAll('.rf-add-panel .rf-add-group:not(.rf-add-other) .rf-add-row')].filter((n) => !n.hidden && n.getClientRects().length).map((n) => n.querySelector('.rf-add-name').textContent));
		await t.check('the search narrows the list', found.length >= 1 && found.length < count, found.join(' | '));
		const pick = found[0];
		await f.locator('.rf-add-panel .rf-add-row').filter({ hasText: pick }).first().locator('button').click(); await sleep(f, 900);
		const chosen = await f.evaluate((sel) => (document.querySelector(`${sel} .pm51-detail-title`) || {}).textContent || '', block('providers'));
		await t.check('choosing a service opens it', chosen.indexOf(pick) === 0, `${pick} -> ${chosen}`);
		await closeAll(f);
		await f.evaluate(() => window.PM51.s() && 0);
	},

	async 'fifth pass: a detail sits on its card, and text, controls, row heights and lines are even'(t) {
		const f = await openSettings(t);
		/* Jared, 2026-11-23: "There is still a black box or color box behind the managers that looks unfinished" */
		await go(f, 'source', 'source-manager');
		const box = await f.evaluate((sel) => { const s = document.querySelector(`${sel} .split-manager.pm51-split`), d = s.querySelector('.pm51-detail'); const c = getComputedStyle(d); return { detail: c.backgroundColor, image: c.backgroundImage, shorter: Math.round(s.getBoundingClientRect().height - d.getBoundingClientRect().height) }; }, block('source-manager'));
		await t.check('a list\'s detail has no ground of its own, so nothing stops short under it', box.detail === 'rgba(0, 0, 0, 0)' && box.image === 'none', JSON.stringify(box));
		const starts = await f.evaluate((sel) => { const d = document.querySelector(`${sel} .pm51-detail-content`); const X = (n) => { const r = document.createRange(); r.selectNodeContents(n); return Math.round(r.getBoundingClientRect().left); }; const vis = (n) => n.getClientRects().length; return { titles: [...new Set([...d.querySelectorAll('.pm51-section-title')].filter((n) => vis(n) && !n.closest('details')).map(X))], labels: [...new Set([...d.querySelectorAll('.pm51-row-label, .setting-label')].filter((n) => vis(n) && !n.closest('details')).map(X))], more: [...new Set([...d.querySelectorAll('details.pm51-advanced > summary')].filter(vis).map((n) => Math.round(n.getBoundingClientRect().left)))] }; }, block('source-manager'));
		await t.check('in a detail, section titles, row names and More options all start at one place', starts.titles.length === 1 && starts.labels.length === 1 && starts.titles[0] === starts.labels[0] && starts.more.length === 1 && starts.more[0] === starts.labels[0], JSON.stringify(starts));
		/* a page with both kinds of card: a manager's own (pm51) and one built from the settings list */
		await go(f, 'memory', 'goals');
		const page = await f.evaluate((sel) => {
			const b = document.querySelector(sel); const vis = (n) => n.getClientRects().length && !n.closest('details');
			const X = (n) => { const r = document.createRange(); r.selectNodeContents(n); return Math.round(r.getBoundingClientRect().left); };
			const rows = [...b.querySelectorAll('.setting-row.o55-row, .pm51-rows > .pm51-row')].filter(vis);
			const kinds = new Set(rows.map((r) => (r.closest('.pm51-settings-inline') ? 'list' : 'own')));
			const lines = rows.filter((r) => parseFloat(getComputedStyle(r).borderTopWidth) >= 0.5).map((r) => { const c = r.closest('.panel-card, .settings-section').getBoundingClientRect(), q = r.getBoundingClientRect(); let l = q.left - c.left, rr = c.right - q.right; for (let a = r.parentElement; a && !a.matches('.panel-card, .settings-section'); a = a.parentElement) if (getComputedStyle(a).overflowX !== 'visible') { const z = a.getBoundingClientRect(); l = Math.max(l, z.left - c.left); rr = Math.max(rr, c.right - z.right); } return Math.round(Math.max(l, rr)); });
			return { kinds: [...kinds], titles: [...new Set([...b.querySelectorAll('.pm51-section-title, .o55-group-title')].filter(vis).map(X))], labels: [...new Set([...b.querySelectorAll('.setting-label, .pm51-row-label')].filter(vis).map(X))], ends: [...new Set(rows.map((r) => { const c = r.querySelector('.setting-control, .pm51-row-control'); const k = c && [...c.children].filter((n) => n.getClientRects().length).pop(); return k ? Math.round(k.getBoundingClientRect().right) : null; }).filter((x) => x != null))], about: [...new Set([...b.querySelectorAll('.o55-about')].filter(vis).map((n) => Math.round(n.getBoundingClientRect().left)))], heights: [...new Set(rows.filter((r) => r.getBoundingClientRect().height < 60).map((r) => Math.round(r.getBoundingClientRect().height)))], shortLines: [...new Set(lines)].filter((x) => x > 2), noLine: rows.filter((r, i) => i && r.parentElement === rows[i - 1].parentElement && parseFloat(getComputedStyle(r).borderTopWidth) < 0.5).length };
		}, block('goals'));
		await t.check('the page has both kinds of card (or this check proves nothing)', page.kinds.length === 2, JSON.stringify(page.kinds));
		await t.check('every card\'s title and every row\'s name start at one place', page.titles.length === 1 && page.labels.length === 1 && page.titles[0] === page.labels[0], JSON.stringify({ titles: page.titles, labels: page.labels }));
		await t.check('every row\'s control ends at one place, and every "?" sits at one place', page.ends.length === 1 && page.about.length === 1, JSON.stringify({ ends: page.ends, about: page.about }));
		await t.check('every one-line row is one height', page.heights.length === 1 && page.heights[0] === 48, JSON.stringify(page.heights));
		await t.check('every row\'s line runs from one edge of its card to the other, and no row lacks one', page.shortLines.length === 0 && page.noLine === 0, JSON.stringify({ short: page.shortLines, noLine: page.noLine }));
		/* two lists of rows in one card: the second list's first row has a line too */
		await go(f, 'general', 'notifications'); await tab(f, 'notifications', 'sounds');
		const snd = await f.evaluate((sel) => { const rows = [...document.querySelectorAll(`${sel} .setting-row.o55-row, ${sel} .pm51-rows > .pm51-row`)].filter((n) => n.getClientRects().length && !n.closest('details')); const out = []; for (let i = 1; i < rows.length; i++) { const a = rows[i - 1], b = rows[i]; if (a.closest('.panel-card, .settings-section') !== b.closest('.panel-card, .settings-section')) continue; const gap = b.getBoundingClientRect().top - a.getBoundingClientRect().bottom; if (gap > 3) continue; if (parseFloat(getComputedStyle(b).borderTopWidth) < 0.5) out.push((b.textContent || '').trim().slice(0, 20)); } const m = document.querySelector(`${sel} .o55-notif-master`), mc = getComputedStyle(m); return { noLine: out, masterCard: parseFloat(mc.borderTopWidth) >= 1 && mc.backgroundColor !== 'rgba(0, 0, 0, 0)', masterLabel: Math.round(m.querySelector('.setting-label').getBoundingClientRect().left), cardTitle: Math.round(document.querySelector(`${sel} .pm51-section-title`).getBoundingClientRect().left) }; }, block('notifications'));
		await t.check('Sounds: "Volume" has a line over it like every other row', snd.noLine.length === 0, JSON.stringify(snd.noLine));
		await t.check('Notifications: the master switch is a card, its name under the same edge as the cards\' titles', snd.masterCard && snd.masterLabel === snd.cardTitle, JSON.stringify(snd));
		/* Away From Home: one column for the states, one for the buttons */
		await go(f, 'servers-access', 'servers'); await tab(f, 'servers', 'away');
		const away = await f.evaluate((sel) => { const rows = [...document.querySelectorAll(`${sel} .pm51-servers-route`)]; const L = (n) => (n ? Math.round(n.getBoundingClientRect().left) : null), R = (n) => (n ? Math.round(n.getBoundingClientRect().right) : null), W = (n) => (n ? Math.round(n.getBoundingClientRect().width) : null); return { n: rows.length, state: [...new Set(rows.map((r) => L(r.querySelector('.rf-way-state .pm51-status, .rf-way-state > *'))))], btnR: [...new Set(rows.map((r) => R(r.querySelector('.pm51-item-end > .pm51-btn'))))], btnW: [...new Set(rows.map((r) => W(r.querySelector('.pm51-item-end > .pm51-btn'))))], arrows: [...new Set(rows.map((r) => L(r.querySelector('.pm51-servers-move-btn'))).filter((x) => x != null))] }; }, block('servers'));
		await t.check('Away From Home: the states start at one place; the buttons are one width and end at one place', away.n >= 5 && away.state.length === 1 && away.btnR.length === 1 && away.btnW.length === 1 && away.arrows.length === 1, JSON.stringify(away));
		/* More options: a group's title and its rows start where the rows around it start */
		await go(f, 'code', 'toolchain');
		const more = await f.evaluate(async (sel) => { const b = document.querySelector(sel); const closed = [...b.querySelectorAll('details.pm51-advanced:not([open])')]; closed.forEach((x) => { x.open = true; }); await new Promise((r) => setTimeout(r, 300)); const X = (n) => { const r = document.createRange(); r.selectNodeContents(n); return Math.round(r.getBoundingClientRect().left); }; const res = [...b.querySelectorAll('.pm51-advanced-body')].filter((n) => n.getClientRects().length).map((body) => [...new Set([...body.querySelectorAll('.pm51-section-title, .o55-group-title, .section-title, .setting-label, .pm51-row-label, .pm51-kv-row > span:first-child')].filter((n) => n.getClientRects().length).map(X))]); closed.forEach((x) => { x.open = false; }); return res; }, block('toolchain'));
		await t.check('inside More options every title and every row name starts at one place', more.length >= 1 && more.every((x) => x.length === 1), JSON.stringify(more));
	},
	async 'sixth pass: the tab selector fits its box, one bar tops a chapter, crews pick models, the browser has its settings'(t) {
		const f = await openSettings(t);
		/* Jared, 2026-11-24: "This tab selector doesnt fit in the box, the shapes arent right." */
		await go(f, 'general', 'notifications');
		const fit = await f.evaluate((sel) => {
			const R = (n) => n.getBoundingClientRect(), px = (v) => parseFloat(v) || 0;
			const one = (box, host) => { const lens = [...host.querySelectorAll(':scope > lg-under > .lg-lens')].find((n) => n.getClientRects().length); if (!lens) return null; const b = R(box), l = R(lens); return { box: px(getComputedStyle(box).borderTopLeftRadius), chip: px(getComputedStyle(lens).borderTopLeftRadius), top: +(l.top - b.top).toFixed(1), bottom: +(b.bottom - l.bottom).toFixed(1) }; };
			const nav = document.querySelector('#pm-settings-root nav.workspace-tabs.rf-bar');
			return { bar: nav ? one(nav.querySelector('.rf-bar-track'), nav) : null, mgr: one(document.querySelector(`${sel} .pm51-mgr > .pm51-tabs`), document.querySelector(`${sel} .pm51-mgr > .pm51-tabs`)) };
		}, block('notifications'));
		const concentric = (x) => !!x && Math.abs(x.box - (x.chip + x.top)) <= 1.6 && Math.abs(x.top - x.bottom) <= 1.1;
		await t.check('a manager\'s tab strip: the box\'s corner is the chip\'s corner plus the gap between them', concentric(fit.mgr), JSON.stringify(fit.mgr));
		await t.check('the chapter\'s tab strip is the same selector: a chip in a box of its own shape', concentric(fit.bar), JSON.stringify(fit.bar));
		/* "This area looks unfinished and unpolished." One bar: the chapter's managers, the three buttons, one line under it. */
		const bar = await f.evaluate((sel) => {
			const R = (n) => n.getBoundingClientRect(), mid = (r) => r.left + r.width / 2, vis = (n) => !!n && n.getClientRects().length > 0;
			const nav = document.querySelector('#pm-settings-root nav.workspace-tabs.rf-bar'), track = nav.querySelector('.rf-bar-track'), tools = nav.querySelector('.rf-bar-tools');
			const old = document.querySelector('#pm-settings-root .document-toolbar'), index = document.querySelector('#pm-settings-root .page-index-card'), mgr = document.querySelector(`${sel} .pm51-mgr > .pm51-tabs`);
			const first = [...document.querySelectorAll('#pm-settings-root .workspace-block')][0];
			return { tabs: track.querySelectorAll('.workspace-tab').length, explain: vis(tools.querySelector('[data-action="pm51-rf-explain"]')), project: vis(tools.querySelector('[data-action="project-menu"]')), options: vis(tools.querySelector('[data-action="page-options"]')),
				oldRow: old ? Math.round(R(old).height) : -1, oldButtons: old ? old.querySelectorAll('button').length : -1, line: parseFloat(getComputedStyle(nav).borderBottomWidth), height: Math.round(R(nav).height),
				axis: Math.round(mid(R(track)) - mid(R(mgr))), under: Math.round(R(index).top - R(nav).bottom), inside: R(tools).right <= R(nav).right + 0.5 && R(track).right <= R(tools).left + 0.5,
				firstTitle: [...first.querySelectorAll('.workspace-separator h2')].filter((n) => n.getClientRects().length).length };
		}, block('notifications'));
		await t.check('the bar holds the chapter\'s managers and the three buttons, in one row', bar.tabs === 2 && bar.explain && bar.project && bar.options && bar.inside && bar.height <= 50, JSON.stringify(bar));
		await t.check('the row the buttons sat in is gone, and one line runs under the bar', bar.oldRow === 0 && bar.oldButtons === 0 && bar.line >= 1, JSON.stringify(bar));
		await t.check('the chapter\'s tabs stand over the manager\'s tabs, and the side column starts under the bar', Math.abs(bar.axis) <= 3 && bar.under >= 8 && bar.under <= 20, JSON.stringify(bar));
		await f.locator('#pm-settings-root nav.rf-bar [data-action="project-menu"]').click(); await sleep(f, 500);
		await t.check('the project button still opens its menu from the bar', await f.getByText('All Project Settings', { exact: true }).first().isVisible().catch(() => false));
		await t.page.keyboard.press('Escape'); await sleep(f, 300);
		await go(f, 'safety', 'permissions');
		const one = await f.evaluate(() => { const nav = document.querySelector('#pm-settings-root nav.workspace-tabs.rf-bar'), T = (n) => (n ? n.textContent : '').replace(/\s+/g, ' ').trim(); const title = nav.querySelector('.rf-bar-title'); return { name: title && title.getClientRects().length ? T(title) : '', track: nav.querySelector('.rf-bar-track').getClientRects().length, tools: nav.querySelectorAll('.rf-bar-tools button').length, again: [...document.querySelectorAll('#pm-settings-root .workspace-separator h2')].filter((n) => n.getClientRects().length).length }; });
		await t.check('a chapter with one manager: its name stands in the bar, once, with the same three buttons', one.name === 'Permissions & Safety' && one.track === 0 && one.tools === 3 && one.again === 0, JSON.stringify(one));
		/* a long chapter in a narrow window: nothing is cut off; the buttons go under the tabs when one row cannot hold both */
		await t.viewport(1180, 900); await go(f, 'code', 'testing'); await sleep(f, 500);
		const narrow = await f.evaluate(() => { const nav = document.querySelector('#pm-settings-root nav.workspace-tabs.rf-bar'), R = (n) => n.getBoundingClientRect(); const n = R(nav), tabs = [...nav.querySelectorAll('.workspace-tab')].map(R), tools = R(nav.querySelector('.rf-bar-tools')); return { cls: nav.className, cut: tabs.filter((r) => r.left < n.left - 0.5 || r.right > n.right + 0.5).length, tools: tools.right <= n.right + 0.5 && tools.left >= n.left - 0.5, over: tabs.some((r) => r.right > tools.left + 0.5 && r.bottom > tools.top + 0.5 && r.top < tools.bottom - 0.5) }; });
		await t.check('narrow window, eight managers: every tab and every button is whole and none covers another', narrow.cut === 0 && narrow.tools && !narrow.over, JSON.stringify(narrow));
		await t.viewport(1600, 1000); await sleep(f, 400);
		/* "In the crew manager there is no way to set the models when you make a crew template." */
		await go(f, 'memory', 'personas'); await tab(f, 'personas', 'crews');
		const crew = await f.evaluate((sel) => { const b = document.querySelector(sel), T = (n) => (n ? n.textContent : '').replace(/\s+/g, ' ').trim(); const rows = [...b.querySelectorAll('.rf-crew-models > .pm51-row')].filter((n) => n.getClientRects().length); return { members: rows.filter((r) => r.querySelector('.o55-msel-trigger')).length, sub: T(b.querySelector('.pm51-detail-sub')), lead: rows.filter((r) => r.querySelector('.rf-crew-lead')).length, route: rows.some((r) => /Model route/.test(T(r.querySelector('.pm51-row-label')))), h: document.querySelector('#settings-document').scrollHeight }; }, block('personas'));
		await t.check('a crew lists its members, each with a model picker; the lead is marked; the model route is still there', crew.members >= 2 && crew.lead <= 1 && crew.route && new RegExp(`^${crew.members} members`).test(crew.sub), JSON.stringify(crew));
		const second = f.locator(`${block('personas')} .rf-crew-models .o55-msel-trigger`).nth(1);
		const was = (await second.textContent()).replace(/\s+/g, ' ').trim();
		await second.click(); await sleep(f, 700);
		const pop = await f.evaluate(() => { const p = document.querySelector('.o55-pick-pop'); const T = (n) => (n ? n.textContent : '').replace(/\s+/g, ' ').trim(); return { open: !!p && p.getClientRects().length > 0, first: p ? T(p.querySelector('[role="option"]')) : '', models: p ? p.querySelectorAll('[role="option"]').length : 0, h: document.querySelector('#settings-document').scrollHeight }; });
		await t.check('it is the shared model picker, over the page: first "Follow the model route", then the models', pop.open && /^Follow the model route/.test(pop.first) && pop.models >= 4 && pop.h === crew.h, JSON.stringify(pop));
		await f.locator('.o55-pick-pop [role="option"]').filter({ hasText: 'Codex coding model' }).first().click(); await sleep(f, 700);
		const lvl = f.locator('.o55-pick-levels:visible [role="option"], .o55-depth-list:visible [role="option"], .o55-depth-item:visible').first();
		if (await lvl.count()) { await lvl.click(); await sleep(f, 600); }
		await t.page.keyboard.press('Escape'); await sleep(f, 300);
		const now = (await f.locator(`${block('personas')} .rf-crew-models .o55-msel-trigger`).nth(1).textContent()).replace(/\s+/g, ' ').trim();
		await t.check('picking a model changes that member\'s row', /Codex coding model/.test(now) && now !== was, `${was} -> ${now}`);
		await f.locator(`${block('personas')} [data-action="pm51-personas-crew-new"]`).first().click(); await sleep(f, 1200);
		const steps = await f.evaluate(() => [...document.querySelectorAll('.o55g-railitem')].map((n) => n.textContent.replace(/\s+/g, ' ').trim()));
		await t.check('New crew has a Models step, before Teamwork', steps.indexOf('Models') >= 0 && steps.indexOf('Models') === steps.indexOf('Teamwork') - 1, JSON.stringify(steps));
		await closeAll(f);
		const wz = f.locator('.drawer-wrap:not([data-closing="1"]) .o55g-close:visible, .drawer-wrap:not([data-closing="1"]) button:visible').filter({ hasText: 'Close' }).first();
		if (await wz.count()) { await wz.click(); await sleep(f, 600); }
		/* "There also needs to be a lot more settings for browser, browser work, recordings, etc. Like gpu acceleration, formats" */
		await go(f, 'source', 'browser-scm');
		const names = async () => f.evaluate((sel) => [...document.querySelectorAll(`${sel} .setting-label, ${sel} .pm51-row-label`)].filter((n) => n.getClientRects().length).map((n) => n.textContent.replace(/\s+/g, ' ').replace(/(Modified|Changed)$/, '').trim()), block('browser-scm'));
		const tabsOf = await f.evaluate((sel) => [...document.querySelectorAll(`${sel} .pm51-mgr > .pm51-tabs [role="tab"]`)].map((n) => n.textContent.trim()), block('browser-scm'));
		await t.check('Browser & Recordings has four tabs', JSON.stringify(tabsOf) === JSON.stringify(['Browser', 'Browser work', 'Recordings', 'Screenshots']) && (await f.locator('#pm-settings-root nav.rf-bar .workspace-tab.active').textContent()).trim() === 'Browser & Recordings', JSON.stringify(tabsOf));
		const need = { browser: ['Graphics acceleration', 'Graphics card', 'Window size', 'Sharpness', 'Browser profile', 'Files a page offers'], work: ['Let the assistant open DevTools', 'When a page needs you', 'Wait for a page to load', 'Errors in the page\'s console'], recordings: ['Record video', 'Frames per second', 'Video format', 'File type when you save one', 'Sound', 'Space recordings may use'], screenshots: ['Screenshots for evidence', 'Kept for', 'Hidden before saving', 'Helpers may see screenshots', 'Let me point at things to share with chat', 'Screenshot button captures', 'Picture format', 'Counts as changed above'] };
		let total = 0;
		for (const [id, list] of Object.entries(need)) {
			await tab(f, 'browser-scm', id);
			const got = await names(); total += got.length;
			await t.check(`${id}: ${list.length} of its rows are there (${got.length} rows on the tab)`, list.every((n) => got.includes(n)), JSON.stringify(list.filter((n) => !got.includes(n))));
		}
		await t.check('the four tabs hold at least 55 rows', total >= 55, String(total));
		await tab(f, 'browser-scm', 'recordings');
		const formats = await f.evaluate((sel) => { const row = [...document.querySelectorAll(`${sel} .setting-row`)].find((r) => /^Video format/.test(r.querySelector('.setting-label').textContent.trim())); return row ? [...row.querySelectorAll('select option')].map((o) => o.textContent.trim()) : []; }, block('browser-scm'));
		await t.check('Video format offers Automatic, AV1, HEVC, H.264 and VP9', ['Automatic', 'AV1', 'HEVC (H.265)', 'H.264', 'VP9'].every((x) => formats.includes(x)), JSON.stringify(formats));
		await tab(f, 'browser-scm', 'browser');
		const fact = () => f.evaluate((sel) => [...document.querySelectorAll(`${sel} .rf-facts .rf-fact`)].map((n) => n.textContent.replace(/\s+/g, ' ').trim()).join(' | '), block('browser-scm'));
		const before = await fact();
		await f.evaluate((sel) => { const row = [...document.querySelectorAll(`${sel} .setting-row`)].find((r) => /^Graphics acceleration/.test(r.querySelector('.setting-label').textContent.trim())); const s = row.querySelector('select'); s.value = 'Off'; s.dispatchEvent(new Event('change', { bubbles: true })); }, block('browser-scm')); await sleep(f, 900);
		const after = await fact();
		await t.check('turning Graphics acceleration off shows at once in the line of facts over it', /in use/.test(before) && /not used/.test(after), `${before} -> ${after}`);
		await f.evaluate((sel) => { const row = [...document.querySelectorAll(`${sel} .setting-row`)].find((r) => /^Graphics acceleration/.test(r.querySelector('.setting-label').textContent.trim())); const s = row.querySelector('select'); s.value = 'Auto'; s.dispatchEvent(new Event('change', { bubbles: true })); }, block('browser-scm')); await sleep(f, 600);
	},

	async 'seventh pass: the simple Goal\'s page, the new names, the checks on the Planning page, Glass\'s line and pinned frost'(t) {
		const f = await openSettings(t);
		/* found after the seventh pass was shown (2026-11-25): search still listed the old Goal's templates and its "active
		   Goals" with a phase and a percentage, and wrote the old names into the paths of memories, personas and crews */
		const find = (q) => f.evaluate(async (q) => { const i = document.querySelector('#pm-settings-root [data-hero-search]'); if (!i) return null; const wait = (ms) => new Promise((r) => setTimeout(r, ms)); i.focus(); i.value = q; i.dispatchEvent(new Event('input', { bubbles: true })); await wait(500); const rows = [...document.querySelectorAll('.search-result')].filter((e) => e.getClientRects().length).map((e) => ({ type: e.dataset.searchResult, title: (e.querySelector('.search-result-title') || {}).textContent, path: (e.querySelector('.search-result-path') || {}).textContent || '' })); i.value = ''; i.dispatchEvent(new Event('input', { bubbles: true })); await wait(200); return rows; }, q);
		const found = {}; for (const q of ['Implementation Goal', 'Kimi refinement', 'phase', 'crew', 'Generalist', 'memory']) found[q] = await find(q);
		const hits = Object.values(found).flat().filter(Boolean), oldHits = hits.filter((r) => r.type === 'goal-template' || r.type === 'active-goal');
		await t.check('search finds no template and no "active Goal" of the old Goal', Object.values(found).every(Boolean) && hits.length > 4 && oldHits.length === 0, JSON.stringify(oldHits).slice(0, 300));
		await t.check('and a result\'s path says the names the rail says', (found.crew || []).some((r) => r.type === 'crew' && r.path.indexOf('Memory & Goals › Personas & Crews') === 0) && !hits.some((r) => /Automation/.test(r.path)), JSON.stringify(hits.filter((r) => /Automation/.test(r.path)).slice(0, 4)));
		/* Jared, 2026-11-24, on "Rename the two Automation titles?": "A, rename them." */
		await go(f, 'memory', 'goals');
		const names = await f.evaluate(() => ({ rail: [...document.querySelectorAll('#pm-settings-root .domain-link')].map((n) => n.textContent.replace(/\s+/g, ' ').trim()), track: [...document.querySelectorAll('#pm-settings-root nav.workspace-tabs.rf-bar .workspace-tab')].map((n) => n.textContent.replace(/\s+/g, ' ').trim()), any: /Automation/.test(document.querySelector('#pm-settings-root').textContent) }));
		await t.check('the chapter is Memory & Goals and the page is Goals & Schedules', names.rail.some((x) => x.indexOf('Memory & Goals') === 0) && names.track.includes('Goals & Schedules'), JSON.stringify(names).slice(0, 400));
		await t.check('nothing drawn in the chapter says Automation', !names.any);
		/* "There are still some artifacts from the old version of goals, that makes things in the settings for goals not
		   make a lot of sense anymore. So that needs to be cleaned up." The simple Goal: DL-477, DL-478, GRS-048 to GRS-054. */
		const tabs = await f.evaluate((sel) => [...document.querySelectorAll(`${sel} .pm51-mgr > .pm51-tabs > .manager-tab`)].map((n) => n.textContent.trim()), block('goals'));
		await t.check('the Goals page has three tabs: Goals, Schedules, Proof', tabs.join('|') === 'Goals|Schedules|Proof', tabs.join('|'));
		const words = {}; const ids = {};
		for (const id of ['defaults', 'schedules', 'proof']) {
			await tab(f, 'goals', id);
			await f.evaluate((sel) => { document.querySelectorAll(`${sel} details`).forEach((d) => { d.open = true; }); }, block('goals')); await sleep(f, 300);
			const got = await f.evaluate((sel) => { const b = document.querySelector(sel); return { text: b.textContent.replace(/\s+/g, ' '), ids: [...b.querySelectorAll('[id^="setting-"], [data-setting-id]')].map((r) => (r.id && r.id.indexOf('setting-') === 0 ? r.id.slice(8) : '') || r.getAttribute('data-setting-id')) }; }, block('goals'));
			words[id] = got.text; ids[id] = [...new Set(got.ids)];
		}
		const all = Object.values(words).join(' ');
		const old = ['template', 'phase', 'crew', 'Model for Goal work', 'Run test profile', 'Ask me to confirm', 'Receipt strength', 'Rethink the plan', 'Verify', 'Goal mode', 'New Goals start with'].filter((w) => new RegExp(w, 'i').test(all));
		await t.check('no tab of it speaks of the old Goal (templates, phases, a crew or model of its own, checks, receipt strengths)', old.length === 0, old.join(', '));
		const want = {
			defaults: ['planning.verification.goal-write-mode', 'planning.verification.goal-auto-resume', 'planning.verification.goal-checkpoint-cadence', 'planning.verification.goal-interruption', 'planning.verification.interrupt-settlement', 'planning.verification.heartbeat-interval', 'planning.verification.stall-detection', 'planning.verification.true-blocker-escalation', 'planning.verification.blocker-detail', 'planning.verification.cloud-local-display', 'general.interaction.run-graph-mode', 'general.interaction.graph-density', 'general.interaction.progress-widget-layout', 'planning.verification.invisible-goal-authority'],
			schedules: ['safety.approvals.schedule-missed-policy', 'safety.approvals.schedule-grace-minutes', 'safety.approvals.schedule-wind-down-minutes', 'safety.approvals.schedule-resume-next-window', 'safety.approvals.schedule-dst-policy'],
			proof: ['planning.verification.completion-receipts', 'planning.verification.evidence-span', 'planning.verification.source-evidence-layers', 'planning.verification.receipt-evidence-policy', 'planning.verification.evidence-detail']
		};
		for (const id of Object.keys(want)) await t.check(`the ${id} tab draws exactly its own settings`, JSON.stringify([...ids[id]].sort()) === JSON.stringify([...want[id]].sort()), JSON.stringify({ missing: want[id].filter((x) => !ids[id].includes(x)), extra: ids[id].filter((x) => !want[id].includes(x)) }));
		await tab(f, 'goals', 'proof');
		const receipt = await f.evaluate((sel) => { const c = document.querySelector(`${sel} .rf-goal-receipt`); return c ? { rows: [...c.querySelectorAll('.pm51-kv-row > span:first-child')].map((n) => n.textContent.trim()), controls: c.querySelectorAll('input, button, select, [role="switch"]').length } : null; }, block('goals'));
		await t.check('Proof shows an example receipt, read only: the Goal, the outcome, what backs it, what is left', !!receipt && receipt.rows.join('|') === 'Goal|Outcome|Backed by|Left over' && receipt.controls === 0, JSON.stringify(receipt));
		/* the fourteen settings about checking planned work are live in the Plans: they moved, with their options, to Planning */
		const checks = ['planning.verification.quality-preference', 'planning.verification.validation-pass', 'planning.verification.independent-review', 'planning.verification.report-visibility', 'planning.verification.auditor-loop', 'planning.verification.repair-loop', 'planning.verification.repair-strategies', 'planning.verification.repair-budget-exhaustion', 'planning.verification.degraded-mode', 'planning.verification.strictness', 'planning.verification.gate-enforcement', 'planning.verification.parallel-stage-enforcement', 'planning.verification.validators-by-node', 'planning.verification.worknode-activation'];
		await t.check('none of the fourteen checks on planned work is left on the Goals page', checks.every((x) => !Object.values(ids).flat().includes(x)), checks.filter((x) => Object.values(ids).flat().includes(x)).join(', '));
		await go(f, 'planning', 'planning-reference');
		await f.evaluate((sel) => { document.querySelectorAll(`${sel} details`).forEach((d) => { d.open = true; }); }, block('planning-reference')); await sleep(f, 400);
		const plan = await f.evaluate((sel) => { const b = document.querySelector(sel); const sec = (id) => { const s = b.querySelector(`[data-section-id="${id}"]`); return s ? [...new Set([...s.querySelectorAll('[id^="setting-"], [data-setting-id]')].map((r) => (r.id && r.id.indexOf('setting-') === 0 ? r.id.slice(8) : '') || r.getAttribute('data-setting-id')))] : null; }; return { checks: sec('plan-checks'), repair: sec('plan-repair'), more: sec('plan-checks-more'), fixes: (() => { const r = b.querySelector('[id="setting-planning.verification.repair-strategies"]'); return r ? r.querySelectorAll('input[type="checkbox"], [role="checkbox"], .chip-select > button, label').length : -1; })() }; }, block('planning-reference'));
		const onPlan = [...(plan.checks || []), ...(plan.repair || []), ...(plan.more || [])];
		await t.check('all fourteen are on the Planning page, in three groups', !!plan.checks && !!plan.repair && !!plan.more && JSON.stringify([...onPlan].sort()) === JSON.stringify([...checks].sort()), JSON.stringify({ checks: (plan.checks || []).length, repair: (plan.repair || []).length, more: (plan.more || []).length }));
		await t.check('"Ways to fix, in order" kept its ten choices', plan.fixes === 10, String(plan.fixes));
		/* words left over on other pages: a Goal runs on its chat's persona and model and never uses a crew */
		await go(f, 'memory', 'personas'); await tab(f, 'personas', 'defaults');
		const pd = await f.evaluate((sel) => { const r = [...document.querySelectorAll(`${sel} .pm51-row`)].find((x) => (x.querySelector('.pm51-row-label') || {}).textContent.trim() === 'Goals'); return r ? { value: (r.querySelector('.pm51-row-value') || {}).textContent, buttons: r.querySelectorAll('button').length } : null; }, block('personas'));
		await t.check('Personas › Defaults: a Goal\'s persona is its chat\'s, with nothing to change', !!pd && pd.value === 'Same as its chat' && pd.buttons === 0, JSON.stringify(pd));
		/* Jared, on Glass: "This line looks weird on the glass theme ... It is touching that glass bar." */
		await t.app.look(t, 'glass-dark', { save: true }); await sleep(f, 1500);
		await go(f, 'memory', 'context-memory');
		const gl = await f.evaluate(() => { const nav = document.querySelector('#pm-settings-root nav.workspace-tabs.rf-bar'), idx = document.querySelector('#pm-settings-root .document-layout > .page-index'); return { line: parseFloat(getComputedStyle(nav).borderBottomWidth), gap: Math.round(idx.getBoundingClientRect().top - nav.getBoundingClientRect().bottom), sheet: idx.dataset.lgKind || '' }; });
		await t.check('Glass: the bar has no line, and the side column\'s sheet starts clear of it', gl.line === 0 && gl.gap >= 10, JSON.stringify(gl));
		/* "when I am scrolling, the background lines jump back and forth on the left side behind the panels": a pinned
		   sheet's frost must be the layer that is fixed to the window (the stack is five layers, the frost last) */
		const pin = await f.evaluate(() => { const layers = (s) => { let d = 0, n = 1; for (const c of s) { if (c === '(') d++; else if (c === ')') d--; else if (c === ',' && d === 0) n++; } return n; }; return ['div.left-panel', 'aside.domain-rail', 'header.title-bar', 'footer.pm7-statusbar'].map((sel) => { const e = document.querySelector(sel); if (!e || !e.dataset.lgKind) return { sel, sheet: false }; e.setAttribute('data-lg-fixed', ''); const cs = getComputedStyle(e); const att = cs.backgroundAttachment.split(',').map((x) => x.trim()), n = layers(cs.backgroundImage), last = /frost|blob:|url\(/.test(cs.backgroundImage.slice(cs.backgroundImage.lastIndexOf(', ') + 1)); e.removeAttribute('data-lg-fixed'); return { sel, sheet: true, n, att: att.join(' '), ok: att.length === n && att[n - 1] === 'fixed' && att.slice(0, n - 1).every((x) => x === 'scroll') }; }); });
		await t.check('Glass: a pinned sheet pins its frost, the last layer, and nothing else', pin.filter((x) => x.sheet).length >= 3 && pin.filter((x) => x.sheet).every((x) => x.ok), JSON.stringify(pin));
		await t.app.look(t, 'basic-dark', { save: true }); await sleep(f, 1200);
		const basic = await f.evaluate(() => parseFloat(getComputedStyle(document.querySelector('#pm-settings-root nav.workspace-tabs.rf-bar')).borderBottomWidth));
		await t.check('the other looks keep the line under the bar', basic >= 1, String(basic));
	},

	async 'Limits & switching is the one home of a service\'s switching rules'(t) {
		const f = await openSettings(t);
		await go(f, 'ai', 'providers'); await tab(f, 'providers', 'limits');
		const rows = await f.evaluate((sel) => [...document.querySelectorAll(`${sel} .rf-policy-row:not(.rf-policy-headrow)`)].map((r) => ({ name: r.querySelector('.setting-label').textContent.trim(), toggles: r.querySelectorAll('.toggle').length, fields: r.querySelectorAll('.pm51-dd').length })), block('providers'));
		await t.check('each service with two accounts has a line', rows.length >= 2, JSON.stringify(rows));
		const cols = await f.evaluate((sel) => { const x = (n) => Math.round(n.getBoundingClientRect().left); const hd = [...document.querySelectorAll(`${sel} .rf-policy-headrow .rf-policy-h`)].map(x), r = document.querySelector(`${sel} .rf-policy-row:not(.rf-policy-headrow) .o55-policy-ctl`); return { hd, ctl: [...r.children].map(x) }; }, block('providers'));
		await t.check('each heading sits over its own control', cols.hd.length === 4 && cols.hd.every((v, i) => Math.abs(v - cols.ctl[i]) <= 2), JSON.stringify(cols));
		await t.check('each line has its switch and its three rules', rows.every((r) => r.toggles === 1 && r.fields === 3), JSON.stringify(rows));
		const first = f.locator(`${block('providers')} .rf-policy-row:not(.rf-policy-headrow)`).first();
		const was = await first.locator('.toggle').getAttribute('aria-checked');
		await first.locator('.toggle').click(); await sleep(f, 700);
		const now = await f.locator(`${block('providers')} .rf-policy-row:not(.rf-policy-headrow)`).first().locator('.toggle').getAttribute('aria-checked');
		await t.check('its switch works here', was !== now, `${was} -> ${now}`);
		await t.check('a service with its own rule offers the shared one back', (await f.locator(`${block('providers')} .rf-policy-row:not(.rf-policy-headrow)`).first().locator('.rf-policy-reset').count()) === 1);
		await f.locator(`${block('providers')} .rf-policy-row:not(.rf-policy-headrow)`).first().locator('.rf-policy-reset').click(); await sleep(f, 700);
		const back = await f.locator(`${block('providers')} .rf-policy-row:not(.rf-policy-headrow)`).first().locator('.toggle').getAttribute('aria-checked');
		await t.check('and taking it puts the switch back', back === was, `${now} -> ${back}`);
		await tab(f, 'providers', 'services');
		await t.check('the service\'s own page does not repeat them', (await f.locator(`${block('providers')} .o55-policy-fields`).count()) === 0);
	},

	async 'Editor and Terminal Customize: the example stays beside the options and names the change'(t) {
		const f = await openSettings(t);
		for (const [name, action] of [['Editor', 'pm51-o55-editor-customize'], ['Terminal', 'pm51-o55-terminal-customize']]) {
			await go(f, 'code', 'editor-runtime');
			const btn = f.locator(`#pm-settings-root [data-action="${action}"]`).first();
			await btn.scrollIntoViewIfNeeded(); await btn.click();
			/* the editor's and the terminal's dialogs can both be in the page: the one showing is the one at the middle of the window */
			await f.waitForFunction(() => { const at = document.elementFromPoint(innerWidth / 2, innerHeight / 2); return !!(at && at.closest('.pmt-cz-dialog')); }, null, { timeout: 15000 }); await sleep(f, 1800);
			const read = () => f.evaluate(() => {
				const at = document.elementFromPoint(innerWidth / 2, innerHeight / 2), d = at && at.closest('.pmt-cz-dialog'); if (!d) return null;
				const body = d.querySelector('.pmt-cz-body'), pv = d.querySelector('.pmt-cz-top > .pmt-cz-preview'), dock = d.querySelector('.pmt-cz-dock');
				const br = body.getBoundingClientRect(), pr = pv.getBoundingClientRect();
				return { width: Math.round(d.getBoundingClientRect().width), scrollTop: Math.round(body.scrollTop), max: body.scrollHeight - body.clientHeight,
					inView: pr.top >= br.top - 2 && pr.bottom <= br.bottom + 2 && pr.height > 150, right: pr.left > br.left + br.width * 0.45,
					dock: !!(dock && dock.getClientRects().length), line: (d.querySelector('.rf-changed') || {}).textContent || '' };
			});
			const top = await read();
			await t.check(`${name}: the dialog is wide enough for two columns`, !!top && top.width >= 1160, JSON.stringify(top));
			await t.check(`${name}: the example is in the right column`, !!top && top.right && top.inView);
			await f.evaluate(() => { const b = document.elementFromPoint(innerWidth / 2, innerHeight / 2).closest('.pmt-cz-dialog').querySelector('.pmt-cz-body'); b.style.scrollBehavior = 'auto'; b.scrollTop = b.scrollHeight; });
			await sleep(f, 900);
			const end = await read();
			await t.check(`${name}: at the end of the options the example is still whole and in view`, !!end && end.scrollTop > 1000 && end.inView, JSON.stringify(end));
			await t.check(`${name}: no small copy floats over the options`, !!end && !end.dock);
			await f.evaluate(() => { const b = document.elementFromPoint(innerWidth / 2, innerHeight / 2).closest('.pmt-cz-dialog').querySelector('.pmt-cz-body'); b.scrollTop = 0; });
			await sleep(f, 600);
			const tile = f.locator('.pmt-cz-dialog .pmt-cz-body .pmt-cz-tile[aria-checked="false"]:visible').first();
			const tname = (await tile.locator('.pmt-cz-tname').first().textContent()).trim();
			await tile.scrollIntoViewIfNeeded(); await tile.click(); await sleep(f, 500);
			const after = await read();
			await t.check(`${name}: the line under the example names what was changed`, !!after && /^Changed/.test(after.line) && after.line.includes(tname), `${tname} / ${after && after.line}`);
			await closeAll(f); await sleep(f, 600);
			await t.check(`${name}: closing leaves you in Settings`, (await f.evaluate(() => window.PM_PAGES.current)) === 'settings');
		}
	},

	async 'the example is no narrower than it was, and the editor example follows what is typed'(t) {
		/* Jared, 2026-11-21: "Because you made the boxes narrower for the examples, it cuts off things that are happening on
		   the right. For one example, typing in the editor." */
		for (const size of [[1600, 1000], [1280, 800]]) {
			const f = await openSettings(t, size);
			await go(f, 'code', 'editor-runtime');
			const btn = f.locator('#pm-settings-root [data-action="pm51-o55-editor-customize"]').first();
			await btn.scrollIntoViewIfNeeded(); await btn.click();
			await f.waitForFunction(() => { const at = document.elementFromPoint(innerWidth / 2, innerHeight / 2); return !!(at && at.closest('.pmt-cz-dialog')); }, null, { timeout: 15000 }); await sleep(f, 1800);
			const read = () => f.evaluate(() => {
				const d = document.elementFromPoint(innerWidth / 2, innerHeight / 2).closest('.pmt-cz-dialog');
				const box = d.querySelector('.pmt-cz-top .pmt-cz-pvbox').getBoundingClientRect();
				/* the editor draws inside a shadow root: its caret is found there */
				const hosts = [...d.querySelectorAll('.pmt-cz-top .pmt-cz-pvbox *')].filter((n) => n.shadowRoot);
				const carets = hosts.flatMap((h) => [...h.shadowRoot.querySelectorAll('.pmw-ed-caret')]).filter((n) => n.getClientRects().length && !n.hidden);
				const c = carets.length ? carets[0].getBoundingClientRect() : null;
				return { box: Math.round(box.width), caret: c ? { left: Math.round(c.left - box.left), right: Math.round(box.right - c.right) } : null };
			});
			const at = `${size[0]}x${size[1]}`;
			const rest = await read();
			await t.check(`${at}: the editor example is at least as wide as it was (about 640 px)`, rest.box >= 630, JSON.stringify(rest));
			await f.locator('.pmt-cz-dialog [data-act="try-type"]:visible').first().click();
			await sleep(f, 420);
			const typing = await read();
			await t.check(`${at}: while Type runs, the caret is inside the example`, !!typing.caret && typing.caret.left >= 0 && typing.caret.right >= 8, JSON.stringify(typing));
			await sleep(f, 2600);
			const after = await read();
			await t.check(`${at}: afterwards the caret is back at rest, inside the example`, !!after.caret && after.caret.left >= 0 && after.caret.right >= 8, JSON.stringify(after));
			await closeAll(f); await sleep(f, 500);
			/* the terminal's example and the two pictures */
			const tb = f.locator('#pm-settings-root [data-action="pm51-o55-terminal-customize"]').first();
			await tb.scrollIntoViewIfNeeded(); await tb.click();
			await f.waitForFunction(() => { const x = document.elementFromPoint(innerWidth / 2, innerHeight / 2); return !!(x && x.closest('.pmt-cz-dialog')); }, null, { timeout: 15000 }); await sleep(f, 1800);
			const term = await f.evaluate(() => Math.round(document.elementFromPoint(innerWidth / 2, innerHeight / 2).closest('.pmt-cz-dialog').querySelector('.pmt-cz-top .pmt-cz-pvbox').getBoundingClientRect().width));
			await t.check(`${at}: the terminal example is at least as wide as it was (about 630 px)`, term >= 620, String(term));
			await closeAll(f); await sleep(f, 500);
			await go(f, 'general', 'app-input');
			await f.evaluate(() => window.PM_PIP_EDITOR.open()); await f.waitForSelector('.pipe-panel .pipe', { timeout: 15000 }); await sleep(f, 1000);
			const pip = await f.evaluate(() => Math.round(document.querySelector('.pipe-panel .pipe-top .pipe-stage').getBoundingClientRect().width));
			await closeAll(f);
			await f.evaluate(() => window.PM_NIER_CHIPS.open()); await f.waitForSelector('.o55nc-panel .o55nc', { timeout: 15000 }); await sleep(f, 1000);
			const nier = await f.evaluate(() => Math.round(document.querySelector('.o55nc-panel .o55nc-top > :first-child').getBoundingClientRect().width));
			await closeAll(f);
			await t.check(`${at}: NieR's picture is at least as wide as it was (about 345 px)`, nier >= 340, String(nier));
			await t.check(`${at}: Pip's team has room for three seats across`, pip >= 340, String(pip));
		}
	},

	async 'Customize Pip and Adjust NieR: the picture stays, and Pip shows where it appears'(t) {
		const f = await openSettings(t);
		await go(f, 'general', 'app-input');
		await f.evaluate(() => window.PM_PIP_EDITOR.open()); await f.waitForSelector('.pipe-panel .pipe', { timeout: 15000 }); await sleep(f, 1200);
		const read = (panel, pic) => f.evaluate(([panel, pic]) => {
			const p = document.querySelector(panel), body = p.querySelector('.pm51-panel-body'), s = p.querySelector(pic);
			const br = body.getBoundingClientRect(), sr = s.getBoundingClientRect();
			return { width: Math.round(p.getBoundingClientRect().width), scrollTop: Math.round(body.scrollTop), inView: sr.top >= br.top - 2 && sr.bottom <= br.bottom + 2 && sr.height > 60, right: sr.left > br.left + br.width * 0.5 };
		}, [panel, pic]);
		const end = async (panel) => { await f.evaluate((panel) => { const b = document.querySelector(panel + ' .pm51-panel-body'); b.style.scrollBehavior = 'auto'; b.scrollTop = b.scrollHeight; }, panel); await sleep(f, 800); };
		await end('.pipe-panel');
		const pip = await read('.pipe-panel', '.pipe-top .pipe-stage');
		await t.check('Pip: scrolled to the last part, the team is still whole and in view, on the right', pip.scrollTop > 300 && pip.inView && pip.right, JSON.stringify(pip));
		await t.check('Pip: no small copy floats over the parts', (await shown(f, '.pipe-panel .pipe-dock')) === 0);
		const scenes = await f.evaluate(() => [...document.querySelectorAll('.pipe-panel .rf-where-tile')].map((x) => ({ id: x.dataset.rfWhere, on: x.classList.contains('is-on'), pip: !!x.querySelector('.rf-where-pip') && x.querySelector('.rf-where-pip').getClientRects().length > 0 })));
		await t.check('Pip: six scenes show where Pip appears', scenes.length === 6, JSON.stringify(scenes));
		await t.check('Pip: Pip is in a scene exactly while that part is on', scenes.every((s) => s.on === s.pip), JSON.stringify(scenes));
		await f.evaluate(() => { document.querySelector('.pipe-panel .pm51-panel-body').scrollTop = 0; }); await sleep(f, 400);
		const chip = f.locator('.pipe-panel .pipe-chip[data-pipe-part="working-orbit"]');
		const before = await chip.getAttribute('aria-checked');
		await chip.scrollIntoViewIfNeeded(); await chip.click(); await sleep(f, 500);
		const s2 = await f.evaluate(() => { const x = document.querySelector('.pipe-panel .rf-where-tile[data-rf-where="working-orbit"]'); return { on: x.classList.contains('is-on'), pip: x.querySelector('.rf-where-pip').getClientRects().length > 0, line: (document.querySelector('.pipe-panel .rf-changed') || {}).textContent || '' }; });
		await t.check('Pip: switching Working orbit changes its scene', s2.on === (before !== 'true') && s2.pip === s2.on, JSON.stringify(s2));
		await t.check('Pip: the line names it', /Working orbit/.test(s2.line), s2.line);
		await chip.click(); await sleep(f, 400);
		await closeAll(f);
		await f.evaluate(() => window.PM_NIER_CHIPS.open()); await f.waitForSelector('.o55nc-panel .o55nc', { timeout: 15000 }); await sleep(f, 1200);
		await end('.o55nc-panel');
		const nier = await read('.o55nc-panel', '.o55nc-top > :first-child');
		await t.check('NieR: scrolled to the last chip, the picture is still whole and in view, on the right', nier.scrollTop > 300 && nier.inView && nier.right, JSON.stringify(nier));
		await closeAll(f);
	},

	async 'nothing was dropped: every setting and every action of the unchanged page is still on a page'(t) {
		if (!t.args.before) { t.log('SKIPPED: pass --set before=<the unchanged PMConcept7 page of the same base> to run this comparison'); await t.check('needs --set before=<page>', false, 'not run'); return; }
		const f = await openSettings(t);
		const mine = await inventory(f);
		/* the unchanged page is opened the way the kit opens the page under test: fresh, with the first-run setup off */
		await t.goto(`${t.args.before}${t.args.before.includes('?') ? '&' : '?'}cb=${Date.now()}&o55=off`, { settleMs: 1500 });
		await t.until('the unchanged page is ready', () => document.documentElement.getAttribute('data-pmr-ready') === '1' && !!window.PM_THEME, null, { timeout: 60000, hard: true });
		const f2 = t.root === t.page ? t.page.mainFrame() : t.root;
		await f2.locator('#tab-settings').click(); await f2.waitForSelector('#pm-settings-root .domain-link', { timeout: 20000 }); await sleep(f2, 800);
		const theirs = await inventory(f2);
		/* the seventh pass (Jared, 2026-11-24: "There are still some artifacts from the old version of goals ... that needs
		   to be cleaned up"): the five settings DL-478 retired from the Plans on his ruling of 2026-11-12 are drawn nowhere,
		   and the actions that only served the old Goal's templates, its own persona/crew/test profile/confirm step and its
		   receipt strengths are gone with them. Nothing else may be missing. */
		const retired = ['planning.verification.certification-level', 'planning.verification.goal-replan-behavior', 'planning.verification.goal-replan-events', 'planning.verification.goal-template', 'planning.verification.receipt-type'];
		const oldGoal = ['pm51-goals-default', 'pm51-goals-receipts-help', 'pm51-goals-reset', 'pm51-goals-template-edit', 'pm51-goals-template-new', 'pm51-goals-verification', 'pm51-goals-verification-toggle', 'pm51-personas-goal-default'];
		const lostIds = theirs.ids.filter((x) => !mine.ids.includes(x) && !retired.includes(x));
		/* actions that left with a repeat (README, "Removed because it was there twice"): the arrow that only opened a
		   service from Limits & switching; nothing else */
		const allowed = new Set(['pm51-providers-policy-open', ...oldGoal]);
		const lostActions = theirs.actions.filter((x) => !mine.actions.includes(x) && !allowed.has(x));
		t.log(`views ${theirs.views.length} -> ${mine.views.length}; setting ids ${theirs.ids.length} -> ${mine.ids.length}; actions ${theirs.actions.length} -> ${mine.actions.length}`);
		/* the sixth pass gave the browser's page four tabs where it had none (three views more); the seventh made the
		   Goals page's four tabs three (Templates left with the old Goal, Recovery's rows are on Goals): one view fewer */
		await t.check('the views are the unchanged page\'s, plus the browser\'s three more tabs, less the old Goal\'s Templates tab', mine.views.length === theirs.views.length + 2, `${theirs.views.length} / ${mine.views.length}`);
		await t.check('the five retired Goal settings are drawn nowhere, and the old Goal\'s actions are gone', retired.every((x) => !mine.ids.includes(x)) && oldGoal.every((x) => !mine.actions.includes(x)), JSON.stringify({ ids: retired.filter((x) => mine.ids.includes(x)), actions: oldGoal.filter((x) => mine.actions.includes(x)) }));
		await t.check('the fifty proposed browser rows are drawn as settings', mine.ids.filter((x) => !theirs.ids.includes(x)).filter((x) => /^planning\.testing\.(browser|recording|screenshot)-/.test(x)).length === 50, String(mine.ids.filter((x) => !theirs.ids.includes(x)).length));
		await t.check('every setting is still drawn somewhere', lostIds.length === 0, lostIds.join(', '));
		await t.check('every action is still offered somewhere', lostActions.length === 0, lostActions.join(', '));
	}
};
