// FO-30 (also FO-43): Pip's body vanished for one painted frame on some presses and hovers (Check access, Continue on
// nas-find, Name's arrival) and at a look flip, while its strings, controller, bubble and props stayed.
// Cause: the Retro Light printer head's rule ('#pm-o55-onboarding .pst-head { ...; transition: transform .05s linear }')
// also matched Pip's own SVG head <g class="pst-head">, in every look. Every frame the rig wrote the head's transform,
// so every frame a new 50 ms transform transition started on the head alone; Chrome composited it (the head in a compositor
// layer of its own, reason ActiveTransformAnimation), promoted and dropped again as the chain of transitions broke on a
// busy frame. A frame in that churn painted no head. After a rebuild (a look change) the new head's first transform
// transitioned from none: a small head at the stage's corner while the strings ended in the air.
// This check asserts, on both surfaces (--set sandbox=0|1, default both in turn):
//   1. the cause: no part of Pip's rig carries a transition or an animation, in all ten looks (computed style and
//      getAnimations(), every frame for 40 frames per look), and, on the normal surface, no compositor layer of its own for
//      the head (CDP LayerTree);
//   2. DOM state samples after rendering through look flips by the Pick a look tiles and through
//      presses and hovers on the SMB route (Check access, Back, Continue, a share card): both strings end on the head's
//      DOM box, and the rig is never unplaced (a head with no transform, strings with no path);
//   3. pixels in Basic Light: bursts of captures of Pip's box right after each press and hover each show Pip's body
//      (#0056B3) over at least 12 % of the box.
// Required FO-30 gate: node Concepts/pm7-tools/browser-check/tools/pip-steady-gate.mjs --page <build> --out <fresh-dir>.
// It records this check and requires the every-frame scan to pass. This file alone is structural coverage only.
// About 3 minutes per surface; --set reps=N repeats the SMB presses and hovers (default 3).
const LAYER = '#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out)';
const LOOKS = ['basic', 'friendly', 'retro', 'glass', 'nier'].flatMap((f) => [`${f}-light`, `${f}-dark`]);

/* DOM witness after rendering; it cannot observe compositor paint loss. The required film gate is
   ../tools/pip-steady-gate.mjs, which records this sequence and scans every encoded frame. */
function installWitness() {
	const W = window.__pipSteady = { on: true, n: 0, moving: 0, off: [], offN: 0, anim: [] };
	const host = () => document.querySelector('#pm-o55-onboarding .o55-stage');
	const mc = new MessageChannel();
	mc.port1.onmessage = () => {
		const h = host(), st = h && window.O55.pipStage.of(h);
		if (!st || !st.gHead || !st.gHead.isConnected || !st.svg || !st.active) return;
		const r = h.getBoundingClientRect(); if (r.width < 40 || r.height < 40) return;
		W.n++;
		const rig = [st.gPip, ...st.gPip.querySelectorAll('*')];
		const anims = rig.filter((e) => e.getAnimations().some((a) => a.playState === 'running' || a.pending));
		if (anims.length) { W.moving++; if (W.anim.length < 3) W.anim.push(anims.map((e) => e.tagName.toLowerCase() + '.' + (e.getAttribute('class') || '')).join(',')); }
		const hb = st.gHead.getBoundingClientRect(), m = st.svg.getScreenCTM();
		const placed = st.gHead.hasAttribute('transform') && st.pstrs.every((p) => !!p.getAttribute('d'));
		const ends = st.pstrs.map((p) => { const d = p.getAttribute('d'); if (!d) return null; const v = d.match(/-?\d*\.?\d+(e-?\d+)?/g).map(Number); return new DOMPoint(v[v.length - 2], v[v.length - 1]).matrixTransform(m); });
		const pad = 4, off = ends.map((e) => e && Math.max(hb.left - pad - e.x, e.x - hb.right - pad, hb.top - pad - e.y, e.y - hb.bottom - pad, 0));
		const worst = Math.max(0, ...off.filter((x) => x != null));
		if (!placed || worst > 0 || hb.width < 4) {
			W.offN++;
			if (W.off.length < 8) W.off.push({ frame: W.n, at: Math.round(performance.now()), theme: st.theme, screen: window.O55.S.sess && window.O55.S.sess.screen, placed, head: [hb.left, hb.top, hb.width, hb.height].map(Math.round), ends: ends.map((e) => e && [Math.round(e.x), Math.round(e.y)]), offBy: Math.round(worst), label: W.label || '' });
		}
	};
	const tick = () => { if (!W.on) return; requestAnimationFrame(tick); mc.port2.postMessage(0); };
	requestAnimationFrame(tick);
}

