// FO-20 and FO-21: Settings' setup window (kit.d/60-wizard.js, 45-setup.css) reads in all ten looks, at every step. Settings
// › Source Control › Add another account or instance › GitLab, always in T3's sandbox (t.openInSandbox's default flags,
// whatever --set sandbox says). The window is walked as a person walks it: every card of a step is chosen in turn, fields
// are filled with obvious test text, a step's own buttons are pressed (sign-in, the check), then Continue, to the last step.
// At every state each scroller is wheeled from top to bottom, and every line of text the window shows is read from painted
// pixels: its darkest stem against its own local ground (the commonest colour in the line's box), 4.5:1 at every size
// (F3-654); a token pair can say a colour passes where the painted text does not (FO-21: the token instructions, read at
// 3.2:1); the main action's words count once it can be pressed. Also per step: no overflow or clipped text (t.noOverflow on
// the window). A native crop of the token step, scrolled to its instructions, per look.
// --set looks=friendly-light,basic-dark: those looks only.
import { decodePng } from '../../../onboarding/opus-5.5/tools/pm7_parity_png.mjs';
const LOOKS = ['basic', 'friendly', 'retro', 'glass', 'nier'].flatMap((f) => [`${f}-light`, `${f}-dark`]);

async function openSetup(t, f, look) {
	await f.evaluate(() => document.getElementById('tab-settings').click());
	await f.waitForTimeout(2200);
	await f.evaluate(() => document.querySelector('#pm-settings-root .domain-link[data-domain="source"]').click());
	await f.waitForTimeout(1800);
	const at = async (sel) => { const p = await f.evaluate((s) => { const e = [...document.querySelectorAll(s)].find((x) => x.getBoundingClientRect().width > 0); if (!e) return null; e.scrollIntoView({ block: 'center' }); const b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; }, sel); if (!p) return false; await t.page.mouse.click(p.x, p.y); await f.waitForTimeout(700); return true; };
	if (!(await at('[data-action="pm51-source-add-service"]'))) return 'no Add another account or instance';
	// the dialog's Service: a native select or the kit's dropdown, set to GitLab
	const picked = await f.evaluate(() => {
		const dlg = [...document.querySelectorAll('.dialog')].find((d) => d.getBoundingClientRect().width > 0); if (!dlg) return 'no dialog';
		const sel = dlg.querySelector('select');
		if (sel) { const o = [...sel.options].find((x) => /gitlab/i.test(x.textContent) || /gitlab/i.test(x.value)); if (!o) return 'no GitLab'; sel.value = o.value; sel.dispatchEvent(new Event('input', { bubbles: true })); sel.dispatchEvent(new Event('change', { bubbles: true })); return 'native'; }
		return 'dropdown';
	});
	if (picked === 'dropdown') {
		await at('.dialog .pm51-dd-trigger');
		if (!(await at('.pm51-dd-menu [role="option"], .pm51-dd-option, [data-action="pm51-dd-pick"]'))) return 'no dropdown options';
		const ok = await f.evaluate(() => { const o = [...document.querySelectorAll('.pm51-dd-menu [role="option"], .pm51-dd-option, [data-action="pm51-dd-pick"]')].find((x) => /gitlab/i.test(x.textContent)); if (!o) return false; o.click(); return true; });
		if (!ok) return 'no GitLab option';
		await f.waitForTimeout(400);
	} else if (picked !== 'native') return picked;
	if (!(await at('.dialog [data-action="dialog-save"], .dialog .btn-primary, .dialog button[type="submit"]'))) return 'no Continue';
	await f.waitForTimeout(1200);
	// a connect panel first, for some services: its Connect opens the window
	if (!(await f.evaluate(() => !!document.querySelector('.o55g-win')))) await at('.drawer [data-action*="connect"], .drawer .btn-primary');
	const ok = await f.waitForFunction(() => { const w = document.querySelector('.o55g-win'); return !!w && w.getBoundingClientRect().width > 300; }, null, { timeout: 8000 }).then(() => true, () => false);
	if (!ok) return 'no setup window';
	// the look last, with the window open: Settings puts back its saved look as it opens things, and the kit's look is not
	// saved; the window's tokens follow the look live
	await f.waitForTimeout(800);
	await t.app.look(look);
	await f.waitForTimeout(1600);
	await t.page.mouse.move(2, 2);
	return null;
}

