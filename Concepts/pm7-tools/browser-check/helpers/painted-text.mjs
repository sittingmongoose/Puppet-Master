import {decodePng} from '../../../onboarding/opus-5.5/tools/pm7_parity_png.mjs';
const luminance=c=>c.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
const contrast=(a,b)=>(Math.max(luminance(a),luminance(b))+.05)/(Math.min(luminance(a),luminance(b))+.05);
// Four actual paints: original ink, bare ground, and black/white masks. Preserve opacity
// so an invisible body cannot acquire a synthetic opaque mask and falsely pass.
export async function paintedText(el,{coverage=250}={}){
 const meta=await el.evaluate(e=>{const r=document.createRange();r.selectNodeContents(e);const b=r.getBoundingClientRect(),a=e.getBoundingClientRect();return{x:b.x-a.x,y:b.y-a.y,w:b.width,h:b.height};});
 const styles=await el.evaluate(e=>[e,...e.querySelectorAll('*')].map(n=>n.getAttribute('style')));
 const fill=async color=>el.evaluate((e,color)=>[e,...e.querySelectorAll('*')].forEach(n=>{n.style.setProperty('-webkit-text-fill-color',color,'important');n.style.setProperty('text-shadow','none','important');}),color);
 let ink,ground,black,white;
 try{
  ink=decodePng(await el.screenshot());
  await fill('transparent');ground=decodePng(await el.screenshot());
  await fill('#000');black=decodePng(await el.screenshot());
  await fill('#fff');white=decodePng(await el.screenshot());
 }finally{await el.evaluate((e,ss)=>[e,...e.querySelectorAll('*')].forEach((n,i)=>ss[i]===null?n.removeAttribute('style'):n.setAttribute('style',ss[i])),styles);}
 if([ground,black,white].some(p=>p.width!==ink.width||p.height!==ink.height)) throw new Error('Text geometry changed between painted samples');
 const stems=[];
 for(let y=Math.max(0,Math.ceil(meta.y));y<Math.min(ink.height,Math.floor(meta.y+meta.h));y++)for(let x=Math.max(0,Math.ceil(meta.x));x<Math.min(ink.width,Math.floor(meta.x+meta.w));x++){
  const i=(y*ink.width+x)*4;
  if(![0,1,2].every(j=>white.data[i+j]-black.data[i+j]>=coverage))continue;
  const a=[...ink.data.slice(i,i+3)],b=[...ground.data.slice(i,i+3)];
  stems.push({contrast:contrast(a,b),ink:a,ground:b,x,y});
 }
 return {count:stems.length,paintedCount:stems.filter(s=>s.contrast>=1.5).length,minimum:Math.min(...stems.map(s=>s.contrast)),brightest:[...stems].sort((a,b)=>luminance(b.ground)-luminance(a.ground))[0]};
}
