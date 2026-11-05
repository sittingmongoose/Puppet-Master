// FO-20: in Glass, a window or floating surface over the page's content must not let that content read through it.
// The DOM can't tell (a sheet's backing may be a baked frost on another element, a translucent token, a live blur), so this
// reads painted pixels: the surface is shot as painted, then again with the text of everything outside it made
// transparent; whatever differs inside the surface is content reading through. A second plain shot first measures the
// surface's own motion, which does not count. Sharp text that reads through changes pixels by far more than the
// threshold; a live blur under its tint mottles them by a few levels at most. The surface's own text is left out (shot
// once more with all text transparent): its glyphs re-rasterise a little differently whatever is behind them.
// Surfaces, in Glass Light and Glass Dark, each opened by a click as a person opens it:
// - every rail panel as the narrow window's overlay (1390 x 900: the rail folds over the centre), and docked (1920);
// - the title bar's menus and panels (theme, project, notifications, search), the chat popped out and one of its sheets;
// - Settings: a setup window (Source Control, Add account) and a dialog (Add a service).
// What each click opens is found, not named: every floating box on screen after it that was not before is measured.
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { decodePng, encodePng } from '../../../onboarding/opus-5.5/tools/pm7_parity_png.mjs';

const LOOKS = ['glass-dark', 'glass-light'];
const THRESHOLD = 12;       // a channel change above this is the page reading through, even dimmed; a blur's mottle stays under it
const MAX_SHARE = 0.002;    // at most 0.2 % of the surface's pixels may change that much (anti-aliased edges, a caret)

