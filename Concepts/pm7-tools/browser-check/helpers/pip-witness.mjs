/* FO-30 guard, one model: a self-describing film plus a per-frame witness (used by checks/pip-steady.check.mjs, read by
 * Concepts/onboarding/opus-5.5/tools/pip_body_scan.mjs).
 *
 * 1. End-of-frame witness. A ResizeObserver callback (driven by a 1 px element resized in every rAF) runs after every
 *    rAF callback and layout of the frame, right before paint. There it measures Pip as that frame paints it and
 *    writes one record (fields below): the look Pip is drawn in, what the page declares about the frame (window
 *    closed, a look cover, one of the stage's own named effects on Pip's ancestors), whether Pip is missing from an
 *    open stage, any other animation on Pip's ancestors, Pip's head and controller boxes in film pixels, and paint
 *    properties (effective opacity of head, controller and strings with CSS and filter opacity on every ancestor,
 *    visibility and display, painted leaf area of the head, how much of the head box survives every clipping ancestor
 *    and the viewport, clip-path, mask and filter of each part and every ancestor, blur, brightness, overlays).
 * 2. Frame tag. In the same callback it paints the record's sequence number into a strip of black and white cells at
 *    the frame's top-left corner (sync cells 1,0, then the bits, then their complements), so every film frame names
 *    the page frame it shows. The tag carries its own view-transition-name, so it stays live over a View Transition.
 * 3. Calibration. calibrate() takes, in one steady look, `pre` painted frames, then hides Pip's head and controller
 *    (visibility:hidden, strings left, the way FO-30's frames lost them) for `hide` frames, then `post` frames. The
 *    film thus holds, for every look the run shows, that look's own head and controller and its own background
 *    where they hang: the scanner's per-look reference, taken from the page, and its positive control.
 * A record is only data; structural judgement is evaluateWitness() below, pixel judgement is the scanner. */

export const FIELDS = ['seq', 't', 'look', 'cls', 'why', 'cal', 'calPhase', 'label', 'hx', 'hy', 'hw', 'hh', 'cx', 'cy', 'cw', 'ch',
	'placed', 'offBy', 'rigAnim', 'headVis', 'ctlVis', 'strVis', 'opHead', 'opCtl', 'opStr', 'leafArea', 'clipFrac', 'sig', 'occl',
	'blur', 'pipTheme', 'cost', 'asleep', 'screen', 'dim', 'occlCtl', 'gone', 'foreign'];

/* Page function (serialised by Playwright: no closure over this module). cfg: { x, y, block, bits, ox, oy } in CSS px
   of this frame's viewport; ox/oy place the frame's viewport in the top window (the sandbox iframe). */
