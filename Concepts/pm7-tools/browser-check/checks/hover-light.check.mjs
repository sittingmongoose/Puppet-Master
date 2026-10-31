// Hover-to-light emphasises and never dims (FS-1, lead ruling 2026-10-31; Jared: "why do those who's in the crew boxes
// get grey as i move the mouse around"). In a normal page and in a sandboxed iframe, in Retro Light, Retro Dark, Glass
// Dark, Friendly Light and NieR Dark: hovering a control lights its parts (data-pmx-focus) while every plate part stays
// at full opacity, the lit marks take the accent outline (a filter), the unlit ones none, and a lit Pip keeps its own
// colour. Then the other sheets with a plate (Review, BrainStorm, Chat Room, ELI5) and Scheduled's manager.
//   browser-check run Concepts/pm7-tools/browser-check/checks/hover-light.check.mjs [--set page=<build>]
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const LOOKS = (process.env.HL_LOOKS || 'retro-light,retro-dark,glass-dark,friendly-light,nier-dark').split(',');

async function frameFor(t, mode) {
	if (mode === 'normal') { await t.app.open(); return t.page.mainFrame(); }
	const html = path.join(t.run.dir, 'sandbox-light.html');
	fs.writeFileSync(html, `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;height:100%;overflow:hidden}iframe{border:0;width:100vw;height:100vh;display:block}</style><iframe sandbox="allow-scripts allow-popups allow-forms allow-modals" src="${t.cfg.pageUrl}${t.cfg.pageUrl.includes('?') ? '&' : '?'}cb=${Date.now()}&o55=off"></iframe>`);
	await t.goto(pathToFileURL(html).href, { settleMs: 1000 });
	let f = null;
	for (let i = 0; i < 150 && !f; i++) { f = t.page.frames().find((x) => x !== t.page.mainFrame() && /cb=/.test(x.url())); if (!f) await t.page.waitForTimeout(200); }
	await f.waitForFunction(() => document.documentElement.getAttribute('data-pmr-ready') === '1' && !!window.PM_THEME, null, { timeout: 60000 });
	await t.check('sandbox: storage blocked', await f.evaluate(() => { try { localStorage.getItem('x'); return false; } catch (e) { return true; } }));
	return f;
}
async function look(t, f, name) {
	const [family, mode] = name.split('-'), nier = family === 'nier';
	await f.evaluate(async ([fam, m, n]) => { if (window.PM_NIER) await PM_NIER.set(n, { persist: false }); if (!n) PM_THEME.setFamily(fam, { persist: false }); PM_THEME.setMode(m, { persist: false }); }, [family, mode, nier]);
	await f.waitForFunction(([n, m]) => !!(window.PM_NIER && PM_NIER.on()) === n && (document.documentElement.getAttribute('data-theme') || '').endsWith('-' + m), [nier, mode], { timeout: 20000 }).catch(() => {});
	await t.page.waitForTimeout(600);
	const got = await f.evaluate(() => ({ theme: document.documentElement.getAttribute('data-theme'), nier: !!(window.PM_NIER && PM_NIER.on()) }));
	return t.check(`look ${name} applied`, nier ? got.nier && got.theme.endsWith('-' + mode) : !got.nier && got.theme === name, JSON.stringify(got));
}
async function openSheet(t, f, action, kind) {
	await f.evaluate(() => { const d = document.querySelector('#pmOverlayRoot > .pmx-sheet'); if (d) { const c = d.querySelector('.pmx-close'); if (c) c.click(); } });
	await t.page.waitForTimeout(500);
	await f.evaluate(([a, k]) => { const b = document.createElement('button'); if (k) { b.dataset.kind = k; b.dataset.auto = '0'; } PM56_EXT.run(a, b, new Event('click')); const c = PM56_EXT.ctx(); if (c.renderOverlays) c.renderOverlays(); }, [action, kind]);
	await t.page.waitForTimeout(1300);
}
// the plate's state: parts below full opacity, marks with a filter, the focus, a lit Pip head's fill
const plateState = (f) => f.evaluate(() => {
	const s = document.querySelector('#pmOverlayRoot > .pmx-sheet:not(.pmx-ghost)'), area = (e) => { const q = e.getBoundingClientRect(); return q.width * q.height; };
	const plate = s && [...s.querySelectorAll('.pmx-plate')].filter((e) => area(e) > 400).sort((a, b) => area(b) - area(a))[0];
	if (!plate) return null;
	const parts = [...plate.querySelectorAll('[data-pmx-part]')].filter((e) => e.getClientRects().length);
	const dim = parts.filter((e) => parseFloat(getComputedStyle(e).opacity) < 0.99 && !e.closest('[style*="opacity"]')).map((e) => e.getAttribute('data-pmx-part') + ':' + e.getAttribute('class'));
	const marks = [...plate.querySelectorAll('.pmx-p-mark')].filter((e) => e.getClientRects().length);
	const outlined = marks.filter((e) => /drop-shadow/.test(getComputedStyle(e).filter)).length;
	const head = (sel) => { const p = plate.querySelector(sel); return p ? getComputedStyle(p).fill : null; };
	return { focus: document.getElementById('pmOverlayRoot').getAttribute('data-pmx-focus'), parts: parts.length, dim, marks: marks.length, outlined,
		leadHead: head('[data-pmx-part~="lead"] .pmx-p-mark .pmx-pip [style*="--pip-seat"], [data-pmx-part~="lead"] .pmx-p-mark .pmx-pip path'),
		paper: plate.querySelector('.pmx-p-paper') ? getComputedStyle(plate.querySelector('.pmx-p-paper')).stroke + ' ' + getComputedStyle(plate.querySelector('.pmx-p-paper')).strokeWidth : null,
		rect: (() => { const q = plate.getBoundingClientRect(); return { x: Math.max(0, Math.round(q.left) - 6), y: Math.max(0, Math.round(q.top) - 6), width: Math.round(q.width) + 12, height: Math.round(q.height) + 12 }; })() };
});
async function hoverAt(t, f, sel) {
	const r = await f.evaluate((s) => { const e = [...document.querySelectorAll(s)].find((x) => { const q = x.getBoundingClientRect(); return q.width > 4 && q.height > 4 && q.top > 0 && q.bottom < innerHeight; }); if (!e) return null; const q = e.getBoundingClientRect(); return [q.left + Math.min(q.width / 2, 40), q.top + q.height / 2]; }, sel);
	if (!r) return false;
	await t.page.mouse.move(r[0], r[1], { steps: 6 }); await t.page.waitForTimeout(450);
	return true;
}

