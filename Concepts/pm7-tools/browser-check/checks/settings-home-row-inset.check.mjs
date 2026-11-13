// FO-174 (kit gap T-R3-3, opus-recheck-fo159r3): Settings home's two cards keep one horizontal inset for their
// header and their rows. FO-159 round 3 moved the rows to 12px 8px and left the card header at 0 14px, so every row's
// icon sat 6 px left of the card title and its chevron 6 px past the header meta, in every look and width; no kit check
// looked at row alignment, so that passed everything.
//
//   home   — in each visible `.home-panel` ("Essential setup", "Needs attention"), every `.setup-row` and
//            `.attention-row`: its leading mark's left edge equals the card title's left edge, and its chevron's right
//            edge equals the header meta's right edge (the same right inset in the card), within 1 px. The leading mark
//            is the `.setup-icon` tile, or for an attention row the painted status dot: `.pm-status-mark` is a 1em slot
//            that pays its extra width back in negative margins and paints the dot centred in it (91-no-pills.css), so
//            the slot's own box starts 4 px left of the dot on main too.
//   dialog — Settings › General › page options › "Show all explanations": in each section card, every row keeps
//            main's relationship to the section title: its label starts 14 px right of the title and its chevron ends
//            14 px in from the card's content edge, within 1 px (main 48dd033447: the row's own 14 px inline padding).
//            Lines: the drawer's rows draw main's label-and-meta line total in every look. FO-174 changed those rows' own
//            padding, and settings-min-text never opens this drawer, so this is where FO-159's line rule is kept for
//            them (pm-fo-lead, 2026-11-13). Main's totals are pinned below; they hold at every size and in both modes.
//
// Cells: all ten looks, each chosen through Settings' own Theme and Light-or-dark rows and guarded as painted
// (helpers/settings-look.mjs), at 1920x1080 with Files docked (the app's default there), at 1280x500 with Files kept
// docked through the resize (the recheck's corrected narrow state; a fresh 1280 page opens Files as an overlay and
// leaves Settings 1235 px wide), and at 860x900 and 740x900, which settings-min-text's line cells reach by resizing the
// same 1920 page. Both surfaces (`--set sandbox=0` and `--set sandbox=1`).
// Bites: fails 076e30eda7 (rows 8 px under a 14 px header: icon -6 px, chevron +6 px; drawer label +8 px) on both
// surfaces; the line total fails d2acaabee8 (drawer rows at 14 px in a 14 px card: +2 to +4 lines a look); passes
// main 48dd033447 and FO-174.
//   browser-check run Concepts/pm7-tools/browser-check/checks/settings-home-row-inset.check.mjs --set page=<build> --set sandbox=0
//   --set looks=a,b   --set sizes=1280x500,740x900   --set dialog=0 (home cards only)   --set probe=1 (log every row)
//   --set shots=friendly-dark,retro-light (normal surface, 1920: LOOK crops of the home page and the drawer per look;
//   --set build=<name> names them)
import { LOOKS } from '../browser-check.config.mjs';
import { setLookBySetting, guardPaintedLook } from '../helpers/settings-look.mjs';

const SIZES = [
	{ id: '1920x1080', w: 1920, h: 1080 },
	{ id: '1280x500', w: 1280, h: 500, docked: true },
	{ id: '860x900', w: 860, h: 900 },
	{ id: '740x900', w: 740, h: 900 },
];
const TOL = 1;
/* main 48dd033447's drawer rows: `#panel-settings .setup-row { padding: 12px 14px }` inside a `.panel-card` whose
   title sits at the card's own padding, so the label is one 14 px row inset right of the title in every look. */
const MAIN_DIALOG_INSET = 14;
/* main 48dd033447's drawer, recorded with this check (`dialog:` log lines, bite-main runs of 2026-11-13, Windows,
   browser-check 2.0.55): its 72 rows draw this many label and meta lines in each look family, the same at 1920, 1280,
   860 and 740 and in light and dark. A drawer with another row count is a new inventory: record it again. */
