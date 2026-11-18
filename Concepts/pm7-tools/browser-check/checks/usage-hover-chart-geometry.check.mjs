// R117 P3: a stationary pane and pointer keep the chart tooltip anchor and its hover geometry.
import { muteSound } from '../helpers/quiet-page.mjs';

export const tests = {
	async 'R117 wheel keeps chart tooltip hit geometry'(t) {
		await t.viewport(1920, 1080);
		await muteSound(t.page);
		for (const surface of t.app.surfaces()) {
			const f = await t.app.open({ query: 'pm-warm=0', sandbox: surface === 'sandbox' });
			await t.app.look('basic-dark');
			await f.evaluate(() => {
				PMU.live.pause(); PM_PAGES.go('usage');
				PM12_KIMI.setSettingFromHost('general.interaction.show-tooltips', true);
				PM_HOVER_TAG_CONTROLLER.syncVisualSetting();
			});
			for (const [room, selector, z] of [
				['analytics', '.pmu-hc[data-r="2"][data-c="5"]', '1'],
				['ledger', '.pmu-atdot', '2'],
			]) {
				const S = `[${surface}] R117 ${room} geometry: `;
				await t.page.mouse.move(1914, 540);
				await f.evaluate((r) => PM7_USAGE.setRoomDetail(r, 'diagnostics'), room);
				await f.waitForFunction(() => !document.querySelector('#pmuScroll .pmu-ghostboard'));
				const marks = f.locator('#pmuBoard ' + selector);
				await marks.first().scrollIntoViewIfNeeded();
				await t.page.waitForTimeout(300);
				// Choose a mark whose center actually takes hits. Ledger dots can overlap.
				const index = await marks.evaluateAll((els) => els.findIndex((el) => {
					const r = el.getBoundingClientRect();
					return document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) === el;
				}));
				if (index < 0) { await t.check(S + 'could judge a hit-tested tooltip mark', false); continue; }
				const mark = marks.nth(index), base = await mark.boundingBox();
				await t.page.mouse.move(base.x + base.width / 2, base.y + base.height / 2);
				await t.page.waitForTimeout(350);
				const hovered = await mark.boundingBox();
				if (room === 'analytics') {
					// The enlarged band below the natural cell is about one pixel tall.
					await t.page.mouse.move(hovered.x + hovered.width / 2, (base.y + base.height + hovered.y + hovered.height) / 2);
				}
				await t.page.waitForTimeout(1900); // The pointer tooltip's ordinary dwell is 1600 ms.
				await mark.evaluate((el) => {
					const sc = document.getElementById('pmuScroll'), b = document.getElementById('pmuBoard'), tips = PM_HOVER_TAG_CONTROLLER;
					const state = (point) => {
						const cs = getComputedStyle(el);
						return { top: sc.scrollTop, left: sc.scrollLeft, hover: el.matches(':hover'),
							label: el.getAttribute('data-pm-hover-label'), z: cs.zIndex, pos: cs.position, transform: cs.transform,
							tips: tips.active === el && tips.tag?.getAttribute('data-open') === 'true',
							hit: point && document.elementFromPoint(...point) === el, op: b.getAttribute('data-op') };
					};
					const r = window.__r117Geometry = { pre: state(), wheel: null, held: [] };
					let frame;
					const wheel = (e) => {
						const point = [e.clientX, e.clientY];
						r.wheel = { trusted: e.isTrusted, hit: e.target === el, dx: e.deltaX, dy: e.deltaY, point };
						const sample = () => {
							const st = state(point);
							if (st.op === 'wheel') { r.held.push(st); frame = requestAnimationFrame(sample); }
						};
						sample();
					};
					sc.addEventListener('wheel', wheel, { passive: true });
					r.stop = () => { cancelAnimationFrame(frame); sc.removeEventListener('wheel', wheel); return { ...r, stop: undefined, after: state() }; };
				});
				await t.page.mouse.wheel(40, 0);
				await t.page.waitForTimeout(400);
				const rec = await f.evaluate(() => window.__r117Geometry.stop());
				const { pre, wheel, held, after } = rec;
				const outside = room !== 'analytics' || hovered.height > base.height && held.length > 0;
				await t.check(S + 'could judge a trusted wheel over a shown tooltip without pane travel',
					outside && pre.hover && pre.label && pre.z === z && pre.tips && wheel?.trusted && wheel.hit &&
					wheel.dx !== 0 && wheel.dy === 0 && held.length >= 2 && after.top === pre.top && after.left === pre.left, JSON.stringify(rec));
				await t.check(S + 'hovered anchor retains its hit, tooltip and geometry through the wheel pause',
					held.length >= 2 && held.every((x) => x.hit && x.tips && x.z === pre.z &&
						x.pos === pre.pos && x.transform === pre.transform && x.top === pre.top && x.left === pre.left), JSON.stringify(rec));
			}
		}
	},
};
