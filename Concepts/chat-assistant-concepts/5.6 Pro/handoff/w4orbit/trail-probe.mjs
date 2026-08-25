import { chromium } from 'playwright';
import path from 'path';
const file = process.argv[2] || path.resolve(process.cwd(), 'index.html');
const b = await chromium.launch();
const p = await b.newPage({ viewport:{width:1440,height:900}, deviceScaleFactor:1 });
await p.goto('file://'+file);
await p.waitForFunction(()=>window.PM56_DEMO);
const out = {};
for (const take of [0,1,3,8]) {
  await p.evaluate(t=>{ window.PM56_DEMO.setVariant(2,t); window.PM56_DEMO.setWorkStep(6); }, take);
  await p.waitForTimeout(700);
  out['take'+take] = await p.evaluate(()=>{
    const sel = document.querySelector('.wa-disc.current') || document.querySelector('.rail8-item.current');
    const track = document.querySelector('.wa-track') || document.querySelector('.rail8-track');
    if(!sel||!track) return {missing:true, hasWa:!!document.querySelector('.wa-chrome')};
    const svg = sel.querySelector('svg');
    const cs = getComputedStyle(sel), scs = getComputedStyle(svg);
    const sr = svg.getBoundingClientRect();
    const m = new DOMMatrixReadOnly(cs.transform);
    const scale = m.a;
    const vb = 24;
    const eff = (parseFloat(scs.strokeWidth) || 1.8) * (sr.width/vb);
    const discs = [...track.children].filter(c=>c.matches('.pm-rail-item'));
    const trect = track.getBoundingClientRect();
    const clipped = discs.filter(d=>{const r=d.getBoundingClientRect(); return r.left < trect.left-0.5 || r.right > trect.right+0.5;}).length;
    return {
      discCount: discs.length,
      discBox: [sel.getBoundingClientRect().width, sel.getBoundingClientRect().height],
      transform: cs.transform, scale,
      svgRendered: [sr.width, sr.height],
      strokeWidthUser: scs.strokeWidth,
      effectiveStrokePx: +eff.toFixed(3),
      transitionProperty: cs.transitionProperty,
      trackOverflow: getComputedStyle(track).overflowX + '/' + getComputedStyle(track).overflowY,
      trackScrollW: track.scrollWidth, trackClientW: track.clientWidth,
      clippedDiscs: clipped,
      enterAnim: getComputedStyle(sel).animationName
    };
  });
}
// narrow test: shrink assistant pane by making the editor huge
out.narrow = await p.evaluate(async ()=>{
  const st = window.PM56_DEMO.getState();
  return {editorWidth: st.editorWidth};
});
console.log(JSON.stringify(out,null,1));
await b.close();