const MAIN_DRAWER_ROWS = 72;
const MAIN_DRAWER_LINES = { basic: 194, friendly: 198, glass: 194, nier: 196, retro: 215 };

const r1 = (n) => Math.round(n * 10) / 10;

/* Every visible home card: its header title's left, its header meta's right, and per row the leading mark's left
   and the chevron's right (window coordinates; both edges compared inside the same card, so scroll does not matter). */
const HOME = () => {
	/* the chevron is Settings' icon('chevron'): a `span.icon` flex item holding its svg */
	const isChevron = (el) => !!el && (el.tagName.toLowerCase() === 'svg' || (el.matches('.icon') && !!el.querySelector('svg')));
	const out = [];
	for (const panel of document.querySelectorAll('#pm-settings-root .home-panel')) {
		if (!panel.getClientRects().length || !panel.checkVisibility()) continue;
		const title = panel.querySelector('.home-panel-header .home-panel-title');
		const meta = panel.querySelector('.home-panel-header .home-panel-meta');
		const card = { name: title ? title.textContent.trim() : '?', rows: [], broken: !title || !meta };
		out.push(card);
		if (card.broken) continue;
		const tl = title.getBoundingClientRect().left, mr = meta.getBoundingClientRect().right;
		card.titleIn = panel.getBoundingClientRect().left - tl;
		for (const row of panel.querySelectorAll('.setup-row, .attention-row')) {
			if (!row.getClientRects().length) continue;
			const lead = row.firstElementChild, chev = row.lastElementChild;
			const label = row.querySelector('.setup-label');
			const rec = { label: label ? label.textContent.trim().slice(0, 40) : row.textContent.trim().slice(0, 40), cls: row.className };
			if (lead && !lead.matches('.setup-copy')) {
				const lr = lead.getBoundingClientRect();
				let left = lr.left;
				rec.lead = lead.className && lead.className.baseVal !== undefined ? lead.className.baseVal : lead.className;
				if (lead.matches('.pm-status-mark')) {
					/* the dot is the slot's ::before, centred in it at --pm-dot */
					const dot = parseFloat(getComputedStyle(lead, '::before').width);
					if (dot > 0) left = lr.left + (lr.width - dot) / 2;
				}
				rec.iconDx = left - tl;
			}
			if (isChevron(chev)) rec.chevDx = chev.getBoundingClientRect().right - mr;
			else rec.noChevron = chev ? chev.tagName.toLowerCase() : 'none';
			card.rows.push(rec);
		}
	}
	return out;
};

/* The drawer's section cards: each row's label against its section title, and its chevron against the card's
   content edge. */
const DIALOG = () => {
	const isChevron = (el) => !!el && (el.tagName.toLowerCase() === 'svg' || (el.matches('.icon') && !!el.querySelector('svg')));
	const rows = [...document.querySelectorAll('#panel-settings .panel-card > .setup-row')].filter((r) => r.getClientRects().length && r.checkVisibility());
	return rows.map((row) => {
		const card = row.closest('.panel-card'), cr = card.getBoundingClientRect(), cs = getComputedStyle(card);
		const title = card.querySelector('.panel-title'), label = row.querySelector('.setup-label'), chev = row.lastElementChild;
		const contentRight = cr.right - parseFloat(cs.borderRightWidth) - parseFloat(cs.paddingRight);
		const lines = (el) => { if (!el) return 0; const rg = document.createRange(); rg.selectNodeContents(el); return new Set([...rg.getClientRects()].filter((b) => b.width > 0.5).map((b) => Math.round(b.top))).size; };
		return {
			lines: lines(label) + lines(row.querySelector('.setup-meta')),
			label: label ? label.textContent.trim().slice(0, 40) : '?',
			labelDx: title && label ? label.getBoundingClientRect().left - title.getBoundingClientRect().left : null,
			chevIn: isChevron(chev) ? contentRight - chev.getBoundingClientRect().right : null,
		};
	});
};

