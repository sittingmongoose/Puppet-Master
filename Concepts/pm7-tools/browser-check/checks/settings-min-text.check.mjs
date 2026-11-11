// FO-159 (Jared, 2026-11-11: "B, use 11 px like Usage"): Settings' 10.5 px small text — choice labels, small
// buttons, segmented options, chips, key caps, row and roster meta, the manager tabs, the inspector's small
// lines — is 11 px, the size Usage's quiet text uses. Those declarations live in
// base/style/pm4-settings-css.css, base/style/pm51-settings-refresh.css, base/script/pm4-settings-js.js,
// src/settings/** and the managers' own <style> blocks; every one now reads 11 px and nothing else about them
// changed.
//
// Two parts, both on the surfaces asked for (normal and T3's sandbox unless --set sandbox= picks one):
//   size — every control this item resized, on each chapter and each manager tab, in all ten looks, reads 11 px
//          or more. Settings also paints older 9–10.3 px micro-labels the item does not name (the page index's
//          links, the rail's chapter headings and descriptions, key caps, side-card notes and health, table
//          heads, tooltips, form help): they are counted and logged under NOTE, never silently dropped, so the
//          residue is on the record. --set strict=1 asserts them too (the item's own sentence, "no visible
//          Settings text below 11 px", lands there until someone owns that call).
//   fit  — the controls whose text this item grew still hold it at 740x900, 860x900 and 1280x500: no word is
//          cut by a box that clips its own overflow (hidden, clip, scroll: its scroll area against its client box,
//          and the text's painted end past that box), and every control whose own CSS draws its label on one line
//          (white-space: nowrap, or the fixed one-line shape of a badge, tab, chip, key cap, definition term or
//          stepper value) still draws one line box (Range rects: exactly one). A plain button may wrap by design
//          and is judged by the cut rule alone.
// A control that is built to ellipsize its own text (text-overflow: ellipsis: resource names and meta) is
// exempt from the cut rule and still held to one line.
//   browser-check run Concepts/pm7-tools/browser-check/checks/settings-min-text.check.mjs --set page=<build>
// --set only=size|fit, --set looks=a,b,c, --set fitLooks=a,b,c, --set widths=740x900,860x900,1280x500,
// --set strict=1, --set list=1 (logs every sub-11 px element and asserts no size).
import { LOOKS } from '../browser-check.config.mjs';

const SIZES = [[740, 900], [860, 900], [1280, 500]];
const FIT_LOOKS = ['basic-dark', 'retro-light', 'nier-dark'];

/* A hook for pinning an individual pre-existing micro-label rule by selector; empty today, because the residue
   is reported as a whole under NOTE rather than excused rule by rule. Matched with Element.matches. */
const LEGACY = [];

/* Every selector whose declared size went 10.5 px -> 11 px in this item: the controls part fit measures. */
const AFFECTED = [
	'#panel-settings .search-result-meta',
	'#panel-settings .workspace-block .manager-page > .embedded-page-actions .btn',
	'#panel-settings .workspace-block .manager-page > .embedded-page-actions .icon-btn',
	'#panel-settings .btn',
	'#panel-settings .btn.small',
	'#panel-settings .badge',
	'#panel-settings .home-panel-meta',
	'#panel-settings .setup-meta',
	'#panel-settings .domain-card-desc',
	'#panel-settings .setting-description',
	'#panel-settings .segmented button',
	'#panel-settings .stepper-value',
	'#panel-settings .chip-select button',
	'#panel-settings .reorder-item',
	'#panel-settings .detail-status',
	'#panel-settings .related-links button',
	'#panel-settings .manager-tab',
	'#panel-settings .resource-row-name',
	'#panel-settings .resource-row-meta',
	'#panel-settings .resource-sub',
	'#panel-settings .stat-label',
	'#panel-settings .stat-note',
	'#panel-settings .route-card-copy span',
	'#panel-settings .sound-copy strong',
	'#panel-settings .sound-copy span',
	'#panel-settings .event-cell',
	'#panel-settings .panel-subtitle',
	'#panel-settings .panel-head-kicker',
	'#panel-settings .info-key',
	'#panel-settings .info-value',
	'#panel-settings .alert-strip',
	'#panel-settings .data-table td',
	'#panel-settings .route-desc',
	'#panel-settings .route-primary-value',
	'#panel-settings .workflow-number',
	'#panel-settings .workflow-title',
	'#panel-settings .filter-chip',
	'#panel-settings .prompt-box',
	'#panel-settings .dialog-sub',
	'#panel-settings .form-label',
	'#panel-settings .check-row',
	'#panel-settings .menu-item',
	'#panel-settings .toast-title',
	'#panel-settings .toast-message',
	'#panel-settings .details-btn',
	'#panel-settings .pm51-kbd',
	'#panel-settings .pm51-tech-inline',
	'#panel-settings .pm51-roster .roster-title',
	'#panel-settings .pm51-roster .resource-row-meta .pm51-status',
	'#panel-settings .pm51-hero-eyebrow',
	'#panel-settings .pm51-hero-facts dt',
	'#panel-settings .pm51-meter-note',
	'#panel-settings .pm51-commands-ph code',
	'#panel-settings .o55-changed',
	'#panel-settings .o55-risk',
	':is(#panel-settings, .o55nc-host) .o55nc-preset small',
	':is(#panel-settings, .o55nc-host) .o55nc-pv-dialog p',
	':is(#panel-settings, .o55nc-host) .o55nc-ghead > span',
	'.o55nc-host .o55nc .btn',
	'html[data-o55-nier] .o55nc-pop-eye',
	'html[data-o55-nier-parts~="headers"] .o55nc-pop-foot .o55nc-pop-done',
	'#panel-settings .o55-roster-group > span',
	'.o55-pick-item .o55-pick-copy small',
	'#panel-settings .o55g-recap-title',
];

