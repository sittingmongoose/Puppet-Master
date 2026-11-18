// R117 P4: ordinary exit and transparent tools lose hit-testing immediately.
import { muteSound } from '../helpers/quiet-page.mjs';

export const tests = {
	async 'R117 tool hit-testing is retained only for a visible wheel fade'(t) {
		await t.viewport(1920, 1080);
		await muteSound(t.page);
		for (const surface of t.app.surfaces()) {
			const f = await t.app.open({ query: 'pm-warm=0', sandbox: surface === 'sandbox' });
			await t.app.look('basic-dark');
			await f.evaluate(() => { PMU.live.pause(); PM_PAGES.go('usage'); PM7_USAGE.setRoomDetail('overview', 'glance'); });
			const park = () => t.page.mouse.move(1914, 540);
			for (const [route, selector] of [
				['Usage exit', '#pmuBoard .pmu-card[data-widget="health"]'],
				['Usage transparent wheel', '#pmuBoard .pmu-card[data-widget="health"]'],
				['Home exit', '#panel-dashboard .pmu-card[data-widget="health"]'],
			]) {
				const S = `[${surface}] R117 ${route}: `, zero = route === 'Usage transparent wheel';
				await park();
				if (route === 'Home exit') await f.evaluate(() => { PM_PAGES.go('dashboard'); PM_HOME.open({ id: 'dashboard:home', kind: 'dashboard', board: 'home', mode: 'keep' }); });
				const card = f.locator(selector).first();
				await card.scrollIntoViewIfNeeded();
				await f.evaluate(() => document.activeElement?.blur());
				await f.waitForFunction((sel) => {
					const tools = document.querySelector(sel)?.querySelector('.pmu-cardtools');
					return tools && getComputedStyle(tools).opacity === '0' && getComputedStyle(tools).pointerEvents === 'none';
				}, selector);
				const cardBox = await card.boundingBox(), viewport = await f.locator(route === 'Home exit' ? '#panel-dashboard' : '#pmuScroll').boundingBox();
				const at = [cardBox.x + cardBox.width / 2, (Math.max(cardBox.y, viewport.y) + Math.min(cardBox.y + cardBox.height, viewport.y + viewport.height)) / 2];
				const hidden = await card.evaluate((el, zero) => {
					const tools = el.querySelector('.pmu-cardtools'), b = el.closest('.pmu-board');
					const sc = document.getElementById('pmuScroll');
					const read = () => {
						const cs = getComputedStyle(tools), btn = tools.querySelector('.pmu-cardmenu'), box = btn.getBoundingClientRect();
						return { opacity: +cs.opacity, pointer: cs.pointerEvents, hover: el.matches(':hover'), op: b.getAttribute('data-op'),
							hit: btn.contains(document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)),
							home: el.closest('[data-pmu-host]')?.getAttribute('data-pmu-host') ?? null,
							headTools: !!el.querySelector('.pmu-headtools:not(:empty)') };
					};
					const r = window.__r117Tools = { samples: [] };
					const wheel = (e) => { r.pre = read(); r.wheel = { trusted: e.isTrusted, over: el.contains(e.target) }; };
					const afterWheel = () => { r.samples.push(read()); };
					const move = (e) => {
						if (!r.pre || !e.isTrusted || el.contains(e.target)) return;
						r.samples.push(read());
						requestAnimationFrame(() => r.samples.push(read()));
					};
					if (zero) { sc.addEventListener('wheel', wheel, { capture: true, passive: true }); sc.addEventListener('wheel', afterWheel, { passive: true }); }
					else document.addEventListener('pointermove', move);
					r.arm = () => { r.pre = read(); };
					r.stop = () => {
						sc.removeEventListener('wheel', wheel, true); sc.removeEventListener('wheel', afterWheel); document.removeEventListener('pointermove', move);
						return { ...r, arm: undefined, stop: undefined };
					};
					return read();
				}, zero);
				if (zero) {
					// Queue the trusted move and wheel together so input acknowledgments do not consume the 160 ms entry delay.
					const cdp = await t.page.context().newCDPSession(t.page);
					try {
						const [x, y] = at;
						await Promise.all([
							cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y }),
							cdp.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x, y, deltaX: 40, deltaY: 0 }),
						]);
					} finally { await cdp.detach(); }
				} else {
					await t.page.mouse.move(...at);
					await f.waitForFunction((sel) => {
						const tools = document.querySelector(sel)?.querySelector('.pmu-cardtools');
						return tools && getComputedStyle(tools).opacity === '1';
					}, selector);
					await f.evaluate(() => window.__r117Tools.arm());
					await park();
				}
				await t.page.waitForTimeout(250);
				const rec = await f.evaluate(() => window.__r117Tools.stop()), first = rec.samples[0], pre = rec.pre;
				const qualified = hidden.opacity === 0 && hidden.pointer === 'none' && pre?.hover && !pre.op && !!first &&
					(route !== 'Home exit' || first.home === 'home') &&
					(zero ? pre.headTools && pre.opacity === 0 && rec.wheel?.trusted && rec.wheel.over && first.op === 'wheel' :
						pre.opacity > 0.95 && pre.hit && !first.hover && !first.op && first.opacity > 0);
				await t.check(S + 'could judge the tool state immediately after trusted input', qualified, JSON.stringify({ hidden, rec }));
				await t.check(S + 'the tools immediately stop taking hits', first?.pointer === 'none' && !first.hit, JSON.stringify(rec));
			}
		}
	},
};
