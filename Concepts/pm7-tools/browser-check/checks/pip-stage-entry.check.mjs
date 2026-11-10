// QA-4/QA-6 diagnosis probe (fo-qa-stage): per end-of-frame records of the speech bubble and every prop string.
// --set looks=glass-dark,basic-dark  --set screens=look,where,name,safe,review  --set secs=4  --set size=1920x1080
import fs from 'node:fs';
import path from 'node:path';

function install(counter) {
	if (window.__qa) return;
	const S = window.__qa = { on: false, frames: [], seq: 0 };
	let cells = null, shown = [];
	if(counter) {
		const tag=document.createElement('div');tag.style.cssText='position:fixed;left:0;top:0;width:168px;height:8px;contain:strict;z-index:2147483647;pointer-events:none';
		cells=Array.from({length:42},(_,i)=>{const e=document.createElement('i');e.style.cssText=`position:absolute;left:${i*4}px;top:0;width:4px;height:8px;background:#808080`;tag.appendChild(e);return e;});document.documentElement.appendChild(tag);
	}
	S.cells=cells; S.shown=shown;
	const d = document.createElement('div');
	d.setAttribute('aria-hidden', 'true');
	d.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;pointer-events:none;opacity:0;contain:strict';
	document.body.appendChild(d);
	let w = 1;
	const tick = () => { if (S.on) { w = w === 1 ? 2 : 1; d.style.width = w + 'px'; } requestAnimationFrame(tick); };
	requestAnimationFrame(tick);
	const R2 = (n) => Math.round(n * 100) / 100;
	// settled latches an arrival; the spring keeps moving afterwards. Observe
	// the actual callback, including arrivals between a frame's three substeps.
	const arrivals = new WeakMap();
	const arrival = (st, pr, kind) => {
		const target = st.propTarget(pr);
		arrivals.set(pr, { kind, at: st.t, ax: pr.ax, len: pr.len, target: { ax: target.ax, len: target.len } });
	};
	const initial = document.querySelector('#pm-o55-onboarding .o55-stage')?.__pipStage;
	if (initial) {
		const proto = Object.getPrototypeOf(initial), settle = proto.settle, add = proto.addProp;
		proto.settle = function(pr) { const result = settle.call(this, pr); arrival(this, pr, 'settle'); return result; };
		proto.addProp = function(...args) { const pr = add.apply(this, args); if (pr?.settled) arrival(this, pr, 'instant'); return pr; };
		initial.props.forEach(pr => { if (pr.settled) arrival(initial, pr, 'baseline'); });
	}
	new ResizeObserver(() => {
		if (!S.on) return;
		const host = document.querySelector('#pm-o55-onboarding .o55-stage');
		const st = host && host.__pipStage;
		const fr = { t: Math.round(performance.now()) };
		if (st && !st.dead && st.gHead && st.gHead.isConnected && st.screen) {
			const sr = st.screen.getBoundingClientRect();
			fr.stageRect=[sr.left,sr.top,sr.width,sr.height];
			const rel = (e) => { const b = e.getBoundingClientRect(); return [R2(b.left - sr.left), R2(b.top - sr.top), R2(b.width), R2(b.height)]; };
			const b = st.bubble, cs = getComputedStyle(b);
			fr.screen = window.O55.S.sess && window.O55.S.sess.screen;
			fr.layout = st.layoutName; fr.fam = st.famName;
			fr.bub = { box: rel(b), op: +cs.opacity, tr: b.style.translate || '', ow: b.offsetWidth, oh: b.offsetHeight,
				on: b.classList.contains('on') ? 1 : 0, text: (b.textContent || '').trim().slice(0, 48),
				anim: b.getAnimations().map((a) => a.animationName + ':' + a.playState).join(',') };
			fr.head = rel(st.gHead);
			fr.H = st.H ? st.H.map(R2) : null;
			fr.ang = R2((st.ang || 0) * 57.3);
			fr.sp = st.toScreen(st.headXf(st.layoutName === 'portrait' ? [44, 30] : [58, 44], st.H, st.ang, 1, 1)).map(R2);
			fr.relPlace = (() => { const m = /^(-?[\d.]+)px (-?[\d.]+)px$/.exec(st.bubble.style.translate || ''); return m ? [R2(+m[1] - fr.sp[0]), R2(+m[2] - fr.sp[1])] : null; })();
			fr.brel = st.bubbleRel ? st.bubbleRel.map(R2) : null;
			fr.claim = st.bubbleClaim ? st.bubbleClaim.map(R2) : null;
			fr.keepOff = st.keepOff ? st.keepOff.map(R2) : null;
			fr.C = st.ps ? [R2(st.ps.C.x), R2(st.ps.C.y), R2(st.ps.Ct.x), R2(st.ps.Ct.y), R2(st.ps.th * 57.3)] : null;
			fr.tiltT = st.ps ? R2(st.ps.tiltT) : null; fr.talking = st.talking ? 1 : 0; fr.typing = st.typeT ? 1 : 0;
			{ const gap = 6, fc = [[12, 32], [52, 32], [12, 58], [52, 58]].map((q) => st.toScreen(st.headXf(q, st.H, st.ang, 1, 1)));
			  fr.face = [R2(Math.min(...fc.map((c) => c[0])) - gap), R2(Math.min(...fc.map((c) => c[1])) - gap - (st.layoutName === 'portrait' ? 12 : 0)), R2(Math.max(...fc.map((c) => c[0])) + gap + (st.layoutName === 'portrait' ? 0 : 12)), R2(Math.max(...fc.map((c) => c[1])) + gap)];
			  const bar = st.barBox ? st.barBox(gap) : null; fr.bar = bar ? bar.map(R2) : null;
			  const bw = st.bubble.offsetWidth || 160, bh = st.bubble.offsetHeight || 34, tall2 = st.layoutName === 'portrait';
			  fr.usual = [R2(fr.sp[0] + (tall2 ? -bw * .3 : 6)), R2(tall2 ? fr.sp[1] - bh - 22 : fr.sp[1] - bh / 2), bw, bh]; }
			fr.map = st.map ? [st.map.k, st.map.ox, st.map.oy] : null;
			fr.nierBox = st.nierBox; fr.bubbleBox = st.bubbleBox; fr.bubbleRelT = st.bubbleRelT; fr.time = st.t; fr.say = st.saying;
			fr.vis = st.vis ? [R2(st.vis.x0), R2(st.vis.y0), R2(st.vis.x1), R2(st.vis.y1)] : null;
			fr.scr = [R2(sr.width), R2(sr.height)];
			fr.props = [];
			st.props.forEach((pr, id) => {
				if (!pr.el || !pr.el.isConnected) return;
				const tops = pr.strs.map((s) => { const dd = s.getAttribute('d') || ''; const m = /^M(-?[\d.]+) (-?[\d.]+)L(-?[\d.]+) (-?[\d.]+)/.exec(dd); return m ? [+m[1], +m[2], +m[3], +m[4]] : dd; });
				const rp = pr.restFit || null;
				fr.props.push({ id, kind: pr.spec && pr.spec.kind, state: pr.state, settled: pr.settled ? 1 : 0, arrival: arrivals.get(pr) || null, op: R2(pr.op), ax: R2(pr.ax), dx: R2(pr.dx || 0), a: R2(pr.a * 57.3), len: R2(pr.len), painted: rel(pr.el), bb: pr.bb, av: pr.av, axv: pr.axv, lenv: pr.lenv, target: st.propTarget(pr), box: pr.box ? pr.box.map(R2) : null, restBox: pr.restBox ? pr.restBox.map(R2) : null, rp: rp ? { ax: R2(rp.ax), dx: R2(rp.dx), dy: R2(rp.dy), sc: R2(rp.sc), key: rp.key } : null, tops });
			});
		} else fr.none = 1;
		if(cells) {fr.paintSeq=++S.seq;const bits=[1,0];for(let i=0;i<20;i++)bits.push((S.seq>>i)&1);for(let i=0;i<20;i++)bits.push(1-((S.seq>>i)&1));bits.forEach((v,i)=>{if(shown[i]!==v){cells[i].style.background=v?'#fff':'#000';shown[i]=v;}});}
		S.frames.push(fr);
	}).observe(d);
}


