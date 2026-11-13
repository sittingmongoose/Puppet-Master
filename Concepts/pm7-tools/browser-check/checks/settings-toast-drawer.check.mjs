// FO-177 (astra-max-12a A12A-N1, pre-existing on 9b212f7aa9 and c9329ed84a): Settings › Back Seat Driver › Findings,
// a delivered finding's drawer open, "Open in chat": its answer is a notice under the bell (#rsStage, inside the title
// bar), and the drawer covered most of it. Settings' layer for drawers and dialogs (#pm-settings-portals, z-index 300)
// stacked against the title bar itself (z-index 50) in every look whose .main-area makes no stacking context.
//
//   drawer — the finding's drawer is open and settled; a real press on its "Open in chat" stages the notice. Then:
//            the notice is wholly inside the window; at every point of its box (a 6 px grid, rounded corners left out)
//            the topmost element is the notice itself (elementFromPoint: paint order and hit testing); and a real
//            click on its dismiss button (Playwright's actionability refuses a covered target) dismisses it while the
//            drawer stays open. Logged: how much of the notice's box the drawer's own box overlaps.
//   dialog — a Settings confirm (PM51.confirm, the dialog every Settings confirm uses, with its full-panel scrim) is
//            open and a notice is pushed through window.toast: the same three assertions, with the dialog still open.
// Cells: all ten looks, each chosen through Settings' own Theme and Light-or-dark rows and guarded as painted
// (helpers/settings-look.mjs), at 1390x900 (the review's size) and 860x900. Both surfaces (`--set sandbox=0`/`1`).
// Bite: fails main 6bd8294726 in the looks whose .main-area is no stacking context; passes FO-177.
//   browser-check run Concepts/pm7-tools/browser-check/checks/settings-toast-drawer.check.mjs --set page=<build> --set sandbox=0
//   --set looks=a,b   --set sizes=1390x900   --set cases=drawer,dialog   --set probe=1 (log the hit grid's owners)
//   --set shots=basic-dark,nier-light (normal surface: LOOK crops of the notice over the drawer; --set build=<name>)
import { LOOKS } from '../browser-check.config.mjs';
import { setLookBySetting, guardPaintedLook } from '../helpers/settings-look.mjs';

const SIZES = [{ id: '1390x900', w: 1390, h: 900 }, { id: '860x900', w: 860, h: 900 }];
const r1 = (n) => Math.round(n * 10) / 10;

/* the notice whose title has `title`, once it has entered: no entering class (it takes no clicks until then), none of
   its entrance animations still running (the timer line runs all along), and the same box two polls running */
async function noticeIn(f, title) {
	return f.waitForFunction((title) => {
		const card = [...document.querySelectorAll('#rsStage .pmn-toast')].filter((c) => !c.classList.contains('pmn-leaving') && c.textContent.includes(title)).pop();
		if (!card || card.classList.contains('pmn-entering') || getComputedStyle(card).pointerEvents === 'none') return false;
		/* its entrance (the card and its inner box); the timer line along its foot runs for the card's whole stay */
		if (card.getAnimations({ subtree: true }).some((a) => a.playState === 'running' && a.effect && a.effect.getTiming().iterations !== Infinity && !(a.effect.target && a.effect.target.closest && a.effect.target.closest('.pmn-timer')))) return false;
		const r = card.getBoundingClientRect(), sig = [r.left, r.top, r.width, r.height].map((v) => v.toFixed(1)).join(',');
		const prev = window.__fo177Sig; window.__fo177Sig = sig;
		return prev === sig;
	}, title, { polling: 100, timeout: 6000 }).then(() => true).catch(() => false);
}

