// SEL-F1 / SEL-B1 / SEL-B2seg (stream F batch 9, Jared 2026-11-08: "I like F1 and B1. You can use the two different
// colors"): Friendly's and Basic's selected-state indicator is their own, no longer Liquid Glass's re-tinted lens, in every
// place that draws it, and Glass stays exactly as it was.
// - places: in Friendly and Basic, light and dark, each place's chip is an opaque chip under its labels (the switcher's
//   lg-under layer), with the look's fill (Friendly: mint in the shell, peach in onboarding; Basic: its blue), Friendly's
//   2 px ink outline, Basic's square corners, none of the lens's hairline or glint, and the chosen words in the chip's ink
//   (4.5:1 on it). Segmented toggles take the look's neutral selection (DR-069): B2's well in Basic, the white or dark card
//   sticker in Friendly. Places: the page tabs, the rail's file tabs, the Activity bar's tile, Home's seated panel tab,
//   Usage's range and navigation, the Orchestrator's views, Settings' left bar, section tabs and segmented choices, the
//   Planning Wizard's work type, onboarding's step rail, its segments and its chosen option. Painted pixels on the page
//   tabs, the rail tabs, the step rail, the segments and the chosen option: the chip's inside is its fill, its edge stands
//   3:1 against the ground beside it, and the chosen words' stems 4.5:1 against the chip. Hover (the page tabs' and the
//   rail tabs' marker) and the keyboard's focus ring stand 3:1 against the bar. Fails main (the lens, re-tinted).
// - motion: a press carries the chip (Friendly's hop is 440 ms with a tilt and a squash, Basic's snap 110 ms with
//   neither), its block above the labels holds the inverted words, which stay on their tabs, and the chip lands on the
//   chosen tab; under Reduce Motion nothing is carried and the chip is on the new tab in the next frame.
// - no layout shift: the page tabs, the step rail's words and the segments keep their boxes when the choice moves.
// - forced colors: the chip is Highlight under HighlightText in Friendly and Basic (a segment's well is Canvas inside a
//   Highlight keyline), so the choice shows.
// - glass (--set base=<main build>): Glass Light and Dark crops of the page tabs, the rail tabs, the Activity bar, the
//   step rail, the segments and the chosen option are pixel-identical between main and this build (Reduce Motion, both
//   surfaces), less the GPU's own noise: the same page loaded twice differs by up to 1 level on Glass Light's frosted
//   ground, so a pixel counts as changed past 2 levels. --set glassCrops=<dir> writes each pair (main, build).
//   The step rail's crop is logged, not judged: QA-1 round 2 changed Glass's rail lens on purpose (3 px above and below
//   the word instead of 6, so it clears Pip's feet; pm-fo-lead's ruling 1109004538-40f3 accepts it for the onboarding
//   step rail only). The other five Glass places stay strict.
// - film (--set film=1, alone, with --record; --set parts=tabs,bar,rail,onb, looks=): every move above, marked, with a
//   person's click, for frame-by-frame review of the hop, the squash and the snap.
//   --set looks=friendly-light,...   --set sizes=1920x1080,1024x768,740x900,390x844   --set base=<page>
import { decodePng } from '../../../onboarding/opus-5.5/tools/pm7_parity_png.mjs';
import { paintedText } from '../helpers/painted-text.mjs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const LOOKS = ['friendly-light', 'friendly-dark', 'basic-light', 'basic-dark'];
const list = (v, all) => (v ? String(v).split(',').map((s) => s.trim()).filter(Boolean) : all);
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lum = (c) => c.map((v) => v / 255).map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)).reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0);
const ratio = (a, b) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05);
const center = (f, sel, text) => f.evaluate(([sel, text]) => {
	const e = [...document.querySelectorAll(sel)].find((x) => !text || x.textContent.trim().startsWith(text) || x.getAttribute('aria-label')?.startsWith(text));
	if (!e) return null; const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2];
}, [sel, text]);
const near = (a, b, tol = 10) => a && b && a.every((v, i) => Math.abs(v - b[i]) <= tol);

/* what each look draws: [fill, rim colour or null, rim width, words] for a tab-like chip, a segmented toggle's chip, and
   onboarding's tab-like chip (the step rail) */
const WANT = {
	'friendly-light': { tab: ['#A7E5D4', '#4A4550', 2, '#2E2A33'], seg: ['#FFFFFF', '#4A4550', 2, '#2E2A33'], onb: ['#FAD0C4', '#4A4550', 2, '#2E2A33'], card: ['#FDE7DF', '#4A4550'], r: [6, 10] },
	'friendly-dark': { tab: ['#6FDABC', '#1C1624', 2, '#1C1624'], seg: ['#45404E', '#C2BFC7', 2, '#F0EDF4'], onb: ['#FFAD93', '#1C1624', 2, '#1C1624'], card: ['#594447', '#F0EDF4'], r: [6, 10] },
	'basic-light': { tab: ['#0056B3', null, 0, '#FFFFFF'], seg: ['#D3D7DD', '#5C6470', 1, '#000000'], onb: ['#0056B3', null, 0, '#FFFFFF'], card: ['#D3DDE9', '#0056B3'], r: [0, 4] },
	'basic-dark': { tab: ['#64B5F6', null, 0, '#0B1A2B'], seg: ['#0E0E0E', '#7A818C', 1, '#FFFFFF'], onb: ['#64B5F6', null, 0, '#0B1A2B'], card: ['#263039', '#64B5F6'], r: [0, 4] }
};

/* in the page: the chip of a place and what it wears. kind 'strip': the switcher's lens of the strip that holds the chosen
   item; 'tile': the Activity bar's tile; 'plate': Home's seated tab (::before) */
