// R117 P3 / R121 P2-P3: wheel input without pane travel preserves main's tooltip hit geometry.
import { muteSound } from '../helpers/quiet-page.mjs';

function record(el, scrollHead = false) {
	const sc = document.getElementById('pmuScroll'), board = document.getElementById('pmuBoard');
	const card = el.closest('.pmu-card'), tips = PM_HOVER_TAG_CONTROLLER;
	const headTools = scrollHead ? el.closest('.pmu-headtools') : null;
	let point, raf;
	const read = () => {
		const box = el.getBoundingClientRect(), cs = getComputedStyle(el);
		return { t: performance.now(), top: sc.scrollTop, left: sc.scrollLeft, op: board.getAttribute('data-op'),
			x: box.x, y: box.y, w: box.width, h: box.height, z: cs.zIndex, transform: cs.transform,
			cardTranslate: getComputedStyle(card).translate,
			...(headTools && { cardX: card.getBoundingClientRect().x, hover: card.matches(':hover'),
				headTransform: getComputedStyle(headTools).transform }),
			tip: tips.active === el && tips.tag?.getAttribute('data-open') === 'true',
			hit: point && el.contains(document.elementFromPoint(...point)) };
	};
	const r = window.__usageGeometry = { pre: read(), frames: [], wheels: [], ops: [], scrolls: 0 };
	const wheel = (e) => {
		point = [e.clientX, e.clientY];
		r.wheels.push({ trusted: e.isTrusted, dx: e.deltaX, dy: e.deltaY, ...read() });
	};
	const scroll = () => r.scrolls++;
	const sample = () => { r.frames.push(read()); raf = requestAnimationFrame(sample); };
	const ops = new MutationObserver(() => r.ops.push(board.getAttribute('data-op')));
	ops.observe(board, { attributes: true, attributeFilter: ['data-op'] });
	sc.addEventListener('wheel', wheel, { passive: true });
	sc.addEventListener('scroll', scroll, { passive: true });
	raf = requestAnimationFrame(sample);
	r.stop = () => {
		cancelAnimationFrame(raf); ops.disconnect();
		sc.removeEventListener('wheel', wheel); sc.removeEventListener('scroll', scroll);
		return { ...r, stop: undefined, after: read() };
	};
}