/* Every visible word under Settings: its own text nodes (or a field's value/placeholder), the size it is painted
   at, and which element it belongs to. `small` is every word under 11 px that is not a documented legacy
   micro-label; `rescoped` is the part of it that this item resized (a control matching AFFECTED). Self-contained:
   serialized into the page alone. */
const SCAN = ([legacy, affected]) => {
	const roots = ['#pm-settings-root', '#pm-settings-portals', '#panel-settings']
		.flatMap((sel) => [...document.querySelectorAll(sel)]);
	const seen = new Set();
	const vis = (el) => {
		// a display:none ancestor has no client rects either, so the rect test already covers it
		if (!el.getClientRects().length) return false;
		if (el.closest('[inert], [aria-hidden="true"]')) return false;
		return getComputedStyle(el).visibility !== 'hidden';
	};
	const desc = (el) => {
		const cls = typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.') : '';
		const text = (el.matches('input, textarea, select') ? `${el.value || ''} ${el.getAttribute('placeholder') || ''}` : el.textContent).replace(/\s+/g, ' ').trim().slice(0, 40);
		return `${el.tagName.toLowerCase()}${cls} "${text}"`;
	};
	const match = (el, sels) => sels.some((sel) => { try { return el.matches(sel); } catch (e) { return false; } });
	const out = { small: [], legacy: [], rescoped: [], seen: 0 };
	for (const root of roots) {
		for (const el of root.querySelectorAll('*')) {
			if (seen.has(el) || el.closest('[inert], [aria-hidden="true"]')) continue;
			seen.add(el);
			const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
			const field = el.matches('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]), textarea, select');
			if (!own && !field) continue;
			if (!vis(el)) continue;
			const fs = parseFloat(getComputedStyle(el).fontSize);
			out.seen++;
			if (fs >= 11) continue;
			const row = `${desc(el)} ${fs}px`;
			if (match(el, legacy)) out.legacy.push(row);
			else {
				out.small.push(row);
				if (match(el, affected)) out.rescoped.push(row);
			}
		}
	}
	return out;
};

/* The controls whose text this item grew: does each still hold its words inside its own box, on the lines it
   drew before. Self-contained: serialized into the page alone. */