const READ = () => {
	const rgb = (s) => { const m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/.exec(s || ''); return m ? [+m[1], +m[2], +m[3], m[4] == null ? 1 : +m[4]] : null; };
	const shadows = (s) => (s && s !== 'none' ? s.split(/,(?![^(]*\))/).map((x) => x.trim()) : []);
	window.__sel = {
		read(p) {
			const item = [...document.querySelectorAll(p.item)].find((e) => { const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1 && getComputedStyle(e).visibility !== 'hidden'; });
			if (!item) return { found: false };
			if (p.type === 'onb' && p.label) {
				const label = item.querySelector(p.label), style = label && getComputedStyle(label), b = label?.getBoundingClientRect();
				if (!label || style.display === 'none' || style.visibility === 'hidden' || !b.width || !b.height) {
					const strip = item.closest(p.strip), chips = strip ? [...strip.querySelectorAll('lg-under .lg-lens,lg-over .lg-lens')].filter(e => { const c = getComputedStyle(e), r = e.getBoundingClientRect(); return c.visibility !== 'hidden' && c.display !== 'none' && +c.opacity > .05 && r.width > 1 && r.height > 1; }).length : 0;
					return { found: true, hiddenRailLabel: true, visibleChips: chips };
				}
			}
			let chip = null, under = false, cs, pseudo = null;
			if (p.kind === 'strip') {
				const strip = item.closest(p.strip);
				chip = strip && [...strip.querySelectorAll(':scope > lg-under > .lg-lens, :scope > lg-under .lg-lens')].find((l) => +getComputedStyle(l).opacity > 0.5);
				if (!chip) { chip = [...document.querySelectorAll('.lg-lens')].find((l) => { const a = l.getBoundingClientRect(), b = item.getBoundingClientRect(); return +getComputedStyle(l).opacity > 0.5 && a.left <= b.left + b.width / 2 && a.right >= b.left + b.width / 2 && a.top <= b.top + b.height / 2 && a.bottom >= b.top + b.height / 2; }); }
				under = !!(chip && chip.parentElement && chip.parentElement.tagName === 'LG-UNDER');
			} else if (p.kind === 'tile') chip = document.querySelector(p.chip);
			else if (p.kind === 'plate') {
				/* FO-197: a panel strip that carries the switcher (data-lg-lensed) marks its chosen tab with the switcher's chip
				   under its labels, and its plate's chip steps aside; before it, the plate's ::before */
				const st = item.closest('.pmw-strip'), lens = st && st.hasAttribute('data-lg-lensed') && [...st.querySelectorAll(':scope > lg-under > .lg-lens')].find((l) => +getComputedStyle(l).opacity > 0.5);
				if (lens) { chip = lens; under = true; } else { chip = st?.querySelector('.pmw-plate'); pseudo = '::before'; }
			}
			else if (p.kind === 'self') chip = item;
			if (!chip) return { found: true, chip: false };
			cs = getComputedStyle(chip, pseudo);
			const after = pseudo ? null : getComputedStyle(chip, '::after');
			const bgs = (cs.backgroundImage.match(/rgba?\([^)]*\)/g) || []).map(rgb);
			const fill = bgs.find((c) => c[3] > 0.95) || (rgb(cs.backgroundColor)[3] > 0.95 ? rgb(cs.backgroundColor) : null);
			const sh = shadows(cs.boxShadow).map((s) => ({ s, c: rgb(s), inset: /inset/.test(s), px: (s.replace(/rgba?\([^)]*\)/, '').match(/-?[\d.]+px/g) || []).map(parseFloat) }));
			const rim = sh.find((x) => x.inset && x.c && x.c[3] > 0.5 && x.px.length >= 4 && x.px[0] === 0 && x.px[1] === 0 && x.px[2] === 0 && x.px[3] >= 1);
			const hair = sh.find((x) => x.inset && x.c && x.c[3] > 0.05 && x.px.length >= 4 && x.px[3] > 0 && x.px[3] < 1);
			const label = p.label ? item.querySelector(p.label) || item : item;
			const r = chip.getBoundingClientRect(), ir = label.getBoundingClientRect();
			return {
				found: true, chip: true, under, fill, rim: rim ? { c: rim.c, w: rim.px[3] } : null, hair: !!hair,
				glint: !!(after && after.content !== 'none' && after.content !== 'normal' && after.display !== 'none' && (after.backgroundImage || '').includes('gradient') && !/rgba\(0, 0, 0, 0\)|transparent/.test(after.backgroundImage)),
				radius: parseFloat(cs.borderTopLeftRadius) || 0, words: rgb(getComputedStyle(label).color),
				rect: [r.left, r.top, r.width, r.height], labelRect: [ir.left, ir.top, ir.width, ir.height]
			};
		}
	};
};

/* the places, where each page shows them */
const SHELL = [
	{ page: 'Home', name: 'page tabs', kind: 'strip', strip: 'nav.page-tabs', item: 'nav.page-tabs .page-tab.active', type: 'tab', px: true },
	{ page: 'Home', name: 'rail file tabs', kind: 'strip', strip: '.pm-segtab', item: '#sidePanelSlot .side-panel-view.active .pm-segtab .pm-segtab-item.active', type: 'tab', px: true },
	{ page: 'Home', name: 'Activity bar tile', kind: 'tile', chip: '#activityBar > .d-abind.is-on:not(.d-abind-chat)', item: '#activityBar .icon[data-target].active', type: 'tab', noWords: true },
	{ page: 'Home', name: 'Home seated panel tab', kind: 'plate', item: '.pmw-tab[data-active]', type: 'tab', plate: true, noWords: true },
	{ page: 'Usage', name: 'Usage range', kind: 'strip', strip: '#pmuRange', item: '#pmuRange > button.active', type: 'seg' },
	{ page: 'Usage', name: 'Usage navigation', kind: 'strip', strip: '#pmuNav', item: '#pmuNav .pmu-navbtn.active', type: 'tab', label: '.pmu-navtext' },
	{ page: 'Orchestrator', name: 'Orchestrator views', kind: 'strip', strip: '.orch-tabs', item: '.orch-tabs .orch-tab.active', type: 'tab' },
	{ page: 'Settings', name: 'Settings left bar', kind: 'strip', strip: '#pm-settings-root .rail-scroll', item: '#pm-settings-root .rail-scroll :is(.side-link[data-action="home"], .domain-link).active', type: 'tab' },
	{ page: 'Settings chapter', name: 'Settings section tabs', kind: 'strip', strip: '#pm-settings-root nav.workspace-tabs', item: '#pm-settings-root nav.workspace-tabs .workspace-tab.is-current', type: 'tab', optional: true },
	{ page: 'Settings chapter', name: 'Settings segmented choice', kind: 'self', item: '#pm-settings-root .segmented > button[aria-checked="true"]', type: 'seg', optional: true, inPlace: true },
	{ page: 'Planning Wizard', name: 'Planning Wizard work type', kind: 'strip', strip: '#panel-wizard .pm6-wiz-intent-row', item: '#panel-wizard .pm6-wiz-intent-chip.sel', type: 'seg', px: true, fillAndWords: true }
];
const ONB = [
	{ screen: 'begin', name: 'onboarding step rail', kind: 'strip', strip: '#pm-o55-onboarding .o55-raillist', item: '#pm-o55-onboarding .o55-railitem[data-state="current"]', label: '.o55-raillabel', type: 'onb', px: true },
	{ screen: 'begin', name: 'onboarding chosen option', kind: 'self', item: '#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) .o55-card.o55-on', label: '.o55-cardtitle', type: 'card', px: true },
	{ screen: 'nas-find', name: 'onboarding segments', kind: 'strip', strip: '#pm-o55-onboarding .o55-seg', item: '#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) .o55-seg button.o55-on', label: '.o55-segface', type: 'seg', px: true }
];

