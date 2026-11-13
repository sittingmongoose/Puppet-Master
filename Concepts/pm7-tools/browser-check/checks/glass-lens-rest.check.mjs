// PERF-4 = B (Jared, 2026-11-12, after the before/after pictures in the share's 2026-11-11-pm7-glass-highlight-pair):
// in the Glass looks a lens (the chosen item's glass highlight, i.lg-lens, and the hover bead) bends what is under it
// only while it moves or is pressed. Its live SVG backdrop filter (url(#lgf..) saturate(..), glass.js mount) was kept
// while it rested, the largest single Glass cost (lane E, 2026-11-11). Read in the page, per animation frame (a probe:
// the pixel proof of the hand-over is separate, see the lane G report):
//   rest     every lens with a box, after the page has settled and every lens animation has ended, computes
//            backdrop-filter none, and no lens in the page keeps an inline one;
//   press    for every laid-out lens whose strip takes a press: the pointer goes down on the nearest other item and is
//            held 1.1 s, then moves off the item (across the strip, so no scrub starts) and is released, which abandons
//            the press: the lens travels there and back. Every frame of either travel, and every frame the press is held,
//            must bend; once back at rest, no frame may;
//   scrub    Usage's range: pressed on its chosen button and slid 40 px, the lifted lens bends in every frame; slid
//            back and released, it travels home and rests unbent;
//   bead     the hover bead on two neighbouring Activity icons: resting unbent, bending in every frame it flows;
//   reduced  under Reduce Motion (the media query, and the app's own Reduce animations) no lens travels: none bends at
//            rest, through a press or through a real choice on Usage's range (its fade);
//   resize   at 1390x900 and back, and after a round trip through Basic Dark, every lens rests unbent;
//   onboarding  the window open on Look (its Light / Dark strip pressed as above) and on Where.
// Glass Dark and Glass Light, Home, Usage and Settings, both surfaces. Fails on main 6bd8294726: every resting lens
// carries the filter.
//   --set looks=glass-dark   --set views=home,usage,settings,wizard,orchestrator   --set parts=app,reduced,onboarding
//   --set motion=media,app (the reduced part)   --set hold=1100 (ms a press is held)
import { muteSound, parkPointer } from '../helpers/quiet-page.mjs';

const LOOKS = ['glass-dark', 'glass-light'];
const list = (v, all) => (v ? String(v).split(',').map((s) => s.trim()).filter(Boolean) : all);
const VIEWS = { home: 'dashboard', usage: 'usage', settings: 'settings', wizard: 'wizard', orchestrator: 'orchestrator', projects: 'projects' };