const FIT = ([affected]) => {
	const vis = (el) => {
		if (!el.getClientRects().length) return false;
		if (el.closest('[inert], [aria-hidden="true"]')) return false;
		return getComputedStyle(el).visibility !== 'hidden';
	};
	/* A control is held to one line only where its own CSS draws one (nowrap, an ellipsis row) or where its shape is
	   fixed to a single line (a badge, a tab, a chip, a key cap, a definition term). A plain button may wrap by
	   design and is judged by the cut rule instead. */
	const oneLine = (el, cs) => cs.whiteSpace === 'nowrap' || el.matches('.badge, .manager-tab, .filter-chip, .pm51-kbd, dt, .segmented button, .chip-select button, .stepper-value');
	const textRects = (el) => {
		const r = document.createRange();
		r.selectNodeContents(el);
		return [...r.getClientRects()].filter((b) => b.width > 0.5 && b.height > 0.5);
	};
	const out = { cut: [], wrapped: [], sampled: 0, ellipsis: 0 };
	const seen = new Set();
	for (const sel of affected) {
		for (const el of document.querySelectorAll(sel)) {
			if (seen.has(el) || !el.getClientRects().length) continue;
			seen.add(el);
			if (!vis(el)) continue;
			const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
			if (!text) continue;
			out.sampled++;
			const cs = getComputedStyle(el);
			const b = el.getBoundingClientRect();
			const padL = b.left + (parseFloat(cs.borderLeftWidth) || 0), padR = b.right - (parseFloat(cs.borderRightWidth) || 0);
			const padB = b.bottom - (parseFloat(cs.borderBottomWidth) || 0);
			const label = `${el.tagName.toLowerCase()}${typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/)[0] : ''} "${text.slice(0, 32)}"`;
			const rects = textRects(el);
			if (!rects.length) continue;
			const left = Math.min(...rects.map((r) => r.left)), right = Math.max(...rects.map((r) => r.right));
			const bottom = Math.max(...rects.map((r) => r.bottom));
			const ellipsis = cs.textOverflow === 'ellipsis';
			if (ellipsis) out.ellipsis++;
			/* A word is cut when a box that clips its own overflow (hidden, clip, scroll) paints it past that box's
			   content edge: the width/height its scroll area reports against the client box, and the text's own
			   painted end past the padding box. A control that lets its text show (overflow visible) is not cutting
			   it, whatever the text's start sits on. Built-in ellipsis is the design's own choice and exempt. */
			const clipsX = cs.overflowX !== 'visible', clipsY = cs.overflowY !== 'visible';
			const scrolls = clipsX && el.scrollWidth > el.clientWidth + 1;
			const tall = clipsY && el.scrollHeight > el.clientHeight + 1;
			const past = (clipsX && right > padR + 1) || (clipsY && bottom > padB + 1);
			if (!ellipsis && (past || scrolls || tall)) out.cut.push(`${label} text ${Math.round(left)}..${Math.round(right)} in ${Math.round(padL)}..${Math.round(padR)}${scrolls ? ` scrollX ${el.scrollWidth}>${el.clientWidth}` : ''}${tall ? ` scrollY ${el.scrollHeight}>${el.clientHeight}` : ''}`);
			// wrapped: a control that draws its label on one line must still draw one line box
			if (oneLine(el, cs) && rects.length > 1 && !ellipsis) out.wrapped.push(`${label} ${rects.length} line boxes`);
		}
	}
	return out;
};

const settle = (t, ms = 350) => t.page.waitForTimeout(ms);

/* The look is set the way a person sets it — the Theme and Light or dark rows' own dropdowns — because the
   Settings engine re-applies the saved pair on every render, so a look painted without saving is reset. The rows
   live on General, and the walk above ends on whichever chapter it visited last. */