async function crew(t, mode) {
	const f = await frameFor(t, mode);
	for (const lk of LOOKS) {
		await look(t, f, lk);
		await openSheet(t, f, 'collab-open-configure', 'crew');
		// at rest: the pointer away and no field focused (the job field takes focus when the sheet opens)
		await t.page.mouse.move(4, 1070); await f.evaluate(() => { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); }); await t.page.waitForTimeout(700);
		const rest = await plateState(f);
		await t.check(`${lk}: Crew's plate at rest`, !!rest && rest.dim.length === 0 && rest.outlined === 0, JSON.stringify(rest));
		// the Coordinator's control lights the lead seat
		const hit = await hoverAt(t, f, '.pmx-sheet:not(.pmx-ghost) .pmx-ctl[data-pmx-affects~="lead"] button, .pmx-sheet:not(.pmx-ghost) .pmx-ctl[data-pmx-affects~="lead"] select');
		const lit = await plateState(f);
		t.log(`${mode} ${lk} lead ${JSON.stringify(lit)}`);
		await t.check(`${lk}: a control lights its part`, hit && /lead/.test(lit.focus || ''), JSON.stringify(lit && lit.focus));
		await t.check(`${lk}: nothing dims while a part is lit`, lit.dim.length === 0, lit.dim.slice(0, 6).join(' '));
		await t.check(`${lk}: the lit seat is outlined, the rest are not`, lit.outlined >= 1 && lit.outlined < lit.marks, `${lit.outlined} of ${lit.marks}`);
		await t.check(`${lk}: the lit Pip keeps its own colour`, lit.leadHead === rest.leadHead, `${rest.leadHead} -> ${lit.leadHead}`);
		if (mode === 'sandbox' || lk === 'retro-dark') await t.crop(`hover-${lk}-${mode}`, lit.rect, `${lk} (${mode}): the Coordinator's control hovered; its seat has the accent outline and nothing is grey`);
		// the job field lights the job card's edge
		await hoverAt(t, f, '.pmx-sheet:not(.pmx-ghost) [data-pmx-affects="job"] textarea, .pmx-sheet:not(.pmx-ghost) [data-pmx-affects="job"] input');
		const job = await plateState(f);
		await t.check(`${lk}: the job field edges the job card and dims nothing`, /job/.test(job.focus || '') && job.dim.length === 0 && job.paper !== rest.paper, `${rest.paper} -> ${job.paper}; dim ${job.dim.length}`);
	}
}

