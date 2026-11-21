// R117 P4: ordinary exit and transparent tools lose hit-testing immediately.
import { setTimeout as delay } from 'node:timers/promises';
import { muteSound } from '../helpers/quiet-page.mjs';

export function interruptedFadeQualifies(wheel, down, fadeDuration) {
	// The press must land while a full-duration hit delay would still be active.
	return wheel?.trusted && wheel.hover && wheel.hit && wheel.op === null && wheel.opacity > 0 && wheel.opacity <= 0.6 &&
		down?.trusted && down.hover && down.overMenu && !down.returned && down.top > wheel.top && down.op === 'wheel' && down.opacity === 0 &&
		down.t > wheel.t && down.t < wheel.t + fadeDuration;
}

export const tests = {
	async 'R122 interrupted tool fade drops hits by zero opacity'(t) {
		await t.viewport(1920, 1080);
		await t.emulate({ reducedMotion: 'no-preference' });
		await muteSound(t.page);
		for (const surface of t.app.surfaces()) {
			const S = `[${surface}] R122 interrupted tool fade: `;
			const f = await t.app.open({ query: 'pm-warm=0', sandbox: surface === 'sandbox' });
			await t.app.look('basic-dark');
			await f.evaluate(() => {
				PM12_KIMI.setSettingFromHost('general.visual.animation-speed', 'Cinematic');
				PMU.live.pause(); PM_PAGES.go('usage'); PM7_USAGE.setRoomDetail('overview', 'glance');
			});
			await f.waitForFunction(() => document.getElementById('pmuBoard')?.dataset.room === 'overview' &&
				!document.querySelector('#pmuScroll .pmu-ghostboard') && !document.documentElement.hasAttribute('data-pmu-moment'));
			const card = f.locator('#pmuBoard .pmu-card[data-widget="health"]');
			const menu = card.locator('.pmu-cardmenu');
			await t.page.mouse.move(1914, 540);
			await card.scrollIntoViewIfNeeded();
			await t.page.waitForTimeout(500);
			const plate = await card.boundingBox();
			await t.page.mouse.move(plate.x + plate.width / 2, plate.y + plate.height / 2);
			await f.waitForFunction(() => getComputedStyle(document.querySelector('#pmuBoard [data-widget="health"] .pmu-cardtools')).opacity === '1');
			const fadeDuration = await menu.evaluate((btn) => parseFloat(getComputedStyle(btn.closest('.pmu-cardtools')).transitionDuration) * 1000);
			const attempts = [];
			let qualified = false, down;
			const targetEntryMs = 16;
			let lead = 0;
			const cdp = await t.page.context().newCDPSession(t.page);
			try {
				for (let trial = 0; trial < 6; trial++) {
					await t.page.mouse.move(1914, 540);
					await f.waitForFunction(() => {
						const board = document.getElementById('pmuBoard');
						const tools = board.querySelector('[data-widget="health"] .pmu-cardtools');
						const sc = document.getElementById('pmuScroll');
						return !board.hasAttribute('data-op') && !board.hasAttribute('data-wheel-handoff') &&
							getComputedStyle(tools).opacity === '0' && sc.scrollHeight - sc.clientHeight > sc.scrollTop + 2;
					});
					const box = await menu.boundingBox();
					const x = Math.round(box.x + box.width / 2), y = Math.round(box.y + box.height / 2);
					await menu.evaluate((btn) => {
						const tools = btn.closest('.pmu-cardtools'), card = btn.closest('.pmu-card');
						const board = card.parentElement, sc = document.getElementById('pmuScroll');
						const opacity = () => +getComputedStyle(tools).opacity;
						const entryTime = () => {
							const fade = tools.getAnimations().find((animation) => animation.transitionProperty === 'opacity');
							return typeof fade?.currentTime === 'number' ? fade.currentTime - fade.effect.getTiming().delay : null;
						};
						const read = (e) => {
							const t = performance.now();
							const box = btn.getBoundingClientRect();
							const style = getComputedStyle(tools);
							return { trusted: e.isTrusted, t, top: sc.scrollTop,
								op: board.getAttribute('data-op'), opacity: +style.opacity, pointer: style.pointerEvents,
								hit: btn.contains(e.target), hover: card.matches(':hover'), point: [e.clientX, e.clientY],
								overMenu: e.clientX >= box.left && e.clientX < box.right && e.clientY >= box.top && e.clientY < box.bottom };
						};
						const r = window.__r122ToolFade = {};
						const wait = (predicate, ms) => new Promise((resolve) => {
							const until = performance.now() + ms;
							const sample = () => {
								const value = predicate();
								if (value) resolve(value);
								else if (performance.now() >= until) resolve(null);
								else requestAnimationFrame(sample);
							};
							sample();
						});
						const wheel = (e) => { r.wheel = { ...read(e), entryMs: entryTime() }; };
						const down = (e) => { r.down = { ...read(e), returned: !!r.returned }; };
						const end = (e) => { if (r.wheel && e.detail?.board === board) r.returned = true; };
						sc.addEventListener('wheel', wheel, { capture: true, once: true, passive: true });
						document.addEventListener('pointerdown', down, { capture: true, once: true });
						document.addEventListener('pmu-op-end', end);
						r.entry = () => wait(() => {
							const elapsed = card.matches(':hover') ? entryTime() : null;
							return elapsed === null ? null : { elapsed };
						}, 1000);
						r.ended = (waitMs) => wait(() => !r.returned && r.wheel && board.getAttribute('data-op') === 'wheel' &&
							sc.scrollTop > r.wheel.top && opacity() === 0, waitMs);
						r.stop = () => {
							sc.removeEventListener('wheel', wheel, true);
							document.removeEventListener('pointerdown', down, true);
							document.removeEventListener('pmu-op-end', end);
							return { wheel: r.wheel, down: r.down };
						};
					});
					const sendWheel = () => cdp.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x, y, deltaX: 0, deltaY: 1 });
					let entry, wheelAfter;
					await Promise.all([
						cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y }),
						(async () => {
							// Schedule from the renderer's transition clock while opacity is still zero.
							entry = await f.evaluate(() => window.__r122ToolFade.entry());
							if (!entry) return;
							wheelAfter = Math.max(0, targetEntryMs - entry.elapsed - lead);
							const ready = f.evaluate((waitMs) => window.__r122ToolFade.ended(waitMs), wheelAfter + 400);
							await Promise.all([
								delay(wheelAfter).then(sendWheel),
								delay(wheelAfter + 75).then(sendWheel), // Keep the hold through a slow frame with minimal scroll.
								ready.then(async (atZero) => {
									if (!atZero) return;
									const press = { x, y, button: 'left', clickCount: 1 };
									await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', ...press });
									await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...press });
								}),
							]);
						})(),
					]);
					const rec = await f.evaluate(() => window.__r122ToolFade.stop());
					const wheel = rec.wheel;
					down = rec.down;
					attempts.push({ entry, wheelAfter, ...rec });
					qualified = interruptedFadeQualifies(wheel, down, fadeDuration);
					if (qualified) break;
					// Compensate the next dispatch for the lead or lag measured at the real wheel event.
					if (Number.isFinite(wheel?.entryMs)) lead = Math.max(-160, Math.min(160, lead + wheel.entryMs - targetEntryMs));
					if (down?.hit) await t.page.keyboard.press('Escape');
				}
			} finally {
				await cdp.detach();
				await f.evaluate(() => PM12_KIMI.setSettingFromHost('general.visual.animation-speed', 'Measured'));
			}
			const detail = JSON.stringify({ fadeDuration, attempts });
			t.log(S + detail);
			await t.check(S + 'could judge a trusted press at zero opacity during a reversed entry fade', qualified, detail);
			await t.check(S + 'the invisible cluster cannot take the press', qualified && !down.hit && down.pointer === 'none', detail);
		}
	},
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
						return { opacity: +cs.opacity, pointer: cs.pointerEvents, hover: el.matches(':hover'), top: sc.scrollTop, op: b.getAttribute('data-op'),
							hit: btn.contains(document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)),
							home: el.closest('[data-pmu-host]')?.getAttribute('data-pmu-host') ?? null,
							headTools: !!el.querySelector('.pmu-headtools:not(:empty)') };
					};
					const r = window.__r117Tools = { samples: [] };
					const wheel = (e) => { r.pre = read(); r.wheel = { trusted: e.isTrusted, over: el.contains(e.target) }; };
					const afterScroll = () => { if (r.wheel) r.samples.push(read()); };
					const move = (e) => {
						if (!r.pre || !e.isTrusted || el.contains(e.target)) return;
						r.samples.push(read());
						requestAnimationFrame(() => r.samples.push(read()));
					};
					if (zero) { sc.addEventListener('wheel', wheel, { capture: true, passive: true }); sc.addEventListener('scroll', afterScroll, { passive: true }); }
					else document.addEventListener('pointermove', move);
					r.arm = () => { r.pre = read(); };
					r.stop = () => {
						sc.removeEventListener('wheel', wheel, true); sc.removeEventListener('scroll', afterScroll); document.removeEventListener('pointermove', move);
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
							cdp.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x, y, deltaX: 0, deltaY: 1 }),
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
					(zero ? pre.headTools && pre.opacity === 0 && rec.wheel?.trusted && rec.wheel.over && first.top > pre.top && first.op === 'wheel' :
						pre.opacity > 0.95 && pre.hit && !first.hover && !first.op && first.opacity > 0);
				await t.check(S + 'could judge the tool state immediately after trusted input', qualified, JSON.stringify({ hidden, rec }));
				await t.check(S + 'the tools immediately stop taking hits', first?.pointer === 'none' && !first.hit, JSON.stringify(rec));
			}
		}
	},
};
