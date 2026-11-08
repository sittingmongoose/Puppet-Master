// SW-42: walk the long Studio scroller in Glass Light, including its final viewport.
//
// Home's scrollers are named by the census below, but the walk never holds a handle to one across a wait. The product
// may replace a scroller between two steps: the chat Working card's subject panel (div.orbit-panel-in, keyed by the
// live subject in 5.6 Pro/orbit.js) is a new node at every handover of its 2 s work clock. A Playwright locator action
// resolves the node, then waits (scrollIntoViewIfNeeded's stability wait, boundingBox's protocol call, 300-400 ms here),
// so a handover inside that wait failed the walk on a node that was gone ('Element is not attached to the DOM',
// 'Scroller vanished'; G6, fo-g6-bisect), and a locator evaluate on a node replaced after it resolved would have read the
// detached node's zero metrics as its bottom. Each step instead re-finds the scroller inside the page, by its census
// path while that path still names a shown element of the same kind (tag and first class), else by its kind and place
// among the shown scrollers of that kind, and acts on that node in the same task. The assertions are unchanged.
//   (a scroller that cannot be re-found still throws 'Scroller vanished'; one replaced mid-walk is walked from its new top)
//   --set selftest=replace  the check itself replaces each Home scroller (but the root) with a deep copy twice, inside
//                           the place step's stable wait and right before its first read, as the chat's keyed patch
//                           does; every walk must still pass and report both replacements.

// One in-page step on Home scroller `i`: re-find it, then place it ('place': scroll it into view if needed and wait for
// a box that holds still for a frame, as Playwright's stable check does, re-finding it every frame) or just read it
// ('read'), returning its box and scroll metrics read in the same task as the find. `replaced` counts the times the node
// found differs from the one found at this scroller's previous step.
async function homeScroller({ spec, i, op, selftest }) {
  const kindOf = (e) => e.tagName.toLowerCase() + (e.classList.length ? '.' + e.classList[0] : '');
  const pathOf = (e) => { const path = []; for (let n = e; n && n.nodeType === 1; n = n.parentElement) { const tag = n.tagName.toLowerCase(); const siblings = n.parentElement ? [...n.parentElement.children].filter((x) => x.tagName === n.tagName) : [n]; path.unshift(tag + ':nth-of-type(' + (siblings.indexOf(n) + 1) + ')'); } return path.join(' > '); };
  const shown = (e) => !!e && e.isConnected && e.checkVisibility({ visibilityProperty: true });
  const find = () => {
    const e = document.querySelector(spec.path);
    if (shown(e) && kindOf(e) === spec.kind) return e;
    const all = new Set([document.scrollingElement, ...document.querySelectorAll('body *')]);
    return [...all].filter((x) => kindOf(x) === spec.kind && shown(x) && x.clientHeight > 40 && /auto|scroll/.test(getComputedStyle(x).overflowY))[spec.k] || null;
  };
  const seen = (window.__studioScrollOverflowSeen ||= []);
  let replaced = 0;
  const take = (e) => { if (seen[i] && seen[i] !== e) replaced++; seen[i] = e; return e; };
  const swap = (x) => { if (selftest && x !== document.scrollingElement && x !== document.body && x !== document.documentElement) x.replaceWith(x.cloneNode(true)); };
  let e = find(); if (!e) return null; take(e);
  if (op === 'read' && selftest && !seen['read' + i]) { seen['read' + i] = true; swap(e); e = find(); if (!e) return null; take(e); }
  if (op === 'place') {
    if (e.scrollIntoViewIfNeeded) e.scrollIntoViewIfNeeded(true); else e.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    let last = '', still = false;
    for (let n = 0; n < 600 && !still; n++) {
      await new Promise((r) => requestAnimationFrame(r));
      if (n === 0) swap(e);
      const x = find(); if (!x) { last = ''; continue; }
      e = take(x);
      const r = e.getBoundingClientRect(), key = [r.x, r.y, r.width, r.height].join();
      still = key === last; last = key;
    }
    if (!still) return { unstable: true, replaced };
    e = find(); if (!e) return null; take(e);
  }
  const r = e.getBoundingClientRect();
  return { path: pathOf(e), replaced, box: { x: r.x, y: r.y, width: r.width, height: r.height }, top: e.scrollTop, height: e.clientHeight, total: e.scrollHeight };
}

