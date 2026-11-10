// Pip's stage keeps its props off the speech box, and its effects inside the pane, in every frame of a transition (stream F
// lane stage, 2026-11-04; FO-34, FO-35, FO-39 and the NieR Creating 740 carry). A sampler reads, on each animation frame,
// every prop that shows (opacity over .05), the speech box (the bubble, or NieR's fixed box with its PIP tab) and Basic's
// confirmation ring. QA-4 trade: entering props may pass behind a settled bubble (lead ruling 18:40Z): a prop coming in or
// leaving may be under the box only while the bubble does not move (its placement, read per frame as in pip-bubble-clear,
// within 1 px) and only until it rests or is gone; a resting prop under the box always fails, and during any entry the
// bubble must not move within each line, covered or not. A new line may grow around the same bottom/tail anchor;
// if its new size cannot fit at that anchor it must take its new placement on its first frame. It fails on:
//  - NieR Light and Dark at 740x768 (the banner: NieR's box at the top over the props' column): a prop under the box or
//    its PIP tab while Safe's Add one is hovered and left, Add one is pressed and Back is pressed, Safe with an online copy
//    settles (the cloud), and Creating lowers its blocks (each went down behind the tab and the box), with three blocks
//    and with four (an online copy signed in by the concept's stand-in owner), and the settled four-block stack stands
//    below the box and its tab;
//  - Glass Dark, Basic Light, Friendly Light, Retro Light and Retro Dark at 1920x1080, 1390x900, 860x768 and 740x768: a
//    prop under the bubble on Name > Safe > Add one > Back > Review (a leaving prop rose through the bubble, the next words'
//    bubble moved onto a prop still fading out, or, in Retro's 740 banner where no place was clear, claimed a place over
//    the leaving sign); --set leaveLooks= limits the looks;
//  - Glass Dark and Basic Light at 1920x1080 and 1390x900, Begins as: an existing folder picked, then New, then the folder
//    again, then New (AST3: the folder leaving went behind the new words' bubble for 11 frames);
//  - Basic Light at 1920x1080 and 1390x900: Basic's check badge or the ring spreading from it past the stage's visible
//    box (the pane, cut by its clipping parents) when a choice on Away from home is made (the globe hangs at the pane's
//    right edge; AST4's key ring was cut there).
// Geometry from the page, not pixels: films cover the motion claims (lane report). Every case also fails if it sampled
// no frames, or never saw what it is about (a leaving prop, a block, a ring). Both surfaces unless --set sandbox picks one.
// --set only=nier|leave|begin|ring runs one group. About 6 minutes per surface.
//   browser-check run Concepts/pm7-tools/browser-check/checks/stage-keepoff.check.mjs --set page=<build>

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
const LAYER = '#pm-o55-onboarding .o55-layer:not(.o55-out)';
const on = (mode, fn) => (t) => (t.app.surfaces().includes(mode) ? fn(t, mode) : t.check(`not run: --set sandbox picks the other surface than ${mode}`, true));
const want = (t, g) => !t.args.only || t.args.only.split(',').includes(g);

