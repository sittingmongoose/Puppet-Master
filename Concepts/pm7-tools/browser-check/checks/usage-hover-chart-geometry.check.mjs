// R117 P3 / R121 P2-P3: wheel input without pane travel preserves main's tooltip hit geometry.
import { muteSound } from '../helpers/quiet-page.mjs';

function record(el) {
	const sc = document.getElementById('pmuScroll'), board = document.getElementById('pmuBoard');
	const card = el.closest('.pmu-card'), tips = PM_HOVER_TAG_CONTROLLER;
	let point, raf;
	const read = () => {
		const box = el.getBoundingClientRect(), cs = getComputedStyle(el);
		return { t: performance.now(), top: sc.scrollTop, left: sc.scrollLeft, op: board.getAttribute('data-op'),
			x: box.x, y: box.y, w: box.width, h: box.height, z: cs.zIndex, transform: cs.transform,
			cardTranslate: getComputedStyle(card).translate,
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
				const index = await marks.evaluateAll((els) => els.findIndex((el) => {
					const r = el.getBoundingClientRect();
					return el.contains(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2));
				}));
				if (index < 0) { await t.check(S + 'could judge a hit-tested tooltip anchor', false); continue; }
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
			sc.addEventListener('wheel', wheel, { capture: true, passive: true });
			sc.addEventListener('scroll', scroll, { capture: true, passive: true });
			document.addEventListener('pmu-op-start', start);
			raf = requestAnimationFrame(sample);
			r.stop = () => {
				cancelAnimationFrame(raf);
				sc.removeEventListener('wheel', wheel, true);
				sc.removeEventListener('scroll', scroll, true);
				document.removeEventListener('pmu-op-start', start);
				return { ...r, stop: undefined, after: state() };
			};
		});
		await t.page.mouse.wheel(0, 145);
		await t.page.waitForTimeout(650);
		const r = await f.evaluate(() => window.__firstUsageScroll.stop());
		const moved = r.frames.find((s) => s.top > r.startTop), scroll = r.scrolls.find((s) => s.top > r.startTop);
		const details = JSON.stringify({ wheels: r.wheels, scroll, starts: r.starts, moved, after: r.after });
		t.log(S + ' ' + details);
		await t.check(S + ' could judge a trusted wheel that moved the pane', r.wheels.length === 1 && r.wheels[0].trusted &&
			r.wheels[0].top === r.startTop && r.max - r.startTop >= 145 && !!scroll && !!moved && r.after.top > r.startTop, details);
		await t.check(S + ' is already paused and has no card engine light', r.starts.length === 1 && moved?.op === 'wheel' &&
			moved.lit === 0 && r.starts[0].t <= moved.t && !r.after.op, details);
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
	'Usage Retro stationary card raise': stationaryRetroRaise,
};
