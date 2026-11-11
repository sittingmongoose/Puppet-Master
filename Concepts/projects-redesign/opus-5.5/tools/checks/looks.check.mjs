// The new parts in three looks and at narrow widths, and A, B and Today still mount with no console error.
const LOOKS = ['basic-dark', 'retro-light', 'nier-dark'];
export const tests = {
	async 'looks and widths: Where work runs and the no-project chat'(t) {
		const f = await t.app.open(t);
		for (const look of LOOKS) {
			await t.step(look, async () => {
				await t.app.look(t, look);
				for (const width of ['', '1024', '860']) {
					await t.page.selectOption('#width', width);
					await t.page.waitForTimeout(500);
					await t.app.page(t, f, 'projects');
					if (!(await f.evaluate(() => { const r = document.querySelector('#pjxc .pjxc-row[data-pid="tastebook"]'); return !!(r && r.getBoundingClientRect().width > 0 && r.offsetParent); }))) await t.app.click(t, f, '[data-c-key="h:projects"]', { wait: 400 });
					await t.app.click(t, f, '#pjxc .pjxc-row[data-pid="tastebook"]', { wait: 400 });
					// scroll only the Project page's own scroller: the app shell itself never scrolls
					await f.evaluate(() => { const el = document.querySelector('[data-plate="work"]'), sc = el && el.closest('.pjxc-scroll'); if (sc) sc.scrollTop += el.getBoundingClientRect().top - sc.getBoundingClientRect().top - 40; document.documentElement.scrollTop = 0; document.body.scrollTop = 0; });
					await t.page.waitForTimeout(250);
					const w = width || 'full';
					await t.check(`${look} ${w}: work plate present`, await f.evaluate(() => !!document.querySelector('[data-plate="work"] .pjx-wk-rows')));
					const clip = await f.evaluate(() => Array.from(document.querySelectorAll('[data-plate="work"] .pmu-factv, [data-plate="work"] .pjx-wk-to, [data-plate="work"] .pjx-wk-why, [data-plate="work"] .pjx-wk-pin')).filter((e) => e.scrollWidth > e.clientWidth + 1).map((e) => e.textContent).join(' | '));
					await t.check(`${look} ${w}: nothing in the work plate is cut off`, !clip, clip);
					// an off Run this on… (started work) never wears a live link's ink or underline
					const pins = await f.evaluate(() => { const st = (k) => { const e = document.querySelector('[data-plate="work"] [data-c-key="' + k + '"]'); if (!e) return null; const c = getComputedStyle(e); return { off: e.getAttribute('aria-disabled'), color: c.color, line: c.textDecorationLine }; }; return { off: st('wk:pin:0'), live: st('wk:pin:3') }; });
					await t.check(`${look} ${w}: an off Run this on… looks off`, !!(pins.off && pins.live && pins.off.off === 'true' && pins.live.off === null && pins.off.color !== pins.live.color && pins.off.line === 'none' && pins.live.line !== 'none'), JSON.stringify(pins));
					if (width !== '1024') await t.crop(`work-${look}-${w}`, f.locator('[data-plate="work"]'), `Where work runs, ${look}, ${w}`);
					await t.app.page(t, f, 'dashboard');
					// (B-press) the New thread split's chevron lives in the layer's own host now: it keeps its place (one gap less
					// 6 px after New thread, the title one gap plus 6 px after it, centred in the header, on top) and New
					// thread's own look (colour, fill, corners, border, height, glyph)
					if (width === '') {
						const sp = await f.evaluate(() => {
							const head = document.querySelector('#pmRoot .chat-stage > .chat-header'), nt = head && head.querySelector(':scope > [data-action="new-thread"]');
							const ch = document.querySelector('#pmw-chat56 .chat-header .pjx-newsplit'), title = head && head.querySelector(':scope > .chat-title');
							if (!head || !nt || !ch || !title) return { missing: [!!head, !!nt, !!ch, !!title] };
							const st = (e) => { const s = getComputedStyle(e), svg = e.querySelector('svg'), sb = svg && svg.getBoundingClientRect(); return [s.color, s.backgroundColor, s.borderTopLeftRadius, s.borderTopWidth + ' ' + s.borderTopStyle + ' ' + s.borderTopColor, s.opacity, Math.round(e.getBoundingClientRect().height), sb ? Math.round(sb.width) + 'x' + Math.round(sb.height) : '-'].join(' | '); };
							const gap = parseFloat(getComputedStyle(head).columnGap) || 0, n = nt.getBoundingClientRect(), c = ch.getBoundingClientRect(), tt = title.getBoundingClientRect(), hb = head.getBoundingClientRect();
							const hit = document.elementFromPoint(c.left + c.width / 2, c.top + c.height / 2);
							return { after: Math.round(c.left - n.right - (gap - 6)), title: Math.round(tt.left - c.right - (gap + 6)), mid: Math.round((c.top + c.height / 2) - (hb.top + hb.height / 2)), w: Math.round(c.width), same: st(ch) === st(nt), ch: st(ch), nt: st(nt), onTop: !!hit && ch.contains(hit) };
						});
						await t.check(`${look} ${w}: the New thread chevron keeps its place and New thread's look`, !sp.missing && Math.abs(sp.after) <= 1 && Math.abs(sp.title) <= 1 && Math.abs(sp.mid) <= 1 && sp.w === 18 && sp.same && sp.onTop, JSON.stringify(sp));
					}
					await t.app.click(t, f, '#projectMenuBtn', { noScroll: true });
					await t.app.click(t, f, '#projectMenu .pjx-tb-noproj', { noScroll: true, wait: 300 });
					// the chat column may still be opening: measure once its width holds still. (B-press) The wait and the reading are
					// one call in the page, so what is measured is the header that held still; the redraw that could leave the chat
					// without a header between two calls is fixed in the layer and checked by press.check.mjs
					const hd = await f.evaluate(() => new Promise((res) => {
						const t0 = performance.now(); let last = -1;
						const measure = (hdr) => { const r = hdr.getBoundingClientRect(); return Array.from(hdr.children).filter((c) => { const b = c.getBoundingClientRect(); return b.width > 0 && (b.right > r.right + 1 || b.left < r.left - 1); }).map((c) => c.className).join(','); };
						const tick = () => {
							const hdr = document.querySelector('.pjx-npc .pjx-npc-head'), wd = hdr ? hdr.getBoundingClientRect().width : -1;
							if (hdr && wd > 0 && Math.abs(wd - last) < 0.5) return res(measure(hdr));
							if (performance.now() - t0 > 8000) return res(hdr ? measure(hdr) : 'no header');
							last = wd; setTimeout(tick, 250);
						};
						tick();
					}));
					await t.check(`${look} ${w}: the no-project chat header fits`, !hd, hd);
					// (B-press) the chat lies exactly over the chat stage, under a host that carries the page's look
					if (width === '') {
						const box = await f.evaluate(() => {
							const st = document.querySelector('#pmRoot .chat-stage'), npc = document.querySelector('.pjx-npc'); if (!st || !npc) return { missing: true };
							const a = st.getBoundingClientRect(), b = npc.getBoundingClientRect(), host = npc.closest('.pm56-host'), root = document.getElementById('pmRoot');
							return { d: [b.left - a.left, b.top - a.top, b.width - a.width, b.height - a.height].map(Math.round), theme: host && host.getAttribute('data-theme'), pageTheme: root && root.getAttribute('data-theme') };
						});
						await t.check(`${look} ${w}: the no-project chat lies over the chat stage and carries the page's look`, !box.missing && box.d.every((x) => Math.abs(x) <= 1) && !!box.theme && box.theme === box.pageTheme, JSON.stringify(box));
					}
					if (width === '') await t.crop(`npc-${look}`, f.locator('#pmw-chat56 .chat-stage'), `No-project chat, ${look}`);
					await f.evaluate(() => window.PJX.chat.close());
				}
				await t.page.selectOption('#width', '');
			});
		}
	},
	async 'light looks: the chosen library row’s second line is readable'(t) {
		const f = await t.app.open(t);
		for (const look of ['basic-light', 'friendly-light', 'glass-light', 'retro-light', 'nier-light']) {
			await t.app.look(t, look);
			await t.app.page(t, f, 'projects');
			await t.app.click(t, f, '#pjxc .pjxc-row[data-pid="tastebook"]', { wait: 300 });
			const r = await f.evaluate(() => {
				const row = document.querySelector('#pjxc .pjxc-row[aria-current="true"]'), line = row && row.querySelector('.pjxc-row-line');
				if (!line) return { err: 'no chosen row' };
				// rgb()/rgba(), and color(srgb …) (how a color-mix fill is serialised)
				const rgba = (c) => { let m = String(c).match(/rgba?\(([^)]+)\)/); if (m) { const v = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r: v[0], g: v[1], b: v[2], a: v.length > 3 ? v[3] : 1 }; }
					m = String(c).match(/color\(srgb ([^)]+)\)/); if (m) { const v = m[1].split(/[ /]+/).filter(Boolean).map(Number); return { r: v[0] * 255, g: v[1] * 255, b: v[2] * 255, a: v.length > 3 ? v[3] : 1 }; } return null; };
				const over = (top, bot) => ({ r: top.r * top.a + bot.r * (1 - top.a), g: top.g * top.a + bot.g * (1 - top.a), b: top.b * top.a + bot.b * (1 - top.a), a: 1 });
				// what lies under the row: the first opaque background above it
				let base = { r: 255, g: 255, b: 255, a: 1 }, x = row.parentElement;
				while (x) { const c = rgba(getComputedStyle(x).backgroundColor); if (c && c.a > 0.95) { base = c; break; } x = x.parentElement; }
				// the selection as the row actually paints it: its background colour, then its solid linear layers, bottom up
				const cs = getComputedStyle(row);
				const layers = (cs.backgroundImage.match(/linear-gradient\((rgba?\([^)]*\)|color\([^)]*\))/g) || []).map((x) => rgba(x.replace(/^linear-gradient\(/, ''))).filter(Boolean).reverse();
				let bg = over(rgba(cs.backgroundColor) || { r: 0, g: 0, b: 0, a: 0 }, base);
				layers.forEach((c) => { bg = over(c, bg); });
				const fg = over(rgba(getComputedStyle(line).color), bg);
				const L = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
				const a = L(fg), b = L(bg);
				return { ratio: Math.round(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)) * 100) / 100, fg: getComputedStyle(line).color, bg: 'rgb(' + [bg.r, bg.g, bg.b].map(Math.round).join(',') + ')', text: line.textContent };
			});
			await t.check(`${look}: chosen row second line contrast ≥ 4.5`, r.ratio >= 4.5, JSON.stringify(r));
			await t.crop(`chosen-row-${look}`, f.locator('#pjxc .pjxc-row[aria-current="true"]'), `The chosen library row in ${look}`);
		}
	},
	async 'A, B and Today still mount'(t) {
		await t.app.open(t);
		await t.page.click('#moreAB');
		for (const opt of ['a', 'b', 'before', 'c']) {
			await t.page.click(`#opt button[data-opt="${opt}"]`);
			await t.page.waitForTimeout(700);
		}
		const f = t.app.frame(t);
		await t.check('back on C', await f.evaluate(() => !!document.querySelector('#pjxc')));
	}
};
