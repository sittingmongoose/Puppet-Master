import {chromium} from 'playwright';
import {pathToFileURL} from 'url';
const target="/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html";
const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto(pathToFileURL(target).href,{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true);
await p.evaluate(()=>{window.PM56_DEMO.pinActivity();window.PM56_DEMO.openActivity('goal');});
await p.waitForTimeout(400);
const res=await p.evaluate(()=>{
  const ctx=window.PM56_EXT.ctx({});
  const out={};
  /* a slot's HTML must survive being parsed on its own: pmPatch parses the
     whole app as ONE fragment, so an unclosed tag swallows later siblings */
  for(const [name,fn] of [['section',window.PM56_GOAL.render.section],
                          ['compact',window.PM56_GOAL.render.compact],
                          ['editor', window.PM56_GOAL.render.editor]]){
    const html=fn(ctx);
    const t=document.createElement('template'); t.innerHTML=html;
    const round=t.innerHTML;
    // counts
    const c=s=>({open:(html.match(new RegExp('<'+s+'[ >]','g'))||[]).length,
                 close:(html.match(new RegExp('</'+s+'>','g'))||[]).length});
    out[name]={chars:html.length, roundTripsIdentical: round.length===html.length,
      div:c('div'),span:c('span'),button:c('button'),li:c('li'),ol:c('ol'),ul:c('ul'),
      section:c('section'),dl:c('dl'),dt:c('dt'),dd:c('dd'),article:c('article'),p:c('p'),
      topLevelNodes:[...t.content.children].map(x=>x.tagName+'.'+String(x.className).split(' ')[0])};
  }
  // and the live DOM: is the panel's resize handle still a panel child?
  out.dom={
    resizeIsPanelChild: !!document.querySelector('.activity-panel > .panel-resize'),
    domainSections: document.querySelectorAll('.activity-panel .activity-scroll > .activity-section').length,
    goalBlockClosed: !!document.querySelector('.activity-panel .goal-block'),
    nestedGoalBlocks: document.querySelectorAll('.goal-block .activity-section').length,
    barCount: (document.querySelector('.activity-item[data-hover-domain="goal"] .count')||{}).textContent,
    apiTotal: window.PM56_GOAL.progress(),
    sectionHeadCount: (document.querySelector('[data-domain-section="goal"] .meta-pill')||{}).textContent
  };
  return out;
});
console.log(JSON.stringify(res,null,1));
await b.close();