/* the notice's box against the window and what owns each point of it */
const COVER = ([title, coverSel]) => {
	const card = [...document.querySelectorAll('#rsStage .pmn-toast')].filter((c) => !c.classList.contains('pmn-leaving') && c.textContent.includes(title)).pop();
	if (!card) return null;
	const r = card.getBoundingClientRect();
	const rad = parseFloat(getComputedStyle(card).borderTopLeftRadius) || 0;
	const corner = Math.max(4, rad);
	let n = 0, own = 0; const by = {};
	for (let x = r.left + 3; x <= r.right - 3; x += 6) for (let y = r.top + 3; y <= r.bottom - 3; y += 6) {
		const nearX = Math.min(x - r.left, r.right - x), nearY = Math.min(y - r.top, r.bottom - y);
		if (nearX < corner && nearY < corner) continue;   // inside a rounded corner's square
		n++;
		const e = document.elementFromPoint(x, y);
		if (e && card.contains(e)) { own++; continue; }
		const k = !e ? 'nothing' : e.closest(coverSel) ? coverSel.split(',')[0] : `${e.tagName.toLowerCase()}${e.id ? '#' + e.id : ''}.${String(e.className).split(' ')[0]}`;
		by[k] = (by[k] || 0) + 1;
	}
	const cov = document.querySelector(coverSel);
	const cr = cov ? cov.getBoundingClientRect() : null;
	const ox = cr ? Math.max(0, Math.min(r.right, cr.right) - Math.max(r.left, cr.left)) : 0, oy = cr ? Math.max(0, Math.min(r.bottom, cr.bottom) - Math.max(r.top, cr.top)) : 0;
	const cx = r.left + r.width * 0.75, cy = r.top + r.height / 2;
	const stack = document.elementsFromPoint(cx, cy).slice(0, 5).map((e) => `${e.tagName.toLowerCase()}${e.id ? '#' + e.id : ''}.${String(e.className).split(' ')[0]}`);
	const scrolled = []; for (const e of document.querySelectorAll('*')) if ((e.scrollTop || e.scrollLeft) && e.contains(document.querySelector('header.title-bar'))) scrolled.push(`${e.tagName.toLowerCase()}${e.id ? '#' + e.id : ''}.${String(e.className).split(' ')[0]} ${e.scrollTop}`);
	return {
		pe: getComputedStyle(card).pointerEvents, cls: card.className, stack, scrolled, docScroll: [document.scrollingElement.scrollTop, scrollY],
		box: [r.left, r.top, r.width, r.height].map((v) => Math.round(v * 10) / 10), vw: innerWidth, vh: innerHeight,
		inside: r.left >= -0.5 && r.top >= -0.5 && r.right <= innerWidth + 0.5 && r.bottom <= innerHeight + 0.5,
		n, own, by, overlap: r.width * r.height ? (ox * oy) / (r.width * r.height) : 0, coverOpen: !!cov && cov.checkVisibility(),
	};
};

async function assertNotice(t, f, cell, what, title, coverSel, coverName, probe) {
	const c = await f.evaluate(COVER, [title, coverSel]);
	if (!(await t.check(`${cell} ${what}: the notice "${title}" is staged`, !!c, 'no notice with that title under the bell'))) return;
	if (c.scrolled.length) t.log(`${cell} ${what}: measured with the window's own document scrolled: ${c.scrolled.join(', ')}`);
	t.log(`${cell} ${what}: notice ${c.box.join(',')} in ${c.vw}x${c.vh}; ${coverName} box overlaps ${Math.round(c.overlap * 100)}% of it; ${c.own}/${c.n} points its own${Object.keys(c.by).length ? ' (rest: ' + JSON.stringify(c.by) + ')' : ''}`);
	if (probe) t.log(`${cell} ${what} probe: ${JSON.stringify(c)}`);
	await t.check(`${cell} ${what}: the ${coverName} is open under the notice`, c.coverOpen, `the ${coverName} closed before the notice was read`);
	await t.check(`${cell} ${what}: the notice is wholly inside the window`, c.inside, `box ${c.box.join(',')} in ${c.vw}x${c.vh}`);
	await t.check(`${cell} ${what}: the notice is on top at every point of its box (${c.own}/${c.n})`, c.n > 20 && c.own === c.n,
		c.n <= 20 ? 'too few points sampled' : `${c.n - c.own} points belong to ${JSON.stringify(c.by)}`);
	const x = f.locator('#rsStage .pmn-toast:not(.pmn-leaving)').filter({ hasText: title }).last().locator('.pmn-x');
	const clicked = await x.click({ timeout: 2500 }).then(() => true).catch((e) => { t.log(`${cell} ${what}: dismiss click refused: ${String(e.message).split('\n')[0].slice(0, 160)}`); return false; });
	const gone = clicked && await f.waitForFunction((title) => ![...document.querySelectorAll('#rsStage .pmn-toast')].some((c) => !c.classList.contains('pmn-leaving') && c.textContent.includes(title)), title, { timeout: 3000 }).then(() => true).catch(() => false);
	await unscroll(t, f, `${cell} ${what} after the dismiss click`);
	const still = await f.evaluate((sel) => { const e = document.querySelector(sel); return !!e && e.checkVisibility(); }, coverSel);
	await t.check(`${cell} ${what}: a real click on the notice's dismiss button dismisses it, the ${coverName} still open`, clicked && gone && still,
		!clicked ? 'the click never reached the dismiss button (covered)' : !gone ? 'the notice stayed' : `the ${coverName} closed`);
}

