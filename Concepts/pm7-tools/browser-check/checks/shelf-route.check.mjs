// SW-42: inventory every shelf menu, including real panel tabs and expanders.
// Beyond the PMMenu wrappers: every authored side-panel menu (read from the page file, so a
// menu the shell portals to <body>, such as File actions, still counts), every popup trigger
// (aria-haspopup, by mouse and Enter), every context-menu route (found by real right-click,
// Shift+F10 and the Menu key on each focusable row kind), and every nested branch (hover and
// ArrowRight/ArrowLeft). Source Control is walked in each engine its switch offers.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const INPUTS = ['mouse', 'shift-f10', 'menu-key'];
const KEY = { 'shift-f10': 'Shift+F10', 'menu-key': 'ContextMenu' };

// The side panel as the page under test authors it: the same file (or served page) the kit opens.
async function authoredSlot(t) {
  const page = t.args.page ? String(t.args.page) : fileURLToPath(new URL('../../../PMConcept7.html', import.meta.url));
  const served = /^https?:/i.test(page), file = /^file:/i.test(page) ? fileURLToPath(page) : served ? null : path.resolve(page);
  const url = served ? page.split('?')[0] : pathToFileURL(file).href;
  const html = served ? await (await fetch(page)).text() : await readFile(file, 'utf8');
  const at = html.indexOf('id="sidePanelSlot"');
  if (at < 0) return { url, html: null };
  const start = html.lastIndexOf('<aside', at), re = /<(\/?)aside\b/gi;
  re.lastIndex = start;
  for (let m, depth = 0; (m = re.exec(html));) {
    depth += m[1] ? -1 : 1;
    if (!depth) return { url, html: html.slice(start, html.indexOf('>', m.index) + 1) };
  }
  return { url, html: null };
}