/* in the page: the lenses, their strips (glass.js STRIPS, the ones a press can reach) and a per-frame sampler */
const PROBE = () => {
	const STRIPS = [
		{ sel: 'nav.page-tabs', items: '.page-tab', scrub: true },
		{ sel: '#pmuRange', items: ':scope > button', scrub: true },
		{ sel: '#pmuNav', items: '.pmu-navbtn', vertical: true },
		{ sel: '#sidePanelSlot .pm-segtab', items: '.pm-segtab-item', scrub: true },
		{ sel: '#activityBar', items: '.icon[data-target]', vertical: true },
		{ sel: '#pm-o55-onboarding .o55-raillist', items: '.o55-railitem', press: false },
		{ sel: '#pm-o55-onboarding .o55-seg', items: 'button' },
		{ sel: '.orch-tabs', items: '.orch-tab' },
		{ sel: '.pmt-cz .pmw-ink-row', items: '.pmw-ink-opt' },
		{ sel: '#panel-wizard .pm6-wiz-intent-row', items: '.pm6-wiz-intent-chip' },
		{ sel: '#themeMenu .pm6-tt-modes', items: '.pm6-tt-mode' },
		{ sel: '#pm-settings-root .rail-scroll', items: ':is(.side-link[data-action="home"], .domain-link)', vertical: true },
		{ sel: '#pm-settings-root nav.workspace-tabs', items: '.workspace-tab' },
		{ sel: '#pm-settings-root nav.page-index-card', items: '.pm51-index-group > .index-link', vertical: true },
		{ sel: '#pm-settings-root nav.manager-tabs', items: '.manager-tab' }
	];
	const box = (e) => { const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; };
	const shown = (e) => { const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false; try { return e.checkVisibility({ visibilityProperty: true }); } catch (x) { return true; } };
	/* a travel, a scrub's return or a bead's flow: a running WAAPI move on the lens itself */
	const moving = (l) => l.getAnimations().some((a) => (a.playState === 'running' || a.playState === 'pending') && a.effect && !a.effect.pseudoElement &&
		(a.effect.getComputedTiming().duration || 0) > 150 && a.effect.getKeyframes().some((k) => k.transform != null && k.transform !== ''));
	const busy = (l) => l.getAnimations().some((a) => a.playState === 'running' || a.playState === 'pending');
	const desc = (l, i) => ({ i, kind: l.getAttribute('data-lg-lens'), for: l.getAttribute('data-lg-for') || undefined, bead: l.classList.contains('lg-bead') || undefined,
		layer: (l.parentElement && (l.parentElement.id || l.parentElement.className || l.parentElement.tagName.toLowerCase())) + '', box: box(l) });
	window.__g = {
		all() { return [...document.querySelectorAll('i.lg-lens')]; },
		laid(l) { const r = l.getBoundingClientRect(); return r.width > 1 && r.height > 1; },
		/* every lens at rest: none moving or fading; resolves once that has held for 300 ms (at most ms) */
		settle(ms = 8000) {
			return new Promise((resolve) => {
				const t0 = performance.now(); let still = 0;
				const tick = (ts) => {
					const any = this.all().some((l) => busy(l));
					still = any ? 0 : still || ts;
					if ((still && ts - still > 300) || performance.now() - t0 > ms) resolve({ settled: !!still, ms: Math.round(performance.now() - t0) }); else requestAnimationFrame(tick);
				};
				requestAnimationFrame(tick);
			});
		},
		/* the resting state of every lens in the page, read over a few frames */
		rest(frames = 6) {
			return new Promise((resolve) => {
				const bad = new Map(), inl = new Map(); let n = 0, laid = 0, movers = 0;
				const tick = () => {
					const all = this.all(); laid = 0; movers = 0;
					all.forEach((l, i) => {
						const mv = busy(l); if (mv) movers++;
						if (this.laid(l)) {
							laid++;
							const f = getComputedStyle(l).backdropFilter;
							if (f && f !== 'none' && !mv) bad.set(l, { ...desc(l, i), filter: f, opacity: getComputedStyle(l).opacity });
						}
						const s = l.style.getPropertyValue('backdrop-filter');
						if (s && !mv) inl.set(l, { ...desc(l, i), inline: s });
					});
					if (++n < frames) requestAnimationFrame(tick);
					else resolve({ lenses: all.length, laid, movers, bent: [...bad.values()], inline: [...inl.values()] });
				};
				requestAnimationFrame(tick);
			});
		},
		/* the strip a laid-out lens sits on, its chosen item (the one under the lens's centre) and the nearest other
		   item a press can choose */
		targets() {
			const out = [];
			this.all().forEach((l, i) => {
				if (!this.laid(l) || l.classList.contains('lg-bead') || getComputedStyle(l).visibility === 'hidden' || +getComputedStyle(l).opacity < 0.5) return;
				const lb = l.getBoundingClientRect(), cx = lb.left + lb.width / 2, cy = lb.top + lb.height / 2;
				for (const cfg of STRIPS) {
					for (const strip of document.querySelectorAll(cfg.sel)) {
						const items = [...strip.querySelectorAll(cfg.items)].filter(shown);
						const cur = items.find((it) => { const r = it.getBoundingClientRect(); return cx >= r.left - 1 && cx <= r.right + 1 && cy >= r.top - 1 && cy <= r.bottom + 1; });
						if (!cur) continue;
						const c = (r) => cfg.vertical ? r.top + r.height / 2 : r.left + r.width / 2, at = c(cur.getBoundingClientRect());
						const others = items.filter((it) => it !== cur && !it.disabled && it.getAttribute('aria-disabled') !== 'true' && !it.closest('[inert]'))
							.sort((a, b) => Math.abs(c(a.getBoundingClientRect()) - at) - Math.abs(c(b.getBoundingClientRect()) - at));
						out.push({ lens: i, ...desc(l, i), strip: cfg.sel, vertical: !!cfg.vertical, scrub: !!cfg.scrub, press: cfg.press !== false,
							cur: box(cur), other: others[0] ? box(others[0]) : null, label: others[0] ? (others[0].textContent || others[0].getAttribute('aria-label') || '').trim().slice(0, 24) : '' });
						return;
					}
				}
				out.push({ lens: i, ...desc(l, i), strip: null });
			});
			return out;
		},
		/* every frame from now until stop(): is the lens moving, lifted (a scrub), bending; the phase is set by the
		   pointer's own events, after glass.js's listeners have run */
		watch(i) {
			const l = this.all()[i]; this.frames = []; this.phase = 'before'; this.on = true;
			if (!this.listening) {
				this.listening = true;
				document.addEventListener('pointerdown', () => { if (this.on) this.phase = 'held'; }, true);
				document.addEventListener('pointerup', () => { if (this.on) this.phase = 'released'; }, true);
			}
			const tick = (ts) => {
				if (!this.on) return;
				const f = getComputedStyle(l).backdropFilter;
				this.frames.push({ t: Math.round(ts), ph: this.phase, mv: moving(l), up: l.hasAttribute('data-lg-lifted'), bend: !!f && f !== 'none', b: box(l) });
				requestAnimationFrame(tick);
			};
			requestAnimationFrame(tick);
			return !!l;
		},
		stop() { this.on = false; return this.frames; }
	};
};