// CSS anchors encode target and foreground geometry in the same compositor PNG as
// the sampled content. A top-layer border stays visible over product painters; a rail
// of off-crop points tracks foreground left/top/bottom (and asset right) positions.
// Numeral widths may change while their line stays still. No later DOM read certifies a paint.
export const MARKER = [1,253,97];
const isMarker=(data,i)=>MARKER.every((v,k)=>Math.abs(data[i+k]-v)<=16);
export async function installCaptureWitness(f,sel,measured,{resize=false}={}) {
 return f.evaluate(([s,sourceRect,resize])=>{
  const e=document.querySelector(s), scale=devicePixelRatio,q=(1/scale)+'px';
  e.__bcStyle=e.getAttribute('style');if(resize)e.style.width='380px';
  e.__bcCapture={rect:sourceRect,setupRect:JSON.stringify(e.getBoundingClientRect().toJSON()),anchors:[]};
  e.style.setProperty('anchor-name','--bc-capture-target','important');e.setAttribute('data-bc-in','');
  const reset='position:fixed!important;inset:auto!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;pointer-events:none!important;opacity:1!important;filter:none!important;transform:none!important;box-sizing:border-box!important;';
  const layer=document.createElement('div');layer.id='bc-geometry';layer.setAttribute('popover','manual');layer.setAttribute('aria-hidden','true');layer.setAttribute('data-bc-in','');
  layer.style.cssText=reset+'inset:0!important;width:100vw!important;height:100vh!important;overflow:visible!important;contain:none!important;';
  const rounded=v=>'round(nearest,'+v+','+q+')';
  const border=document.createElement('div');border.style.cssText=reset+'left:'+rounded('anchor(--bc-capture-target left,-10000px)')+'!important;top:'+rounded('anchor(--bc-capture-target top,-10000px)')+'!important;width:'+rounded('anchor-size(--bc-capture-target width,0px)')+'!important;height:'+rounded('anchor-size(--bc-capture-target height,0px)')+'!important;border:2px solid rgb(1,253,97)!important;';layer.appendChild(border);
  const rules=document.createElement('style');rules.id='bc-geometry-rules';document.head.appendChild(rules);e.setAttribute('data-bc-target','');
  const bounds=e.getBoundingClientRect(), nodes=new Set();
  for(const n of [e,...e.querySelectorAll('*')]) {
   if(!n.style)continue;
   const ownText=[...n.childNodes].some(c=>c.nodeType===3&&c.textContent.trim());
   if(!ownText&&!n.matches('svg,img,canvas,input,textarea,select'))continue;
   // The SVG asset anchor certifies only its outer box. Internal text is
   // certified independently from foreground paint by svgInkStability below.
   let node=e.matches('figure.pmx-plate')&&n.closest('svg')?e:n;
   while(node!==e&&node.getClientRects().length>1&&getComputedStyle(node).display.startsWith('inline'))node=node.parentElement;
   const b=node.getBoundingClientRect(),c=getComputedStyle(node);
   if(!b.width||!b.height||c.visibility==='hidden'||b.bottom<=Math.max(0,bounds.top)||b.top>=Math.min(innerHeight,bounds.bottom)||b.right<=Math.max(0,bounds.left)||b.left>=Math.min(innerWidth,bounds.right))continue;
   nodes.add(node);
  }
  const points=[];let index=0;
  for(const node of nodes) {
   const b=node.getBoundingClientRect(),name=node===e?'--bc-capture-target':'--bc-own-'+index++;
   if(node!==e){let cur=node,parts=[];while(cur!==e){parts.unshift(':nth-child('+([...cur.parentElement.children].indexOf(cur)+1)+')');cur=cur.parentElement;}const selector='[data-bc-target] > '+parts.join(' > '),prior=getComputedStyle(node).anchorName;rules.sheet.insertRule(selector+'{anchor-name:'+(prior&&prior!=='none'?prior+',':'')+name+'!important}',rules.sheet.cssRules.length);}
   for(const edge of ['top','bottom',...(node.matches('svg,img,canvas,input,textarea,select')?['right']:[])]) {
    const id=points.length,gridWidth=Math.max(1,Math.round(innerWidth*scale)-6),x=3+id%gridWidth,y=Math.floor(id/gridWidth);
    if(y>=Math.ceil(2*scale))throw Error('foreground witness rail exceeds crop padding');
    const color=[254-Math.floor(id/200),id%200,253], marker=document.createElement('i');
    const xSide=edge==='right'?'right':'left',ySide=edge==='bottom'?'bottom':'top',dx=(x-Math.round(b[xSide]*scale))/scale,dy=(y-Math.round(b[ySide]*scale))/scale;
    marker.style.cssText=reset+'left:calc('+rounded('anchor('+name+' '+xSide+',-10000px)')+' + '+dx+'px)!important;top:calc('+rounded('anchor('+name+' '+ySide+',-10000px)')+' + '+dy+'px)!important;width:'+q+'!important;height:'+q+'!important;background:rgb('+color.join(',')+')!important;';
    layer.appendChild(marker);points.push({id,color,expected:{left:x,top:y,right:x,bottom:y},node:node.tagName+'.'+String(node.getAttribute('class')||''),edge});
   }
  }
  document.body.appendChild(layer);layer.showPopover();return points;
 },[sel,measured.sourceRect,resize]);
}
export async function cleanupCaptureWitness(f,sel) {
 await f.evaluate(s=>{
  document.getElementById('bc-geometry')?.remove();document.getElementById('bc-geometry-rules')?.remove();document.querySelector('[data-bc-target]')?.removeAttribute('data-bc-target');document.getElementById('bc-through')?.remove();document.getElementById('bc-own-reference')?.remove();
  document.querySelectorAll('[data-bc-in]').forEach(n=>n.removeAttribute('data-bc-in'));
  const e=document.querySelector(s);if(!e||!Object.prototype.hasOwnProperty.call(e,'__bcStyle'))return;
  for(const a of e.__bcCapture?.anchors||[]) {if(a.value)a.node.style.setProperty('anchor-name',a.value,a.priority);else a.node.style.removeProperty('anchor-name');}
  if(e.__bcStyle==null)e.removeAttribute('style');else e.setAttribute('style',e.__bcStyle);delete e.__bcStyle;delete e.__bcCapture;
 },sel);
}
export async function capturePaint(t,r,measured) {
 const paintPng=await t.page.screenshot({}),full=decodePng(paintPng),scale=measured.dpr;
 const candidates=new Uint8Array(full.width*full.height),stroke=new Uint8Array(candidates.length),points=(measured.points||[]).map(p=>({...p,count:0,bounds:null}));
 const colors=new Map(points.map((p,i)=>[(p.color[0]<<16)|(p.color[1]<<8)|p.color[2],i]));
 let left=full.width,top=full.height,right=-1,bottom=-1,count=0;
 for(let y=0,i=0,p=0;y<full.height;y++)for(let x=0;x<full.width;x++,i+=4,p++) {
  if(isMarker(full.data,i)){candidates[p]=1;left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);count++;}
  const pi=colors.get((full.data[i]<<16)|(full.data[i+1]<<8)|full.data[i+2]);
  if(pi!==undefined){const a=points[pi];a.count++;a.bounds=a.bounds?{left:Math.min(a.bounds.left,x),top:Math.min(a.bounds.top,y),right:Math.max(a.bounds.right,x),bottom:Math.max(a.bounds.bottom,y)}:{left:x,top:y,right:x,bottom:y};stroke[p]=1;}
 }
 // Only the border band is instrumentation, even when real green content touches it.
 const queue=new Uint32Array(candidates.length);let head=0,tail=0;
 const band=Math.ceil(2*scale);
 const add=p=>{const x=p%full.width,y=Math.floor(p/full.width);if(x>=left+band&&x<=right-band&&y>=top+band&&y<=bottom-band)return;if(candidates[p]&&!stroke[p]){stroke[p]=1;queue[tail++]=p;}};
 if(count){for(let x=left;x<=right;x++){add(top*full.width+x);add(bottom*full.width+x);}for(let y=top;y<=bottom;y++){add(y*full.width+left);add(y*full.width+right);}}
 while(head<tail){const p=queue[head++],x=p%full.width,y=Math.floor(p/full.width);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy;if(xx>=0&&xx<full.width&&yy>=0&&yy<full.height)add(yy*full.width+xx);}}
 const b=JSON.parse(measured.sourceRect),expected={left:Math.round(b.left*scale),top:Math.round(b.top*scale),right:Math.round(b.left*scale)+Math.round(b.width*scale)-1,bottom:Math.round(b.top*scale)+Math.round(b.height*scale)-1};
 const bounds=count?{left,top,right,bottom}:null,valid=!!bounds&&Object.keys(expected).every(k=>bounds[k]===expected[k])&&tail>=(b.width+b.height)*scale/2;
 const width=Math.round(r.width*scale),height=Math.round(r.height*scale),data=Buffer.alloc(width*height*4),outline=new Uint8Array(width*height),x0=Math.round(r.x*scale),y0=Math.round(r.y*scale),inFrame=x0>=0&&y0>=0&&x0+width<=full.width&&y0+height<=full.height;
 if(inFrame)for(let y=0;y<height;y++){full.data.copy(data,y*width*4,((y0+y)*full.width+x0)*4,((y0+y)*full.width+x0+width)*4);outline.set(stroke.subarray((y0+y)*full.width+x0,(y0+y)*full.width+x0+width),y*width);}
 const own=points.map(p=>({...p,valid:p.count===1&&Object.keys(p.expected).every(k=>p.bounds?.[k]===p.expected[k])})),im={width,height,data};
 return {...im,outlineMask:grow(outline,width,height,2),png:encodePng(im),paintPng,capture:{bounds,expected,markerPixels:tail,valid:valid&&inFrame,own,ownValid:own.every(p=>p.valid)}};
}
export function ownInkStability(images){return {stable:Object.values(images).every(im=>im.capture.ownValid),failed:Object.entries(images).flatMap(([name,im])=>im.capture.own.filter(p=>!p.valid).map(p=>({name,...p}))) };}
// SVG descendants do not reliably expose CSS anchor boxes. Their initial row bounds
// only select paint regions; they never certify a position. Compare the signed own-ink
// signals (original minus own-hidden, outside-hidden minus all-hidden) BEFORE glyph
// growth. Zero displacement must be the unique best alignment in each row. A missing,
// changed or ambiguous silhouette is refused, rather than masked as backing evidence.
export function svgInkStability(a, reference, b, c, rows, rect, scale) {
 const results=rows.map(row=>{
  const x0=Math.max(2,Math.floor((row.left-rect.x)*scale)-2),x1=Math.min(a.width-2,Math.ceil((row.right-rect.x)*scale)+2);
  const y0=Math.max(2,Math.floor((row.top-rect.y)*scale)-2),y1=Math.min(a.height-2,Math.ceil((row.bottom-rect.y)*scale)+2);
  const scores=[];
  for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++) {
   let dot=0,aa=0,bb=0;
   for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++) {
    const i=(y*a.width+x)*4,j=((y+dy)*b.width+x+dx)*4;
    for(let k=0;k<3;k++) {const u=a.data[i+k]-reference.data[i+k],v=b.data[j+k]-c.data[j+k];dot+=u*v;aa+=u*u;bb+=v*v;}
   }
   scores.push({dx,dy,score:aa&&bb?dot/Math.sqrt(aa*bb):0,energy:aa});
  }
  const zero=scores.find(s=>!s.dx&&!s.dy),best=scores.reduce((a,b)=>a.score>b.score?a:b);
  return {row,zero:zero.score,best,stable:zero.energy>0&&zero.score>=.95&&scores.every(s=>(!s.dx&&!s.dy)||s.score<zero.score)};
 });
 return {stable:results.every(r=>r.stable),rows:results};
}
function changed(a, b, mask) {
	let n = 0, mx = 0;
	for (let i = 0, p = 0; i < a.data.length; i += 4, p++) {
		if (mask && mask[p]) continue;
		const d = Math.max(Math.abs(a.data[i] - b.data[i]), Math.abs(a.data[i + 1] - b.data[i + 1]), Math.abs(a.data[i + 2] - b.data[i + 2]));
		if (d > mx) mx = d;
		if (d > THRESHOLD) n++;
	}
	return { n, mx, share: n / (a.data.length / 4) };
}
function grow(m, w, h, k) { const o = new Uint8Array(m.length); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { if (!m[y * w + x]) continue; for (let dy = -k; dy <= k; dy++) for (let dx = -k; dx <= k; dx++) { const yy = y + dy, xx = x + dx; if (yy >= 0 && yy < h && xx >= 0 && xx < w) o[yy * w + xx] = 1; } } return o; }
function motionMask(a, b) { const m = new Uint8Array(a.data.length / 4); for (let i = 0, p = 0; i < a.data.length; i += 4, p++) if (Math.max(Math.abs(a.data[i] - b.data[i]), Math.abs(a.data[i + 1] - b.data[i + 1]), Math.abs(a.data[i + 2] - b.data[i + 2])) > THRESHOLD / 2) m[p] = 1; return m; }