export default async function (t) {
	const looks = t.args.looks ? String(t.args.looks).split(',') : LOOKS;
	const rows = [], bad = [];
	const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
	const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
	for (const look of looks) {
		const f = await t.app.open({ sandbox: true });
		const why = await openSetup(t, f, look);
		if (why) { bad.push(`${look}: ${why}`); continue; }
		const seen = new Map();   // a line of text, read once: its words and where it sits in the window -> the worst reading
		let states = 0, steps = 0, scrolls = 0, cropped = false;
		// every line of text the window shows now, from the painted pixels of the window
		const readVisible = async (label) => {
			const runs = await f.evaluate(() => {
				const w = document.querySelector('.o55g-win'); if (!w) return null;
				const wb = w.getBoundingClientRect(), out = [];
				const walker = document.createTreeWalker(w, NodeFilter.SHOW_TEXT);
				for (let n = walker.nextNode(); n; n = walker.nextNode()) {
					const txt = n.textContent.trim(); if (!txt) continue;
					const el = n.parentElement; if (!el || el.closest('[aria-hidden="true"], [aria-disabled="true"], :disabled, .o55g-out, script, style')) continue;
					const c = getComputedStyle(el); if (c.visibility === 'hidden' || +c.opacity < 0.05) continue;
					// the box the text is clipped to: its own element's and every clipping ancestor's (a screen reader's 1 px live
					// region clips its words away)
					let clip = wb; for (let a = el; a && a !== w.parentElement; a = a.parentElement) { const ac = getComputedStyle(a); if (/(auto|scroll|hidden|clip)/.test(ac.overflowY + ac.overflowX)) { const r = a.getBoundingClientRect(); clip = { left: Math.max(clip.left, r.left), top: Math.max(clip.top, r.top), right: Math.min(clip.right, r.right), bottom: Math.min(clip.bottom, r.bottom) }; } }
					const range = document.createRange(); range.selectNodeContents(n);
					let li = 0;
					for (const r of range.getClientRects()) {
						if (r.width < 4 || r.height < 6) continue;
						if (r.left < clip.left - 0.5 || r.right > clip.right + 0.5 || r.top < clip.top - 0.5 || r.bottom > clip.bottom + 0.5) continue;
						out.push({ key: `${txt.slice(0, 40)}|${li++}|${el.className}`, text: txt.slice(0, 40), cls: `${el.tagName.toLowerCase()}.${String(el.className).split(' ').filter(Boolean).slice(0, 2).join('.')}`, size: c.fontSize, x: r.left - wb.left, y: r.top - wb.top, w: r.width, h: r.height });
					}
				}
				return { rect: { x: Math.max(0, wb.left), y: Math.max(0, wb.top), width: Math.min(wb.width, innerWidth - Math.max(0, wb.left)), height: Math.min(wb.height, innerHeight - Math.max(0, wb.top)) }, ox: Math.max(0, wb.left) - wb.left, oy: Math.max(0, wb.top) - wb.top, runs: out };
			});
			if (!runs) return;
			const png = decodePng(await t.page.screenshot({ clip: runs.rect }));
			for (const run of runs.runs) {
				const x0 = Math.max(0, Math.round(run.x - runs.ox)), y0 = Math.max(0, Math.round(run.y - runs.oy)), x1 = Math.min(png.width, Math.round(run.x - runs.ox + run.w)), y1 = Math.min(png.height, Math.round(run.y - runs.oy + run.h));
				if (x1 - x0 < 3 || y1 - y0 < 4) continue;
				// the local ground: the commonest colour in the line's box (16 levels a channel), averaged
				const buckets = new Map();
				for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const i = (y * png.width + x) * 4, k = (png.data[i] >> 4) << 8 | (png.data[i + 1] >> 4) << 4 | (png.data[i + 2] >> 4); const b = buckets.get(k) || [0, 0, 0, 0]; b[0] += png.data[i]; b[1] += png.data[i + 1]; b[2] += png.data[i + 2]; b[3]++; buckets.set(k, b); }
				let top = null; for (const b of buckets.values()) if (!top || b[3] > top[3]) top = b;
				const ground = [top[0] / top[3], top[1] / top[3], top[2] / top[3]];
				// the darkest stem: the pixel that stands furthest from that ground
				let best = 1, stem = ground;
				for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const i = (y * png.width + x) * 4, px = [png.data[i], png.data[i + 1], png.data[i + 2]], cr = ratio(px, ground); if (cr > best) { best = cr; stem = px; } }
				const was = seen.get(run.key);
				if (!was || best < was.cr) seen.set(run.key, { cr: best, text: run.text, cls: run.cls, size: run.size, stem: stem.map(Math.round), ground: ground.map(Math.round), where: label });
			}
		};
		// each scroller in the window, wheeled from its top to its bottom, read at every stop
		// Settings puts back its saved look as the window draws a new state; the look under test is put back before each reading
		let relooks = 0;
		const holdLook = async () => {
			const [fam, mode] = look.split('-');
			const ok = await f.evaluate(([fm, m]) => { const th = document.documentElement.getAttribute('data-theme') || '', nier = document.documentElement.getAttribute('data-o55-nier') === 'on' || !!(window.PM_NIER && PM_NIER.on()); return fm === 'nier' ? nier && th.endsWith('-' + m) : !nier && th === `${fm}-${m}`; }, [fam, mode]);
			if (!ok) { relooks++; await t.app.look(look); await f.waitForTimeout(1200); }
		};
		const readAll = async (label) => {
			states++;
			await holdLook();
			const n = await f.evaluate(() => { const w = document.querySelector('.o55g-win'); let k = 0; for (const e of w.querySelectorAll('*')) { const c = getComputedStyle(e); if (/(auto|scroll)/.test(c.overflowY) && e.scrollHeight > e.clientHeight + 2) { e.setAttribute('data-sw-scroll', String(k++)); e.scrollTop = 0; } } return k; });
			await f.waitForTimeout(250);
			await readVisible(label);
			for (let k = 0; k < n; k++) {
				for (let stop = 0; stop < 12; stop++) {
					const at = await f.evaluate((i) => { const e = document.querySelector(`[data-sw-scroll="${i}"]`); if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + Math.min(b.height / 2, 200), top: e.scrollTop, max: e.scrollHeight - e.clientHeight, step: e.clientHeight * 0.7 }; }, k);
					if (!at || at.top >= at.max - 1) break;
					await t.page.mouse.move(at.x, at.y); await t.page.mouse.wheel(0, at.step); await f.waitForTimeout(350); scrolls++;
					await readVisible(`${label}, scrolled`);
				}
			}
			// the token step, scrolled to its instructions: the crop for this look
			if (!cropped && /token/i.test(label)) {
				const r = await f.evaluate(() => { const w = document.querySelector('.o55g-win'), help = w.querySelector('.pm51-field-help'); if (help) help.scrollIntoView({ block: 'center' }); const b = w.getBoundingClientRect(); return { x: Math.max(0, b.left), y: Math.max(0, b.top), width: Math.min(b.width, innerWidth), height: Math.min(b.height, innerHeight) }; });
				await f.waitForTimeout(350); await t.page.mouse.move(2, 2);
				await t.crop(`token-${look}`, r, `${look}: Connect GitLab, Use a token instead, scrolled to the instructions`); cropped = true;
			}
			await t.page.mouse.move(2, 2);
		};
		const click = async (sel, i = 0) => { const p = await f.evaluate(([s, k]) => { const e = [...document.querySelectorAll(s)].filter((x) => x.getBoundingClientRect().width > 0)[k]; if (!e) return null; e.scrollIntoView({ block: 'center' }); const b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; }, [sel, i]); if (!p) return false; await t.page.mouse.click(p.x, p.y); await f.waitForTimeout(900); return true; };
		const L = '.o55g-win .o55g-layer:not(.o55g-out)';
		for (let step = 1; step <= 6; step++) {
			steps = step;
			const name = await f.evaluate(() => { const c = document.querySelector('.o55g-railitem[data-state="current"]'); return c ? c.textContent.trim() : '?'; });
			await readAll(`step ${step} (${name})`);
			await t.noOverflow(`${look} step ${step} (${name}): no overflow or clipped text`, { scope: '.o55g-win' });
			// every card of the step, chosen in turn (the last stays chosen: the path forward)
			const cards = await f.evaluate((l) => [...document.querySelectorAll(`${l} .o55g-card`)].filter((x) => x.getBoundingClientRect().width > 0 && !x.matches('[aria-disabled="true"]')).map((x) => (x.querySelector('.o55g-cardtitle') || x).textContent.trim().slice(0, 30)), L);
			for (let i = 0; i < cards.length; i++) { if (await click(`${L} .o55g-card:not([aria-disabled="true"])`, i)) await readAll(`step ${step} (${name}), ${cards[i]}`); }
			// fields get obvious test text, and the step's own buttons (sign-in, a check) are pressed
			await f.evaluate((l) => { for (const e of document.querySelectorAll(`${l} input.text-control, ${l} textarea`)) { if (e.getBoundingClientRect().width && !e.value) { e.focus(); e.value = /token|key|secret/i.test(e.className + e.placeholder) ? 'TEST-NOT-A-REAL-TOKEN-0000' : 'test-user'; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); } } }, L);
			for (let b = 0; b < 3; b++) { if (!(await click(`${L} .btn.primary:not([aria-disabled="true"]):not(:disabled)`, 0))) break; await f.waitForTimeout(1500); }
			await readAll(`step ${step} (${name}), done`);
			const before = name;
			if (!(await click('.o55g-foot .btn.o55g-primary:not([aria-disabled="true"]):not(:disabled)'))) break;
			await f.waitForTimeout(1300);
			const now = await f.evaluate(() => { const w = document.querySelector('.o55g-win'); if (!w) return 'closed'; const c = document.querySelector('.o55g-railitem[data-state="current"]'); return c ? c.textContent.trim() : '?'; });
			if (now === 'closed' || now === before) break;
		}
		const worst = [...seen.values()].sort((a, b) => a.cr - b.cr);
		const fails = worst.filter((x) => x.cr < 4.5);
		rows.push(`${look}: ${steps} steps, ${states} states (the look put back ${relooks} times), ${scrolls} scroll stops, ${seen.size} lines read; lowest ${worst.length ? worst[0].cr.toFixed(2) : '-'}:1 ("${worst.length ? worst[0].text : ''}", ${worst.length ? worst[0].cls : ''})`);
		fails.forEach((x) => { bad.push(`${look}: "${x.text}" ${x.cr.toFixed(2)}:1`); t.log(`${look} FAILS "${x.text}" ${x.cr.toFixed(2)}:1 (${x.cls} ${x.size}; stem rgb(${x.stem}) on rgb(${x.ground}); ${x.where})`); });
		if (!cropped) t.log(`${look}: the token step was not reached for a crop`);
	}
	rows.forEach((r) => t.log(r));
	await t.check(`the setup window reads at every step (painted text 4.5:1 at every size, F3-654; ${looks.length} looks)`, bad.length === 0, bad.slice(0, 12).join('; ') + (bad.length > 12 ? ` (+${bad.length - 12} more)` : ''));
}