/* Settings' Files-docked state: the side slot shows Files and Settings starts at or past its right edge */
const DOCKED = () => {
	const s = document.getElementById('sidePanelSlot');
	if (!s || !s.checkVisibility() || document.querySelector('#sidePanelSlot > .side-panel-view.active')?.id !== 'panel-files') return false;
	return document.getElementById('panel-settings').getBoundingClientRect().left >= s.getBoundingClientRect().right - 2;
};

/* two equal reads of the cards' geometry, a frame apart: a resize relayouts Settings through container queries */
const STILL = (sel) => {
	const sig = [...document.querySelectorAll(sel)].map((e) => { const r = e.getBoundingClientRect(); return `${r.left.toFixed(1)},${r.width.toFixed(1)},${r.height.toFixed(1)}`; }).join('|');
	const prev = window.__pmRowInsetSig;
	window.__pmRowInsetSig = sig;
	return !!sig && prev === sig;
};

async function sized(t, f, w, h) {
	await t.viewport(w, h);
	await t.page.waitForTimeout(350);
	await f.waitForFunction(() => window.innerWidth > 0, null, { timeout: 5000 }).catch(() => {});
	const vp = await f.evaluate(() => ({ iw: window.innerWidth, ih: window.innerHeight }));
	return Math.abs(vp.iw - w) <= 2 && Math.abs(vp.ih - h) <= 2 ? null : `inner ${vp.iw}x${vp.ih}`;
}

/* General › page options › "Show all explanations". Up to three tries, each logged: in one of about 80 drawer steps
   on 076e30eda7 (sandbox, Basic Light, after the 1280 -> 1920 resize) General's page options never showed within 18 s
   and the step threw before measuring. Returns the try that opened the drawer, or 0. */
async function openExplanations(t, f, cell) {
	const rowsShown = () => f.waitForFunction(() => [...document.querySelectorAll('#panel-settings .panel-card > .setup-row')].some((r) => r.checkVisibility()), null, { timeout: 8000 }).then(() => true).catch(() => false);
	for (let n = 1; n <= 3; n++) {
		await f.evaluate(() => window.PM51.go('general', 'app-input'));
		const opt = f.locator('#pm-settings-root [data-action="page-options"]').first();
		const item = f.getByText('Show all explanations', { exact: true }).first();
		const ok = await opt.waitFor({ state: 'visible', timeout: 6000 }).then(() => opt.click({ timeout: 5000 }))
			.then(() => item.waitFor({ state: 'visible', timeout: 5000 })).then(() => item.click({ timeout: 5000 }))
			.then(rowsShown).catch(() => false);
		if (ok) { if (n > 1) t.log(`${cell}: the drawer opened on try ${n}`); return n; }
		t.log(`${cell}: try ${n} did not open "Show all explanations"; closing any menu and opening General again`);
		await t.page.keyboard.press('Escape').catch(() => {});
		await f.evaluate(() => window.PM51.go('general', '__domain__')).catch(() => {});
		await t.page.waitForTimeout(800);
	}
	return 0;
}

const worst = (rows, key) => rows.filter((r) => typeof r[key] === 'number').reduce((m, r) => Math.max(m, Math.abs(r[key])), 0);