// Reduced Motion: the emphasis comes and goes in one step (no transition on the marks or the job card's edge)
async function reduced(t) {
	await t.app.open();
	await t.emulate({ reducedMotion: 'reduce' });
	await openSheet(t, t.page.mainFrame(), 'collab-open-configure', 'crew');
	const d = await t.page.evaluate(() => { const s = document.querySelector('#pmOverlayRoot > .pmx-sheet:not(.pmx-ghost)'); const m = s.querySelector('.pmx-plate .pmx-p-mark'), p = s.querySelector('.pmx-plate .pmx-p-paper'); return [m && getComputedStyle(m).transitionDuration, p && getComputedStyle(p).transitionDuration]; });
	await t.check('Reduced Motion: no transition on the emphasis', d.every((v) => !v || v.split(',').every((x) => parseFloat(x) === 0)), JSON.stringify(d));
}

async function others(t, mode) {
	const f = await frameFor(t, mode);
	await look(t, f, 'retro-dark');
	for (const [action, kind] of [['collab-open-configure', 'review'], ['collab-open-configure', 'brainstorm'], ['collab-open-configure', 'chat_room'], ['eli5-open', null]]) {
		await openSheet(t, f, action, kind);
		const r = await f.evaluate(() => {
			const s = document.querySelector('#pmOverlayRoot > .pmx-sheet:not(.pmx-ghost)'); if (!s || !s.querySelector('.pmx-plate')) return null;
			const ctl = [...s.querySelectorAll('[data-pmx-affects] :is(button, select, input:not([type="hidden"]), textarea, [role="radio"], [role="switch"])')].filter((c) => { const q = c.getBoundingClientRect(); return q.width > 4 && q.height > 4 && q.top > 0 && q.bottom < innerHeight; });
			return ctl.slice(0, 6).map((c) => { const q = c.getBoundingClientRect(); return [q.left + Math.min(q.width / 2, 30), q.top + q.height / 2]; });
		});
		await t.check(`${kind || action}: a plate and controls`, !!r && r.length > 0);
		let lit = 0, dimmed = [];
		for (const [x, y] of r || []) {
			await t.page.mouse.move(x, y, { steps: 4 }); await t.page.waitForTimeout(350);
			const st = await plateState(f);
			if (st && st.focus) lit++;
			if (st && st.dim.length) dimmed = dimmed.concat(st.dim);
		}
		await t.check(`${kind || action}: controls light parts`, lit > 0, `${lit} of ${(r || []).length}`);
		await t.check(`${kind || action}: nothing dims`, dimmed.length === 0, dimmed.slice(0, 6).join(' '));
	}
	// Scheduled's manager: a row and its mark
	await f.evaluate(() => { const d = document.querySelector('#pmOverlayRoot > .pmx-sheet'); if (d) { const c = d.querySelector('.pmx-close'); if (c) c.click(); } });
	await t.page.waitForTimeout(400);
	await f.evaluate(() => PM56_EXT.ctx().openDialog({ type: 'sched-manage' })); await t.page.waitForTimeout(1200);
	const row = await f.evaluate(() => { const r = [...document.querySelectorAll('.pmx-sched-mgr [data-sched-row]')].find((e) => e.getClientRects().length && document.querySelector('.pmx-sched-mgr [data-sched-mark="' + e.getAttribute('data-sched-row') + '"]')); if (!r) return null; const q = r.getBoundingClientRect(); return { x: q.left + 40, y: q.top + q.height / 2, id: r.getAttribute('data-sched-row') }; });
	await t.check('Scheduled: a row with a mark', !!row);
	if (row) {
		await t.page.mouse.move(row.x, row.y, { steps: 4 }); await t.page.waitForTimeout(450);
		const s = await f.evaluate((id) => { const m = [...document.querySelectorAll('.pmx-sched-mgr [data-sched-mark]')]; return { dim: m.filter((e) => parseFloat(getComputedStyle(e).opacity) < 0.99).length, partner: m.filter((e) => e.getAttribute('data-sched-mark') === id).every((e) => /drop-shadow/.test(getComputedStyle(e).filter)), others: m.filter((e) => e.getAttribute('data-sched-mark') !== id && /drop-shadow/.test(getComputedStyle(e).filter)).length }; }, row.id);
		await t.check('Scheduled: the row lights its mark and nothing dims', s.dim === 0 && s.partner && s.others === 0, JSON.stringify(s));
	}
}

export const tests = {
	'crew normal': (t) => crew(t, 'normal'),
	'crew sandbox': (t) => crew(t, 'sandbox'),
	'other sheets normal': (t) => others(t, 'normal'),
	'other sheets sandbox': (t) => others(t, 'sandbox'),
	'reduced motion': (t) => reduced(t)
};