async function stationaryGeometry(t) {
	await t.viewport(1920, 1080);
	await muteSound(t.page);
	for (const surface of t.app.surfaces()) {
		const f = await t.app.open({ query: 'pm-warm=0', sandbox: surface === 'sandbox' });
		for (const look of String(t.args.looks || 'basic-dark,retro-dark').split(',')) {
			await t.app.look(look);
			await f.evaluate(() => {
				PMU.live.pause(); PM_PAGES.go('usage');
				PM12_KIMI.setSettingFromHost('general.interaction.show-tooltips', true);
				PM_HOVER_TAG_CONTROLLER.syncVisualSetting();
			});
			for (const [room, selector, z] of [
				['analytics', '.pmu-hc[data-r="2"][data-c="5"]', '1'],
				['ledger', '.pmu-atdot', '2'],
				['analytics', '[data-widget="token-trend"] .pmu-headtools .pmu-caveat', null],
			]) {
				const head = z === null, heat = room === 'analytics' && !head;
				const S = `[${surface}] ${look} ${head ? 'chart head note' : room}: `;
				await t.page.mouse.move(1914, 540);
				await f.evaluate((r) => PM7_USAGE.setRoomDetail(r, 'diagnostics'), room);
				await f.waitForFunction((room) => document.getElementById('pmuBoard')?.dataset.room === room &&
					!document.querySelector('#pmuScroll .pmu-ghostboard') && !document.documentElement.hasAttribute('data-pmu-moment'), room);
				if (head) await f.evaluate(() => {
					PMU.board.resize('token-trend', { x: 0, y: 0, w: 4, h: 4 });
					document.getElementById('pmuScroll').scrollTop = 0;
				});
				const marks = f.locator('#pmuBoard ' + selector);
				await marks.first().waitFor({ state: 'visible', timeout: 5000 });
				if (!head) await marks.first().evaluate((el) => el.scrollIntoView({ block: 'center', inline: 'nearest' }));
				await t.page.waitForTimeout(500);
				// Ledger dots can overlap. Qualify a mark whose center actually takes hits.
				/* (disclosed selftest=dotcover: a hit-testable span over each ledger dot's centre forces the qualification to
				   miss, so the failure record must name what sits at every mark centre instead of only "condition was false") */
				const cover = room === 'ledger' && String(t.args.selftest || '') === 'dotcover';
				if (cover) await f.evaluate(() => { document.querySelectorAll('#pmuBoard .pmu-atdot').forEach((d) => { const r = d.getBoundingClientRect(), p = d.offsetParent || document.getElementById('pmuBoard'), pr = p.getBoundingClientRect(), c = document.createElement('span'); c.className = 'kit-atdot-cover'; c.style.cssText = 'position:absolute;z-index:3;width:8px;height:8px;transform:translate(-50%,-50%);left:' + (r.left + r.width / 2 - pr.left) + 'px;top:' + (r.top + r.height / 2 - pr.top) + 'px'; p.appendChild(c); }); });
				const index = await marks.evaluateAll((els) => els.findIndex((el) => {
					const r = el.getBoundingClientRect();
					return el.contains(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2));
				}));
				if (index < 0) {
					const at = await marks.evaluateAll((els) => els.map((el, i) => { const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, h = document.elementFromPoint(cx, cy); return { i, centre: [Math.round(cx), Math.round(cy)], tag: h ? h.tagName.toLowerCase() : null, class: h ? h.getAttribute('class') : null, own: !!h && el.contains(h) }; }));
					if (cover) await f.evaluate(() => document.querySelectorAll('.kit-atdot-cover').forEach((c) => c.remove()));
					await t.check(S + 'could judge a hit-tested tooltip anchor', false, JSON.stringify({ marks: at.length, at }));
					continue;
				}
				if (cover) await f.evaluate(() => document.querySelectorAll('.kit-atdot-cover').forEach((c) => c.remove()));
				const mark = marks.nth(index), base = await mark.boundingBox();
				await t.page.mouse.move(base.x + base.width / 2, base.y + base.height / 2);
				await t.page.waitForTimeout(400);
				const hovered = await mark.boundingBox();
				if (heat) {
					// Hit an enlarged edge. Retro raises the card up-left, so use the left edge in that look.
					const retro = look.startsWith('retro');
					const x = retro ? Math.ceil(hovered.x) + 1 : hovered.x + hovered.width / 2;
					const y = retro ? hovered.y + hovered.height / 2 : (base.y + base.height + hovered.y + hovered.height) / 2;
					await t.page.mouse.move(x, y);
				} else if (head) {
					await t.page.mouse.move(hovered.x + hovered.width / 2, hovered.y + hovered.height / 2);
				}
				await t.page.waitForTimeout(1900);
				const directions = head ? [[0, -40], [40, 0]] : [[40, 0]];
				for (const [dx, dy] of directions) {
					const label = S + (dy ? 'top limit' : 'horizontal wheel');
					await mark.evaluate(record);
					for (let i = 0; i < 8; i++) {
						await t.page.mouse.wheel(dx, dy);
						await t.page.waitForTimeout(35);
					}
					await t.page.waitForTimeout(200);
					const r = await f.evaluate(() => window.__usageGeometry.stop()), p = r.pre;
					const still = (s) => s.top === p.top && s.left === p.left;
					const unchanged = (s) => s.hit && s.tip && ['x', 'y', 'w', 'h'].every((k) => Math.abs(s[k] - p[k]) < 0.5) &&
						s.z === p.z && s.transform === p.transform && s.cardTranslate === p.cardTranslate;
					const frames = r.frames.filter((s) => s.t >= r.wheels[0]?.t);
					const bad = frames.filter((s) => !unchanged(s));
					const detail = JSON.stringify({ pre: p, scrolls: r.scrolls, ops: r.ops, wheels: r.wheels.length, frames: frames.length, changed: bad.length, firstChanged: bad[0], after: r.after });
					await t.check(label + ' could judge a shown tooltip and trusted wheel without pane travel', p.tip && (!z || p.z === z) &&
						(!heat || hovered.height > base.height) && (!dy || p.top === 0) && r.scrolls === 0 &&
						r.wheels.length === 8 && r.wheels.every((w) => w.trusted && w.dx === dx && w.dy === dy && still(w)) &&
						frames.length >= 8 && frames.every(still) && still(r.after), detail);
					await t.check(label + ' keeps the card, anchor, hit and shown tooltip steady without a wheel marker',
						!r.ops.includes('wheel') && frames.length >= 8 && !bad.length && unchanged(r.after), detail);
					if (head && dy) {
						await t.page.mouse.move(1914, 540);
						await t.page.waitForTimeout(350);
						await t.page.mouse.move(base.x + base.width / 2, base.y + base.height / 2);
						await t.page.waitForTimeout(400);
						const note = await mark.boundingBox();
						await t.page.mouse.move(note.x + note.width / 2, note.y + note.height / 2);
						await t.page.waitForTimeout(1900);
					}
				}
			}
		}
	}
}

