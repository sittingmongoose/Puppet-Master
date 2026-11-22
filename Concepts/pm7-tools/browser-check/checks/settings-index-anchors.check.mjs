// Jared's Settings review, 2026-11-21 (on the landed concept page, again): "When you scroll in settings, the highlight on
// the submenu doesnt work properly ... This is still not fixed!", his Nov 20 picture being Media & Output › Abilities with
// "For the whole project" lit; and, of the 1 px line right of the side index, "This line needs to be removed. on the themes
// where it is there" (not in Glass).
// Stream P's repro on main b3a0ccaa74 (plain PMConcept7 and the concept page alike, 1440x900, T3's sandbox and normal):
// - kit.d/22-index.js pm51AdoptAnchors put the "Media abilities" entry (media-abilities, a group Media & Output draws
//   itself: PM51.page owns) on the card of its first drawn row, the Defaults card inside the shown ability's details,
//   ~750-900 px below the top of the abilities list, so "For the whole project" stayed lit while the list filled the
//   screen. settings-index-spy passed: it reads "the section in view" from the same adopted anchors.
// - Reached by the top tabs (Media & Output, then its Abilities tab), Abilities listed no entries at all: the tab redraw
//   morphs the page body, the leaving copy still held the adopted anchors, so the arriving copy got none.
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
	else if (rp && rp.top <= line - 40 && rp.bottom >= line + 40) reading = line - rp.top <= 400 ? 'list-top' : 'list';
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
		const want = { switches: ['For the whole project'], 'list-top': ['Media abilities'], list: ['Media abilities', 'Where results go'] };
		const judged = { switches: 0, 'list-top': 0, list: 0 }, wrong = [];
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
		await t.check(`the walk read the For the whole project card and the top of the list (${route})`, judged.switches >= 1 && judged['list-top'] >= 2, JSON.stringify(judged));
		await t.check(`every judged step lights the card being read (${route}): For the whole project on its card, Media abilities on the list`, wrong.length === 0, wrong.slice(0, 6).join(' | ') + (wrong.length > 6 ? ` and ${wrong.length - 6} more` : ''));
	}]
]).concat([
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
]));
