// FO-81: the header Look menu opened while Adjust NieR's editor is open lies over the editor. With the editor open (its
// panel replaces the window's interior) and the menu opened by a real click on the header's Look button, every pixel of
// every option and of every help (?) target (its box and its transparent FO-75 expansion), as far as the menu shows it,
// hit-tests natively to that option or that help, or to the menu's own non-control chrome at a rounded corner (at most
// 10% of a target): no element of the editor or of any other window layer, interactive or not (the editor's NIER
// eyebrow was what a press reached on main), and no other control of the menu. Then a real press at each one's centre
// must reach it, and the two layers keep the product's order: a press in the editor closes the menu, Adjust NieR in the
// menu gives way to the open editor, Escape closes the menu, then the editor. Ten looks (the editor stays open when the
// look changes, so it can be open in every look), widths 1920x1080, 1390, 1024, 860, 740x768 and 1280x500, both motion
// preferences, both surfaces. Fails on main 0adb197992 (the editor paints over the menu).
//   --set size=1920x1080,740x768   --set look=nier-light   --set motion=no-preference,reduce,attribute
//   --set shots=glass-light,glass-dark   (a native crop of the window per listed look; by default NieR Light at 1920, normal)
import { LOOKS } from '../browser-check.config.mjs';

const SIZES = [[1920, 1080], [1390, 900], [1024, 900], [860, 900], [740, 768], [1280, 500]];
const ITEM = ':is(.o55-lookopt, .o55-lookmodes button)';
const list = (v, all) => (v ? String(v).split(',').map((s) => s.trim()).filter(Boolean) : all);