async function goPage(t, f, name) {
	if (name === 'Home') return;
	if (name === 'Settings chapter') {
		/* the first chapter with section tabs and a segmented choice on screen */
		const got = await f.evaluate(async () => {
			/* (the Look chapter last: it puts the saved look back, which the run then sets again) */
			const all = [...document.querySelectorAll('#pm-settings-root .rail-scroll .domain-link')], look = (x) => /look|appearance|theme/i.test(x.textContent);
			const links = all.filter((x) => !look(x)).slice(0, 6).concat(all.filter(look));
			const shown = (e) => { if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 1 && r.bottom > 0 && r.top < innerHeight; };
			for (const d of links) {
				d.click(); await new Promise((res) => setTimeout(res, 1300));
				if (shown(document.querySelector('#pm-settings-root .segmented > button[aria-checked="true"]'))) return d.textContent.trim().slice(0, 40);
			}
			return null;
		});
		t.log(`Settings chapter with a segmented choice: ${got}`);
		return;
	}
	await f.evaluate((n) => { const e = [...document.querySelectorAll('nav.page-tabs .page-tab')].find((x) => x.textContent.trim().startsWith(n)); if (e) e.click(); }, name);
	await t.page.waitForTimeout(1800);
	if (name === 'Planning Wizard') {
		// Usage/Orchestrator can leave the demo's run at Final review. Use its real replay control to expose the choice.
		const choice = f.locator('#panel-wizard .pm6-wiz-intent-chip[data-demo-arg="product"]');
		if (!await choice.isVisible()) await f.locator('#panel-wizard [data-demo-action="wizard.replay"]').click();
		await choice.click();
		await t.page.mouse.move(1900, 1000);
		await t.page.waitForTimeout(700);
	}
}

/* painted pixels round a chip: its inside (a pixel of fill clear of the words and the rim), its edge (the rim's pixel, or
   the fill's for a rimless block) and the ground just outside (above the chip, clear of a sticker's offset shadow) */
async function pixels(t, f, rec, rimW) {
	const [x, y, w, h] = rec.rect, lr = rec.labelRect, pad = 6;
	const off = await f.evaluate(() => { const fe = window.frameElement; if (!fe) return [0, 0]; const r = fe.getBoundingClientRect(); return [r.left, r.top]; }).catch(() => [0, 0]);
	const clip = { x: Math.max(0, Math.floor(x + off[0] - pad)), y: Math.max(0, Math.floor(y + off[1] - pad)), width: Math.ceil(w + 2 * pad), height: Math.ceil(h + 2 * pad) };
	const png = decodePng(await t.page.screenshot({ clip }));
	const at = (px, py) => { const i = (Math.round(py) * png.width + Math.round(px)) * 4; return [png.data[i], png.data[i + 1], png.data[i + 2]]; };
	const cx = x + off[0] - clip.x, cy = y + off[1] - clip.y, my = cy + h / 2;
	/* inside: left of the words, past the rim */
	// Wizard's shared button border meets the chip's rim. Read past both edges, in the blank left padding.
	const inX = rec.fillAndWords ? cx + 7 : Math.min(cx + rimW + 2, lr[0] + off[0] - clip.x - 2);
	const inside = at(Math.max(cx + rimW + 1, inX), my);
	const edge = at(cx + Math.max(0, rimW - 1) + 0.5 * (rimW ? 0 : 1), my);
	const ground = at(cx + w / 2, Math.max(0, cy - 3));
	const groundL = at(Math.max(0, cx - 3), my);
	return { inside, edge, ground, groundL };
}

async function placeChecks(t, f, p, look, tag, wide = true) {
	const W = WANT[look], want = W[p.type] || W.tab;
	const rec = await f.evaluate((p) => window.__sel.read(p), p);
	/* below 1920 x 1080 a place the layout folds away (the rail, Usage's range) is not asked for; the page tabs always are */
	if (!rec.found) { if (p.optional || (!wide && p.name !== 'page tabs')) { t.log(`${p.name} not shown here (${tag})`); return null; } return t.check(`${p.name} ${tag}: chosen item shown`, false, 'no chosen item visible', {}); }
	if (rec.hiddenRailLabel) { await t.check(`${p.name} ${tag}: hidden rail label intentionally has no chip`, rec.visibleChips === 0, JSON.stringify(rec)); return null; }
	await t.check(`${p.name} ${tag}: has its chip`, !!rec.chip, JSON.stringify(rec));
	if (!rec.chip) return null;
	if (p.type === 'card') {
		await t.check(`${p.name} ${tag}: the chosen row's fill`, near(rec.fill && rec.fill.slice(0, 3), hex(want[0]), 6), `fill ${JSON.stringify(rec.fill)} want ${want[0]}`);
		return rec;
	}
	if (p.kind === 'strip') await t.check(`${p.name} ${tag}: an opaque chip under the labels (not the lens over them)`, rec.under, `parent lg-under: ${rec.under}`);
	await t.check(`${p.name} ${tag}: fill ${want[0]}`, near(rec.fill && rec.fill.slice(0, 3), hex(want[0]), 6), `fill ${JSON.stringify(rec.fill)}`);
	if (want[1] && !p.plate) await t.check(`${p.name} ${tag}: ${want[2]} px outline ${want[1]}`, !!rec.rim && near(rec.rim.c.slice(0, 3), hex(want[1]), 6) && Math.abs(rec.rim.w - want[2]) < 0.6, `rim ${JSON.stringify(rec.rim)}`);
	if (!want[1] && !p.plate) await t.check(`${p.name} ${tag}: no outline`, !rec.rim, `rim ${JSON.stringify(rec.rim)}`);
	await t.check(`${p.name} ${tag}: none of the lens's hairline or glint`, !rec.hair && !rec.glint, `hairline ${rec.hair}, glint ${rec.glint}`);
	if (!p.plate && !p.inPlace) await t.check(`${p.name} ${tag}: corners ${W.r[0]}-${W.r[1]} px`, rec.radius >= W.r[0] && rec.radius <= W.r[1], `radius ${rec.radius}`);
	if (!p.noWords) {
		await t.check(`${p.name} ${tag}: chosen words in the chip's ink ${want[3]}`, near(rec.words && rec.words.slice(0, 3), hex(want[3]), 8), `words ${JSON.stringify(rec.words)}`);
		if (rec.fill && rec.words) { const wr = ratio(rec.words.slice(0, 3), rec.fill.slice(0, 3)); t.log(`MEASURE ${p.name} ${tag}: words on chip ${wr.toFixed(2)}`); await t.check(`${p.name} ${tag}: words 4.5:1 on the chip`, wr >= 4.5, wr.toFixed(2)); }
	}
	return rec;
}

