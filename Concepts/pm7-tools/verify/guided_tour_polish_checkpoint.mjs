/* Focused browser-concept checkpoint, not final campaign or native certification.
 * node guided_tour_polish_checkpoint.mjs <artifact> <out> <modules> <chrome> [baseline]
 */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
const [artifactArg,outArg,modulesArg,chrome,baselineArg]=process.argv.slice(2);
assert.ok(artifactArg&&outArg&&modulesArg&&chrome,'artifact, out, modules, chrome required');
const artifact=resolve(artifactArg),out=resolve(outArg),require=createRequire(join(resolve(modulesArg),'noop.js'));
const {chromium}=require('playwright-core'),sha=value=>createHash('sha256').update(value).digest('hex');
mkdirSync(out,{recursive:true});
const report={scope:'focused tour concept edit/copy/DOM-continuity checkpoint only; not full manual/Show Me, all-theme motion, native, or production evidence',
  artifact_sha256:sha(readFileSync(artifact)),verifier_sha256:sha(readFileSync(fileURLToPath(import.meta.url))),checks:[],errors:[],screenshots:[]};
const browser=await chromium.launch({executablePath:chrome,headless:true});
let page,context;
async function check(name,fn){await fn();report.checks.push({name,pass:true});console.log(`PASS ${name}`);}
async function newPage(reduced=false){
  if(context)await context.close();
  context=await browser.newContext({viewport:{width:1440,height:960},reducedMotion:reduced?'reduce':'no-preference',serviceWorkers:'block'});
  page=await context.newPage();page.setDefaultTimeout(15000);
  page.on('pageerror',error=>report.errors.push(error.message));
  await page.route('**/*',route=>/^(file:|data:|blob:)/.test(route.request().url())?route.continue():route.abort());
  await page.goto(pathToFileURL(artifact).href);
  await page.waitForFunction(()=>window.PM7_GUIDED_TOUR&&window.PM12_REFERENCE);
  const close=page.getByRole('button',{name:'Close onboarding',exact:true});if(await close.isVisible())await close.click();
}
const snap=()=>page.evaluate(()=>window.PM7_GUIDED_TOUR.snapshot());
async function waitStep(id){await page.waitForFunction(value=>window.PM7_GUIDED_TOUR.snapshot().step_id===value,id);}
async function show(id,next){await waitStep(id);await page.locator('#pm7-guided-tour [data-tour-action="show"]').click();await waitStep(next);}
async function prepareReview(answer){
  await page.evaluate(()=>window.PM7_GUIDED_TOUR.start({source:'focused-checkpoint',step:'planning_wizard'}));
  await show('tour.planning.open','tour.planning.project_source');
  await show('tour.planning.project_source','tour.planning.goal');
  await show('tour.planning.goal','tour.planning.guided_help');
  await show('tour.planning.guided_help','tour.planning.requirements');
  await show('tour.planning.requirements','tour.planning.question');
  await page.locator('#pm7-guided-tour [data-tour-action="try"]').click();
  await page.locator(`#pm7gt-planning-practice [data-practice-action="answer"][data-practice-value="${answer}"]`).click();
  await waitStep('tour.planning.why');await show('tour.planning.why','tour.planning.review');
  await show('tour.planning.review','tour.planning.edit');
  await page.evaluate(()=>{
    const node=document.querySelector('[data-tour-fixture-id="planning-outcomes"]');
    window.__tourPolish={outcomes:node,children:[...node.children],box:node.getBoundingClientRect().toJSON(),
      access:document.querySelector('[data-tour-fixture-id="planning-shared-access"]')};
  });
}
async function continuity(){
  const observed=await page.evaluate(()=>{
    const old=window.__tourPolish,node=document.querySelector('[data-tour-fixture-id="planning-outcomes"]'),box=node.getBoundingClientRect();
    return {same_node:old.outcomes===node,same_children:old.children.every((child,index)=>node.children[index]===child),
      same_access_node:old.access===document.querySelector('[data-tour-fixture-id="planning-shared-access"]'),
      x_delta:Math.abs(old.box.x-box.x),y_delta:Math.abs(old.box.y-box.y),text:node.textContent};
  });
  assert.ok(observed.same_node&&observed.same_children&&observed.same_access_node,JSON.stringify(observed));
  assert.ok(observed.x_delta<1&&observed.y_delta<1,JSON.stringify(observed));return observed;
}
try{
  if(baselineArg)await check('onboarding output remains byte-identical',()=>{
    const before=readFileSync(resolve(baselineArg),'utf8'),after=readFileSync(artifact,'utf8');
    report.protected_bands=[];
    for(const id of ['pm7-onboarding-css','pm7-onboarding-js']){const tag=id.endsWith('css')?'style':'script',re=new RegExp(`<${tag} id="${id}">([\\s\\S]*?)<\\/${tag}>`),a=before.match(re)?.[1],b=after.match(re)?.[1];assert.ok(a&&b);assert.equal(sha(a),sha(b));report.protected_bands.push({id,sha256:sha(b)});}
  });
  await newPage();
  await check('canonical Chat command identities replace concept aliases',async()=>{
    const source=await page.locator('#pm7-guided-tour-js').textContent();
    for(const id of ['cmd.persona.select','cmd.chat.send','cmd.chat.eli5.set'])assert.ok(source.includes(id));
    assert.ok(!source.includes('ui.assistant_chat.'));
  });
  await check('Working Notebook additions are retained in both Settings read models',async()=>{
    const data=await page.evaluate(()=>({total:window.PM12_REFERENCE.total,rows:window.PM12_REFERENCE.byCat.memory.settings.filter(row=>row.id.startsWith('memory.notebook.')),compat:JSON.parse(document.getElementById('pm7-settings-data').textContent).settings.filter(row=>row.id.startsWith('memory.notebook.'))}));
    assert.equal(data.total,887);assert.equal(data.rows.length,4);assert.deepEqual(data.rows.map(x=>x.id).sort(),data.compat.map(x=>x.id).sort());report.notebook_settings=data.rows.map(x=>x.id);
  });
  for(const [before,after] of [['organizers','me'],['me','organizers'],['unsure','me']]){
    await newPage();await prepareReview(before);
    if(before==='unsure')await check('unsure stays visibly unresolved in review',async()=>{
      const access=page.locator('[data-tour-fixture-id="planning-shared-access"]');assert.equal(await access.getAttribute('data-state'),'unresolved');assert.match(await access.textContent(),/needs a decision/);
    });
    await check(`manual edit ${before} → ${after} requires a separate changed answer`,async()=>{
      await page.locator('#pm7-guided-tour [data-tour-action="try"]').click();
      await page.locator('#pm7gt-planning-practice [data-practice-action="edit"]').click();
      assert.equal((await snap()).planning_answer,before);assert.equal((await snap()).planning_edited,false);
      assert.equal((await snap()).step_id,'tour.planning.edit');
      assert.ok(await page.locator(`#pm7gt-planning-practice [data-practice-value="${before}"]`).isDisabled());
      await continuity();
      await page.locator(`#pm7gt-planning-practice [data-practice-action="answer"][data-practice-value="${after}"]`).click();
      await waitStep('tour.planning.consequence');
      const state=await snap();assert.equal(state.planning_answer,after);assert.equal(state.planning_edited,true);assert.equal(state.work_started,false);
      assert.ok(await page.locator('[data-tour-fixture-id="planning-review"]').isVisible());
      assert.equal(await page.locator('[data-tour-fixture-id="planning-shared-access"]').getAttribute('data-consequence-revision'),'1');
      report[`continuity_${before}_${after}`]=await continuity();
    });
    const path=join(out,`review-${before}-to-${after}.png`);await page.screenshot({path});report.screenshots.push(path);
  }
  await newPage(true);await prepareReview('me');
  await check('Reduced Motion Show Me performs Edit then a genuinely different choice',async()=>{
    await show('tour.planning.edit','tour.planning.consequence');const state=await snap();assert.equal(state.planning_answer,'organizers');assert.equal(state.planning_edited,true);assert.equal(state.reduced_motion,true);await continuity();
  });
  await newPage();await prepareReview('organizers');
  await check('pause interrupts Show Me before its delayed answer can mutate the plan',async()=>{
    await page.locator('#pm7-guided-tour [data-tour-action="show"]').click();
    await page.locator('#pm7-guided-tour [data-ui-action-id="ui.guided_tour.pause"]').click();
    await page.waitForTimeout(1700);const state=await snap();assert.equal(state.status,'paused');assert.equal(state.planning_answer,'organizers');assert.equal(state.planning_edited,false);
  });
  await check('no page errors during the focused journeys',()=>assert.deepEqual(report.errors,[]));
  report.pass=true;
}catch(error){report.pass=false;report.failure=String(error.stack||error);console.error(report.failure);if(page)try{await page.screenshot({path:join(out,'failure.png')});}catch{}}
finally{writeFileSync(join(out,'guided-tour-polish-checkpoint.json'),JSON.stringify(report,null,2)+'\n');await browser.close();}
if(!report.pass)process.exitCode=1;