async function firstScrollFrame(t) {
	await t.viewport(1920, 1080);
	await muteSound(t.page);
	for (const surface of t.app.surfaces()) {
		const S = `[${surface}] first scrolling frame`;
		const f = await t.app.open({ query: 'pm-warm=0', sandbox: surface === 'sandbox' });
		await t.app.look('basic-dark');
		await f.evaluate(() => { PMU.live.pause(); PM_PAGES.go('usage'); });
		await f.waitForFunction(() => !document.querySelector('#pmuScroll .pmu-ghostboard'));
		const pane = await f.locator('#pmuScroll').boundingBox();
		await t.page.mouse.move(pane.x + pane.width / 2, pane.y + pane.height * 0.55);
		await f.waitForFunction(() => document.querySelector('#pmuBoard > .pmu-card:hover.pmh-on'));
		await f.evaluate(() => {
			const sc = document.getElementById('pmuScroll'), board = document.getElementById('pmuBoard');
			const startTop = sc.scrollTop;
			const r = window.__firstUsageScroll = { startTop, max: sc.scrollHeight - sc.clientHeight, wheels: [], scrolls: [], starts: [], frames: [] };
			let raf;
			const state = (t = performance.now()) => ({ t, top: sc.scrollTop, op: board.getAttribute('data-op'),
				lit: board.querySelectorAll(':scope > .pmu-card:is(.pmh-on,.pmh-near)').length });
			const sample = () => { r.frames.push(state()); raf = requestAnimationFrame(sample); };
			const wheel = (e) => r.wheels.push({ trusted: e.isTrusted, ...state() });
			const scroll = () => r.scrolls.push(state());
			const start = (e) => { if (e.detail?.board === board) r.starts.push(state()); };
			const wheelDone = () => r.wheelDone = state();
			sc.addEventListener('wheel', wheel, { capture: true, passive: true });
			sc.addEventListener('wheel', wheelDone, { passive: true });
			sc.addEventListener('scroll', scroll, { capture: true, passive: true });
			document.addEventListener('pmu-op-start', start);
			raf = requestAnimationFrame(sample);
			r.stop = () => {
				cancelAnimationFrame(raf);
				sc.removeEventListener('wheel', wheel, true);
				sc.removeEventListener('wheel', wheelDone);
				sc.removeEventListener('scroll', scroll, true);
				document.removeEventListener('pmu-op-start', start);
				return { ...r, stop: undefined, after: state() };
			};
		});
		await t.page.mouse.wheel(0, 145);
		await t.page.waitForTimeout(650);
		const r = await f.evaluate(() => window.__firstUsageScroll.stop());
		const moved = r.frames.find((s) => s.top > r.startTop), scroll = r.scrolls.find((s) => s.top > r.startTop);
		const details = JSON.stringify({ wheels: r.wheels, wheelDone: r.wheelDone, scroll, starts: r.starts, moved, after: r.after });
		t.log(S + ' ' + details);
		await t.check(S + ' could judge a trusted wheel that moved the pane', r.wheels.length === 1 && r.wheels[0].trusted &&
			r.wheels[0].top === r.startTop && r.max - r.startTop >= 145 && !!scroll && !!moved && r.after.top > r.startTop, details);
		await t.check(S + ' wheel dispatch sets the pause before the first scroll callback',
			r.wheelDone?.op === 'wheel' && r.wheelDone.lit === 0 && scroll?.op === 'wheel' &&
			r.starts[0]?.top === r.startTop, details);
		await t.check(S + ' is already paused and has no card engine light', r.starts.length === 1 && moved?.op === 'wheel' &&
			moved.lit === 0 && r.starts[0].t <= moved.t && !r.after.op, details);
	}
}

