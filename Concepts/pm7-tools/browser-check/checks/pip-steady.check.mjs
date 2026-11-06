// FO-30 (also FO-43): Pip's head, sometimes its whole body, vanished for one or two painted frames during onboarding:
// after a look change, on wake-up, on presses and hovers on the NAS screens, while its strings, controller, bubble and
// props stayed. Cause (fixed in c76d1cf756): the Retro Light printer head's rule also matched Pip's SVG head, so a
// 50 ms transform transition restarted on it every frame and Chrome composited the head alone, dropping and promoting
// that layer on busy frames; a rebuilt rig was drawn before it was posed.
//
// One model (helpers/pip-witness.mjs): an end-of-frame witness records every page frame (the look, what the page
// declares about the frame, Pip's head and controller boxes, and their paint: display, visibility, effective opacity,
// filters, clips, masks, painted leaves), paints that frame's number into a tag in the frame's corner, and calibrates
// every look the run shows (Pip as painted, then head and controller hidden for 24 frames, then painted again).
// This check drives the route and judges the records (structural). The required gate records it and scans every film
// frame against the reference of the look that frame names (paint):
//   node Concepts/pm7-tools/browser-check/tools/pip-steady-gate.mjs --page <build> --out <fresh-dir>
// This file alone is structural coverage only.
//
// Route, both surfaces (--set sandbox=0|1, default both in turn; a recording takes one):
//   welcome: each look applied as the window applies it; calibrated; Pip put to sleep (the stage's own wake(), as
//            entering Welcome does) and calibrated asleep; woken by a real pointer arrival;
//   tiles:   the Pick a look screen's Light/Dark and five tiles, each press asserted applied and its cover ended;
//   begin:   each look again; the cause per look: no transition or animation on the rig (40 frames), the head not a
//            compositor layer of its own (CDP LayerTree, normal surface);
//   smb:     each look on the NAS share screen, then presses and hovers (Check access, Back, share cards, Continue).
// --set looks=friendly-light,nier-dark limits the looks; --set phases=welcome,smb the phases; --set reps=N repeats
// the SMB presses per look (default 1). About 7 minutes per surface with every look.
import fs from 'node:fs';
import path from 'node:path';
import { installWitness, FIELDS, TAG, readWitness, evaluateWitness } from '../helpers/pip-witness.mjs';

const LAYER = '#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out)';
const LOOKS = ['basic', 'friendly', 'retro', 'glass', 'nier'].flatMap((f) => [`${f}-light`, `${f}-dark`]);
const PHASES = ['welcome', 'tiles', 'begin', 'smb'];
const STAGE = '#pm-o55-onboarding .o55-stage';
class RouteDone extends Error {}