/* the frames of one press (or scrub, or flow) judged: moving or lifted or held frames bend, frames at rest after it do not */
function judge(frames) {
	const live = (x) => x.mv || x.up;
	const held = frames.filter((x) => x.ph === 'held'), rel = frames.filter((x) => x.ph === 'released');
	const lastMove = rel.reduce((k, x, i) => (live(x) ? i : k), -1);
	const after = rel.slice(lastMove + 1);
	return {
		frames: frames.length,
		heldMoving: held.filter(live).length, heldStill: held.filter((x) => !live(x)).length, relMoving: rel.filter(live).length, after: after.length,
		movingFlat: frames.filter((x) => live(x) && !x.bend).map((x) => x.t),
		heldStillFlat: held.filter((x) => !live(x) && !x.bend).length,
		afterBent: after.filter((x) => x.bend).length,
		before: frames.filter((x) => x.ph === 'before').length, beforeBent: frames.filter((x) => x.ph === 'before' && x.bend).length,
		anyBent: frames.filter((x) => x.bend).length,
		end: frames.length ? frames[frames.length - 1].b : null
	};
}

async function offsetOf(t, f) {
	const fe = f === t.page.mainFrame() ? null : await f.frameElement();
	return fe ? await fe.boundingBox() : { x: 0, y: 0 };
}

async function restCheck(t, f, tag, { W, H }) {
	await parkPointer(t.page, W, H);
	const s = await f.evaluate(() => window.__g.settle());
	const r = await f.evaluate(() => window.__g.rest());
	await t.check(`rest: the page has settled and shows a lens ${tag}`, s.settled && r.laid >= 1, JSON.stringify({ ...s, lenses: r.lenses, laid: r.laid, movers: r.movers }));
	await t.check(`rest: no laid-out lens bends what is under it ${tag}`, r.bent.length === 0, JSON.stringify({ laid: r.laid, bent: r.bent.length, eg: r.bent.slice(0, 4) }));
	await t.check(`rest: no lens in the page keeps a backdrop filter while still ${tag}`, r.inline.length === 0, JSON.stringify({ lenses: r.lenses, inline: r.inline.length, eg: r.inline.slice(0, 3) }));
	return r;
}

/* down on the nearest other item, held, moved off it across the strip, released: there and back */
async function pressCheck(t, f, x, tag, { reducedMotion = false, hold = 1100 } = {}) {
	const off = await offsetOf(t, f), o = x.other;
	const at = { x: off.x + o.x + o.w / 2, y: off.y + o.y + o.h / 2 };
	const away = x.vertical ? { x: off.x + o.x + o.w + 48, y: at.y } : { x: at.x, y: off.y + o.y + o.h + 36 };
	await t.page.mouse.move(at.x, at.y);
	await t.page.waitForTimeout(450);
	await f.evaluate((i) => window.__g.watch(i), x.lens);
	await t.page.waitForTimeout(120);
	await t.page.mouse.down();
	await t.page.waitForTimeout(hold);
	await t.page.mouse.move(away.x, away.y, { steps: 4 });
	await t.page.waitForTimeout(80);
	await t.page.mouse.up();
	await t.page.waitForTimeout(1500);
	await f.evaluate(() => window.__g.settle(4000));
	await t.page.waitForTimeout(200);
	const j = judge(await f.evaluate(() => window.__g.stop()));
	const near = (a, b) => a && b && Math.abs(a.x - b.x) <= 1.5 && Math.abs(a.y - b.y) <= 1.5;
	const back = near(j.end, x.box);
	/* a strip whose app chooses on the press itself (the Activity bar opens its panel on pointerdown) keeps the lens on
	   the pressed item: it rests there, and the original item is chosen again (a held click) to put the page back */
	const chose = !back && j.relMoving === 0 && j.end && o && Math.abs((j.end.x + j.end.w / 2) - (o.x + o.w / 2)) <= o.w / 2 && Math.abs((j.end.y + j.end.h / 2) - (o.y + o.h / 2)) <= o.h / 2;
	if (chose) {
		const c = x.cur; await t.page.mouse.move(off.x + c.x + c.w / 2, off.y + c.y + c.h / 2); await t.page.mouse.down(); await t.page.waitForTimeout(90); await t.page.mouse.up();
		await t.page.waitForTimeout(1200); await f.evaluate(() => window.__g.settle(4000));
	}
	const what = `${tag} ${x.strip} -> ${x.label || 'item'}`;
	if (reducedMotion) {
		await t.check(`reduced: a press moves no lens and none bends in any frame ${what}`, j.heldMoving + j.relMoving === 0 && j.anyBent === 0, JSON.stringify(j));
		return j;
	}
	await t.check(`press: the press sends the lens; the release brings it back, or it rests where the app chose ${what}`, j.heldMoving >= 3 && j.after >= 5 && ((back && j.relMoving >= 3) || chose), JSON.stringify({ ...j, start: x.box, back, chose }));
	await t.check(`press: the lens bends in every frame it travels and while the press is held ${what}`, j.movingFlat.length === 0 && j.heldStill >= 2 && j.heldStillFlat === 0, JSON.stringify({ movingFlat: j.movingFlat.slice(0, 6), heldStill: j.heldStill, heldStillFlat: j.heldStillFlat }));
	await t.check(`press: back at rest it bends in no frame ${what}`, j.afterBent === 0, JSON.stringify({ after: j.after, afterBent: j.afterBent, beforeBent: j.beforeBent, before: j.before }));
	return j;
}