export function installWitness(cfg) {
	const doc = document, html = doc.documentElement;
	if (window.__pipSteady && window.__pipSteady.on) return window.__pipSteady.header;
	const FIELDS = cfg.fields, NF = FIELDS.length, F = {}; FIELDS.forEach((k, i) => { F[k] = i; });
	const B = cfg.block, NB = cfg.bits, N = 2 + 2 * NB, dpr = window.devicePixelRatio || 1;
	const W = window.__pipSteady = { on: true, seq: 0, recs: [], strings: [], cals: [], calN: 0, label: 0, err: 0, errMsg: '', prof: { classify: 0, geom: 0, chain: 0, leaves: 0, overlays: 0, n: 0 } };
	const strIx = new Map();
	const str = (s) => { s = String(s); let i = strIx.get(s); if (i === undefined) { i = W.strings.length; W.strings.push(s); strIx.set(s, i); } return i; };
	str('');
	W.setLabel = (s) => { W.label = str(s); };
	/* the tag */
	const tag = doc.createElement('div');
	tag.setAttribute('data-pip-steady', 'tag');
	tag.style.cssText = `position:fixed;left:${cfg.x}px;top:${cfg.y}px;width:${N * B}px;height:${B}px;margin:0;padding:0;border:0;z-index:2147483647;pointer-events:none;contain:strict;background:#808080;view-transition-name:pip-steady-tag;opacity:1;visibility:visible;transform:none;filter:none;display:block`;
	const cells = [];
	for (let i = 0; i < N; i++) { const c = doc.createElement('i'); c.style.cssText = `position:absolute;left:${i * B}px;top:0;width:${B}px;height:${B}px;display:block;margin:0;background:#808080`; tag.appendChild(c); cells.push(c); }
	html.appendChild(tag);
	const vt = doc.createElement('style'); vt.setAttribute('data-pip-steady', 'vt');
	vt.textContent = '::view-transition-group(pip-steady-tag){animation:none}::view-transition-old(pip-steady-tag){display:none}::view-transition-new(pip-steady-tag){animation:none;opacity:1}';
	(doc.head || html).appendChild(vt);
	const shown = new Array(N).fill(-2);
	const cell = (i, b) => { if (shown[i] !== b) { shown[i] = b; cells[i].style.background = b === 1 ? '#fff' : b === 0 ? '#000' : '#808080'; } };
	const writeTag = (seq) => { cell(0, 1); cell(1, 0); for (let i = 0; i < NB; i++) { const b = (seq >> i) & 1; cell(2 + i, b); cell(2 + NB + i, 1 - b); } };
	const clearTag = () => { for (let i = 0; i < N; i++) cell(i, -1); };

	/* what the page declares about a frame */
	const PAINT = /^(opacity|filter|clip-?[pP]ath|mask|mask-?[iI]mage|-?webkit-?[mM]ask.*|visibility|display|content-?[vV]isibility)$/;
	const MOVE = /^(transform|translate|scale|rotate|offset.*|left|top|right|bottom|width|height|inset.*|x|y|d)$/;
	const kinds = new WeakMap();
	const kindOf = (a) => {
		let k = kinds.get(a); if (k !== undefined) return k;
		const props = [];
		try {
			if (a.transitionProperty) props.push(a.transitionProperty);
			else if (a.effect && a.effect.getKeyframes) for (const fr of a.effect.getKeyframes()) for (const p of Object.keys(fr)) if (!['offset', 'easing', 'composite', 'computedOffset'].includes(p)) props.push(p);
		} catch (_) { /* unreadable: treated as affecting paint */ props.push('opacity'); }
		k = props.some((p) => PAINT.test(p)) ? 'paint' : props.some((p) => MOVE.test(p)) ? 'move' : '';
		kinds.set(a, k); return k;
	};
	const finiteRunning = (a) => { try { if (a.playState !== 'running' && !a.pending) return false; return Number.isFinite(a.effect.getComputedTiming().endTime); } catch (_) { return false; } };
	const nameOf = (a, n) => `${a.animationName || a.transitionProperty || a.id || 'animation'}@${(n.getAttribute('class') || n.id || n.tagName).split(' ')[0]}`;
	/* The stage's own effects that change how Pip paints, each by its CSS animation name, on its own element, once and
	   short: Retro's tube (power on and off, degauss) and paper (feed in and out) on the tube's or sheet's content, and
	   the look swap on the stage root. Only these excuse a frame from the paint checks; any other finite animation of
	   paint or geometry on Pip's ancestors (a Web Animation on its SVG, say) leaves the frame judged, and is itself a
	   structural failure (astra-review-flash-2 F1). */
	const OWN = { pstOn: 'content', pstOff: 'content', pstDegauss: 'content', pstFeedIn: 'content', pstFeedOut: 'content', pstSwap: 'root' };
	const ownEffect = (a, n, S) => {
		const name = a.animationName; if (!name || !Object.prototype.hasOwnProperty.call(OWN, name)) return null;
		if (OWN[name] === 'content' ? !(S.tube && n === S.content) : n !== S.root) return null;
		try { const t = a.effect.getTiming(); if (t.iterations !== 1 || !(t.duration <= 1500)) return null; } catch (_) { return null; }
		return `${name}@${OWN[name]}`;
	};
	const MISSING = 'Pip missing from the stage', COLLAPSED = 'stage collapsed in an open window', NOSTAGE = 'stage missing from an open window';
	const LOST = new Set([MISSING, COLLAPSED, NOSTAGE]);
	/* Pip is expected from the product's own state (the window open, not in one of the phases the page declares below),
	   never from whether Pip's nodes survived or from how big they paint: a head that is gone or detached in an open
	   window is a lost Pip, judged where Pip last was (astra-review-flash-2 F2), and so is an open window's stage that is
	   missing or painted collapsed (T38, astra-review-flash-3 F1: a scale(0) on the stage host made it "no stage on screen"
	   and the frame was skipped). The window being closed is read from the product (O55.S.open), its morph and every other
	   declared phase from the page's own marks, all before any geometry is read. */
	const classify = (host, S, anims) => {
		const O5 = window.O55, r = doc.getElementById('pm-o55-onboarding');
		if (doc.hidden || !O5 || !O5.S || !O5.S.open) return ['o', 'window closed'];
		if (!r) return ['v', NOSTAGE];
		if (r.matches('.o55-opening, .o55-closing')) return ['x', 'window morph'];
		try { if (typeof window.PM_LOOK_COVERED === 'function' && window.PM_LOOK_COVERED()) return ['x', 'look cover']; } catch (_) { return ['x', 'look cover (unreadable)']; }
		if (html.hasAttribute('data-o55-vt') || O5.S.vt) return ['x', 'view transition'];
		if (doc.getElementById('o55np-reboot') || doc.getElementById('o55np-calm')) return ['x', 'NieR plate'];   /* (a selector list costs 1 ms here) */
		if (window.PM_THEME_TRANSITION && window.PM_THEME_TRANSITION.busy && window.PM_THEME_TRANSITION.busy()) return ['x', 'look cover lift'];
		if (O5.nierLook && O5.nierLook.busy && O5.nierLook.busy()) return ['x', 'NieR moment'];
		if (!host) return ['v', NOSTAGE];
		const hr = host.getBoundingClientRect(); if (hr.width < 40 || hr.height < 40) return ['v', COLLAPSED];
		if (!S || S.dead || !S.gPip || !S.gHead || !S.gCtl || !S.gPip.isConnected || !S.gHead.isConnected || !S.gCtl.isConnected || !host.contains(S.gHead) || !host.contains(S.gCtl)) return ['v', MISSING];
		if (S.famName === 'nier' && S.gSlice && S.gSlice.getAttribute('display') !== 'none') return ['a', 'NieR slice'];
		/* one document.getAnimations() a frame (Element.getAnimations() walks the document's animations on every call) */
		const chain = new Set(); for (let n = S.gPip.parentNode; n && n.nodeType === 1; n = n.parentNode) chain.add(n);
		let own = null; const foreign = [];
		for (const a of anims) {
			const n = a.effect && a.effect.target;
			if (!n || !chain.has(n) || !finiteRunning(a) || !kindOf(a)) continue;
			const e = ownEffect(a, n, S);
			if (e) own = own || e; else foreign.push(nameOf(a, n));
		}
		if (foreign.length) return ['v', '', foreign.join(', ')];
		if (own) return ['a', own];
		return ['v', ''];
	};

	/* measurements */
	const area = (b) => Math.max(0, b[2]) * Math.max(0, b[3]);
	const inter = (a, b) => { const x = Math.max(a[0], b[0]), y = Math.max(a[1], b[1]), r = Math.min(a[0] + a[2], b[0] + b[2]), u = Math.min(a[1] + a[3], b[1] + b[3]); return [x, y, Math.max(0, r - x), Math.max(0, u - y)]; };
	const rect = (e) => { const b = e.getBoundingClientRect(); return [b.left, b.top, b.width, b.height]; };
	const film = (b) => [(b[0] + cfg.ox) * dpr, (b[1] + cfg.oy) * dpr, b[2] * dpr, b[3] * dpr].map((v) => Math.round(v * 10) / 10);
	const filterOf = (cs) => {
		const f = cs.filter; let op = 1, blur = 0, dim = 1;
		if (f && f !== 'none') {
			for (const m of f.matchAll(/opacity\(([\d.]+)(%?)\)/g)) op *= m[2] ? +m[1] / 100 : +m[1];
			for (const m of f.matchAll(/blur\(([\d.]+)px\)/g)) blur += +m[1];
			for (const m of f.matchAll(/brightness\(([\d.]+)(%?)\)/g)) dim *= m[2] ? +m[1] / 100 : +m[1];
		}
		return { op, blur, dim };
	};
	const SHAPES = 'path,rect,circle,ellipse,polygon,polyline,line,use,image,text';
	/* the head's painted leaves, listed again only when its children change (a face, a mood, a rebuild) */
	let leafHead = null, leafDirty = true, leafList = [];
	const leafMO = new MutationObserver(() => { leafDirty = true; });
	/* the product's overlays that can stand over the head: the bubble, the tip, Retro Light's printer, and the parts of
	   Retro's terminal and NieR's HUD that paint a ground (their containers span the stage and paint nothing) */
	let ovKey = null, ovList = [], ovAge = 0;
	const alphaOf = (bg) => { if (!bg || bg === 'transparent') return 0; const m = /rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/.exec(bg) || /\/\s*([\d.]+%?)\s*\)$/.exec(bg); return m ? (m[1].endsWith('%') ? parseFloat(m[1]) / 100 : +m[1]) : 1; };
	const overlaysOf = (S) => {
		if (ovKey !== S.hudEl || ++ovAge > 30) {
			ovKey = S.hudEl; ovAge = 0;
			ovList = [...S.root.querySelectorAll('.pst-term *, .pst-nhud *')].filter((e) => { const cs = getComputedStyle(e); return alphaOf(cs.backgroundColor) > 0.5 || cs.backgroundImage !== 'none'; });
		}
		return [S.bubble, S.tipBox, S.root.querySelector('.pst-printer'), ...ovList];
	};
	const measure = (seq, t0) => {
		const rec = new Array(NF).fill(0);
		rec[F.seq] = seq; rec[F.t] = Math.round(t0 * 10) / 10; rec[F.label] = W.label; rec[F.look] = -1; rec[F.pipTheme] = -1; rec[F.screen] = -1;
		const win = doc.getElementById('pm-o55-onboarding'), host = win && win.querySelector('.o55-stage');
		const S = host && window.O55 && window.O55.pipStage && window.O55.pipStage.of(host);
		const P = W.prof, pt = () => performance.now();
		let tp = pt();
		/* every running animation, read in the frame itself: Web Animations started by script fire no event, and a CSS
		   animation's start event arrives a frame after it first paints (Retro's tube power-on, squashed to a line on
		   purpose, was judged as a lost Pip that way) */
		const anims = doc.getAnimations();
		let [cls, why, foreign] = classify(host, S, anims);
		P.classify += pt() - tp;
		/* calibration: a steady look only; aborted by anything the page declares, a rebuild or a look change */
		const C = W.cal;
		if (C) {
			if (C.phase === 1 && !C.gHead && S && S.gHead && cls === 'v' && !LOST.has(why)) { C.gHead = S.gHead; C.gCtl = S.gCtl; C.look = S.theme; }
			const restore = () => { if (C.hidden) { C.gHead.style.visibility = C.oldH; C.gCtl.style.visibility = C.oldC; C.hidden = false; } };
			if (!C.gHead || !S || S.gHead !== C.gHead || S.gCtl !== C.gCtl || S.theme !== C.look || cls !== 'v' || LOST.has(why)) {
				if (C.gHead) { restore(); W.cal = null; C.done({ ok: false, id: C.id, why: !S ? 'stage gone' : S.gHead !== C.gHead ? 'rig rebuilt' : S.theme !== C.look ? 'look changed' : `${cls}: ${why}` }); }
			} else {
				if (C.phase === 1 && C.n >= C.pre) { C.oldH = C.gHead.style.visibility; C.oldC = C.gCtl.style.visibility; C.gHead.style.visibility = 'hidden'; C.gCtl.style.visibility = 'hidden'; C.hidden = true; C.phase = 2; C.n = 0; }
				else if (C.phase === 2 && C.n >= C.hide) { restore(); C.phase = 3; C.n = 0; }
				else if (C.phase === 3 && C.n >= C.post) { W.cal = null; C.done({ ok: true, id: C.id, look: C.look, first: C.first, last: seq - 1 }); }
				if (W.cal === C) { if (!C.first) C.first = seq; rec[F.cal] = C.id; rec[F.calPhase] = C.phase; C.n++; if (C.phase === 2) { cls = 'h'; why = 'calibration'; } }
			}
		}
		rec[F.cls] = cls; rec[F.why] = str(why); rec[F.foreign] = str(foreign || '');
		if (LOST.has(why)) {
			/* judged where Pip last was, in the look it was in; nothing of it is shown */
			rec[F.gone] = 1;
			if (W.last) for (const k of ['look', 'pipTheme', 'screen', 'hx', 'hy', 'hw', 'hh', 'cx', 'cy', 'cw', 'ch']) rec[F[k]] = W.last[k];
			return rec;
		}
		if (cls === 'o') return rec;
		rec[F.look] = str(S.theme); rec[F.pipTheme] = str(S.pipTheme || S.theme); rec[F.asleep] = S.sleepZ ? 1 : 0;
		rec[F.screen] = str(window.O55.S && window.O55.S.sess ? window.O55.S.sess.screen : '');
		const hb = rect(S.gHead), cb = rect(S.gCtl);
		[rec[F.hx], rec[F.hy], rec[F.hw], rec[F.hh]] = film(hb);
		[rec[F.cx], rec[F.cy], rec[F.cw], rec[F.ch]] = film(cb);
		/* placed and hanging: a transform on the head, a path on each string, both string ends on the head's box */
		tp = pt();
		const placed = S.gHead.hasAttribute('transform') && S.pstrs.every((p) => !!p.getAttribute('d'));
		const m = S.svg.getScreenCTM();
		let offBy = 0;
		for (const p of S.pstrs) {
			const d = p.getAttribute('d'); if (!d || !m) continue;
			const v = d.match(/-?\d*\.?\d+(e-?\d+)?/g).map(Number), e = new DOMPoint(v[v.length - 2], v[v.length - 1]).matrixTransform(m), pad = 4;
			offBy = Math.max(offBy, hb[0] - pad - e.x, e.x - hb[0] - hb[2] - pad, hb[1] - pad - e.y, e.y - hb[1] - hb[3] - pad, 0);
		}
		rec[F.placed] = placed ? 1 : 0; rec[F.offBy] = Math.round(offBy);
		/* FO-30's cause class: any transition on the rig (it is drawn every frame; a transition there comes from a stray
		   rule, as the printer's did), or an animation of geometry or paint on the rig's own groups (Pip, head,
		   controller, strings, glows). The face's own designed motion (NieR's and the thinking dots' hop) is not */
		const groups = new Set([S.gPip, S.gHead, S.gCtl, ...S.pstrs, ...(S.pglow || [])]);
		rec[F.rigAnim] = anims.filter((a) => { const n = a.effect && a.effect.target; if (!n || !S.gPip.contains(n) || !(a.playState === 'running' || a.pending)) return false; return (typeof CSSTransition !== 'undefined' && a instanceof CSSTransition) || (groups.has(n) && !!kindOf(a)); }).length;
		/* paint: the shared chain above Pip's group, then each part's own */
		P.geom += pt() - tp; tp = pt();
		let chainOp = 1, chainBlur = 0, chainDim = 1, chainShown = true, clip = [0, 0, innerWidth, innerHeight];
		/* clip-path, mask and filter of every element from Pip's group up, and of each part (head, controller, strings):
		   what they do to paint cannot all be measured here (an SVG filter's output, a mask's alpha), so any of them its
		   look's calibration did not have fails (astra-review-flash-2 F3). Filters by kind (an SVG reference, the CSS
		   functions by name), since Retro's tube flickers its brightness value */
		const sig = [];
		const effects = (n, cs, role) => {
			const mk = cs.maskImage || cs.webkitMaskImage || 'none', f = cs.filter || 'none', fa = n.getAttribute('filter'), ca = n.getAttribute('clip-path'), ma = n.getAttribute('mask');
			const fk = f === 'none' ? '' : [...f.matchAll(/([a-z-]+)\(/g)].map((x) => x[1]).join(' ');
			if ((cs.clipPath && cs.clipPath !== 'none') || mk !== 'none' || fk || fa || ca || ma) sig.push(`${role}:clip=${cs.clipPath}|mask=${mk}|filter=${fk}|attr=${ca ? 'clip-path ' : ''}${ma ? 'mask ' : ''}${fa ? 'filter' : ''}`);
		};
		const chainNodes = [];
		for (let n = S.gPip; n && n.nodeType === 1; n = n.parentNode) {
			const cs = getComputedStyle(n), fl = filterOf(cs);
			chainNodes.push([n, cs]);
			chainOp *= (+cs.opacity) * fl.op; chainBlur += fl.blur; chainDim *= fl.dim;
			if (cs.display === 'none' || cs.contentVisibility === 'hidden') chainShown = false;
			effects(n, cs, `${n.tagName}.${(n.getAttribute('class') || '').split(' ')[0]}`);
			const svgRoot = n.namespaceURI === 'http://www.w3.org/2000/svg' && n.tagName.toLowerCase() === 'svg' && !n.ownerSVGElement;
			if ((n instanceof HTMLElement || svgRoot) && (cs.overflowX !== 'visible' || cs.overflowY !== 'visible')) clip = inter(clip, rect(n));
		}
		/* T52 (TOOLBATCH2 pre-check finding 7): a back-face flip. rotateY(180deg) with backface-visibility: hidden on the
		   stage host for one frame paints nothing, and neither the classifier nor the paint chain read it.
		   T67 (TOOLBATCH4, REVIEW-kit-tb3-opus finding 8): only what hides paint joins the signature: an element whose
		   backface-visibility is hidden while its back face is turned to the viewer (m33 negative), read both in its own
		   3D rendering context (its own transform, composed through preserve-3d parents) and composed from the root
		   down, so either way a renderer reads it, it is flagged. A hidden back face facing the viewer (scale(-1, 1), a 2D
		   mirror) and a turned element whose back face shows (a grandparent turned with nothing hidden) leave Pip
		   painted, and are no longer flagged (8a: both were false stops). The transform read is the element's whole
		   one: the individual translate, rotate and scale properties, then transform (8c: a flip by rotate: y 180deg was
		   seen only through its backface string). */
		const deg = (a) => { const v = parseFloat(a); return /rad$/.test(a) && !/grad$/.test(a) ? v * 180 / Math.PI : /grad$/.test(a) ? v * .9 : /turn$/.test(a) ? v * 360 : v; };
		const ownMatrix = (cs) => {
			let m = new DOMMatrix();
			const ro = cs.rotate;
			if (ro && ro !== 'none') { const q = ro.trim().split(/\s+/); let x = 0, y = 0, z = 1, a = q[q.length - 1];
				if (q.length === 2) { x = q[0] === 'x' ? 1 : 0; y = q[0] === 'y' ? 1 : 0; z = q[0] === 'z' ? 1 : 0; }
				else if (q.length === 4) [x, y, z] = q.slice(0, 3).map(Number);
				m = m.rotateAxisAngle(x, y, z, deg(a)); }
			const sc = cs.scale;
			if (sc && sc !== 'none') { const v = sc.trim().split(/\s+/).map((x) => (x.endsWith('%') ? parseFloat(x) / 100 : parseFloat(x))); m = m.scale(v[0], v.length > 1 ? v[1] : v[0], v.length > 2 ? v[2] : 1); }
			const tf = cs.transform;
			if (tf && tf !== 'none') m = m.multiply(new DOMMatrix(tf));
			return m;
		};
		let composed = new DOMMatrix(), ctx = new DOMMatrix(), keep3d = false;
		const facing = (n, cs, role, at, inCtx, parent3d) => {
			let own = new DOMMatrix();
			try { own = ownMatrix(cs); } catch (_) { sig.push(`${role}:transform=unreadable`); }
			const m = at.multiply(own), c = parent3d ? inCtx.multiply(own) : own;
			if (cs.backfaceVisibility === 'hidden' && (c.m33 < 0 || m.m33 < 0)) sig.push(`${role}:back face hidden and turned away`);
			return { m, c, keep3d: cs.transformStyle === 'preserve-3d' };
		};
		for (let i = chainNodes.length - 1; i >= 0; i--) { const [n, cs] = chainNodes[i]; const r = facing(n, cs, `${n.tagName}.${(n.getAttribute('class') || '').split(' ')[0]}`, composed, ctx, keep3d); composed = r.m; ctx = r.c; keep3d = r.keep3d; }
		const part = (e) => { const cs = getComputedStyle(e), fl = filterOf(cs); return { op: chainOp * (+cs.opacity) * fl.op, shown: chainShown && cs.display !== 'none' && cs.visibility === 'visible', blur: chainBlur + fl.blur, dim: chainDim * fl.dim, cs }; };
		const ph = part(S.gHead), pc = part(S.gCtl), ps = S.pstrs.map(part);
		effects(S.gHead, ph.cs, 'head'); effects(S.gCtl, pc.cs, 'controller'); S.pstrs.forEach((p, i) => effects(p, ps[i].cs, 'string'));
		facing(S.gHead, ph.cs, 'head', composed, ctx, keep3d); facing(S.gCtl, pc.cs, 'controller', composed, ctx, keep3d); S.pstrs.forEach((p, i) => facing(p, ps[i].cs, 'string', composed, ctx, keep3d));
		rec[F.headVis] = ph.shown ? 1 : 0; rec[F.ctlVis] = pc.shown ? 1 : 0; rec[F.strVis] = ps.every((p) => p.shown) ? 1 : 0;
		rec[F.opHead] = Math.round(ph.op * 1000); rec[F.opCtl] = Math.round(pc.op * 1000); rec[F.opStr] = Math.round(Math.min(...ps.map((p) => p.op)) * 1000);
		rec[F.blur] = Math.round(ph.blur * 10); rec[F.dim] = Math.round(ph.dim * 1000);
		rec[F.sig] = str(sig.join(' / '));
		rec[F.clipFrac] = area(hb) > 0 ? Math.round(area(inter(hb, clip)) / area(hb) * 1000) : 0;
		/* the head's painted leaves (body, face, eyelets), each with its own display, visibility, opacity and paint */
		P.chain += pt() - tp; tp = pt();
		let leaf = 0;
		const memo = new Map(), csOf = (n) => { let c = memo.get(n); if (!c) { c = getComputedStyle(n); memo.set(n, c); } return c; };
		if (leafHead !== S.gHead || leafDirty) { leafHead = S.gHead; leafDirty = false; leafMO.disconnect(); leafMO.observe(S.gHead, { childList: true, subtree: true }); leafList = [...S.gHead.querySelectorAll(SHAPES)].filter((e) => !e.closest('defs, clipPath, mask, pattern, marker, symbol')); }
		for (const e of leafList) {
			const cs = csOf(e); if (cs.visibility !== 'visible') continue;
			let op = 1, gone = false;
			for (let n = e; n && n !== S.gHead.parentNode; n = n.parentNode) { const c = csOf(n); if (c.display === 'none') { gone = true; break; } op *= +c.opacity; }
			if (gone || op < 0.05) continue;
			const t = e.tagName.toLowerCase(), fill = cs.fill !== 'none' && +cs.fillOpacity > 0.05, stroke = cs.stroke !== 'none' && +cs.strokeOpacity > 0.05 && parseFloat(cs.strokeWidth) > 0;
			if (!fill && !stroke && t !== 'use' && t !== 'image') continue;
			leaf += area(rect(e));
		}
		rec[F.leafArea] = Math.round(leaf * dpr * dpr);
		/* the product's own overlays over the head and controller boxes (bubble, tip, Retro's printer, NieR's HUD boxes,
		   the terminal) */
		P.leaves += pt() - tp; tp = pt();
		let occ = 0, occC = 0;
		const overlays = overlaysOf(S);
		for (const o of overlays) {
			if (!o || !o.isConnected || !o.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
			const ob = rect(o);
			occ += area(inter(hb, ob)); occC += area(inter(cb, ob));
		}
		rec[F.occl] = area(hb) > 0 ? Math.round(Math.min(1, occ / area(hb)) * 1000) : 0;
		rec[F.occlCtl] = area(cb) > 0 ? Math.round(Math.min(1, occC / area(cb)) * 1000) : 0;
		P.overlays += pt() - tp; P.n++;
		if (hb[2] >= 4 && hb[3] >= 4) W.last = Object.fromEntries(['look', 'pipTheme', 'screen', 'hx', 'hy', 'hw', 'hh', 'cx', 'cy', 'cw', 'ch'].map((k) => [k, rec[F[k]]]));
		return rec;
	};
	const sample = () => {
		const t0 = performance.now(), seq = ++W.seq;
		let rec;
		try { rec = measure(seq, t0); }
		catch (e) { W.err++; if (!W.errMsg) W.errMsg = String((e && e.stack) || e); rec = new Array(NF).fill(0); rec[F.seq] = seq; rec[F.t] = Math.round(t0 * 10) / 10; rec[F.cls] = 'e'; rec[F.look] = -1; }
		writeTag(seq);
		rec[F.cost] = Math.round((performance.now() - t0) * 1000);
		W.recs.push(rec);
	};
	/* the end-of-frame driver */
	const drv = doc.createElement('div');
	drv.setAttribute('data-pip-steady', 'driver');
	drv.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;pointer-events:none;visibility:hidden;contain:strict;margin:0;padding:0;border:0';
	html.appendChild(drv);
	const ro = new ResizeObserver(() => { if (W.on) sample(); });
	ro.observe(drv);
	let flip = 0;
	const tick = () => { if (!W.on) return; requestAnimationFrame(tick); drv.style.width = (flip ^= 1) ? '2px' : '1px'; };
	requestAnimationFrame(tick);
	W.calibrate = (label, o) => new Promise((done) => {
		if (W.cal) { done({ ok: false, why: 'calibration already running' }); return; }
		const C = { id: ++W.calN, label: str(label), phase: 1, n: 0, pre: (o && o.pre) || 45, hide: (o && o.hide) || 24, post: (o && o.post) || 45, gHead: null, hidden: false, first: 0 };
		const timer = setTimeout(() => { if (W.cal === C) { if (C.hidden) { C.gHead.style.visibility = C.oldH; C.gCtl.style.visibility = C.oldC; } W.cal = null; C.done({ ok: false, id: C.id, why: 'no steady frames (timeout)' }); } }, 12000);
		C.done = (r) => { clearTimeout(timer); W.cals.push({ ...r, label }); done(r); };
		W.cal = C;
	});
	W.take = (n) => W.recs.splice(0, n);
	W.stop = () => { W.on = false; ro.disconnect(); clearTag(); drv.remove(); };
	W.header = {
		kind: 'header', v: 2, fields: FIELDS, dpr, ox: cfg.ox, oy: cfg.oy, viewport: [innerWidth, innerHeight],
		tag: { x: (cfg.x + cfg.ox) * dpr, y: (cfg.y + cfg.oy) * dpr, block: B * dpr, cells: N, bits: NB, sync: [1, 0] }
	};
	return W.header;
}

/* ---------------------------------------------------------------------------------------------- node side */
export const TAG = { x: 0, y: 0, block: 12, bits: 20 };
export const idx = (fields) => Object.fromEntries(fields.map((k, i) => [k, i]));

/* Read a witness log (JSON lines: header, recs chunks, strings, cals, end). Throws on an incomplete log. */
export function readWitness(text) {
	let header = null, end = null;
	const recs = [], strings = [], cals = [];
	for (const line of text.split('\n')) {
		if (!line.trim()) continue;
		const o = JSON.parse(line);
		if (o.kind === 'header') header = o;
		else if (o.kind === 'recs') {
			for (const r of o.recs) recs.push(r);
			if (o.strings) { if (o.stringsFrom !== strings.length) throw new Error(`witness strings out of order at ${o.stringsFrom}`); strings.push(...o.strings); }
			if (o.cals) cals.push(...o.cals);
		} else if (o.kind === 'end') end = o;
	}
	if (!header) throw new Error('witness log has no header');
	if (!end) throw new Error('witness log has no end record (the run stopped before the witness was read out)');
	if (end.lost) throw new Error(`the page was lost before the witness's last records were read (${end.lost})`);
	if (end.count !== recs.length) throw new Error(`witness log holds ${recs.length} records, its end says ${end.count}`);
	const F = idx(header.fields);
	for (let i = 1; i < recs.length; i++) if (recs[i][F.seq] !== recs[i - 1][F.seq] + 1) throw new Error(`witness records skip from ${recs[i - 1][F.seq]} to ${recs[i][F.seq]}`);
	return { header, recs, strings, cals, end, F };
}

const median = (a) => { if (!a.length) return NaN; const s = [...a].sort((x, y) => x - y); return s[s.length >> 1]; };

/* The structural paint contract of one frame the page declares visible, against its look's calibration: returns why the
   frame fails ([] when it holds). Used by evaluateWitness and by the negatives runner, frame by frame. */
export function paintContract(w) {
	const { recs, strings, F } = w;
	const S = (i) => (i >= 0 ? strings[i] : '');
	const median = (a) => { if (!a.length) return NaN; const t = [...a].sort((x, y) => x - y); return t[t.length >> 1]; };
	const base = new Map();
	for (const r of recs) if (r[F.calPhase] === 1 && r[F.cls] === 'v') { const k = S(r[F.look]); if (!base.has(k)) base.set(k, []); base.get(k).push(r); }
	const B = new Map();
	for (const [k, a] of base) B.set(k, { leaf: median(a.map((r) => r[F.leafArea])), area: median(a.map((r) => r[F.hw] * r[F.hh])), clip: median(a.map((r) => r[F.clipFrac])), sigs: new Set(a.map((r) => r[F.sig])), n: a.length });
	const why = (r) => {
		if (F.gone !== undefined && r[F.gone]) return [S(r[F.why]) === 'Pip missing from the stage' || !S(r[F.why]) ? 'Pip missing from the stage (head or controller gone or detached in an open window)' : `${S(r[F.why])} (judged where Pip last was)`];
		const b = B.get(S(r[F.look])), w2 = [];
		if (F.foreign !== undefined && S(r[F.foreign])) w2.push(`an animation on Pip's ancestors that is not one of the stage's own effects: ${S(r[F.foreign])}`);
		if (!r[F.headVis]) w2.push('head not shown'); if (!r[F.ctlVis]) w2.push('controller not shown'); if (!r[F.strVis]) w2.push('a string not shown');
		if (r[F.opHead] < 950) w2.push(`head opacity ${r[F.opHead] / 1000}`); if (r[F.opCtl] < 950) w2.push(`controller opacity ${r[F.opCtl] / 1000}`); if (r[F.opStr] < 950) w2.push(`string opacity ${r[F.opStr] / 1000}`);
		if (r[F.blur] > 20) w2.push(`blur ${r[F.blur] / 10}px`); if (r[F.dim] < 300) w2.push(`brightness ${r[F.dim] / 1000}`);
		if (b) {
			if (r[F.leafArea] < 0.6 * b.leaf) w2.push(`painted leaves ${r[F.leafArea]} of ${b.leaf} px²`);
			const a = r[F.hw] * r[F.hh]; if (a < 0.4 * b.area || a > 2.5 * b.area) w2.push(`head box ${Math.round(a)} of ${Math.round(b.area)} px²`);
			if (r[F.clipFrac] < Math.min(900, b.clip - 100)) w2.push(`only ${r[F.clipFrac] / 10} % of the head inside its clips (look: ${b.clip / 10} %)`);
			/* (T67: the signature holds clip-paths, masks, filters and hidden back faces turned away; the text names them all) */
			if (!b.sigs.has(r[F.sig])) w2.push(`a clip-path, mask, filter or hidden back face on Pip or its ancestors that its look's calibration did not have: "${S(r[F.sig])}" (look: ${[...b.sigs].map(S).join(' ; ') || 'none'})`);
		}
		return w2;
	};
	return { why, looks: B };
}

/* Structural judgement of a witness log. Returns [{ name, ok, detail }], one per assertion.
 * - every frame with a rig (any class): nothing on the rig animates; the head is placed and hangs on both strings;
 * - every frame the page declares visible ('v', paintContract): Pip present in the open stage; no animation on its
 *   ancestors but the stage's own named effects; head, controller and strings shown (display, visibility), at full
 *   effective opacity (CSS and filter opacity on every ancestor), not blurred or darkened away, with the head's
 *   painted leaves, its box and the part of it inside every clipping ancestor and the viewport no less than in its
 *   look's calibration, and no clip-path, mask or filter on any part or ancestor that its look's calibration did not
 *   have. Not covered: what a filter or mask the calibration had does to alpha, filters on the head's own leaves (the
 *   looks use them), and layers drawn over Pip by anything but the stage's overlays; the film half judges those;
 * - every look shown in a visible frame has a completed calibration; the witness itself threw nothing. */
export function evaluateWitness(w, { phase = null } = {}) {
	const { recs, strings, cals, F } = w, out = [];
	const S = (i) => (i >= 0 ? strings[i] : '');
	const sel = phase == null ? recs : recs.filter((r) => S(r[F.label]) === phase);
	const name = (s) => (phase ? `${phase}: ${s}` : s);
	const rig = sel.filter((r) => r[F.look] >= 0 && r[F.cls] !== 'o' && r[F.cls] !== 'e');
	const vis = sel.filter((r) => r[F.cls] === 'v');
	const first = (a, n = 4) => JSON.stringify(a.slice(0, n).map((r) => ({ seq: r[F.seq], look: S(r[F.look]), screen: S(r[F.screen]), cls: r[F.cls], why: S(r[F.why]) })));
	const err = sel.filter((r) => r[F.cls] === 'e');
	out.push({ name: name(`the witness measured every frame (${sel.length})`), ok: sel.length > 20 && !err.length, detail: sel.length <= 20 ? `only ${sel.length} frames` : `${err.length} frames threw` });
	const anim = rig.filter((r) => r[F.rigAnim] > 0);
	out.push({ name: name(`nothing on Pip's rig animates (${rig.length} frames)`), ok: rig.length > 20 && !anim.length, detail: `${anim.length} frames with an animation on the rig; first ${first(anim)}` });
	const off = rig.filter((r) => !r[F.placed] || r[F.offBy] > 0 || r[F.hw] < 4);
	out.push({ name: name(`Pip's head is placed and hangs on its strings (${rig.length} frames)`), ok: rig.length > 20 && !off.length, detail: `${off.length} frames off its strings or unplaced; first ${JSON.stringify(off.slice(0, 4).map((r) => ({ seq: r[F.seq], look: S(r[F.look]), offBy: r[F.offBy], placed: r[F.placed], head: [r[F.hx], r[F.hy], r[F.hw], r[F.hh]] })))}` });
	const { why, looks: B } = paintContract(w);
	const looks = [...new Set(vis.map((r) => S(r[F.look])))];
	const uncal = looks.filter((k) => !B.has(k));
	out.push({ name: name(`every look shown has its own calibration (${looks.join(', ') || 'none'})`), ok: looks.length > 0 && !uncal.length, detail: uncal.length ? `no completed calibration for ${uncal.join(', ')}` : 'no visible frames' });
	const lost = vis.map((r) => [r, why(r)]).filter(([, w]) => w.length);
	out.push({ name: name(`in every visible frame Pip's head, controller and strings are painted: present, shown, opaque, unclipped, unmasked, no stray animation above them (${vis.length} frames)`), ok: vis.length > 20 && !lost.length, detail: vis.length <= 20 ? `only ${vis.length} visible frames` : `${lost.length} frames; first ${JSON.stringify(lost.slice(0, 4).map(([r, w]) => ({ seq: r[F.seq], look: S(r[F.look]), screen: S(r[F.screen]), why: w })))}` });
	const failedCal = cals.filter((c) => !c.ok);
	out.push({ name: name('calibrations completed'), ok: phase != null || cals.some((c) => c.ok), detail: `${cals.filter((c) => c.ok).length} completed, ${failedCal.length} aborted${failedCal.length ? ': ' + JSON.stringify(failedCal.slice(0, 4)) : ''}` });
	return out;
}