async function surface(t, sandbox) {
	const f = await t.app.open({ sandbox });
	const page = t.page, sleep = (ms) => page.waitForTimeout(ms);
	const off = f === page.mainFrame() ? { x: 0, y: 0 } : await page.evaluate(() => { const r = document.querySelector('iframe').getBoundingClientRect(); return { x: r.left, y: r.top }; });
	const settle = () => f.waitForFunction(() => {
		const S = window.O55 && window.O55.S, r = document.getElementById('pm-o55-onboarding');
		if (!S || !S.open || !S.sess || !r) return false;
		const l = r.querySelector('.o55-pane > .o55-layer:not(.o55-out)');
		if (!l || l.getAttribute('data-screen') !== S.sess.screen) return false;
		if (r.matches('.o55-hold, .o55-opening, .o55-closing') || l.matches('.o55-hold, .o55-entering') || r.querySelector('.o55-pane > .o55-out')) return false;
		return !l.getAnimations({ subtree: false }).some((a) => a.playState === 'running' && Number.isFinite(a.effect.getComputedTiming().endTime));
	}, null, { timeout: 20000 });
	const screen = () => f.evaluate(() => window.O55.S.sess && window.O55.S.sess.screen);
	const box = async (sel) => { const b = await f.evaluate((s) => { const e = [...document.querySelectorAll(s)].find((x) => x.getClientRects().length && !x.closest('[inert]')); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, sel); return b && { x: b.x + off.x, y: b.y + off.y }; };
	const label = (s) => f.evaluate((x) => { if (window.__pipSteady) window.__pipSteady.label = x; }, s);
	const hover = async (sel, ms, name) => { const b = await box(sel); if (!b) return false; await label('hover ' + name); t.mark('hover ' + name); await page.mouse.move(b.x, b.y, { steps: 5 }); await sleep(ms); return true; };
	const press = async (sel, name) => { const b = await box(sel); if (!b) throw new Error('no ' + name); await page.mouse.move(b.x, b.y, { steps: 5 }); await sleep(220); await label('press ' + name); t.mark('press ' + name); await page.mouse.down(); await sleep(60); await page.mouse.up(); };
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
	/* a look as the onboarding window applies it (its look menu and tiles call O55.ui.applyLook; PM_THEME alone is
	   overruled while the window is open) */
	const awaitLook = async (fam, mode, name) => {
		const ok = await f.waitForFunction(([a, b]) => {
			const th = window.O55.theme();
			return th.chosen === a && th.mode === b
				&& !document.documentElement.hasAttribute('data-o55-vt')
				&& !document.querySelector('#o55np-reboot, #o55np-calm')
				&& !window.PM_THEME_TRANSITION?.busy?.()
				&& !window.O55.nierLook?.busy?.();
		}, [fam, mode], { timeout: 20000 }).then(() => true, () => false);
		await t.check(`${name}: ${fam}-${mode} applied and look cover ended`, ok, JSON.stringify(await f.evaluate(() => window.O55.theme())));
		if (!ok) throw new Error(`${name} did not apply ${fam}-${mode} and finish its look cover`);
		await settle();
	};
	const look = async (name) => {
		const [fam, mode] = name.split('-');
		await f.evaluate(([a, b]) => window.O55.ui.applyLook(a, b), [fam, mode]);
		await awaitLook(fam, mode, `look ${name}`); await sleep(900);
	};
	const backTo = async (want) => {
		for (let k = 0; k < 4 && (await screen()) !== want; k++) {
			await settle(); await press(`${LAYER} .o55-back`, 'Back');
			await f.waitForFunction((w) => window.O55.S.sess.screen === w, want, { timeout: 4000 }).catch(() => {}); await settle();
		}
		return t.check(`Back reached ${want}`, (await screen()) === want, await screen());
	};
	const witness = async (name) => {
		const w = await f.evaluate(() => { const W = window.__pipSteady; const out = { n: W.n, moving: W.moving, anim: W.anim, offN: W.offN, off: W.off }; Object.assign(W, { n: 0, moving: 0, anim: [], offN: 0, off: [] }); return out; });
		await t.check(`${name}: nothing on Pip's rig animates (${w.n} DOM samples)`, w.n > 20 && !w.moving, w.n <= 20 ? `only ${w.n} frames read` : `${w.moving} of ${w.n} frames had an animation on ${w.anim.join(' | ')}`);
		await t.check(`${name}: Pip's head hangs on its strings, placed, in every DOM sample (${w.n})`, w.n > 20 && !w.offN, w.n <= 20 ? `only ${w.n} frames read` : `${w.offN} of ${w.n} frames: head off its strings or unplaced; first: ${JSON.stringify(w.off.slice(0, 4))}`);
		return w;
	};
	/* Basic Light: Pip's body (#0056B3) painted inside its box, in a burst of captures right after a trigger */
	const bodyBurst = async (name, n = 4) => {
		let worst = 1;
		for (let i = 0; i < n; i++) {
			const r = await f.evaluate(() => { const st = window.O55.pipStage.of(document.querySelector('#pm-o55-onboarding .o55-stage')); const b = st.gHead.getBoundingClientRect(); return { x: b.left, y: b.top, width: b.width, height: b.height }; });
			const img = await t.pixels({ x: r.x + off.x + r.width * 0.15, y: r.y + off.y + r.height * 0.3, width: r.width * 0.7, height: r.height * 0.55 });
			let hit = 0; const px = img.width * img.height;
			for (let k = 0; k < px; k++) { const o = k * 4, d = img.data; if (Math.abs(d[o]) <= 48 && Math.abs(d[o + 1] - 86) <= 48 && Math.abs(d[o + 2] - 179) <= 48) hit++; }
			worst = Math.min(worst, hit / px);
		}
		await t.check(`${name}: Pip's body painted (Basic Light, ${n} captures)`, worst >= 0.12, `Pip's body covers only ${(worst * 100).toFixed(1)} % of its box in one capture`);
	};

	await f.evaluate(() => window.O55.ui.open({ fresh: true }));
	await settle();
	await f.evaluate(installWitness);

	/* 1. the cause, in every look: nothing on the rig transitions or animates; the head is not a layer of its own */
	await primary('welcome'); await primary('look'); await primary('where');
	const cdp = sandbox ? null : await page.context().newCDPSession(page);
	for (const look_ of LOOKS) {
		await look(look_);
		const css = await f.evaluate(async () => {
			const st = window.O55.pipStage.of(document.querySelector('#pm-o55-onboarding .o55-stage'));
			const rig = [st.gPip, ...st.gPip.querySelectorAll('*')], out = [];
			for (let i = 0; i < 40; i++) {
				await new Promise((r) => requestAnimationFrame(r));
				for (const e of rig) {
					const cs = getComputedStyle(e), props = cs.transitionProperty.split(',').map((s) => s.trim()), durs = cs.transitionDuration.split(',').map(parseFloat);
					const tr = props.some((p, k) => (p === 'all' || p === 'transform') && (durs[k % durs.length] || 0) > 0);
					const an = e.getAnimations().length;
					if ((tr || an) && out.length < 6) out.push(`${e.tagName.toLowerCase()}.${e.getAttribute('class') || ''}: ${tr ? 'transition ' + cs.transition : ''}${an ? ' ' + an + ' animation(s)' : ''}`);
				}
				if (out.length) break;
			}
			return out;
		});
		await t.check(`${look_}: no transition or animation on Pip's rig`, !css.length, css.join(' | '));
		if (cdp) {
			const layers = await (async () => {
                const trees = [];
                const on = (e) => { trees.push(e.layers || []); };
                cdp.on('LayerTree.layerTreeDidChange', on);
                let head;
                try {
                    await cdp.send('DOM.enable'); await cdp.send('LayerTree.enable');
                    const doc = await cdp.send('DOM.getDocument', { depth: 0 });
                    const q = await cdp.send('DOM.querySelector', { nodeId: doc.root.nodeId, selector: '#pm-o55-onboarding .pst-pip > g.pst-head' });
                    head = q.nodeId && (await cdp.send('DOM.describeNode', { nodeId: q.nodeId })).node.backendNodeId;
                    await sleep(1500);
                } finally {
                    cdp.off('LayerTree.layerTreeDidChange', on); await cdp.send('LayerTree.disable');
                }
                const n = trees.length, seen = trees.filter((tree) => tree.some((l) => l.backendNodeId === head)).length;
				return { seen, n, head: !!head };
			})();
			await t.check(`${look_}: Pip's head is not a compositor layer of its own`, layers.head && layers.n > 0 && !layers.seen, `head in its own layer in ${layers.seen} of ${layers.n} layer-tree updates${layers.head ? '' : ' (head not found)'}`);
		}
	}
	await witness('look switches (all ten looks)');

	/* 2. Required real mode/tile presses: confirm the requested family/mode and full cover completion
	   after every press. A missing tile or ignored click fails; no fixed delay or silent skip. */
	await look('basic-light');
	await backTo('look');
	for (const mode of ['light', 'dark']) {
		const m = `${LAYER} [data-o55-do="pickMode"][data-arg="${mode}"]`;
		const famBeforeMode = await f.evaluate(() => window.O55.theme().chosen);
		await press(m, 'mode ' + mode);
		await awaitLook(famBeforeMode, mode, 'mode press ' + mode);
		for (const fam of ['friendly', 'glass', 'retro', 'nier', 'basic']) {
			const sel = `${LAYER} .o55-tile[data-arg="${fam}"]`;
			await press(sel, `look ${fam}-${mode}`);
			await awaitLook(fam, mode, `tile press ${fam}-${mode}`);
		}
	}
	await witness('look flips by the tiles');

	/* 3. presses and hovers on the SMB route (K13b-02's moments), Basic Light */
	await look('basic-light');
	if ((await screen()) === 'look') await primary('look');
	if ((await screen()) === 'where') await primary('where');
	await act('pick', 'existing'); await act('sub', 'device'); await primary('begin');
	await t.check('on nas-find', (await screen()) === 'nas-find', await screen());
	await act('method', 'smb'); await act('share', 'smb-home'); await primary('find continue');
	await t.check('on nas-smb', (await screen()) === 'nas-smb', await screen());
	await type('user', 'jared');
	const reps = Number(t.args.reps || 3);
	for (let i = 0; i < reps; i++) {
		if (!(await f.evaluate((s) => { const e = document.querySelector(s); return e && e.value; }, `${LAYER} [data-o55-bind="user"]`))) await type('user', 'jared');
		await type('pw', 'secret-' + i);
		await hover(`${LAYER} .o55-back`, 300, 'Back');
		await hover(`${LAYER} .o55-primary`, 450, 'Check access'); await bodyBurst('hover Check access');
		await primary('Check access'); await bodyBurst('press Check access');
		await f.waitForFunction(() => !Object.values(window.O55.S.sess.ops || {}).some((v) => v.state === 'running' || v.state === 'pending'), null, { timeout: 15000 }).catch(() => {});
		await sleep(500);
		await backTo('nas-find');
		await hover(`${LAYER} [data-o55-do="share"][data-arg="smb-media"]`, 300, 'card media');
		await hover(`${LAYER} .o55-primary`, 500, 'Continue'); await bodyBurst('hover Continue');
		await hover(`${LAYER} [data-o55-do="share"][data-arg="smb-home"]`, 250, 'card home');
		await primary('find continue'); await bodyBurst('Continue to nas-smb');
	}
	await witness('presses and hovers on the SMB route');
	await f.evaluate(() => { window.__pipSteady.on = false; });
}

export const tests = Object.fromEntries(['normal', 'sandbox'].map((s) => [`pip head steady (${s})`, async (t) => {
	if (!t.app.surfaces().includes(s)) { t.log(`skipped: --set sandbox selects the other surface`); return; }
	await surface(t, s === 'sandbox');
}]));