// how much of the page's content reads through the surface sel (null when it isn't on screen)
export async function readThrough(t, f, sel, { loseOwnInk = false, resizeAfterMeasure = false, moveDuringCaptures = false, moveOnePixel = false, moveOwnRow = false, inputDir = null } = {}) {
	const measured = await f.evaluate((s) => {
		const e = document.querySelector(s); if (!e) return null;
		const b=e.getBoundingClientRect(),scale=devicePixelRatio,pad=Math.ceil(2*scale),left=Math.max(0,Math.round(b.left*scale)),top=Math.max(0,Math.round(b.top*scale)),right=Math.min(Math.round(innerWidth*scale),Math.round(b.left*scale)+Math.round(b.width*scale)),bottom=Math.min(Math.round(innerHeight*scale),Math.round(b.top*scale)+Math.round(b.height*scale));
		return right-left>=40*scale&&bottom-top>=40*scale&&getComputedStyle(e).visibility!=='hidden'?{rect:{x:(left+pad)/scale,y:(top+pad)/scale,width:(right-left-2*pad)/scale,height:(bottom-top-2*pad)/scale},sourceRect:JSON.stringify(b.toJSON()),dpr:scale}:null;
	}, sel);
	if (!measured) return null;
	const r = measured.rect;
 measured.svgRows=await f.evaluate(s=>[...document.querySelector(s).querySelectorAll('svg *')].filter(n=>[...n.childNodes].some(c=>c.nodeType===3&&c.textContent.trim())).map(n=>n.getBoundingClientRect().toJSON()).filter(b=>b.width&&b.height),sel);
	// Capture an independent own-text reference BEFORE removing any outside text.
	// Mark the subtree by ancestry too: nodes rendered during capture must not lose ink.
	const hideOwn = '[data-bc-in], [data-bc-in] * { color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important; transition: none !important; caret-color: transparent !important; }';
	measured.points=await installCaptureWitness(f,sel,measured,{resize:resizeAfterMeasure});
	try {
		await f.waitForTimeout(400);
		if (moveDuringCaptures||moveOnePixel) { await f.evaluate(([s,one]) => { const e=document.querySelector(s);e.__bcCapture.beforeMove=e.style.left;e.style.left=one?(parseFloat(getComputedStyle(e).left)+1/devicePixelRatio)+'px':'140px'; },[sel,moveOnePixel]);await f.waitForTimeout(250); }
		const a1 = await capturePaint(t, r, measured); await f.waitForTimeout(300); const a2 = await capturePaint(t, r, measured);
		if (t.args.only === 'agents') await t.mark('backing original captured');
		const mask = motionMask(a1, a2);
		let movedRow = null;
		if (moveOwnRow) {
			movedRow = await f.evaluate(s=>{const e=document.querySelector(s).querySelector('[data-bc-own-row]');const b=e.getBoundingClientRect();e.__bcRowStyle=e.getAttribute('style');e.style.transform='translateY(-15px)';return b.toJSON();},sel);
			await f.waitForTimeout(250); // Fault injection only; verify the actual glyph translation below.
		}
		await f.evaluate((css) => { const st = document.createElement('style'); st.id = 'bc-own-reference'; st.textContent = css; document.head.appendChild(st); }, hideOwn);
		await f.waitForTimeout(350);
		const reference = await capturePaint(t, r, measured);
		if (t.args.only === 'agents') await t.mark('backing reference captured');
		await f.evaluate(() => document.getElementById('bc-own-reference').remove());
		await f.waitForTimeout(350);
		const expectedOwn = motionMask(a2, reference);
		await f.evaluate((s) => {
			// the surface and all it holds are marked one by one: the text of everything else goes transparent
			// the properties set below are inherited: the surface keeps its own, so what it holds keeps theirs
			const e = document.querySelector(s), c = getComputedStyle(e);
			e.style.setProperty('color', c.color, 'important'); e.style.setProperty('-webkit-text-fill-color', c.webkitTextFillColor, 'important');
			e.style.setProperty('text-shadow', c.textShadow, 'important'); e.style.setProperty('caret-color', c.caretColor, 'important');
			[e, ...e.querySelectorAll('*')].forEach((n) => n.setAttribute('data-bc-in', ''));
			const st = document.createElement('style'); st.id = 'bc-through';
			st.textContent = 'body *:not([data-bc-in], [data-bc-in] *) { color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important; transition: none !important; caret-color: transparent !important; }';
			document.head.appendChild(st);
		}, sel);
		await f.waitForTimeout(350);
		if (loseOwnInk) await f.evaluate(([s, css]) => { const e = document.querySelector(s); ['color', '-webkit-text-fill-color', 'text-shadow'].forEach((k) => e.style.removeProperty(k)); document.getElementById('bc-through').textContent += css; }, [sel, hideOwn]);
		if (loseOwnInk) await f.waitForTimeout(250); // Fault injection only; the test also verifies its painted result.
		const b = await capturePaint(t, r, measured);
		if (t.args.only === 'agents') await t.mark('backing outside captured');
		// the surface's own text: where it is drawn, its re-rasterised glyphs differ a little whatever is behind; those pixels
		// (grown by 2 px) are not counted
		await f.evaluate((s) => { const e = document.querySelector(s); ['color', '-webkit-text-fill-color', 'text-shadow'].forEach((k) => e.style.removeProperty(k)); document.getElementById('bc-through').textContent += ' [data-bc-in], [data-bc-in] * { color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important; transition: none !important; }'; }, sel);
		await f.waitForTimeout(350);
		const c = await capturePaint(t, r, measured);
		if (t.args.only === 'agents') await t.mark('backing all ink captured');
		if (inputDir) {
			await mkdir(inputDir, { recursive: true });
			for (const [name, im] of Object.entries({ a1, a2, reference, b, c })) { await writeFile(path.join(inputDir, `${name}.png`), im.png); await writeFile(path.join(inputDir, `${name}-paint.png`), im.paintPng); }
		}
		// The witness and its antialias fringe are instrumentation, never backing evidence.
		for (const im of [a1,a2,reference,b,c]) for(let i=0;i<mask.length;i++) if(im.outlineMask[i]) mask[i]=1;
		const own = grow(motionMask(b, c), b.width, b.height, 2);
		let expected = 0, covered = 0;
		for (let i = 0; i < own.length; i++) if (expectedOwn[i] && !mask[i]) { expected++; if (own[i]) covered++; }
		if (moveDuringCaptures||moveOnePixel) { await f.evaluate(s => { const e=document.querySelector(s);e.style.left=e.__bcCapture.beforeMove; },sel);await f.waitForTimeout(250); }
		const stable = await f.evaluate((s) => {
			const e = document.querySelector(s), old = e?.__bcCapture;
			return { sourceRect: old?.rect, setupRect: old?.setupRect, endRect: e ? JSON.stringify(e.getBoundingClientRect().toJSON()) : null };
		}, sel);
		// No fixed percentage of a panel is assumed to be text. Its own reference is the contract.
		const captures = Object.entries({a1,a2,reference,b,c}).map(([name,im])=>({name,...im.capture}));
		let retainedInk = 0; const residual = motionMask(b, reference);
		for(let i=0;i<expectedOwn.length;i++) if(expectedOwn[i]&&!mask[i]&&residual[i]) retainedInk++;
		let rowInk=0,rowMatched=0;
		if(movedRow) {
			const scale=measured.dpr, dy=Math.round(15*scale), x0=Math.ceil((movedRow.left-r.x)*scale), x1=Math.floor((movedRow.right-r.x)*scale), y0=Math.ceil((movedRow.top-r.y)*scale), y1=Math.floor((movedRow.bottom-r.y)*scale);
			for(let y=Math.max(dy,y0);y<Math.min(a2.height,y1);y++) for(let x=Math.max(0,x0);x<Math.min(a2.width,x1);x++) {
				const i=(y*a2.width+x)*4,j=((y-dy)*b.width+x)*4;
				if(Math.max(a2.data[i],a2.data[i+1],a2.data[i+2])<100) {rowInk++;if([0,1,2].every(k=>Math.abs(a2.data[i+k]-b.data[j+k])<=6))rowMatched++;}
			}
		}
		const faults = { ownInkLoss: loseOwnInk ? expected>0 && retainedInk/expected<.05 : null, ownRowMove: moveOwnRow ? rowInk>50&&rowMatched/rowInk>.995 : null };
		const ownStability=ownInkStability({a1,a2,reference,b,c});
  ownStability.svg=svgInkStability(a2,reference,b,c,measured.svgRows,r,measured.dpr);
  ownStability.svgFirst=svgInkStability(a1,reference,b,c,measured.svgRows,r,measured.dpr);
  ownStability.stable=ownStability.stable&&ownStability.svg.stable&&ownStability.svgFirst.stable;
		const snap=value=>{if(!value)return null;const b=JSON.parse(value);return JSON.stringify([b.x,b.y,b.width,b.height].map(v=>Math.round(v*measured.dpr)));};
		const geometryStable = snap(stable.sourceRect) === snap(stable.setupRect) && snap(stable.sourceRect) === snap(stable.endRect) && captures.every(c=>c.valid);
		if (!geometryStable || !ownStability.stable || (expected > 0 && covered / expected < 0.95)) return { invalid: true, reason: `geometry stable=${geometryStable}; own ink stable=${ownStability.stable}; own glyph exclusion ${covered}/${expected}`, rect: r, geometry: stable, captures, ownStability, faults };
		// Exclude both captures' glyphs, including the few edge pixels that re-rasterised.
		const referenceOwn = grow(expectedOwn, a2.width, a2.height, 2);
		for (let i = 0; i < own.length; i++) if (own[i] || referenceOwn[i]) mask[i] = 1;
	
		const counted = mask.reduce((s, v) => s + (v ? 0 : 1), 0);
		if (counted < mask.length * 0.1) return { invalid: true, reason: `only ${counted}/${mask.length} unmasked pixels` };
		const m = changed(a2, b, mask);
		return { rect: r, geometry: stable, captures, ownStability, faults, ownExpected: expected, ownCovered: covered, n: m.n, mx: m.mx, share: m.n / Math.max(1, counted), motion: 1 - counted / mask.length };
	} finally {
	if(moveOwnRow) await f.evaluate(s=>{const e=document.querySelector(s)?.querySelector('[data-bc-own-row]');if(e&&Object.prototype.hasOwnProperty.call(e,'__bcRowStyle')) {if(e.__bcRowStyle==null)e.removeAttribute('style');else e.setAttribute('style',e.__bcRowStyle);delete e.__bcRowStyle;}},sel);
	await cleanupCaptureWitness(f,sel);
	}
}