// the per-frame sampler, in the app's frame. It reads at the end of each frame, after every animation-frame callback (the
// rig's render included) and the frame's layout, just before paint: a ResizeObserver on a 1 px element whose width an
// animation frame toggles (a plain animation-frame read can see a state the rig rewrites before the frame is painted)
function sampler(options) {
	const S0 = window.__sk = { frames: 0, hits: [], rings: 0, ringOut: [], leaving: 0, blocks: 0, covered: 0, eps: new Map(), anchors: new Map(), lines: new Map() };
	S0.trace=options?.trace?[]:null;S0.meta={mode:options?.mode,size:[innerWidth,innerHeight],start:performance.now(),timeOrigin:performance.timeOrigin};
	const R = (e) => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; };
	const meet = (a, b) => a[0] < b[2] - 0.5 && a[2] > b[0] + 0.5 && a[1] < b[3] - 0.5 && a[3] > b[1] + 0.5;
	// A new size must fit the prop's swept space, not just its upright box at this instant. Rotate the model
	// independently through the declared small swing and map it through the actual painted SVG viewport.
	const swept = (p, st) => {
		const rp=p.restFit, bb=p.spaceBB||p.bb, m=p.el.parentNode.getScreenCTM(), sr=st.screen.getBoundingClientRect();
		if(!rp||!bb||!m) { const b=p.restBox;if(!b)return null;const a=st.toScreen(b.slice(0,2)),z=st.toScreen(b.slice(2));return[a[0]-6,a[1]-6,z[0]+6,z[1]+6]; }
		const tg=st.propTarget(p), mid=p.ties.reduce((s,t)=>s+t[0],0)/p.ties.length;
		const angles=p.spec.ground||st.still()?[0]:Array.from({length:33},(_,i)=>-.15+.3*i/32), points=[];
		for(const a of angles) for(const x of [bb[0],bb[0]+bb[2]]) for(const y of [bb[1],bb[1]+bb[3]]) {
			const c=Math.cos(a),n=Math.sin(a),u=(x-mid)*rp.sc,v=(y-tg.tieY)*rp.sc;
			const X=rp.ax+n*tg.len+u*c-v*n,Y=st.L.anchorY+rp.dy+c*tg.len+u*n+v*c;
			points.push([m.a*X+m.c*Y+m.e-sr.left,m.b*X+m.d*Y+m.f-sr.top]);
		}
		return[Math.min(...points.map(p=>p[0]))-6,Math.min(...points.map(p=>p[1]))-6,Math.max(...points.map(p=>p[0]))+6,Math.max(...points.map(p=>p[1]))+6];
	};
	// Independently sample the complete declared head motion. A box clear at the current pose can cross a prop
	// as Pip sways; that old anchor is then ineligible, even on the new line's first frame (K19).
	const headMotion = (st, tall) => {
		const pts=[], still=st.still(), L=st.L, ps=st.ps;
		for(const th of still?[0]:[-.15,0,.15]) for(const turn of still?[0]:[-.2,0,.2]) for(const dy of still||st.fam.noHop?[0]:[-12,0,2]) {
			const a=ps.tiltT+th*.9+turn,h=st.headAt(ps.Ct.x,ps.Ct.y,th,dy),reach=st.pipReach(a);
			h[1]=Math.min(h[1],L.ground-2-28*L.s,reach&&st.vis?st.vis.y1-reach[3]:Infinity);
			pts.push(st.toScreen(st.headXf(tall?[44,30]:[58,44],h,a,1,1)));
		}
		const sway=still?0:st.fam.sway*st.map.k,rock=still?0:st.rockMax==null?.12:st.rockMax;
		const bars=[-rock,0,rock].map(phi=>st.barBox(6,{C:ps.Ct,phi})).filter(Boolean);
		return {lo:[Math.min(...pts.map(p=>p[0]))-sway,Math.min(...pts.map(p=>p[1]))],hi:[Math.max(...pts.map(p=>p[0]))+sway,Math.max(...pts.map(p=>p[1]))],
			bar:bars.length?[Math.min(...bars.map(b=>b[0]))-sway,Math.min(...bars.map(b=>b[1])),Math.max(...bars.map(b=>b[2]))+sway,Math.max(...bars.map(b=>b[3]))]:null};
	};
	// QA-4 trade: entering props may pass behind a settled bubble (lead ruling 18:40Z). The bubble's placement at the
	// moment it was made, as pip-bubble-clear reads it, so stillness can be judged per entry
	const wrap = () => {
		const st2 = document.querySelector('#pm-o55-onboarding .o55-stage')?.__pipStage;
		if (!st2 || st2.__skWrapped) return;
		const place = st2.placeBubble;
		st2.placeBubble = function (H, ang) { const r = place.call(this, H, ang); try { const s2 = this.toScreen(this.headXf(this.layoutName === 'portrait' ? [44, 30] : [58, 44], H, ang, 1, 1)), m = /^(-?[\d.]+)px (-?[\d.]+)px$/.exec(this.bubble.style.translate || ''); this.__relAtPlace = m ? [Math.round((+m[1] - s2[0]) * 100) / 100, Math.round((+m[2] - s2[1]) * 100) / 100] : null; } catch (e) { this.__relAtPlace = null; } return r; };
		st2.__skWrapped = true;
	};
	wrap();
	const span1 = (vs, i) => vs.length ? Math.max(...vs.map((v) => v[i])) - Math.min(...vs.map((v) => v[i])) : 0;
	const stillSpan = (ep) => Math.max(Math.min(span1(ep.rels, 0), span1(ep.trs, 0)), Math.min(span1(ep.rels, 1), span1(ep.trs, 1)));
	const finishEp = (ep) => {
		if (ep.rels.length < 2 || stillSpan(ep) <= 1) return;
		if (ep.out) { if (ep.covered) S0.hits.push(`${ep.screen}: bubble moved ${stillSpan(ep).toFixed(1)} px while leaving ${ep.kind} passed behind it (${ep.covered} covered frame(s))`); }
		else S0.hits.push(`${ep.screen}: bubble moved ${stillSpan(ep).toFixed(1)} px during ${ep.kind}'s entry (${ep.rels.length} frames${ep.covered ? `, ${ep.covered} covered` : ''})`);
	};
	S0.finish = () => { for (const ep of S0.eps.values()) finishEp(ep); S0.eps.clear(); for (const ep of S0.lines.values()) if (ep.rels.length > 1 && stillSpan(ep) > 1) S0.hits.push(`${ep.screen}: line '${ep.text.slice(0, 32)}' first placement strayed ${stillSpan(ep).toFixed(2)} px`); };
	S0.finishOne = (key) => { const ep = S0.eps.get(key); if (ep) { finishEp(ep); S0.eps.delete(key); } };
	const tick = () => {
		if (!window.__sk) return;
		wrap();
		const st = document.querySelector('#pm-o55-onboarding .pst'), svg = st && st.querySelector('svg'), b = st && st.querySelector('.pst-bubble');
		const st2 = document.querySelector('#pm-o55-onboarding .o55-stage')?.__pipStage;
		if (st && svg && b && window.__sk) {
			const S = window.__sk; S.frames++;
			const boxes = [];
			if (b.classList.contains('on') && (b.textContent || '').trim() && getComputedStyle(b).visibility !== 'hidden') {
				boxes.push(['speech box', R(b)]);
				const tab = b.querySelector(':scope > .pst-bn'); if (tab && tab.getBoundingClientRect().width) boxes.push(['PIP tab', R(tab)]);
			}
			const screen = window.O55 && window.O55.S.sess.screen;
			const nier = st2 && st2.famName === 'nier';
			const m2 = /^(-?[\d.]+)px (-?[\d.]+)px$/.exec(b.style.translate || '');
			const relNow = nier ? R(b).slice(0, 2) : (st2 && st2.__relAtPlace) || null;
			const trNow = nier ? R(b).slice(0, 2) : m2 ? [+m2[1], +m2[2]] : null;
			if(S.trace&&st2) S.trace.push({t:performance.now(),screen,text:(b.textContent||'').trim(),size:[b.offsetWidth,b.offsetHeight],side:b.dataset.side,rel:relNow,at:trNow,
				name:document.querySelector('#pm-o55-onboarding [data-o55-bind="name"]')?.value,theme:st2.theme,claim:st2.bubbleClaim,kept:st2.bubbleRel,keepOff:st2.keepOff,map:st2.map,decision:st2.__bubbleDecision,history:st2.__bubbleHistory?.slice(),
				props:[...st2.props].map(([id,p])=>({id,bb:p.bb,spec:p.spec,restBox:p.restBox,fit:p.restFit&&{dx:p.restFit.dx,dy:p.restFit.dy,f:p.restFit.f},ax:p.ax,len:p.len,a:p.a,settled:p.settled}))});
			const seen = new Set();
			if (!nier && st2 && relNow && trNow && boxes.length && st2.H) {
				const text = (b.textContent || '').trim(), tall = st2.layoutName === 'portrait', bw = b.offsetWidth, bh = b.offsetHeight;
				const sp = st2.toScreen(st2.headXf(tall ? [44, 30] : [58, 44], st2.H, st2.ang, 1, 1));
				const motion=headMotion(st2,tall),v=st2.vis,lo=v&&st2.toScreen([v.x0,v.y0]),hi=v&&st2.toScreen([v.x1,v.y1]);
				const pad=st2.tube?14:8,top=st2.tube?(tall?44:34):8,foot=st2.tube==='teletype'?(tall?70:48):st2.tube?(tall?44:34):8;
				const bounds=[Math.max(pad,lo?lo[0]+pad:pad),Math.max(top,lo?lo[1]+4:top),Math.min(st2.box.width-bw-pad,hi?hi[0]-bw-pad:st2.box.width),Math.min(st2.box.height-bh-foot,hi?hi[1]-bh-4:st2.box.height)];
				const follows=[0,1].map(i=>bounds[i+2]-bounds[i]>=motion.hi[i]-motion.lo[i]),origin=sp.map((p,i)=>follows[i]?p:(motion.lo[i]+motion.hi[i])/2);
				const exactRel=st2.speechRoom?.line===st2.saying?st2.speechRoom.rel:st2.bubbleRel||trNow.map((p,i)=>p-origin[i]);
				const side=b.dataset.side;
				const pin=(s,w,h)=>s==='up'?[w*.3,0]:s==='down'?[w*.3,h]:s==='right'?[w,h/2]:[0,h/2];
				const offset=pin(side||(tall?'down':'left'),bw,bh),anchor=exactRel.map((p,i)=>p+offset[i]);
				const prev = S.lastScreen === screen ? S.anchors.get(screen) : null;
				const entering = [...st2.props.values()].some(p => p.state !== 'out' && !p.settled && p.op > .05);
				if (entering && prev && prev.text !== text) {
					const offset=pin(prev.side||(tall?'down':'left'),bw,bh),x=origin[0]+prev.anchor[0]-offset[0],y=origin[1]+prev.anchor[1]-offset[1];
					const candidate = [x,y,x+bw,y+bh];
					const obs = [...st2.props.values()].filter(p => p.state !== 'out' && p.restBox).map(p=>swept(p,st2)).filter(Boolean);
					// Include the owner's more conservative reservation as well as the independent 33-angle art sweep.
					for(const p of st2.props.values()) if(p.state!=='out'&&p.restFit) {const rb=p.restFit.speechBox||p.restFit.box;if(rb){const a=st2.toScreen(rb.slice(0,2)),z=st2.toScreen(rb.slice(2));obs.push([a[0]-6,a[1]-6,z[0]+6,z[1]+6]);}}
					const stack=st2.stackFit().box;if(stack){const a=st2.toScreen(stack.slice(0,2)),z=st2.toScreen(stack.slice(2));obs.push([a[0]-6,a[1]-6,z[0]+6,z[1]+6]);}
					if(motion.bar)obs.push(motion.bar);
					const sweptCandidate=candidate.map((p,i)=>follows[i%2]?p+(i<2?motion.lo[i]:motion.hi[i-2])-sp[i%2]:p);
					const fc=[st2.ps.tiltT-.2,st2.ps.tiltT,st2.ps.tiltT+.2].flatMap(a=>{const q=st2.toScreen(st2.headXf(tall?[44,30]:[58,44],st2.H,a,1,1));return[[12,32],[52,32],[12,58],[52,58]].map(p=>{const v=st2.toScreen(st2.headXf(p,st2.H,a,1,1));return v.map((v,i)=>v+sp[i]-q[i]);});});
					const face=[Math.min(...fc.map(p=>p[0]))-6,Math.min(...fc.map(p=>p[1]))-6,Math.max(...fc.map(p=>p[0]))+6,Math.max(...fc.map(p=>p[1]))+6];if(tall)face[1]-=12;else face[2]+=12;
					for(let i=0;i<2;i++)if(!follows[i]){face[i]+=motion.lo[i]-sp[i];face[i+2]+=motion.hi[i]-sp[i];}
					const intersects=(a,o)=>a[0]<o[2]-1e-7&&a[2]>o[0]+1e-7&&a[1]<o[3]-1e-7&&a[3]>o[1]+1e-7;
					const canFit=lo&&sweptCandidate[0]>=bounds[0]-.5&&sweptCandidate[1]>=bounds[1]-.5&&sweptCandidate[2]<=bounds[2]+bw+.5&&sweptCandidate[3]<=bounds[3]+bh+.5&&!intersects(candidate,face)&&!obs.some(o=>intersects(sweptCandidate,o));
					const drift = Math.max(...anchor.map((v,i)=>Math.abs(v-prev.anchor[i])));
					if(S.trace) {
						const d=st2.__bubbleDecision, meet=(a,o)=>a[0]<o[2]-1e-7&&a[2]>o[0]+1e-7&&a[1]<o[3]-1e-7&&a[3]>o[1]+1e-7;
						const sr=R(st2.screen),hr=R(st2.gHead),head=[hr[0]-sr[0],hr[1]-sr[1],hr[2]-sr[0],hr[3]-sr[1]];
						S.trace[S.trace.length-1].swap={old:prev,next:{text,anchor,side},candidate,sweptCandidate,motion,follows,face,canFit,drift,rawObs:obs,head,headHit:meet(candidate,head),model:d&&{face:meet(candidate,d.face),hits:d.obs.filter(o=>meet(candidate,o)),bounds:d.bounds}};
					}
					if(canFit && drift > 1) S.hits.push(`${screen}: new line moved its bottom/tail anchor ${drift.toFixed(2)} px during entry although its new size fits`);
				}
				S.anchors.set(screen,{text,anchor,side}); S.lastScreen = screen;
				const lk = `${screen}|${text}|${bw}|${bh}`;
				if(S.lineKey !== lk) { S.lineKey=lk; S.lineN=(S.lineN||0)+1; S.lines.set(S.lineN,{screen,text,rels:[],trs:[]}); }
				const line=S.lines.get(S.lineN);line.rels.push(relNow);line.trs.push(trNow);
			}
			if (st2 && st2.props) st2.props.forEach((pr, id) => {
				if (!pr.el || !pr.el.isConnected || !(pr.op > 0.05)) return;
				const pb = R(pr.el); if (pb[2] - pb[0] < 1) return;
				const kind = (pr.spec && pr.spec.kind) || pr.el.dataset.kind;
				if (kind === 'block') S.blocks++;
				const text = (b.textContent || '').trim();
				const out = pr.state === 'out', key = `${id}|${screen}|${text}|${out ? 'out' : 'in'}`;
				seen.add(key);
				let ep = S.eps.get(key);
				if (!ep) { ep = { kind, out, screen, covered: 0, settledSeen: false, rels: [], trs: [] }; S.eps.set(key, ep); }
				if (relNow) ep.rels.push(relNow); if (trNow) ep.trs.push(trNow);
				const hitNow = boxes.length && boxes.some(([, bx]) => meet(pb, bx));
				if (!out && pr.settled) {
					ep.settledSeen = true;
					if (hitNow) boxes.forEach(([n, bx]) => { if (meet(pb, bx)) S.hits.push(`${screen}: ${kind} (opacity ${pr.op.toFixed(2)}) under the ${n} at ${pb.map(Math.round)} vs ${bx.map(Math.round)}`); });
					S.finishOne(key);
				} else if (hitNow) { ep.covered++; S.covered++; }
			});
			for (const k of [...S.eps.keys()]) if (!seen.has(k)) S.finishOne(k);
			// leaving props: the rig marks none, so count props whose opacity falls
			st.querySelectorAll('.pst-prop').forEach((p) => { const op = +p.getAttribute('opacity'), was = +(p.dataset.skOp || 0); if (op < was - 0.01 && op > 0.05) S.leaving++; p.dataset.skOp = String(op); });
			// Basic's ring (an unfilled r 11 circle in a particle) and its badge, against the stage's visible box
			let vis = R(svg);
			for (let e = svg.parentElement; e && e !== document.body; e = e.parentElement) { const cs = getComputedStyle(e); if (/hidden|clip|auto|scroll/.test(cs.overflowX + cs.overflowY)) { const c = R(e); vis = [Math.max(vis[0], c[0]), Math.max(vis[1], c[1]), Math.min(vis[2], c[2]), Math.min(vis[3], c[3])]; } }
			st.querySelectorAll('g.pst-p').forEach((g) => {
				const c = g.querySelector('circle[r="11"]'); if (!c || !(+g.getAttribute('opacity') > 0.02)) return;
				const ring = c.getAttribute('fill') === 'none'; if (ring) S.rings++;
				const m = (g.getAttribute('transform') || '').match(/scale\(([\d.]+)/), k = m ? +m[1] : 1, sw = (+c.getAttribute('stroke-width') || 0) * k / 2, r = R(c);
				const o = [r[0] - sw, r[1] - sw, r[2] + sw, r[3] + sw];
				if (o[0] < vis[0] - 0.5 || o[1] < vis[1] - 0.5 || o[2] > vis[2] + 0.5 || o[3] > vis[3] + 0.5) S.ringOut.push(`${screen}: ${ring ? 'ring' : 'check'} at ${o.map(Math.round)} past the visible stage ${vis.map(Math.round)}`);
			});
		}
	};
	const dot = document.createElement('i'); dot.setAttribute('aria-hidden', 'true');
	dot.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;pointer-events:none;opacity:0';
	document.body.appendChild(dot);
	new ResizeObserver(() => tick()).observe(dot);
	const flip = () => { if (!window.__sk) { dot.remove(); return; } dot.style.width = dot.style.width === '1px' ? '2px' : '1px'; requestAnimationFrame(flip); };
	requestAnimationFrame(flip);
}