async function cell(t, surface, w, h) {
	if (!t.app.surfaces().includes(surface)) { t.log(`skipped: the sandbox switch leaves out the ${surface} surface`); return; }
	await t.viewport(w, h);
	const f = await t.app.open({ onboarding: true, query: 'o55=fresh', sandbox: surface === 'sandbox' });
	await f.waitForFunction(() => window.O55?.S?.open && !!document.querySelector('#pm-o55-onboarding .o55-lookbtn'), null, { timeout: 30000 });
	const size = await f.evaluate(() => ({ w: innerWidth, h: innerHeight, layout: O55.S.root.getAttribute('data-o55-layout') || 'wide' }));
	await t.check(`FO-81 page has the asked size ${surface} ${w}x${h}`, size.w === w && size.h === h, JSON.stringify(size), { hard: true });
	for (const motion of list(t.args.motion, ['no-preference', 'reduce'])) {
		await t.emulate({ reducedMotion: motion === 'attribute' ? 'no-preference' : motion });
		for (const look of list(t.args.look, LOOKS)) {
			const tag = `${look} ${motion} ${surface} ${w}x${h}`;
			await t.page.mouse.move(2, 2);
			/* a clean start: no editor, no menu; then the look, then the editor (as Look > Adjust NieR opens it) */
			await f.evaluate(([fam, mode, m]) => {
				O55.nierLook.closePanel({ silent: true });
				if (O55.S.lookOpen) { O55.S.lookOpen = false; O55.ui.refresh(); }
				document.documentElement.setAttribute('data-motion', m === 'attribute' ? 'reduced' : 'full');
				O55.ui.applyLook(fam, mode);
			}, [...look.split('-'), motion]);
			await f.waitForTimeout(1600);
			await f.waitForFunction(() => !O55.nierLook.busy(), null, { timeout: 15000 }).catch(() => {});
			await f.evaluate(() => { O55.ui.go('look', { noHistory: true }); O55.nierLook.adjust(); });
			const opened = await f.waitForFunction(() => {
				const p = document.querySelector('#pm-o55-onboarding .o55-win > .o55-nierpanel');
				return !!p && O55.nierLook.panelOpen() && p.getBoundingClientRect().height > 100;
			}, null, { timeout: 10000 }).then(() => true, () => false);
			await t.check(`FO-81 editor open ${tag}`, opened, undefined, { hard: true });
			await f.evaluate(async () => { const p = document.querySelector('#pm-o55-onboarding .o55-nierpanel'); await Promise.all(p.getAnimations({ subtree: true }).filter((a) => Number.isFinite(a.effect.getComputedTiming().endTime)).map((a) => a.finished.catch(() => {}))); });
			await f.waitForTimeout(300);
			/* the header's Look button, by a real click, as a person opens it */
			await f.locator('#pm-o55-onboarding .o55-head .o55-lookbtn').click();
			const menuOpen = await f.waitForFunction(() => O55.S.lookOpen && !!document.querySelector('#pm-o55-onboarding .o55-lookslot .o55-lookmenu'), null, { timeout: 5000 }).then(() => true, () => false);
			await t.check(`FO-81 header Look menu opens over the editor ${tag}`, menuOpen, undefined, { hard: true });
			await f.evaluate(async () => { const m = document.querySelector('#pm-o55-onboarding .o55-lookmenu'); await Promise.all(m.getAnimations({ subtree: true }).filter((a) => Number.isFinite(a.effect.getComputedTiming().endTime)).map((a) => a.finished.catch(() => {}))); });
			const scan = await f.evaluate((ITEM) => {
				const menu = document.querySelector('#pm-o55-onboarding .o55-lookslot .o55-lookmenu');
				const name = (e) => !e ? null : e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/).join('.') : '');
				const layer = (e) => { const l = e && e.closest('.o55-nierpanel, .o55-body, .o55-head, .o55-toast, .o55fx-layer, .o55-win'); return l ? name(l).split('.').slice(0, 2).join('.') : name(e && e.ownerDocument.body); };
				/* what the menu shows: its padding box (it scrolls when the window is short), inside the viewport */
				const clip = () => { const r = menu.getBoundingClientRect(); return { l: Math.max(0, r.left + menu.clientLeft), t: Math.max(0, r.top + menu.clientTop), r: Math.min(innerWidth, r.left + menu.clientLeft + menu.clientWidth), b: Math.min(innerHeight, r.top + menu.clientTop + menu.clientHeight) }; };
				/* a pixel is the target's own (it or a part of it), or the menu's own chrome round it (a rounded corner shows the
				   menu's ground: no other control); anything else, inside the menu (another of its controls) or outside it (the
				   editor or any other window layer, interactive or not), is a pixel the target lost */
				const CONTROL = 'button, a[href], input, select, textarea, [role="button"], [role^="menuitem"], [tabindex]:not([tabindex="-1"])';
				const sweep = (owner, rect, kind, out) => {
					const c = clip(), l = Math.max(rect.l, c.l), tp = Math.max(rect.t, c.t), r = Math.min(rect.r, c.r), b = Math.min(rect.b, c.b);
					let n = 0, own = 0;
					for (let y = Math.floor(tp) + 0.5; y < b; y++) for (let x = Math.floor(l) + 0.5; x < r; x++) {
						if (x < l || y < tp) continue;
						n++;
						const hit = document.elementFromPoint(x, y);
						if (hit === owner || (hit && owner.contains(hit))) { own++; continue; }
						if (hit && menu.contains(hit) && !hit.closest(CONTROL)) { out.chrome++; continue; }
						const where = hit && menu.contains(hit) ? 'other' : 'outside';
						out[where]++;
						const k = name(hit); out.covers[k] = (out.covers[k] || 0) + 1;
						if (out.examples.length < 8) out.examples.push({ kind, where, owner: (owner.getAttribute('data-arg') || owner.textContent.trim()).slice(0, 40), x, y, cover: k, layer: layer(hit) });
					}
					/* most of a target is its own: a menu part over it would read as chrome */
					if (n < 40 || own < 0.9 * n) out.small.push({ kind, owner: owner.getAttribute('data-arg'), n, own });
					return n;
				};
				const out = { outside: 0, other: 0, chrome: 0, covers: {}, examples: [], items: 0, helps: 0, pixels: 0, small: [] };
				const box = (e) => { const b = e.getBoundingClientRect(); return { l: b.left, t: b.top, r: b.right, b: b.bottom }; };
				const items = [...menu.querySelectorAll(ITEM)], helps = [...menu.querySelectorAll('button.o55-tipq')];
				for (const e of items) {
					e.scrollIntoView({ block: 'nearest', inline: 'nearest' });
					out.pixels += sweep(e, box(e), 'option', out); out.items++;
				}
				for (const e of helps) {
					e.scrollIntoView({ block: 'nearest', inline: 'nearest' });
					/* its usable target: its own box and the transparent expansion FO-75 gave it (::before) */
					const b = e.getBoundingClientRect(), s = getComputedStyle(e), p = getComputedStyle(e, '::before');
					const px = b.x + parseFloat(s.borderLeftWidth) + (parseFloat(p.left) || 0), py = b.y + parseFloat(s.borderTopWidth) + (parseFloat(p.top) || 0);
					const ex = p.content !== 'none' && parseFloat(p.width) > 0 ? { l: Math.min(b.left, px), t: Math.min(b.top, py), r: Math.max(b.right, px + parseFloat(p.width)), b: Math.max(b.bottom, py + parseFloat(p.height)) } : box(e);
					out.pixels += sweep(e, ex, 'help', out); out.helps++;
				}
				menu.scrollTop = 0;
				const panel = document.querySelector('#pm-o55-onboarding .o55-nierpanel'), body = document.querySelector('#pm-o55-onboarding .o55-body');
				return { ...out, panel: !!panel, inert: !!body && body.hasAttribute('inert'), expanded: document.querySelector('#pm-o55-onboarding .o55-lookbtn').getAttribute('aria-expanded'), chosen: O55.theme().chosen, mode: O55.S.root.dataset.mode, nier: !!(window.PM_NIER && PM_NIER.on()), layout: O55.S.root.getAttribute('data-o55-layout') || 'wide' };
			}, ITEM);
			/* floors, not counts: five looks, Light and Dark (main has no Auto yet), a ? per look and one for the modes, and
			   Adjust NieR with its ? under NieR; the assertion is the ownership, so a missing control cannot make it vacuous */
			const [fam, mode] = look.split('-');
			await t.check(`FO-81 fixture is the look with the editor open ${tag}`, scan.panel && scan.inert && scan.expanded === 'true' && scan.chosen === fam && scan.mode === mode && scan.nier === (fam === 'nier'), JSON.stringify({ ...scan, covers: undefined, examples: undefined }));
			await t.check(`FO-81 every option and help pixel is the menu's own over the editor ${tag}`, scan.items >= (fam === 'nier' ? 8 : 7) && scan.helps >= (fam === 'nier' ? 7 : 6) && !scan.small.length && scan.outside === 0 && scan.other === 0, JSON.stringify({ items: scan.items, helps: scan.helps, pixels: scan.pixels, outside: scan.outside, other: scan.other, chrome: scan.chrome, covers: scan.covers, examples: scan.examples, small: scan.small }));
			if (t.args.shots ? list(t.args.shots, []).includes(look) : motion === 'no-preference' && look === 'nier-light' && w === 1920 && surface === 'normal') await t.crop(`${look}-${motion}-${surface}-${w}x${h}-menu-over-editor`, f.locator('#pm-o55-onboarding .o55-win'), 'FO-81: the header Look menu lies over the Adjust NieR editor (main: the editor covers it).');
			/* a real press at each option's and each help's centre reaches it (and nothing else hears it) */
			await f.evaluate(() => {
				window.__fo81 = []; window.__fo81Off?.();
				const on = (e) => { window.__fo81.push({ id: e.target.closest?.('.o55-lookmenu button')?.__fo81 ?? null, trusted: e.isTrusted, at: e.target.closest?.('.o55-lookmenu') ? 'menu' : (e.target.className?.baseVal ?? e.target.className ?? e.target.tagName) }); e.stopImmediatePropagation(); e.preventDefault(); };
				window.addEventListener('click', on, true); window.__fo81Off = () => window.removeEventListener('click', on, true);
				[...document.querySelectorAll('#pm-o55-onboarding .o55-lookmenu :is(.o55-lookopt, .o55-lookmodes button, button.o55-tipq)')].forEach((e, i) => { e.__fo81 = i; });
			});
			const targets = f.locator('#pm-o55-onboarding .o55-lookmenu :is(.o55-lookopt, .o55-lookmodes button, button.o55-tipq)'), misses = [];
			const count = await targets.count();
			for (let i = 0; i < count; i++) {
				const c = targets.nth(i);
				await c.evaluate((e) => e.scrollIntoView({ block: 'nearest', inline: 'nearest' }));
				const before = await f.evaluate(() => window.__fo81.length);
				const pt = await c.evaluate((e) => { const b = e.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; });
				const fe = f === t.page.mainFrame() ? null : await f.frameElement(), off = fe ? await fe.boundingBox() : { x: 0, y: 0 };
				await t.page.mouse.click(off.x + pt.x, off.y + pt.y);
				await f.waitForFunction((n) => window.__fo81.length > n, before, { timeout: 1000 }).catch(() => {});
				const got = await f.evaluate((n) => window.__fo81.slice(n), before);
				if (got.length !== 1 || got[0].id !== i || !got[0].trusted) misses.push({ i, got });
			}
			await f.evaluate(() => { window.__fo81Off?.(); window.__fo81Off = null; });
			await t.check(`FO-81 a real press on each option and help reaches it over the editor ${tag}`, count >= (fam === 'nier' ? 15 : 13) && !misses.length, JSON.stringify({ count, misses: misses.slice(0, 6) }));
			/* both stay open, the menu on top, as the product layers them: a press in the editor closes the menu as any press
			   outside it does; Adjust NieR in the menu gives way to the editor already open; Escape closes the menu, then
			   the editor, then (not tried here) the window */
			const st = () => f.evaluate(() => ({ menu: !!O55.S.lookOpen && !!document.querySelector('#pm-o55-onboarding .o55-lookmenu'), panel: O55.nierLook.panelOpen(), win: !!O55.S.open, focus: document.activeElement?.matches('.o55-lookbtn') ? 'look' : document.activeElement?.matches('.o55-nierpanel-h') ? 'heading' : document.activeElement?.className || document.activeElement?.tagName }));
			const click = async (pt) => {
				const fe = f === t.page.mainFrame() ? null : await f.frameElement(), off = fe ? await fe.boundingBox() : { x: 0, y: 0 };
				await t.page.mouse.click(off.x + pt.x, off.y + pt.y); await f.waitForTimeout(250);
			};
			const centre = (sel) => f.locator(sel).first().evaluate((e) => { e.scrollIntoView({ block: 'nearest', inline: 'nearest' }); const b = e.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; });
			/* a point of the editor the open menu does not cover (the menu lies over part of the editor's head where the
			   header's controls sit far enough left: NieR at 1024 and 740) */
			const inEditor = () => f.evaluate(() => {
				const p = document.querySelector('#pm-o55-onboarding .o55-nierpanel'), h = p.querySelector('.o55-nierpanel-h').getBoundingClientRect(), y = h.top + h.height / 2;
				for (let x = p.getBoundingClientRect().left + 8; x < h.right; x += 6) { const e = document.elementFromPoint(x, y); if (e && p.contains(e) && !e.closest('button, a[href], input, select, textarea')) return { x, y }; }
				return null;
			});
			try {
				const at = await inEditor();
				await t.check(`FO-81 the editor shows beside the open menu ${tag}`, !!at, JSON.stringify(at), { hard: false });
				if (at) {
					await click(at);
					const s1 = await st();
					await t.check(`FO-81 a press in the editor closes the menu and keeps the editor ${tag}`, !s1.menu && s1.panel && s1.win, JSON.stringify({ at, ...s1 }));
				}
				if (!(await st()).menu) { await f.locator('#pm-o55-onboarding .o55-head .o55-lookbtn').click(); await f.waitForTimeout(250); }
				if (fam === 'nier') {
					await click(await centre('#pm-o55-onboarding .o55-lookmenu .o55-looknier-adjust'));
					const s2 = await st();
					await t.check(`FO-81 Adjust NieR in the menu gives way to the open editor ${tag}`, !s2.menu && s2.panel && s2.focus === 'heading', JSON.stringify(s2));
					if (!(await st()).menu) { await f.locator('#pm-o55-onboarding .o55-head .o55-lookbtn').click(); await f.waitForTimeout(250); }
				}
				const s3a = await st();
				await t.page.keyboard.press('Escape'); await f.waitForTimeout(250);
				const s3 = await st();
				await t.check(`FO-81 Escape closes the menu first and keeps the editor ${tag}`, s3a.menu && !s3.menu && s3.panel && s3.win && s3.focus === 'look', JSON.stringify({ before: s3a, after: s3 }));
				await t.page.keyboard.press('Escape'); await f.waitForTimeout(250);
				const s4 = await st();
				await t.check(`FO-81 a second Escape closes the editor and keeps the window ${tag}`, !s4.menu && !s4.panel && s4.win, JSON.stringify(s4));
			} catch (e) {
				/* a step that cannot run fails here, and the next look starts clean */
				await t.check(`FO-81 menu and editor order runs ${tag}`, false, String(e && e.message || e).split('\n')[0]);
			}
		}
	}
	await f.evaluate(() => { O55.nierLook.closePanel({ silent: true }); O55.S.lookOpen = false; document.documentElement.setAttribute('data-motion', 'full'); });
	await t.emulate({ reducedMotion: 'no-preference' });
}

export const tests = {};
for (const surface of ['normal', 'sandbox']) for (const [w, h] of SIZES) {
	tests[`FO-81 menu over editor ${surface} ${w}x${h}`] = async (t) => {
		if (t.args.size && !list(t.args.size, []).includes(`${w}x${h}`)) { t.log(`skipped: --set size leaves out ${w}x${h}`); return; }
		return cell(t, surface, w, h);
	};
}