/* Usage's range: pressed on its chosen button, slid 40 px and back, released there */
async function scrubCheck(t, f, x, tag) {
	const off = await offsetOf(t, f), c = x.cur;
	const at = { x: off.x + c.x + c.w / 2, y: off.y + c.y + c.h / 2 };
	await t.page.mouse.move(at.x, at.y); await t.page.waitForTimeout(400);
	await f.evaluate((i) => window.__g.watch(i), x.lens);
	await t.page.waitForTimeout(100);
	await t.page.mouse.down();
	for (let k = 1; k <= 10; k++) { await t.page.mouse.move(at.x + 4 * k, at.y); await t.page.waitForTimeout(16); }
	await t.page.waitForTimeout(300);
	for (let k = 9; k >= 0; k--) { await t.page.mouse.move(at.x + 4 * k, at.y); await t.page.waitForTimeout(16); }
	await t.page.waitForTimeout(60);
	await t.page.mouse.up();
	await t.page.waitForTimeout(1300);
	await f.evaluate(() => window.__g.settle(4000));
	const fr = await f.evaluate(() => window.__g.stop());
	const lifted = fr.filter((z) => z.up), j = judge(fr);
	await t.check(`scrub: the lifted lens bends in every frame ${tag}`, lifted.length >= 10 && lifted.every((z) => z.bend), JSON.stringify({ lifted: lifted.length, flat: lifted.filter((z) => !z.bend).length }));
	await t.check(`scrub: it travels home bending and rests unbent ${tag}`, j.relMoving >= 3 && j.movingFlat.length === 0 && j.after >= 5 && j.afterBent === 0, JSON.stringify(j));
}

/* the hover bead between two neighbouring Activity icons */
async function beadCheck(t, f, tag) {
	const icons = await f.evaluate(() => [...document.querySelectorAll('#activityBar .icon[data-target]:not([data-lg-current])')]
		.filter((e) => { const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4; })
		.map((e) => { const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; }));
	let pair = null;
	for (let i = 0; i + 1 < icons.length && !pair; i++) if (Math.hypot(icons[i + 1].x - icons[i].x, icons[i + 1].y - icons[i].y) < 100) pair = [icons[i], icons[i + 1]];
	if (!pair) { await t.check(`bead: two neighbouring Activity icons to hover ${tag}`, false, JSON.stringify(icons)); return; }
	const off = await offsetOf(t, f), c = (r) => ({ x: off.x + r.x + r.w / 2, y: off.y + r.y + r.h / 2 });
	await t.page.mouse.move(c(pair[0]).x, c(pair[0]).y, { steps: 3 });
	await t.page.waitForTimeout(700);
	const rest1 = await f.evaluate(() => { const b = document.querySelector('i.lg-lens.lg-bead'); if (!b) return null; const s = getComputedStyle(b); return { on: b.classList.contains('on'), filter: s.backdropFilter, opacity: s.opacity }; });
	await t.check(`bead: resting on an icon it bends nothing ${tag}`, !!rest1 && rest1.on && rest1.filter === 'none', JSON.stringify(rest1));
	const i = await f.evaluate(() => window.__g.all().indexOf(document.querySelector('i.lg-lens.lg-bead')));
	await f.evaluate((k) => window.__g.watch(k), i);
	await t.page.waitForTimeout(80);
	await t.page.mouse.move(c(pair[1]).x, c(pair[1]).y);
	await t.page.waitForTimeout(900);
	const fr = await f.evaluate(() => window.__g.stop());
	const mv = fr.filter((z) => z.mv), lastMv = fr.reduce((k, z, n) => (z.mv ? n : k), -1), after = fr.slice(lastMv + 1);
	await t.check(`bead: it bends in every frame it flows to the neighbour, and rests unbent ${tag}`, mv.length >= 3 && mv.every((z) => z.bend) && after.length >= 5 && after.every((z) => !z.bend),
		JSON.stringify({ frames: fr.length, flowing: mv.length, flat: mv.filter((z) => !z.bend).length, after: after.length, afterBent: after.filter((z) => z.bend).length }));
}

async function presses(t, f, tag, opts = {}) {
	const xs = await f.evaluate(() => window.__g.targets());
	const pressable = xs.filter((x) => x.strip && x.press && x.other);
	t.log(`${tag}: ${xs.length} lenses on screen; strips ${xs.map((x) => (x.strip || '(none)') + (x.other ? '' : ' (no other item)')).join(', ')}`);
	await t.check(`press: a strip with a lens takes a press ${tag}`, pressable.length >= 1, JSON.stringify(xs.map((x) => ({ strip: x.strip, kind: x.kind, other: !!x.other }))));
	const seen = new Set();
	for (const x of pressable) {
		if (seen.has(x.strip)) continue; seen.add(x.strip);
		await pressCheck(t, f, x, tag, opts);
	}
	return xs;
}

