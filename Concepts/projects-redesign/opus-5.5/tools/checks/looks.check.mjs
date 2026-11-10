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
					await f.evaluate(() => { window.PM_PAGES.go('projects'); window.PJX.split.select('tastebook'); });
					await t.page.waitForTimeout(400);
					await f.evaluate(() => { const el = document.querySelector('[data-plate="work"]'); if (el) el.scrollIntoView({ block: 'center' }); });
					await t.page.waitForTimeout(250);
					const w = width || 'full';
					await t.check(`${look} ${w}: work plate present`, await f.evaluate(() => !!document.querySelector('[data-plate="work"] .pjx-wk-rows')));
					const clip = await f.evaluate(() => Array.from(document.querySelectorAll('[data-plate="work"] .pmu-factv, [data-plate="work"] .pjx-wk-to, [data-plate="work"] .pjx-wk-why')).filter((e) => e.scrollWidth > e.clientWidth + 1).map((e) => e.textContent).join(' | '));
					await t.check(`${look} ${w}: nothing in the work plate is cut off`, !clip, clip);
					if (width !== '1024') await t.crop(`work-${look}-${w}`, f.locator('[data-plate="work"]'), `Where work runs, ${look}, ${w}`);
					await f.evaluate(() => { window.PM_PAGES.go('dashboard'); window.PJX.chat.openChat('chat-printer'); });
					// the chat column may still be opening: measure once its width holds still
					await f.waitForFunction(() => new Promise((res) => { const e = document.querySelector('.pjx-npc-head'); if (!e) return res(false); const a = e.getBoundingClientRect().width; setTimeout(() => res(a > 0 && Math.abs(e.getBoundingClientRect().width - a) < 0.5), 250); }), null, { timeout: 8000 }).catch(() => {});
					const hd = await f.evaluate(() => { const hdr = document.querySelector('.pjx-npc .pjx-npc-head'); if (!hdr) return 'no header'; const r = hdr.getBoundingClientRect(); const out = Array.from(hdr.children).filter((c) => { const b = c.getBoundingClientRect(); return b.width > 0 && (b.right > r.right + 1 || b.left < r.left - 1); }).map((c) => c.className); return out.join(','); });
					await t.check(`${look} ${w}: the no-project chat header fits`, !hd, hd);
					if (width === '') await t.crop(`npc-${look}`, f.locator('#pmw-chat56 .chat-stage'), `No-project chat, ${look}`);
					await f.evaluate(() => window.PJX.chat.close());
				}
				await t.page.selectOption('#width', '');
			});
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
