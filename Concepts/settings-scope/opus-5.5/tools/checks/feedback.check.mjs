// Jared's review of the settings-scope concept (2026-11-09, FEEDBACK.md items 3, 4, 8 and 11) and the guided-flows
// rows for this concept (GUIDED-FLOWS-CHECK "Changes for P": Copy settings 3.02-3.07, 3.12, 3.17 and Always allow
// 8.03-8.04). It runs on the single-file app build with the PuppetMaster kit's config:
//   python3 Concepts/settings-scope/opus-5.5/tools/build_standalone.py $OUT
//   browser-check run Concepts/settings-scope/opus-5.5/tools/checks/feedback.check.mjs \
//     --config Concepts/pm7-tools/browser-check/browser-check.config.mjs --set page=$OUT/settings-scope-app.html
// --set only=rows|shake|head|where|copy|always runs one part; --set looks=basic-dark,... narrows the looks (default
// Basic Dark, Retro Light and NieR Dark); --set lookShots=1 lists the review images under LOOK.
// "Full" is a 2560-wide window (the review strip's Full width is whatever window holds the frame).
const want = (t, part) => !t.args.only || String(t.args.only).split(',').includes(part);
const run = (t, fn, arg) => t.root.evaluate(fn, arg);
const settle = (t, ms = 350) => t.page.waitForTimeout(ms);
const WIDTHS = [['Full', 2560], ['1920', 1920], ['1280', 1280], ['1024', 1024], ['860', 860]];
const LOOKS3 = ['basic-dark', 'retro-light', 'nier-dark'];
const looks = (t) => (t.args.looks ? String(t.args.looks).split(',') : LOOKS3);
const pic = async (t, name, why, target) => {
	if (t.args.lookShots) { if (target) await t.crop(name, target, why); else await t.shot(name, why); }
	else await t.snap(name, target || undefined);
};
async function look(t, name) {
	await run(t, (n) => window.PSX.setLook(n), name);
	await t.root.waitForFunction((n) => { const th = document.documentElement.getAttribute('data-theme') || ''; return /^nier/.test(n) ? th.endsWith(n.slice(4)) && (th.startsWith('nier') || !!(window.PM_NIER && window.PM_NIER.on && window.PM_NIER.on())) : th === n; }, name, { timeout: 8000 }).catch(() => {});
	await settle(t, 300);
	await run(t, () => window.PSX.hideNote());
}
async function reset(t) { await run(t, () => window.PSX.command({ cmd: 'reset' })); await settle(t, 700); }
async function opt(t, end, changed) { await run(t, async (o) => { await window.PSX.command({ cmd: 'opt', end: o[0], changed: o[1] }); }, [end, changed]); await settle(t, 250); }
async function page(t, which) {
	await run(t, async (w) => {
		const K = window.PM12_KIMI, wait = (ms) => new Promise((r) => setTimeout(r, ms));
		K.navigate('ai', 'providers'); await wait(450);
		K.dispatchAction('pm51-tab', { manager: 'providers', tab: w === 'services' ? 'services' : 'models' }); await wait(650);
		// on Services, the selected service's account rows ("Each account") are the ones Jared's screen 03 shows
		const sc = document.querySelector(w === 'services' ? '#pm-settings-root .setting-row.o55-scoped' : '#pm-settings-root .setting-row.o55-row');
		if (sc) sc.scrollIntoView({ block: w === 'services' ? 'center' : 'start' });
		await wait(200);
	}, which);
}

/* every group of rows (a setting list) with two or more rows on screen: the visible control's right edge (or left edge
   when the control sits under the copy), and the end button's left edge, are each one x */
const ROWS = () => {
	const out = { groups: 0, rows: 0, bad: [] };
	const lists = new Set([...document.querySelectorAll('#pm-settings-root .setting-row.o55-row')].filter((r) => r.getClientRects().length && r.getBoundingClientRect().width > 100).map((r) => r.parentElement));
	for (const list of lists) {
		const rows = [...list.children].filter((r) => r.matches('.setting-row.o55-row:not(.is-wide)') && r.getClientRects().length);
		if (rows.length < 2) continue;
		out.groups++; out.rows += rows.length;
		const ctl = [], ends = [], stacked = [];
		for (const r of rows) {
			const c = r.querySelector(':scope > .setting-control'); if (!c) continue;
			const kids = [...c.children].filter((k) => k.getClientRects().length);
			if (!kids.length) continue;
			const kb = kids.map((k) => k.getBoundingClientRect());
			const rb = r.getBoundingClientRect(), cb = c.getBoundingClientRect();
			const isStacked = cb.top > rb.top + 20 && Math.abs(cb.left - rb.left) < 40;
			stacked.push(isStacked);
			ctl.push({ id: r.id, x: isStacked ? Math.min(...kb.map((b) => b.left)) : Math.max(...kb.map((b) => b.right)) });
			if (Math.max(...kb.map((b) => b.right)) > rb.right + 1) out.bad.push(`${r.id}: control runs past its row`);
			const e = [...r.querySelectorAll('.o55-about')].find((x) => x.closest('.setting-row') === r);
			if (e && e.getClientRects().length) ends.push({ id: r.id, x: e.getBoundingClientRect().left });
		}
		const spread = (a) => (a.length ? Math.max(...a.map((v) => v.x)) - Math.min(...a.map((v) => v.x)) : 0);
		const name = (list.closest('section, .o55-group') && (list.closest('section, .o55-group').querySelector('h3, h2, .o55-group-title') || {}).textContent || '').trim().slice(0, 40);
		if (stacked.some(Boolean) && stacked.some((x) => !x)) out.bad.push(`${name}: some controls sit beside the copy and some under it`);
		else if (spread(ctl) > 1.5) out.bad.push(`${name}: controls end at ${[...new Set(ctl.map((v) => Math.round(v.x)))].join(', ')}`);
		if (spread(ends) > 1.5) out.bad.push(`${name}: end words start at ${[...new Set(ends.map((v) => Math.round(v.x)))].join(', ')}`);
	}
	return out;
};