async function appPart(t, surface, W, H) {
	const f = await t.app.open({ sandbox: surface === 'sandbox' });
	await f.evaluate(PROBE);
	await f.evaluate(() => document.fonts.ready.then(() => true));
	await t.page.waitForTimeout(Number(t.args.settle ?? 8000));
	for (const look of list(t.args.looks, LOOKS)) {
		await t.app.look(look);
		await f.waitForFunction(() => !(window.PM_THEME_TRANSITION?.busy?.() || window.PM_LOOK_COVERED?.()), null, { timeout: 20000 }).catch(() => {});
		for (const view of list(t.args.views, ['home', 'usage', 'settings'])) {
			const tag = `${look} ${view} ${surface}`;
			await f.evaluate((p) => PM_PAGES.go(p), VIEWS[view] || view);
			await t.page.waitForTimeout(2500);
			await restCheck(t, f, tag, { W, H });
			const xs = await presses(t, f, tag, { hold: Number(t.args.hold || 1100) });
			if (view === 'usage') { const r = xs.find((x) => x.strip === '#pmuRange'); if (r) await scrubCheck(t, f, r, tag); else await t.check(`scrub: Usage's range has its lens ${tag}`, false, JSON.stringify(xs)); }
			if (view === 'home') await beadCheck(t, f, tag);
			await restCheck(t, f, tag + ' after the presses', { W, H });
		}
		/* a resize, and a look round trip out of Glass and back */
		await t.viewport(1390, 900); await t.page.waitForTimeout(1800);
		await restCheck(t, f, `${look} at 1390x900 ${surface}`, { W: 1390, H: 900 });
		await t.viewport(W, H); await t.page.waitForTimeout(1800);
		await restCheck(t, f, `${look} back at ${W}x${H} ${surface}`, { W, H });
		await t.app.look('basic-dark'); await t.page.waitForTimeout(1500);
		const basic = await f.evaluate(() => window.__g.rest());
		await t.check(`look: no lens bends in Basic Dark ${look} ${surface}`, basic.bent.length === 0 && basic.inline.length === 0, JSON.stringify({ bent: basic.bent.slice(0, 3), inline: basic.inline.slice(0, 3) }));
		await t.app.look(look); await t.page.waitForTimeout(2500);
		await restCheck(t, f, `${look} back from Basic Dark ${surface}`, { W, H });
	}
}

async function reducedPart(t, surface, W, H) {
	for (const motion of list(t.args.motion, ['media', 'app'])) {
		await t.emulate({ reducedMotion: motion === 'media' ? 'reduce' : 'no-preference' });
		const f = await t.app.open({ sandbox: surface === 'sandbox' });
		await f.evaluate(PROBE);
		await t.page.waitForTimeout(Number(t.args.settle ?? 8000));
		if (motion === 'app') {
			await f.evaluate(() => { try { window.PM12_KIMI.setSettingFromHost('general.visual.reduce-animations', true, true, true); } catch (e) { document.documentElement.setAttribute('data-motion', 'reduced'); } });
			const on = await f.waitForFunction(() => document.documentElement.getAttribute('data-motion') === 'reduced', null, { timeout: 8000 }).then(() => true, () => false);
			await t.check(`reduced: the app's own Reduce animations is on ${surface}`, on, '');
		}
		for (const look of list(t.args.looks, LOOKS)) {
			await t.app.look(look);
			for (const view of ['home', 'usage']) {
				const tag = `${look} ${view} reduce-${motion} ${surface}`;
				await f.evaluate((p) => PM_PAGES.go(p), VIEWS[view]);
				await t.page.waitForTimeout(2500);
				await restCheck(t, f, tag, { W, H });
				const xs = await presses(t, f, tag, { reducedMotion: true, hold: 700 });
				if (view !== 'usage') continue;
				/* a real choice on the range: the lens changes place with its fade, bending in no frame */
				const r = xs.find((x) => x.strip === '#pmuRange' && x.other);
				if (!r) { await t.check(`reduced: Usage's range has its lens ${tag}`, false, ''); continue; }
				const off = await offsetOf(t, f), click = async (b) => { await t.page.mouse.move(off.x + b.x + b.w / 2, off.y + b.y + b.h / 2); await t.page.mouse.down(); await t.page.waitForTimeout(90); await t.page.mouse.up(); };
				await f.evaluate((i) => window.__g.watch(i), r.lens);
				await click(r.other); await t.page.waitForTimeout(900);
				await click(r.cur); await t.page.waitForTimeout(900);
				const fr = await f.evaluate(() => window.__g.stop());
				const moved = fr.length > 1 && fr.some((z) => Math.abs(z.b.x - fr[0].b.x) > 2 || Math.abs(z.b.y - fr[0].b.y) > 2);
				await t.check(`reduced: a real choice moves the lens with no travel and no frame bends ${tag}`, moved && fr.every((z) => !z.mv && !z.bend), JSON.stringify({ frames: fr.length, moved, travel: fr.filter((z) => z.mv).length, bent: fr.filter((z) => z.bend).length }));
				await restCheck(t, f, tag + ' after the choices', { W, H });
			}
		}
		if (motion === 'app') await f.evaluate(() => { try { window.PM12_KIMI.setSettingFromHost('general.visual.reduce-animations', false, true, true); } catch (e) { /* none */ } document.documentElement.setAttribute('data-motion', 'full'); });
	}
	await t.emulate({ reducedMotion: 'no-preference' });
}