async function pixelChecks(t, f, p, rec, look, tag) {
	const W = WANT[look], want = W[p.type] || W.tab;
	if (p.type === 'card') return;
	const rimW = want[1] ? want[2] : 0;
	const px = await pixels(t, f, { ...rec, fillAndWords: p.fillAndWords }, rimW);
	await t.check(`${p.name} ${tag}: painted inside is the fill`, near(px.inside, hex(want[0]), 14), `inside ${px.inside} want ${want[0]}`);
	/* the chip shows against the ground by its outline or by its fill, whichever stands out more (Friendly Dark's ink
	   outline is as dark as its bar, and its mint fill carries the edge there) */
	const edgeVs = Math.max(ratio(px.edge, px.ground), ratio(px.edge, px.groundL), ratio(px.inside, px.ground), ratio(px.inside, px.groundL));
	t.log(`MEASURE ${p.name} ${tag}: painted chip vs ground ${edgeVs.toFixed(2)} (edge ${px.edge}, inside ${px.inside}, ground ${px.ground})`);
	if (!p.fillAndWords) await t.check(`${p.name} ${tag}: painted chip 3:1 against the ground beside it (outline or fill)`, edgeVs >= 3, `edge ${px.edge} inside ${px.inside} ground ${px.ground}/${px.groundL} ${edgeVs.toFixed(2)}`);
	const lab = p.label ? `${p.item} ${p.label}` : p.item;
	try {
		const pt = await paintedText(f.locator(lab).first());
		if (pt.count > 0) t.log(`MEASURE ${p.name} ${tag}: painted words min ${pt.minimum.toFixed(2)} over ${pt.count} stems`);
		if (pt.count > 0) await t.check(`${p.name} ${tag}: painted words 4.5:1 on the chip`, pt.minimum >= 4.5, `min ${pt.minimum.toFixed(2)} over ${pt.count} stems`);
	} catch (e) { t.log(`${p.name} ${tag}: painted words not measured (${e.message})`); }
}

async function hoverFocus(t, f, look, tag) {
	/* hover: the marker on a page tab that is not chosen */
	const c = await f.evaluate(() => { const e = [...document.querySelectorAll('nav.page-tabs .page-tab:not(.active)')][1]; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, rect: [r.left, r.top, r.width, r.height] }; });
	const off = await f.evaluate(() => { const fe = window.frameElement; if (!fe) return [0, 0]; const r = fe.getBoundingClientRect(); return [r.left, r.top]; }).catch(() => [0, 0]);
	await t.page.mouse.move(c.x + off[0], c.y + off[1]); await t.page.waitForTimeout(700);
	const hov = await f.evaluate(() => { const m = document.getElementById('pmh-frame'); if (!m) return null; const cs = getComputedStyle(m), r = m.getBoundingClientRect(); return { outline: cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor, shadow: cs.boxShadow, op: cs.opacity, rect: [r.left, r.top, r.width, r.height] }; });
	if (hov) {
		const clip = { x: Math.floor(c.rect[0] + off[0] - 8), y: Math.floor(c.rect[1] + off[1] - 8), width: Math.ceil(c.rect[2] + 16), height: Math.ceil(c.rect[3] + 16) };
		const png = decodePng(await t.page.screenshot({ clip }));
		/* the darkest (or the most different) pixel on the marker's left edge column against the ground beside it */
		const at = (x, y) => { const i = (y * png.width + x) * 4; return [png.data[i], png.data[i + 1], png.data[i + 2]]; };
		const mx = Math.round(hov.rect[0] - clip.x + off[0]), ground = at(Math.max(0, mx - 3), Math.round(png.height / 2));
		let best = 1;
		for (let dx = 0; dx <= 2; dx++) for (let y = 4; y < png.height - 4; y++) { const v = at(Math.min(png.width - 1, mx + dx), y); best = Math.max(best, ratio(v, ground)); }
		t.log(`MEASURE hover marker ${tag}: ${best.toFixed(2)}`);
		await t.check(`hover marker ${tag}: 3:1 against the bar`, best >= 3, `best ${best.toFixed(2)} ${JSON.stringify(hov)}`);
	} else t.log(`hover marker ${tag}: no marker element`);
	await t.page.mouse.move(2, 400); await t.page.waitForTimeout(300);
	/* focus: the keyboard's ring on the chosen page tab */
	const ring = await f.evaluate(() => {
		const e = document.querySelector('nav.page-tabs .page-tab.active'); e.focus({ focusVisible: true });
		const cs = getComputedStyle(e), bar = getComputedStyle(document.querySelector('.title-bar'));
		return { visible: e.matches(':focus-visible'), color: cs.outlineColor, style: cs.outlineStyle, width: cs.outlineWidth, bar: bar.backgroundColor };
	});
	const rgb = (s) => (/(\d+), (\d+), (\d+)/.exec(s) || []).slice(1, 4).map(Number);
	if (ring.visible && ring.style !== 'none') {
		const r = ratio(rgb(ring.color), rgb(ring.bar));
		t.log(`MEASURE focus ring ${tag}: ${r.toFixed(2)}`);
		await t.check(`focus ring ${tag}: 3:1 against the bar`, r >= 3, `${ring.color} on ${ring.bar}: ${r.toFixed(2)}`);
	} else t.log(`focus ring ${tag}: not shown by focus() (${JSON.stringify(ring)})`);
	await f.evaluate(() => document.activeElement && document.activeElement.blur());
}

async function openApp(t, surface, onboarding, query) {
	const f = await t.app.open({ onboarding, query, sandbox: surface === 'sandbox' });
	await f.evaluate(READ);
	return f;
}