// Invalid captures are retaken; an accepted over-limit paint is returned immediately.
export async function measureWithRetries(t,f,sel,{inputDir=null,maxTries=5,readOptions={}}={}) {
 const attempts=[],invalidByReason={geometry:0,ownGeometry:0,ownExclusion:0,notVisible:0};let last=null;
 for(let number=1;number<=maxTries;number++) {
  const dir=inputDir?path.join(inputDir,'attempt-'+String(number).padStart(2,'0')):null;
  last=await readThrough(t,f,sel,{...readOptions,inputDir:dir});
  if(dir){await mkdir(dir,{recursive:true});await writeFile(path.join(dir,'sample.json'),JSON.stringify(last,null,2));}
  const valid=!!last&&!last.invalid;attempts.push({number,valid,reason:last?.reason||(!last?'not visible':undefined),share:valid?last.share:undefined});
  if(!valid){if(!last)invalidByReason.notVisible++;else {if(last.reason.includes('geometry stable=false'))invalidByReason.geometry++;if(last.ownStability?.stable===false)invalidByReason.ownGeometry++;if(last.reason.includes('own glyph exclusion')&&last.ownStability?.stable!==false&&!last.reason.includes('geometry stable=false'))invalidByReason.ownExclusion++;}}
  if(valid)return {...last,tries:number,attempts,invalidByReason};
  if(number<maxTries)await f.waitForTimeout(250);
 }
 return {invalid:true,reason:'no valid sample after '+maxTries+' tries; last: '+(last?.reason||'not visible'),tries:maxTries,attempts,invalidByReason};
}

