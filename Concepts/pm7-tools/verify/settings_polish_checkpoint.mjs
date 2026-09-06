/* Focused browser checkpoint, not the final campaign or native certification.
 * node settings_polish_checkpoint.mjs <artifact> <output-dir> <module-dir> <chrome>
 */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
const [artifactArg,outArg,modulesArg,chromeArg,baselineArg] = process.argv.slice(2);
assert.ok(artifactArg&&outArg&&modulesArg&&chromeArg,'artifact, output directory, module directory, and Chrome executable required');
const artifact=resolve(artifactArg),out=resolve(outArg),require=createRequire(join(resolve(modulesArg),'noop.js'));
const {chromium}=require('playwright-core');
const sha=value=>createHash('sha256').update(value).digest('hex');
mkdirSync(out,{recursive:true});
const report={scope:'focused browser-concept checkpoint only; not final campaign, provider/native readiness, event delivery, or speaker audibility',
  artifact_sha256:sha(readFileSync(artifact)),verifier_sha256:sha(readFileSync(fileURLToPath(import.meta.url))),checks:[],errors:[],managers:[]};
const browser=await chromium.launch({executablePath:chromeArg,headless:true});
const page=await browser.newPage({viewport:{width:1920,height:960}});
page.on('pageerror',error=>report.errors.push(error.message));
page.setDefaultTimeout(20000);
await page.route('**/*',route=>/^(file:|data:|blob:)/.test(route.request().url())?route.continue():route.abort());
await page.addInitScript(()=>{
  window.__audioCheckpoint=[];
  const Base=window.AudioContext;
  window.AudioContext=class extends Base{
    constructor(...args){super(...args);window.__audioCheckpoint.push({context:this,analysers:[]});}
    createGain(){const gain=super.createGain(),connect=gain.connect.bind(gain),ctx=this;gain.connect=function(target,...args){
      if(target===ctx.destination){const analyser=ctx.createAnalyser();window.__audioCheckpoint.find(row=>row.context===ctx).analysers.push(analyser);connect(analyser);return analyser.connect(target,...args);}
      return connect(target,...args);
    };return gain;}
  };
});
async function check(name,fn){await fn();report.checks.push({name,pass:true});console.log(`PASS ${name}`);}
const root=page.locator('#pm-settings-root');
const play=id=>root.locator(`.sound-play[data-id="${id}"]`);
const idle=()=>page.waitForFunction(()=>window.__audioCheckpoint.every(row=>row.context.state==='closed'));
async function signal(){await page.waitForFunction(()=>window.__audioCheckpoint.some(row=>row.analysers.some(a=>{const b=new Float32Array(a.fftSize);a.getFloatTimeDomainData(b);return b.some(n=>Math.abs(n)>.0001);})));}
async function openSounds(){await page.evaluate(()=>window.PM12_KIMI.navigate('general','notifications'));await root.locator('[data-action="notification-tab"][data-tab="sounds"]').first().click();await play('attention').waitFor({state:'visible'});}
try{
  await page.goto(pathToFileURL(artifact).href);
  if(baselineArg)await check('onboarding and guided-tour authored output bands are unchanged',async()=>{
    const before=readFileSync(resolve(baselineArg),'utf8'),after=readFileSync(artifact,'utf8');report.protectedBands=[];
    for(const id of ['pm7-onboarding-css','pm7-onboarding-js','pm7-guided-tour-css','pm7-guided-tour-js']){
      const tag=id.endsWith('-css')?'style':'script',re=new RegExp(`<${tag} id="${id}">([\\s\\S]*?)<\\/${tag}>`);
      const left=before.match(re)?.[1],right=after.match(re)?.[1];assert.ok(left&&right,id);assert.equal(sha(right),sha(left),id);report.protectedBands.push({id,sha256:sha(right),unchanged:true});
    }
  });
  const close=page.getByRole('button',{name:'Close onboarding',exact:true});if(await close.isVisible())await close.click();
  await page.locator('#tab-settings').click();
  await check('no audio context created on load',async()=>assert.equal(await page.evaluate(()=>window.__audioCheckpoint.length),0));
  await page.evaluate(()=>window.PM12_KIMI.navigate('ai','providers'));
  await root.locator('#provider-roster').waitFor({state:'visible'});
  await check('provider detail grid contains its content',async()=>{
    const box=await root.locator('#workspace-providers .resource-detail').evaluate(e=>({width:e.clientWidth,scroll:e.scrollWidth,head:e.querySelector('.resource-head').getBoundingClientRect().width,content:e.querySelector('.resource-content').getBoundingClientRect().width}));
    report.providerGeometry=box;assert.ok(box.scroll<=box.width+1);assert.ok(box.head<=box.width+1);assert.ok(box.content<=box.width+1);
  });
  await check('one provider setup CTA and no duplicate index entry',async()=>{
    assert.equal(await root.locator('#workspace-providers [data-action="add-provider"]').count(),1);
    assert.equal(await root.locator('.page-index-card [data-workspace="providers"]').count(),1);
  });
  await check('provider details remain keyboard accessible and closed by default',async()=>{
    const detail=root.locator('.provider-overview details').first();assert.equal(await detail.getAttribute('open'),null);
    await detail.locator('summary').focus();await page.keyboard.press('Enter');assert.notEqual(await detail.getAttribute('open'),null);
    assert.ok(await detail.getByText('Installation source',{exact:true}).isVisible());await page.keyboard.press('Enter');
  });
  await page.screenshot({path:join(out,'providers-wide.png')});
  await openSounds();
  await check('missing named recording never creates audio or playing state',async()=>{
    await play('peon-ready').click();assert.equal(await page.evaluate(()=>window.__audioCheckpoint.length),0);
    assert.equal(await root.locator('.sound-row.is-playing').count(),0);
    assert.ok(await root.locator('[data-sound-row="peon-ready"]').getByText(/File unavailable/).isVisible());
  });
  await check('built-in click emits a nonzero real Web Audio signal',async()=>{
    await play('attention').click();await signal();assert.equal(await play('attention').getAttribute('aria-pressed'),'true');
    assert.equal(await root.locator('.sound-row.is-playing').count(),1);
  });
  await page.screenshot({path:join(out,'sounds-playing.png')});
  await check('second click stops and clears playing presentation',async()=>{await play('attention').click();await idle();assert.equal(await root.locator('.sound-row.is-playing').count(),0);});
  await check('another sound replaces playback without overlap',async()=>{await play('attention').click();await signal();await play('soft-warning').click();await signal();assert.equal(await page.evaluate(()=>window.__audioCheckpoint.filter(row=>row.context.state==='running').length),1);assert.equal(await play('soft-warning').getAttribute('aria-pressed'),'true');});
  await check('natural completion clears audio and waveform state',async()=>{await idle();assert.equal(await root.locator('.sound-row.is-playing').count(),0);});
  await check('tab change stops playback',async()=>{await play('attention').click();await signal();await root.locator('[data-action="notification-tab"][data-tab="events"]').first().click();await idle();});
  await openSounds();
  await check('Settings close stops playback',async()=>{await play('attention').click();await signal();await page.locator('#tab-settings').click();await idle();await page.locator('#tab-settings').click();});
  await openSounds();
  await check('user-selected file decodes and plays its actual audio',async()=>{
    // A short generated PCM fixture is passed through the real file input. It is not bundled as a product sound.
    const samples=8000,buf=Buffer.alloc(44+samples*2);buf.write('RIFF',0);buf.writeUInt32LE(buf.length-8,4);buf.write('WAVEfmt ',8);buf.writeUInt32LE(16,16);buf.writeUInt16LE(1,20);buf.writeUInt16LE(1,22);buf.writeUInt32LE(8000,24);buf.writeUInt32LE(16000,28);buf.writeUInt16LE(2,32);buf.writeUInt16LE(16,34);buf.write('data',36);buf.writeUInt32LE(samples*2,40);for(let i=0;i<samples;i++)buf.writeInt16LE(Math.round(Math.sin(i*2*Math.PI*330/8000)*8000),44+i*2);
    await root.locator('[data-action="upload-sound"]').click();
    const form=page.locator('#pm-settings-portals form').last();
    await form.locator('[name="name"]').fill('Checkpoint recording');
    await form.locator('input[type="file"]').setInputFiles({name:'checkpoint.wav',mimeType:'audio/wav',buffer:buf});
    await page.getByRole('button',{name:'Add sound',exact:true}).click();
    await page.waitForFunction(()=>!document.querySelector('#pm-settings-portals [role="dialog"]'));
    const row=root.locator('.sound-row').filter({has:page.getByText('Checkpoint recording',{exact:true})});
    await row.locator('.sound-play').click();await signal();assert.ok(await row.getByText(/Local file · session only/).isVisible());await idle();
    assert.equal(await page.evaluate(()=>window.PM12_KIMI.getState().notifications.sounds.filter(s=>s.name==='Checkpoint recording').length),1);
  });
  await check('project reload releases selected files',async()=>{await page.evaluate(()=>window.PM12_KIMI.reloadProject());await openSounds();const row=root.locator('.sound-row').filter({has:page.getByText('Checkpoint recording',{exact:true})});if(await row.count())assert.ok(await row.getByText(/File unavailable/).isVisible());});
  report.managers=await page.evaluate(()=>window.PM12_DATA.domains.flatMap(d=>d.workspaces.filter(w=>w.type!=='settings').map(w=>({domain:d.id,id:w.id,label:w.label}))));
  await check('all current top-level manager destinations mount with concise descriptions',async()=>{
    for(const manager of report.managers){await page.evaluate(m=>window.PM12_KIMI.navigate(m.domain,m.id),manager);const workspace=root.locator(`[data-workspace-block="${manager.id}"]`);await workspace.locator('[data-workspace-mounted="true"]').waitFor({state:'attached'});manager.description=await workspace.locator('.workspace-separator p').textContent();assert.ok(manager.description.length<100,manager.id);assert.equal(await root.locator(`.page-index-card [data-workspace="${manager.id}"]`).count(),1,manager.id);}
  });
  const originalPanelStyle=await page.locator('#panel-settings').getAttribute('style');
  await check('Provider and sound managers fit 320, 720, 960, and 1180 px hosts',async()=>{
    // Isolate the existing Settings host for exact allocated-width boundaries.
    await page.evaluate(()=>Object.assign(document.getElementById('panel-settings').style,{position:'fixed',inset:'0',width:'auto',height:'auto',zIndex:'2147483000',display:'block'}));
    report.responsive=[];
    for(const width of [320,720,960,1180]){
      await page.setViewportSize({width,height:960});
      await page.waitForFunction(w=>document.getElementById('panel-settings').clientWidth===w,width);
      for(const manager of ['providers','sounds']){
        if(manager==='sounds')await openSounds();else await page.evaluate(()=>window.PM12_KIMI.navigate('ai','providers'));
        const selector=manager==='sounds'?'.sound-layout':'.resource-detail';
        const geometry=await root.locator(selector).first().evaluate(e=>({width:e.clientWidth,scroll:e.scrollWidth}));
        report.responsive.push({host_width:width,manager,...geometry});assert.ok(geometry.width>0);assert.ok(geometry.scroll<=geometry.width+1,JSON.stringify({host_width:width,manager,...geometry}));
        if(width===320||width===1180)await page.screenshot({path:join(out,`${manager}-${width}.png`)});
      }
    }
  });
  await page.setViewportSize({width:1920,height:960});
  await page.evaluate(style=>{const panel=document.getElementById('panel-settings');if(style===null)panel.removeAttribute('style');else panel.setAttribute('style',style);},originalPanelStyle);
  await check('all eight theme variants apply to sound controls in the normal shell',async()=>{
    report.themes=[];
    for(const family of ['Basic','Friendly','Glass','Retro'])for(const mode of ['Dark','Light']){
      const theme=`${family} ${mode}`;
      const accepted=await page.evaluate(t=>window.PM12_KIMI.setSettingFromHost('general.visual.theme',t),theme);assert.equal(accepted,true,theme);
      await openSounds();
      // The continuous document can retain a scroll position from the prior
      // theme's geometry. Keep the library in view for reviewable screenshots.
      await root.locator('.sound-layout > .panel-card').first().scrollIntoViewIfNeeded();
      const row=await play('attention').evaluate(e=>({theme:document.documentElement.dataset.theme,color:getComputedStyle(e).color,background:getComputedStyle(e).backgroundColor}));
      assert.equal(row.theme,theme.toLowerCase().replace(' ','-'));assert.notEqual(row.color,row.background);report.themes.push(row);
      await page.screenshot({path:join(out,`sounds-${row.theme}.png`)});
    }
  });
  await check('no browser page errors',async()=>assert.deepEqual(report.errors,[]));
  await check('artifact bytes unchanged during checkpoint',async()=>assert.equal(sha(readFileSync(artifact)),report.artifact_sha256));
  report.pass=true;
}catch(error){report.pass=false;report.failure=error.stack;report.failureState=await page.evaluate(()=>{const s=window.PM12_KIMI?.getState();return s?{domain:s.domain,workspace:s.workspace,notificationTab:s.notificationTab,soundNames:s.notifications?.sounds?.map(x=>x.name)}:null;}).catch(()=>null);console.error(error);process.exitCode=1;await page.screenshot({path:join(out,'failure.png')}).catch(()=>{});}
finally{await browser.close();writeFileSync(join(out,'settings-polish-checkpoint.json'),JSON.stringify(report,null,2)+'\n');}
