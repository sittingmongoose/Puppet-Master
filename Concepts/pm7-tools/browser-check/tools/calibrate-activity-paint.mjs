// Replay the exact retained native frames; expected labels refer to visible
// pixels, not readability. Paths point to external evidence, never repo captures.
import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {decodePng,coverTitleClassifier} from '../helpers/activity-cover-pixels.mjs';
const [root,out]=process.argv.slice(2);
if(!root||!out)throw Error('Usage: node calibrate-activity-paint.mjs <window2 evidence dir> <external output.json>');
const rows=[];
for(const name of ['control-normal','fix-normal','control-sandbox','fix-sandbox'])for(let rep=0;rep<5;rep++){
 const dir=join(root,name+'-frames',String(rep));
 const frames=readdirSync(dir).filter(s=>s.endsWith('.png')).sort().map(file=>({file,image:decodePng(readFileSync(join(dir,file)))}));
 const model=coverTitleClassifier(frames[0].image,frames.at(-1).image,{x:1,y:0});
 const scores=frames.map((frame,i)=>({file:frame.file,nominalMs:i*1000/60,score:model.score(frame.image)}));
 // control-normal rep2's faint title ink at frame031 was missed by the
 // initial coarse visual label. Keep that boundary correction explicit.
 const expected=name.startsWith('fix')||name==='control-normal'&&rep>=2||name==='control-sandbox'&&rep===4;
 const at500=scores[30].score>=.2;
 rows.push({case:name+'-'+rep,referencePixels:model.pixels,expectedAtNominal500:expected,atNominal500:at500,
  agrees:expected===at500,first:scores.find(s=>s.score>=.2),scores,
  correction:name==='control-normal'&&rep===2?'Faint cover glyphs present in frame031 at the nominal500ms boundary; original readability label was too coarse.':undefined});
}
writeFileSync(out,JSON.stringify({clock:'Native film samples, 60fps; nominal offsets retain the film calibration uncertainty',rows},null,2)+'\n');
console.log('Native-frame predicate agreement:',rows.filter(r=>r.agrees).length+'/'+rows.length);
if(rows.some(r=>!r.agrees))process.exitCode=1;