async function scrollingHeadGeometry(t) {
	await t.viewport(1920, 1080);
	await t.emulate({ reducedMotion: 'no-preference' });
	await muteSound(t.page);
	for (const surface of t.app.surfaces()) {
		for (const look of String(t.args.looks || 'basic-dark,retro-dark').split(',')) {
			const label = `[${surface}] ${look} compact Token volume About icon`;
			const f = await t.app.open({ query: 'pm-warm=0', sandbox: surface === 'sandbox' });
			await t.app.look(look);
			await f.evaluate(() => {
				PMU.live.pause(); PM_PAGES.go('usage'); PM7_USAGE.setRoomDetail('analytics', 'diagnostics');
			});
			await f.waitForFunction(() => document.getElementById('pmuBoard')?.dataset.room === 'analytics' &&
				!document.querySelector('#pmuScroll .pmu-ghostboard') && !document.documentElement.hasAttribute('data-pmu-moment'));
			await f.evaluate(() => {
				PMU.board.resize('token-trend', { x: 0, y: 0, w: 4, h: 4 });
				document.getElementById('pmuScroll').scrollTop = 0;
			});
			const mark = f.locator('#pmuBoard [data-widget="token-trend"] .pmu-headtools .pmu-caveat');
			await mark.waitFor({ state: 'visible' });
			const base = await mark.boundingBox();
			await t.page.mouse.move(base.x + base.width / 2, base.y + base.height / 2);
			await t.page.waitForTimeout(400);
			const hovered = await mark.boundingBox();
			await t.page.mouse.move(hovered.x + hovered.width / 2, hovered.y + hovered.height / 2);
			await mark.evaluate(record, true);
			for (let i = 0; i < 7; i++) {
				await t.page.mouse.wheel(0, 1);
				await t.page.waitForTimeout(35);
			}
			const r = await f.evaluate(() => window.__usageGeometry.stop()), p = r.pre;
			// Subtract the plate's translation so Retro's independent raise does not hide a head-tools slide.
			const held = r.frames.filter((s) => s.op === 'wheel' && s.t - r.wheels[0]?.t > 180 && s.top > p.top);
			const drift = held.map((s) => Math.abs((s.x - s.cardX) - (p.x - p.cardX)));
			const detail = JSON.stringify({ pre: p, firstWheel: r.wheels[0], lastWheel: r.wheels.at(-1), scrolls: r.scrolls,
				held: held.length, maxDrift: Math.max(...drift, 0), shifted: held[drift.findIndex((x) => x >= 0.5)] });
			await t.check(label + ' could judge a held hover through real pane travel', p.hover && !p.op && p.headTransform !== 'none' &&
				r.wheels.length === 7 && r.wheels.every((w) => w.trusted && w.dx === 0 && w.dy === 1) &&
				r.wheels[0].hit && r.scrolls > 0 && held.length >= 2 && held.every((s) => s.hover), detail);
			await t.check(label + ' keeps its horizontal position and hit within the card during the pause',
				held.length >= 2 && drift.every((x) => x < 0.5) && held.every((s) => s.hit), detail);
		}
	}
}

