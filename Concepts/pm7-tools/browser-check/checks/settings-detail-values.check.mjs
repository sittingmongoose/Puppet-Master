// FO-173 (P concept A, Sol max N1, 2026-11-12): long Settings detail values got less room than their widest word at
// 860 px: Media & Output › Image Generation's "Saves to" path shared its control with Change (154 px against a 222 px
// word at 12.5 px mono on Windows, 243 px with the Linux hosts' mono) and Code & Tools › Toolchain › Formatters › Prettier's "Runs as" got the 131 px a 120 px key
// column left it (161 px word). Both broke the path anywhere (`overflow-wrap: anywhere`).
//
// Every detail value in a cell (`.pm51-kv-row > span:last-child`, `.pm51-row-value`) is read with its own computed
// font: its widest whitespace-separated word, its box, and the room its row offers (the row's whole content width).
// A value passes when its box is at least its widest word (0.5 px), or when it already has its row's whole content
// width (then only a word wider than the row may break). It also must not be clipped (its box inside its row, no
// scroll overflow, no ellipsis) and must be 11 px or more.
// Cases: every Media ability (with Image Generation's "Saves to" path required), every Toolchain formatter and
// language server (with Prettier's "Program" and its Advanced "Runs as" required), every server ("Identity", a
// fingerprint; "Image"), every source service ("Fetch address", "Push address") and every backup destination
// ("Location", a path), each with every <details> in the detail opened.
// Cells: all ten looks, each chosen through Settings' own Theme and Light-or-dark rows and guarded as painted
// (helpers/settings-look.mjs), at 860x900, 740x900 and 1280x500 (the page opened at 1390x900 and resized; each cell
// logs whether Files is docked). Both surfaces (`--set sandbox=0` and `--set sandbox=1`).
// Fonts matter: Windows' mono draws ".puppet-master/artifacts/exports" at 229.5 px, the Linux hosts' at 250.4 px, so run
// it on a Linux host (Nas1) as well as Windows or Alexis (opus-recheck-fo173-177 M1 failed round 3 on Nas1 only).
// Bite: fails main 6bd8294726 (at 860 in every look: Saves to, Runs as, Identity, Image, Fetch and Push address,
// Location; Pyright's Program in Retro at 740); passes FO-173.
//   browser-check run Concepts/pm7-tools/browser-check/checks/settings-detail-values.check.mjs --set page=<build> --set sandbox=0
//   --set looks=a,b   --set sizes=860x900,1280x500   --set cases=media,toolchain,servers,source,backup   --set probe=1 (log every value)
//   --set shots=basic-dark,retro-light (normal surface: LOOK crops of the two named rows per look and size;
//   --set build=<name> names them)   --set sweep=1 (also every chapter, workspace and manager tab, values as found)
import { LOOKS } from '../browser-check.config.mjs';
import { setLookBySetting, guardPaintedLook } from '../helpers/settings-look.mjs';

const SIZES = [{ id: '860x900', w: 860, h: 900 }, { id: '740x900', w: 740, h: 900 }, { id: '1280x500', w: 1280, h: 500 }];
const MIN_PX = 11;
const r1 = (n) => Math.round(n * 10) / 10;