async function onboardingPart(t, surface, W, H) {
	const f = await t.app.open({ onboarding: true, query: 'o55=screen=look', sandbox: surface === 'sandbox' });
	await f.waitForFunction(() => !!document.querySelector('#pm-o55-onboarding .o55-win') && window.O55 && O55.ui && typeof O55.ui.applyLook === 'function', null, { timeout: 60000 });
	await f.evaluate(PROBE);
	await t.page.waitForTimeout(Number(t.args.settle ?? 8000));
	for (const look of list(t.args.looks, LOOKS)) {
		await f.evaluate((v) => O55.ui.applyLook(...v), look.split('-'));
		await t.page.waitForTimeout(2000);
		for (const screen of ['look', 'where']) {
			const tag = `${look} onboarding ${screen} ${surface}`;
			const at = await f.evaluate((id) => { try { O55.ui.go(id, { noHistory: true }); } catch (e) { return String(e); } return O55.S.sess.screen; }, screen);
			await t.check(`onboarding: screen ${screen} opened ${tag}`, at === screen, String(at));
			await t.page.waitForTimeout(2200);
			await restCheck(t, f, tag, { W, H });
			if (screen !== 'look') continue;
			const xs = await f.evaluate(() => window.__g.targets());
			const seg = xs.find((x) => x.strip === '#pm-o55-onboarding .o55-seg' && x.other);
			await t.check(`onboarding: the Look screen's Light / Dark strip has its lens ${tag}`, !!seg, JSON.stringify(xs.map((x) => x.strip)));
			if (seg) await pressCheck(t, f, seg, tag, { hold: Number(t.args.hold || 1100) });
			await restCheck(t, f, tag + ' after the press', { W, H });
		}
	}
}

/* --set parts=pixels (lane G's pixel proof, normal surface): PNGs in the run folder, read by its report's script.
   Per look on Home and Usage: the resting frame with every animation frozen at 4 s (comparable across builds), the
   same load with each laid-out lens's own filter put back where the build keeps one (what main drew there), and
   frames across one travel (Home's Activity bar, Usage's range): before the press, the travel's first and second
   frames, its next-to-last and last, and the first frame after it ended, the rest of the page frozen throughout */