// R123 P-1: a chart card whose head tools pass under a resting pointer during a wheel pause keeps its head at rest
// (main would slide it aside on hover; the pause holds every head still except the one hovered when it began).
async function passingHeadStill(t) {
	await t.viewport(1920, 1080);
	await t.emulate({ reducedMotion: 'no-preference' });
	await muteSound(t.page);
	for (const surface of t.app.surfaces()) {
		for (const look of String(t.args.looks || 'basic-dark,retro-dark').split(',')) {
			const label = `[${surface}] ${look} passing chart head`;
			const f = await t.app.open({ query: 'pm-warm=0', sandbox: surface === 'sandbox' });
			await t.app.look(look);
			await f.evaluate(() => { PMU.live.pause(); PM_PAGES.go('usage'); PM7_USAGE.setRoomDetail('analytics', 'diagnostics'); });
			await f.waitForFunction(() => document.getElementById('pmuBoard')?.dataset.room === 'analytics' &&
				!document.querySelector('#pmuScroll .pmu-ghostboard') && !document.documentElement.hasAttribute('data-pmu-moment'));
			// Pick a chart card with head tools low enough to scroll up under a point 60 px above its head.
			const plan = await f.evaluate(() => {
				const sc = document.getElementById('pmuScroll'), room = sc.scrollHeight - sc.clientHeight;
				const vp = sc.getBoundingClientRect();
				const cards = [...document.querySelectorAll('#pmuBoard > .pmu-card')].filter((c) =>
					c.querySelector(':scope > .pmu-cardhead > .pmu-headtools:not(:empty)'));
				for (const c of cards) {
					const top = c.getBoundingClientRect().top - vp.top + sc.scrollTop;
					const want = top - 260;
					if (want >= 0 && want + 300 <= room) {
						sc.scrollTop = want;
						const box = c.getBoundingClientRect();
						return { id: c.dataset.widget, x: Math.round(box.x + box.width / 2), y: Math.round(box.top - 60) };
					}
				}
				return null;
			});
			if (!plan) { await t.check(label + ' could find a chart card with head tools and room to scroll', false, 'no card'); continue; }
			await t.page.waitForTimeout(300);
			await t.page.mouse.move(plan.x, plan.y);
			await t.page.waitForTimeout(400);
			await f.evaluate((id) => {
				const sc = document.getElementById('pmuScroll'), board = document.getElementById('pmuBoard');
				const card = board.querySelector(`:scope > .pmu-card[data-widget="${id}"]`);
				const head = card.querySelector(':scope > .pmu-cardhead > .pmu-headtools');
				let raf;
				const read = () => ({ t: performance.now(), top: sc.scrollTop, op: board.getAttribute('data-op'),
					hover: card.matches(':hover'), head: getComputedStyle(head).transform });
				const r = window.__passingHead = { pre: read(), frames: [], wheels: [] };
				const wheel = (e) => r.wheels.push({ trusted: e.isTrusted, dy: e.deltaY, ...read() });
				const sample = () => { r.frames.push(read()); raf = requestAnimationFrame(sample); };
				sc.addEventListener('wheel', wheel, { passive: true });
				raf = requestAnimationFrame(sample);
				r.stop = () => { cancelAnimationFrame(raf); sc.removeEventListener('wheel', wheel); return { ...r, stop: undefined, after: read() }; };
			}, plan.id);
			for (let i = 0; i < 6; i++) { await t.page.mouse.wheel(0, 40); await t.page.waitForTimeout(35); }
			await t.page.waitForTimeout(90);
			const r = await f.evaluate(() => window.__passingHead.stop());
			const held = r.frames.filter((s) => s.op === 'wheel');
			const under = held.filter((s) => s.hover);
			const moved = held.filter((s) => s.head !== 'none');
			const detail = JSON.stringify({ card: plan.id, pre: r.pre, wheels: r.wheels.length, held: held.length, under: under.length,
				firstMoved: moved[0], lastHeld: held.at(-1) });
			await t.check(label + ' could judge: the card was at rest, then passed under the resting pointer inside the hold',
				!r.pre.hover && r.pre.head === 'none' && r.wheels.length === 6 && r.wheels.every((w) => w.trusted && w.dy > 0) &&
				under.length >= 2, detail);
			await t.check(label + ' its head tools stay at rest while it passes under the pointer during the pause',
				under.length >= 2 && moved.length === 0, detail);
		}
	}
}