async function openAt(t, mode, look, [w, h], screen) {
	await t.viewport(w, h);
	const f = await t.app.open({ onboarding: true, query: 'o55=screen=' + screen, sandbox: mode === 'sandbox' });
	await f.waitForFunction(() => !!window.O55 && !!document.querySelector('#pm-o55-onboarding .o55-win'), null, { timeout: 60000 });
	const [fam, scheme] = look.split('-');
	await f.evaluate(([a, b]) => window.O55.ui.applyLook(a, b), [fam, scheme]);
	await f.waitForTimeout(4500);
	t.mark(`${mode} ${look} ${w}x${h} ${screen}`);
	await f.evaluate(sampler,{trace:!!t.args.frames,mode});
	return f;
}
// a control of the current screen, by its action, through the real pointer (the sandbox fills the window)
async function point(t, f, mode, act, arg, click = true) {
	const r = await f.evaluate(([L, d, a]) => { const b = [...document.querySelectorAll(`${L} [data-o55-do="${d}"]${a ? `[data-arg="${a}"]` : ''}`)].find((x) => x.getBoundingClientRect().width); if (!b) return null; b.scrollIntoView({ block: 'center' }); const q = b.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }, [LAYER, act, arg || '']);
	if (!r) return false;
	await t.page.mouse.move(r.x, r.y, { steps: 4 });
	if (click) await t.page.mouse.click(r.x, r.y);
	await f.waitForTimeout(2400);
	return true;
}
async function next(t, f, to) {
	for (let i = 0; i < 8 && (await f.evaluate(() => window.O55.S.sess.screen)) !== to; i++) {
		await f.evaluate(() => { const b = document.querySelector('#pm-o55-onboarding .o55-layer:not(.o55-out) .o55-foot .o55-primary'); if (b && !b.disabled) b.click(); });
		await f.waitForTimeout(1600);
	}
	return (await f.evaluate(() => window.O55.S.sess.screen)) === to;
}
async function nameIt(t, f) {
	const inp = f.locator(`${LAYER} input`).first();
	await inp.click(); await t.page.keyboard.press('Control+A'); await t.page.keyboard.type('Book club', { delay: 25 });
}
// what the sampler saw; and a clean store for the next case's fresh load (a normal page keeps the session in localStorage:
// Safe's online copy, set below, left the next case's Review unable to create)
const result = async (t, f) => { const S = await f.evaluate(() => { const S = window.__sk; window.__sk = null; S.finish(); return { frames: S.frames, hits: S.hits, rings: S.rings, ringOut: S.ringOut, leaving: S.leaving, blocks: S.blocks, covered: S.covered,meta:S.meta,trace:S.trace }; }); if(S.trace)fs.appendFileSync(path.join(t.run.dir,'keepoff-trace.jsonl.gz'),zlib.gzipSync(JSON.stringify(S)+'\n')); await t.app.resetLayout(t); return S; };