export default async function (t) {
  await t.viewport(1920, 1080);
  const f = await t.app.open(); await t.app.look('glass-light');
  // The retained historical looks summary identifies Home's whole-page audit as partial.
  // browser-check caps the unscoped probe at eight scrollers and twelve stops; scope each
  // visible scroller at every viewport so that cap cannot silently skip its middle.
  const specs = await f.evaluate(() => {
    const nodes = [document.scrollingElement, ...document.querySelectorAll('body *')].filter((e,i,a) => a.indexOf(e) === i && e.clientHeight > 40 && e.scrollHeight > e.clientHeight + 1 && /auto|scroll/.test(getComputedStyle(e).overflowY) && e.checkVisibility({visibilityProperty:true}));
    const kindOf = (e) => e.tagName.toLowerCase() + (e.classList.length ? '.' + e.classList[0] : '');
    // the same set homeScroller's fallback searches: shown scrollers of a kind, overflowing now or not
    const all = [...new Set([document.scrollingElement, ...document.querySelectorAll('body *')])].filter(e => e.clientHeight > 40 && /auto|scroll/.test(getComputedStyle(e).overflowY) && e.checkVisibility({visibilityProperty:true}));
    return nodes.map(e=>{const path=[];for(let n=e;n&&n.nodeType===1;n=n.parentElement){const tag=n.tagName.toLowerCase();const siblings=n.parentElement?[...n.parentElement.children].filter(x=>x.tagName===n.tagName):[n];path.unshift(tag+':nth-of-type('+(siblings.indexOf(n)+1)+')');}
      const kind=kindOf(e);return {path:path.join(' > '),kind,k:all.filter(x=>kindOf(x)===kind).indexOf(e)};});
  });
  await t.check('Home has visible scrollers to audit', specs.length > 0, String(specs.length), {hard:true});
  t.log('Home visible scrollers: '+specs.length+' ('+specs.map(s=>s.kind).join(', ')+')');
  // The app's frame sits at the page's origin on a normal page; in T3's sandbox its iframe's content box is the offset.
  let off = {x:0,y:0};
  if (f.parentFrame()) { const fe = await f.frameElement(), b = await fe.boundingBox(); const inset = await fe.evaluate(el => { const cs = getComputedStyle(el); return {x: el.clientLeft + parseFloat(cs.paddingLeft), y: el.clientTop + parseFloat(cs.paddingTop)}; }); off = {x: b.x + inset.x, y: b.y + inset.y}; }
  const selftest = t.args.selftest === 'replace';
  try {
    for (let i=0;i<specs.length;i++) {
      const spec=specs[i];
      const placed=await f.evaluate(homeScroller,{spec,i,op:'place',selftest});
      if(!placed)throw Error('Scroller vanished');
      if(placed.unstable)throw Error('Home scroller '+i+' never held still');
      let replaced=placed.replaced, path=placed.path; const r=placed.box;
      await t.page.mouse.move(off.x+r.x+r.width/2,off.y+r.y+Math.min(r.height/2,200)); await t.page.mouse.wheel(0,-100000); await f.waitForTimeout(100);
      let done=false;
      for(let n=0;n<200;n++) {
        await t.noOverflow(`Home scroller ${i} segment ${n}`,{scope:path});
        const pos=await f.evaluate(homeScroller,{spec,i,op:'read',selftest}); if(!pos)throw Error('Scroller vanished');
        replaced+=pos.replaced; path=pos.path;
        if(pos.top+pos.height>=pos.total-2){done=true;break;}
        await t.page.mouse.wheel(0,Math.max(40,Math.min(pos.height,900)*.8)); await f.waitForTimeout(100);
      }
      if(replaced)t.log('Home scroller '+i+' ('+spec.kind+') was replaced by the page '+replaced+' time(s) during its walk; each step re-found it');
      if(selftest&&spec.kind!=='html'&&spec.kind!=='body')await t.check('selftest: Home scroller '+i+' re-found after both forced replacements',replaced>=2,String(replaced));
      await t.check('Home scroller '+i+' reached bottom',done,'',{hard:true});
    }
  } finally { /* Scoped probes restore their scroll positions themselves. */ }
  await t.viewport(1390,900);
  await f.locator('.pmds-entry').click();
  await f.locator('[data-pmds-tab="onboarding"]').click();
  const scroller = f.locator('#pmds-main');
  const box = await scroller.boundingBox(); if (!box) throw Error('Studio scroller missing');
  let visits = 0, bottom = false; const bad = [];
  for (; visits < 100; visits++) {
    const state = await scroller.evaluate(e => ({top:e.scrollTop,height:e.clientHeight,total:e.scrollHeight,width:e.clientWidth,wide:e.scrollWidth}));
    if (state.wide > state.width + 1) bad.push(state);
    if (state.top + state.height >= state.total - 2) { bottom = true; break; }
    await t.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await t.page.mouse.wheel(0, Math.max(100, state.height * .8));
    await f.waitForTimeout(200);
  }
  await t.check('long Studio scroller visited through its bottom', bottom && visits > 0, JSON.stringify({bottom,visits}), {hard:true});
  await t.check('no horizontal overflow at any visited segment', !bad.length, JSON.stringify(bad));
}
