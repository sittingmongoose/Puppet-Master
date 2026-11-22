// The cached-draw-vs-fresh-draw oracle for checks/perf-onb-rest.check.mjs (TOOLS-STAGEREST-K2, after
// opus-review-stagerest's oracle): at frames after an input, the stage draws once on its caches (render()), its kept
// nodes are serialised, then every cache lane W added is dropped (gShadow.__pt and its children, gHud.__b and its
// children, hudEl.__tg/__co) and it draws once more from scratch at the same stage time. The two serialisations must
// match, and NieR's kept nierBox must match a fresh boxInScene. On a build without the caches the flush is a no-op and
// the two always match.
// nierKey is NOT dropped: the kept box is judged against a fresh boxInScene, and dropping the key would heal it and
// hide how long a stale box lasts.
// Kept apart from the browser so tools/onb-rest-draw.selftest.mjs can run it on a stub stage.
// frames: the frame numbers after the input to sample (0 is the input's own first draw). Returns the differences
// (first 8), their count, the draws and NieR boxes judged, and the family and layout read.
export const DRAW_WATCH = async (frames) => {
	const st = document.querySelector('#pm-o55-onboarding .o55-stage').__pipStage;
	const ser = (n) => { if (!n) return ''; const out = []; const walk = (e, d) => { if (e.nodeType === 3) { out.push(d + JSON.stringify(e.data)); return; } if (e.nodeType !== 1) return; out.push(d + '<' + e.tagName + [...e.attributes].map((a) => a.name + '=' + a.value).sort().join(' ') + '>'); for (let c = e.firstChild; c; c = c.nextSibling) walk(c, d + ' '); }; for (let c = n.firstChild; c; c = c.nextSibling) walk(c, ''); return out.join('\n'); };
	const r2 = (b) => (b ? b.map((v) => Math.round(v * 4) / 4).join(',') : 'null');
	const bad = []; let n = 0, checks = 0, boxes = 0;
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
	};
	await new Promise((res) => {
		const max = Math.max(...frames);
		const tick = () => { if (frames.includes(n)) { try { one(); } catch (e) { bad.push('oracle threw ' + e); } } if (++n > max) res(); else requestAnimationFrame(tick); };
		requestAnimationFrame(tick);
	});
	return { bad: bad.slice(0, 8), nbad: bad.length, checks, boxes, fam: st && st.famName, layout: st && st.layoutName };
};
