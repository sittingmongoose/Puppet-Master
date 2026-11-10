// FO-124 / FO-129. Settings row paint must reach its clipping list, and one column of controls must share an edge.
// Each look is chosen through the Theme and Light or dark rows. A theme painted without saving is reset to the saved
// pair on the next Settings render (applyPaint; ASTRA-B10-K1). Every measurement reads html[data-theme] and a wrong
// look fails the cell. NieR is NieR on over a matching-mode base.
// --set probe=1 logs geometry and still fails a wrong look. --set looks= --set size=1920x1080 limit the matrix.
import fs from 'node:fs';
import { LOOKS } from '../browser-check.config.mjs';

const SIZES = [[1920, 1080], [1390, 900], [1024, 768]];

const MEASURE = (look) => {
	const vis = (el) => {
		if (!el || !el.getClientRects().length) return false;
		const cs = getComputedStyle(el);
		if (cs.display === 'none' || cs.visibility === 'hidden') return false;
		const b = el.getBoundingClientRect();
		return b.width > 2 && b.height > 2;
	};
	const paintOf = (row) => {
		const st = getComputedStyle(row, '::after');
		const box = row.getBoundingClientRect();
		const on = !!(st.content && st.content !== 'none' && st.content !== 'normal');
		if (!on) return { on: false, box: { left: box.left, right: box.right, top: box.top, bottom: box.bottom } };
		let left = box.left, right = box.right;
		if (st.position === 'absolute') {
			const bl = parseFloat(st.left), br = parseFloat(st.right);
			if (Number.isFinite(bl)) left = box.left + bl;
			if (Number.isFinite(br)) right = box.right - br;
		}
		return { on: true, box: { left, right, top: box.top, bottom: box.bottom } };
	};
	const widget = (row) => {
		const ctrl = row.querySelector(':scope > .setting-control, :scope > .pm51-row-control');
		if (!ctrl || !vis(ctrl)) return null;
		const kids = [...ctrl.children].filter((k) => vis(k) && getComputedStyle(k).position !== 'absolute');
		const boxes = (kids.length ? kids : [ctrl]).map((k) => k.getBoundingClientRect());
		return {
			right: Math.round(Math.max(...boxes.map((b) => b.right)) * 10) / 10,
			left: Math.round(Math.min(...boxes.map((b) => b.left)) * 10) / 10,
			wide: row.classList.contains('is-wide') || row.classList.contains('is-wrap'),
		};
	};
	const spread = (xs) => xs.length ? Math.round((Math.max(...xs) - Math.min(...xs)) * 10) / 10 : 0;
	const lists = [...document.querySelectorAll('#panel-settings .setting-list')].filter(vis);
	const glow = [];
	for (const list of lists) {
		const cs = getComputedStyle(list);
		if (!['hidden', 'clip', 'scroll', 'auto'].includes(cs.overflowX)) continue;
		const row = [...list.children].find((r) => r.classList.contains('setting-row') && vis(r));
		if (!row) continue;
		const paint = paintOf(row);
		const r = list.getBoundingClientRect();
		const padL = r.left + (parseFloat(cs.borderLeftWidth) || 0);
		const padR = r.right - (parseFloat(cs.borderRightWidth) || 0);
		const shortL = Math.round((paint.box.left - padL) * 10) / 10;
		const shortR = Math.round((padR - paint.box.right) * 10) / 10;
		if (shortL > 1 || shortR > 1 || shortL < -1 || shortR < -1) {
			glow.push({ shortL, shortR, glowOn: paint.on, ox: cs.overflowX });
		}
	}
	const sectionOf = (el) => el.closest('#panel-settings .settings-section, #panel-settings .pm51-section, #panel-settings .panel-card');
	const columns = [];
	const seenLists = new Set();
	for (const section of document.querySelectorAll('#panel-settings .settings-section, #panel-settings .pm51-section, #panel-settings .panel-card')) {
		if (!vis(section)) continue;
		const own = [...section.querySelectorAll(':scope .setting-list, :scope .pm51-rows')].filter((list) => {
			if (!vis(list) || seenLists.has(list) || sectionOf(list) !== section) return false;
			return [...list.children].some((r) => (r.classList.contains('setting-row') || r.classList.contains('pm51-row')) && vis(r));
		});
		const buckets = new Map();
		for (const list of own) {
			const key = (list.closest('.pm51-acc-item') || section).id || 'root';
			if (!buckets.has(key)) buckets.set(key, []);
			buckets.get(key).push(list);
			seenLists.add(list);
		}
		for (const group of buckets.values()) {
			group.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
			const chains = [];
			for (const list of group) {
				const lb = list.getBoundingClientRect();
				const chain = chains.find((c) => {
					const prev = c[c.length - 1].getBoundingClientRect();
					const overlapX = Math.min(lb.right, prev.right) - Math.max(lb.left, prev.left);
					return lb.top >= prev.bottom - 4 && overlapX > Math.min(lb.width, prev.width) * 0.6;
				});
				if (chain) chain.push(list); else chains.push([list]);
			}
			for (const chain of chains) {
			const rows = chain.flatMap((list) => [...list.children].filter((r) => (r.classList.contains('setting-row') || r.classList.contains('pm51-row')) && vis(r)));
			rows.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
			const stack = [];
			for (const row of rows) {
				const b = row.getBoundingClientRect();
				if (!stack.length) { stack.push(row); continue; }
				const prev = stack[stack.length - 1].getBoundingClientRect();
				const overlapX = Math.min(b.right, prev.right) - Math.max(b.left, prev.left);
				if (b.top >= prev.bottom - 2 && overlapX > Math.min(b.width, prev.width) * 0.6) stack.push(row);
			}
			if (stack.length < 2) continue;
			const edges = stack.map(widget).filter(Boolean);
			const narrow = edges.filter((e) => !e.wide);
			const blockOf = (row) => {
				const list = row.parentElement;
				const parent = list && list.parentElement;
				return parent && parent.classList.contains('o55-home') ? parent : list;
			};
			const rowish = (r) => vis(r) && (r.classList.contains('setting-row') || r.classList.contains('pm51-row'));
			const adjacentRows = (a, b) => {
				const ba = blockOf(a), bb = blockOf(b);
				if (!ba || !bb) return false;
				if (ba === bb) {
					let n = a.nextElementSibling;
					while (n && !vis(n)) n = n.nextElementSibling;
					return n === b;
				}
				if (ba.parentElement !== bb.parentElement || ba.nextElementSibling !== bb) return false;
				const last = [...a.parentElement.children].filter(rowish).pop();
				const first = [...b.parentElement.children].find(rowish);
				return a === last && b === first;
			};
			const gaps = [];
			for (let i = 1; i < stack.length; i++) {
				const a = stack[i - 1], b = stack[i];
				if (!adjacentRows(a, b)) continue;
				const ar = a.getBoundingClientRect(), br = b.getBoundingClientRect();
				const gap = Math.round((br.top - ar.bottom) * 10) / 10;
				if (gap < -1) continue;
				gaps.push(gap);
			}
			const title = (section.querySelector(':scope > .o55-group-head .o55-group-title, :scope > .pm51-section-head .pm51-section-title, :scope .section-title, :scope h3') || { textContent: '' }).textContent.trim().slice(0, 32);
			columns.push({
				title, n: stack.length,
				rightSpread: spread(narrow.map((e) => e.right)),
				leftSpread: spread(narrow.map((e) => e.left)),
				gapSpread: spread(gaps),
				gapMin: gaps.length ? Math.min(...gaps) : null,
				gapMax: gaps.length ? Math.max(...gaps) : null,
				sample: stack.slice(0, 4).map((row) => {
					const e = widget(row);
					return { label: (row.querySelector('.setting-label, .pm51-row-label') || { textContent: '' }).textContent.trim().slice(0, 28), left: e && e.left, right: e && e.right };
				}),
			});
			}
		}
	}
	const scrollers = [...document.querySelectorAll('#panel-settings .document-scroll, #panel-settings .settings-document, #panel-settings .pm51-scroll')]
		.filter(vis).map((e) => ({ name: String(e.className).split(/\s+/).slice(0, 2).join('.'), hScroll: e.scrollWidth - e.clientWidth }));
	const theme = document.documentElement.getAttribute('data-theme') || '';
	const nier = !!(window.PM_NIER && window.PM_NIER.on()) || theme.startsWith('nier');
	const [family, mode] = String(look || '').split('-');
	const lookOk = family === 'nier' ? nier && theme.endsWith('-' + mode) : !nier && theme === look;
	return { glow, columns, scrollers, lists: lists.length, theme, nier, lookOk };
};