export default async function (t) {
	// --set lgtier=cpu: Glass's low-power tier (no live blur; the floating tint is heavier there)
	const tierQuery = t.args.lgtier ? `lgtier=${t.args.lgtier}` : '';
	if (t.args.only === 'agents') await t.viewport(1390, 900);
	let f = await t.app.open({ query: tierQuery });
	const rows = [], bad = [];
	if (t.args.only === 'agents') {
		for (const look of String(t.args.looks || 'glass-light,glass-dark').split(',')) for (let rep = 0; rep < +(t.args.reps || 6); rep++) {
			await t.viewport(1390, 900); await t.app.look(look);
			await f.evaluate(() => { document.getElementById('tab-dashboard').click(); document.querySelector('#activityBar .icon[data-target="panel-agents"]').click(); });
			await f.waitForTimeout(1200); await t.viewport(1920, 1080); await f.waitForTimeout(1200);
			await t.check(`agents ${look} resize ${rep}: target painted`, await f.evaluate(() => { const e = document.getElementById('panel-agents'), b = e.getBoundingClientRect(); return b.width > 40 && b.height > 40 && getComputedStyle(e).visibility !== 'hidden'; }));
			const inputDir = t.args.inputs ? path.join(String(t.args.inputs), `${look}-${String(rep).padStart(3, '0')}`) : null;
			const m = await measureWithRetries(t, f, '#sidePanelSlot', { inputDir }); t.log(JSON.stringify({look,rep,invalid:m?.invalid,reason:m?.reason,tries:m?.tries,share:m?.share,n:m?.n,attempts:m?.attempts}));
			if (inputDir) await writeFile(path.join(inputDir, 'sample.json'), JSON.stringify({ look, rep, ...m }, null, 2));
			await t.check(`agents ${look} resize ${rep}: valid sample`, !!m && !m.invalid, m?.reason);
			if (m && !m.invalid) await t.check(`agents ${look} resize ${rep}: backing`, m.share <= MAX_SHARE, JSON.stringify(m));
		}
		return;
	}
	const sample = async (look, name, sel) => {
		const inputDir=t.args.inputs ? path.join(String(t.args.inputs),`${look}-${String(rows.length).padStart(3,'0')}-${name.replace(/[^a-z0-9-]+/gi,'_')}`) : null;
		const m=await measureWithRetries(t,f,sel,{inputDir});
		if(inputDir&&m) await writeFile(path.join(inputDir,'sample.json'),JSON.stringify({look,name,...m},null,2));
		return m;
	};
	const judge = (look, name, m) => {
		if (!m) { bad.push(`${look} ${name}: not on screen`); rows.push(`${look} ${name}: not on screen`); return; }
		if (m.invalid) { bad.push(`${look} ${name}: invalid sample (${m.reason})`); rows.push(bad.at(-1)); return; }
		const pct = (m.share * 100).toFixed(2);
		rows.push(`${look} ${name}: ${pct}% of its pixels show the page through it (max change ${m.mx}; its own text and motion left out: ${(m.motion * 100).toFixed(1)}%; tries ${m.tries}) ${m.rect.width}x${m.rect.height}`);
		if (m.share > MAX_SHARE) bad.push(`${look} ${name}: ${pct}% reads through`);
	};
	const click = async (sel) => {
		const p = await f.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; e.scrollIntoView({ block: 'center' }); const b = e.getBoundingClientRect(); return b.width ? { x: b.left + b.width / 2, y: b.top + b.height / 2 } : null; }, sel);
		if (!p) return false;
		await t.page.mouse.click(p.x, p.y); await f.waitForTimeout(900); await t.page.mouse.move(2, 2); return true;
	};
	const escape = async () => { await t.page.keyboard.press('Escape'); await f.waitForTimeout(600); };
	// what a click opens, found rather than named: every floating box (fixed or absolute, at least 120 x 40) on screen
	// after it that was not before; each is measured (a surface nobody named is caught too)
	const floating = () => f.evaluate(() => {
		const out = [];
		for (const e of document.querySelectorAll('body *')) {
			const c = getComputedStyle(e); if (c.position !== 'fixed' && c.position !== 'absolute') continue;
			const b = e.getBoundingClientRect(); if (b.width < 120 || b.height < 40 || b.right <= 0 || b.bottom <= 0 || b.left >= innerWidth || b.top >= innerHeight) continue;
			// a surface takes the pointer; a layer that doesn't (a chart's drawing, a glow) is content, not a surface
			if (c.visibility === 'hidden' || +c.opacity < 0.5 || c.pointerEvents === 'none' || e.closest('[aria-hidden="true"], [inert], .lg-lenses-local, #lg-lenses, #lg-optics')) continue;
			if (!e.__bcId) e.__bcId = 'f' + Math.random().toString(36).slice(2, 8);
			e.setAttribute('data-bc-float', e.__bcId); out.push(e.__bcId);
		}
		return out;
	});
	const opened = async (look, name, open) => {
		const before = new Set(await floating());
		if ((await open()) === false) { bad.push(`${look} ${name}: could not open`); return; }
		await f.waitForTimeout(900); await t.page.mouse.move(2, 2);
		const now = (await floating()).filter((id) => !before.has(id));
		// the outermost new ones only (a sheet's own inner boxes are part of it)
		// a box over most of the window is a backdrop that dims the page on purpose: the surfaces are the painted boxes in it
		const top = await f.evaluate((ids) => {
			const el = (id) => document.querySelector(`[data-bc-float="${id}"]`);
			const outer = ids.filter((id) => { const e = el(id); return e && !ids.some((o) => o !== id && el(o) && el(o).contains(e)); });
			const painted = (e) => { const c = getComputedStyle(e), m = /rgba?\(([^)]+)\)/.exec(c.backgroundColor), a = m ? (m[1].split(/[ ,/]+/).filter(Boolean)[3] ?? 1) : 1; return +a > 0.02 || c.backgroundImage !== 'none' || (c.backdropFilter && c.backdropFilter !== 'none'); };
			const big = (e) => { const b = e.getBoundingClientRect(); return b.width >= 120 && b.height >= 40; };
			const label = (e) => (e.id ? '#' + e.id : e.tagName.toLowerCase()) + '.' + String(e.className).split(' ').filter(Boolean).slice(0, 2).join('.');
			const out = [];
			for (const id of outer) {
				const e = el(id), b = e.getBoundingClientRect();
				if (b.width * b.height < 0.7 * innerWidth * innerHeight) { out.push({ id, label: label(e) }); continue; }
				const found = [];
				(function walk(n) { for (const k of n.children) { if (big(k) && painted(k) && getComputedStyle(k).visibility !== 'hidden') found.push(k); else walk(k); } })(e);
				found.forEach((k) => { if (!k.__bcId) k.__bcId = 'f' + Math.random().toString(36).slice(2, 8); k.setAttribute('data-bc-float', k.__bcId); out.push({ id: k.__bcId, label: label(k) + ' in a backdrop' }); });
			}
			return out;
		}, now);
		if (!top.length) { bad.push(`${look} ${name}: nothing new on screen`); rows.push(`${look} ${name}: nothing new on screen`); return; }
		for (const x of top) judge(look, `${name} (${x.label})`, await sample(look, `${name} (${x.label})`, `[data-bc-float="${x.id}"]`));
	};
	const looks = t.args.looks ? String(t.args.looks).split(',') : LOOKS;   // --set looks=glass-dark: one look per run
	for (const look of looks) {
		if (look !== looks[0]) f = await t.app.open({ query: tierQuery });
		// the rail's panels: as the overlay of a narrow window, then docked
		for (const [w, h, mode] of [[1390, 900, 'overlay'], [1920, 1080, 'docked']]) {
			await t.viewport(w, h);
			await f.evaluate(() => document.getElementById('tab-dashboard').click());
			await t.app.look(look);
			await f.waitForTimeout(1200);
			const targets = await f.evaluate(() => [...document.querySelectorAll('#activityBar .icon[data-target]')].filter((e) => e.getBoundingClientRect().width > 0).map((e) => e.getAttribute('data-target')));
			for (const target of targets) {
				await click(`#activityBar .icon[data-target="${target}"]`);
				await f.waitForTimeout(800);
				const fold = await f.evaluate(() => document.getElementById('sidePanelSlot').getAttribute('data-pm-rail-fold') || 'docked');
				if ((mode === 'overlay') !== (fold === 'overlay')) { rows.push(`${look} rail ${target} (${mode}): the rail is ${fold}`); if (mode === 'overlay') bad.push(`${look} rail ${target}: no overlay at ${w}x${h} (${fold})`); continue; }
				judge(look, `rail ${target.replace('panel-', '')} (${mode})`, await sample(look, `rail ${target.replace('panel-', '')} (${mode})`, '#sidePanelSlot'));
			}
		}
		await t.viewport(1390, 900);
		// the title bar's menus and panels
		for (const [name, btn] of [['theme menu', '#themeSelect'], ['project menu', '#projectMenuBtn'], ['notifications', '#notifySlot button, #notifySlot [role="button"]']]) {
			await opened(look, name, () => click(btn));
			await escape();
		}
		// the search pop exists while the title bar folds its search into a button (the button, or its own open)
		await opened(look, 'search', async () => { if (!(await click('#tbSearchBtn'))) return f.evaluate(() => { if (!window.PM_TB_SEARCH) return false; PM_TB_SEARCH.open(); }); });
		await escape();
		// the chat: popped out over the page, and one of its sheets
		await opened(look, 'chat popped out', () => f.evaluate(() => { if (!window.PMW || !PMW.chatCol || !PMW.chatCol.popOut) return false; PMW.chatCol.popOut(); }));
		await f.evaluate(() => { try { const ma = document.querySelector('.main-area'); if (ma) ma.removeAttribute('data-pmw-chat-float'); if (window.PMW && PMW.chatCol && PMW.chatCol.dockBack) PMW.chatCol.dockBack(); } catch (e) { /* docked by the next load */ } });
		await opened(look, 'chat sheet', () => f.evaluate(() => { if (!window.PM56_EXT) return false; const b = document.createElement('button'); b.dataset.kind = 'crew'; b.dataset.auto = '0'; PM56_EXT.run('collab-open-configure', b, new Event('click')); const c = PM56_EXT.ctx(); if (c.renderOverlays) c.renderOverlays(); }));
		await escape();
		// Settings: a setup window and a dialog, over Source Control's page
		await f.evaluate(() => document.getElementById('tab-settings').click());
		await f.waitForTimeout(2200);
		await f.evaluate(() => document.querySelector('#pm-settings-root .domain-link[data-domain="source"]').click());
		await f.waitForTimeout(1800);
		await t.app.look(look);   // Settings puts back the saved look; this one is not saved
		await f.waitForTimeout(1200);
		await opened(look, 'setup window', () => click('[data-action="pm51-source-connect"]'));
		await escape();
		await opened(look, 'Settings dialog', () => click('[data-action="pm51-source-add-service"]'));
		await escape();
		await f.evaluate(() => document.getElementById('tab-dashboard').click());
		await f.waitForTimeout(1200);
	}
	await t.viewport(1920, 1080);
	rows.forEach((r) => t.log(r));
	await t.check(`Glass backing samples are complete and accepted readings are within limit (${rows.length} surfaces, ${looks.join(', ')}${tierQuery ? ', ' + tierQuery : ''})`, bad.length === 0, bad.slice(0, 12).join('; ') + (bad.length > 12 ? ` (+${bad.length - 12} more)` : ''));
}
