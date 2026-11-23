// The cached-draw-vs-fresh-draw oracle for checks/perf-onb-rest.check.mjs (TOOLS-STAGEREST-K2, after
// opus-review-stagerest's oracle): at frames after an input, the stage draws once on its caches (render()), its kept
// nodes are serialised, then every cache lane W added is dropped (gShadow.__pt and its children, gHud.__b and its
// children, hudEl.__tg/__co) and it draws once more from scratch at the same stage time. The two serialisations must
// match, and NieR's kept nierBox must match a fresh boxInScene. On a build without the caches the flush is a no-op and
// the two always match.
// nierKey is NOT dropped: the kept box is judged against a fresh boxInScene, and dropping the key would heal it and
// hide how long a stale box lasts.
// Kept apart from the browser so tools/onb-rest-draw.selftest.mjs can run it on a stub stage.
// frames: the frame numbers after the input to sample (0 is the input's own first draw), or { frames, reduced, media,
// attr } to also assert an expected Reduced Motion state. At every scored sample, the stage's own reduced state
// (st.reduced and st.root.dataset.reduced) must match the app's (O55.motion.reduced()) and the browser's
// (prefers-reduced-motion media query / data-motion="reduced"), failing when they disagree. Returns the differences
// (first 8), their count, the draws and NieR boxes judged, the last reduced-motion state, and the family and layout.
export const DRAW_WATCH = async (arg) => {
	const frames = Array.isArray(arg) ? arg : arg.frames;
	const expect = Array.isArray(arg) ? null : arg;
	const st = document.querySelector('#pm-o55-onboarding .o55-stage').__pipStage;
	const ser = (n) => { if (!n) return ''; const out = []; const walk = (e, d) => { if (e.nodeType === 3) { out.push(d + JSON.stringify(e.data)); return; } if (e.nodeType !== 1) return; out.push(d + '<' + e.tagName + [...e.attributes].map((a) => a.name + '=' + a.value).sort().join(' ') + '>'); for (let c = e.firstChild; c; c = c.nextSibling) walk(c, d + ' '); }; for (let c = n.firstChild; c; c = c.nextSibling) walk(c, ''); return out.join('\n'); };
	const r2 = (b) => (b ? b.map((v) => Math.round(v * 4) / 4).join(',') : 'null');
	const bad = []; let n = 0, checks = 0, boxes = 0, lastMotion = null;
	const one = () => {
		const s = document.querySelector('#pm-o55-onboarding .o55-stage').__pipStage;
		if (!s || !s.ps || !s.gShadow) return;
		s.render();
		const a = { sh: ser(s.gShadow), hud: ser(s.gHud), box: r2(s.nierBox) };
		let fresh = null;
		if (s.famName === 'nier') { const fb = s.boxInScene(s.bubble, 6); if (fb) { fresh = r2(fb); boxes++; } }
		const g = s.gShadow; delete g.__pt; g.textContent = '';
		const h = s.gHud; delete h.__b; h.textContent = '';
		if (s.hudEl) { s.hudEl.__tg = undefined; s.hudEl.__co = undefined; }
		s.render();
		const b = { sh: ser(s.gShadow), hud: ser(s.gHud), box: r2(s.nierBox) };
		checks++;
		const diff = (x, y) => { const X = x.split('\n'), Y = y.split('\n'); for (let i = 0; i < Math.max(X.length, Y.length); i++) if (X[i] !== Y[i]) return `line ${i + 1}: cached ${X[i] || '(end)'} | fresh ${Y[i] || '(end)'} (${X.length} vs ${Y.length} lines)`; return ''; };
		if (a.sh !== b.sh) bad.push(`frame ${n} shadows: ${diff(a.sh, b.sh)}`);
		if (a.hud !== b.hud) bad.push(`frame ${n} hud: ${diff(a.hud, b.hud)}`);
		if (fresh && a.box !== fresh) bad.push(`frame ${n} nierBox kept ${a.box} vs fresh ${fresh}`);
		const hasWin = typeof window !== 'undefined';
		const appRed = hasWin && window.O55 && window.O55.motion && typeof window.O55.motion.reduced === 'function' ? !!window.O55.motion.reduced() : null;
		const mediaRed = hasWin && typeof window.matchMedia === 'function' ? !!window.matchMedia('(prefers-reduced-motion: reduce)').matches : null;
		const attrRed = typeof document !== 'undefined' && document.documentElement && typeof document.documentElement.getAttribute === 'function' ? document.documentElement.getAttribute('data-motion') === 'reduced' : null;
		const envRed = mediaRed !== null || attrRed !== null ? !!(mediaRed || attrRed) : appRed;
		const wantRed = expect && typeof expect.reduced === 'boolean' ? expect.reduced : envRed;
		const stRed = typeof s.reduced === 'boolean' ? s.reduced : null;
		const domRed = s.root && s.root.dataset && 'reduced' in s.root.dataset ? s.root.dataset.reduced : null;
		const stStill = typeof s.still === 'function' ? !!s.still() : null;
		lastMotion = { app: appRed, media: mediaRed, attr: attrRed, stage: stRed, dom: domRed, still: stStill };
		if (wantRed !== null) {
			if (appRed !== null && appRed !== wantRed) bad.push(`frame ${n} app reduced ${appRed} vs expected ${wantRed}`);
			if (envRed !== null && appRed !== null && appRed !== envRed) bad.push(`frame ${n} app reduced ${appRed} vs browser/attr ${envRed} (media=${mediaRed}, data-motion=${attrRed})`);
			if (stRed !== null && stRed !== wantRed) bad.push(`frame ${n} stage.reduced ${stRed} vs expected ${wantRed} (app=${appRed}, media=${mediaRed}, data-motion=${attrRed})`);
			if (domRed !== null && domRed !== (wantRed ? '1' : '0')) bad.push(`frame ${n} data-reduced ${domRed} vs expected ${wantRed ? '1' : '0'} (app=${appRed}, media=${mediaRed}, data-motion=${attrRed})`);
			if (wantRed && stStill === false) bad.push(`frame ${n} stage.still() false under Reduced Motion (app=${appRed}, media=${mediaRed}, data-motion=${attrRed})`);
		}
		if (expect && typeof expect.media === 'boolean' && mediaRed !== null && mediaRed !== expect.media) bad.push(`frame ${n} media reduced ${mediaRed} vs expected ${expect.media}`);
		if (expect && typeof expect.attr === 'boolean' && attrRed !== null && attrRed !== expect.attr) bad.push(`frame ${n} data-motion reduced ${attrRed} vs expected ${expect.attr}`);
	};
	await new Promise((res) => {
		const max = Math.max(...frames);
		const tick = () => { if (frames.includes(n)) { try { one(); } catch (e) { bad.push('oracle threw ' + e); } } if (++n > max) res(); else requestAnimationFrame(tick); };
		requestAnimationFrame(tick);
	});
	return { bad: bad.slice(0, 8), nbad: bad.length, checks, boxes, motion: lastMotion, fam: st && st.famName, layout: st && st.layoutName };
};