async function setLookBySetting(t, f, look) {
	const [family, mode] = look.split('-');
	const general = f.locator('#pm-settings-root [data-action="navigate-domain"][data-domain="general"]').first();
	if (await general.count()) {
		await general.click().catch(() => {});
		await f.waitForFunction(() => !!document.querySelector('select[data-setting="general.visual.theme"]'), null, { timeout: 15000 }).catch(() => {});
		await t.page.waitForTimeout(600);
	}
	for (const [setting, value] of [
		['general.visual.theme', family === 'nier' ? 'NieR' : family[0].toUpperCase() + family.slice(1)],
		['general.visual.theme-mode', mode === 'light' ? 'Light' : 'Dark'],
	]) {
		const trigger = f.locator(`select[data-setting="${setting}"]`).locator('..').locator('.pm51-dd-trigger');
		if (!(await trigger.count())) return false;
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
async function guardLook(t, f, look, where) {
	const [family, mode] = look.split('-');
	const got = await f.evaluate(() => ({ theme: document.documentElement.getAttribute('data-theme') || '', nier: !!(window.PM_NIER && PM_NIER.on()) || (document.documentElement.getAttribute('data-theme') || '').startsWith('nier') }));
	const ok = family === 'nier' ? got.nier && got.theme.endsWith('-' + mode) : !got.nier && got.theme === look;
	await t.check(`${where}: measured under ${look} (painted ${got.theme}${got.nier ? ', NieR on' : ''})`, ok, 'Settings rendered a different look than the cell names');
	return ok;
}

/* Every chapter on the rail, and every manager tab inside one: Settings mounts a chapter's page lazily, so the
   text only exists once it is opened. Returns the pages visited and measures each after visit(). */
async function walkSettings(t, f, visit) {
	// the rail re-renders on every chapter click, so chapters are addressed by their own data-domain, never by index
	const domains = await f.evaluate(() => [...document.querySelectorAll('#pm-settings-root .domain-link')].filter((el) => el.getClientRects().length).map((el) => el.getAttribute('data-domain')).filter(Boolean));
	const pages = [];
	const home = f.locator('#pm-settings-root [data-action="home"]').first();
	if (await home.count()) { await home.click().catch(() => {}); await settle(t, 300); pages.push(await visit('home')); }
	for (const domain of [...new Set(domains)]) {
		const link = f.locator(`#pm-settings-root .domain-link[data-domain="${domain}"]`).first();
		if (!(await link.count())) continue;
		const name = ((await link.innerText().catch(() => '')) || '').replace(/\s+/g, ' ').trim().slice(0, 36) || domain;
		await link.click().catch(() => {});
		await settle(t, 380);
		pages.push(await visit(name));
		const tabs = f.locator('#pm-settings-root .manager-tab');
		const m = await tabs.count();
		for (let j = 0; j < m; j++) {
			const tab = tabs.nth(j);
			if (!(await tab.isVisible().catch(() => false))) continue;
			const tname = ((await tab.innerText().catch(() => '')) || '').replace(/\s+/g, ' ').trim();
			await tab.click().catch(() => {});
			await settle(t, 320);
			pages.push(await visit(`${name} › ${tname}`));
		}
	}
	return pages;
}

async function openSettings(t, surface, [w, h] = [1920, 1080]) {
	await t.viewport(w, h);
	const f = await t.app.open({ sandbox: surface === 'sandbox' });
	await t.app.resetLayout();
	await f.locator('#tab-settings').click();
	await t.settle();
	return f;
}

export const tests = {};
for (const surface of ['normal', 'sandbox']) {
	tests[`FO-159 Settings text is 11 px or more (${surface})`] = async (t) => {
		if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
		const looks = String(t.args.looks || LOOKS.join(',')).split(',').map((s) => s.trim()).filter(Boolean);
		const want = (part) => !t.args.only || String(t.args.only).split(',').map((s) => s.trim()).includes(part);
		const list = !!t.args.list;
		const f = await openSettings(t, surface);
		await f.locator('#pm-settings-root [data-action="navigate-domain"][data-domain="general"]').first().click();
		await t.settle();
		const residue = new Map();
		const scan = async (where) => {
			const r = await f.evaluate(SCAN, [LEGACY, AFFECTED]);
			if (r.seen === 0) return { where, seen: 0 };
			for (const x of r.small) {
				const key = x.replace(/"[^"]*"/, '').replace(/\s+/g, ' ').trim();
				residue.set(key, (residue.get(key) || 0) + 1);
			}
			if (list) { t.log(`${where}: ${r.seen} words, ${r.small.length} under 11 px (${r.rescoped.length} of them FO-159's)`); r.small.forEach((x) => t.log(`  under 11: ${x}`)); }
			return { where, seen: r.seen, small: r.small, rescoped: r.rescoped };
		};
		if (want('size')) {
			let smallAll = 0;
			for (const look of looks) {
				await t.step(look, async () => {
					await setLookBySetting(t, f, look);
					const ok = await guardLook(t, f, look, `${look}`);
					const pages = await walkSettings(t, f, (where) => scan(`${look} · ${where}`));
					const bad = [];
					let words = 0;
					for (const p of pages) {
						if (!p || !p.seen) continue;
						words += p.seen;
						smallAll += (p.small || []).length;
						bad.push(...(p.rescoped || []).map((x) => `${p.where}: ${x}`));
					}
					await t.check(`${look}: the ${words > 0 ? 'controls FO-159 resized' : 'text'} are 11 px or more (${words} words on ${pages.length} pages)`, words > 0 && (list || bad.length === 0), bad.slice(0, 5).join(' | ') || 'nothing measured');
					if (!ok) return;
					t.log(`${look}: ${bad.length} of the item's controls under 11 px`);
				});
			}
			await t.check(`the ${looks.length} looks were measured`, looks.length === 10 || !!t.args.looks, `${looks.length}`);
			/* The rendered walk sees the pages a person can open. This reads the built page's own rules instead, so a
			   10.5 px declaration is caught even in a panel, picker or look the walk never opened: Settings is every
			   rule whose selector names it (or a settings-only piece: the NieR chips, the picker, the inspector, the
			   setup recap, the row badges). */
			const tenHalf = await f.evaluate(() => {
				const near = (sel) => /panel-settings|pm-settings-root|pm51-|o55-pick-|o55-insp-|o55g-|\.o55-changed|\.o55-risk/.test(sel || '');
				const bad = [];
				const walk = (list) => {
					for (const r of list) {
						if (r.cssRules) walk(r.cssRules);
						const sel = r.selectorText;
						if (!sel || !r.style) continue;
						const fs = r.style.fontSize || '', f = r.style.font || '';
						if (/^10\.5px$/.test(fs) || /(^|[\s/])10\.5px([\s/]|$)/.test(f)) if (near(sel)) bad.push(`${sel.slice(0, 70)} { ${fs || f} }`);
					}
				};
				for (const sheet of document.styleSheets) { let rules; try { rules = sheet.cssRules; } catch (e) { continue; } walk(rules); }
				return bad;
			});
			await t.check(`no Settings rule in the built page declares 10.5 px (${tenHalf.length} found)`, tenHalf.length === 0, tenHalf.slice(0, 6).join(' | '));
			/* FO-159 names the 10.5 px set. Settings also paints older 9–10.3 px micro-labels (the page index's
			   links, the rail's chapter headings and descriptions, key caps, side-card notes and health): they are
			   not 10.5 px text and the item changes nothing else, so the check records them here instead of
			   silently dropping them. `--set strict=1` asserts them too, which is where the item's own sentence
			   ("no visible Settings text below 11 px") lands until someone owns that call. */
			if (residue.size) {
				const top = [...residue.entries()].sort((a, b) => b[1] - a[1]);
				t.log(`NOTE: ${smallAll} Settings words across ${looks.length} look(s) still read under 11 px, in ${residue.size} kinds (not 10.5 px text; not in this item): ${top.slice(0, 8).map(([k, n]) => `${k} ×${n}`).join(' | ')}`);
				if (t.args.strict) await t.check(`strict: no visible Settings text is under 11 px (${smallAll} words, ${residue.size} kinds)`, smallAll === 0, top.slice(0, 6).map(([k, n]) => `${k} ×${n}`).join(' | '));
			}
		}
		await f.locator('#pm-settings-root [data-action="navigate-domain"][data-domain="general"]').first().click();
		await settle(t, 400);
		if (!list) await t.noConsoleErrors('no console errors');
	};

	tests[`FO-159 the grown controls still hold their words (${surface})`] = async (t) => {
		if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
		if (t.args.only && !String(t.args.only).split(',').map((s) => s.trim()).includes('fit')) { await t.check(`${surface} fit not asked for`, true); return; }
		const looks = String(t.args.fitLooks || FIT_LOOKS.join(',')).split(',');
		const sizes = String(t.args.widths || '').split(',').filter(Boolean).length
			? String(t.args.widths).split(',').map((s) => s.split('x').map(Number)).filter(([w, h]) => w && h)
			: SIZES;
		const f = await openSettings(t, surface);
		await f.locator('#pm-settings-root [data-action="navigate-domain"][data-domain="general"]').first().click();
		await t.settle();
		let cell = 0;
		for (const look of looks) {
			await setLookBySetting(t, f, look);
			for (const [w, h] of sizes) {
				cell++;
				await t.step(`${look} ${w}x${h}`, async () => {
					await t.viewport(w, h);
					await settle(t, 400);
					const ok = await guardLook(t, f, look, `${look} ${w}x${h}`);
					const cut = [], wrapped = [];
					let sampled = 0, ellipsis = 0;
					const pages = await walkSettings(t, f, async (where) => {
						const r = await f.evaluate(FIT, [AFFECTED]);
						sampled += r.sampled; ellipsis += r.ellipsis;
						cut.push(...r.cut.map((x) => `${where}: ${x}`));
						wrapped.push(...r.wrapped.map((x) => `${where}: ${x}`));
						return where;
					});
					t.log(`${look} ${w}x${h}: ${sampled} controls (${ellipsis} ellipsize by design) on ${pages.length} pages`);
					await t.check(`${look} ${w}x${h}: the grown controls hold their words (${sampled} measured)`, ok && sampled > 0 && cut.length === 0, cut.slice(0, 5).join(' | ') || 'nothing measured');
					await t.check(`${look} ${w}x${h}: no label grew a second line`, ok && wrapped.length === 0, wrapped.slice(0, 5).join(' | '));
				});
			}
		}
		await t.check(`the fit matrix ran ${cell} cells`, cell === looks.length * sizes.length, `${cell}`);
		await t.noConsoleErrors('no console errors');
	};
}
