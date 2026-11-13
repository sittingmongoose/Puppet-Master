// PERF-4 = B (Jared, 2026-11-12, after the before/after pictures in the share's 2026-11-11-pm7-glass-highlight-pair):
// in the Glass looks a lens (the chosen item's glass highlight, i.lg-lens, and the hover bead) bends what is under it
// only while it moves or is pressed. Its live SVG backdrop filter (url(#lgf..) saturate(..), glass.js mount) was kept
// while it rested, the largest single Glass cost (lane E, 2026-11-11). Read in the page, per animation frame (a probe:
// the pixel proof of the hand-over is separate, see the lane G report):
//   rest     every lens with a box, after the page has settled and every lens animation has ended, computes no
//            url() backdrop filter, and none in the page keeps one inline; the only resting backdrop filter is the
//            Activity bar icon lens's plain saturate(1.12) and, while it shows, the hover bead's plain saturate(1.1)
//            (the lead's R2, 2026-11-13: each keeps the tint its filter gave it, so it comes to rest with no tint
//            step), and every other lens computes none;
//   press    for every laid-out lens whose strip takes a press: the pointer goes down on the nearest other item and is
//            held 1.1 s, then moves off the item (across the strip, so no scrub starts) and is released, which abandons
//            the press: the lens travels there and back. Every frame of either travel, and every frame the press is held,
//            must bend; once back at rest, no frame may;
//   held     on Home, first: a press held 1.6 s on the Activity bar and on the page tabs (the control), past the
//            600 ms travel, released on the item: every frame to the release bends, then the lens rests unbent; each
//            frame records the app's chosen item (both choose at the release, the Activity bar 265-439 ms after it);
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
	/* the Activity bar icon lens's resting tint (glass.js KINDS.lensIcon.sat, restSat) */
	const ICON_REST = 'saturate(1.12)';
	/* the hover bead's while it shows (glass.css .lg-bead.on, KINDS.bead.sat) */
	const BEAD_REST = 'saturate(1.1)';
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
				const bad = new Map(), inl = new Map(), icons = new Map(); let n = 0, laid = 0, movers = 0;
				const tick = () => {
					const all = this.all(); laid = 0; movers = 0;
					all.forEach((l, i) => {
						const mv = busy(l); if (mv) movers++;
						if (this.laid(l)) {
							laid++;
							const f = getComputedStyle(l).backdropFilter, icon = l.getAttribute('data-lg-lens') === 'lensIcon';
							const beadOn = l.classList.contains('lg-bead') && l.classList.contains('on');
							if (f && f !== 'none' && !mv && (/url\(/.test(f) || !((icon && f === ICON_REST) || (beadOn && f === BEAD_REST)))) bad.set(l, { ...desc(l, i), filter: f, opacity: getComputedStyle(l).opacity });
							if (icon && !mv && +getComputedStyle(l).opacity > 0.5 && getComputedStyle(l).visibility !== 'hidden') icons.set(l, { ...desc(l, i), filter: f });
						}
						const s = l.style.getPropertyValue('backdrop-filter');
						if (s && !mv && (/url\(/.test(s) || !(l.getAttribute('data-lg-lens') === 'lensIcon' && s.replace(/\s/g, '') === ICON_REST))) inl.set(l, { ...desc(l, i), inline: s });
					});
					if (++n < frames) requestAnimationFrame(tick);
					else resolve({ lenses: all.length, laid, movers, bent: [...bad.values()], inline: [...inl.values()], icons: [...icons.values()] });
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
		/* chosen (optional): a selector for the strip's chosen item, read each frame, so a frame says what the app had
		   chosen by then; tDown and tUp are the press's own event times */
		watch(i, chosen) {
			const l = this.all()[i]; this.frames = []; this.phase = 'before'; this.on = true; this.tDown = this.tUp = null;
			if (!this.listening) {
				this.listening = true;
				document.addEventListener('pointerdown', () => { if (this.on) { this.phase = 'held'; this.tDown = Math.round(performance.now()); } }, true);
				document.addEventListener('pointerup', () => { if (this.on) { this.phase = 'released'; this.tUp = Math.round(performance.now()); } }, true);
			}
			const which = () => { const c = chosen && document.querySelector(chosen); return c ? (c.getAttribute('data-target') || c.getAttribute('aria-label') || c.textContent || '').trim().slice(0, 24) : ''; };
			const tick = (ts) => {
				if (!this.on) return;
				const f = getComputedStyle(l).backdropFilter;
				this.frames.push({ t: Math.round(ts), ph: this.phase, mv: moving(l), up: l.hasAttribute('data-lg-lifted'), bend: /url\(/.test(f || ''), tint: f === ICON_REST, fl: f && f !== 'none' ? f : '', b: box(l), ch: chosen ? which() : undefined });
				requestAnimationFrame(tick);
			};
			requestAnimationFrame(tick);
			return !!l;
		},
		stop() { this.on = false; return this.frames; },
		times() { return { tDown: this.tDown, tUp: this.tUp, tAbandon: this.tAbandon || null }; },
		/* a hold abandoned with no pointerup reaching the page (R31 F2, R30 Finding 3): the window's blur, or the document
		   turning hidden, dispatched in the page as the browser would send them; the button stays down */
		abandon(how) {
			this.phase = 'abandoned'; this.tAbandon = Math.round(performance.now());
			if (how === 'blur') { window.dispatchEvent(new Event('blur')); return how; }
			const d = document;
			Object.defineProperty(d, 'hidden', { configurable: true, get: () => true });
			Object.defineProperty(d, 'visibilityState', { configurable: true, get: () => 'hidden' });
			d.dispatchEvent(new Event('visibilitychange'));
			delete d.hidden; delete d.visibilityState;
			return how;
		}
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
	await t.check(`rest: no laid-out lens bends what is under it, and only the Activity icon lens keeps a plain saturate ${tag}`, r.bent.length === 0, JSON.stringify({ laid: r.laid, bent: r.bent.length, eg: r.bent.slice(0, 4) }));
	await t.check(`rest: no lens in the page keeps a url() filter, nor any filter but the icon lens's saturate, while still ${tag}`, r.inline.length === 0, JSON.stringify({ lenses: r.lenses, inline: r.inline.length, eg: r.inline.slice(0, 3) }));
	if (r.icons.length) await t.check(`rest: the Activity icon lens rests with its saturate(1.12) and no url() filter ${tag}`, r.icons.every((x) => x.filter === 'saturate(1.12)'), JSON.stringify(r.icons));
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
	/* a strip whose app still chooses the pressed item when the press is released off it (the Activity bar: it chooses on
	   the click, 265 to 439 ms AFTER the release, never on the press; the held rows' frames, R29 F1) keeps the lens on the
	   pressed item: it rests there, and the original item is chosen again (a held click) to put the page back */
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

/* R29 F1 (2026-11-13): a press held well past its travel (--set heldMs=, 1600; the travel runs 600 ms), then released
   ON the item, a real choice. Every frame from the press to the release bends, the frames after the travel has ended
   included; after the release the lens rests unbent. Each frame also records the item the app has chosen by then, so
   the run says whether the app chose during the hold or at the release; the original item is chosen back after. */
async function heldCheck(t, f, x, tag, chosen) {
	const off = await offsetOf(t, f), o = x.other, c = x.cur, holdMs = Number(t.args.heldMs || 1600);
	const at = (b) => ({ x: off.x + b.x + b.w / 2, y: off.y + b.y + b.h / 2 });
	await t.page.mouse.move(at(o).x, at(o).y); await t.page.waitForTimeout(450);
	await f.evaluate(([i, sel]) => window.__g.watch(i, sel), [x.lens, chosen]);
	await t.page.waitForTimeout(120);
	await t.page.mouse.down(); await t.page.waitForTimeout(holdMs); await t.page.mouse.up();
	await t.page.waitForTimeout(1500);
	await f.evaluate(() => window.__g.settle(4000));
	const fr = await f.evaluate(() => window.__g.stop()), tm = await f.evaluate(() => window.__g.times());
	const held = fr.filter((z) => z.ph === 'held'), rel = fr.filter((z) => z.ph === 'released');
	const lastMv = held.reduce((k, z, n) => (z.mv ? n : k), -1), still = held.slice(lastMv + 1);
	const ch0 = fr.length ? fr[0].ch : '', k = fr.findIndex((z) => z.ch !== ch0);
	const choseAt = k < 0 ? null : { phase: fr[k].ph, msAfterDown: tm.tDown != null ? fr[k].t - tm.tDown : null, from: ch0, to: fr[k].ch };
	const relLast = rel.reduce((kk, z, n) => (z.mv ? n : kk), -1), after = rel.slice(relLast + 1);
	const row = { frames: fr.length, heldMoving: held.filter((z) => z.mv).length, heldMovingFlat: held.filter((z) => z.mv && !z.bend).length, stillHeld: still.length, stillHeldFlat: still.filter((z) => !z.bend).length,
		stillHeldMs: still.length > 1 ? still[still.length - 1].t - still[0].t : 0,
		firstFlatMsAfterDown: (() => { const z = still.find((q) => !q.bend); return z && tm.tDown != null ? z.t - tm.tDown : null; })(),
		holdMs: tm.tDown != null && tm.tUp != null ? tm.tUp - tm.tDown : null, choseAt, after: after.length, afterBent: after.filter((z) => z.bend).length };
	row.sidePanel = await f.evaluate(() => { const v = document.querySelector('#sidePanelSlot > .side-panel-view.active'), sp = document.getElementById('sidePanelSlot'); return { open: !!(sp && sp.getBoundingClientRect().width > 4), view: v ? v.id : null }; });
	const what = `${tag} ${x.strip} -> ${x.label || 'item'}`;
	t.log(`held ${what}: ${JSON.stringify(row)}`);
	/* every frame, for the report: ms after the press, phase, moving, bent, the app's chosen item */
	try {
		const { appendFileSync } = await import('node:fs'); const pathm = await import('node:path');
		appendFileSync(pathm.join(t.run.dir, 'held-frames.jsonl'), JSON.stringify({ what, row, tDown: tm.tDown, tUp: tm.tUp, frames: fr.map((z) => [tm.tDown != null ? z.t - tm.tDown : z.t, z.ph, z.mv ? 1 : 0, z.bend ? 1 : 0, z.ch]) }) + '\n');
	} catch (e) { t.log('held frames not written: ' + e); }
	/* every held frame, moving or still (R31 F6); the still part judged by its duration, not by a frame count a slow
	   machine could starve (R31 F7, R30 Finding 7): at least 600 ms of a 1.6 s hold after a 600 ms travel */
	await t.check(`held: a press held past its travel bends in every frame until the release ${what}`, row.heldMoving >= 3 && row.heldMovingFlat === 0 && row.stillHeldMs >= 600 && row.stillHeldFlat === 0, JSON.stringify(row));
	await t.check(`held: after the release it rests unbent ${what}`, row.after >= 5 && row.afterBent === 0, JSON.stringify({ after: row.after, afterBent: row.afterBent }));
	/* the original item chosen back (a held click), and the page left to settle */
	await t.page.mouse.move(at(c).x, at(c).y); await t.page.mouse.down(); await t.page.waitForTimeout(90); await t.page.mouse.up();
	await t.page.waitForTimeout(2500);
	await f.evaluate(() => window.__g.settle(4000));
}

/* R31 F1 (2026-11-13): a press held on the item already chosen, without moving: the lens does not travel, and must bend
   in every frame of the hold (it is pressed), then rest unbent after the release (no choice changes) */
async function heldSelectedCheck(t, f, x, tag) {
	const off = await offsetOf(t, f), c = x.cur, at = { x: off.x + c.x + c.w / 2, y: off.y + c.y + c.h / 2 };
	await t.page.mouse.move(at.x, at.y); await t.page.waitForTimeout(450);
	await f.evaluate((i) => window.__g.watch(i), x.lens);
	await t.page.waitForTimeout(120);
	await t.page.mouse.down(); await t.page.waitForTimeout(1200); await t.page.mouse.up();
	await t.page.waitForTimeout(800);
	const fr = await f.evaluate(() => window.__g.stop());
	const held = fr.filter((z) => z.ph === 'held'), rel = fr.filter((z) => z.ph === 'released');
	const row = { held: held.length, heldMs: held.length > 1 ? held[held.length - 1].t - held[0].t : 0, heldFlat: held.filter((z) => !z.bend).length, moved: fr.filter((z) => z.mv).length,
		released: rel.length, releasedMs: rel.length > 1 ? rel[rel.length - 1].t - rel[0].t : 0, releasedBent: rel.filter((z) => z.bend).length };
	const what = `${tag} ${x.strip} (the chosen item)`;
	t.log(`held-selected ${what}: ${JSON.stringify(row)}`);
	await t.check(`held: a press held on the chosen item bends in every frame of the hold ${what}`, row.heldMs >= 900 && row.heldFlat === 0, JSON.stringify(row));
	await t.check(`held: after the release on the chosen item it rests unbent ${what}`, row.releasedMs >= 400 && row.releasedBent === 0, JSON.stringify(row));
}

/* R31 F2, R30 Finding 3 (2026-11-13): a press on another item, held past its travel, then abandoned with no pointerup
   reaching the page (the window's blur, the document turning hidden), the button still down: from the abandonment the
   lens comes back to the item the app has chosen (it never chose the pressed one) and rests unbent; the button is then
   released off the item, so nothing is chosen */
async function abandonCheck(t, f, x, tag, how) {
	const off = await offsetOf(t, f), o = x.other, at = (b) => ({ x: off.x + b.x + b.w / 2, y: off.y + b.y + b.h / 2 });
	const away = x.vertical ? { x: off.x + o.x + o.w + 48, y: at(o).y } : { x: at(o).x, y: off.y + o.y + o.h + 36 };
	await t.page.mouse.move(at(o).x, at(o).y); await t.page.waitForTimeout(450);
	await f.evaluate((i) => window.__g.watch(i), x.lens);
	await t.page.waitForTimeout(120);
	await t.page.mouse.down(); await t.page.waitForTimeout(900);
	await f.evaluate((h) => window.__g.abandon(h), how);
	await t.page.waitForTimeout(1600);
	const fr = await f.evaluate(() => window.__g.stop());
	await t.page.mouse.move(away.x, away.y, { steps: 3 }); await t.page.mouse.up();
	await t.page.waitForTimeout(1200); await f.evaluate(() => window.__g.settle(4000));
	const ab = fr.filter((z) => z.ph === 'abandoned');
	const lastMv = ab.reduce((k, z, n) => (z.mv ? n : k), -1), rest = ab.slice(lastMv + 1);
	const end = ab.length ? ab[ab.length - 1].b : null, near = (a, b) => a && b && Math.abs(a.x - b.x) <= 1.5 && Math.abs(a.y - b.y) <= 1.5;
	const row = { abandoned: ab.length, movedAfter: ab.filter((z) => z.mv).length, movingFlat: ab.filter((z) => z.mv && !z.bend).length, restMs: rest.length > 1 ? rest[rest.length - 1].t - rest[0].t : 0,
		restBent: rest.filter((z) => z.bend).length, backOnChosen: near(end, x.box), end, start: x.box };
	const what = `${tag} ${x.strip} -> ${x.label || 'item'} (${how})`;
	t.log(`abandon ${what}: ${JSON.stringify(row)}`);
	await t.check(`held: a hold abandoned by ${how} with no pointerup comes back to the chosen item and rests unbent ${what}`, row.restMs >= 400 && row.restBent === 0 && row.movingFlat === 0 && row.backOnChosen, JSON.stringify(row));
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
	const rest1 = await f.evaluate(() => { const b = document.querySelector('i.lg-lens.lg-bead'); if (!b) return null; const s = getComputedStyle(b); return { on: b.classList.contains('on'), filter: s.backdropFilter, inline: b.style.getPropertyValue('backdrop-filter'), opacity: s.opacity }; });
	await t.check(`bead: resting on an icon it bends nothing and keeps only its plain saturate(1.1) ${tag}`, !!rest1 && rest1.on && rest1.filter === 'saturate(1.1)' && !rest1.inline, JSON.stringify(rest1));
	const i = await f.evaluate(() => window.__g.all().indexOf(document.querySelector('i.lg-lens.lg-bead')));
	await f.evaluate((k) => window.__g.watch(k), i);
	await t.page.waitForTimeout(80);
	await t.page.mouse.move(c(pair[1]).x, c(pair[1]).y);
	await t.page.waitForTimeout(900);
	const fr = await f.evaluate(() => window.__g.stop());
	const mv = fr.filter((z) => z.mv), lastMv = fr.reduce((k, z, n) => (z.mv ? n : k), -1), after = fr.slice(lastMv + 1);
	await t.check(`bead: it bends in every frame it flows to the neighbour, and rests unbent with its plain saturate(1.1) ${tag}`, mv.length >= 3 && mv.every((z) => z.bend) && after.length >= 5 && after.every((z) => !z.bend && z.fl === 'saturate(1.1)'),
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
			if (view === 'home') {
				/* a press held well past its travel (R29 F1): the Activity bar, and the title bar's page tabs as the control */
				for (const [sel, chosen] of [['#activityBar', '#activityBar .icon[data-lg-current]'], ['nav.page-tabs', 'nav.page-tabs .page-tab.active']]) {
					await parkPointer(t.page, W, H); await t.page.waitForTimeout(600); await f.evaluate(() => window.__g.settle(4000));
					/* the Activity bar's lens shows only while a side panel is open: an earlier choice may have shut it */
					if (sel === '#activityBar' && await f.evaluate(() => { const sp = document.getElementById('sidePanelSlot'); return !(sp && sp.getBoundingClientRect().width > 4); })) {
						const fi = await f.evaluate(() => { const i = document.querySelector('#activityBar .icon[data-target="panel-files"]'); if (!i) return null; const r = i.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
						if (fi) { const off = await offsetOf(t, f); await t.page.mouse.move(off.x + fi.x + fi.w / 2, off.y + fi.y + fi.h / 2); await t.page.mouse.down(); await t.page.waitForTimeout(90); await t.page.mouse.up(); await t.page.waitForTimeout(1500); await parkPointer(t.page, W, H); await f.evaluate(() => window.__g.settle(4000)); }
					}
					const xs = await f.evaluate(() => window.__g.targets()), x = xs.find((z) => z.strip === sel && z.other);
					if (!x) { await t.check(`held: ${sel} has its lens and another item ${tag}`, false, JSON.stringify(xs.map((z) => ({ strip: z.strip, kind: z.kind, other: !!z.other, box: z.box })))); continue; }
					await heldCheck(t, f, x, tag, chosen);
				}
				/* the page tabs: a press held on the chosen tab, and holds abandoned without a pointerup */
				await parkPointer(t.page, W, H); await f.evaluate(() => window.__g.settle(4000));
				const xp = (await f.evaluate(() => window.__g.targets())).find((z) => z.strip === 'nav.page-tabs' && z.other);
				if (!xp) await t.check(`held: the page tabs have their lens ${tag}`, false, '');
				else await heldSelectedCheck(t, f, xp, tag);
				for (const how of ['blur', 'hidden']) {
					await parkPointer(t.page, W, H); await f.evaluate(() => window.__g.settle(4000));
					const y = (await f.evaluate(() => window.__g.targets())).find((z) => z.strip === 'nav.page-tabs' && z.other);
					if (y) await abandonCheck(t, f, y, tag, how); else await t.check(`held: the page tabs have their lens for ${how} ${tag}`, false, '');
				}
			}
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
		const anyF = await f.evaluate(() => window.__g.all().filter((l) => window.__g.laid(l) && getComputedStyle(l).backdropFilter !== 'none').length);
		await t.check(`look: no lens carries any backdrop filter in Basic Dark ${look} ${surface}`, anyF === 0 && basic.inline.length === 0 && basic.bent.length === 0, JSON.stringify({ anyF, bent: basic.bent.slice(0, 3), inline: basic.inline.slice(0, 3) }));
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
			rec.relive = await f.evaluate(() => { let n = 0; window.__g.all().forEach((l) => { if (window.__g.laid(l) && l.__lgBf && !/url\(/.test(l.style.getPropertyValue('backdrop-filter'))) { l.__pxPut = [l.style.getPropertyValue('backdrop-filter'), l.style.getPropertyValue('-webkit-backdrop-filter')]; l.style.setProperty('backdrop-filter', l.__lgBf, 'important'); l.style.setProperty('-webkit-backdrop-filter', l.__lgBf, 'important'); n++; } }); return n; });
			if (rec.relive) {
				await t.page.waitForTimeout(300); await shot(`${tag}-relive`);
				await f.evaluate(() => window.__g.all().forEach((l) => { const k = l.__pxPut; if (!k) return; l.__pxPut = null; ['backdrop-filter', '-webkit-backdrop-filter'].forEach((p, j) => { if (k[j]) l.style.setProperty(p, k[j], 'important'); else l.style.removeProperty(p); }); }));
			}
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
			/* the same paused frame with the lens dressed as at rest for one shot (its live filter off; the icon lens's resting
			   saturate on, R2) and put back: what the hand-over itself changes, apart from the press and the choice */
			const flat = async (name) => {
				/* the lens dressed as at rest: no filter, or the build's resting tint where it keeps one (the icon lens, R2) */
				const had = await f.evaluate((i) => { const l = window.__g.all()[i], v = l.style.getPropertyValue('backdrop-filter'); if (v) { l.__pxKeep = [v, l.style.getPropertyValue('-webkit-backdrop-filter')]; l.style.removeProperty('backdrop-filter'); l.style.removeProperty('-webkit-backdrop-filter'); if (l.__lgRest) { l.style.setProperty('backdrop-filter', l.__lgRest, 'important'); l.style.setProperty('-webkit-backdrop-filter', l.__lgRest, 'important'); } } return !!v; }, x.lens);
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

/* --set parts=restcost (Windows; the lead's condition on R2, 2026-11-13): Home at rest, one page load (?pm-warm=0), per
   look, rounds of three states, each measured by a DevTools trace (--set ms=, 4000) after 800 ms: rest (as the build
   draws it: the Activity icon lens's plain saturate), bare (that saturate taken off: no lens has a backdrop filter) and
   live (every laid-out lens's own url() filter put back, as main draws them), in turn ABC then CBA (--set rounds=, 4).
   R2's price is rest - bare; the lens change's gain is live - rest. Rows in restcost.json in the run folder. */
async function restcostPart(t, surface, W, H) {
	const { traceWindow } = await import('../helpers/frame-trace.mjs');
	const { writeFileSync } = await import('node:fs');
	const pathm = await import('node:path');
	const f = await t.app.open({ query: 'pm-warm=0' });
	await f.evaluate(PROBE);
	await f.evaluate(() => document.fonts.ready.then(() => true));
	await t.page.waitForTimeout(Number(t.args.settle ?? 40000));
	const cdp = await t.page.context().newCDPSession(t.page);
	const ms = Number(t.args.ms || 4000), rounds = Number(t.args.rounds || 4), rows = [];
	const set = (state) => f.evaluate((st) => {
		const g = window.__g, P = ['backdrop-filter', '-webkit-backdrop-filter']; let n = 0;
		g.all().forEach((l) => {
			if (!l.__pxRest) l.__pxRest = P.map((p) => l.style.getPropertyValue(p));   /* the build's own resting values */
			const put = (vals) => P.forEach((p, j) => { if (vals[j]) l.style.setProperty(p, vals[j], 'important'); else l.style.removeProperty(p); });
			if (st === 'rest') put(l.__pxRest);
			else if (st === 'bare') { if (l.__pxRest[0]) n++; put(['', '']); }
			else if (st === 'live') { if (g.laid(l) && l.__lgBf) { put([l.__lgBf, l.__lgBf]); n++; } else put(l.__pxRest); }
		});
		return n;
	}, state);
	const median = (v) => { const s = v.filter((x) => x != null).sort((a, b) => a - b); return s.length ? s[s.length >> 1] : null; };
	for (const look of list(t.args.looks, LOOKS)) {
		await t.app.look(look);
		await f.evaluate((p) => PM_PAGES.go(p), VIEWS.home);
		await t.page.waitForTimeout(8000);
		await parkPointer(t.page, W, H);
		await f.evaluate(() => window.__g.settle());
		await f.evaluate(() => window.__g.all().forEach((l) => { l.__pxRest = null; }));
		const icon = await f.evaluate(() => window.__g.all().filter((l) => l.getAttribute('data-lg-lens') === 'lensIcon' && window.__g.laid(l)).map((l) => getComputedStyle(l).backdropFilter));
		t.log(`${look} home: icon lens at rest ${JSON.stringify(icon)}`);
		for (let r = 0; r < rounds; r++) {
			for (const st of r % 2 ? ['live', 'bare', 'rest'] : ['rest', 'bare', 'live']) {
				const n = await set(st);
				await t.page.waitForTimeout(800);
				const x = await traceWindow(cdp, { ms, url: f.url() });
				rows.push({ look, round: r, state: st, changed: n, main: x.cost.main, gpu: x.cost.gpuMain, viz: x.cost.viz, comp: x.cost.compositor, raster: x.cost.raster, mainFrames: x.mainFrames.perSec, drawn: x.drawn.perSec });
			}
			await set('rest');
		}
		const by = (st, k) => median(rows.filter((z) => z.look === look && z.state === st).map((z) => z[k]));
		const line = (k) => `${k} rest ${Math.round(by('rest', k))} bare ${Math.round(by('bare', k))} live ${Math.round(by('live', k))} | R2 price ${Math.round(by('rest', k) - by('bare', k))} gain ${Math.round(by('live', k) - by('rest', k))}`;
		t.log(`${look} home restcost (medians of ${rounds}, ms/s): ${['main', 'gpu', 'viz', 'comp'].map(line).join(' || ')}`);
	}
	writeFileSync(pathm.join(t.run.dir, 'restcost.json'), JSON.stringify(rows, null, 1));
	await cdp.detach().catch(() => {});
	await t.check('restcost: rows written', rows.length > 0, String(rows.length));
}

/* --set parts=beadpx (lane G, the lead's question on the bead, 2026-11-13): the hover bead's flow between two
   neighbouring Activity icons on Home, per look, the rest of the page frozen: its last frame (end - 8.3 ms), the same
   frame dressed as at rest (its live filter off; its resting tint on where the build keeps one) and the first frame
   after the flow ended. PNGs and beadpx.json in the run folder. */
async function beadPixelsPart(t, surface, W, H) {
	const { writeFileSync } = await import('node:fs');
	const pathm = await import('node:path');
	const f = await t.app.open({});
	await f.evaluate(PROBE);
	await f.evaluate(() => document.fonts.ready.then(() => true));
	await t.page.waitForTimeout(Number(t.args.settle ?? 8000));
	const shot = async (name) => { const b = await t.page.screenshot({ type: 'png' }); writeFileSync(pathm.join(t.run.dir, name + '.png'), b); };
	const beadState = () => f.evaluate(() => { const b = document.querySelector('i.lg-lens.lg-bead'); if (!b) return null; const r = b.getBoundingClientRect(); return { filter: getComputedStyle(b).backdropFilter, on: b.classList.contains('on'), box: { x: r.left, y: r.top, w: r.width, h: r.height } }; });
	const out = {};
	for (const look of list(t.args.looks, LOOKS)) {
		await t.app.look(look);
		await f.evaluate((p) => PM_PAGES.go(p), VIEWS.home);
		await t.page.waitForTimeout(3000);
		await parkPointer(t.page, W, H);
		await f.evaluate(() => window.__g.settle());
		const icons = await f.evaluate(() => [...document.querySelectorAll('#activityBar .icon[data-target]:not([data-lg-current])')]
			.filter((e) => { const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4; })
			.map((e) => { const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; }));
		let pair = null;
		for (let i = 0; i + 1 < icons.length && !pair; i++) if (Math.hypot(icons[i + 1].x - icons[i].x, icons[i + 1].y - icons[i].y) < 100) pair = [icons[i], icons[i + 1]];
		await t.check(`beadpx: two neighbouring Activity icons ${look}`, !!pair, JSON.stringify(icons));
		if (!pair) continue;
		const off = await offsetOf(t, f), c = (r) => ({ x: off.x + r.x + r.w / 2, y: off.y + r.y + r.h / 2 });
		await t.page.mouse.move(c(pair[0]).x, c(pair[0]).y, { steps: 3 });
		await t.page.waitForTimeout(900);
		await f.evaluate(() => { const list = document.getAnimations(); window.__pre = new Set(list); list.forEach((a) => { try { if (a.playState === 'running' || a.playState === 'pending') a.pause(); } catch (e) { /* gone */ } }); });
		await t.page.waitForTimeout(250);
		const rec = out[look] = { from: pair[0], to: pair[1], frames: {} };
		rec.frames.rest0 = await beadState(); await shot(`bead-${look}-r0-rest-on-first`);
		await t.page.mouse.move(c(pair[1]).x, c(pair[1]).y);
		rec.made = await f.evaluate(() => { const n = document.getAnimations().filter((a) => !window.__pre.has(a)); window.__new = n; n.forEach((a) => { try { a.pause(); } catch (e) { /* gone */ } }); return n.map((a) => (a.effect && a.effect.target ? (a.effect.target.className && a.effect.target.className.baseVal !== undefined ? a.effect.target.className.baseVal : String(a.effect.target.className)) : '?') + ':' + Math.round(a.effect ? a.effect.getComputedTiming().endTime : 0)); });
		await f.evaluate(() => window.__new.forEach((a) => { try { a.currentTime = a.effect.getComputedTiming().endTime - 1000 / 120; } catch (e) { /* gone */ } }));
		await t.page.waitForTimeout(300);
		rec.frames.last = await beadState(); await shot(`bead-${look}-t4-last`);
		const had = await f.evaluate(() => { const l = document.querySelector('i.lg-lens.lg-bead'), v = l.style.getPropertyValue('backdrop-filter'); if (v) { l.__pxKeep = [v, l.style.getPropertyValue('-webkit-backdrop-filter')]; l.style.removeProperty('backdrop-filter'); l.style.removeProperty('-webkit-backdrop-filter'); if (l.__lgRest) { l.style.setProperty('backdrop-filter', l.__lgRest, 'important'); l.style.setProperty('-webkit-backdrop-filter', l.__lgRest, 'important'); } } return !!v; });
		if (had) {
			await t.page.waitForTimeout(250); rec.frames.lastFlat = await beadState(); await shot(`bead-${look}-t4-last-flat`);
			await f.evaluate(() => { const l = document.querySelector('i.lg-lens.lg-bead'), k = l.__pxKeep; l.__pxKeep = null; if (k) { l.style.setProperty('backdrop-filter', k[0], 'important'); l.style.setProperty('-webkit-backdrop-filter', k[1] || k[0], 'important'); } });
			await t.page.waitForTimeout(150);
		}
		await f.evaluate(() => new Promise((r) => { window.__new.forEach((a) => { try { a.finish(); } catch (e) { /* gone */ } }); requestAnimationFrame(() => requestAnimationFrame(r)); }));
		await t.page.waitForTimeout(250);
		rec.frames.after = await beadState(); await shot(`bead-${look}-t5-after`);
		await f.evaluate(() => document.getAnimations().forEach((a) => { try { if (a.playState === 'paused') a.play(); } catch (e) { /* gone */ } }));
		await parkPointer(t.page, W, H); await t.page.waitForTimeout(600);
		t.log(`beadpx ${look}: ${JSON.stringify({ made: rec.made, frames: Object.fromEntries(Object.entries(rec.frames).map(([k, v]) => [k, v && v.filter])) })}`);
		await t.check(`beadpx: the bead flowed and its last frame bends ${look}`, !!(rec.frames.last && /url\(/.test(rec.frames.last.filter)) && had, JSON.stringify(rec.frames.last));
	}
	writeFileSync(pathm.join(t.run.dir, 'beadpx.json'), JSON.stringify(out, null, 1));
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
		tests[`PERF-4 lens resting tint cost`] = named('restcost', restcostPart);
		tests[`PERF-4 bead pixels`] = named('beadpx', beadPixelsPart);
	}
}