/* a toggle's change, frame by frame: the control, the end button, the row, the next row, the toolbar, the Changed mark
   and how many end buttons on screen show the base page's round "?" instead of their word; and what the browser itself
   reports as layout shifts inside Settings. Each sample is read just after a frame is painted (a task queued from
   requestAnimationFrame), so it sees what was on screen, not a state another frame callback fixed before the paint */
const TOGGLE = async (sel) => {
	const tg = document.querySelector(sel); if (!tg) return { missing: sel };
	tg.scrollIntoView({ block: 'center' });
	await new Promise((r) => setTimeout(r, 600));
	const row = tg.closest('.setting-row'), lab = row.querySelector('.setting-label');
	const end = [...row.querySelectorAll('.o55-about')].find((x) => x.closest('.setting-row') === row);
	const next = row.nextElementSibling || row.closest('section').nextElementSibling;
	const bar = document.querySelector('#pm-settings-root .document-toolbar');
	const shifts = [];
	const po = new PerformanceObserver((l) => l.getEntries().forEach((e) => (e.sources || []).forEach((s) => { const n = s.node && (s.node.nodeType === 1 ? s.node : s.node.parentElement); if (n && n.closest && n.closest('#pm-settings-root') && !n.closest('.psx-note, #pm-settings-portals')) shifts.push(String(n.className || n.nodeName).slice(0, 40)); })));
	po.observe({ type: 'layout-shift', buffered: false });
	const r1 = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.x * 2) / 2, Math.round(b.y * 2) / 2, Math.round(b.width * 2) / 2, Math.round(b.height * 2) / 2]; };
	const samples = []; let go = true;
	const vh = innerHeight, decided = document.documentElement.getAttribute('data-psx-end') !== 'today';
	const bare = () => (decided ? [...document.querySelectorAll('#pm-settings-root .setting-row.o55-row > .o55-about')].filter((b) => { const r = b.getBoundingClientRect(); return r.height && r.bottom > 0 && r.top < vh && !b.querySelector('.psx-end-word'); }).length : 0);
	const ch = new MessageChannel();
	ch.port1.onmessage = () => { samples.push({ tg: r1(tg), end: r1(end), row: r1(row), next: r1(next), bar: r1(bar), ch: lab ? lab.querySelectorAll('.o55-changed:not(.o55-needed)').length : 0, q: bare() }); if (go) requestAnimationFrame(() => ch.port2.postMessage(0)); };
	requestAnimationFrame(() => ch.port2.postMessage(0));
	await new Promise((r) => setTimeout(r, 200));
	tg.click();
	await new Promise((r) => setTimeout(r, 1600));
	go = false; po.disconnect();
	const moved = (k, i) => samples.some((s) => JSON.stringify(s[k] && (i == null ? s[k] : s[k][i])) !== JSON.stringify(samples[0][k] && (i == null ? samples[0][k] : samples[0][k][i])));
	const chs = samples.map((x) => x.ch); const flips = chs.filter((v, i) => i && v !== chs[i - 1]).length;
	return { id: row.id, frames: samples.length, toggleX: moved('tg', 0), endX: moved('end', 0), endW: moved('end', 2), rowY: moved('row', 1), rowH: moved('row', 3), nextY: moved('next', 1), bar: moved('bar'), changedFlips: flips, maxChanged: Math.max(...chs), bareEnds: Math.max(...samples.map((x) => x.q)), shifts };
};

/* the header: its box and the page under it, in one view */
const HEAD = () => {
	const bar = document.querySelector('#pm-settings-root .document-toolbar'), main = bar && bar.querySelector('.psx-head-main');
	const chg = bar && bar.querySelector('[data-psx-head="view"]');
	const first = document.querySelector('#pm-settings-root .document-toolbar ~ *');
	const r = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)]; };
	const txt = bar ? bar.innerText : '';
	const proj = (window.PSX.ctxFull(window.PSX.S.ctx).project) || 'No project';
	const visible = (sel) => [...document.querySelectorAll(sel)].some((e) => e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden');
	return {
		bar: r(bar), main: r(main), change: r(chg), first: r(first), viewing: main ? main.getAttribute('data-viewing') : null,
		text: txt, projCount: txt.split(proj).length - 1, myView: /my view/i.test(document.getElementById('pm-settings-root').innerText),
		pill: visible('#pm-settings-root .document-toolbar .project-pill'), rail: visible('#pm-settings-root .rail-project'),
		stop: !!(bar && bar.querySelector('[data-psx-head="mine"]')), wraps: main ? main.scrollWidth > main.clientWidth + 1 && getComputedStyle(main.querySelector('.psx-head-ctx')).textOverflow !== 'ellipsis' : false
	};
};

