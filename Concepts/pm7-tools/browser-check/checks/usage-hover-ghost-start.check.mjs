// R117 P2: swap first, then wheel while the outgoing room still receives the pointer hit.
import { muteSound } from '../helpers/quiet-page.mjs';

export const tests = {
	async 'R117 wheel starts over the outgoing board'(t) {
		await t.viewport(1920, 1080);
		await muteSound(t.page);
		for (const surface of t.app.surfaces()) {
			const S = `[${surface}] R117 outgoing wheel: `;
			const f = await t.app.open({ query: 'pm-warm=0', sandbox: surface === 'sandbox' });
			await t.app.look('basic-dark');
			await f.evaluate(() => { PMU.live.pause(); PM_PAGES.go('usage'); });
			const nav = (room) => f.locator(`#pmuNav .pmu-navbtn[data-room="${room}"]`);
			const scroller = f.locator('#pmuScroll');
			const target = f.locator('#pmuBoard .pmu-skycol[data-prov]').first();
			let rec;
			for (let i = 0; i < 3; i++) {
				await t.page.mouse.move(1914, 540);
				await nav('overview').focus();
				await t.page.keyboard.press('Enter');
				await f.waitForFunction(() => document.getElementById('pmuBoard')?.dataset.room === 'overview' &&
					!document.querySelector('#pmuScroll .pmu-ghostboard'));
				await target.waitFor({ state: 'visible' });
				const box = await target.boundingBox(), pane = await scroller.boundingBox();
				const neutral = await target.locator('.pmu-skytrack').evaluate((el) => getComputedStyle(el).boxShadow);
				await nav('accounts').focus();
				await t.page.mouse.move(box.x + box.width / 2, (Math.max(box.y, pane.y) + Math.min(box.y + box.height, pane.y + pane.height)) / 2);
				await t.page.waitForTimeout(350);
				await f.evaluate((neutral) => {
					const sc = document.getElementById('pmuScroll'), old = document.getElementById('pmuBoard');
					const track = old.querySelector('.pmu-skycol:hover .pmu-skytrack');
					const state = () => ({ shadow: track && getComputedStyle(track).boxShadow, liveOp: document.getElementById('pmuBoard').getAttribute('data-op'),
						ghost: old.matches('.pmu-ghostboard'), alpha: +getComputedStyle(old).opacity, hover: !!track?.closest('.pmu-skycol').matches(':hover'), top: sc.scrollTop });
					const r = window.__r117Ghost = { neutral, pre: state(), wheels: [] };
					const capture = (e) => {
						const hit = document.elementFromPoint(e.clientX, e.clientY);
						r.wheels.push({ ...state(), trusted: e.isTrusted, hitOld: hit?.closest('.pmu-board') === old,
							hitSkyline: hit?.closest('.pmu-skycol') === track?.closest('.pmu-skycol') });
					};
					const scroll = () => { if (r.wheels.length && sc.scrollTop !== r.wheels[0].top) r.after ??= state(); };
					sc.addEventListener('wheel', capture, { capture: true, passive: true });
					sc.addEventListener('scroll', scroll, { passive: true });
					r.stop = () => {
						sc.removeEventListener('wheel', capture, true); sc.removeEventListener('scroll', scroll);
						return { ...r, stop: undefined };
					};
				}, neutral);
				await t.page.keyboard.press('Enter');
				await t.page.mouse.wheel(0, 1);
				await t.page.waitForTimeout(250);
				rec = await f.evaluate(() => window.__r117Ghost.stop());
				const hit = rec.wheels[0];
				if (rec.wheels.length === 1 && hit.trusted && hit.ghost && hit.hitOld && hit.hitSkyline &&
					hit.alpha > 0.1 && hit.hover && hit.shadow === rec.pre.shadow && !hit.liveOp &&
					rec.pre.hover && rec.pre.shadow !== rec.neutral && rec.after?.liveOp === 'wheel') break;
				t.log(S + 'unqualified input ' + JSON.stringify(rec));
				rec = null;
			}
			await t.check(S + 'trusted wheel hit the visibly hovered outgoing Skyline and moved the pane', !!rec, JSON.stringify(rec));
			await t.check(S + 'the outgoing Skyline outline is suppressed on the first real scroll',
				rec?.after?.ghost && rec.after.hover && rec.after.shadow === rec.neutral, JSON.stringify(rec));
		}
	},
};
