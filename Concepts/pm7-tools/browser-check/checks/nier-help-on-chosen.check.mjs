// FO-5 (Jared's Q3 and Q9 kind): under NieR a chosen or hovered option is an ink bar; every ? on the screen must stay
// visible (not ink on ink) and clickable (on top). Every onboarding screen, NieR Light and Dark: each option that has a ?
// is clicked in turn, then every ? on the screen is checked, with the pointer still on the clicked option (its menu
// cursor) and again with the pointer away (chosen alone). --set sandbox=1 runs it in a sandboxed iframe (no storage).
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const MODES = ['light', 'dark'];

export default async function (t) {
	let f = t.page;
	if (t.args.sandbox) {
		const html = path.join(t.run.dir, 'sandbox-nier.html');
		const src = t.cfg.pageUrl + (t.cfg.pageUrl.includes('?') ? '&' : '?') + 'o55=screen=welcome&cb=' + Date.now();
		fs.writeFileSync(html, `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;height:100%}iframe{border:0;width:100%;height:100%}</style><iframe sandbox="allow-scripts" src="${src}"></iframe>`);
		await t.goto(pathToFileURL(html).href, { settleMs: 500 });
		f = t.page.frames().find((x) => x !== t.page.mainFrame());
		await f.waitForFunction(() => document.documentElement.getAttribute('data-pmr-ready') === '1' && !!window.O55 && !!document.querySelector('#pm-o55-onboarding .o55-win'), null, { timeout: 60000 });
	} else {
		await t.app.open({ onboarding: true, query: 'o55=screen=welcome' });
		await f.waitForFunction(() => !!document.querySelector('#pm-o55-onboarding .o55-win'), null, { timeout: 60000 });
	}
	await f.waitForTimeout(2500);
	const screens = await f.evaluate(() => Object.keys(window.O55.screens.defs));
	const LAYER = '#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out)';
	for (const mode of MODES) {
		await f.evaluate((m) => window.O55.ui.applyLook('nier', m), mode);
		await f.waitForFunction((m) => document.documentElement.getAttribute('data-o55-nier') === 'on' && (document.documentElement.getAttribute('data-theme') || '').endsWith('-' + m), mode, { timeout: 15000 });
		await f.waitForTimeout(1500);
		let screensWithHelp = 0, optionsClicked = 0, helpsChecked = 0;
		const bad = [], skipped = [];
		let lookFixes = 0;
		for (const id of screens) {
			// a screen that needs a journey's own state to draw (a host found, a key made) refuses a bare jump: skipped
			const go = async () => { const ok = await f.evaluate((s) => { try { if (!window.O55.S.open) window.O55.ui.open({ screen: s }); else window.O55.ui.go(s, { noHistory: true }); return true; } catch (e) { return false; } }, id); if (!ok) { skipped.push(id); return null; } await f.waitForTimeout(900); return f.evaluate(() => window.O55.S.sess.screen); };
			if (!(await f.evaluate((m) => document.documentElement.getAttribute('data-o55-nier') === 'on' && (document.documentElement.getAttribute('data-theme') || '').endsWith('-' + m), mode))) { lookFixes++; await f.evaluate((m) => window.O55.ui.applyLook('nier', m), mode); await f.waitForTimeout(3500); }
			if ((await go()) !== id) continue;
			const n = await f.evaluate((L) => [...document.querySelectorAll(L + ' .o55-opt')].filter((o) => o.querySelector(':scope > .o55-tipq') && o.firstElementChild && !o.firstElementChild.classList.contains('o55-tipq') && o.firstElementChild.getBoundingClientRect().height > 0).length, LAYER);
			if (!n) continue;
			screensWithHelp++;
			for (let i = 0; i < n; i++) {
				if (i && (await f.evaluate(() => window.O55.S.sess.screen)) !== id && (await go()) !== id) break;
				const target = await f.evaluate(([L, k]) => {
					const o = [...document.querySelectorAll(L + ' .o55-opt')].filter((x) => x.querySelector(':scope > .o55-tipq') && x.firstElementChild && !x.firstElementChild.classList.contains('o55-tipq') && x.firstElementChild.getBoundingClientRect().height > 0)[k];
					if (!o) return null;
					const c = o.firstElementChild; c.scrollIntoView({ block: 'center' }); const b = c.getBoundingClientRect();
					const act = c.getAttribute('data-o55-do') || '';
					return { x: b.left + Math.min(40, b.width / 3), y: b.top + b.height / 2, kind: c.className.split(' ')[0], disabled: c.getAttribute('aria-disabled') === 'true' || c.disabled || /^(skip|close|quit|exit|later|pickFamily|pickMode|lookFamily|lookMode|pickNier|adjustNier)$/i.test(act) };
				}, [LAYER, i]);
				if (!target || target.disabled) continue;
				await f.waitForTimeout(250);
				const pt = t.args.sandbox ? target : target;
				await t.page.mouse.click(pt.x, pt.y);
				optionsClicked++;
				await f.waitForTimeout(900);
				if ((await f.evaluate(() => window.O55.S.sess.screen)) !== id) continue;
				if (!(await f.evaluate((m) => document.documentElement.getAttribute('data-o55-nier') === 'on' && (document.documentElement.getAttribute('data-theme') || '').endsWith('-' + m), mode))) { lookFixes++; t.log && t.log(`${id} option ${i + 1}: the look left NieR ${mode} (${await f.evaluate(() => document.documentElement.getAttribute('data-theme'))}); put back`); await f.evaluate((m) => window.O55.ui.applyLook('nier', m), mode); await f.waitForTimeout(3500); } // the option moved on: its ? left with the screen
				for (const pointer of ['on the option', 'away']) {
					if (pointer === 'away') { await t.page.mouse.move(2, 2); await f.waitForTimeout(400); }
					const r = await f.evaluate((L) => {
						const rgb = (c) => { const e = document.createElement('i'); e.style.color = c; document.body.appendChild(e); const v = getComputedStyle(e).color; e.remove(); return v; };
						const ink = rgb(getComputedStyle(document.documentElement).getPropertyValue('--o55-nier-ink').trim());
						const px = (v, w) => { v = String(v).trim(); if (v === 'auto' || v === '100%' || v === '') return w; let m = /^calc\(100% - ([\d.]+)px\)$/.exec(v); if (m) return w - +m[1]; m = /^([\d.]+)px$/.exec(v); if (m) return +m[1]; m = /^([\d.]+)%$/.exec(v); if (m) return w * m[1] / 100; return w; };
						const out = [];
						for (const q of document.querySelectorAll(L + ' .o55-tipq')) {
							let b = q.getBoundingClientRect(); if (b.width < 4 || b.height < 4 || getComputedStyle(q).visibility === 'hidden') continue;
							/* a ? below the pane's fold is tested where a person scrolls it to */
							const pane = q.closest('.o55-pane, .o55-layer'), pr = pane && pane.getBoundingClientRect(), foot = document.querySelector('#pm-o55-onboarding .o55-foot'), fr = foot && foot.getBoundingClientRect();
							if ((pr && (b.top < pr.top || b.bottom > pr.bottom)) || (fr && b.bottom > fr.top)) { q.scrollIntoView({ block: 'center' }); b = q.getBoundingClientRect(); }
							const cx = b.left + b.width / 2, cy = b.top + b.height / 2;
							const top = document.elementFromPoint(cx, cy);
							const onTop = !!top && (top === q || q.contains(top));
							const qc = getComputedStyle(q), qcolor = qc.color, qborder = qc.borderTopColor;
							// what paints under the ?: the nearest box behind it, ink if its colour or its ink image reaches this x
							let under = 'paper';
							for (const e of document.elementsFromPoint(cx, cy)) {
								if (e === q || q.contains(e)) continue;
								const s = getComputedStyle(e), eb = e.getBoundingClientRect();
								const imgInk = s.backgroundImage.includes(ink.replace(/\s/g, ' ')) || (s.backgroundImage !== 'none' && s.backgroundImage.includes('gradient') && s.backgroundImage.replace(/\s/g, '').includes(ink.replace(/\s/g, '')));
								const sizeW = px((/^calc\([^)]*\)|^\S+/.exec(s.backgroundSize.trim()) || ['100%'])[0], eb.width);
								if (imgInk && cx < eb.left + sizeW) { under = 'ink'; break; }
								if (s.backgroundColor === ink) { under = 'ink'; break; }
								if (s.backgroundColor !== 'rgba(0, 0, 0, 0)' && s.backgroundColor !== 'transparent') break;
							}
							const qBg = qc.backgroundColor;
							const lost = under === 'ink' && qcolor === ink && qborder === ink && (qBg === 'rgba(0, 0, 0, 0)' || qBg === ink);
							const opt = q.closest('.o55-opt'), ctl = opt && opt.firstElementChild;
							out.push({ label: q.getAttribute('aria-label') || q.getAttribute('data-arg'), onTop, lost, under, chosen: !!(ctl && (ctl.classList.contains('o55-on') || ctl.getAttribute('aria-checked') === 'true')), cursor: !!(ctl && ctl.hasAttribute('data-o55fx-cursor')) });
						}
						return out;
					}, LAYER);
					if (r.some((q) => !q.onTop)) { await f.waitForTimeout(1200); const again = await f.evaluate((L) => [...document.querySelectorAll(L + ' .o55-tipq')].map((q) => { q.scrollIntoView({ block: 'center' }); const b = q.getBoundingClientRect(); const top = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return b.width < 4 || !!top && (top === q || q.contains(top)); }), LAYER); r.forEach((q, k) => { if (!q.onTop && again[k]) q.onTop = true; }); }
					helpsChecked += r.length;
					for (const q of r) if (!q.onTop || q.lost) bad.push(`${id} after option ${i + 1} (pointer ${pointer}): "${q.label}" ${q.lost ? 'ink on ink' : ''}${!q.onTop ? ' covered' : ''} (chosen ${q.chosen}, cursor ${q.cursor})`);
				}
				// the two screens Jared's frames came from: keep a look at a chosen card with its ?
				if ((id === 'c-route' || id === 'nas-key') && i === (id === 'c-route' ? 0 : 1)) {
					const box = await f.evaluate((L) => { const c = document.querySelector(L + ' .o55-opt > .o55-card.o55-on'); if (!c) return null; const b = c.parentElement.getBoundingClientRect(); return { x: b.left - 6, y: b.top - 6, width: b.width + 12, height: b.height + 12 }; }, LAYER);
					if (box && !t.args.sandbox) await t.crop(`nier-${mode}-${id}-chosen`, box, `NieR ${mode}, ${id}: the chosen card's ? on its paper strip`);
				}
			}
		}
		await t.check(`NieR ${mode}: every ? visible and clickable after each option is chosen (${screensWithHelp} screens, ${optionsClicked} options, ${helpsChecked} ? checks)`, bad.length === 0, bad.slice(0, 12).join('; ') + (bad.length > 12 ? ` (+${bad.length - 12} more)` : ''));
		t.log && t.log(`NieR ${mode}: screens skipped (need a journey's state): ${[...new Set(skipped)].join(' ') || 'none'}`);
		t.log && t.log(`NieR ${mode}: the look was put back ${lookFixes} times`);
		t.log && t.log(`NieR ${mode}: ${bad.length} findings${bad.length ? ': ' + bad.join(' | ') : ''}`);
		await t.check(`NieR ${mode}: the sweep reached screens with options`, screensWithHelp >= 8 && optionsClicked >= 20, `${screensWithHelp} screens, ${optionsClicked} options`);
	}
}