/* The look is set the way a person sets it, through the Theme and Light or dark rows, so the saved pair survives
   the next Settings render. Same path as settings-inspector-fit (1d86abca96). */
async function setLookBySetting(t, f, look) {
	const [family, mode] = look.split('-');
	const general = f.locator('#pm-settings-root [data-action="navigate-domain"][data-domain="general"]').first();
	if (await general.count()) {
		await general.click();
		await f.waitForTimeout(700);
	}
	for (const [setting, value] of [
		['general.visual.theme', family === 'nier' ? 'NieR' : family[0].toUpperCase() + family.slice(1)],
		['general.visual.theme-mode', mode === 'light' ? 'Light' : 'Dark'],
	]) {
		const trigger = f.locator(`select[data-setting="${setting}"]`).locator('..').locator('.pm51-dd-trigger');
		const labels = await f.locator(`select[data-setting="${setting}"] option`).allTextContents();
		const name = labels.includes(value) ? value : `${value} ${mode === 'light' ? 'Light' : 'Dark'}`;
		await trigger.first().scrollIntoViewIfNeeded();
		await trigger.first().click();
		await f.getByRole('option', { name, exact: true }).click({ timeout: 8000 });
		await f.locator('.pm51-dd-list').waitFor({ state: 'hidden', timeout: 8000 }).catch(() => {});
		await f.waitForFunction(() => !(window.PM_LOOK_COVERED && PM_LOOK_COVERED()) && !(window.PM_THEME_TRANSITION && PM_THEME_TRANSITION.busy && PM_THEME_TRANSITION.busy()), null, { timeout: 15000 }).catch(() => {});
		await t.page.waitForTimeout(400);
	}
	await f.waitForFunction(([fam, m]) => {
		const theme = document.documentElement.getAttribute('data-theme') || '';
		const nier = !!(window.PM_NIER && PM_NIER.on()) || theme.startsWith('nier');
		return fam === 'nier' ? nier && theme.endsWith('-' + m) : !nier && theme === fam + '-' + m;
	}, [family, mode], { timeout: 20000 }).catch(() => {});
	await t.page.waitForTimeout(500);
}