export default async function (t) {
	await t.app.open();
	const has = await run(t, () => document.documentElement.hasAttribute('data-psx-layer'));
	if (!has) { await t.check('not a settings-scope build, skipped (build it with tools/build_standalone.py)', true); return; }
	await t.until('the layer is booted', () => !!(window.PSX && window.PSX.booted && window.PSX.lastReport), null, { timeout: 60000, hard: true });
	await settle(t, 800);

	/* ------------------------------------------------------------------ #3 rows line up */
	if (want(t, 'rows')) await t.step('#3: every control and end word in a section lines up', async () => {
		const CONFIGS = [['origin', 'outline', 'decided'], ['mark', 'outline', 'end B'], ['line', 'outline', 'end C'], ['more', 'outline', 'end D'], ['today', 'outline', 'end Today'], ['origin', 'word', 'Changed B'], ['origin', 'frame', 'Changed C'], ['origin', 'today', 'Changed Today']];
		for (const lk of looks(t)) {
			await look(t, lk);
			for (const [wname, w] of WIDTHS) {
				await t.viewport(w, w >= 1920 ? 1080 : 900);
				await settle(t, 400);
				for (const pg of ['models', 'services']) {
					await page(t, pg);
					for (const [end, changed, name] of CONFIGS) {
						await opt(t, end, changed);
						const r = await run(t, ROWS);
						await t.check(`${lk} · ${wname} · ${pg} · ${name}: ${r.rows} rows in ${r.groups} groups line up`, r.groups > 0 && r.bad.length === 0, r.bad.slice(0, 4).join(' | '));
					}
					await opt(t, 'origin', 'outline');
					if (pg === 'models') await pic(t, `rows-${lk}-${wname}`, `Models, decided design, ${lk}, ${wname}: each section's controls end at one x and the end words start at one x`, '#pm-settings-root .workspace-block, #pm-settings-root main');
				}
			}
		}
		await t.viewport(1920, 1080);
		await look(t, 'basic-dark');
		await page(t, 'services');
		await pic(t, 'rows-services-account', 'Services › Claude, an account open: Each account rows line up with the rest', null);
	});

	/* ------------------------------------------------------------------ #4 toggling doesn't shake the page */
	if (want(t, 'shake')) await t.step('#4: a toggle moves nothing but itself', async () => {
		await reset(t);
		for (const [wname, w] of [['1920', 1920], ['1024', 1024], ['860', 860]]) {
			await t.viewport(w, w >= 1920 ? 1080 : 900);
			for (const [end, changed] of [['origin', 'outline'], ['more', 'outline'], ['today', 'outline']]) {
				await opt(t, end, changed);
				await page(t, 'models');
				for (const sel of ['#setting-general\\.interaction\\.provider-disclosure .toggle', '#setting-general\\.interaction\\.provider-disclosure .toggle', '#setting-ai\\.usage\\.auto-refresh-discovery .toggle']) {
					const r = await run(t, TOGGLE, sel);
					const where = `${wname} · ${end} · ${r.id || sel}`;
					await t.check(`${where}: the switch stays put (${r.frames} frames)`, !r.missing && !r.toggleX, JSON.stringify(r));
					await t.check(`${where}: the end word neither moves nor changes width`, !r.endX && !r.endW, JSON.stringify(r));
					await t.check(`${where}: no frame shows a row’s “?” instead of its word`, !r.bareEnds, JSON.stringify(r));
					await t.check(`${where}: the row, the next row and the header keep their place`, !r.rowY && !r.rowH && !r.nextY && !r.bar, JSON.stringify(r));
					await t.check(`${where}: Changed appears or goes once, never on, off and on`, r.changedFlips <= 1 && r.maxChanged <= 1, JSON.stringify(r));
					await t.check(`${where}: the browser saw no layout shift in Settings`, r.shifts.length === 0, r.shifts.join(', '));
				}
				await run(t, () => window.PSX.hideNote());
			}
		}
		// a screen row on General (Play sounds), routed to this device, and a demo row routed to everywhere
		await t.viewport(1920, 1080);
		await opt(t, 'origin', 'outline');
		await reset(t);
		for (const id of ['general.interaction.show-tooltips', 'general.interaction.eli5-default', 'ai.models.interleaved-thinking']) {
			await run(t, async (i) => { window.PM51.revealSetting(i); await new Promise((r) => setTimeout(r, 1200)); }, id);
			const r = await run(t, TOGGLE, `#setting-${id.replace(/\./g, '\\.')} .toggle`);
			if (r.missing) { await t.check(`${id} is drawn with a switch`, false, 'not drawn'); continue; }
			// Explain technical terms rewrites the descriptions on purpose, so the rows below may move; nothing else may
			const reflows = id === 'general.interaction.eli5-default';
			await t.check(`${r.id}: nothing moves but the switch${reflows ? ' (its new wording may move the rows below)' : ''}`, !r.toggleX && !r.endX && !r.endW && !r.rowY && !r.bar && !r.bareEnds && r.changedFlips <= 1 && (reflows || (!r.rowH && !r.nextY && r.shifts.length === 0)), JSON.stringify(r));
		}
		await t.check('no row ever shows Changed twice', () => run(t, () => [...document.querySelectorAll('#pm-settings-root .setting-label')].every((l) => l.querySelectorAll('.o55-changed:not(.o55-needed)').length <= 1)));
	});

	/* ------------------------------------------------------------------ #11 the header */
	if (want(t, 'head')) await t.step('#11: one calm header that never moves', async () => {
		const VIEWS = [
			['own', { cmd: 'reset' }],
			['harbor', { project: 'harbor', on: null, device: 'here' }],
			['no project', { project: 'none', on: null, device: 'here' }],
			['tastebook on Home NAS', { project: 'tastebook', on: 'homenas', device: 'here' }],
			['iPhone screen', { project: 'tastebook', on: null, device: 'iphone' }],
			['harbor on Studio Mac with iPhone', { project: 'harbor', on: 'studio', device: 'iphone' }]
		];
		for (const lk of looks(t)) {
			await look(t, lk);
			for (const [wname, w] of WIDTHS) {
				await t.viewport(w, w >= 1920 ? 1080 : 900);
				await reset(t);
				await page(t, 'models');
				const seen = [];
				for (const [name, ctx] of VIEWS) {
					if (ctx.cmd) await reset(t); else { await run(t, (c) => window.PSX.setCtx(c), ctx); await settle(t, 600); }
					const h = await run(t, HEAD);
					seen.push([name, h]);
					const viewing = /Home NAS|iPhone|Studio Mac/.test(name);
					await t.check(`${lk} · ${wname} · ${name}: the project is named once`, h.projCount === 1, h.text);
					await t.check(`${lk} · ${wname} · ${name}: viewing is ${viewing ? 'shown, with Stop viewing' : 'not shown'}`, (h.viewing === '1') === viewing && h.stop === viewing, JSON.stringify([h.viewing, h.stop, h.text]));
					await t.check(`${lk} · ${wname} · ${name}: no “my view”, no second project button, no rail project line`, !h.myView && !h.pill && !h.rail, JSON.stringify(h));
				}
				const base = seen[0][1];
				for (const [name, h] of seen.slice(1)) {
					await t.equal(`${lk} · ${wname} · ${name}: the header box is where it was`, JSON.stringify([h.bar, h.main]), JSON.stringify([base.bar, base.main]));
					await t.equal(`${lk} · ${wname} · ${name}: Change is where it was`, JSON.stringify(h.change), JSON.stringify(base.change));
					await t.equal(`${lk} · ${wname} · ${name}: the page under it is where it was`, JSON.stringify(h.first && h.first.slice(1, 2)), JSON.stringify(base.first && base.first.slice(1, 2)));
				}
				if (wname === '1920' || wname === '860') {
					await pic(t, `head-own-${lk}-${wname}`, `The header in your own view, ${lk}, ${wname}`, '#pm-settings-root .document-toolbar');
					await run(t, () => window.PSX.setCtx({ project: 'harbor', on: 'studio', device: 'iphone' })); await settle(t, 600);
					await pic(t, `head-viewing-${lk}-${wname}`, `Viewing harbor on Studio Mac with iPhone's screen, ${lk}, ${wname}: same box, framed, Stop viewing`, '#pm-settings-root .document-toolbar');
				}
			}
		}
		// Stop viewing goes back, and the keyboard stays on the header
		await t.viewport(1920, 1080);
		await look(t, 'basic-dark');
		await reset(t);
		await run(t, () => window.PSX.setCtx({ on: 'homenas' })); await settle(t, 500);
		await t.root.locator('#pm-settings-root [data-psx-head="mine"]').click();
		await settle(t, 600);
		const back = await run(t, HEAD);
		await t.check('Stop viewing goes back to tastebook on This computer', back.viewing === '0' && /tastebook on This computer/.test(back.text), back.text);
		await t.check('focus lands on Change after Stop viewing', () => run(t, () => (document.activeElement || {}).getAttribute && document.activeElement.getAttribute('data-psx-head') === 'view'));
		// the Change menu: a project, another computer, another device's screen, everything at once
		await t.root.locator('#pm-settings-root [data-psx-head="view"]').click();
		await settle(t, 400);
		const menu = await run(t, () => document.body.innerText);
		await t.check('Change offers a project, another computer and another device’s screen', /Look at another computer/i.test(menu) && /Look at another device’s screen/i.test(menu) && /All the differences/i.test(menu), 'menu not found');
		await t.page.keyboard.press('Escape');
		// YOLO and the settings home away: still one header row; the notice goes under it
		await run(t, async () => { await window.PSX.command({ cmd: 'runmode', mode: 'yolo' }); }); await settle(t, 500);
		const y = await run(t, HEAD);
		await t.equal('YOLO keeps the header row in place', JSON.stringify([y.main, y.change]), JSON.stringify([back.main, back.change]));
		await run(t, async () => { await window.PSX.command({ cmd: 'runmode', mode: 'regular' }); await window.PSX.command({ cmd: 'ctx', homenas: 'down' }); }); await settle(t, 500);
		const away = await run(t, HEAD);
		await t.check('with Home NAS away the header row stays and the notice is a line under it', JSON.stringify(away.main) === JSON.stringify(back.main) && /Can’t reach Home NAS, which keeps your settings/.test(away.text), away.text);
		await reset(t);
	});

	/* ------------------------------------------------------------------ #8 Where it applies is the same everywhere */
	if (want(t, 'where')) await t.step('#8: every Where it applies has the same parts, Devices only on screen rows', async () => {
		await reset(t);
		const all = await run(t, () => {
			const P = window.PSX, out = { n: 0, bad: [], screen: 0, devices: [] };
			for (const id of Object.keys(P.DEF)) {
				const def = P.DEF[id]; let sec;
				try { sec = P.panel.whereBlock(id, P.resolve(id, P.S.ctx), { context: 'check' }); } catch (e) { out.bad.push(id + ': ' + e.message); continue; }
				out.n++;
				const slots = [...sec.querySelectorAll(':scope > [data-psx-slot]')].map((g) => g.getAttribute('data-psx-slot'));
				const wantMid = def.screen ? 'device' : 'computer';
				if (JSON.stringify(slots.slice(0, 3)) !== JSON.stringify(['everywhere', wantMid, 'project'])) out.bad.push(`${id}: parts ${slots.join(', ')}`);
				const mid = sec.querySelector(':scope > [data-psx-slot="device"]');
				if (def.screen) { out.screen++; out.devices.push(P.label(id)); if (!mid || !mid.querySelector('.psx-wwhy') || !/so it can differ per device\./.test(mid.querySelector('.psx-wwhy').textContent)) out.bad.push(`${id}: Devices without its plain line`); }
				if (!def.screen && /Set for a device|Devices/.test(sec.textContent)) out.bad.push(`${id}: a device choice on a row that isn't about a screen`);
				sec.querySelectorAll(':scope > [data-psx-slot]').forEach((g) => { if (!g.querySelector('.psx-wline, .psx-wnot, .psx-wrest, .psx-add')) out.bad.push(`${id}: part ${g.getAttribute('data-psx-slot')} is empty`); });
			}
			return out;
		});
		await t.check(`all ${all.n} rows: Everywhere, then ${'Computers or Devices'}, then Projects`, all.n > 800 && all.bad.length === 0, all.bad.slice(0, 6).join(' | '));
		await t.check(`${all.screen} screen rows list Devices with one plain line, and libraries are not among them`, all.screen > 10 && !all.devices.some((l) => /Your own themes|Sound library|Add a sound|Start custom themes/.test(l)), all.devices.join(', '));
		const left = await run(t, () => {
			const P = window.PSX, off = P.offLadder;
			return Object.keys(window.PM51.placement.byId).filter((id) => {
				const s = window.PM51.setting(id); if (!s || /^(resource|action)$/.test(String(s.control || ''))) return false;
				if (P.DEF[id] || off.look.test(id) || off.credential.test(id) || off.thing.includes(id)) return false;
				const sc = ((P.REF || {})[id] || {}).scope || [];
				return !(sc.length && sc.some((x) => ['account', 'provider', 'persona'].includes(x)) && !sc.includes('global'));
			});
		});
		await t.check('every Settings row is on the ladder, or is a look detail, a key, or one thing’s own', left.length === 0, left.slice(0, 12).join(', '));
		await t.check('the four rows Jared named are screen rows', () => run(t, () => ['general.visual.font-size', 'general.visual.theme', 'general.interaction.sound-effects', 'general.visual.reduce-animations'].every((id) => window.PSX.DEF[id].screen)));
		await t.check('the row menu offers “Set for this screen” only on screen rows', () => run(t, () => {
			const P = window.PSX; let ok = true;
			for (const id of ['ai.models.default-model', 'general.interaction.eli5-default', 'safety.rules.permission-preset']) { const d = P.DEF[id]; if ((d.may || []).includes('device')) ok = false; }
			return ok && (P.DEF['general.visual.font-size'].may || []).includes('device');
		}));
		// real panels, one of each kind, and an account's own row
		const IDS = ['ai.models.default-model', 'general.visual.font-size', 'general.visual.theme', 'system.advanced.cli-path-claude', 'memory.assembly.project-rules', 'general.interaction.scope-labels', 'system.advanced.auto-update', 'general.interaction.submit-key', 'branching.subagents.max-parallel', 'safety.rules.permission-preset', 'general.visual.theme-mode', 'general.visual.wallpaper', 'ai.accounts.github-token'];
		for (const id of IDS) {
			const p = await run(t, async (i) => {
				window.PM51.revealSetting(i, { detail: true });
				for (let k = 0; k < 30; k++) { await new Promise((r) => setTimeout(r, 150)); const c = document.querySelector('#pm-settings-root .detail-inspector .o55-insp-tech code'); if (c && c.textContent.trim() === i && document.querySelector('#pm-settings-root .detail-inspector [data-psx-block="where"] [data-psx-slot]')) break; }
				const insp = document.querySelector('#pm-settings-root .detail-inspector');
				const heads = [...insp.querySelectorAll('.o55-insp-block h4')].filter((h) => h.offsetParent && /^Where it applies$/.test(h.textContent.trim())).length;
				const w = insp.querySelector('[data-psx-block="where"]');
				return { heads, slots: w ? [...w.querySelectorAll(':scope > [data-psx-slot]')].map((g) => g.getAttribute('data-psx-slot')) : [], code: (insp.querySelector('.o55-insp-tech code') || {}).textContent };
			}, id);
			await t.check(`panel ${id}: one Where it applies, in three parts`, p.code === id && p.heads === 1 && p.slots.length >= 3, JSON.stringify(p));
			if (['general.visual.font-size', 'system.advanced.cli-path-claude', 'general.interaction.scope-labels', 'ai.models.default-model'].includes(id)) await pic(t, `where-${id}`, `Where it applies for ${id}: the same three parts`, '#pm-settings-root .detail-inspector [data-psx-block="where"]');
		}
		await run(t, () => { const b = document.querySelector('#pm-settings-root .detail-inspector .pm51-panel-close'); if (b) b.click(); });
		// an account's own row: the base page's per-account list stays, the three parts follow it
		await page(t, 'services');
		const per = await run(t, async () => {
			const b = [...document.querySelectorAll('#pm-settings-root .o55-about')].find((x) => /Each account/.test(x.textContent) && x.getClientRects().length); if (!b) return null;
			b.click(); await new Promise((r) => setTimeout(r, 1100));
			const insp = document.querySelector('#pm-settings-root .detail-inspector');
			const heads = [...insp.querySelectorAll('.o55-insp-block h4')].filter((h) => h.offsetParent && /^Where it applies$/.test(h.textContent.trim())).length;
			const w = insp.querySelector('[data-psx-block="where"]');
			return { heads, per: !!insp.querySelector('.o55-insp-now.is-per'), slots: w ? [...w.querySelectorAll(':scope > [data-psx-slot]')].map((g) => g.getAttribute('data-psx-slot')) : [], text: w ? w.innerText : '' };
		});
		await t.check('an account’s own row: one Where it applies, in the same three parts', !!per && per.per && per.heads === 1 && JSON.stringify(per.slots) === JSON.stringify(['everywhere', 'computer', 'project']), JSON.stringify(per));
		if (per) await pic(t, 'where-per-account', 'An account’s own row (Each account): the base page’s list, then the same three parts', '#pm-settings-root .detail-inspector');
		await run(t, () => { const b = document.querySelector('#pm-settings-root .detail-inspector .pm51-panel-close'); if (b) b.click(); });
		// the base page's own scope words where the layer has its block: MCP servers
		const mcp = await run(t, async () => {
			const p = window.PM51.placement.byId['system.mcp.server-scope']; window.PM12_KIMI.navigate(p.domain, p.workspace); await new Promise((r) => setTimeout(r, 1000));
			const items = [...document.querySelectorAll('#pm-settings-root .pm51-item[data-action="pm51-mcp-open"]')];
			const metaWords = items.filter((i) => [...i.querySelectorAll('.pm51-item-meta:not([data-psx-reach])')].some((m) => / · (This project only|Managed by Puppet Master|Outside service)\s*$/.test(m.textContent.trim()))).length;
			const reach = items.filter((i) => i.querySelector('[data-psx-reach]')).length;
			const it = items.find((i) => /GitHub/.test(i.textContent)); if (it) it.click(); await new Promise((r) => setTimeout(r, 1200));
			const aside = document.querySelector('aside.drawer');
			const engineWhere = aside ? [...aside.querySelectorAll('.pm51-kv-row')].filter((r) => /^Where it applies$/.test((r.firstElementChild || {}).textContent || '') && r.getClientRects().length).length : -1;
			const layerWhere = aside ? !!aside.querySelector('[data-psx-mcp]') && /Where it’s available/.test(aside.innerText) : false;
			return { items: items.length, metaWords, reach, engineWhere, layerWhere };
		});
		await t.check('MCP list: the layer’s line says where each server is available, the base page’s scope word is gone', mcp.items > 0 && mcp.reach === mcp.items && mcp.metaWords === 0, JSON.stringify(mcp));
		await t.check('MCP server panel: only the layer’s Where it’s available, the base page’s Where it applies hidden', mcp.engineWhere === 0 && mcp.layerWhere, JSON.stringify(mcp));
		await pic(t, 'where-mcp-drawer', 'GitHub MCP’s panel: How it connects without a second Where it applies; the layer’s Where it’s available', 'aside.drawer');
		await run(t, () => { const b = document.querySelector('#pm-settings-portals [data-action="close-overlay"]'); if (b) b.click(); });
	});

	/* ------------------------------------------------------------------ guided flows 3.x: Copy settings */
	if (want(t, 'copy')) await t.step('guided flows 3.02-3.07, 3.12, 3.17: Copy settings', async () => {
		await reset(t);
		const c = await run(t, async () => {
			const P = window.PSX, wait = (ms) => new Promise((r) => setTimeout(r, ms)), out = {};
			await P.command({ cmd: 'moment', id: 'copy-new' }); await wait(700);
			const sh = () => document.querySelector('.psx-sheet.psx-copy');
			out.label = /Notifications & limits/.test(sh().innerText) && !/Notifications and limits/.test(sh().innerText);
			out.cannot = !!sh().querySelector('[data-outcome="cannot_move"]') && /Can’t be used on Home NAS/.test(sh().innerText) && /It belongs to one device\. It stays this Project’s intended choice, and nothing replaces it\./.test(sh().innerText);
			out.identities = /Only which accounts, in their order: no sign-in, key or token is copied\./.test(sh().innerText);
			out.defaultsOff = !P.copy.st.fixed && !P.copy.st.fromComp && Object.values(P.copy.st.files).every((v) => !v);
			// Keep them fixed follows the kinds you chose and the rows you unticked
			const fixed = sh().querySelector('input[data-act="fixed"]'); fixed.click(); await wait(300);
			const plan1 = P.copy.plan(); const fixedKinds = [...new Set(plan1.rows.filter((x) => x.fixed).map((x) => P.copy.kindOf(x.id)))];
			out.fixedOn = plan1.rows.filter((x) => x.fixed).length;
			const kid = fixedKinds[0]; out.kid = kid;
			const kbox = sh().querySelector(`input[data-act="kind"][data-kind="${kid}"]`); if (kbox && kbox.checked) kbox.click(); else if (kbox) { kbox.click(); await wait(200); sh().querySelector(`input[data-act="kind"][data-kind="${kid}"]`).click(); }
			await wait(300);
			out.kindGone = !P.copy.plan().rows.some((x) => x.fixed && P.copy.kindOf(x.id) === kid);
			// turning Keep them fixed off and on again doesn't bring the deselected kind back
			sh().querySelector('input[data-act="fixed"]').click(); await wait(200); sh().querySelector('input[data-act="fixed"]').click(); await wait(300);
			out.kindStaysGone = !P.copy.plan().rows.some((x) => x.fixed && P.copy.kindOf(x.id) === kid);
			// one fixed row unticked by itself
			const other = fixedKinds.find((k) => k !== kid);
			if (other) {
				const ob = sh().querySelector(`[data-act="openkind"][data-kind="${other}"]`); if (ob && ob.getAttribute('aria-expanded') !== 'true') { ob.click(); await wait(200); }
				const one = sh().querySelector(`input[data-act="onefixed"][data-kind="${other}"]`);
				out.oneId = one && one.dataset.id; if (one) { one.click(); await wait(250); }
				out.oneGone = !!out.oneId && !P.copy.plan().rows.some((x) => x.id === out.oneId);
			}
			P.closeSheets(); await wait(300);
			// the destination is checked again at the moment of the copy: Work Claude expires on Home NAS after the preview
			P.setCtx({ project: 'garden-notes' }); await wait(500);
			P.copy.open({ mode: 'settings', src: 'tastebook' }); await wait(500);
			sh().querySelector('.psx-sheet-foot .btn.primary').click(); await wait(400);
			out.preview = /garden-notes gets/.test(sh().innerText);
			const before = JSON.stringify(P.W.project['garden-notes']);
			P.W.things.accounts['work-claude'].on.homenas = 'expired';
			sh().querySelector('.psx-sheet-foot .btn.primary').click(); await wait(500);
			out.reshown = !!sh() && !!sh().querySelector('[data-psx-stale="accounts"]') && /Expired on Home NAS/.test(sh().innerText);
			out.nothingWritten = JSON.stringify(P.W.project['garden-notes']) === before;
			return out;
		});
		await t.check('3.05: the kind reads Notifications & limits', c.label);
		await t.check('3.12: a device-bound account says Can’t be used on Home NAS, and stays the intended choice', c.cannot, JSON.stringify(c));
		await t.check('3.03: account identities only, never a sign-in, key or token', c.identities);
		await t.check('3.06: About its own files, Keep them fixed and Copy what it gets from its computer start off', c.defaultsOff);
		await t.check('3.07: a deselected kind adds no fixed rows', c.fixedOn > 0 && c.kindGone, JSON.stringify(c));
		await t.check('3.07: turning Keep them fixed off and on doesn’t bring it back', c.kindStaysGone, JSON.stringify(c));
		await t.check('3.07: a fixed row unticked by itself stays out', c.oneGone, JSON.stringify(c));
		await t.check('3.14: Copy checks the destination again and shows the preview again when an account changed there', c.preview && c.reshown && c.nothingWritten, JSON.stringify(c));
		await pic(t, 'copy-reshown', 'Copy into garden-notes: Work Claude expired on Home NAS after the preview, so the preview is shown again', '.psx-sheet.psx-copy');
		await run(t, () => window.PSX.closeSheets());
		await reset(t);
		await run(t, () => window.PSX.command({ cmd: 'moment', id: 'copy-new' }));
		await settle(t, 900);
		await pic(t, 'copy-new-homenas', 'New Project › Start like tastebook on Home NAS: Copilot can’t be used there; accounts only, never secrets', '.psx-sheet.psx-copy');
		await run(t, () => window.PSX.closeSheets());
	});

	/* ------------------------------------------------------------------ guided flows 8.03-8.04: Always allow */
	if (want(t, 'always')) await t.step('guided flows 8.03-8.04: Always allow chooses the pattern and the place', async () => {
		await reset(t);
		await run(t, async () => { await window.PSX.command({ cmd: 'runmode', mode: 'regular' }); await window.PSX.command({ cmd: 'moment', id: '11.18' }); });
		await settle(t, 800);
		const sh = '.psx-sheet';
		const ed = async (id) => run(t, (i) => {
			const e = document.querySelector(`${'.psx-sheet'} [data-always="${i}"]`); if (!e) return null;
			return { pat: [...e.querySelectorAll('[data-pat]')].map((r) => r.checked), where: [...e.querySelectorAll('[data-where]')].map((r) => r.value + ':' + r.checked), save: e.querySelector('[data-always-save]').getAttribute('aria-disabled'), note: !!e.querySelector('[data-k="noeverywhere"]'), preview: (e.querySelector('[data-k="preview"]') || {}).textContent || '' };
		}, id);
		await t.root.locator(`${sh} [data-ask="test"][data-a="always"]`).click(); await settle(t, 300);
		let e = await ed('test');
		await t.check('8.03: Always allow opens the pattern and the place, nothing chosen', !!e && e.pat.every((x) => !x) && e.where.every((x) => /:false$/.test(x)) && e.save === 'true', JSON.stringify(e));
		await t.check('8.04: npm test is not about one computer, so Everywhere is offered', e.where.some((x) => /^everywhere/.test(x)) && !e.note, JSON.stringify(e));
		await t.root.locator(`${sh} [data-always="test"] [data-pat="1"]`).check(); await settle(t, 250);
		e = await ed('test');
		await t.check('8.03: the chosen pattern shows what it matches and what still asks', /Matches:.*npm test -- --watch/.test(e.preview) && /Still asks:.*npm run build/.test(e.preview), e.preview);
		await t.root.locator(`${sh} [data-always="test"] [data-where="project"]`).check(); await settle(t, 250);
		await pic(t, 'always-editor', 'Always allow for npm test: the pattern npm test * and In this project chosen by hand, with what it matches', '.psx-sheet');
		await t.root.locator(`${sh} [data-always-save="test"]`).click(); await settle(t, 300);
		await t.check('the rule is written with the chosen pattern and place', () => run(t, () => { const st = window.PSX.approvals.st; return st.rules.length === 1 && st.rules[0].pattern === 'npm test *' && st.rules[0].where === 'Always in loom'; }));
		for (const id of ['release', 'outside']) {
			await t.root.locator(`${sh} [data-ask="${id}"][data-a="always"]`).click(); await settle(t, 300);
			e = await ed(id);
			await t.check(`8.04: ${id === 'release' ? 'a script by its path' : 'a folder'} never offers Everywhere, and says why`, !!e && !e.where.some((x) => /^everywhere/.test(x)) && e.note, JSON.stringify(e));
			if (id === 'release') await pic(t, 'always-host', 'Always allow for ./scripts/release.sh: Everywhere is not offered, with the reason', '.psx-sheet');
			await t.root.locator(`${sh} [data-always-cancel="${id}"]`).click(); await settle(t, 200);
		}
		// your own pattern naming a program's location is host-dependent too
		await t.root.locator(`${sh} [data-ask="test"][data-a="always"]`).count().then(async (n) => { if (n) { await t.root.locator(`${sh} [data-ask="test"][data-a="always"]`).click(); await settle(t, 200); } });
		const own = await run(t, () => window.PSX.approvals.hostDependent('/usr/local/bin/npm test', { path: false }) && !window.PSX.approvals.hostDependent('npm test *', { path: false }));
		await t.check('8.04: a pattern that names a program’s location is host-dependent; npm test * is not', own);
		// YOLO: ordinary push and publish run without asking, and no Always rule is made
		await run(t, async () => { await window.PSX.command({ cmd: 'runmode', mode: 'yolo' }); }); await settle(t, 500);
		const y = await run(t, () => { const s = document.querySelector('.psx-sheet'); const tx = s ? s.innerText : ''; return { push: /Push to GitHub[\s\S]*Ran, not asked/.test(tx), publish: /Publish the image[\s\S]*Ran, not asked/.test(tx), rules: window.PSX.approvals.st.rules.length, none: /None made/.test(tx) }; });
		await t.check('8.05-8.06: YOLO pushes and publishes without asking and makes no Always rule of its own', y.push && y.publish && y.rules === 1, JSON.stringify(y));
		await run(t, async () => { await window.PSX.command({ cmd: 'runmode', mode: 'regular' }); window.PSX.closeSheets(); });
	});
}
