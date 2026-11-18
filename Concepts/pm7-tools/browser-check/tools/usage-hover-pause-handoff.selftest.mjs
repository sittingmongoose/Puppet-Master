// Component scheduling regression. Executes the authored bindTools and opSync routines, not a copied state machine.
// The controlled idle order covers a rare path the headless native runner cannot currently qualify.
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {test} from 'node:test';
import assert from 'node:assert/strict';

const cards=readFileSync(new URL('../../../usage-redesign/src/js/42-cards.js',import.meta.url),'utf8');
const boards=readFileSync(new URL('../../../usage-redesign/src/js/40-board.js',import.meta.url),'utf8');
function between(source,start,end) {
 const a=source.indexOf(start),b=source.indexOf(end,a);
 assert.ok(a>=0&&b>a,'authored component boundaries exist');return source.slice(a,b);
}
const bind=between(cards,'  function bindTools(b) {','  PMU.boards.each(bindTools);');
const sync=between(boards,'    function opSync() {','    function sizeLabel(');
function fixture(toolOpacity) {
 let now=0,next=1;const timers=new Map(),events=[],listeners=new Map();
 class Element {
  constructor(id){this.id=id;this.attrs=new Map();this.handlers=new Map();this.isConnected=true;}
  getAttribute(k){return this.attrs.get(k)??null;}
  hasAttribute(k){return this.attrs.has(k);}
  setAttribute(k,v){this.attrs.set(k,v);}
  removeAttribute(k){this.attrs.delete(k);}
  querySelector(selector){
   if(selector.includes('.pmu-ghostboard'))return this.ghost??null;
   if(selector.includes('.pmu-card:hover'))return this.hovered??null;
   if(selector.includes('.pmu-cardtools'))return this.tools??null;
   return null;
  }
  matches(){return false;}
  addEventListener(k,fn){this.handlers.set(k,fn);}
  removeEventListener(k){this.handlers.delete(k);}
 }
 const board=new Element('pmuBoard'),sc=new Element('pmuScroll'),ghost=new Element(''),classes=new Set();
 sc.ghost=ghost;
 const tools=new Element('tools');
 if(toolOpacity!=null){board.hovered=new Element('card');board.hovered.tools=tools;}
 const cl={contains:k=>classes.has(k),add:k=>classes.add(k),remove:k=>classes.delete(k)};
 const emit=type=>{for(const fn of listeners.get(type)||[])fn();};
 const b={scrollEl:sc,el:()=>board,on:(type,fn)=>{const set=listeners.get(type)||new Set();set.add(fn);listeners.set(type,set);return()=>set.delete(fn);}};
 const ctx=vm.createContext({b,boardEl:board,inner:b,document:{body:{classList:cl},dispatchEvent:e=>events.push({type:e.type,t:now,detail:e.detail})},
  console,performance:{now:()=>now},CustomEvent:class{constructor(type,init){this.type=type;this.detail=init.detail;}},
  setTimeout:(fn,ms)=>{const id=next++;timers.set(id,{fn,t:now+ms});return id;},clearTimeout:id=>timers.delete(id),
  requestAnimationFrame:()=>0,unfitSoon:()=>{},fitTools:()=>{},M:{reduced:()=>false},
  getComputedStyle:()=>({opacity:String(toolOpacity),pointerEvents:'auto'}),emit});
 ctx.window=ctx;
 vm.runInContext('var opT=0,opOn=false,gesture=null,RESIZING_BY=null;'+sync+bind+`
  b.gesture=function(){return gesture;};
  this.startGesture=function(mode){gesture={type:mode};opOn=true;RESIZING_BY=inner;document.body.classList.add('pm-resizing');opSync();};
  this.releaseGesture=function(defer){gesture=null;opOn=false;if(!defer)opSync();};
  this.cleanup=bindTools(b);`,ctx);
 sc.scrollTop=0;sc.scrollLeft=0;
 const input=(type,x=100,y=100,deltaX=0,deltaY=1)=>sc.handlers.get(type)({clientX:x,clientY:y,deltaX,deltaY});
 const advance=t=>{while(true){const due=[...timers].filter(([,x])=>x.t<=t).sort((a,b)=>a[1].t-b[1].t)[0];if(!due)break;now=due[1].t;timers.delete(due[0]);due[1].fn();}now=t;};
 const scrollBy=(dy)=>{sc.scrollTop+=dy;input('scroll');};
 const startWheel=()=>{input('wheel');scrollBy(1);};
 return {board,ghost,tools,ctx,input,scrollBy,startWheel,advance,events,ends:()=>events.filter(e=>e.type==='pmu-op-end'),cleanup:()=>ctx.cleanup()};
}
for(const mode of ['move','resize']) {
 test(`${mode}: early idle release retains wheel until its original deadline`,()=>{
  const x=fixture();try {
   x.startWheel();assert.equal(x.board.getAttribute('data-op'),'wheel');
   x.advance(50);x.ctx.startGesture(mode);assert.equal(x.board.getAttribute('data-op'),mode);assert.ok(x.board.hasAttribute('data-wheel-handoff'));
   x.advance(90);x.ctx.releaseGesture();assert.equal(x.board.getAttribute('data-op'),'wheel','released gesture hands suppression back to pending wheel');
   x.advance(149);assert.equal(x.board.getAttribute('data-op'),'wheel');assert.equal(x.ends().length,0);
   x.advance(150);assert.equal(x.board.getAttribute('data-op'),null);assert.ok(!x.board.hasAttribute('data-wheel-handoff'));assert.equal(x.ends().length,1);assert.equal(x.ends()[0].t,150);
  } finally{x.cleanup();}
 });
 for(const input of ['scroll','wheel']) {
  test(`${mode}: ${input} during the gesture leaves the original wheel deadline intact`,()=>{
   const x=fixture();try {
    x.startWheel();x.advance(50);x.ctx.startGesture(mode);x.advance(70);if(input==='scroll')x.scrollBy(1);else x.input('wheel');
    x.advance(90);x.ctx.releaseGesture();assert.equal(x.board.getAttribute('data-op'),'wheel');
    x.advance(149);assert.equal(x.ends().length,0);
    x.advance(150);assert.equal(x.board.getAttribute('data-op'),null);assert.equal(x.ends().length,1);assert.equal(x.ends()[0].t,150);
   } finally{x.cleanup();}
  });
 }
 test(`${mode}: hold expiry waits for a longer gesture and returns exactly once`,()=>{
  const x=fixture();try {
   x.startWheel();x.advance(50);x.ctx.startGesture(mode);x.advance(180);
   assert.equal(x.board.getAttribute('data-op'),mode);assert.ok(!x.board.hasAttribute('data-wheel-handoff'));assert.equal(x.ends().length,0);
   x.ctx.releaseGesture();assert.equal(x.board.getAttribute('data-op'),null);assert.equal(x.ends().length,1);assert.equal(x.ends()[0].t,180);
   x.advance(400);assert.equal(x.ends().length,1);
  } finally{x.cleanup();}
 });
 test(`${mode}: pointer departure during gesture does not resurrect a wheel hold`,()=>{
  const x=fixture();try {
   x.startWheel();x.advance(50);x.ctx.startGesture(mode);x.advance(70);x.input('pointerleave',140,20);
   x.advance(90);x.ctx.releaseGesture();assert.equal(x.board.getAttribute('data-op'),null);assert.equal(x.ends().length,1);
   x.advance(400);assert.equal(x.ends().length,1,'no timer or marker is resurrected after pointer departure');
  } finally{x.cleanup();}
 });
}