async function stationaryRetroRaise(t) {
	if (!String(t.args.looks || 'basic-dark,retro-dark').split(',').includes('retro-dark')) return;
	await t.viewport(1920, 1080);
	await t.emulate({ reducedMotion: 'no-preference' });
	await muteSound(t.page);
	for (const surface of t.app.surfaces()) {
		const S = `[${surface}] Retro stationary card raise`;
		const f = await t.app.open({ query: 'pm-warm=0', sandbox: surface === 'sandbox' });
		await t.app.look('retro-dark');
		await f.evaluate(() => { PMU.live.pause(); PM_PAGES.go('usage'); PM7_USAGE.setRoomDetail('overview', 'glance'); });
		await f.waitForFunction(() => document.getElementById('pmuBoard')?.dataset.room === 'overview' &&
			!document.querySelector('#pmuScroll .pmu-ghostboard') && !document.documentElement.hasAttribute('data-pmu-moment'));
		const card = f.locator('#pmuBoard > [data-widget="ov-skyline"]');
		await card.waitFor({ state: 'visible' });
		const box = await card.boundingBox();
		await t.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
		await f.waitForFunction(() => document.querySelector('#pmuBoard > [data-widget="ov-skyline"].pmh-on'), null, { timeout: 8000 });
		for (const [dx, dy] of [[0, -40], [40, 0]]) {
			const label = S + (dy ? ' at the top limit' : ' on horizontal wheel');
			await card.evaluate(record);
			for (let i = 0; i < 6; i++) {
				await t.page.mouse.wheel(dx, dy);
				await t.page.waitForTimeout(35);
			}
			await t.page.waitForTimeout(350);
			const r = await f.evaluate(() => window.__usageGeometry.stop()), p = r.pre;
			const during = r.frames.filter((s) => s.t >= r.wheels[0]?.t);
			const shifted = during.find((s) => s.cardTranslate !== p.cardTranslate || s.x !== p.x || s.y !== p.y);
			const detail = JSON.stringify({ pre: p, shifted, wheels: r.wheels.length, frames: during.length, ops: r.ops, after: r.after });
			t.log(label + ' ' + detail);
			await t.check(label + ' could judge an already raised card and trusted wheel without pane travel',
				p.cardTranslate === '-2px -2px' && p.top === 0 && !r.scrolls && r.wheels.length === 6 &&
				r.wheels.every((w) => w.trusted && w.dx === dx && w.dy === dy && w.top === p.top && w.left === p.left) &&
				during.length >= 8, detail);
			await t.check(label + ' stays raised and hit-testable without a wheel marker', !shifted && !r.ops.includes('wheel') &&
				during.length >= 8 && during.every((s) => s.hit) && r.after.cardTranslate === p.cardTranslate, detail);
		}
	}
}

export const tests = {
	'Usage stationary chart geometry': stationaryGeometry,
	'Usage first scrolling frame': firstScrollFrame,
	'Usage scrolling chart head geometry': scrollingHeadGeometry,
	'Usage passing chart head stays at rest': passingHeadStill,
	'Usage Retro stationary card raise': stationaryRetroRaise,
};