async function sized(t, f, w, h) {
	await t.viewport(w, h);
	await t.page.waitForTimeout(400);
	const vp = await f.evaluate(() => ({ iw: window.innerWidth, ih: window.innerHeight }));
	return Math.abs(vp.iw - w) <= 2 && Math.abs(vp.ih - h) <= 2 ? null : `inner ${vp.iw}x${vp.ih}`;
}
/* a press can scroll the window's own document (scrollIntoView reaches every ancestor): the title bar then leaves the
   window and the notice with it. Put it back and say so. */
async function unscroll(t, f, cell) {
	const s = await f.evaluate(() => { const out = []; const tb = document.querySelector('header.title-bar'); for (let el = tb && tb.parentElement; el; el = el.parentElement) if (el.scrollTop || el.scrollLeft) { out.push(`${el.tagName.toLowerCase()} ${el.scrollTop}`); el.scrollTop = 0; el.scrollLeft = 0; } if (document.scrollingElement && document.scrollingElement.scrollTop) { out.push(`document ${document.scrollingElement.scrollTop}`); document.scrollingElement.scrollTop = 0; } return out; });
	if (s.length) t.log(`${cell}: the window's document had scrolled (${s.join(', ')}); put back to 0`);
}
/* close Settings' open dialogs and drawers by their own Cancel / Close buttons (Escape goes nowhere once the key focus
   sits on a notice), then Escape for anything left */
async function closeAll(t, f) {
	for (let i = 0; i < 4; i++) {
		const left = await f.evaluate(() => {
			const open = [...document.querySelectorAll('#pm-settings-portals > :is(.drawer-wrap, .overlay)')].filter((e) => e.checkVisibility() && e.dataset.closing !== '1');
			const top = open.pop();
			if (!top) return 0;
			const b = [...top.querySelectorAll('button')].filter((x) => x.getClientRects().length).find((x) => /^(Cancel|Close)$/.test(x.textContent.trim()) || /^Close/.test(x.getAttribute('aria-label') || ''));
			if (b) b.click();
			return open.length + 1;
		});
		if (!left) break;
		await t.page.waitForTimeout(350);
		if (i >= 2) { await t.page.keyboard.press('Escape'); await t.page.waitForTimeout(300); }
	}
	await f.waitForFunction(() => ![...document.querySelectorAll('#pm-settings-portals > :is(.drawer-wrap, .overlay)')].some((e) => e.checkVisibility() && e.dataset.closing !== '1'), null, { timeout: 4000 }).catch(() => {});
}

const TITLE_CHAT = 'Open in chat is not available yet';
/* one title per cell: the same words again within 12 s count up on a card still staged instead of staging a new one */
const TITLE_PUSH = (cell, surface) => `FO-177 notice over a Settings dialog (${cell}, ${surface})`;