// Real-route regressions for the Round 2 causes. Data is retained in the run folder for frame/film attribution.
const L = '#pm-o55-onboarding .o55-layer:not(.o55-out)';
const median = a => [...a].sort((x,y)=>x-y)[Math.floor(a.length/2)];
const hit = (a,b) => a[0] < b[0]+b[2]-.5 && a[0]+a[2] > b[0]+.5 && a[1] < b[1]+b[3]-.5 && a[1]+a[3] > b[1]+.5;
export function judgeRest(frames) {
 const wrong=[], covered=[]; let rests=0;
 for(const x of frames) for(const p of x.props||[]) {
  if(p.state==='out'||!p.settled) continue;
  const a=p.arrival, at=`${x.screen} ${p.kind}`;
  if(!a) wrong.push(`${at}: missing arrival witness`);
  else {
   // The original2.51-unit bound belongs to the arrival, not every later
   // oscillation. Destination identity is checked on EVERY settled frame.
   if(Math.max(Math.abs(a.ax-a.target.ax),Math.abs(a.len-a.target.len))>2.51) wrong.push(`${at}: arrived while travelling`);
   if(Math.max(Math.abs(a.target.ax-p.target.ax),Math.abs(a.target.len-p.target.len))>1e-7) wrong.push(`${at}: arrival belongs to a previous target`);
  }
  if(p.op<.95) continue;
  if(hit(p.painted,x.bub.box)) covered.push(`${at} angle${p.a}: box${p.painted} vs speech${x.bub.box}`);
  rests++;
 }
 return { wrong, covered, rests };
}
function judge(frames) {
 const bad=[], episodes=[]; let current;
 for(const x of frames) {
  if(x.none) continue;
  const b=x.bub, key=b.on && b.op>.05 && b.text ? [x.screen,b.text].join('|') : null;
  if(!key) {current=null;continue;}
  if(!current || current.key!==key) {current={key,rows:[]};episodes.push(current);}
  current.rows.push(x);
 }
 for(const e of episodes) {
  const r=e.rows.map(x=>x.fam==='nier'?x.bub.box.slice(0,2):x.relPlace);
  const tr=e.rows.map(x=>x.fam==='nier'?x.bub.box.slice(0,2):x.bub.tr.split(' ').map(parseFloat));
  if(r.some(x=>!x)) {bad.push('missing placement');continue;}
  const tail=e.rows.length>20?-20:0;
  const at=[0,1].map(i=>median(r.slice(tail).map(x=>x[i]))), screen=[0,1].map(i=>median(tr.slice(tail).map(x=>x[i])));
  const ds=r.map((q,j)=>Math.max(...[0,1].map(i=>Math.min(Math.abs(q[i]-at[i]),Math.abs(tr[j][i]-screen[i])))));
  const worst=Math.max(...ds);
  if(worst>1) bad.push(`${e.rows[0].screen} '${e.rows[0].bub.text.slice(0,28)}': first ${ds[0].toFixed(2)}px, worst ${worst.toFixed(2)}px`);
 }
 return bad;
}
async function run(t, route, defaultLooks, defaultSizes) {
 // A previous exported test can leave the recording on its opaque wrapper.
 // Establish a fresh app frame before asking the recording to size it.
 if(t.recording) { await t.viewport(); await t.goto('about:blank'); }
 const sizes=String(t.args.sizes||defaultSizes).split(',').map(s=>s.split('x').map(Number));
 const looks=String(t.args.looks||defaultLooks).split(','), out=[];
 for(const mode of t.app.surfaces()) for(const look of looks) for(const size of sizes) {
  await t.viewport(...size);
  const f=await t.app.open({onboarding:true,query:'o55=screen=name',sandbox:mode==='sandbox'});
  await f.waitForFunction(()=>!!document.querySelector('#pm-o55-onboarding .o55-stage')?.__pipStage?.gHead,null,{timeout:60000});
  await t.emulate({reducedMotion:t.args.motion==='reduce'?'reduce':'no-preference'});
  await f.evaluate(([a,b])=>O55.ui.applyLook(a,b),look.split('-'));
  await f.waitForTimeout(4500); await f.evaluate(install,!!t.args.counter);
  const arm=async(label)=>{t.mark(`${mode} ${look} ${size.join('x')} ${label}`);await f.evaluate(base=>{window.__qa.frames=[];window.__qa.seq=base;window.__qa.on=true;},({review:1,rest:2,ready:3}[route])*250000+out.length*10000);};
  const save=async(label,target)=>{
   const frames=await f.evaluate(()=>{window.__qa.on=false;window.__qa.cells?.forEach(e=>{e.style.background='#808080';});window.__qa.shown.length=0;return window.__qa.frames;});
   out.push({mode,look,size,label,frames});fs.writeFileSync(path.join(t.run.dir,`probe-${route}.json`),JSON.stringify(out));
   const at=await f.evaluate(()=>O55.S.sess.screen), tag=`${mode} ${look} ${size.join('x')} ${label}`;
   await t.check(`${tag}: target sampled`,at===target&&frames.length>40,`${at}, ${frames.length} frames`);
   const bad=judge(frames);await t.check(`${tag}: first placement and each line remain within 1px`,bad.length===0,bad.slice(0,6).join('; '));
   if(route==='rest') {
    const {wrong, covered, rests}=judgeRest(frames);
    await t.check(`${tag}: arrival belongs to the current target and resting paint clears speech`,rests>0&&!wrong.length&&!covered.length,`${rests} resting samples, ${wrong.length} stale arrivals, ${covered.length} overlaps; ${wrong[0]||covered[0]||''}`);
   }
  };
  const click=async(act)=>{await f.locator(`${L} [data-o55-do="${act}"]`).first().click();await f.waitForTimeout(2400);};
  if(route==='rest') {
   await arm('Safe');await f.evaluate(()=>O55.ui.go('safe',{noHistory:true}));await f.waitForTimeout(6500);await save('Safe','safe');
   await arm('Add one / leave / Add one / Back');await f.locator(`${L} [data-o55-do="online"]`).first().hover();await f.waitForTimeout(2400);
   await t.page.mouse.move(4,4);await f.waitForTimeout(2000);await click('online');await click('back');await f.waitForTimeout(3500);await save('Add one / leave / Add one / Back','safe');
  } else if(route==='ready') {
   for(let i=0;i<Number(t.args.repeats||2);i++) {
    await f.evaluate(()=>O55.ui.go('c-review',{noHistory:true}));await f.waitForTimeout(4000);
    await arm(`c-review > c-ready ${i+1}`);await f.evaluate(()=>O55.ui.go('c-ready',{noHistory:true}));await f.waitForTimeout(4500);await save(`c-review > c-ready ${i+1}`,'c-ready');
   }
  } else {
   await f.locator(`${L} input`).first().fill('Book club');await f.waitForTimeout(1600);
   await arm('Name > Safe > Add one > Back > Review');await click('next');await click('online');await click('back');
   for(let i=0;i<8&&await f.evaluate(()=>O55.S.sess.screen)!=='review';i++)await click('next');
   await f.waitForTimeout(5000);await save('Name > Safe > Add one > Back > Review','review');
  }
  await t.app.resetLayout(t);
 }
}
const on=(route,looks,sizes)=>(t)=>!t.args.route||t.args.route===route?run(t,route,looks,sizes):t.check('not selected by --set route',true);
export const tests={
 'Arrival event witness guards':async(t)=>{
  const arrival={kind:'settle',at:1,ax:420,len:144.7,target:{ax:420,len:142.4}};
  const frame=(a,target=142.4)=>({screen:'safe',bub:{box:[0,0,20,20]},props:[{id:'vault',kind:'vault',state:'in',settled:1,op:1,ax:420,len:144.97,target:{ax:420,len:target},arrival:a,painted:[50,50,20,20]}]});
  const natural=judgeRest([frame(arrival)]);
  await t.check('arrival witness accepts the recorded later2.57-unit spring peak',natural.rests===1&&!natural.wrong.length&&!natural.covered.length);
  await t.check('arrival witness rejects a previous destination',judgeRest([frame(arrival,122.4)]).wrong.length>0);
  await t.check('arrival witness rejects an arrival outside the original2.51-unit bound',judgeRest([frame({...arrival,len:146})]).wrong.length>0);
  await t.check('arrival witness fails closed without an observed arrival',judgeRest([frame(null)]).wrong.length>0);
 },
 'Review line changes':on('review','glass-dark','1920x1080,1390x900,860x768'),
 'Safe preview returns and sway clearance':on('rest','nier-light,nier-dark,retro-light','740x768'),
 'Same-size line on held c-ready':on('ready','basic-light','1920x1080')
};