async function pixelsPart(t, surface, W, H) {
	const { writeFileSync } = await import('node:fs');
	const pathm = await import('node:path');
	const f = await t.app.open({});
	await f.evaluate(PROBE);
	await f.evaluate(() => document.fonts.ready.then(() => true));
	await t.page.waitForTimeout(Number(t.args.settle ?? 8000));
	const shot = async (name) => { const b = await t.page.screenshot({ type: 'png' }); writeFileSync(pathm.join(t.run.dir, name + '.png'), b); };
	const lensRows = () => f.evaluate(() => window.__g.all().map((l, i) => { const r = l.getBoundingClientRect(), s = getComputedStyle(l); return { i, laid: window.__g.laid(l), box: { x: r.left, y: r.top, w: r.width, h: r.height }, kind: l.getAttribute('data-lg-lens'), bead: l.classList.contains('lg-bead'), filter: s.backdropFilter, opacity: s.opacity, kept: !!l.__lgBf }; }));
	const freeze = () => f.evaluate(() => { const list = document.getAnimations(); window.__pre = new Set(list); let n = 0; list.forEach((a) => { try { if (a.playState === 'running' || a.playState === 'pending') { a.pause(); a.currentTime = 4000; n++; } } catch (e) { /* gone */ } }); return n; });
	const thaw = () => f.evaluate(() => { document.getAnimations().forEach((a) => { try { if (a.playState === 'paused') a.play(); } catch (e) { /* gone */ } }); });
	const out = {};
	for (const look of list(t.args.looks, LOOKS)) {
		await t.app.look(look);
		for (const view of ['home', 'usage']) {
			const tag = `${look}-${view}`, rec = out[tag] = {};
			await f.evaluate((p) => PM_PAGES.go(p), VIEWS[view]);
			await t.page.waitForTimeout(3000);
			await parkPointer(t.page, W, H);
			await f.evaluate(() => window.__g.settle());
			rec.frozen = await freeze();
			await t.page.waitForTimeout(400);
			rec.lenses = await lensRows();
			await shot(`${tag}-rest`);
			rec.relive = await f.evaluate(() => { let n = 0; window.__g.all().forEach((l) => { if (window.__g.laid(l) && l.__lgBf && !l.style.getPropertyValue('backdrop-filter')) { l.style.setProperty('backdrop-filter', l.__lgBf, 'important'); l.__pxPut = true; n++; } }); return n; });
			if (rec.relive) { await t.page.waitForTimeout(300); await shot(`${tag}-relive`); await f.evaluate(() => window.__g.all().forEach((l) => { if (l.__pxPut) { l.style.removeProperty('backdrop-filter'); l.__pxPut = false; } })); }
			await thaw();
			/* frames across one travel */
			/* Home's travel is the Activity bar's: the rail tabs' travel is cut short on both builds when the chosen tab grows
			   (an existing re-sync snaps the lens to the grown tab), so it has no last frame to hand over from */
			const sel = view === 'home' ? '#activityBar' : '#pmuRange';
			const x = (await f.evaluate(() => window.__g.targets())).find((z) => z.strip === sel && z.other);
			await t.check(`pixels: ${sel} has its lens and another item ${tag}`, !!x, '');
			if (!x) continue;
			const off = await offsetOf(t, f), at = (b) => ({ x: off.x + b.x + b.w / 2, y: off.y + b.y + b.h / 2 });
			await t.page.mouse.move(at(x.other).x, at(x.other).y); await t.page.waitForTimeout(600);
			await f.evaluate(() => window.__g.settle(3000));
			await freeze(); await t.page.waitForTimeout(300);
			const lensState = () => f.evaluate((i) => { const l = window.__g.all()[i], r = l.getBoundingClientRect(); return { filter: getComputedStyle(l).backdropFilter, box: { x: r.left, y: r.top, w: r.width, h: r.height } }; }, x.lens);
			rec.travel = { strip: sel, from: x.box, to: x.other, frames: {} };
			/* the same paused frame with the lens's inline filter taken off for one shot and put back: the filter's own
			   part of a frame, apart from what the press and the choice change around it */
			const flat = async (name) => {
				const had = await f.evaluate((i) => { const l = window.__g.all()[i], v = l.style.getPropertyValue('backdrop-filter'); if (v) { l.__pxKeep = [v, l.style.getPropertyValue('-webkit-backdrop-filter')]; l.style.removeProperty('backdrop-filter'); l.style.removeProperty('-webkit-backdrop-filter'); } return !!v; }, x.lens);
				if (!had) return;
				await t.page.waitForTimeout(200); await shot(name);
				await f.evaluate((i) => { const l = window.__g.all()[i], k = l.__pxKeep; l.__pxKeep = null; if (k) { l.style.setProperty('backdrop-filter', k[0], 'important'); l.style.setProperty('-webkit-backdrop-filter', k[1] || k[0], 'important'); } }, x.lens);
				await t.page.waitForTimeout(150);
			};
			rec.travel.frames.before = await lensState(); await shot(`${tag}-t0-before`);
			await t.page.mouse.down();
			rec.travel.made = await f.evaluate(() => { const n = document.getAnimations().filter((a) => !window.__pre.has(a)); window.__new = n; n.forEach((a) => { try { a.pause(); a.currentTime = 0; } catch (e) { /* gone */ } }); return n.map((a) => { const fx = a.effect; return { el: fx && fx.target ? fx.target.tagName.toLowerCase() + '.' + String(fx.target.className && fx.target.className.baseVal !== undefined ? fx.target.className.baseVal : fx.target.className).split(' ')[0] + (fx.pseudoElement || '') : '?', end: fx ? Math.round(fx.getComputedTiming().endTime) : 0 }; }); });
			await t.page.waitForTimeout(250);
			rec.travel.frames.first = await lensState(); await shot(`${tag}-t1-first`);
			await flat(`${tag}-t1-first-flat`);
			await f.evaluate(() => window.__new.forEach((a) => { try { a.currentTime = 1000 / 120; } catch (e) { /* gone */ } }));
			await t.page.waitForTimeout(250);
			rec.travel.frames.second = await lensState(); await shot(`${tag}-t2-second`);
			/* released as a person's click is (the app chooses on it); what the choice starts is frozen where it starts,
			   so a tab that grows when chosen (the rail's) does not finish growing under a frozen travel and get the lens
			   snapped to it by the next sync, which a real 600 ms travel never waits for */
			await t.page.mouse.up();
			rec.travel.stillPaused = await f.evaluate(() => new Promise((r) => requestAnimationFrame(() => { let n = 0; document.getAnimations().forEach((a) => { if (!window.__pre.has(a) && !window.__new.includes(a)) { try { a.pause(); n++; } catch (e) { /* gone */ } } }); r(n); })));
			await t.page.waitForTimeout(500);
			await f.evaluate(() => window.__new.forEach((a) => { try { a.currentTime = a.effect.getComputedTiming().endTime - 2000 / 120; } catch (e) { /* gone */ } }));
			await t.page.waitForTimeout(250);
			rec.travel.frames.penult = await lensState(); await shot(`${tag}-t3-penult`);
			await f.evaluate(() => window.__new.forEach((a) => { try { a.currentTime = a.effect.getComputedTiming().endTime - 1000 / 120; } catch (e) { /* gone */ } }));
			await t.page.waitForTimeout(250);
			rec.travel.frames.last = await lensState(); await shot(`${tag}-t4-last`);
			await flat(`${tag}-t4-last-flat`);
			await f.evaluate(() => new Promise((r) => { window.__new.forEach((a) => { try { a.finish(); } catch (e) { /* gone */ } }); requestAnimationFrame(() => requestAnimationFrame(r)); }));
			await t.page.waitForTimeout(250);
			rec.travel.frames.after = await lensState(); await shot(`${tag}-t5-after`);
			await thaw();
			/* the original item chosen again */
			await t.page.mouse.move(at(x.cur).x, at(x.cur).y); await t.page.mouse.down(); await t.page.waitForTimeout(90); await t.page.mouse.up();
			await t.page.waitForTimeout(1500);
			t.log(`${tag}: ${JSON.stringify({ frozen: rec.frozen, relive: rec.relive, laid: rec.lenses.filter((l) => l.laid).length, frames: Object.fromEntries(Object.entries(rec.travel.frames).map(([k, v]) => [k, v.filter])), made: rec.travel.made.length })}`);
		}
	}
	writeFileSync(pathm.join(t.run.dir, 'pixels.json'), JSON.stringify(out, null, 1));
	await t.check('pixels: frames written', Object.keys(out).length > 0, Object.keys(out).join(','));
}