async function nier(t, mode) {
	for (const look of ['nier-light', 'nier-dark']) {
		const tag = `${look} 740x768 ${mode}`;
		let f = await openAt(t, mode, look, [740, 768], 'safe');
		await point(t, f, mode, 'online', null, false);            // Add one hovered: the cloud's preview comes in
		await t.page.mouse.move(4, 4, { steps: 3 }); await f.waitForTimeout(2000);
		await point(t, f, mode, 'online');                        // pressed: Safe's vault leaves, the service's mark comes in
		await point(t, f, mode, 'back');                          // and back
		// Safe with an online copy chosen (state: the draft's online copy, as the service screen's Continue leaves it)
		await f.evaluate(() => { const d = window.O55.S.sess.drafts.main; d.online_mode = 'new'; d.forge = 'github'; window.O55.ui.go('safe', { noHistory: true }); });
		await f.waitForTimeout(3500);
		let S = await result(t, f);
		await t.check(`${tag}: Safe's Add one, Back and the settled cloud: no prop under the box or the PIP tab`, S.frames > 200 && S.leaving > 0 && S.hits.length === 0, `${S.frames} frames, ${S.leaving} leaving samples, ${S.hits.length} overlaps (${S.covered} frames of props passing behind a still bubble, allowed): ${S.hits.slice(0, 3).join(' ; ')}`);
		f = await openAt(t, mode, look, [740, 768], 'name');
		await nameIt(t, f);
		const reached = (await next(t, f, 'review')) && (await next(t, f, 'creating'));
		await f.waitForTimeout(8000);
		S = await result(t, f);
		await t.check(`${tag}: Creating lowers its blocks clear of the box and the PIP tab`, reached && S.blocks > 0 && S.hits.length === 0, `${reached ? 'creating' : 'did not reach Creating'}, ${S.frames} frames, ${S.blocks} block samples, ${S.hits.length} overlaps (${S.covered} frames of props passing behind a still bubble, allowed): ${S.hits.slice(0, 3).join(' ; ')}`);
		// Creating with four blocks: an online copy, signed in by the concept's stand-in owner (no real account), the whole
		// route sampled, then the settled stack measured (the onb lane's carried 'box over the top block by 5-7 px')
		f = await openAt(t, mode, look, [740, 768], 'name');
		await nameIt(t, f);
		let ok4 = (await next(t, f, 'safe')) && (await point(t, f, mode, 'online')) && (await point(t, f, mode, 'pick', 'github'));
		ok4 = ok4 && (await next(t, f, 'online-signin')) && (await point(t, f, mode, 'signIn'));
		ok4 = ok4 && (await f.waitForFunction(() => (window.O55.S.sess.signin || {}).state === 'done', null, { timeout: 20000 }).then(() => true, () => false));
		ok4 = ok4 && (await next(t, f, 'review')) && (await next(t, f, 'creating'));
		await f.waitForTimeout(14000);
		const set = await f.evaluate(() => {
			const st = document.querySelector('#pm-o55-onboarding .pst'), b = st.querySelector('.pst-bubble'), tab = b && b.querySelector(':scope > .pst-bn');
			const blocks = [...st.querySelectorAll('.pst-prop[data-kind="block"]')].filter((p) => +p.getAttribute('opacity') > 0.05).map((p) => p.getBoundingClientRect());
			const box = b.getBoundingClientRect(), tb = tab ? tab.getBoundingClientRect() : box, bottom = Math.max(box.bottom, tb.bottom);
			const top = blocks.length ? Math.min(...blocks.map((r) => r.top)) : null;
			return { n: blocks.length, top, bottom, left: Math.min(box.left, tb.left) };
		});
		S = await result(t, f);
		await t.check(`${tag}: Creating with an online copy (four blocks) lowers them clear of the box and the PIP tab`, ok4 && set.n >= 4 && S.hits.length === 0, `${ok4 ? 'creating' : 'the online-copy route did not reach Creating'}, ${set.n} blocks, ${S.frames} frames, ${S.hits.length} overlaps (${S.covered} frames of props passing behind a still bubble, allowed): ${S.hits.slice(0, 3).join(' ; ')}`);
		await t.check(`${tag}: the settled four-block stack stands below the box and its tab`, set.n >= 4 && set.top >= set.bottom - 0.5, `top block at ${set.top == null ? '-' : Math.round(set.top)} px, box and tab end at ${Math.round(set.bottom)} px`);
	}
}

