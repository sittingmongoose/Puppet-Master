// The cast plates' words read whole (lead, 2026-10-31: Retro's job card read "The j…"; FS-2: BrainStorm's last phase
// and You ran together as "Write the planYou"). In a normal page and in a sandboxed iframe, in six looks at the sheet's
// 1390 and 1920 sizes: no paper line is cut (its text is no wider than its box) and no two labels on one baseline are
// closer than 4 px, in Crew, Review, BrainStorm and Chat Room.
//   browser-check run Concepts/pm7-tools/browser-check/checks/plate-text.check.mjs [--set page=<build>]
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const LOOKS = ['retro-light', 'retro-dark', 'basic-light', 'glass-dark', 'friendly-light', 'nier-dark'];
const SIZES = [[1390, 900], [1920, 1080]];
const KINDS = ['crew', 'review', 'brainstorm', 'chat_room'];

async function frameFor(t, mode) {
	if (mode === 'normal') { await t.app.open(); return t.page.mainFrame(); }
	const html = path.join(t.run.dir, 'sandbox-plate.html');
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
	await t.page.waitForTimeout(500);
	const got = await f.evaluate(() => ({ theme: document.documentElement.getAttribute('data-theme'), nier: !!(window.PM_NIER && PM_NIER.on()) }));
	return t.check(`look ${name} applied`, nier ? got.nier && got.theme.endsWith('-' + mode) : !got.nier && got.theme === name, JSON.stringify(got));
}
const plateWords = (f) => f.evaluate(() => {
	const s = document.querySelector('#pmOverlayRoot > .pmx-sheet:not(.pmx-ghost)'), area = (e) => { const q = e.getBoundingClientRect(); return q.width * q.height; };
	const plate = s && [...s.querySelectorAll('.pmx-plate')].filter((e) => area(e) > 400).sort((a, b) => area(b) - area(a))[0];
	if (!plate) return null;
	const cut = [...plate.querySelectorAll('.pmx-p-paper-text > span')].filter((sp) => { const rg = document.createRange(); rg.selectNodeContents(sp); return rg.getBoundingClientRect().width > sp.getBoundingClientRect().width + 0.05; }).map((sp) => sp.textContent);
	const boxes = [...plate.querySelectorAll('text')].map((x) => ({ t: x.textContent.trim(), q: x.getBoundingClientRect() })).filter((b) => b.q.width > 1);
	const close = [];
	for (const A of boxes) for (const B of boxes) {
		if (A === B || A.q.left > B.q.left) continue;
		if (Math.min(A.q.bottom, B.q.bottom) - Math.max(A.q.top, B.q.top) < 3) continue;
		const gap = B.q.left - A.q.right;
		if (gap < 4) close.push(`${A.t}|${B.t} ${Math.round(gap * 100) / 100}`);
	}
	const q = plate.getBoundingClientRect();
	return { cast: plate.getAttribute('data-cast'), cut, close, rect: { x: Math.max(0, Math.round(q.left) - 6), y: Math.max(0, Math.round(q.top) - 6), width: Math.round(q.width) + 12, height: Math.round(q.height) + 12 } };
});

async function plates(t, mode) {
	const f = await frameFor(t, mode);
	for (const [w, h] of SIZES) {
		await t.viewport(w, h);
		await t.page.waitForTimeout(400);
		for (const lk of LOOKS) {
			await look(t, f, lk);
			for (const kind of KINDS) {
				await f.evaluate(() => { const d = document.querySelector('#pmOverlayRoot > .pmx-sheet'); if (d) { const c = d.querySelector('.pmx-close'); if (c) c.click(); } });
				await t.page.waitForTimeout(250);
				await f.evaluate((k) => { const b = document.createElement('button'); b.dataset.kind = k; b.dataset.auto = '0'; PM56_EXT.run('collab-open-configure', b, new Event('click')); const c = PM56_EXT.ctx(); if (c.renderOverlays) c.renderOverlays(); }, kind);
				await t.page.waitForTimeout(1000);
				const r = await plateWords(f);
				await t.check(`${w} ${lk} ${kind}: a plate`, !!r);
				if (!r) continue;
				await t.check(`${w} ${lk} ${kind} (${r.cast}): no paper line cut`, r.cut.length === 0, r.cut.join(' | '));
				await t.check(`${w} ${lk} ${kind} (${r.cast}): no labels within 4 px on one baseline`, r.close.length === 0, r.close.slice(0, 4).join(' ; '));
				if (mode === 'sandbox' && w === 1390 && ((kind === 'crew' && /^retro/.test(lk)) || (kind === 'brainstorm' && lk === 'basic-light') || (kind === 'review' && lk === 'retro-dark'))) await t.crop(`${kind}-${lk}-${w}`, r.rect, `${kind} at ${w}, ${lk} (sandbox): the paper reads whole, and BrainStorm's last phase stands apart from You`);
			}
		}
	}
}

export const tests = {
	'plates normal': (t) => plates(t, 'normal'),
	'plates sandbox': (t) => plates(t, 'sandbox')
};