/* --set parts=film with --record: travels on Home (the Activity bar, the rail tabs) and on Usage (the range) per Glass
   look, each chosen with a held click (down, 90 ms, up) and chosen back, marked on the film */
async function filmPart(t, surface, W, H) {
	const f = await t.app.open({});
	await f.evaluate(PROBE);
	await t.page.waitForTimeout(Number(t.args.settle ?? 8000));
	for (const look of list(t.args.looks, LOOKS)) {
		await t.app.look(look);
		for (const view of ['home', 'usage']) {
			await f.evaluate((p) => PM_PAGES.go(p), VIEWS[view]);
			await t.page.waitForTimeout(2500);
			await f.evaluate(() => window.__g.settle());
			for (const sel of view === 'home' ? ['#activityBar', '#sidePanelSlot .pm-segtab'] : ['#pmuRange']) {
				await f.evaluate(() => window.__g.settle());
				const x = (await f.evaluate(() => window.__g.targets())).find((z) => z.strip === sel && z.other);
				if (!x) { await t.check(`film: ${sel} has its lens ${look} ${view}`, false, ''); continue; }
				const off = await offsetOf(t, f), at = (b) => ({ x: off.x + b.x + b.w / 2, y: off.y + b.y + b.h / 2 });
				for (const [name, b] of [['to ' + (x.label || 'next'), x.other], ['back', x.cur]]) {
					await t.page.mouse.move(at(b).x, at(b).y, { steps: 6 }); await t.page.waitForTimeout(700);
					await f.evaluate((i) => window.__g.watch(i), x.lens);
					await t.mark(`${look} ${view} ${sel} travel ${name}`);
					await t.page.mouse.down(); await t.page.waitForTimeout(90); await t.page.mouse.up();
					await t.page.waitForTimeout(1600);
					/* the same click read per frame (a probe beside the film): where the lens is drawn, whether it moves and
					   bends; a travel cut short shows as a jump of its centre between two frames */
					const fr = await f.evaluate(() => window.__g.stop()), cx = (z) => z.b.x + z.b.w / 2, cy = (z) => z.b.y + z.b.h / 2;
					let jump = 0, at2 = -1; for (let k = 1; k < fr.length; k++) { const d = Math.hypot(cx(fr[k]) - cx(fr[k - 1]), cy(fr[k]) - cy(fr[k - 1])); if (d > jump) { jump = d; at2 = k; } }
					const lastMv = fr.reduce((k, z, n) => (z.mv ? n : k), -1), after = fr.slice(lastMv + 1), mv = fr.filter((z) => z.mv);
					const row = { frames: fr.length, moving: mv.length, movingFlat: mv.filter((z) => !z.bend).length, after: after.length, afterBent: after.filter((z) => z.bend).length,
						jump: Math.round(jump * 10) / 10, jumpAt: at2, jumpMoving: at2 > 0 ? [fr[at2 - 1].mv, fr[at2].mv] : null, path: fr.filter((z, k) => k % 6 === 0 || z.mv !== (fr[k - 1] || {}).mv).map((z) => [z.t, Math.round(cx(z)), z.mv ? 1 : 0, z.bend ? 1 : 0]).slice(0, 40) };
					t.log(`film ${look} ${view} ${sel} ${name}: ${JSON.stringify(row)}`);
					await t.check(`film: the click's travel bends in every frame and rests unbent ${look} ${view} ${sel} ${name}`, mv.length >= 3 && row.movingFlat === 0 && after.length >= 5 && row.afterBent === 0, JSON.stringify(row));
				}
			}
		}
	}
}

export const tests = {};
for (const surface of ['normal', 'sandbox']) {
	const run = (part, fn) => async (t) => {
		if (!t.app.surfaces().includes(surface)) { t.log(`skipped: the sandbox switch leaves out the ${surface} surface`); return; }
		if (!list(t.args.parts, ['app', 'reduced', 'onboarding']).includes(part)) { t.log(`skipped: --set parts leaves out ${part}`); return; }
		const [W, H] = String(t.args.size || '1920x1080').split('x').map(Number);
		await muteSound(t.page);
		await t.viewport(W, H);
		await t.emulate({ reducedMotion: 'no-preference' });
		await fn(t, surface, W, H);
	};
	tests[`PERF-4 lens rest app ${surface}`] = run('app', appPart);
	tests[`PERF-4 lens rest reduced motion ${surface}`] = run('reduced', reducedPart);
	tests[`PERF-4 lens rest onboarding ${surface}`] = run('onboarding', onboardingPart);
	/* lane G's proof material, asked for by name (--set parts=pixels or parts=film), normal surface */
	if (surface === 'normal') {
		const named = (part, fn) => async (t) => {
			if (!list(t.args.parts, []).includes(part)) { t.log(`skipped: ${part} runs only when --set parts names it`); return; }
			return run(part, fn)(t);
		};
		tests[`PERF-4 lens pixels`] = named('pixels', pixelsPart);
		tests[`PERF-4 lens film`] = named('film', filmPart);
	}
}