export const tests = {};
for (const surface of ['normal', 'sandbox']) {
	tests[`FO-177 a notice stays on top of Settings' drawers and dialogs (${surface})`] = async (t) => {
		if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
		const looks = String(t.args.looks || LOOKS.join(',')).split(',').map((s) => s.trim()).filter(Boolean);
		const want = t.args.sizes ? String(t.args.sizes).split(',').map((s) => s.trim()) : null;
		const sizes = want ? SIZES.filter((s) => want.some((x) => s.id.startsWith(x))) : SIZES;
		const cases = String(t.args.cases || 'drawer,dialog').split(',').map((s) => s.trim());
		const probe = !!t.args.probe;
		const shots = String(t.args.shots || '').split(',').map((s) => s.trim()).filter(Boolean);

		await t.viewport(1390, 900);
		const f = await t.app.open({ sandbox: surface === 'sandbox' });
		await t.app.resetLayout();
		await f.locator('#tab-settings').click();
		await t.settle();

		for (const look of looks) {
			await closeAll(t, f);
			await unscroll(t, f, look);
			await t.viewport(1390, 900);
			await t.page.waitForTimeout(300);
			await setLookBySetting(t, f, look);
			for (const size of sizes) {
				const cell = `${look} ${size.id}`;
				await t.step(cell, async () => {
					await closeAll(t, f);
					await unscroll(t, f, cell);
					const off = await sized(t, f, size.w, size.h);
					await t.check(`${cell}: the page is laid out at ${size.w}x${size.h}`, !off, off || '');
					await f.evaluate(() => window.PM51.go('ai', 'bsd'));
					await f.waitForSelector('[data-continuous-workspace-body="bsd"][data-workspace-mounted="true"]', { timeout: 15000 });
					await t.settle();
					await guardPaintedLook(t, f, look, cell);
					
					if (cases.includes('drawer')) {
						await f.evaluate(() => window.PM51.switchTab('bsd', 'findings'));
						await f.waitForSelector('[data-continuous-workspace-body="bsd"] [data-action="pm51-bsd-finding"][data-id="bsdf-0409"]', { timeout: 8000 });
						await t.page.waitForTimeout(400);
						await f.evaluate(() => document.querySelector('[data-continuous-workspace-body="bsd"] [data-action="pm51-bsd-finding"][data-id="bsdf-0409"]').click());
						await unscroll(t, f, cell);
						const open = await f.waitForFunction(() => { const w = document.querySelector('#pm-settings-portals > .drawer-wrap'); return !!w && w.classList.contains('is-open') && !w.classList.contains('is-closing') && w.getAnimations({ subtree: true }).every((a) => a.playState !== 'running' || a.effect?.getTiming().iterations === Infinity); }, null, { timeout: 6000 }).then(() => true).catch(() => false);
						await t.page.waitForTimeout(350);
						if (await t.check(`${cell} drawer: the delivered finding's drawer opens`, open, 'no open drawer after the press')) {
							const btn = f.locator('#pm-settings-portals > .drawer-wrap button').filter({ hasText: /^\s*Open in chat\s*$/ }).last();
							await btn.click({ timeout: 6000 });
							await unscroll(t, f, cell);
							const staged = await noticeIn(f, TITLE_CHAT);
							if (await t.check(`${cell} drawer: "Open in chat" stages its notice`, staged, 'no "Open in chat is not available yet" notice entered')) {
								if (shots.includes(look) && surface === 'normal') await t.shot(`${t.args.build || 'page'}-${look}-${size.id}-drawer`, 'the "Open in chat" notice under the bell, whole, over the finding drawer');
								await assertNotice(t, f, cell, 'drawer', TITLE_CHAT, '#pm-settings-portals > .drawer-wrap', 'finding drawer', probe);
							}
						}
						await closeAll(t, f);
					}

					if (cases.includes('dialog')) {
						await f.evaluate(() => { window.PM51.confirm('Keep this dialog open?', 'FO-177 check: a Settings confirm stays open while a notice shows. Nothing happens on confirm.', 'Close', () => {}, false); });
						const open = await f.waitForFunction(() => [...document.querySelectorAll('#pm-settings-portals > .overlay')].some((o) => o.checkVisibility() && o.querySelector('.dialog') && o.getAnimations({ subtree: true }).every((a) => a.playState !== 'running' || a.effect?.getTiming().iterations === Infinity)), null, { timeout: 6000 }).then(() => true).catch(() => false);
						await t.page.waitForTimeout(250);
						if (await t.check(`${cell} dialog: a Settings confirm opens over the panel`, open, 'no overlay with a dialog')) {
							const title = TITLE_PUSH(cell, surface);
							await f.evaluate((title) => window.toast({ title, body: 'A notice pushed while the dialog is open.', severity: 'info' }), title);
							const staged = await noticeIn(f, title);
							if (await t.check(`${cell} dialog: the pushed notice is staged`, staged, 'no pushed notice entered')) {
								if (shots.includes(look) && surface === 'normal') await t.shot(`${t.args.build || 'page'}-${look}-${size.id}-dialog`, 'the pushed notice under the bell, whole, over the Settings confirm\'s scrim');
								await assertNotice(t, f, cell, 'dialog', title, '#pm-settings-portals > .overlay', 'confirm dialog', probe);
							}
						}
						await closeAll(t, f);
						await f.evaluate(() => { try { window.toast.clear(); } catch (e) { /* none */ } });
					}
				});
			}
		}
	};
}