test('a first wheel after a room swap pauses the already visible ghost',()=>{
 const x=fixture();try {
  assert.equal(x.ghost.getAttribute('data-op'),null);
  x.startWheel();
  assert.equal(x.ghost.getAttribute('data-op'),'wheel');
  assert.equal(x.board.getAttribute('data-op'),'wheel');
  x.advance(150);
  assert.equal(x.board.getAttribute('data-op'),null);
  assert.equal(x.ends().length,1);
  assert.equal(x.ends()[0].detail.board,x.board);
 } finally{x.cleanup();}
});

for(const opacity of [0,.4]) {
 test(`wheel fade tags a hovered cluster at opacity ${opacity} only if it is visible`,()=>{
  const x=fixture(opacity);try {
   x.startWheel();
   assert.equal(x.tools.hasAttribute('data-wheel-fade'),opacity>0);
   x.advance(150);
   assert.ok(!x.tools.hasAttribute('data-wheel-fade'));
  } finally{x.cleanup();}
 });
}


test('a wheel without pane movement starts no pause and cannot renew one later',()=>{
 const x=fixture();try {
  x.input('wheel');x.input('scroll');assert.equal(x.board.getAttribute('data-op'),null);
  x.advance(151);x.scrollBy(1);assert.equal(x.board.getAttribute('data-op'),null);
  assert.equal(x.events.length,0);
 } finally{x.cleanup();}
});

test('a press between wheel and scroll consumes the pending wheel',()=>{
 const x=fixture();try {
  x.input('wheel');x.input('pointerdown');x.scrollBy(1);
  assert.equal(x.board.getAttribute('data-op'),null);assert.equal(x.events.length,0);
 } finally{x.cleanup();}
});

test('the first pane movement can take over a completed gesture before idle cleanup',()=>{
 const x=fixture();try {
  x.ctx.startGesture('move');x.ctx.releaseGesture(true);
  assert.equal(x.board.getAttribute('data-op'),'move');
  x.input('wheel');assert.equal(x.board.getAttribute('data-op'),'move');
  x.scrollBy(1);assert.equal(x.board.getAttribute('data-op'),'wheel');
  x.advance(150);assert.equal(x.board.getAttribute('data-op'),null);assert.equal(x.ends().length,1);
 } finally{x.cleanup();}
});

for (const [label,deltaX,deltaY] of [['a horizontal wheel',1,0],['an upward wheel at the top',0,-1]]) {
 test(`${label} cannot claim a subsequent downward scroll`,()=>{
  const x=fixture();try {
   x.input('wheel',100,100,deltaX,deltaY);
   x.scrollBy(1);
   assert.equal(x.board.getAttribute('data-op'),null);
   assert.equal(x.events.length,0);
  } finally{x.cleanup();}
 });
}

test('a later real wheel scroll can start after an unrelated offset change',()=>{
 const x=fixture();try {
  x.input('wheel',100,100,0,-1);
  x.scrollBy(4);
  assert.equal(x.board.getAttribute('data-op'),null);
  x.input('wheel',100,100,0,-1);
  x.scrollBy(-1);
  assert.equal(x.board.getAttribute('data-op'),'wheel');
 } finally{x.cleanup();}
});