export const tests = {
	async 'wizard work type'(t) {
		await t.viewport(1920, 1080);
		await t.emulate({ reducedMotion: 'reduce' });
		const p = SHELL.find(p => p.page === 'Planning Wizard');
		for (const surface of t.app.surfaces()) for (const look of LOOKS) {
			const f = await openApp(t, surface, false, '');
			await t.app.look(look);
			await goPage(t, f, 'Planning Wizard');
			const tag = `${look} ${surface}`, rec = await placeChecks(t, f, p, look, tag);
			await t.check(`wizard ${tag}: Brand-new product is chosen and has a chip`, !!rec?.chip && await f.locator(`${p.item}[data-demo-arg="product"]`).count() === 1, JSON.stringify(rec), { hard: true });
			const px = await pixels(t, f, { ...rec, fillAndWords: true }, WANT[look].seg[2]);
			await t.check(`wizard ${tag}: painted fill is the neutral material within 3 levels`, near(px.inside, hex(WANT[look].seg[0]), 3), JSON.stringify({ inside: px.inside, want: WANT[look].seg[0] }));
			await pixelChecks(t, f, p, rec, look, tag);
			const words = await paintedText(f.locator(p.item));
			await t.check(`wizard ${tag}: chosen words have painted stems at 4.5:1`, words.count > 0 && words.minimum >= 4.5, JSON.stringify(words));
			await t.crop(`wizard-${look}-${surface}`, f.locator(p.strip), 'Neutral work-type chip and its chosen words');
		}
	},
	async 'wizard other looks unchanged'(t) {
		if (!t.args.base) { t.log('requires --set base=<batch9a build> for paired wizard crops'); return; }
		await t.viewport(1920, 1080); await t.emulate({ reducedMotion: 'reduce' });
		const base = /^[a-z][a-z0-9+.-]+:/i.test(t.args.base) ? t.args.base : pathToFileURL(path.resolve(t.args.base)).href;
		for (const surface of t.app.surfaces()) for (const look of ['retro-light', 'retro-dark', 'nier-light', 'nier-dark', 'glass-light', 'glass-dark']) {
			const images = [];
			for (const which of ['base', 'build']) {
				let f;
				if (which === 'build') f = await openApp(t, surface, false, '');
				else {
					const u = `${base}?o55=off&cb=${Date.now()}`;
					if (surface === 'sandbox') await t.openInSandbox(u); else await t.goto(u);
					await t.until('base wizard page ready', () => document.documentElement.getAttribute('data-pmr-ready') === '1' && !!window.PM_THEME, null, { timeout: 60000, hard: true });
					f = t.root === t.page ? t.page.mainFrame() : t.root;
				}
				await t.app.look(look); await goPage(t, f, 'Planning Wizard'); await f.waitForTimeout(1600);
				images.push(decodePng(await f.locator('#panel-wizard .pm6-wiz-intent-row').screenshot()));
			}
			const [a, b] = images, sameSize = a.width === b.width && a.height === b.height;
			let changed = 0;
			if (sameSize) for (let i = 0; i < a.data.length; i += 4) if ([0, 1, 2].some(k => Math.abs(a.data[i + k] - b.data[i + k]) > 2)) changed++;
			await t.check(`wizard ${look} ${surface}: unchanged native row paint against batch9a`, sameSize && changed === 0, JSON.stringify({ size: [a.width, a.height, b.width, b.height], changed }));
		}
	},
	async 'places'(t) {
		for (const surface of t.app.surfaces()) {
			for (const size of list(t.args.sizes, ['1920x1080'])) {
				const [w, h] = size.split('x').map(Number);
				await t.viewport(w, h);
				await t.emulate({ reducedMotion: 'reduce' });
				for (const look of list(t.args.looks, LOOKS)) {
					const tag = `${look} ${surface} ${size}`;
					let f = await openApp(t, surface, false, '');
					await t.app.look(look); await t.page.waitForTimeout(600);
					await f.evaluate(READ);
					let at = 'Home';
					for (const p of SHELL) {
						if (w < 1024 && !['page tabs', 'rail file tabs'].includes(p.name)) continue;
						if (p.page !== at) {
							await goPage(t, f, p.page); at = p.page;
							if ((await f.evaluate(() => document.documentElement.getAttribute('data-theme'))) !== look) { t.log(`${p.page} changed the look; set again`); await t.app.look(look); await t.page.waitForTimeout(500); }
						}
						const rec = await placeChecks(t, f, p, look, tag, w >= 1920);
						if (rec && rec.chip && p.px) await pixelChecks(t, f, p, rec, look, tag);
						if (p.name === 'page tabs' && w >= 1024) await hoverFocus(t, f, look, tag);
					}
					if (w < 740) continue;
					const g = await openApp(t, surface, true, 'o55=fresh');
					await g.waitForFunction(() => !!window.O55?.S?.open && !!document.querySelector('#pm-o55-onboarding .o55-raillist'), null, { timeout: 60000 });
					const [fam, mode] = look.split('-');
					await g.evaluate(([fm, m]) => window.O55.ui.applyLook(fm, m), [fam, mode]);
					await g.waitForFunction((want) => (document.documentElement.getAttribute('data-theme') || '') === want, look, { timeout: 20000 });
					let scr = null;
					for (const p of ONB) {
						if (p.screen !== scr) { await g.evaluate((s) => window.O55.ui.go(s), p.screen); await t.page.waitForTimeout(1500); scr = p.screen; }
						const rec = await placeChecks(t, g, p, look, tag, w >= 1024);
						if (rec && rec.chip && p.px) await pixelChecks(t, g, p, rec, look, tag);
					}
				}
			}
		}
	},

	async 'motion'(t) {
		await t.viewport(1920, 1080);   /* (a run of places leaves the last of its sizes) */
		for (const surface of t.app.surfaces()) {
			for (const look of list(t.args.looks, LOOKS)) {
				const tag = `${look} ${surface}`;
				await t.emulate({ reducedMotion: 'no-preference' });
				const f = await openApp(t, surface, false, '');
				await t.app.look(look); await t.page.waitForTimeout(600);
				/* a press on a page tab three along: the block, its copies held still, and the landing */
				const res = await f.evaluate(async () => {
					const tabs = [...document.querySelectorAll('nav.page-tabs .page-tab')], from = tabs.find((x) => x.classList.contains('active')), to = tabs[(tabs.indexOf(from) + 3) % tabs.length];
					const r = to.getBoundingClientRect(), o = { bubbles: true, cancelable: true, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2, button: 0, buttons: 1, pointerId: 1, pointerType: 'mouse', isPrimary: true };
					to.dispatchEvent(new PointerEvent('pointerdown', o));
					const F = document.querySelector('nav.page-tabs > lg-over .lg-carry');
					const out = { block: !!F };
					if (F) {
						const a = F.getAnimations()[0], G = F.querySelector('.lg-carry-twins'), kf = a.effect.getKeyframes();
						out.dur = a.effect.getTiming().duration; out.frames = kf.length;
						out.tilt = kf.some((k) => /rotate\((-?[\d.]+)deg\)/.test(k.transform) && Math.abs(parseFloat(/rotate\((-?[\d.]+)deg\)/.exec(k.transform)[1])) > 1.5);
						out.squash = kf.some((k) => { const m = /scale\(([\d.]+),\s*([\d.]+)\)/.exec(k.transform); return m && +m[1] > +m[2] + 0.1; });
						out.twins = G ? G.children.length : 0;
						out.copyData = [...F.querySelectorAll('.lg-twin')].flatMap(c => [c, ...c.querySelectorAll('*')].flatMap(n => [...n.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name)));
						/* the copies stay on their tabs: the copy layer's transform is the block's inverse at every frame */
						const fa = a, ga = G.getAnimations()[0], bad = [];
						for (const tt of [0.2, 0.45, 0.7, 0.9]) {
							fa.currentTime = ga.currentTime = tt * out.dur;
							const m1 = new DOMMatrix(getComputedStyle(F).transform), m2 = new DOMMatrix(getComputedStyle(G).transform), id = m1.multiply(m2);
							if (Math.abs(id.a - 1) > 0.02 || Math.abs(id.d - 1) > 0.02 || Math.abs(id.b) > 0.02 || Math.abs(id.c) > 0.02 || Math.abs(id.e) > 0.6 || Math.abs(id.f) > 0.6) bad.push([tt, id.a, id.b, id.c, id.d, id.e, id.f].map((v) => +v.toFixed(3)));
						}
						fa.currentTime = ga.currentTime = 0;
						out.bad = bad;
					}
					to.dispatchEvent(new PointerEvent('pointerup', o)); to.click();
					await new Promise((res) => setTimeout(res, 1500));
					const lens = document.querySelector('nav.page-tabs > lg-under > .lg-lens'), lr = lens.getBoundingClientRect(), tr = to.getBoundingClientRect();
					out.landed = Math.abs(lr.left + lr.width / 2 - (tr.left + tr.width / 2)) < 2 && !document.querySelector('nav.page-tabs > lg-over .lg-carry');
					out.chosen = to.classList.contains('active');
					from.click(); await new Promise((res) => setTimeout(res, 1200));
					return out;
				});
				const hop = look.startsWith('friendly');
				await t.check(`motion ${tag}: a press carries the chip in a block above the labels`, res.block, JSON.stringify(res));
				if (res.block) {
					await t.check(`motion ${tag}: ${hop ? 'hop 440 ms with a tilt and a squash' : 'snap 110 ms, no tilt or squash'}`, hop ? res.dur === 440 && res.tilt && res.squash : res.dur === 110 && !res.tilt && !res.squash, JSON.stringify(res));
					await t.check(`motion ${tag}: inverted words copied into the block`, res.twins >= 2, `twins ${res.twins}`);
					await t.check(`motion ${tag}: visual copies carry no data hooks`, res.copyData.length === 0, JSON.stringify(res.copyData));
					await t.check(`motion ${tag}: the copies stay on their tabs (copy layer is the block's inverse)`, res.bad.length === 0, JSON.stringify(res.bad));
				}
				await t.check(`motion ${tag}: the chip lands on the chosen tab and the block goes`, res.landed && res.chosen, JSON.stringify(res));
				/* Reduce Motion: no block, the chip on the new tab in the next frame */
				await t.emulate({ reducedMotion: 'reduce' });
				const red = await f.evaluate(async () => {
					const tabs = [...document.querySelectorAll('nav.page-tabs .page-tab')], from = tabs.find((x) => x.classList.contains('active')), to = tabs[(tabs.indexOf(from) + 2) % tabs.length];
					to.click();
					await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
					const lens = document.querySelector('nav.page-tabs > lg-under > .lg-lens'), lr = lens.getBoundingClientRect(), tr = to.getBoundingClientRect();
					const anims = lens.getAnimations().filter((a) => a.playState === 'running' && a.effect.getKeyframes().some((k) => k.transform || k.left || (k.opacity != null && +k.opacity < 1)));
					const out = { block: !!document.querySelector('nav.page-tabs > lg-over .lg-carry'), onTab: Math.abs(lr.left + lr.width / 2 - (tr.left + tr.width / 2)) < 2, anims: anims.length };
					from.click(); await new Promise((res) => setTimeout(res, 800));
					return out;
				});
				await t.check(`reduced motion ${tag}: nothing carried, the chip on the new tab in the next frame, no fade`, !red.block && red.onTab && red.anims === 0, JSON.stringify(red));
			}
		}
	},

	async 'no layout shift'(t) {
		await t.viewport(1920, 1080);   /* (a run of places leaves the last of its sizes) */
		for (const surface of t.app.surfaces()) {
			for (const look of list(t.args.looks, LOOKS)) {
				const tag = `${look} ${surface}`;
				await t.emulate({ reducedMotion: 'reduce' });
				const f = await openApp(t, surface, false, '');
				await t.app.look(look); await t.page.waitForTimeout(500);
				const tabs = await f.evaluate(async () => {
					/* laid-out boxes (the chosen tab's resting swell is a scale in Glass) */
					const rects = () => [...document.querySelectorAll('nav.page-tabs .page-tab')].map((e) => [e.offsetLeft, e.offsetTop, e.offsetWidth, e.offsetHeight]);
					const a = rects(); const all = [...document.querySelectorAll('nav.page-tabs .page-tab')]; const from = all.find((x) => x.classList.contains('active'));
					all[(all.indexOf(from) + 1) % all.length].click(); await new Promise((res) => setTimeout(res, 900)); const b = rects(); from.click(); await new Promise((res) => setTimeout(res, 700));
					return { a, b };
				});
				/* main already moves the tabs after a newly chosen one by up to 1 px (its laid-out width changes by a pixel
				   when chosen, in every look, measured on e154b6459f), so the bound is that pixel: the chip adds nothing */
				const tabMoved = Math.max(...tabs.a.map((r, i) => Math.max(...r.map((v, k) => Math.abs(v - tabs.b[i][k])))));
				await t.check(`no layout shift ${tag}: page tabs keep their boxes (main's own 1 px aside)`, tabMoved <= 1, JSON.stringify(tabs));
				const g = await openApp(t, surface, true, 'o55=fresh');
				await g.waitForFunction(() => !!window.O55?.S?.open && !!document.querySelector('#pm-o55-onboarding .o55-raillist'), null, { timeout: 60000 });
				const [fam, mode] = look.split('-');
				await g.evaluate(([fm, m]) => window.O55.ui.applyLook(fm, m), [fam, mode]);
				await g.waitForFunction((want) => (document.documentElement.getAttribute('data-theme') || '') === want, look, { timeout: 20000 });
				await g.evaluate(() => window.O55.ui.go('nas-find')); await t.page.waitForTimeout(1500);
				const seg = await g.evaluate(async () => {
					const q = () => [...document.querySelectorAll('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) .o55-seg button')];
					const rects = () => q().map((e) => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.width, r.height].map((v) => +v.toFixed(1)); });
					const a = rects(); q().find((b) => !b.classList.contains('o55-on')).click(); await new Promise((res) => setTimeout(res, 900));
					return { a, b: rects() };
				});
				await t.check(`no layout shift ${tag}: onboarding segments keep their boxes`, JSON.stringify(seg.a) === JSON.stringify(seg.b), JSON.stringify(seg));
				const steps = await g.evaluate(async () => {
					const rects = () => [...document.querySelectorAll('#pm-o55-onboarding .o55-raillist .o55-raillabel')].map((e) => { const r = e.getBoundingClientRect(); return [r.left, r.width].map((v) => +v.toFixed(1)); });
					window.O55.ui.go('begin'); await new Promise((res) => setTimeout(res, 1500)); const a = rects();
					window.O55.ui.go('where'); await new Promise((res) => setTimeout(res, 1500)); const b = rects();
					return { a, b };
				});
				/* the current step's word is bold, as before this change: compare against main's own shift, which is the
				   difference between the two words' bold and regular widths only */
				const moved = steps.a.map((r, i) => Math.abs(r[0] - steps.b[i][0]));
				t.log(`step words ${tag}: ${JSON.stringify(steps)} moved ${JSON.stringify(moved)}`);
				await t.check(`no layout shift ${tag}: the step rail's words move by no more than the bold word's change`, moved.every((m) => m <= 6), JSON.stringify(moved));
			}
		}
	},

	async 'forced colors'(t) {
		await t.viewport(1920, 1080);   /* (a run of places leaves the last of its sizes) */
		for (const surface of t.app.surfaces()) {
			for (const look of list(t.args.looks, LOOKS)) {
				const tag = `${look} ${surface}`;
				await t.emulate({ reducedMotion: 'reduce' });
				await t.page.emulateMedia({ forcedColors: 'active' });
				try {
					const f = await openApp(t, surface, false, '');
					await t.app.look(look); await t.page.waitForTimeout(600);
					const r = await f.evaluate(() => {
						const probe = document.createElement('i'); probe.style.cssText = 'position:fixed;left:-50px;top:0;width:4px;height:4px;forced-color-adjust:none;background:Highlight;color:HighlightText;border:1px solid Canvas'; document.body.appendChild(probe);
						const pc = getComputedStyle(probe), H = pc.backgroundColor, HT = pc.color, C = pc.borderTopColor; probe.remove();
						const out = { H, HT, C, places: [] };
						for (const [strip, item] of [['nav.page-tabs', 'nav.page-tabs .page-tab.active'], ['#sidePanelSlot .side-panel-view.active .pm-segtab', '#sidePanelSlot .side-panel-view.active .pm-segtab .pm-segtab-item.active']]) {
							const s = document.querySelector(strip), l = s && s.querySelector(':scope > lg-under > .lg-lens'), it = document.querySelector(item);
							out.places.push({ strip, lens: !!l, bg: l && getComputedStyle(l).backgroundColor, words: it && getComputedStyle(it).color });
						}
						return out;
					});
					for (const p of r.places) {
						await t.check(`forced colors ${tag} ${p.strip}: the chip is Highlight`, p.lens && p.bg === r.H, JSON.stringify({ p, H: r.H }));
						await t.check(`forced colors ${tag} ${p.strip}: the chosen words are HighlightText`, p.words === r.HT, JSON.stringify({ p, HT: r.HT }));
					}
					/* painted: the chip shows against the bar */
					const box = await f.evaluate(() => { const l = document.querySelector('nav.page-tabs > lg-under > .lg-lens'); const r = l.getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; });
					const png = decodePng(await t.page.screenshot({ clip: { x: Math.floor(box[0]) - 4, y: Math.floor(box[1]) - 4, width: Math.ceil(box[2]) + 8, height: Math.ceil(box[3]) + 8 } }));
					const at = (x, y) => { const i = (y * png.width + x) * 4; return [png.data[i], png.data[i + 1], png.data[i + 2]]; };
					const inside = at(4 + 3, Math.round(png.height / 2)), out = at(1, Math.round(png.height / 2));
					await t.check(`forced colors ${tag}: the painted chip stands 3:1 against the bar`, ratio(inside, out) >= 3, `${inside} vs ${out}: ${ratio(inside, out).toFixed(2)}`);
				} finally { await t.page.emulateMedia({ forcedColors: 'none' }); }
			}
		}
	},

	/* --set film=1 with --record: the moves to watch frame by frame, each one marked (the page tabs, the Activity bar, the
	   rail's tabs, onboarding's step rail and segments), with a person's click (90 ms between press and release) */
	async 'film'(t) {
		if (!t.args.film) { t.log('skipped: --set film=1 (record this test alone with --record)'); return; }
		const looks = list(t.args.looks, ['friendly-light', 'basic-light']);
		const parts = list(t.args.parts, ['tabs', 'rail', 'onb']);
		if (t.args.reduce) await t.emulate({ reducedMotion: 'reduce' });
		let f = await t.app.open({ onboarding: false, sandbox: t.app.sandboxed() });
		for (const look of looks) {
			if (parts.includes('tabs') || parts.includes('rail') || parts.includes('bar')) {
				await t.app.look(look); await t.page.waitForTimeout(1500);
			}
			if (parts.includes('tabs')) {
				for (const name of ['Projects', 'Usage', 'Home', 'Settings', 'Home']) {
					const c = await center(f, 'nav.page-tabs .page-tab', name); if (!c) { t.log('no tab ' + name); continue; }
					await t.page.mouse.move(c[0], c[1]); await t.page.waitForTimeout(250);
					t.mark(`${look} tab ${name}`); await t.page.mouse.down(); await t.page.waitForTimeout(90); await t.page.mouse.up();
					await t.page.waitForTimeout(1400);
				}
			}
			if (parts.includes('bar')) {
				for (const id of ['panel-search', 'panel-source', 'panel-files', 'panel-testing', 'panel-files']) {
					const c = await f.evaluate((id) => { const e = document.querySelector('#activityBar .icon[data-target="' + id + '"]'); if (!e) return null; const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, id);
					if (!c) { t.log('no icon ' + id); continue; }
					await t.page.mouse.move(c[0], c[1]); await t.page.waitForTimeout(250);
					t.mark(`${look} bar ${id}`); await t.page.mouse.down(); await t.page.waitForTimeout(90); await t.page.mouse.up();
					await t.page.waitForTimeout(1100);
				}
			}
			if (parts.includes('rail')) {
				const items = await f.evaluate(() => [...document.querySelectorAll('#sidePanelSlot .side-panel-view.active .pm-segtab .pm-segtab-item')].map((e) => { const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }));
				for (const i of [2, 0, 1, 0]) {
					const items2 = await f.evaluate(() => [...document.querySelectorAll('#sidePanelSlot .side-panel-view.active .pm-segtab .pm-segtab-item')].map((e) => { const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }));
					const c = items2[i]; if (!c) continue;
					await t.page.mouse.move(c[0], c[1]); await t.page.waitForTimeout(250);
					t.mark(`${look} rail tab ${i}`); await t.page.mouse.down(); await t.page.waitForTimeout(90); await t.page.mouse.up();
					await t.page.waitForTimeout(1100);
				}
			}
		}
		if (parts.includes('onb')) {
			const g = await t.app.open({ onboarding: true, query: 'o55=fresh', sandbox: t.app.sandboxed() });
			await g.waitForFunction(() => !!window.O55?.S?.open && !!document.querySelector('#pm-o55-onboarding .o55-raillist'), null, { timeout: 60000 });
			for (const look of looks) {
				const [fam, mode] = look.split('-');
				await g.evaluate(([fm, m]) => window.O55.ui.applyLook(fm, m), [fam, mode]);
				await g.waitForFunction((want) => (document.documentElement.getAttribute('data-theme') || '') === want, look, { timeout: 20000 });
				await t.page.waitForTimeout(1800);
				for (const scr of ['where', 'begin', 'where', 'welcome']) {
					t.mark(`${look} onb ${scr}`);
					await g.evaluate((s) => window.O55.ui.go(s), scr);
					await t.page.waitForTimeout(1600);
				}
				// the device kind segment (SSH / SMB / NFS / Already connected): a choice that changes nothing else
				await g.evaluate(() => window.O55.ui.go('nas-find')); await t.page.waitForTimeout(1800);
				for (let k = 0; k < 3; k++) {
					const c = await g.evaluate(() => { const b = document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) .o55-seg button:not(.o55-on)'); if (!b) return null; const r = b.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
					if (!c) { t.log('no seg'); break; }
					await t.page.mouse.move(c[0], c[1]); await t.page.waitForTimeout(250);
					t.mark(`${look} onb seg ${k}`); await t.page.mouse.down(); await t.page.waitForTimeout(90); await t.page.mouse.up(); await t.page.waitForTimeout(1800);
				}
			}
		}
		await t.check('film done', true);
	},

	async 'glass unchanged'(t) {
		if (!t.args.base) { t.log('skipped: --set base=<main build> compares Glass against it'); return; }
		const base = /^[a-z][a-z0-9+.-]+:/i.test(t.args.base) ? t.args.base : pathToFileURL(path.resolve(t.args.base)).href;
		const crops = {};
		const PLACES = [['page tabs', '.title-bar nav.page-tabs', 6], ['rail tabs', '#sidePanelSlot .side-panel-view.active .pm-segtab', 4], ['activity bar', '#activityBar', 0]];
		const OPLACES = [['step rail', '#pm-o55-onboarding .o55-head', 0, 'begin'], ['chosen option', '#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) .o55-choices', 4, 'begin'], ['segments', '#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) .o55-seg', 4, 'nas-find']];
		let cb = 0;
		const open = async (which, surface, onboarding, query) => {
			if (which === 'build') return openApp(t, surface, onboarding, query);
			const u = `${base}${base.includes('?') ? '&' : '?'}cb=${Date.now()}-g${++cb}${onboarding ? '' : '&o55=off'}${query ? '&' + query : ''}`;
			if (surface === 'sandbox') await t.openInSandbox(u, { settleMs: 300 }); else await t.goto(u, { settleMs: 300 });
			await t.until('base page ready', () => document.documentElement.getAttribute('data-pmr-ready') === '1' && !!window.PM_THEME, null, { timeout: 60000, hard: true });
			return t.root === t.page ? t.page.mainFrame() : t.root;
		};
		const grab = async (f, sel, pad) => {
			const off = await f.evaluate(() => { const fe = window.frameElement; if (!fe) return [0, 0]; const r = fe.getBoundingClientRect(); return [r.left, r.top]; }).catch(() => [0, 0]);
			const r = await f.evaluate((sel) => { const e = document.querySelector(sel); if (!e) return null; const b = e.getBoundingClientRect(); return [b.left, b.top, b.width, Math.min(b.height, 420)]; }, sel);
			if (!r) return null;
			return t.page.screenshot({ clip: { x: Math.max(0, Math.floor(r[0] + off[0] - pad)), y: Math.max(0, Math.floor(r[1] + off[1] - pad)), width: Math.ceil(r[2] + 2 * pad), height: Math.ceil(r[3] + 2 * pad) } });
		};
		await t.viewport(1920, 1080);
		await t.emulate({ reducedMotion: 'reduce' });
		for (const surface of t.app.surfaces()) {
			for (const which of ['base', 'build']) {
				for (const look of ['glass-light', 'glass-dark']) {
					const f = await open(which, surface, false, '');
					await t.app.look(look); await t.page.waitForTimeout(1500);
					await t.page.mouse.move(1900, 1000);
					for (const [n, sel, pad] of PLACES) crops[`${n}|${look}|${surface}|${which}`] = await grab(f, sel, pad);
					const g = await open(which, surface, true, 'o55=fresh');
					await g.waitForFunction(() => !!window.O55?.S?.open && !!document.querySelector('#pm-o55-onboarding .o55-raillist'), null, { timeout: 60000 });
					const [fam, mode] = look.split('-');
					await g.evaluate(([fm, m]) => window.O55.ui.applyLook(fm, m), [fam, mode]);
					await g.waitForFunction((want) => (document.documentElement.getAttribute('data-theme') || '') === want, look, { timeout: 20000 });
					let scr = null;
					for (const [n, sel, pad, screen] of OPLACES) {
						if (screen !== scr) { await g.evaluate((s) => window.O55.ui.go(s), screen); await t.page.waitForTimeout(2200); scr = screen; }
						crops[`${n}|${look}|${surface}|${which}`] = await grab(g, sel, pad);
					}
				}
			}
			for (const look of ['glass-light', 'glass-dark']) {
				for (const n of [...PLACES, ...OPLACES].map((p) => p[0])) {
					const a = crops[`${n}|${look}|${surface}|base`], b = crops[`${n}|${look}|${surface}|build`];
					if (!a || !b) { await t.check(`glass unchanged ${n} ${look} ${surface}: both pages show it`, false, `base ${!!a} build ${!!b}`); continue; }
					const A = decodePng(a), B = decodePng(b);
					let diff = 0, maxd = 0;
					if (A.width === B.width && A.height === B.height) for (let i = 0; i < A.data.length; i += 4) { const d = Math.max(Math.abs(A.data[i] - B.data[i]), Math.abs(A.data[i + 1] - B.data[i + 1]), Math.abs(A.data[i + 2] - B.data[i + 2])); if (d > 0) { diff++; maxd = Math.max(maxd, d); } }
					else diff = -1;
					if (t.args.glassCrops) { fs.mkdirSync(t.args.glassCrops, { recursive: true }); const stem = `${n}-${look}-${surface}`.replace(/ /g, '-'); fs.writeFileSync(path.join(t.args.glassCrops, `${stem}-main.png`), a); fs.writeFileSync(path.join(t.args.glassCrops, `${stem}-build.png`), b); }
					/* the same page twice differs by up to one level on Glass Light's frosted ground (main against main,
					   e154b6459f: 60,844 pixels of the step rail by 1), so a pixel is changed when it differs by more than 2 */
					let changed = 0; if (diff > 0) for (let i = 0; i < A.data.length; i += 4) if (Math.max(Math.abs(A.data[i] - B.data[i]), Math.abs(A.data[i + 1] - B.data[i + 1]), Math.abs(A.data[i + 2] - B.data[i + 2])) > 2) changed++;
					/* (QA-1 round 2: the step rail's lens changed on purpose, accepted for the step rail only; see the header) */
					if (n === 'step rail') { t.log(`glass unchanged step rail ${look} ${surface}: not judged (QA-1 round 2 changed the rail lens on purpose): ${A.width}x${A.height} vs ${B.width}x${B.height}, ${changed} pixels by more than 2`); continue; }
					await t.check(`glass unchanged ${n} ${look} ${surface}: pixel for pixel (GPU noise of 2 levels aside)`, diff >= 0 && changed === 0, `${A.width}x${A.height} vs ${B.width}x${B.height}, ${diff} pixels differ (max ${maxd}), ${changed} by more than 2`);
				}
			}
		}
	}
};