async function leave(t, mode) {
	for (const look of t.args.leaveLooks ? String(t.args.leaveLooks).split(',') : ['glass-dark', 'basic-light', 'friendly-light', 'retro-light', 'retro-dark']) for (const size of t.args.leaveSizes ? String(t.args.leaveSizes).split(',').map(v=>v.split('x').map(Number)) : [[1920, 1080], [1390, 900], [860, 768], [740, 768]]) {
		const tag = `${look} ${size.join('x')} ${mode}`;
		const f = await openAt(t, mode, look, size, 'name');
		await nameIt(t, f);
		const ok = await next(t, f, 'safe');
		await point(t, f, mode, 'online'); await point(t, f, mode, 'back');
		await next(t, f, 'review'); await f.waitForTimeout(1500);
		const S = await result(t, f);
		await t.check(`${tag}: Name > Safe > Add one > Back > Review: no prop under the bubble`, ok && S.frames > 200 && S.leaving > 0 && S.hits.length === 0, `${ok ? '' : 'did not reach Safe; '}${S.frames} frames, ${S.leaving} leaving samples, ${S.hits.length} overlaps (${S.covered} frames of props passing behind a still bubble, allowed): ${S.hits.slice(0, 3).join(' ; ')}`);
	}
}

async function begin(t, mode) {
	for (const look of t.args.beginLooks ? String(t.args.beginLooks).split(',') : ['glass-dark', 'basic-light']) for (const size of t.args.beginSizes ? String(t.args.beginSizes).split(',').map(v=>v.split('x').map(Number)) : [[1920, 1080], [1390, 900]]) {
		const tag = `${look} ${size.join('x')} ${mode}`;
		const f = await openAt(t, mode, look, size, 'begin');
		await point(t, f, mode, 'pick', 'existing'); await point(t, f, mode, 'sub', 'folder');
		await point(t, f, mode, 'pick', 'new'); await point(t, f, mode, 'pick', 'existing'); await point(t, f, mode, 'pick', 'new');
		await t.page.mouse.move(4, 4, { steps: 3 }); await f.waitForTimeout(1500);
		const S = await result(t, f);
		await t.check(`${tag}: Begins as, folder <> New: no prop under the bubble`, S.frames > 200 && S.leaving > 0 && S.hits.length === 0, `${S.frames} frames, ${S.leaving} leaving samples, ${S.hits.length} overlaps (${S.covered} frames of props passing behind a still bubble, allowed): ${S.hits.slice(0, 3).join(' ; ')}`);
	}
}

async function ring(t, mode) {
	for (const size of [[1920, 1080], [1390, 900]]) {
		const tag = `basic-light ${size.join('x')} ${mode}`;
		const f = await openAt(t, mode, 'basic-light', size, 'away');
		await point(t, f, mode, 'pick', 'anywhere'); await f.waitForTimeout(800);
		await point(t, f, mode, 'pick', 'home'); await point(t, f, mode, 'pick', 'anywhere'); await f.waitForTimeout(1200);
		const S = await result(t, f);
		await t.check(`${tag}: Away's choices: Basic's badge and its ring stay inside the visible stage`, S.rings > 0 && S.ringOut.length === 0, `${S.frames} frames, ${S.rings} ring samples, ${S.ringOut.length} outside: ${S.ringOut.slice(0, 3).join(' ; ')}`);
	}
}

const all = (mode) => async (t) => {
	if (want(t, 'nier')) await nier(t, mode);
	if (want(t, 'leave')) await leave(t, mode);
	if (want(t, 'begin')) await begin(t, mode);
	if (want(t, 'ring')) await ring(t, mode);
};
export const tests = {
	'stage keep-off, normal page': on('normal', all('normal')),
	'stage keep-off, sandbox': on('sandbox', all('sandbox'))
};