async function surface(t, sandbox) {
	const looks = t.args.looks ? String(t.args.looks).split(',') : LOOKS;
	const phases = t.args.phases ? String(t.args.phases).split(',') : PHASES;
	const bad = [...looks.filter((l) => !LOOKS.includes(l)), ...phases.filter((p) => !PHASES.includes(p))];
	if (bad.length) throw new Error(`unknown look or phase: ${bad.join(', ')}`);
	const f = await t.app.open({ sandbox });
	const page = t.page, sleep = (ms) => page.waitForTimeout(ms);
	const off = f === page.mainFrame() ? { x: 0, y: 0 } : await page.evaluate(() => { const e = document.querySelector('iframe'), r = e.getBoundingClientRect(), cs = getComputedStyle(e); return { x: r.left + parseFloat(cs.borderLeftWidth) + parseFloat(cs.paddingLeft), y: r.top + parseFloat(cs.borderTopWidth) + parseFloat(cs.paddingTop) }; });
	const settle = () => f.waitForFunction(() => {
		const S = window.O55 && window.O55.S, r = document.getElementById('pm-o55-onboarding');
		if (!S || !S.open || !S.sess || !r) return false;
		const l = r.querySelector('.o55-pane > .o55-layer:not(.o55-out)');
		if (!l || l.getAttribute('data-screen') !== S.sess.screen) return false;
		if (r.matches('.o55-hold, .o55-opening, .o55-closing') || l.matches('.o55-hold, .o55-entering') || r.querySelector('.o55-pane > .o55-out')) return false;
		return !l.getAnimations({ subtree: false }).some((a) => a.playState === 'running' && Number.isFinite(a.effect.getComputedTiming().endTime));
	}, null, { timeout: 20000 });
	const screen = () => f.evaluate(() => window.O55.S.sess && window.O55.S.sess.screen);
	const box = async (sel) => { const b = await f.evaluate((s) => { const e = [...document.querySelectorAll(s)].find((x) => x.getClientRects().length && !x.closest('[inert]')); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height }; }, sel); return b && { ...b, x: b.x + off.x, y: b.y + off.y }; };
	const phase = (s) => f.evaluate((x) => window.__pipSteady && window.__pipSteady.setLabel(x), s);
	const hover = async (sel, ms, name) => { const b = await box(sel); if (!b) return false; t.mark('hover ' + name); await page.mouse.move(b.x, b.y, { steps: 5 }); await sleep(ms); return true; };
	const press = async (sel, name) => { const b = await box(sel); if (!b) throw new Error('no ' + name); await page.mouse.move(b.x, b.y, { steps: 5 }); await sleep(220); t.mark('press ' + name); await page.mouse.down(); await sleep(60); await page.mouse.up(); };
	const primary = async (name) => { await settle(); await f.waitForFunction((s) => { const b = document.querySelector(s); return b && !b.disabled && b.getAttribute('aria-disabled') !== 'true'; }, `${LAYER} .o55-primary`, { timeout: 15000 }); await press(`${LAYER} .o55-primary`, name); await settle(); };
	const act = async (a, arg) => { await settle(); await press(`${LAYER} [data-o55-do="${a}"]` + (arg != null ? `[data-arg="${arg}"]` : ''), a + ' ' + (arg || '')); await settle(); };
	const type = async (bind, text) => {
		await settle(); const sel = `${LAYER} [data-o55-bind="${bind}"]`;
		for (let k = 0; k < 3; k++) {
			await f.evaluate((s) => { const e = document.querySelector(s); e.focus(); e.select && e.select(); }, sel);
			await page.keyboard.press('Backspace'); await page.keyboard.insertText(text);
			if (await f.waitForFunction(([s, v]) => { const e = document.querySelector(s); return e && e.value === v; }, [sel, text], { timeout: 3000 }).then(() => true, () => false)) { await sleep(450); return; }
		}
		throw new Error(`field ${bind} did not take its text`);
	};
	/* a look as the onboarding window applies it, asserted applied with its cover ended */
	const awaitLook = async (fam, mode, name) => {
		const ok = await f.waitForFunction(([a, b]) => {
			const th = window.O55.theme();
			return th.chosen === a && th.mode === b && !document.documentElement.hasAttribute('data-o55-vt') && !window.O55.S.vt
				&& !document.querySelector('#o55np-reboot, #o55np-calm') && !window.PM_THEME_TRANSITION?.busy?.() && !window.O55.nierLook?.busy?.();
		}, [fam, mode], { timeout: 20000 }).then(() => true, () => false);
		await t.check(`${name}: ${fam}-${mode} applied and look cover ended`, ok, JSON.stringify(await f.evaluate(() => window.O55.theme())));
		if (!ok) throw new Error(`${name} did not apply ${fam}-${mode} and finish its look cover`);
		await settle();
	};
	/* the look's own reference on film: Pip as painted, hidden, painted again (helpers/pip-witness.mjs) */
	const calibrate = async (label) => {
		await sleep(1200);
		let r;
		for (let k = 0; k < 3; k++) {
			r = await f.evaluate((l) => window.__pipSteady.calibrate(l), label);
			if (r.ok) break;
			await settle(); await sleep(800);
		}
		await t.check(`calibrated ${label}`, !!r.ok, JSON.stringify(r));
		if (!r.ok) throw new Error(`no calibration for ${label}: ${r.why}`);
	};
	const look = async (name, where) => {
		const [fam, mode] = name.split('-');
		t.mark(`look ${name} (${where})`);
		await f.evaluate(([a, b]) => window.O55.ui.applyLook(a, b), [fam, mode]);
		await awaitLook(fam, mode, `${where} look ${name}`);
		await calibrate(`${name} ${where}`);
	};
	const current = () => f.evaluate(() => { const th = window.O55.theme(); return `${th.chosen}-${th.mode}`; });
	const backTo = async (want) => {
		for (let k = 0; k < 4 && (await screen()) !== want; k++) {
			await settle(); await press(`${LAYER} .o55-back`, 'Back');
			await f.waitForFunction((w) => window.O55.S.sess.screen === w, want, { timeout: 4000 }).catch(() => {}); await settle();
		}
		return t.check(`Back reached ${want}`, (await screen()) === want, await screen());
	};
	/* the log, written as the run goes so a stopped run still leaves what it measured */
	const file = path.join(t.run.dir, `pip-witness-${sandbox ? 'sandbox' : 'normal'}.jsonl`);
	if (fs.existsSync(file)) throw new Error(`${file} exists: one witness log per surface and run`);
	let count = 0;
	/* everything recorded so far, in one read (a loop until empty never ends while the page draws) */
	let nStr = 0, nCal = 0;
	const flush = async () => {
		const o = await f.evaluate(([a, b]) => { const W = window.__pipSteady; return { recs: W.take(1e9), strings: W.strings.slice(a), cals: W.cals.slice(b) }; }, [nStr, nCal]);
		if (!o.recs.length && !o.strings.length && !o.cals.length) return;
		fs.appendFileSync(file, JSON.stringify({ kind: 'recs', stringsFrom: nStr, ...o }) + '\n');
		count += o.recs.length; nStr += o.strings.length; nCal += o.cals.length;
	};

	await f.evaluate(() => window.O55.ui.open({ fresh: true }));
	await settle();
	const header = await f.evaluate(installWitness, { ...TAG, fields: FIELDS, ox: off.x, oy: off.y });
	fs.writeFileSync(file, JSON.stringify({ ...header, surface: sandbox ? 'sandbox' : 'normal', page: t.args.page || null, recording: !!t.recording, looks, phases }) + '\n');
	await phase('start');
	await calibrate(`${await current()} start`);

	try {
		/* welcome: each look, then asleep and a real wake-up */
		if (phases.includes('welcome')) {
			await t.check('on welcome', (await screen()) === 'welcome', await screen());
			await phase('welcome');
			for (const name of looks) {
				if ((await current()) !== name) await look(name, 'welcome'); else await calibrate(`${name} welcome`);
				await f.evaluate((s) => window.O55.pipStage.of(document.querySelector(s)).wake(), STAGE);
				const asleep = await f.waitForFunction((s) => window.O55.pipStage.of(document.querySelector(s)).sleepZ, STAGE, { timeout: 4000 }).then(() => true, () => false);
				await t.check(`${name}: Pip asleep on Welcome`, asleep);
				await sleep(1300);
				await calibrate(`${name} asleep`);
				/* a real arrival: the pointer travels over the content, away from Pip (59-cheer.js wake: after 0.9 s, 24 px) */
				const b = await box(`${LAYER} .o55-primary`);
				t.mark(`wake ${name}`);
				await page.mouse.move(b.x - 160, b.y - 90, { steps: 4 }); await page.mouse.move(b.x, b.y, { steps: 12 });
				let awake = await f.waitForFunction((s) => !window.O55.pipStage.of(document.querySelector(s)).sleepZ, STAGE, { timeout: 2500 }).then(() => true, () => false);
				if (!awake) { await page.mouse.move(b.x - 200, b.y, { steps: 12 }); awake = await f.waitForFunction((s) => !window.O55.pipStage.of(document.querySelector(s)).sleepZ, STAGE, { timeout: 3000 }).then(() => true, () => false); }
				await t.check(`${name}: Pip woke on a real arrival`, awake);
				await sleep(2400);
				await flush();
			}
		}
		/* a narrowed run ends where its last phase ends: the screens past it would be shown without a calibration */
		const later = (p) => phases.some((x) => PHASES.indexOf(x) > PHASES.indexOf(p));
		if (!later('welcome')) throw new RouteDone();
		await primary('welcome');
		/* tiles: real Light/Dark and tile presses on Pick a look */
		if (phases.includes('tiles')) {
			await t.check('on look', (await screen()) === 'look', await screen());
			await phase('tiles');
			for (const mode of ['light', 'dark']) {
				const fam0 = (await current()).split('-')[0];
				await press(`${LAYER} [data-o55-do="pickMode"][data-arg="${mode}"]`, 'mode ' + mode);
				await awaitLook(fam0, mode, 'mode press ' + mode);
				await calibrate(`${fam0}-${mode} tiles`);
				for (const fam of ['friendly', 'glass', 'retro', 'nier', 'basic']) {
					await press(`${LAYER} .o55-tile[data-arg="${fam}"]`, `look ${fam}-${mode}`);
					await awaitLook(fam, mode, `tile press ${fam}-${mode}`);
					await calibrate(`${fam}-${mode} tiles`);
				}
				await flush();
			}
		}
		if (!later('tiles')) throw new RouteDone();
		if ((await screen()) === 'look') await primary('look');
		if ((await screen()) === 'where') await primary('where');
		/* begin: each look again, with the cause asserted per look */
		if (phases.includes('begin')) {
			await phase('begin');
			const cdp = sandbox ? null : await page.context().newCDPSession(page);
			for (const name of looks) {
				if ((await current()) !== name) await look(name, 'begin'); else await calibrate(`${name} begin`);
				const css = await f.evaluate(async (s) => {
					const st = window.O55.pipStage.of(document.querySelector(s)), rig = [st.gPip, ...st.gPip.querySelectorAll('*')], out = [];
					for (let i = 0; i < 40 && !out.length; i++) {
						await new Promise((r) => requestAnimationFrame(r));
						for (const e of rig) {
							const cs = getComputedStyle(e), props = cs.transitionProperty.split(',').map((x) => x.trim()), durs = cs.transitionDuration.split(',').map(parseFloat);
							/* a transition anywhere on the rig; an animation on its own groups (the face's designed hop is not one) */
							const tr = props.some((p, k) => (p === 'all' || p === 'transform') && (durs[k % durs.length] || 0) > 0), an = [st.gPip, st.gHead, st.gCtl, ...st.pstrs].includes(e) ? e.getAnimations().length : e.getAnimations().filter((a) => a instanceof CSSTransition).length;
							if ((tr || an) && out.length < 6) out.push(`${e.tagName.toLowerCase()}.${e.getAttribute('class') || ''}: ${tr ? 'transition ' + cs.transition : ''}${an ? ' ' + an + ' animation(s)' : ''}`);
						}
					}
					return out;
				}, STAGE);
				await t.check(`${name}: no transition on Pip's rig, no animation on its groups`, !css.length, css.join(' | '));
				if (cdp) {
					const trees = [], on = (e) => { trees.push(e.layers || []); };
					cdp.on('LayerTree.layerTreeDidChange', on);
					let head;
					try {
						await cdp.send('DOM.enable'); await cdp.send('LayerTree.enable');
						const doc = await cdp.send('DOM.getDocument', { depth: 0 });
						const q = await cdp.send('DOM.querySelector', { nodeId: doc.root.nodeId, selector: '#pm-o55-onboarding .pst-pip > g.pst-head' });
						head = q.nodeId && (await cdp.send('DOM.describeNode', { nodeId: q.nodeId })).node.backendNodeId;
						await sleep(1500);
					} finally { cdp.off('LayerTree.layerTreeDidChange', on); await cdp.send('LayerTree.disable'); }
					const seen = trees.filter((tr) => tr.some((l) => l.backendNodeId === head)).length;
					await t.check(`${name}: Pip's head is not a compositor layer of its own`, !!head && trees.length > 0 && !seen, `head in its own layer in ${seen} of ${trees.length} layer-tree updates${head ? '' : ' (head not found)'}`);
				}
				await flush();
			}
		}
		/* smb: each look on the share screen, then its presses and hovers */
		if (!later('begin')) throw new RouteDone();
		if (phases.includes('smb')) {
			if ((await screen()) === 'begin') { await act('pick', 'existing'); await act('sub', 'device'); await primary('begin'); }
			await t.check('on nas-find', (await screen()) === 'nas-find', await screen());
			await act('method', 'smb'); await act('share', 'smb-home'); await primary('find continue');
			await t.check('on nas-smb', (await screen()) === 'nas-smb', await screen());
			await type('user', 'jared');
			await phase('smb');
			const reps = Number(t.args.reps || 1);
			let i = 0;
			for (const name of looks) {
				if ((await screen()) !== 'nas-smb') { await backTo('nas-find'); await primary('find continue'); }
				if ((await current()) !== name) await look(name, 'nas-smb'); else await calibrate(`${name} nas-smb`);
				for (let k = 0; k < reps; k++, i++) {
					if (!(await f.evaluate((s) => { const e = document.querySelector(s); return e && e.value; }, `${LAYER} [data-o55-bind="user"]`))) await type('user', 'jared');
					await type('pw', 'secret-' + i);
					await hover(`${LAYER} .o55-back`, 300, 'Back');
					await hover(`${LAYER} .o55-primary`, 450, 'Check access');
					await primary('Check access');
					await f.waitForFunction(() => !Object.values(window.O55.S.sess.ops || {}).some((v) => v.state === 'running' || v.state === 'pending'), null, { timeout: 15000 }).catch(() => {});
					await sleep(500);
					await backTo('nas-find');
					await hover(`${LAYER} [data-o55-do="share"][data-arg="smb-media"]`, 300, 'card media');
					await hover(`${LAYER} .o55-primary`, 500, 'Continue');
					await hover(`${LAYER} [data-o55-do="share"][data-arg="smb-home"]`, 250, 'card home');
					await primary('find continue');
				}
				await flush();
			}
		}
		await phase('end');
		await sleep(600);
	} catch (e) {
		if (!(e instanceof RouteDone)) throw e;
		await phase('end');
		await sleep(600);
	} finally {
		/* read the witness out whatever happened, so the scanner never judges a film against a missing log */
		await f.evaluate(() => window.__pipSteady.stop()).catch(() => {});
		await sleep(100);
		await flush().catch(() => {});
		const tail = await f.evaluate(() => ({ err: window.__pipSteady.err, errMsg: window.__pipSteady.errMsg, seq: window.__pipSteady.seq, prof: window.__pipSteady.prof })).catch((e) => ({ lost: String(e) }));
		fs.appendFileSync(file, JSON.stringify({ kind: 'end', count, ...tail }) + '\n');
	}
	/* structural judgement of every recorded frame */
	const w = readWitness(fs.readFileSync(file, 'utf8'));
	const S = (i) => (i >= 0 ? w.strings[i] : '');
	const vis = w.recs.filter((r) => r[w.F.cls] === 'v');
	const costs = w.recs.map((r) => r[w.F.cost]).sort((a, b) => a - b), p95 = costs[Math.floor(costs.length * 0.95)] || 0, mean = costs.reduce((a, b) => a + b, 0) / Math.max(1, costs.length);
	const gaps = w.recs.slice(1).map((r, i) => r[w.F.t] - w.recs[i][w.F.t]).sort((a, b) => a - b), interval = gaps[gaps.length >> 1] || 16.7;
	t.log(`witness cost by part (ms per frame): ${JSON.stringify(Object.fromEntries(Object.entries(w.end.prof || {}).filter(([k]) => k !== 'n').map(([k, v]) => [k, +(v / Math.max(1, w.end.prof.n)).toFixed(3)])))}`);
	t.log(`witness: ${w.recs.length} frames, ${vis.length} visible, cost p95 ${(p95 / 1000).toFixed(2)} ms, ${w.cals.filter((c) => c.ok).length} calibrations, log ${file}`);
	for (const r of evaluateWitness(w)) await t.check(r.name, r.ok, r.detail);
	for (const p of ['welcome', 'tiles', 'begin', 'smb'].filter((x) => phases.includes(x))) for (const r of evaluateWitness(w, { phase: p }).slice(1, 3)) await t.check(r.name, r.ok, r.detail);
	/* the witness runs in every frame and must not change what the page draws: under 15 % of the page's own frame
	   (0.6 ms a frame on the RTX 3090 host, 1.7 ms on the P1000 VM, more on a loaded Nas1; one document.getAnimations()
	   a frame is most of it, and nothing cheaper sees every animation in the frame it starts). The film's coverage
	   shows whether the page still drew its frames */
	await t.check(`the witness takes under 15 % of the page's frame (mean ${(mean / 1000).toFixed(2)} ms of a ${interval.toFixed(1)} ms frame, p95 ${(p95 / 1000).toFixed(2)} ms)`, mean / 1000 < 0.15 * interval, 'a heavy witness could change what the page paints');
	const shown = [...new Set(vis.map((r) => S(r[w.F.look])))];
	await t.check(`every requested look was shown (${looks.join(', ')})`, looks.every((l) => shown.includes(l)), `shown: ${shown.join(', ')}`);
}

export const tests = Object.fromEntries(['normal', 'sandbox'].map((s) => [`pip head steady (${s})`, async (t) => {
	if (!t.app.surfaces().includes(s)) { t.log(`skipped: --set sandbox selects the other surface`); return; }
	if (t.recording && t.app.surfaces().length > 1) throw new Error('a recording takes one surface: --set sandbox=0 or 1 (the gate runs one at a time)');
	await surface(t, s === 'sandbox');
}]));