/* the values under `scope`, measured where they are drawn */
const VALUES = (scope) => {
	const root = document.querySelector(scope);
	if (!root) return { values: [], scope: false };
	const probe = document.createElement('span');
	probe.style.cssText = 'position:absolute;visibility:hidden;white-space:pre;left:-99999px;top:0';
	document.body.append(probe);
	const values = [];
	for (const el of root.querySelectorAll('.pm51-kv-row > span:last-child, .pm51-row-value')) {
		if (!el.getClientRects().length || !el.checkVisibility()) continue;
		if (el.closest('details:not([open])')) continue;
		const text = el.textContent.replace(/\s+/g, ' ').trim();
		if (!text) continue;
		const cs = getComputedStyle(el);
		for (const p of ['fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'letterSpacing', 'wordSpacing', 'textTransform', 'fontVariant', 'fontFeatureSettings', 'fontStretch', 'fontKerning']) probe.style[p] = cs[p];
		let widest = 0, word = '';
		for (const w of text.split(' ')) { probe.textContent = w; const ww = probe.getBoundingClientRect().width; if (ww > widest) { widest = ww; word = w; } }
		const r = el.getBoundingClientRect();
		const row = el.closest('.pm51-kv-row, .pm51-row, .setting-row');
		const rr = row ? row.getBoundingClientRect() : r;
		const rcs = row ? getComputedStyle(row) : cs;
		/* the row's whole content width: a value under its label may use all of it (round 4: a stacked scoped row's control
		   spans the About column too; the old room left that column out and reported 293 px where the control had 247) */
		const room = rr.width - parseFloat(rcs.paddingLeft) - parseFloat(rcs.paddingRight) - parseFloat(rcs.borderLeftWidth) - parseFloat(rcs.borderRightWidth);
		const rg = document.createRange(); rg.selectNodeContents(el);
		const lines = new Set([...rg.getClientRects()].filter((b) => b.width > 0.5).map((b) => Math.round(b.top))).size;
		const label = row ? row.querySelector('.pm51-kv-row > span:first-child, .pm51-row-label, .setting-label') : null;
		values.push({
			text: text.slice(0, 90), kind: el.matches('.pm51-kv-row > span') ? 'kv' : row && row.matches('.setting-row') ? 'scoped' : 'row',
			label: label ? label.textContent.replace(/\s+/g, ' ').trim().slice(0, 40) : '',
			w: r.width, widest, word: word.slice(0, 60), room, lines, px: parseFloat(cs.fontSize),
			outside: Math.max(0, rr.left - r.left, r.right - rr.right),
			scrolls: el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0 && cs.overflowX !== 'visible',
			ellipsis: cs.textOverflow === 'ellipsis' && el.scrollWidth > el.clientWidth + 1,
		});
	}
	probe.remove();
	return { values, scope: true };
};

/* the value's verdict: room for its widest word, or all its row has */
const verdict = (v) => {
	const bad = [];
	if (v.px < MIN_PX) bad.push(`${r1(v.px)} px text`);
	if (v.outside > 1) bad.push(`drawn ${r1(v.outside)} px outside its row`);
	if (v.scrolls) bad.push('clipped (scrolls)');
	if (v.ellipsis) bad.push('cut with an ellipsis');
	if (v.w + 0.5 < v.widest && v.w + 1 < v.room) bad.push(`${r1(v.w)} px for its ${r1(v.widest)} px word "${v.word}" (row room ${r1(v.room)} px)`);
	return bad;
};

/* a tab press morphs the old body into the new one: wait for one body and two equal reads */
async function settled(f, ws) {
	await f.waitForFunction((w) => !document.querySelector('.tab-swap-a, .tab-swap-b') && document.querySelectorAll(`[data-continuous-workspace-body="${w}"] .pm51-mgr > .manager-body`).length <= 1, ws, { timeout: 4000 }).catch(() => {});
	await f.waitForFunction((w) => {
		const b = document.querySelector(`[data-continuous-workspace-body="${w}"]`) || document.getElementById('workspace-stage');
		if (!b) return false;
		const sig = `${b.textContent.length}:${b.getBoundingClientRect().height.toFixed(1)}:${b.querySelectorAll('*').length}`;
		const prev = window.__pmDetailSig; window.__pmDetailSig = sig; return prev === sig;
	}, ws, { polling: 'raf', timeout: 4000 }).catch(() => {});
}
async function go(t, f, chapter, ws) {
	await f.evaluate(([c, w]) => window.PM51.go(c, w), [chapter, ws]);
	await f.waitForSelector(`[data-continuous-workspace-body="${ws}"][data-workspace-mounted="true"]`, { timeout: 15000 });
	await settled(f, ws);
}
async function tab(t, f, ws, id) {
	const btn = f.locator(`[data-continuous-workspace-body="${ws}"] .manager-tab[data-tab="${id}"]`).first();
	if (await btn.isVisible().catch(() => false)) await btn.click().catch(() => {});
	else await f.evaluate(([w, i]) => window.PM51.switchTab(w, i), [ws, id]);
	await settled(f, ws);
}
/* the list's items, in order. pick() clicks the item's own row in the DOM (below a 720 px host the list is an off-canvas
   drawer behind its menu button, so a pointer press would not reach it); the subject is the detail's layout, not the list */
const items = (f, ws) => f.evaluate((w) => [...document.querySelectorAll(`[data-continuous-workspace-body="${w}"] .pm51-roster .resource-row[data-id]`)].map((b) => ({ id: b.getAttribute('data-id'), name: (b.querySelector('.resource-row-name') || b).textContent.replace(/\s+/g, ' ').trim().slice(0, 40) })), ws);
/* the row turns active before its detail re-renders, so a read right after the press measured the previous item's
   detail (main 6bd8294726, Windows: Video Generation read Audio Generation's path). Wait for the detail's own title to
   name the item, then for the body to hold still. Returns whether the detail showed it. */
async function pick(t, f, ws, it) {
	let ok = false;
	for (let n = 0; n < 3 && !ok; n++) {
		await f.evaluate(([w, i]) => { const b = document.querySelector(`[data-continuous-workspace-body="${w}"] .resource-row[data-id="${i}"]`); if (b) b.click(); }, [ws, it.id]);
		ok = await f.waitForFunction(([w, i, name]) => {
			const b = document.querySelector(`[data-continuous-workspace-body="${w}"] .resource-row[data-id="${i}"]`);
			const title = document.querySelector(`[data-continuous-workspace-body="${w}"] .pm51-detail .pm51-detail-title`);
			return !!b && b.classList.contains('active') && !!title && title.textContent.replace(/\s+/g, ' ').trim().startsWith(name);
		}, [ws, it.id, it.name], { timeout: 4000 }).then(() => true).catch(() => false);
	}
	await settled(f, ws);
	await f.evaluate((w) => { for (const d of document.querySelectorAll(`[data-continuous-workspace-body="${w}"] .pm51-detail details:not([open])`)) d.open = true; }, ws);
	await t.page.waitForTimeout(150);
	return ok;
}

const CASES = {
	media: { chapter: 'ai', ws: 'media', tabs: ['abilities'], need: [{ item: 'image-generation', label: 'Saves to', text: '.puppet-master/artifacts/images' }], shot: [{ item: 'image-generation', sel: '.setting-row:has(.o55-media-path)' }, { item: 'artifact-output', sel: '.setting-row:has(.o55-media-path)', tag: 'exports' }] },
	toolchain: { chapter: 'code', ws: 'toolchain', tabs: ['formatters', 'servers'], need: [{ item: 'prettier', label: 'Program', text: 'node_modules/.bin/prettier' }, { item: 'prettier', label: 'Runs as', text: 'node_modules/.bin/prettier --stdin-filepath ${file}' }], shot: { item: 'prettier', sel: '.pm51-advanced .pm51-kv' } },
	/* found by --set sweep=1 on the first fix (Windows, 860): one-word values with a soft break inside them (after "…",
	   after "-") stayed beside their key in pieces */
	servers: { chapter: 'system', ws: 'servers', tabs: ['servers'], need: [{ label: 'Identity' }, { label: 'Image' }] },
	source: { chapter: 'source', ws: 'source-manager', tabs: ['services'], need: [{ label: 'Fetch address' }, { label: 'Push address' }] },
	backup: { chapter: 'system', ws: 'backup', tabs: ['destinations'], need: [{ label: 'Location' }] },
};

async function sized(t, f, w, h) {
	await t.viewport(w, h);
	await t.page.waitForTimeout(400);
	const vp = await f.evaluate(() => ({ iw: window.innerWidth, ih: window.innerHeight }));
	return Math.abs(vp.iw - w) <= 2 && Math.abs(vp.ih - h) <= 2 ? null : `inner ${vp.iw}x${vp.ih}`;
}

export const tests = {};
for (const surface of ['normal', 'sandbox']) {
	tests[`FO-173 Settings detail values keep room for their widest word (${surface})`] = async (t) => {
		if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
		const looks = String(t.args.looks || LOOKS.join(',')).split(',').map((s) => s.trim()).filter(Boolean);
		const want = t.args.sizes ? String(t.args.sizes).split(',').map((s) => s.trim()) : null;
		const sizes = want ? SIZES.filter((s) => want.some((x) => s.id.startsWith(x))) : SIZES;
		const cases = String(t.args.cases || Object.keys(CASES).join(',')).split(',').map((s) => s.trim()).filter((c) => CASES[c]);
		const probe = !!t.args.probe;
		const shots = String(t.args.shots || '').split(',').map((s) => s.trim()).filter(Boolean);

		await t.viewport(1390, 900);
		const f = await t.app.open({ sandbox: surface === 'sandbox' });
		await t.app.resetLayout();
		await f.locator('#tab-settings').click();
		await t.settle();

		for (const look of looks) {
			await t.viewport(1390, 900);
			await t.page.waitForTimeout(300);
			await setLookBySetting(t, f, look);
			for (const size of sizes) {
				const cell = `${look} ${size.id}`;
				await t.step(cell, async () => {
					const off = await sized(t, f, size.w, size.h);
					await t.check(`${cell}: the page is laid out at ${size.w}x${size.h}`, !off, off || '');
					const pane = await f.evaluate(() => { const s = document.getElementById('sidePanelSlot'); const v = document.querySelector('#sidePanelSlot > .side-panel-view.active'); return { files: !!s && s.checkVisibility() && (v && v.id) === 'panel-files', settings: Math.round(document.getElementById('panel-settings').getBoundingClientRect().width) }; });
					t.log(`${cell}: Settings ${pane.settings} px, Files ${pane.files ? 'docked' : 'not docked'}`);
					let guarded = false;
					for (const name of cases) {
						const c = CASES[name];
						await go(t, f, c.chapter, c.ws);
						if (!guarded) { await guardPaintedLook(t, f, look, cell); guarded = true; }
						const seen = [], found = new Set(), misses = [];
						let picked = 0;
						for (const tb of c.tabs) {
							await tab(t, f, c.ws, tb);
							for (const it of await items(f, c.ws)) {
								picked++;
								if (!(await pick(t, f, c.ws, it))) { misses.push(`${tb} › ${it.name}`); continue; }
								const { values } = await f.evaluate(VALUES, `[data-continuous-workspace-body="${c.ws}"] .pm51-detail`);
								for (const v of values) {
									seen.push({ ...v, where: `${tb} › ${it.name}` });
									for (const n of c.need) if ((!n.item || n.item === it.id) && v.label === n.label && (!n.text || v.text === n.text)) found.add(`${n.label}: ${n.text || ''}`);
								}
								for (const sh of [].concat(c.shot || [])) {
									/* LOOK crops only: at 860 and 740 (a 500 px window can leave the row outside it), and a crop that cannot
									   be taken is logged, never a failure of the cell */
									if (!(shots.includes(look) && surface === 'normal' && sh.item === it.id && size.h >= 900)) continue;
									const el = f.locator(`[data-continuous-workspace-body="${c.ws}"] .pm51-detail ${sh.sel}`).first();
									if (await el.count()) await el.scrollIntoViewIfNeeded().catch(() => {});
									if (await el.count()) await t.crop(`${t.args.build || 'page'}-${look}-${size.id}-${name}${sh.tag ? '-' + sh.tag : ''}`, el, name === 'media' ? `${it.name} › "Saves to": the whole path on one line, Change beside it or under it` : 'Prettier › Advanced: "Runs as" never breaks inside node_modules/.bin/prettier').catch((e) => t.log(`${cell} crop not taken: ${String(e.message).split('\n')[0]}`));
								}
							}
						}
						if (probe) for (const v of seen) t.log(`${cell} ${name} | ${v.where} | ${v.kind} ${v.label} | "${v.text}" | ${r1(v.w)} px, word ${r1(v.widest)}, room ${r1(v.room)}, ${v.lines} line${v.lines === 1 ? '' : 's'}`);
						const bad = seen.map((v) => ({ v, why: verdict(v) })).filter((x) => x.why.length);
						for (const x of bad) t.log(`${cell} ${name} FAIL | ${x.v.where} | ${x.v.kind} ${x.v.label}: "${x.v.text}" | ${x.why.join('; ')}`);
						await t.check(`${cell} ${name}: every picked item's detail is shown under its own title (${picked - misses.length}/${picked})`, picked > 0 && misses.length === 0, `the detail never named: ${misses.join(', ')}`);
						await t.check(`${cell} ${name}: the named values are drawn (${c.need.map((n) => n.label).join(', ')})`, found.size === c.need.length,
							`missing: ${c.need.filter((n) => !found.has(`${n.label}: ${n.text || ''}`)).map((n) => `${n.item || 'any item'} › ${n.label}`).join(', ')}`);
						await t.check(`${cell} ${name}: every detail value has room for its widest word or its row's whole width, unclipped, ${MIN_PX} px or more (${seen.length} values)`,
							seen.length > 0 && bad.length === 0,
							seen.length ? bad.slice(0, 4).map((x) => `${x.v.where} › ${x.v.label}: ${x.why.join('; ')}`).join(' | ') : 'no values measured');
					}
				});
			}
		}

		if (t.args.sweep) {
			/* every chapter, workspace and manager tab at the first size, in the last look: values as they are found */
			const size = sizes[0];
			await sized(t, f, size.w, size.h);
			const domains = await f.evaluate(() => [...new Set([...document.querySelectorAll('#pm-settings-root .domain-link[data-domain]')].map((el) => el.getAttribute('data-domain')))]);
			let all = 0; const bad = [];
			for (const d of domains) {
				await f.evaluate((x) => window.PM51.go(x, '__domain__'), d);
				await t.page.waitForTimeout(300);
				const wss = await f.evaluate(() => [...document.querySelectorAll('#pm-settings-root .workspace-tab[data-workspace]')].map((el) => el.getAttribute('data-workspace')));
				for (const ws of wss) {
					await go(t, f, d, ws).catch(() => {});
					const tabs = await f.evaluate((w) => [...document.querySelectorAll(`[data-continuous-workspace-body="${w}"] .manager-tab[data-tab]`)].filter((b) => b.getClientRects().length).map((b) => b.getAttribute('data-tab')), ws);
					for (const tb of tabs.length ? tabs : ['']) {
						if (tb) await tab(t, f, ws, tb);
						await f.evaluate((w) => { for (const x of document.querySelectorAll(`[data-continuous-workspace-body="${w}"] details:not([open])`)) x.open = true; }, ws);
						await t.page.waitForTimeout(120);
						const { values } = await f.evaluate(VALUES, `[data-continuous-workspace-body="${ws}"]`);
						all += values.length;
						for (const v of values) { const why = verdict(v); if (why.length) bad.push(`${d} › ${ws}${tb ? ' › ' + tb : ''} › ${v.label}: "${v.text}" ${why.join('; ')}`); }
					}
				}
			}
			for (const b of bad) t.log(`sweep FAIL | ${b}`);
			await t.check(`sweep ${size.id}: every detail value in every chapter, workspace and tab keeps room for its widest word (${all} values)`, bad.length === 0, bad.slice(0, 4).join(' | '));
		}
	};
}