export const tests = {};
for (const surface of ['normal', 'sandbox']) {
	tests[`FO-174 Settings home rows keep the card header's inset (${surface})`] = async (t) => {
		if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
		const looks = String(t.args.looks || LOOKS.join(',')).split(',').map((s) => s.trim()).filter(Boolean);
		const want = t.args.sizes ? String(t.args.sizes).split(',').map((s) => s.trim()) : null;
		const sizes = want ? SIZES.filter((s) => want.some((x) => s.id.startsWith(x))) : SIZES;
		const dialog = !/^(0|false|no|off)$/i.test(String(t.args.dialog ?? '1'));
		const probe = !!t.args.probe;
		const shots = String(t.args.shots || '').split(',').map((s) => s.trim()).filter(Boolean);

		await t.viewport(1920, 1080);
		const f = await t.app.open({ sandbox: surface === 'sandbox' });
		await t.app.resetLayout();
		await f.locator('#tab-settings').click();
		await t.settle();

		for (const look of looks) {
			await t.viewport(1920, 1080);
			await t.page.waitForTimeout(300);
			await setLookBySetting(t, f, look);
			/* Files docked beside Settings: the app's default at 1920; a narrower cell earlier may have folded it */
			const icon = f.locator('#activityBar .icon[data-target="panel-files"]');
			for (let n = 0; n < 4 && !(await f.evaluate(DOCKED)); n++) { await icon.click().catch(() => {}); await t.page.waitForTimeout(900); }
			await f.locator('#pm-settings-root [data-action="home"]').first().click();
			await f.waitForFunction(() => [...document.querySelectorAll('#pm-settings-root .home-panel')].some((p) => p.checkVisibility()), null, { timeout: 8000 }).catch(() => {});
			await t.page.waitForTimeout(500);

			for (const size of sizes) {
				const cell = `${look} ${size.id}${size.docked ? ' docked' : ''}`;
				await t.step(`home ${cell}`, async () => {
					const off = await sized(t, f, size.w, size.h);
					await f.waitForFunction(STILL, '#pm-settings-root .home-panel, #pm-settings-root .home-panel :is(.setup-row,.attention-row)', { polling: 'raf', timeout: 4000 }).catch(() => {});
					await t.check(`${cell}: the page is laid out at ${size.w}x${size.h}`, !off, off || '');
					await guardPaintedLook(t, f, look, cell);
					if (size.docked) {
						const docked = await f.evaluate(DOCKED);
						const pane = await f.evaluate(() => Math.round(document.getElementById('panel-settings').getBoundingClientRect().width));
						await t.check(`${cell}: Files stays docked beside Settings through the resize (Settings ${pane} px)`, docked, 'Files is not docked: this cell would measure the fresh-1280 overlay state instead');
					}
					const cards = await f.evaluate(HOME);
					const names = cards.map((c) => c.name);
					await t.check(`${cell}: both home cards are drawn with rows (${names.join(', ') || 'none'})`,
						['Essential setup', 'Needs attention'].every((n) => cards.some((c) => c.name === n && !c.broken && c.rows.length > 0)),
						JSON.stringify(cards.map((c) => [c.name, c.rows.length, c.broken ? 'no header title/meta' : ''])));
					if (shots.includes(look) && surface === 'normal' && size.id === '1920x1080') {
						const home = f.locator('#pm-settings-root .home-page').first();
						await t.crop(`${t.args.build || 'page'}-${look}-${size.id}-home`, home, 'each card title sits over its rows\' icons and lines up with the domain cards below; header meta over the chevrons');
					}
					for (const c of cards) {
						if (c.broken || !c.rows.length) continue;
						if (probe) for (const r of c.rows) t.log(`${cell} ${c.name} | ${r.label} | ${r.lead || '-'} icon ${r1(r.iconDx ?? NaN)} chevron ${r1(r.chevDx ?? NaN)}`);
						const icons = c.rows.filter((r) => typeof r.iconDx === 'number');
						const chevs = c.rows.filter((r) => typeof r.chevDx === 'number');
						const badI = icons.filter((r) => Math.abs(r.iconDx) > TOL);
						const badC = chevs.filter((r) => Math.abs(r.chevDx) > TOL);
						await t.check(`${cell} ${c.name}: every row's ${c.name === 'Needs attention' ? 'status dot' : 'icon'} starts under the card title (${icons.length}/${c.rows.length} rows, worst ${r1(worst(icons, 'iconDx'))} px)`,
							icons.length === c.rows.length && badI.length === 0,
							icons.length !== c.rows.length ? `${c.rows.length - icons.length} rows have no leading mark: ${c.rows.filter((r) => typeof r.iconDx !== 'number').map((r) => r.label).join('; ')}`
								: badI.slice(0, 4).map((r) => `${r.label}: ${r1(r.iconDx)} px`).join('; '));
						await t.check(`${cell} ${c.name}: every row's chevron ends under the header meta (${chevs.length}/${c.rows.length} rows, worst ${r1(worst(chevs, 'chevDx'))} px)`,
							chevs.length === c.rows.length && badC.length === 0,
							chevs.length !== c.rows.length ? `rows without a chevron: ${c.rows.filter((r) => r.noChevron).map((r) => `${r.label} (${r.noChevron})`).join('; ')}`
								: badC.slice(0, 4).map((r) => `${r.label}: ${r1(r.chevDx)} px`).join('; '));
					}
				});
			}

			if (!dialog) continue;
			/* the drawer, from the narrowest size back up, so the next look starts at 1920 */
			for (const size of [...sizes].reverse()) {
				const cell = `${look} ${size.id}`;
				await t.step(`dialog ${cell}`, async () => {
					await sized(t, f, size.w, size.h);
					const attempt = await openExplanations(t, f, cell);
					if (!attempt) {
						await t.shot(`dialog-not-opened-${look}-${size.id}`, 'Settings › General after three tries to open "Show all explanations"');
						await t.check(`${cell} "Show all explanations" opens`, false, 'General\'s page options or the drawer never showed in three tries');
						return;
					}
					await f.waitForFunction(STILL, '#panel-settings .panel-card > .setup-row', { polling: 'raf', timeout: 4000 }).catch(() => {});
					await t.page.waitForTimeout(250);
					const rows = await f.evaluate(DIALOG);
					const drawn = rows.reduce((n, r) => n + r.lines, 0), want = MAIN_DRAWER_LINES[look.split('-')[0]];
					t.log(`${cell} dialog: ${rows.length} rows draw ${drawn} label and meta lines`);
					await t.check(`${cell} "Show all explanations": its rows draw main's ${want} label and meta lines`,
						rows.length === MAIN_DRAWER_ROWS && drawn === want,
						rows.length !== MAIN_DRAWER_ROWS ? `the drawer has ${rows.length} rows; main's totals are pinned for ${MAIN_DRAWER_ROWS}: record them again` : `${drawn} drawn, ${drawn - want > 0 ? '+' : ''}${drawn - want} against main`);
					if (shots.includes(look) && surface === 'normal' && size.id === '1920x1080') {
						await t.crop(`${t.args.build || 'page'}-${look}-${size.id}-drawer`, f.locator('#panel-settings .drawer').first(), 'each section title against its card edge and its rows\' labels (14 px in), next to the home crop\'s card headers');
					}
					if (probe) for (const r of rows.slice(0, 6)) t.log(`${cell} dialog | ${r.label} | label ${r1(r.labelDx ?? NaN)} chevron in ${r1(r.chevIn ?? NaN)}`);
					const badL = rows.filter((r) => r.labelDx === null || Math.abs(r.labelDx - MAIN_DIALOG_INSET) > TOL);
					const badC = rows.filter((r) => r.chevIn === null || Math.abs(r.chevIn - MAIN_DIALOG_INSET) > TOL);
					await t.check(`${cell} "Show all explanations": every row's label starts ${MAIN_DIALOG_INSET} px right of its section title, as on main (${rows.length} rows)`,
						rows.length > 0 && badL.length === 0,
						rows.length ? badL.slice(0, 4).map((r) => `${r.label}: +${r1(r.labelDx ?? NaN)} px`).join('; ') : 'the drawer opened no rows');
					await t.check(`${cell} "Show all explanations": every row's chevron ends ${MAIN_DIALOG_INSET} px in from its card's content edge, as on main`,
						rows.length > 0 && badC.length === 0,
						rows.length ? badC.slice(0, 4).map((r) => `${r.label}: ${r1(r.chevIn ?? NaN)} px`).join('; ') : 'the drawer opened no rows');
					await t.page.keyboard.press('Escape');
					await f.waitForFunction(() => !document.querySelector('#panel-settings .panel-card > .setup-row') || ![...document.querySelectorAll('#panel-settings .panel-card > .setup-row')].some((r) => r.checkVisibility()), null, { timeout: 5000 }).catch(() => {});
					await t.page.waitForTimeout(300);
				});
			}
		}
	};
}