export default async function (t) {
	const looks = String(t.args.looks || LOOKS.join(',')).split(',').map((s) => s.trim()).filter(Boolean);
	const sizes = String(t.args.size || '').split(',').filter(Boolean);
	const want = sizes.length ? SIZES.filter(([w, h]) => sizes.includes(`${w}x${h}`)) : SIZES;
	const probe = t.args.probe === '1';
	const wantName = String(t.args.domains || '');
	for (const look of looks) {
		for (const [w, h] of want) {
			await t.step(`${look} ${w}x${h}`, async () => {
				await t.viewport(w, h);
				const f = await t.app.open({ settleMs: 400 });
				await f.locator('#tab-settings').click();
				await f.waitForTimeout(900);
				await setLookBySetting(t, f, look);
				const links = f.locator('#pm-settings-root .domain-link');
				const n = Math.min(await links.count(), 16);
				const pages = [];
				const visit = async (name) => {
					const row = f.locator('#panel-settings .setting-row.o55-row').first();
					if (await row.count()) await row.hover().catch(() => {});
					await f.waitForTimeout(160);
					pages.push({ name, data: await f.evaluate(MEASURE, look) });
				};
				await visit('open');
				for (let i = 0; i < n; i++) {
					const link = links.nth(i);
					const name = ((await link.innerText().catch(() => '')) || '').replace(/\s+/g, ' ').trim().slice(0, 36);
					if (!name || (wantName && !wantName.split(',').some((part) => name.includes(part.trim())))) continue;
					if (!await link.isVisible().catch(() => false)) continue;
					await link.click();
					await f.waitForTimeout(450);
					await visit(name);
				}
				const badGlow = [];
				const badAlign = [];
				const badGap = [];
				const hScroll = [];
				let glowN = 0;
				let colN = 0;
				for (const p of pages) {
					glowN += p.data.glow.length;
					for (const g of p.data.glow) badGlow.push(`${p.name} shortL ${g.shortL} shortR ${g.shortR} pseudo ${g.glowOn}`);
					for (const sc of p.data.scrollers) if (sc.hScroll > 1) hScroll.push(`${p.name}:${sc.name}:${sc.hScroll}`);
					for (const c of p.data.columns) {
						colN += 1;
						if (c.rightSpread > 1 && c.leftSpread > 1) badAlign.push(`${p.name}/${c.title} right ${c.rightSpread} left ${c.leftSpread}`);
						if (c.gapSpread > 1) badGap.push(`${p.name}/${c.title} gap ${c.gapMin}..${c.gapMax}`);
					}
				}
				const wrongLook = pages.filter((p) => !p.data.lookOk).map((p) => `${p.name} wanted ${look} painted ${p.data.theme}${p.data.nier ? ' NieR on' : ''}`);
				t.log(`${look} ${w}x${h} pages ${pages.length} lists-short ${glowN} columns ${colN} theme ${pages.map((p) => `${p.data.theme}${p.data.nier ? ' NieR on' : ''}`).filter((v, i, a) => a.indexOf(v) === i).join(',') || 'none'}`);
				t.log('glow ' + (badGlow.slice(0, 6).join(' | ') || 'none'));
				t.log('align ' + (badAlign.slice(0, 6).join(' | ') || 'none'));
				t.log('gaps ' + (badGap.slice(0, 6).join(' | ') || 'none'));
				t.log('hScroll ' + (hScroll.join(' | ') || 'none'));
				if (t.args.dump) fs.writeFileSync(t.args.dump, JSON.stringify(pages.map((p) => ({ name: p.name, glow: p.data.glow.slice(0, 4), columns: p.data.columns.filter((c) => c.rightSpread > 1 || c.leftSpread > 1 || c.gapSpread > 1) })), null, 1));
				await t.check(`${look} ${w}x${h}: measured under ${look}`, pages.length > 0 && wrongLook.length === 0, wrongLook.slice(0, 3).join(' | ') || 'no page measured');
				if (probe) {
					await t.check(`${look} ${w}x${h}: probe`, true);
					return;
				}
				await t.check(`${look} ${w}x${h}: a settings list was measured`, pages.some((p) => p.data.lists > 0), 'no setting-list');
				await t.check(`${look} ${w}x${h}: glow reaches the clipping list`, badGlow.length === 0, badGlow.slice(0, 3).join(' | '));
				await t.check(`${look} ${w}x${h}: controls share an edge`, badAlign.length === 0, badAlign.slice(0, 3).join(' | '));
				await t.check(`${look} ${w}x${h}: row gaps`, badGap.length === 0, badGap.slice(0, 3).join(' | '));
				await t.check(`${look} ${w}x${h}: no horizontal scroll`, hScroll.length === 0, hScroll.join(' | '));
			});
		}
	}
}