export default async function (t) {
  if (t.args.blockMenu) await t.page.addInitScript(id => {
    window.__blockedShelfMenu = 0;
    window.addEventListener('click', e => {
      if (e.target.closest?.('.pm6-tb-menu-trigger')?.getAttribute('aria-controls') === id) {
        window.__blockedShelfMenu++; e.preventDefault(); e.stopImmediatePropagation();
      }
    }, true);
  }, t.args.blockMenu);
  // Sabotage: --set blockContext=<tab|*>:<mouse|shift-f10|menu-key|*> stops that context-menu input
  // in the named pane before any owner listener sees it.
  if (t.args.blockContext) await t.page.addInitScript(spec => {
    const [tab, input] = String(spec).split(':');
    window.__blockedContext = 0;
    const pane = e => {
      const view = e.target.closest?.('.side-panel-view');
      const on = view && [...view.querySelectorAll('[role="tab"]')].find(x => x.checkVisibility() && (x.classList.contains('active') || x.getAttribute('aria-selected') === 'true'));
      return on ? (on.dataset.tab || on.dataset.jjTab || on.textContent.trim()) : '';
    };
    const hit = (e, kind) => (input === '*' || input === kind) && !!e.target.closest?.('#sidePanelSlot') && (tab === '*' || pane(e) === tab);
    const stop = e => { window.__blockedContext++; e.preventDefault(); e.stopImmediatePropagation(); };
    // A key can also raise its own contextmenu event (Windows sends one on the Menu key's keyup), so the
    // contextmenu that follows a key, with no pointer press in between, belongs to that key's route.
    let key = null;
    window.addEventListener('pointerdown', () => { key = null; }, true);
    window.addEventListener('contextmenu', e => { if (hit(e, key || 'mouse')) stop(e); }, true);
    window.addEventListener('keydown', e => {
      key = e.key === 'F10' && e.shiftKey ? 'shift-f10' : e.key === 'ContextMenu' ? 'menu-key' : null;
      if (key && hit(e, key)) stop(e);
    }, true);
  }, String(t.args.blockContext));
  // Sabotage: --set blockPopup=<css selector> stops clicks and Enter/Space/ArrowDown on matching side-panel triggers;
  // --set blockPopupInput=mouse|enter narrows it to one input, --set blockPopupText=<text> to triggers whose text has it.
  if (t.args.blockPopup) await t.page.addInitScript(([sel, input, text]) => {
    window.__blockedPopup = 0;
    const hit = e => { const trig = e.target.closest?.(sel); return !!trig?.closest('#sidePanelSlot') && (!text || trig.textContent.includes(text)); };
    const stop = e => { window.__blockedPopup++; e.preventDefault(); e.stopImmediatePropagation(); };
    if (input !== 'enter') window.addEventListener('click', e => { if (e.detail > 0 && hit(e)) stop(e); }, true);
    if (input !== 'mouse') window.addEventListener('keydown', e => { if (['Enter', ' ', 'ArrowDown'].includes(e.key) && hit(e)) stop(e); }, true);
  }, [String(t.args.blockPopup), String(t.args.blockPopupInput || '*'), String(t.args.blockPopupText || '')]);
  // Sabotage: --set blockBranch=<item text|*>:<hover|key|*> stops a nested branch opening by pointer or ArrowRight.
  if (t.args.blockBranch) await t.page.addInitScript(spec => {
    const cut = spec.lastIndexOf(':'), name = spec.slice(0, cut), input = spec.slice(cut + 1);
    window.__blockedBranch = 0;
    const item = n => n && n.nodeType === 1 ? (n.closest('[role^="menuitem"][aria-haspopup]') || n.querySelector(':scope > [role^="menuitem"][aria-haspopup]')) : null;
    const hit = (e, kind) => { const it = (input === '*' || input === kind) && item(e.target); return !!it && (name === '*' || it.textContent.includes(name)); };
    for (const type of ['pointerover', 'pointerenter', 'pointermove', 'mouseover', 'mouseenter', 'mousemove'])
      window.addEventListener(type, e => { if (hit(e, 'hover')) { window.__blockedBranch++; e.stopImmediatePropagation(); } }, true);
    window.addEventListener('keydown', e => { if (e.key === 'ArrowRight' && hit(e, 'key')) { window.__blockedBranch++; e.preventDefault(); e.stopImmediatePropagation(); } }, true);
  }, String(t.args.blockBranch));
  await t.viewport(Number(t.args.width || 1920),Number(t.args.height || 1080)); const f = await t.app.open();
  if(t.args.look) await t.app.look(t.args.look);
  const fe = f === t.page.mainFrame() ? null : await f.frameElement(), off = fe ? await fe.boundingBox() : { x: 0, y: 0 };
  // Test-only readers: which menus are open, and a stable key for each (id, PMR id, or parent › label).
  await f.evaluate(() => {
    const key = m => { const up = m.parentElement && m.parentElement.closest('[role="menu"]'); return m.id || m.dataset.pmrMenu || ((up ? key(up) + ' › ' : '') + (m.getAttribute('aria-label') || 'menu')); };
    const open = () => [...document.querySelectorAll('[role="menu"]')].filter(m => m.classList.contains('is-open') && !m.classList.contains('is-closing') && m.checkVisibility());
    window.__shelf = { key, open, keys: () => open().map(key) };
  });
  // Preserve the original initial-view census; the complete routed inventory below
  // independently includes hidden tabs and collapsed shelves. Zero here is initial-only.
  const expected = {'panel-files':0,'panel-search':1,'panel-source':0,'panel-git':0,
    'panel-docker':1,'panel-testing':0,'panel-run':0,'panel-agents':0,'panel-artifacts':0};
  const expectedRouted = {
    'panel-files':['fmRootMenu'], 'panel-search':['shScopeMenu','shReplScopeMenu'], 'panel-source':['shBranchMenu'],
    'panel-git':['shDispRefCI','shDispProfCI','shDispRefDkr','shDispPlatDkr'],
    'panel-docker':['shCtxMenu'], 'panel-testing':[], 'panel-run':['rdCfgMenu','rdAfAdapter','rdSessMenu','rdBpMode'],
    'panel-agents':[], 'panel-artifacts':['shArtSort']
  };
  // Floors only: routes found beyond these are exercised automatically; a shrinking census fails.
  const expectedContext = { 'panel-files': ['explorer', 'changed', 'open'] };
  const expectedPopups = {
    'panel-source': ['d-wt-owner', 'd-jj-owner', 'd-jj-cur-more', 'd-jj-hist-more', 'd-jj-bm-move', 'd-jj-bm-more']
  };
  // Read the actual PMMenu upgrade contract from the loaded page's owner functions.
  // A selector change in product source changes discovery without a test hand list.
  const selectors = await f.evaluate(() => {
    const owner = window.PMCozeMenu;
    const read = (fn, call) => fn.toString().match(new RegExp(call + "\\('([^']+)'\\)"))?.[1];
    return {wrap: read(owner.init, 'querySelectorAll'), trigger: read(owner.upgradeWrap, 'querySelector')};
  });
  await t.check('PMMenu upgrade selectors available',!!selectors.wrap && !!selectors.trigger,JSON.stringify(selectors),{hard:true});
  // Every menu the page authors in the side panel, nested branches included, parsed without running scripts.
  const slot = await authoredSlot(t);
  await t.check('authored side panel read from the page under test', !!slot.html && f.url().split('?')[0] === slot.url,
    JSON.stringify({ page: slot.url, frame: f.url().split('?')[0] }), { hard: true });
  const authored = await f.evaluate(html => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const key = m => { const up = m.parentElement && m.parentElement.closest('[role="menu"]'); return m.id || ((up ? key(up) + ' › ' : '') + (m.getAttribute('aria-label') || 'menu')); };
    return [...doc.querySelectorAll('[role="menu"]')].map(m => {
      const up = m.parentElement && m.parentElement.closest('[role="menu"]');
      return { key: key(m), parent: up ? key(up) : null, trigger: !!(m.id && doc.querySelector(`[aria-controls="${CSS.escape(m.id)}"]`)) };
    });
  }, slot.html);
  const authoredTop = authored.filter(m => !m.parent), authoredNested = authored.filter(m => m.parent);
  await t.check('authored side-panel menu census floor', authoredTop.length >= 15 && authoredNested.length >= 2 && authoredTop.some(m => !m.trigger),
    JSON.stringify({ top: authoredTop.map(m => m.key), nested: authoredNested.map(m => m.key) }), { hard: true });
  if (t.args.selftest === 'docker') await f.evaluate(() => {
    window.__blockedDocker = 0;
    window.addEventListener('click', e => {
      if (e.target.closest?.('#activityBar .icon[data-target="panel-docker"]')) {
        window.__blockedDocker++; e.preventDefault(); e.stopImmediatePropagation();
      }
    }, true);
  });
  const targets = await f.locator('#activityBar .icon[data-target]').evaluateAll(es => es.filter(e => e.getBoundingClientRect().width).map(e=>e.dataset.target));
  await t.check('expected activity routes present', JSON.stringify([...targets].sort()) === JSON.stringify(Object.keys(expected).sort()), JSON.stringify(targets), {hard:true});
  const rows=[]; let reached=0; const routedRows=[];
  const opened = new Set(), contextRoutes = [], popupRows = [], branchRows = [], branchDone = new Set();
  let current = null;
  // Assert one open menu: items, a reachable first item, its nested branches, then Escape closes it.
  // reopen: opens the same menu again by the same route, for the pick (FO-84b).
  const assertMenu = async (key, tag, withBranches = true, reopen = null, origin = null) => {
    const info = await f.evaluate(async k => {
      const m = __shelf.open().find(x => __shelf.key(x) === k);
      if (!m) return null;
      await Promise.race([Promise.all(m.getAnimations({ subtree: true }).map(a => a.finished.catch(() => {}))), new Promise(r => setTimeout(r, 1500))]);
      const own = [...m.querySelectorAll('[role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"]')].filter(it => it.closest('[role="menu"]') === m && it.checkVisibility());
      const first = own[0], r = first?.getBoundingClientRect(), hit = r && document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      return { items: own.length, firstOnTop: !!hit && (hit === first || first.contains(hit)) };
    }, key);
    await t.check(`${tag} has menu items`, !!info && info.items > 0, JSON.stringify(info), { hard: true });
    await t.check(`${tag} first item is on top`, info.firstOnTop, '', { hard: true });
    opened.add(key);
    if (withBranches) await branches(key, tag);
    const slot = f.locator('#sidePanelSlot'), panelBefore = await slot.isVisible();
    await t.page.keyboard.press('Escape');
    const closed = await f.waitForFunction(k => !__shelf.open().some(m => __shelf.key(m) === k), key, { timeout: 5000 }).then(() => true, () => false);
    await t.check(`${tag} closes on Escape`, closed, '', { hard: true });
    await f.waitForFunction(k => ![...document.querySelectorAll('[role="menu"]')].some(m => __shelf.key(m) === k && m.checkVisibility()), key, { timeout: 5000 }).catch(() => {});
    // FO-84: one Escape closes one layer. The side panel the menu came from stays open (the folded rail's overlay
    // included); once per panel a second Escape must then close that overlay, and its icon reopens it.
    if (panelBefore) await t.check(`${tag} Escape closes the menu and leaves the side panel open`, await slot.isVisible(), '', { hard: true });
    await secondEscape(tag);
    // --set picks=0 skips the picks (to isolate the Escape assertion on a build without FO-84b)
    if (withBranches && reopen && t.args.picks !== '0') await pickMenu(key, tag, reopen, origin);
  };
  // FO-84b/c: a pick closes the menu and leaves the side panel open (the folded rail's overlay included). The pick is
  // the menu's selected or checked item when it has one (no state change), else its first enabled command item
  // (data-demo-action / data-command-id): never an item that opens something in the centre. Before it, a disabled
  // item and a branch parent must not close the menu. Then the menu opens again by its route and Enter on the same
  // item must pick it the same way and give focus back to the route's origin (its trigger or row).
  const pickMenu = async (key, tag, reopen, origin) => {
    const open = () => f.evaluate(k => __shelf.keys().includes(k), key);
    const reopened = async (why) => {
      await reopen();
      const back = await f.waitForFunction(k => __shelf.keys().includes(k), key, { timeout: 5000 }).then(() => true, () => false);
      await t.check(`${tag} reopens by the same route ${why}`, back, '', { hard: true });
    };
    const mark = () => f.evaluate(k => {
      document.querySelectorAll('[data-shelf-pick],[data-shelf-inert]').forEach(e => { e.removeAttribute('data-shelf-pick'); e.removeAttribute('data-shelf-inert'); });
      const m = __shelf.open().find(x => __shelf.key(x) === k);
      const all = m ? [...m.querySelectorAll('[role^="menuitem"]')].filter(it => it.closest('[role="menu"]') === m && it.checkVisibility()) : [];
      const off = it => it.getAttribute('aria-disabled') === 'true' || it.disabled;
      const own = all.filter(it => !it.hasAttribute('aria-haspopup') && !off(it));
      const chosen = own.find(it => it.getAttribute('aria-checked') === 'true' || it.getAttribute('aria-selected') === 'true' || it.classList.contains('active') || it.classList.contains('is-selected'))
        || own.find(it => it.hasAttribute('data-demo-action') || it.hasAttribute('data-command-id'));
      chosen?.setAttribute('data-shelf-pick', '');
      const inert = [all.find(off), all.find(it => it.hasAttribute('aria-haspopup') && !off(it))].filter(Boolean);
      inert.forEach((it, i) => it.setAttribute('data-shelf-inert', String(i)));
      return { pick: chosen ? chosen.textContent.trim().replace(/\s+/g, ' ') : null, allDisabled: all.length > 0 && all.every(off),
        inert: inert.map(it => (it.hasAttribute('aria-haspopup') ? 'branch ' : 'disabled ') + it.textContent.trim().replace(/\s+/g, ' ')) };
    }, key);
    const settled = () => f.waitForFunction(k => !__shelf.keys().includes(k), key, { timeout: 5000 }).then(() => true, () => false);
    await reopened('for a pick');
    const m1 = await mark();
    // A menu whose items are all disabled (Jujutsu's Move here… on this fixture) has nothing to pick.
    await t.check(`${tag} has an item to pick, or only disabled items`, !!m1.pick || m1.allDisabled, JSON.stringify(m1), { hard: true });
    // A real press at the item's centre: Playwright's click() waits forever on an aria-disabled item.
    const press = async (sel) => {
      const it = f.locator(sel);
      await it.scrollIntoViewIfNeeded();
      const at = await it.evaluate(e => { const r = e.getBoundingClientRect(), x = r.x + r.width / 2, y = r.y + r.height / 2, h = document.elementFromPoint(x, y); return { x, y, onTop: !!h && (h === e || e.contains(h)) }; });
      await t.check(`${tag} ${sel} is on top where it is pressed`, at.onTop, '', { hard: true });
      await t.page.mouse.click(off.x + at.x, off.y + at.y);
    };
    for (const [i, what] of m1.inert.entries()) {
      await press(`[data-shelf-inert="${i}"]`);
      await t.check(`${tag} a ${what.split(' ')[0]} item (${what.slice(what.indexOf(' ') + 1)}) does not close the menu`, await open(), '', { hard: true });
    }
    if (!m1.pick) {
      await t.page.keyboard.press('Escape');
      await settled();
      return;
    }
    await f.locator('[data-shelf-pick]').click();
    const closed = await settled();
    await t.check(`${tag} a pick (${m1.pick}) closes the menu and leaves the side panel open`, closed && await f.locator('#sidePanelSlot').isVisible(),
      JSON.stringify({ closed, panel: await f.locator('#sidePanelSlot').isVisible() }), { hard: true });
    if (!origin) return;
    await reopened('for a pick by Enter');
    const m2 = await mark();
    await origin.evaluate(e => e.setAttribute('data-shelf-origin', ''));
    await f.locator('[data-shelf-pick]').focus();
    await t.page.keyboard.press('Enter');
    const closedByKey = await settled();
    const after = await f.evaluate(() => ({ focusOnOrigin: !!document.activeElement?.hasAttribute('data-shelf-origin'), focus: document.activeElement?.tagName + '.' + document.activeElement?.className }));
    await t.check(`${tag} Enter on (${m2.pick}) picks it, closes the menu and leaves the side panel open`, closedByKey && await f.locator('#sidePanelSlot').isVisible(), '', { hard: true });
    await t.check(`${tag} a pick by Enter gives focus back to the route's origin`, after.focusOnOrigin, JSON.stringify(after), { hard: true });
    await f.evaluate(() => document.querySelectorAll('[data-shelf-pick],[data-shelf-inert],[data-shelf-origin]').forEach(e => { e.removeAttribute('data-shelf-pick'); e.removeAttribute('data-shelf-inert'); e.removeAttribute('data-shelf-origin'); }));
  };
  const secondDone = new Set();
  const secondEscape = async (tag) => {
    if (secondDone.has(current) || !await f.evaluate(() => !!document.querySelector('[data-pmw-rail-peek]'))) return;
    secondDone.add(current);
    await t.page.keyboard.press('Escape');
    await t.check(`${tag} a second Escape closes the folded rail's overlay`, await f.locator('#sidePanelSlot').isHidden(), '', { hard: true });
    await f.locator(`#activityBar .icon[data-target="${current}"]`).click();
    await t.check(`${current} side panel reopened by its icon`, await f.locator('#sidePanelSlot').isVisible(), '', { hard: true });
  };
  // Nested branches: each parent item opens its menu by pointer and by ArrowRight, and ArrowLeft returns.
  const branches = async (key, tag) => {
    const items = await f.evaluate(k => {
      document.querySelectorAll('[data-shelf-branch]').forEach(e => e.removeAttribute('data-shelf-branch'));
      const m = __shelf.open().find(x => __shelf.key(x) === k);
      if (!m) return [];
      return [...m.querySelectorAll('[role^="menuitem"][aria-haspopup]:not([aria-haspopup="false"])')]
        .filter(it => it.closest('[role="menu"]') === m && it.checkVisibility())
        .map((it, i) => { it.setAttribute('data-shelf-branch', String(i)); return it.textContent.trim(); });
    }, key);
    const rest = f.locator(`[data-shelf-branch-rest]`);
    for (const [i, label] of items.entries()) {
      const item = f.locator(`[data-shelf-branch="${i}"]`), btag = `${tag} branch ${label}`;
      const before = await f.evaluate(() => __shelf.keys());
      await item.hover();
      const sub = await f.waitForFunction(b => __shelf.keys().find(k => !b.includes(k)), before, { timeout: 3000 }).then(h => h.jsonValue(), () => null);
      await t.check(`${btag} opens on hover`, !!sub, JSON.stringify({ blocked: await f.evaluate(() => window.__blockedBranch || 0) }), { hard: true });
      const subItems = await f.evaluate(k => {
        const m = __shelf.open().find(x => __shelf.key(x) === k);
        return m ? [...m.querySelectorAll('[role^="menuitem"]')].filter(it => it.closest('[role="menu"]') === m && it.checkVisibility()).length : 0;
      }, sub);
      await t.check(`${btag} has menu items`, subItems > 0, String(subItems), { hard: true });
      // Point at an item without a branch: the open branch closes, the parent stays.
      await f.evaluate(k => {
        const m = __shelf.open().find(x => __shelf.key(x) === k);
        const plain = m && [...m.querySelectorAll('[role^="menuitem"]:not([aria-haspopup])')].find(it => it.closest('[role="menu"]') === m && it.checkVisibility());
        plain?.setAttribute('data-shelf-branch-rest', '');
      }, key);
      if (await rest.count()) await rest.hover();
      const left = await f.waitForFunction(k => !__shelf.keys().includes(k), sub, { timeout: 3000 }).then(() => true, () => false);
      await t.check(`${btag} closes when the pointer moves on`, left, '', { hard: true });
      await f.evaluate(() => document.querySelectorAll('[data-shelf-branch-rest]').forEach(e => e.removeAttribute('data-shelf-branch-rest')));
      await item.focus();
      await t.page.keyboard.press('ArrowRight');
      const keyed = await f.waitForFunction(s => __shelf.keys().includes(s) && __shelf.key(document.activeElement.closest('[role="menu"]') || document.body) === s, sub, { timeout: 3000 }).then(() => true, () => false);
      await t.check(`${btag} opens on ArrowRight with focus inside`, keyed, JSON.stringify({ blocked: await f.evaluate(() => window.__blockedBranch || 0) }), { hard: true });
      await t.page.keyboard.press('ArrowLeft');
      const back = await f.waitForFunction(([s, i]) => !__shelf.keys().includes(s) && document.activeElement?.getAttribute('data-shelf-branch') === String(i), [sub, i], { timeout: 3000 }).then(() => true, () => false);
      await t.check(`${btag} closes on ArrowLeft and returns focus`, back, '', { hard: true });
      opened.add(sub);
      branchRows.push({ menu: key, label, sub });
    }
  };
  // --set only=<panel ids> walks just those panels (focused sabotage and debugging); the floors then fail by design.
  const only = t.args.only ? String(t.args.only).split(',') : null;
  for (const target of targets) {
    if (only && !only.includes(target)) continue;
    current = target;
    const icon=f.locator(`#activityBar .icon[data-target="${target}"]`);await icon.click();await f.waitForTimeout(500);
    // Clicking the already selected Files icon folds its panel; a second click opens it.
    if(!await f.locator('#sidePanelSlot').isVisible())await icon.click();
    const active = await f.evaluate(target => ({
      panel: document.querySelector('#sidePanelSlot > .side-panel-view.active')?.id,
      icon: document.querySelector('#activityBar .icon.active[data-target]')?.dataset.target,
      blockedDocker: window.__blockedDocker || 0
    }), target);
    await t.check(target+' requested panel active', active.panel === target && active.icon === target,
      JSON.stringify(active), {hard:true});
    await t.visible('#sidePanelSlot',target+' rail surface opened');
    await f.waitForTimeout(500);
    const ids=await f.evaluate(()=>[...document.querySelectorAll('#sidePanelSlot .sh-shelf .pm6-tb-menu-wrap')].flatMap((w,i)=>{
      const e=w.querySelector('.pm6-tb-menu-trigger'),m=w.querySelector('.pm6-tb-menu,.pm6-chat-more-menu');
      const r=e?.getBoundingClientRect(),hit=r&&document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
      w.setAttribute('data-shelf-case',String(i));
      return r?.width&&r.height&&hit&&(hit===e||e.contains(hit))&&m?[i]:[];
    }));rows.push({target,reachable:ids.length});
    await t.check(target+' expected shelf menu census', Object.hasOwn(expected,target) && ids.length === expected[target],
      JSON.stringify({expected:expected[target],actual:ids.length}), {hard:true});
    for(const id of ids){
      const trigger=f.locator(`[data-shelf-case="${id}"] .pm6-tb-menu-trigger`);
      await trigger.click();
      await t.check(target+' shelf '+id+' opens its menu',await trigger.getAttribute('aria-expanded')==='true','',{hard:true});
      const menu=f.locator('.pmr-menu.is-open');
      await menu.waitFor({state:'visible',timeout:5000});
      await t.check(target+' shelf '+id+' has menu items',await menu.locator('[role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"]').count()>0,'',{hard:true});
      await t.page.keyboard.press('Escape');
      await t.check(target+' shelf '+id+' closes on Escape',await trigger.getAttribute('aria-expanded')==='false','');reached++;
    }
    // Inventory every wrapper PMMenu upgrades, even before its route is visible.
    const panel=f.locator(`#${target}`), exercised=new Set(), inventory=new Set(), popupDone=new Set(), probed=new Set();
    // Reach a control the way a person does: scroll its own scroller with the wheel when it has one.
    const reach = async (loc) => {
      await loc.scrollIntoViewIfNeeded();
      // The wheel goes where the pointer is: a point of the scroller that hit-tests to it (a short panel's sticky
      // footer covers the scroller's centre at 1280x500).
      const scroll = await loc.evaluate(e=>{
        for(let a=e.parentElement;a;a=a.parentElement)if(a.scrollHeight>a.clientHeight && /auto|scroll/.test(getComputedStyle(a).overflowY)) {
          const r=e.getBoundingClientRect(),s=a.getBoundingClientRect(),x=s.x+s.width/2;
          for(let y=s.y+8;y<s.bottom-4;y+=8){const h=document.elementFromPoint(x,y);if(h&&a.contains(h))return {delta:r.y+r.height/2-s.y-s.height/2,x,y};}
          return null;
        }
      });
      if(scroll) {
        await t.page.mouse.move(off.x+scroll.x,off.y+scroll.y);
        await t.page.mouse.wheel(0,scroll.delta);
        await f.waitForTimeout(150);
      }
    };
    // Every popup trigger the panel shows (PMMenu wrappers and the rail skin's own), by mouse and by Enter.
    const popupCensus = async (state) => {
      const cands = await panel.evaluate(p => {
        const hidden = e => { for (let a = e; a; a = a.parentElement) if (getComputedStyle(a).display === 'none') return true; return false; };
        document.querySelectorAll('[data-shelf-pop]').forEach(e => e.removeAttribute('data-shelf-pop'));
        const label = e => (e.getAttribute('aria-label') || e.textContent).trim().replace(/\s+/g, ' ');
        return [...p.querySelectorAll('[aria-haspopup]:not([aria-haspopup="false"])')].filter(e => !e.closest('[role="menu"]')).map((e, i) => {
          e.setAttribute('data-shelf-pop', String(i));
          return { i, controls: e.getAttribute('aria-controls'), sig: [e.tagName, [...e.classList].filter(c => !/^(active|selected|open|on|is-|pmr-cur)/.test(c)).sort().join('.'), e.getAttribute('aria-controls') || label(e)].join('|'),
            hidden: hidden(e), disabled: e.matches(':disabled, [aria-disabled="true"]') };
        });
      });
      for (const c of cands) {
        const dedupe = c.controls || `${state}|${c.sig}`;
        if (c.hidden || c.disabled || popupDone.has(dedupe)) continue;
        popupDone.add(dedupe);
        const trig = panel.locator(`[data-shelf-pop="${c.i}"]`), tag = `${target} ${state} popup ${c.controls || c.sig}`;
        await reach(trig);
        await t.visible(`#${target} [data-shelf-pop="${c.i}"]`, `${tag} reachable`);
        const got = {};
        for (const input of ['mouse', 'enter']) {
          // A wrapper's mouse route is the census above; its keyboard route is new here.
          if (input === 'mouse' && c.controls && exercised.has(c.controls)) continue;
          const before = await f.evaluate(() => __shelf.keys());
          if (input === 'mouse') await trig.click(); else { await trig.focus(); await t.page.keyboard.press('Enter'); }
          const key = await f.waitForFunction(b => __shelf.keys().find(k => !b.includes(k)), before, { timeout: 5000 }).then(h => h.jsonValue(), () => null);
          await t.check(`${tag} opens a menu by ${input}`, !!key, JSON.stringify({ blocked: await f.evaluate(() => window.__blockedPopup || 0) }), { hard: true });
          got[input] = key;
          await assertMenu(key, `${tag} by ${input}`, true, async () => { if (input === 'mouse') await trig.click(); else { await trig.focus(); await t.page.keyboard.press('Enter'); } }, trig);
          if (await trig.getAttribute('aria-expanded') !== null)
            await t.check(`${tag} by ${input} trigger collapsed after Escape`, await trig.getAttribute('aria-expanded') === 'false', '', { hard: true });
        }
        if (got.mouse && got.enter) await t.check(`${tag} mouse and Enter open the same menu`, got.mouse === got.enter, JSON.stringify(got), { hard: true });
        const identity = c.controls || got.mouse || got.enter;
        if (c.controls) opened.add(c.controls);
        popupRows.push({ panel: target, state, sig: c.sig, controls: c.controls, identity, menus: got });
      }
    };
    // Context routes: right-click, Shift+F10 and the Menu key on one of each focusable row kind.
    const contextCensus = async (state, engine, tab) => {
      const cands = await panel.evaluate(p => {
        document.querySelectorAll('[data-shelf-probe]').forEach(e => e.removeAttribute('data-shelf-probe'));
        const sig = e => e.tagName + '.' + [...e.classList].filter(c => !/^(active|selected|open|on|focus|hover|pmr-cur|is-|has-)/.test(c)).sort().join('.') + '[' + (e.getAttribute('role') || '') + ']';
        const seen = new Set(), out = [];
        p.querySelectorAll('[tabindex]:not([tabindex="-1"]), button, a[href], input, select, textarea, summary, [role="treeitem"], [role="row"], [role="option"], [role="listitem"], [role="gridcell"]').forEach(e => {
          if (e.closest('[role="menu"]') || !e.checkVisibility() || !e.getBoundingClientRect().width) return;
          const s = sig(e);
          if (seen.has(s)) return;
          seen.add(s); e.setAttribute('data-shelf-probe', String(out.length)); out.push(s);
        });
        return out;
      });
      for (const [i, sig] of cands.entries()) {
        if (probed.has(`${state}|${sig}`)) continue;
        probed.add(`${state}|${sig}`);
        const row = panel.locator(`[data-shelf-probe="${i}"]`), got = {}, unreachable = [];
        if (!await row.count()) continue;
        await t.page.mouse.move(2, 2);
        // One reach per row kind: into view, and the wheel on its scroller only when its centre is not on top.
        const point = () => row.evaluate(e => {
          const r = e.getBoundingClientRect(), x = r.x + r.width / 2, y = r.y + r.height / 2, h = document.elementFromPoint(x, y);
          return { at: h && (h === e || e.contains(h)) ? { x, y } : null, open: __shelf.keys() };
        });
        await row.scrollIntoViewIfNeeded();
        let p = await point();
        if (!p.at) { await reach(row); p = await point(); }
        await t.check(`${target} ${state} no menu open before probing ${sig}`, !p.open.length, JSON.stringify(p.open), { hard: true });
        for (const input of INPUTS) {
          if (input === 'mouse') {
            if (!p.at) { unreachable.push(input); continue; }
            await t.page.mouse.click(off.x + p.at.x, off.y + p.at.y, { button: 'right' });
          } else { await row.focus(); await t.page.keyboard.press(KEY[input]); }
          const key = await f.evaluate(async () => { await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); return __shelf.keys()[0] || null; });
          if (!key) continue;
          got[input] = key;
          const tag = `${target} ${state} context ${key} by ${input} on ${sig}`;
          contextRoutes.push({ panel: target, engine, tab, sig, input, menu: key });
          // Branches once per pane, input and menu; every route still asserts open, items and Escape.
          const once = `${state}|${input}|${key}`;
          await assertMenu(key, tag, !branchDone.has(once), async () => {
            if (input === 'mouse') await t.page.mouse.click(off.x + p.at.x, off.y + p.at.y, { button: 'right' });
            else { await row.focus(); await t.page.keyboard.press(KEY[input]); }
          }, row);
          branchDone.add(once);
        }
        const menus = INPUTS.map(input => got[input] || null);
        if (menus.some(Boolean)) await t.check(`${target} ${state} context menu on ${sig} opens by every input`, menus.every(m => m === menus.find(Boolean)),
          JSON.stringify({ got, unreachable, blocked: await f.evaluate(() => window.__blockedContext || 0) }), { hard: true });
      }
    };
    // Source Control offers an engine switch; walk each engine it offers, then restore the first.
    const engines = await panel.locator('[data-pm7-scm-engine]').evaluateAll(es => es.filter(e => e.checkVisibility()).map(e => e.dataset.pm7ScmEngine));
    const tabsSeen = [];
    for (const engine of (engines.length ? engines : [null])) {
    if (engine !== null) {
      const sw = panel.locator(`[data-pm7-scm-engine="${engine}"]`);
      await sw.click();
      await t.check(`${target} engine ${engine} selected`, await panel.evaluate((p, en) => p.dataset.scmEngine === en, engine), '', { hard: true });
      await f.waitForTimeout(400);
    }
    const tabs=await panel.locator('[role="tab"]').evaluateAll(es=>{
      document.querySelectorAll('[data-shelf-tab]').forEach(e=>e.removeAttribute('data-shelf-tab'));
      return es.filter(e=>e.checkVisibility()).map((e,i)=>{e.setAttribute('data-shelf-tab',String(i));return e.dataset.tab||e.dataset.jjTab||e.textContent.trim();});
    });
    tabsSeen.push(...tabs.map(tab => engine ? `${engine}:${tab}` : tab));
    for (const [ti, tab] of [[null,null],...tabs.entries()]) {
      const state = [engine, tab].filter(Boolean).join(' ') || 'panel';
      if(tab!==null) {
        const control=panel.locator(`[data-shelf-tab="${ti}"]`);
        await control.click();
        await t.check(`${target} ${engine ? engine + ' ' : ''}tab ${tab} active`,await control.evaluate(e=>e.classList.contains('active')||e.getAttribute('aria-selected')==='true'),'',{hard:true});
      }
      // Stable handles: the set of collapsed accordions shrinks after each click.
      const heads=await panel.locator('[data-acc] > [data-collapse]').elementHandles();
      for (let pass=0;pass<20;pass++) {
        let opened=false;
        for(const head of heads) if(await head.isVisible() && !await head.evaluate(e=>e.closest('[data-acc]').classList.contains('open'))) {
          // Centre it in its own scroller with the wheel: at the scroller's edge a short panel's sticky
          // footer (Source Control's Publish card at 1280x500) covers it.
          await reach(head); await head.click({position:{x:8,y:8}});
          await t.check(`${target} displayed accordion expanded`,await head.evaluate(e=>e.closest('[data-acc]').classList.contains('open')),'',{hard:true});
          opened=true;
        }
        if(!opened)break;
        await t.check(`${target} accordion traversal bounded`,pass<19,'',{hard:true});
      }
      for(const head of heads)await head.dispose();
      const discover = async () => panel.locator(selectors.wrap).evaluateAll((ws,sel)=>ws.map((w,i)=>{
        const e=w.querySelector(sel);
        if(!e)return null;
        e.setAttribute('data-shelf-route',String(i));
        return {key:e.getAttribute('aria-controls'),index:i};
      }).filter(Boolean),selectors.trigger);
      const exercise = async () => {
        const candidates=await discover();
        await t.check(`${target} shelf trigger identities unique`,new Set(candidates.map(c=>c.key)).size===candidates.length,JSON.stringify(candidates),{hard:true});
        for(const c of candidates) {
          await t.check(`${target} trigger ${c.index} has stable menu identity`,!!c.key,'',{hard:true});
          inventory.add(c.key);
          const trigger=panel.locator(`[data-shelf-route="${c.index}"]`);
          if(exercised.has(c.key))continue;
          // Offscreen content can be skipped by content-visibility. Only an actual
          // hidden route excludes it; scroll into it before testing reachability.
          if(await trigger.evaluate(e=>{
            for(let a=e;a;a=a.parentElement)if(getComputedStyle(a).display==='none')return true;
            return false;
          }))continue;
          await reach(trigger);
          await t.visible(`#${target} [data-shelf-route="${c.index}"]`,`${target} ${c.key} reachable`);
          await trigger.click();
          await t.check(`${target} ${c.key} opens its menu`,await trigger.getAttribute('aria-expanded')==='true',
            JSON.stringify({blocked:t.args.blockMenu||null,hits:await f.evaluate(()=>window.__blockedShelfMenu||0)}),{hard:true});
          const menu=f.locator('.pmr-menu.is-open');
          await menu.waitFor({state:'visible',timeout:5000});
          await t.check(`${target} ${c.key} has menu items`,await menu.locator('[role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"]').count()>0,'',{hard:true});
          await t.page.keyboard.press('Escape');
          await t.check(`${target} ${c.key} closes on Escape`,await trigger.getAttribute('aria-expanded')==='false','',{hard:true});
          await menu.waitFor({state:'hidden',timeout:5000});
          await t.check(`${target} ${c.key} Escape closes the menu and leaves the side panel open`,await f.locator('#sidePanelSlot').isVisible(),'',{hard:true});
          await secondEscape(`${target} ${c.key}`);
          exercised.add(c.key);
          if(c.key==='rdCfgMenu' && !await panel.locator('#rdAddForm').isVisible()) {
            // Enter this branch while the launch selector is still in view;
            // later shelf scrolling must not race the menu's scroll-close owner.
            await trigger.click();
            await t.check('launch selector reopens for Add Configuration',await trigger.getAttribute('aria-expanded')==='true','',{hard:true});
            await menu.waitFor({state:'visible',timeout:5000});
            await menu.getByRole('menuitem',{name:/Add Configuration/}).click();
            // FO-84b: a pick closes the menu, not the side panel (the folded rail's overlay included).
            const kept = await f.locator('#sidePanelSlot').isVisible();
            await t.check('Run Add Configuration pick closes the menu and leaves the side panel open', kept, kept ? '' : 'the side panel closed on the pick', { hard: true });
            await t.check('Run Add Configuration reveals debugger selector',await panel.locator('#rdAddForm').isVisible(),'',{hard:true});
          }
        }
      };
      await exercise();
      // The panel's first state is one of its tabs; census each tab once.
      if (tab !== null || !tabs.length) { await popupCensus(state); await contextCensus(state, engine, tab); }
    }
    }
    if (engines.length > 1) {
      await panel.locator(`[data-pm7-scm-engine="${engines[0]}"]`).click();
      await t.check(`${target} engine ${engines[0]} restored`, await panel.evaluate((p, en) => p.dataset.scmEngine === en, engines[0]), '', { hard: true });
    }
    const row={target,tabs:tabsSeen,inventory:[...inventory],exercised:[...exercised],popups:popupRows.filter(r=>r.panel===target).map(r=>r.identity),context:contextRoutes.filter(r=>r.panel===target).length};routedRows.push(row);
    exercised.forEach(k => opened.add(k));
    await t.check(target+' routed shelf census',expectedRouted[target].every(k=>inventory.has(k)),JSON.stringify(row),{hard:true});
    await t.check(target+' complete shelf menu inventory exercised',inventory.size===exercised.size&&[...inventory].every(k=>exercised.has(k)),JSON.stringify(row),{hard:true});
    await t.check(target+' popup menu floor', (expectedPopups[target] || []).every(k => row.popups.includes(k)), JSON.stringify({ floor: expectedPopups[target] || [], popups: row.popups }), { hard: true });
    for (const tab of expectedContext[target] || []) {
      const inputs = new Set(contextRoutes.filter(r => r.panel === target && r.tab === tab).map(r => r.input));
      await t.check(`${target} ${tab} context menu reached by every input`, INPUTS.every(i => inputs.has(i)),
        JSON.stringify({ inputs: [...inputs], blocked: await f.evaluate(() => window.__blockedContext || 0) }), { hard: true });
    }
  }
  // FO-84b: the menus' exemption is theirs alone; a click outside the panel and its menus still closes the folded overlay.
  if (await f.evaluate(() => !!document.querySelector('[data-pmw-rail-peek]'))) {
    const out = await f.evaluate(() => {
      const panel = document.querySelector('.left-panel');
      for (let x = innerWidth - 24; x > innerWidth / 2; x -= 24) for (let y = innerHeight / 2; y < innerHeight - 24; y += 24) {
        const h = document.elementFromPoint(x, y);
        if (h && !panel.contains(h) && !h.closest('[role="menu"], [role="dialog"], button, a, input, textarea, [contenteditable]')) return { x, y, on: h.tagName + '.' + h.className };
      }
      return null;
    });
    await t.check('a plain point outside the side panel exists', !!out, '', { hard: true });
    await t.page.mouse.click(off.x + out.x, off.y + out.y);
    await t.check("a click outside the side panel and its menus closes the folded rail's overlay", await f.locator('#sidePanelSlot').isHidden(), JSON.stringify(out), { hard: true });
  }
  await t.check('at least 14 known PMMenu identities exercised',new Set(routedRows.flatMap(r=>r.exercised)).size>=14,JSON.stringify(routedRows),{hard:true});
  t.log(JSON.stringify({initial:rows,routed:routedRows,popups:popupRows,context:contextRoutes,branches:branchRows}));
  if(t.args.blockMenu) await t.check('capture blocker intercepted requested menu',await f.evaluate(()=>window.__blockedShelfMenu)>0,t.args.blockMenu,{hard:true});
  await t.check('workflow Ref route exercised',routedRows.find(r=>r.target==='panel-git')?.exercised.includes('shDispRefCI'),'',{hard:true});
  await t.check('all rail targets inspected and reachable shelf menus exercised',targets.length===Object.keys(expected).length&&reached===Object.values(expected).reduce((a,b)=>a+b,0),JSON.stringify({reached,rows}));
  // Completeness against the authored census, plus floors for what only a route can show.
  const missing = authored.filter(m => !opened.has(m.key)).map(m => m.key);
  await t.check('every authored side-panel menu opened by a real route', !missing.length, JSON.stringify({ missing, opened: [...opened] }));
  const routes = new Set(contextRoutes.map(r => [r.panel, r.engine, r.tab, r.input].join('|')));
  await t.check('at least 9 context-menu routes exercised', routes.size >= 9, JSON.stringify([...routes]));
  await t.check('at least 2 nested menu branches exercised', new Set(branchRows.map(b => b.sub)).size >= 2, JSON.stringify(branchRows));
  await t.check('at least 6 popup menus beyond the PMMenu wrappers exercised', new Set(popupRows.filter(r => !r.controls).map(r => r.identity)).size >= 6, JSON.stringify(popupRows));
  for (const [arg, hits] of [['blockContext', '__blockedContext'], ['blockPopup', '__blockedPopup'], ['blockBranch', '__blockedBranch']])
    if (t.args[arg]) await t.check(`capture blocker ${arg} intercepted input`, await f.evaluate(h => window[h] || 0, hits) > 0, String(t.args[arg]));
  await f.evaluate(()=>document.querySelectorAll('[data-shelf-case],[data-shelf-route],[data-shelf-pop],[data-shelf-probe],[data-shelf-tab],[data-shelf-branch],[data-shelf-pick]').forEach(e=>{for(const a of ['data-shelf-case','data-shelf-route','data-shelf-pop','data-shelf-probe','data-shelf-tab','data-shelf-branch'])e.removeAttribute(a);}));
}
