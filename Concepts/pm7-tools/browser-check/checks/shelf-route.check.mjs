// SW-42: inventory every shelf menu, including real panel tabs and expanders.
// Beyond the PMMenu wrappers: every authored side-panel menu (read from the page file, so a
// menu the shell portals to <body>, such as File actions, still counts), every popup trigger
// (aria-haspopup, by mouse, Enter, Space and ArrowDown), every context-menu route (found by real
// right-click, Shift+F10 and the Menu key on each focusable row kind, file and folder rows apart;
// a route kind that opened a menu holds every row kind beside it and a later walk to it), and
// every nested branch (hover and ArrowRight/ArrowLeft). Source Control is walked in each engine
// its switch offers.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const INPUTS = ['mouse', 'shift-f10', 'menu-key'];
const KEY = { 'shift-f10': 'Shift+F10', 'menu-key': 'ContextMenu' };
// A popup trigger opens by every way the owners wire it: a press, and Enter, Space and ArrowDown on the focused trigger.
const POPUP_INPUTS = ['mouse', 'enter', 'space', 'arrowdown'];
const PKEY = { enter: 'Enter', space: ' ', arrowdown: 'ArrowDown' };

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

// T55: the rail's reveal of an opened expander (30-motion.js revealInView, 15-jj.js's expander): its delay after the
// click's frame, and the longest its smooth scroll may take to end once begun (a stated bound, failing by name)
const REVEAL_MS = 120, REVEAL_END_MS = 2000;
// T98: past the rail's delay, how long the wait gives the rail's own path to its request: the rail sets its 120 ms timer
// in an animation frame after the click (30-motion.js onClickMotion), so the request comes one frame and the timer's
// lateness after the delay; on Windows' fast frames three frames were 23 ms, and the request came at 149 ms
const REVEAL_MARGIN_MS = 80;
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
  // --set blockPopupInput=mouse|enter|space|arrowdown|keys narrows it to one input (keys: all three keys),
  // --set blockPopupText=<text> to triggers whose text has it.
  if (t.args.blockPopup) await t.page.addInitScript(([sel, input, text]) => {
    window.__blockedPopup = 0;
    const hit = e => { const trig = e.target.closest?.(sel); return !!trig?.closest('#sidePanelSlot') && (!text || trig.textContent.includes(text)); };
    const stop = e => { window.__blockedPopup++; e.preventDefault(); e.stopImmediatePropagation(); };
    const keys = { enter: ['Enter'], space: [' '], arrowdown: ['ArrowDown'], keys: ['Enter', ' ', 'ArrowDown'], '*': ['Enter', ' ', 'ArrowDown'] }[input] || [];
    if (input === '*' || input === 'mouse') window.addEventListener('click', e => { if (e.detail > 0 && hit(e)) stop(e); }, true);
    if (keys.length) window.addEventListener('keydown', e => { if (keys.includes(e.key) && hit(e)) stop(e); }, true);
  }, [String(t.args.blockPopup), String(t.args.blockPopupInput || '*'), String(t.args.blockPopupText || '')]);
  // Sabotage: --set blockContextOn=<css selector> stops every context input (right-click, Shift+F10, the Menu key and the
  // contextmenu a key raises) on side-panel rows matching the selector, before any owner listener sees it.
  if (t.args.blockContextOn) await t.page.addInitScript(sel => {
    window.__blockedContextOn = 0;
    const hit = e => !!e.target.closest?.('#sidePanelSlot') && !!e.target.closest?.(sel);
    const stop = e => { window.__blockedContextOn++; e.preventDefault(); e.stopImmediatePropagation(); };
    window.addEventListener('contextmenu', e => { if (hit(e)) stop(e); }, true);
    window.addEventListener('keydown', e => { if (((e.key === 'F10' && e.shiftKey) || e.key === 'ContextMenu') && hit(e)) stop(e); }, true);
  }, String(t.args.blockContextOn));
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
  // --set inputs=<shift-f10,menu-key,...> probes only those context inputs (to isolate FO-93 on a base; the floors then fail by design)
  const CTX_INPUTS = t.args.inputs ? String(t.args.inputs).split(',') : INPUTS;
  await t.viewport(Number(t.args.width || 1920),Number(t.args.height || 1080)); const f = await t.app.open();
  if(t.args.look) await t.app.look(t.args.look);
  const fe = f === t.page.mainFrame() ? null : await f.frameElement(), off = fe ? await fe.boundingBox() : { x: 0, y: 0 };
  // Where the pointer rests between steps: off the side panel and its menus, on a point with no hover affordance (at the
  // window's corner a tooltip came up over Files' branch trigger at 740x768), read from the page each time; (2, 2) if none.
  const restPointer = async () => {
    const p = await f.evaluate(() => {
      const slot = document.getElementById('sidePanelSlot');
      const busy = h => !h || (slot && slot.contains(h)) || !!h.closest('[role="menu"], [role="dialog"], [role="tooltip"], button, a, input, textarea, select, summary, [contenteditable], [title], [role="button"], [role="tab"], [data-pm-hover-label], [data-pm-hover-kind], [aria-describedby]');
      for (const fx of [0.98, 0.9, 0.75, 0.6]) for (let y = innerHeight * 0.45; y < innerHeight - 30; y += 16) {
        const x = Math.round(innerWidth * fx), h = document.elementFromPoint(x, y);
        if (!busy(h)) return { x, y: Math.round(y) };
      }
      return { x: 2, y: 2 };
    });
    await t.page.mouse.move(off.x + p.x, off.y + p.y);
  };
  // Test-only readers: which menus are open, and a stable key for each (id, PMR id, or parent › label).
  await f.evaluate(() => {
    const key = m => { const up = m.parentElement && m.parentElement.closest('[role="menu"]'); return m.id || m.dataset.pmrMenu || ((up ? key(up) + ' › ' : '') + (m.getAttribute('aria-label') || 'menu')); };
    const open = () => [...document.querySelectorAll('[role="menu"]')].filter(m => m.classList.contains('is-open') && !m.classList.contains('is-closing') && m.checkVisibility());
    // Row kinds for the context census: tag, classes (less state classes) and role, and for a tree's rows file or folder
    // (data-kind, else aria-expanded: a parent or a leaf). box: the nearest tree, grid, list or listbox, else the parent.
    const cls = e => [...e.classList].filter(c => !/^(active|selected|open|on|focus|hover|pmr-cur|is-|has-)/.test(c)).sort();
    const kind = e => e.hasAttribute('data-kind') ? (e.dataset.kind === 'folder' ? 'folder' : 'file') : e.getAttribute('role') === 'treeitem' ? (e.hasAttribute('aria-expanded') ? 'parent' : 'leaf') : '';
    const sig = e => e.tagName + '.' + cls(e).join('.') + '[' + (e.getAttribute('role') || '') + ']' + (kind(e) ? '{' + kind(e) + '}' : '');
    const box = e => { const q = (e.parentElement && e.parentElement.closest('[role="tree"],[role="treegrid"],[role="grid"],[role="listbox"],[role="list"],[role="table"]')) || e.parentElement;
      return q ? q.tagName + '.' + cls(q).join('.') + (q.id ? '#' + q.id : '') : ''; };
    const rows = p => [...p.querySelectorAll('[tabindex]:not([tabindex="-1"]), button, a[href], input, select, textarea, summary, [role="treeitem"], [role="row"], [role="option"], [role="listitem"], [role="gridcell"]')]
      .filter(e => !e.closest('[role="menu"]') && e.checkVisibility() && e.getBoundingClientRect().width);
    window.__shelf = { key, open, keys: () => open().map(key), cls, sig, box, rows };
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
  // T98: the seed of the later walk's middle-row draw (--set seed=<n> replays a run's draw)
  const shelfSeed = t.args.seed !== undefined ? Number(t.args.seed) >>> 0 : Math.floor(Math.random() * 2 ** 31);
  t.log(`shelf-route seed ${shelfSeed} (the later walk's middle rows; --set seed=${shelfSeed} replays it)`);
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
  // (data-demo-action / data-command-id), else (a plain list of choices) its first enabled item; never an item that
  // opens something in the centre. Before it, a disabled item and a branch parent must not close the menu. Then the menu opens again by its route and Enter on the same
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
        || own.find(it => it.hasAttribute('data-demo-action') || it.hasAttribute('data-command-id')) || own[0];
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
  // FO-93: a context menu opened by a key (PMMenu.openAt) takes the focus and is worked by keys alone: the first enabled
  // item has the focus; ArrowDown reaches every item and wraps, ArrowUp wraps back, Home and End go to the ends; each
  // branch opens by ArrowRight and by Enter with the focus on its first item, its items are walked the same way, and
  // Escape closes only the branch, back on its item; Enter activates an item (the same item a pick would choose) and
  // closes the menu; Escape closes the menu; both give the focus back to the row that opened it.
  const kbMark = (k) => f.evaluate(k => {
    document.querySelectorAll('[data-shelf-kb]').forEach(e => e.removeAttribute('data-shelf-kb'));
    const m = __shelf.open().find(x => __shelf.key(x) === k);
    if (!m) return null;
    const items = [...m.querySelectorAll('[role="menuitem"]')].filter(it => it.closest('[role="menu"]') === m && !it.hasAttribute('disabled') && it.getClientRects().length);
    items.forEach((it, i) => it.setAttribute('data-shelf-kb', String(i)));
    const off = it => it.getAttribute('aria-disabled') === 'true';
    const enabled = items.map((it, i) => off(it) ? -1 : i).filter(i => i >= 0);
    const plain = items.map((it, i) => !off(it) && !it.hasAttribute('aria-haspopup') ? i : -1).filter(i => i >= 0);
    const pick = plain.find(i => ['aria-checked', 'aria-selected'].some(a => items[i].getAttribute(a) === 'true') || items[i].classList.contains('active') || items[i].classList.contains('is-selected'))
      ?? plain.find(i => items[i].hasAttribute('data-demo-action') || items[i].hasAttribute('data-command-id')) ?? plain[0] ?? null;
    const label = it => it.textContent.trim().replace(/\s+/g, ' ');
    return { n: items.length, first: enabled[0] ?? null, pick, pickLabel: pick === null ? null : label(items[pick]),
      branches: items.map((it, i) => it.hasAttribute('aria-haspopup') && !off(it) ? { i, label: label(it) } : null).filter(Boolean) };
  }, k);
  const kbAt = (k) => f.evaluate(k => {
    const m = __shelf.open().find(x => __shelf.key(x) === k), a = document.activeElement, am = a && a.closest && a.closest('[role="menu"]');
    return { open: !!m, inMenu: !!m && !!a && m.contains(a), kb: a && a.getAttribute ? a.getAttribute('data-shelf-kb') : null,
      kbs: a && a.getAttribute ? a.getAttribute('data-shelf-kbs') : null, branch: am && m && am !== m ? __shelf.key(am) : null,
      origin: !!(a && a.hasAttribute && a.hasAttribute('data-shelf-origin')), openBranches: m ? [...m.querySelectorAll('[role="menu"]')].filter(x => x.classList.contains('is-open') && x.checkVisibility()).length : 0 };
  }, k);
  const press = async (keyName) => { await t.page.keyboard.press(keyName); return kbAt(lastKbKey); };
  let lastKbKey = null;
  const keyboardMenu = async (key, tag, origin, reopen) => {
    lastKbKey = key;
    const T = `${tag} FO-93`;
    let mk = await kbMark(key), at = await kbAt(key);
    await t.check(`${T} keyboard open puts the focus on the first enabled item`, at.inMenu && at.kb === String(mk.first), JSON.stringify({ at, first: mk.first }), { hard: true });
    const seen = new Set([at.kb]);
    for (let s = 0; s < mk.n; s++) seen.add((await press('ArrowDown')).kb);
    at = await kbAt(key);
    await t.check(`${T} ArrowDown reaches every item (${mk.n}) and wraps`, seen.size === mk.n && [...Array(mk.n).keys()].every(i => seen.has(String(i))) && at.kb === String(mk.first),
      JSON.stringify({ seen: [...seen], n: mk.n, back: at.kb }), { hard: true });
    at = await press('Home'); await t.check(`${T} Home goes to the first item`, at.kb === '0', JSON.stringify(at), { hard: true });
    at = await press('ArrowUp'); await t.check(`${T} ArrowUp from the first item wraps to the last`, at.kb === String(mk.n - 1), JSON.stringify(at), { hard: true });
    at = await press('Home'); at = await press('End'); await t.check(`${T} End goes to the last item`, at.kb === String(mk.n - 1), JSON.stringify(at), { hard: true });
    for (const br of mk.branches) {
      const toBranch = async () => { await press('Home'); for (let s = 0; s < br.i; s++) await press('ArrowDown'); return kbAt(key); };
      at = await toBranch();
      await t.check(`${T} keys reach the branch item ${br.label}`, at.kb === String(br.i), JSON.stringify(at), { hard: true });
      for (const how of ['ArrowRight', 'Enter']) {
        at = await press(how);
        await t.check(`${T} ${how} on ${br.label} opens the branch with the focus inside`, at.inMenu && !!at.branch, JSON.stringify(at), { hard: true });
        const sub = await f.evaluate(() => { const am = document.activeElement.closest('[role="menu"]');
          const its = [...am.querySelectorAll('[role="menuitem"]')].filter(it => it.closest('[role="menu"]') === am && !it.hasAttribute('disabled') && it.getClientRects().length);
          document.querySelectorAll('[data-shelf-kbs]').forEach(e => e.removeAttribute('data-shelf-kbs')); its.forEach((it, i) => it.setAttribute('data-shelf-kbs', String(i)));
          return { n: its.length, at: its.indexOf(document.activeElement) }; });
        const subSeen = new Set([String(sub.at)]);
        for (let s = 0; s < sub.n; s++) subSeen.add((await press('ArrowDown')).kbs);
        await t.check(`${T} ${br.label}: ArrowDown reaches every branch item (${sub.n}) and wraps`, sub.at === 0 && subSeen.size === sub.n, JSON.stringify({ sub, seen: [...subSeen] }), { hard: true });
        at = await press('Escape');
        await t.check(`${T} Escape in ${br.label} closes only the branch, back on its item`, at.open && at.kb === String(br.i) && !at.branch && at.openBranches === 0, JSON.stringify(at), { hard: true });
      }
    }
    await origin.evaluate(e => e.setAttribute('data-shelf-origin', ''));
    at = await press('Escape');
    const closed = await f.waitForFunction(k => !__shelf.keys().includes(k), key, { timeout: 5000 }).then(() => true, () => false);
    at = await kbAt(key);
    await t.check(`${T} Escape closes the menu and gives the focus back to the row`, closed && at.origin, JSON.stringify(at), { hard: true });
    if (mk.pick === null) return;
    await reopen();
    await f.waitForFunction(k => __shelf.keys().includes(k), key, { timeout: 5000 }).catch(() => {});
    mk = await kbMark(key);
    await press('Home');
    for (let s = 0; s < mk.pick; s++) await press('ArrowDown');
    at = await kbAt(key);
    await t.check(`${T} keys reach ${mk.pickLabel}`, at.kb === String(mk.pick), JSON.stringify(at), { hard: true });
    await f.evaluate(() => { window.__shelfKbClick = null; window.addEventListener('click', e => { const it = e.target.closest && e.target.closest('[data-shelf-kb]'); window.__shelfKbClick = it ? it.getAttribute('data-shelf-kb') : 'elsewhere'; }, { capture: true, once: true }); });
    await t.page.keyboard.press('Enter');
    const shut = await f.waitForFunction(k => !__shelf.keys().includes(k), key, { timeout: 5000 }).then(() => true, () => false);
    const act = await f.evaluate(() => window.__shelfKbClick);
    at = await kbAt(key);
    await t.check(`${T} Enter on ${mk.pickLabel} activates it, closes the menu and gives the focus back to the row`, act === String(mk.pick) && shut && at.origin && await f.locator('#sidePanelSlot').isVisible(),
      JSON.stringify({ activated: act, closed: shut, at }), { hard: true });
    await f.evaluate(() => document.querySelectorAll('[data-shelf-kb],[data-shelf-kbs],[data-shelf-origin]').forEach(e => { e.removeAttribute('data-shelf-kb'); e.removeAttribute('data-shelf-kbs'); e.removeAttribute('data-shelf-origin'); }));
  };
  const kbDone = new Set();
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
    const markRest = () => f.evaluate(k => {
      const m = __shelf.open().find(x => __shelf.key(x) === k);
      const plain = m && [...m.querySelectorAll('[role^="menuitem"]:not([aria-haspopup])')].find(it => it.closest('[role="menu"]') === m && it.checkVisibility());
      plain?.setAttribute('data-shelf-branch-rest', '');
    }, key);
    const strays = () => f.evaluate(k => {
      const m = __shelf.open().find(x => __shelf.key(x) === k);
      return m ? __shelf.open().filter(x => x !== m && m.contains(x)).map(__shelf.key) : [];
    }, key);
    for (const [i, label] of items.entries()) {
      const item = f.locator(`[data-shelf-branch="${i}"]`), btag = `${tag} branch ${label}`;
      // The pointer goes off the menu first. A menu opened by a key can appear under the pointer a previous step left
      // there, and a branch opens under it on its own; pointing at a plain item must close that branch, as a person's
      // next move would, before the hover below can show its branch opening.
      await restPointer();
      const stray = await strays();
      if (stray.length) {
        await markRest();
        if (await rest.count()) await rest.hover();
        const gone = await f.waitForFunction(s => !__shelf.keys().some(k => s.includes(k)), stray, { timeout: 3000 }).then(() => true, () => false);
        await t.check(`${tag} a branch the resting pointer opened (${stray.join(', ')}) closes when the pointer moves on`, gone, '', { hard: true });
        await f.evaluate(() => document.querySelectorAll('[data-shelf-branch-rest]').forEach(e => e.removeAttribute('data-shelf-branch-rest')));
        await restPointer();
      }
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
      await markRest();
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
    const panel=f.locator(`#${target}`), exercised=new Set(), inventory=new Set(), popupDone=new Set(), probed=new Set(), revealLog=[];
    // Reach a control the way a person does: scroll its own scroller with the wheel when it has one.
    // Reach a control the way a person does, and return where to press it. A short panel's scroller can be mostly
    // under its sticky strips (Source Control at 1280x500: a 56 px scroller whose top 40 px lie under the tab strip),
    // so when the press point is not on top, the wheel (over the scroller, at a point that hit-tests to it) moves the
    // press point into the band of the scroller that is exposed. at: the press point inside the element (default: centre).
    // Stable first, as Playwright's own click waits: the same box on two frames running (an accordion above may still
    // be opening), at most 1.5 s.
    const stable = (loc) => loc.evaluate(e => new Promise(res => {
      const t0 = performance.now(); let last = '', same = 0;
      const tick = () => { const r = e.getBoundingClientRect(), k = [r.x, r.y, r.width, r.height].join();
        same = k === last ? same + 1 : 0; last = k; if (same >= 2 || performance.now() - t0 > 1500) res(); else requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }));
    // A control the census must press that is still covered where it is pressed, or shows fewer than 3 of t.visible's
    // 5 points (Source Control's list under its tab strip and Publish card at 1280x500, whatever the fonts make of the
    // exposed band), makes room first: the panel's expanded regions outside its scrollers fold (makeRoom), and the
    // control is reached again.
    let roomState = 'panel', folding = false;
    // T98 (TOOLBATCH4 recheck b, finding 11): a fold is temporary. makeRoom folds a region only for the covered control
    // it was asked for; the region is unfolded again (a real press on its fold control) before every census enumeration
    // (the disclosures, each state's accordion heads, the inventory, popup and context censuses, the later walk), before
    // an engine switch, and whenever a control to reach lies inside it. So every control the fold hid is enumerated and
    // pressed with the panel in its own layout (at 1280x500 the Jujutsu card's Technical details head and row, which the
    // census skipped at that size while the card stayed folded), and unfolding must show again every census control the
    // fold hid (popup triggers, rows with a context route, accordion heads and disclosures; by element), or fails by name.
    const foldedRegions = [];
    const unfold = async (fr, why) => {
      if (!fr.folded) return false;
      const ctl = panel.locator(`[data-shelf-fold-of="${fr.tag}"]`);
      const st = await ctl.evaluate(e => ({ shown: e.isConnected && e.checkVisibility(), expanded: e.getAttribute('aria-expanded') })).catch(() => null);
      if (!st || st.expanded !== 'false') { fr.folded = false; return false; }
      if (!st.shown) return false;      /* (its engine is not shown now: it is unfolded when that engine is) */
      // (the previous accordion reveal is judged and its watch closed first, so a scroll the product asks for as the
      // region unfolds is not counted against that reveal's wait)
      const late = await f.evaluate(() => { const W = window.__shelfReveal; if (!W || !W.done) return null;
        const late = W.scs.filter(s => s.asked > W.done).map(s => ({ el: s.el.className.toString().slice(0, 40), asked: Math.round(s.asked - W.clickAt), scrolled: s.scrolled ? Math.round(s.scrolled - W.clickAt) : null, waitReturned: Math.round(W.done - W.clickAt) }));
        for (const u of W.undo) u(); W.undo = []; window.__shelfReveal = null; return late; });
      if (late) await t.check(`${target} accordion reveal: the previous wait returned after the rail's own reveal began`, !late.length, JSON.stringify(late), { hard: true });
      const was = folding; folding = true;
      try { const fp = await reach(ctl); await t.page.mouse.click(off.x + fp.x, off.y + fp.y); } finally { folding = was; }
      const ok = await f.waitForFunction(e => e.getAttribute('aria-expanded') === 'true', await ctl.elementHandle(), { timeout: 2000 }).then(() => true, () => false);
      await t.check(`${target} ${why}: pressing the fold control (${fr.label}) unfolds the region folded in ${fr.state} (${fr.region})`, ok, '', { hard: true });
      fr.folded = false;
      const marks = `[data-shelf-fold-ctl^="${fr.tag}:"]`;
      await f.waitForFunction(m => [...document.querySelectorAll(m)].every(e => e.isConnected && e.checkVisibility()), marks, { timeout: 1500 }).catch(() => {});
      const back = new Map((await f.evaluate(m => [...document.querySelectorAll(m)].map(e => [+e.getAttribute('data-shelf-fold-ctl').split(':')[1], e.isConnected && e.checkVisibility()]), marks)));
      const lost = fr.hid.filter(x => !back.get(x.j));
      await t.check(`${target} ${why}: unfolding the region folded in ${fr.state} (${fr.region}) shows again every census control the fold hid`, !lost.length, JSON.stringify({ lost, hid: fr.hid.length }), { hard: true });
      if (fr.hid.length) t.log(`${target} ${why}: unfolded ${fr.region} (folded in ${fr.state} for ${fr.for}); ${fr.hid.length} census control(s) it hid shown again: ${fr.hid.map(x => x.kind + ' ' + x.what).join('; ')}`);
      return true;
    };
    const unfoldAll = async (why) => { for (const fr of foldedRegions) await unfold(fr, why); };
    const unfoldFor = async (loc, why) => {
      if (folding || !foldedRegions.some(fr => fr.folded)) return;
      const tag = await loc.evaluate(e => e.closest('[data-shelf-folded]')?.getAttribute('data-shelf-folded') ?? null).catch(() => null);
      const fr = tag === null ? null : foldedRegions.find(x => x.tag === tag);
      if (fr) await unfold(fr, why);
    };
    const reach = async (loc, at = null) => {
      await unfoldFor(loc, `${roomState} (to reach a control inside it)`);
      // T70 (opus-recheck-kit8 finding C): a failed scroll is no longer swallowed silently. A control that cannot be
      // scrolled to because its side panel (or the folded rail's overlay) closed, or because it is hidden, fails at once
      // and by name; a control the panel's own layout covers still goes on to the wheel and the fold below.
      const scrolled = await loc.scrollIntoViewIfNeeded({ timeout: 3000 }).then(() => null, (e) => String(e && e.message || e).split('\n')[0]);
      // T98 (TOOLBATCH4 recheck b, finding 12): the side panel's own state is checked at every reach, not only after a
      // failed scroll: a panel that closes by fading (opacity 0) or by moving off screen keeps its controls 'visible' to
      // Playwright, so the scroll succeeded and the census went on probing a panel no one could see. The slot and the
      // control's view must paint (display, visibility and opacity, through every ancestor) and lie on screen, and the
      // control must be laid out
      {
        const st = await loc.evaluate(e => { const slot = document.getElementById('sidePanelSlot'), view = e.closest('.side-panel-view'), V = { opacityProperty: true, visibilityProperty: true };
          const onScreen = x => { const r = x.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.right > 0 && r.bottom > 0 && r.left < innerWidth && r.top < innerHeight; };
          /* (the control itself as T70 read it, laid out and not display: none: a row's actions are drawn at opacity 0 until
             the row is hovered, and the press hovers it) */
          return { slot: !!slot && slot.checkVisibility(V) && onScreen(slot), view: !view || (view.checkVisibility(V) && onScreen(view)), shown: e.isConnected && e.checkVisibility(), what: (e.getAttribute('aria-label') || e.textContent || e.className || e.tagName).toString().trim().replace(/\s+/g, ' ').slice(0, 40) }; }).catch(() => ({ slot: false, view: false, shown: false, what: 'detached' }));
        if (scrolled !== null || !(st.slot && st.view && st.shown))
          await t.check(`${target} ${roomState}: the control to reach (${st.what}) is in an open, shown side panel${scrolled !== null ? ' when its scroll fails' : ''}`, st.slot && st.view && st.shown, JSON.stringify({ ...st, scroll: scrolled }), { hard: true });
      }
      let p = null, wheeled = false;
      for (let pass = 0; pass < 3; pass++) {
        await stable(loc);
        p = await loc.evaluate((e, at) => {
          const r = e.getBoundingClientRect(), px = r.x + (at ? at.x : r.width / 2), py = r.y + (at ? at.y : r.height / 2);
          const h0 = document.elementFromPoint(px, py);
          // t.visible's five points (centre and four inset corners, clipped to the viewport): at least three on top.
          const x0 = Math.max(0, r.left), y0 = Math.max(0, r.top), x1 = Math.min(innerWidth, r.right), y1 = Math.min(innerHeight, r.bottom);
          const ix = Math.min(6, (x1 - x0) / 4), iy = Math.min(6, (y1 - y0) / 4), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
          let cover = h0 && !(h0 === e || e.contains(h0)) ? h0 : null;
          const hits = x1 - x0 < 1 || y1 - y0 < 1 ? 0 : [[cx, cy], [x0 + ix, y0 + iy], [x1 - ix, y0 + iy], [x0 + ix, y1 - iy], [x1 - ix, y1 - iy]]
            .filter(([x, y]) => { const h = document.elementFromPoint(x, y), own = !!h && (h === e || e.contains(h)); if (!own && h && !cover) cover = h; return own; }).length;
          // Only the panel's own layout (its strips and cards) asks for room; a tooltip or a menu over the control does not.
          const view = e.closest('.side-panel-view'), coverIn = !!cover && !!view && view.contains(cover);
          // (T69: what covers it and what it covers, for makeRoom to fold only the region holding the cover)
          document.querySelectorAll('[data-shelf-cover], [data-shelf-covered]').forEach(x => { x.removeAttribute('data-shelf-cover'); x.removeAttribute('data-shelf-covered'); });
          if (cover) { cover.setAttribute('data-shelf-cover', ''); e.setAttribute('data-shelf-covered', ''); }
          const coverOf = cover ? cover.tagName + '.' + String(cover.className?.baseVal ?? cover.className).trim().split(/\s+/).slice(0, 2).join('.') : null;
          const what = (e.getAttribute('aria-label') || e.textContent || e.className || e.tagName).toString().trim().replace(/\s+/g, ' ').slice(0, 40);
          if (h0 && (h0 === e || e.contains(h0))) return { x: px, y: py, onTop: true, hits, what, coverIn, coverOf };
          let sc = null;
          for (let a = e.parentElement; a; a = a.parentElement) if (a.scrollHeight > a.clientHeight && /auto|scroll/.test(getComputedStyle(a).overflowY)) { sc = a; break; }
          if (!sc) return { x: px, y: py, onTop: false, hits, what, coverIn, coverOf, hit: h0?.className?.baseVal ?? h0?.className };
          const s = sc.getBoundingClientRect(), x = Math.min(Math.max(px, s.left + 2), s.right - 2);
          let best = null, run = null;
          for (let y = s.top + 1; y < s.bottom - 1; y += 2) {
            const h = document.elementFromPoint(x, y);
            if (h && sc.contains(h)) { run = run || { a: y, b: y }; run.b = y; if (!best || run.b - run.a > best.b - best.a) best = { a: run.a, b: run.b }; } else run = null;
          }
          if (!best) return { x: px, y: py, onTop: false, hits, what, coverIn, coverOf, hit: h0?.className?.baseVal ?? h0?.className };
          const ty = (best.a + best.b) / 2;
          return { x: px, y: py, onTop: false, hits, what, coverIn, coverOf, hit: h0?.className?.baseVal ?? h0?.className, wheel: { x, y: ty, delta: py - ty } };
        }, at);
        if (p.onTop || !p.wheel || Math.abs(p.wheel.delta) < 1) break;
        wheeled = true;
        await t.page.mouse.move(off.x + p.wheel.x, off.y + p.wheel.y);
        await t.page.mouse.wheel(0, p.wheel.delta);
        await f.waitForTimeout(150);
      }
      if ((!p.onTop || p.hits < 3) && p.coverIn && !folding && await makeRoom(roomState, p)) return reach(loc, at);
      return { ...p, wheeled };
    };
    // Press where reach found the control: Playwright's own click (it re-checks the target and retries while the
    // layout still moves) when the point was on top already; a real press at the point when the wheel had to bring
    // it into a scroller's exposed band, where Playwright's actionability check would wait on the strip above it.
    const pressAt = async (loc, p, opts = {}) => {
      if (!p.wheeled && p.onTop) await loc.click(opts.at ? { position: opts.at, button: opts.button } : { button: opts.button });
      else await t.page.mouse.click(off.x + p.x, off.y + p.y, opts.button ? { button: opts.button } : {});
    };
    // FO-84d: every disclosure the panel shows outside its scrollers (button[aria-expanded], not a tab or a popup
    // trigger; Source Control's Publish and review chevron in each engine) folds on one press and unfolds on a second,
    // and Enter and Space on the focused control do the same.
    const disclosures = {};
    // --set disclosures=0 skips this census (to reach later Source Control assertions on a base without FO-84d; the
    // disclosure floor then fails by design)
    const disclosureCensus = async (state) => {
      if (t.args.disclosures === '0') return;
      await unfoldAll(`${state} (before its disclosures)`);
      const ctls = await panel.evaluate(p => {
        document.querySelectorAll('[data-shelf-disc]').forEach(e => e.removeAttribute('data-shelf-disc'));
        const scs = [...p.querySelectorAll('*')].filter(a => a.scrollHeight > a.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(a).overflowY));
        return [...p.querySelectorAll('button[aria-expanded]')].filter(e => e.checkVisibility() && e.getAttribute('role') !== 'tab' && !e.hasAttribute('aria-haspopup') && !scs.some(sc => sc.contains(e)))
          .map((e, i) => { e.setAttribute('data-shelf-disc', String(i)); return { i, label: e.getAttribute('aria-label') || (e.parentElement?.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40) || String(e.className) }; });
      });
      disclosures[state] = ctls.length;
      for (const c of ctls) {
        const ctl = panel.locator(`[data-shelf-disc="${c.i}"]`), was = await ctl.getAttribute('aria-expanded'), flip = was === 'true' ? 'false' : 'true';
        const expect = async (want, how) => {
          const ok = await f.waitForFunction(([e, w]) => e.getAttribute('aria-expanded') === w, [await ctl.elementHandle(), want], { timeout: 2000 }).then(() => true, () => false);
          await t.check(`${target} ${state} disclosure (${c.label}) ${how} sets aria-expanded=${want}`, ok, '', { hard: true });
        };
        await pressAt(ctl, await reach(ctl)); await expect(flip, 'one press');
        await pressAt(ctl, await reach(ctl)); await expect(was, 'a second press');
        await ctl.focus(); await t.page.keyboard.press('Enter'); await expect(flip, 'Enter');
        await t.page.keyboard.press(' '); await expect(was, 'Space');
      }
    };
    // A short window (1280x500) can leave a panel's list scroller almost entirely under its strips and cards (Source
    // Control with Publish and review open exposes about 16 px of list, less or more with the fonts the machine has). When
    // a control the census must press is covered (reach above), fold the panel's expanded regions outside its scrollers
    // as a person would (real presses on aria-expanded="true" controls that are not tabs or popup triggers), assert each
    // fold took, and say which control asked for the room. Returns how many folded; a second call finds none.
    // T69 (opus-recheck-kit8 finding B): only the expanded region that holds what covers the control folds (the nearest
    // ancestor of the expanded control that contains the cover and not the covered control), never every expanded region
    // of the panel; and a fold that hides a popup trigger the census would press fails by name (hard), so nothing the
    // census walks is skipped at this size while it is covered at no other.
    const makeRoom = async (state, why) => {
      folding = true;
      try {
        const folds = await panel.evaluate(p => {
          document.querySelectorAll('[data-shelf-fold]').forEach(e => e.removeAttribute('data-shelf-fold'));
          // The panel's regions outside every scroller (the panel itself counts when it scrolls); never a row of a tree or list.
          const scs = [p, ...p.querySelectorAll('*')].filter(a => a.scrollHeight > a.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(a).overflowY) && a.checkVisibility() && a.clientHeight > 0);
          const cover = document.querySelector('[data-shelf-cover]'), covered = document.querySelector('[data-shelf-covered]');
          document.querySelectorAll('[data-shelf-fold-region]').forEach(e => e.removeAttribute('data-shelf-fold-region'));
          const regionOf = e => { if (!cover) return null; for (let a = e; a && a !== p; a = a.parentElement) if (a.contains(cover) && !(covered && a.contains(covered))) return a; return null; };
          return [...p.querySelectorAll('[aria-expanded="true"]')].filter(e => e.checkVisibility() && !/^(tab|treeitem|row|option|gridcell|listitem)$/.test(e.getAttribute('role') || '') && !e.hasAttribute('aria-haspopup') && !scs.some(sc => sc.contains(e)))
            .map(e => ({ e, region: regionOf(e) })).filter(x => x.region)
            .map(({ e, region }, i) => { e.setAttribute('data-shelf-fold', String(i)); region.setAttribute('data-shelf-fold-region', String(i));
              return { i, label: (e.getAttribute('aria-label') || e.closest('[class]').className || '').toString().slice(0, 60), region: (region.tagName + '.' + String(region.className?.baseVal ?? region.className).trim().split(/\s+/).slice(0, 2).join('.')).slice(0, 60) }; });
        });
        // T98 (TOOLBATCH4 recheck b, finding 11): what the fold may not hide is every control the census presses there
        // (popup triggers, rows with a context route, accordion heads and disclosures), each marked by element before the
        // fold and looked up by its mark after it, not by label (two triggers labelled 'More' were one); the fold control
        // itself is left out. A control of a kind the census already asked in this state is not lost (the census samples a
        // row kind), and is reported apart
        const censusIn = (i, tag, mark) => panel.evaluate((p, [i, tag, mark]) => {
          const r = p.querySelector(`[data-shelf-fold-region="${i}"]`); if (!r) return [];
          const fold = r.querySelector(`[data-shelf-fold="${i}"]`), out = [];
          const kinds = [['popup trigger', '[aria-haspopup]:not([aria-haspopup="false"])'], ['accordion head', '[data-acc] > [data-collapse]'], ['disclosure', 'button[aria-expanded]:not([role="tab"]):not([aria-haspopup])']];
          const name = e => (e.getAttribute('aria-controls') || e.getAttribute('aria-label') || e.getAttribute('data-path') || e.textContent || e.className).toString().trim().replace(/\s+/g, ' ').slice(0, 40);
          for (const [kind, sel] of kinds) for (const e of r.querySelectorAll(sel)) { if (e === fold) continue; out.push({ e, kind }); }
          for (const e of __shelf.rows(r)) out.push({ e, kind: 'row', sig: __shelf.sig(e) });
          if (mark) return out.filter(x => x.e.checkVisibility()).map((x, j) => { x.e.setAttribute('data-shelf-fold-ctl', `${tag}:${j}`); return { j, kind: x.kind, sig: x.sig || null, what: name(x.e) }; });
          return [...document.querySelectorAll(`[data-shelf-fold-ctl^="${tag}:"]`)].map(e => ({ j: +e.getAttribute('data-shelf-fold-ctl').split(':')[1], shown: e.isConnected && e.checkVisibility() }));
        }, [i, tag, mark]);
        for (const fo of folds) {
          const tag = String(foldedRegions.length), ctl = panel.locator(`[data-shelf-fold="${fo.i}"]`), before = await censusIn(fo.i, tag, true), fp = await reach(ctl);
          await t.page.mouse.click(off.x + fp.x, off.y + fp.y);
          const folded = await f.waitForFunction(e => e.getAttribute('aria-expanded') === 'false', await ctl.elementHandle(), { timeout: 2000 }).then(() => true, () => false);
          await t.check(`${target} ${state} short panel: pressing its expanded control (${fo.label}) folds it to make room for the list`, folded,
            JSON.stringify({ fold: fo, covered: { what: why.what, onTop: why.onTop, hits: why.hits, by: why.coverOf } }), { hard: true });
          const after = new Map((await censusIn(fo.i, tag, false)).map(x => [x.j, x.shown])), hid = before.filter(x => !after.get(x.j));
          await panel.evaluate((p, [i, tag]) => { p.querySelector(`[data-shelf-fold-region="${i}"]`)?.setAttribute('data-shelf-folded', tag);
            p.querySelector(`[data-shelf-fold="${i}"]`)?.setAttribute('data-shelf-fold-of', tag); }, [fo.i, tag]);
          foldedRegions.push({ tag, label: fo.label, region: fo.region, state, for: why.what, hid, folded: true });
        }
        if (folds.length) await f.waitForTimeout(500);
        return folds.length;
      } finally { folding = false; }
    };
    // Every popup trigger the panel shows (PMMenu wrappers and the rail skin's own), by mouse, Enter, Space and ArrowDown.
    const popupCensus = async (state) => {
      await unfoldAll(`${state} (before its popup census)`);
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
        const tp = await reach(trig);
        await t.check(`${tag} reachable`, tp.onTop, JSON.stringify(tp), { hard: true });
        const pressTrig = async () => pressAt(trig, await reach(trig));
        const openBy = async (input) => { if (input === 'mouse') await pressTrig(); else { await trig.focus(); await t.page.keyboard.press(PKEY[input]); } };
        const got = {};
        for (const input of POPUP_INPUTS) {
          // A wrapper's mouse route is the census above; its keyboard routes are new here.
          if (input === 'mouse' && c.controls && exercised.has(c.controls)) continue;
          const before = await f.evaluate(() => __shelf.keys());
          await openBy(input);
          const key = await f.waitForFunction(b => __shelf.keys().find(k => !b.includes(k)), before, { timeout: 5000 }).then(h => h.jsonValue(), () => null);
          await t.check(`${tag} opens a menu by ${input}`, !!key, JSON.stringify({ blocked: await f.evaluate(() => window.__blockedPopup || 0) }), { hard: true });
          got[input] = key;
          // FO-95: ArrowDown opens the menu with the focus on its first item, or on its current choice when it has one.
          if (input === 'arrowdown') {
            const fo = await f.waitForFunction(k => {
              const m = __shelf.open().find(x => __shelf.key(x) === k), a = document.activeElement;
              const its = m ? [...m.querySelectorAll('[role^="menuitem"]')].filter(it => it.closest('[role="menu"]') === m && it.checkVisibility()) : [];
              const i = its.indexOf(a), cur = its.findIndex(it => it.classList.contains('active') || ['aria-checked', 'aria-selected'].some(x => it.getAttribute(x) === 'true'));
              return i >= 0 && (i === 0 || i === cur) ? { at: i, cur } : null;
            }, key, { timeout: 2000 }).then(h => h.jsonValue(), () => null);
            const now = fo || await f.evaluate(() => { const a = document.activeElement; return { focus: a ? a.tagName + '.' + a.className : null }; });
            await t.check(`${tag} FO-95 ArrowDown puts the focus on the menu's first item or its current choice`, !!fo, JSON.stringify(now), { hard: true });
          }
          // Mouse and Enter carry the whole walk (branches, picks); Space and ArrowDown open the same menu, with items, the
          // first on top, and close on Escape with the panel kept.
          const whole = input === 'mouse' || input === 'enter';
          await assertMenu(key, `${tag} by ${input}`, whole, whole ? async () => openBy(input) : null, whole ? trig : null);
          if (await trig.getAttribute('aria-expanded') !== null)
            await t.check(`${tag} by ${input} trigger collapsed after Escape`, await trig.getAttribute('aria-expanded') === 'false', '', { hard: true });
        }
        const menus = Object.values(got);
        if (menus.length > 1) await t.check(`${tag} every input opens the same menu`, menus.every(m => m === menus[0]), JSON.stringify(got), { hard: true });
        const identity = c.controls || got.mouse || got.enter;
        if (c.controls) opened.add(c.controls);
        popupRows.push({ panel: target, state, sig: c.sig, controls: c.controls, identity, menus: got });
      }
    };
    // Context routes: right-click, Shift+F10 and the Menu key on one of each focusable row kind (__shelf.sig: Explorer's
    // file and folder rows apart, and apart by git status). Row kinds that share an explicit role, a box (__shelf.box) and a
    // class are one route kind: once one of them opens a menu, every other one must open that menu by every input (a
    // route that stops working fails; it does not look like a row that never had one). What each row kind opened is
    // remembered for the later walk, which asks another row of every kind that opened a menu again after the whole panel.
    const ctxKinds = [], ruleDone = new Set();
    // T68 (opus-recheck-kit8 finding A): row kinds that live only inside collapsed tree folders (this fixture's modified
    // and added files, all below a collapsed folder) were never probed, so a dead File actions route on them passed whole.
    // Before the census, every collapsed folder of every tree in the pane opens by the tree's own key (ArrowRight on the
    // focused row), each asserted (hard), until none is left collapsed; then the tree is let settle.
    const openFolders = async (state) => {
      const opened = [];
      for (let n = 0; ; n++) {
        const next = await panel.evaluate(p => {
          document.querySelectorAll('[data-shelf-folder]').forEach(e => e.removeAttribute('data-shelf-folder'));
          const e = [...p.querySelectorAll('[role="tree"] [role="treeitem"][aria-expanded="false"]')].find(x => !x.closest('[role="menu"]') && x.checkVisibility() && x.getBoundingClientRect().width);
          if (!e) return null;
          e.setAttribute('data-shelf-folder', '');
          return (e.getAttribute('data-path') || e.getAttribute('aria-label') || e.textContent).trim().replace(/\s+/g, ' ').slice(0, 60);
        });
        if (next === null) break;
        if (!await t.check(`${target} ${state} collapsed tree folders open in a bounded walk`, n < 200, `${n} opened`, { hard: true })) break;
        const row = panel.locator('[data-shelf-folder]');
        await reach(row);
        await row.focus(); await t.page.keyboard.press('ArrowRight');
        const ok = await f.waitForFunction(e => e.getAttribute('aria-expanded') === 'true', await row.elementHandle(), { timeout: 2000 }).then(() => true, () => false);
        await t.check(`${target} ${state} tree folder ${next} opens by ArrowRight for the context census`, ok, '', { hard: true });
        opened.push(next);
      }
      if (opened.length) {
        await panel.evaluate(p => new Promise(res => { const tr = [...p.querySelectorAll('[role="tree"]')]; let last = '', same = 0, n = 0;
          const tick = () => { const k = tr.map(x => x.getBoundingClientRect().height).join(); same = k === last ? same + 1 : 0; last = k; if (same >= 3 || ++n > 120) res(); else requestAnimationFrame(tick); };
          requestAnimationFrame(tick); }));
        t.log(`${target} ${state}: ${opened.length} collapsed tree folders opened for the context census: ${opened.join(', ')}`);
      }
      return opened.length;
    };
    const contextCensus = async (state, engine, tab) => {
      await unfoldAll(`${state} (before its context census)`);
      await openFolders(state);
      const cands = await panel.evaluate(p => {
        document.querySelectorAll('[data-shelf-probe]').forEach(e => e.removeAttribute('data-shelf-probe'));
        const seen = new Set(), out = [];
        __shelf.rows(p).forEach(e => {
          const s = __shelf.sig(e);
          if (seen.has(s)) return;
          seen.add(s); e.setAttribute('data-shelf-probe', String(out.length)); out.push({ sig: s, role: e.getAttribute('role') || '', box: __shelf.box(e), cls: __shelf.cls(e) });
        });
        return out;
      });
      for (const [i, c] of cands.entries()) {
        const sig = c.sig;
        if (probed.has(`${state}|${sig}`)) continue;
        probed.add(`${state}|${sig}`);
        const row = panel.locator(`[data-shelf-probe="${i}"]`), got = {}, unreachable = [];
        if (!await row.count()) continue;
        await restPointer();
        // One reach per row kind; the press point comes from reach (on top, or unreachable for the mouse).
        const q = await reach(row), p = { at: q.onTop ? { x: q.x, y: q.y } : null, open: await f.evaluate(() => __shelf.keys()) };
        await t.check(`${target} ${state} no menu open before probing ${sig}`, !p.open.length, JSON.stringify(p.open), { hard: true });
        // A key opens the menu with the pointer off the panel: a menu opened by a key must not appear under the point the
        // right-click before it left (a branch would open under it on its own).
        const keyOpen = async (input) => { await restPointer(); await row.focus(); await t.page.keyboard.press(KEY[input]); };
        for (const input of CTX_INPUTS) {
          if (input === 'mouse') {
            if (!p.at) { unreachable.push(input); continue; }
            await t.page.mouse.click(off.x + p.at.x, off.y + p.at.y, { button: 'right' });
          } else await keyOpen(input);
          const key = await f.evaluate(async () => { await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); return __shelf.keys()[0] || null; });
          if (!key) continue;
          got[input] = key;
          const tag = `${target} ${state} context ${key} by ${input} on ${sig}`;
          contextRoutes.push({ panel: target, engine, tab, sig, input, menu: key });
          // Branches once per pane, input and menu; every route still asserts open, items and Escape.
          const once = `${state}|${input}|${key}`;
          if (input === 'mouse') {
            const at = await kbAt(key);
            await t.check(`${tag} FO-93 a pointer-opened menu leaves the focus where it was`, at.open && !at.inMenu, JSON.stringify(at), { hard: true });
          } else if (!kbDone.has(once)) {
            kbDone.add(once);
            const reopenKb = async () => keyOpen(input);
            await keyboardMenu(key, tag, row, reopenKb);
            await reopenKb();
            const again = await f.waitForFunction(k => __shelf.keys().includes(k), key, { timeout: 5000 }).then(() => true, () => false);
            await t.check(`${tag} reopens by the same key for the rest of the census`, again, '', { hard: true });
          }
          await assertMenu(key, tag, !branchDone.has(once), async () => {
            if (input === 'mouse') { const q2 = await reach(row); await t.page.mouse.click(off.x + q2.x, off.y + q2.y, { button: 'right' }); }
            else await keyOpen(input);
          }, row);
          branchDone.add(once);
        }
        ctxKinds.push({ panel: target, engine, tab, state, sig, role: c.role, box: c.box, cls: c.cls, got, unreachable });
        const menus = CTX_INPUTS.map(input => got[input] || null);
        if (menus.some(Boolean)) await t.check(`${target} ${state} context menu on ${sig} opens by every input`, menus.every(m => m === menus.find(Boolean)),
          JSON.stringify({ got, unreachable, blocked: await f.evaluate(() => (window.__blockedContext || 0) + (window.__blockedContextOn || 0)) }), { hard: true });
      }
      // The route kinds of this pane: every row kind beside one that opened a menu opens it by every input.
      const here = ctxKinds.filter(k => k.panel === target && k.state === state);
      for (const k of here) {
        const menu = CTX_INPUTS.map(i => k.got[i]).find(Boolean);
        if (!menu || !k.role) continue;
        for (const o of here) {
          if (o === k || o.role !== k.role || o.box !== k.box || !o.cls.some(x => k.cls.includes(x)) || ruleDone.has(`${state}|${o.sig}|${menu}`)) continue;
          ruleDone.add(`${state}|${o.sig}|${menu}`);
          await t.check(`${target} ${state} context route kind ${k.role} in ${k.box}: ${o.sig} opens ${menu} by every input, as ${k.sig} does`, CTX_INPUTS.every(i => o.got[i] === menu),
            JSON.stringify({ got: o.got, unreachable: o.unreachable, blocked: await f.evaluate(() => (window.__blockedContext || 0) + (window.__blockedContextOn || 0)) }), { hard: true });
        }
      }
    };
    // The later walk: after the whole panel, every pane where a row kind opened a menu is shown again, and another row of
    // each such kind (the last one in the pane; the same one when the kind has one row) must open the same menu by every
    // input and close on Escape.
    const laterWalk = async () => {
      const kinds = ctxKinds.filter(k => k.panel === target && CTX_INPUTS.some(i => k.got[i]));
      for (const st of [...new Set(kinds.map(k => k.state))]) {
        const ks = kinds.filter(k => k.state === st), { engine, tab } = ks[0];
        if (engine) {
          await unfoldAll(`${roomState} (before the later walk's engine switch)`);
          await panel.locator(`[data-pm7-scm-engine="${engine}"]`).click();
          await t.check(`${target} later walk: engine ${engine} selected`, await panel.evaluate((p, en) => p.dataset.scmEngine === en, engine), '', { hard: true });
          await f.waitForTimeout(400);
        }
        roomState = engine || 'panel';
        if (tab) {
          const has = await panel.evaluate((p, tab) => {
            document.querySelectorAll('[data-shelf-later-tab]').forEach(e => e.removeAttribute('data-shelf-later-tab'));
            const e = [...p.querySelectorAll('[role="tab"]')].find(e => e.checkVisibility() && (e.dataset.tab || e.dataset.jjTab || e.textContent.trim()) === tab);
            e?.setAttribute('data-shelf-later-tab', ''); return !!e;
          }, tab);
          await t.check(`${target} later walk: tab ${tab} shown`, has, '', { hard: true });
          const control = panel.locator('[data-shelf-later-tab]');
          await control.click();
          await t.check(`${target} later walk: tab ${tab} active`, await control.evaluate(e => e.classList.contains('active') || e.getAttribute('aria-selected') === 'true'), '', { hard: true });
          await f.waitForTimeout(300);
        }
        for (const k of ks) {
          await unfoldAll(`${st} (before the later walk's ${k.sig} rows)`);
          const menu = CTX_INPUTS.map(i => k.got[i]).find(Boolean);
          // T98 (TOOLBATCH4 recheck b, finding 10): the census asks a kind's first row and this walk its last, so a dead
          // route on a middle row passed; a kind of more than two rows also has one middle row asked, picked by the run's
          // seed (--set seed=<n>, else drawn and logged) and named in the check
          const picks = await panel.evaluate((p, [s, seed]) => {
            document.querySelectorAll('[data-shelf-later]').forEach(e => e.removeAttribute('data-shelf-later'));
            const all = __shelf.rows(p).filter(e => __shelf.sig(e) === s), name = e => (e.getAttribute('data-path') || e.getAttribute('aria-label') || e.textContent).trim().replace(/\s+/g, ' ').slice(0, 40);
            let h = seed >>> 0; for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 2654435761) >>> 0;
            const out = [];
            if (all.length) { const e = all[all.length - 1]; e.setAttribute('data-shelf-later', '0'); out.push({ i: 0, which: name(e), how: 'the last' }); }
            if (all.length > 2) { const j = 1 + h % (all.length - 2), e = all[j]; e.setAttribute('data-shelf-later', '1'); out.push({ i: 1, which: name(e), how: `row ${j + 1}, by the seed` }); }
            return { n: all.length, out };
          }, [k.sig, shelfSeed]);
          const n = picks.n;
          await t.check(`${target} ${st} later walk: a ${k.sig} row is still there`, n > 0, '', { hard: true });
          for (const pick of picks.out) {
          const row = panel.locator(`[data-shelf-later="${pick.i}"]`), which = `${pick.which}, ${pick.how}`;
          for (const input of CTX_INPUTS) {
            await restPointer();
            if (input === 'mouse') { const q = await reach(row); await t.page.mouse.click(off.x + q.x, off.y + q.y, { button: 'right' }); }
            else { await row.focus(); await t.page.keyboard.press(KEY[input]); }
            const got = await f.waitForFunction(m => __shelf.keys().includes(m), menu, { timeout: 3000 }).then(() => menu, () => f.evaluate(() => __shelf.keys()[0] || null));
            await t.check(`${target} ${st} later walk: another ${k.sig} row (${which}, ${n} of the kind) opens ${menu} by ${input}`, got === menu,
              JSON.stringify({ got, blocked: await f.evaluate(() => (window.__blockedContext || 0) + (window.__blockedContextOn || 0)) }), { hard: true });
            await t.page.keyboard.press('Escape');
            const shut = await f.waitForFunction(() => !__shelf.keys().length, null, { timeout: 5000 }).then(() => true, () => false);
            await t.check(`${target} ${st} later walk: ${k.sig} by ${input} closes on Escape and leaves the side panel open`, shut && await f.locator('#sidePanelSlot').isVisible(), '', { hard: true });
          }
          }
        }
      }
    };
    // Source Control offers an engine switch; walk each engine it offers, then restore the first.
    const engines = await panel.locator('[data-pm7-scm-engine]').evaluateAll(es => es.filter(e => e.checkVisibility()).map(e => e.dataset.pm7ScmEngine));
    const tabsSeen = [];
    for (const engine of (engines.length ? engines : [null])) {
    if (engine !== null) {
      const sw = panel.locator(`[data-pm7-scm-engine="${engine}"]`);
      await unfoldAll(`${roomState} (before the engine switch)`);
      await sw.click();
      await t.check(`${target} engine ${engine} selected`, await panel.evaluate((p, en) => p.dataset.scmEngine === en, engine), '', { hard: true });
      await f.waitForTimeout(400);
    }
    roomState = engine || 'panel';
    await disclosureCensus(engine || 'panel');
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
        for(const head of heads) if((await unfoldFor(head, `${roomState} (before an accordion head inside it)`), await head.isVisible()) && !await head.evaluate(e=>e.closest('[data-acc]').classList.contains('open'))) {
          // Centre it in its own scroller with the wheel: at the scroller's edge a short panel's sticky
          // footer (Source Control's Publish card at 1280x500) covers it.
          const hp = await reach(head, {x:8,y:8});
          await t.check(`${target} accordion head on top where it is pressed`, hp.onTop, JSON.stringify(hp), {hard:true});
          // T55: listen to the head's own scrollers before the press, so the rail's reveal scroll is seen from its start.
          // T98 (TOOLBATCH4 recheck b, finding 9): and stamp the click itself (a capture listener on the head), and the
          // product's own scroll request on each scroller (its scrollBy or scrollTo), since the press's actionability
          // checks can take longer than the rail's delay. The previous reveal's watch is judged first: a request or a
          // scroll that came after its wait returned means the wait returned before the rail's own reveal began.
          const lateReveal = await head.evaluate(() => { const W = window.__shelfReveal; if (!W || !W.done) return null;
            /* (a request by the rail after the wait returned; the check's own later scrolls, the wheel and scrollIntoView,
               are no request) */
            const late = W.scs.filter(s => s.asked > W.done).map(s => ({ el: s.el.className.toString().slice(0, 40), asked: Math.round(s.asked - W.clickAt), scrolled: s.scrolled ? Math.round(s.scrolled - W.clickAt) : null, waitReturned: Math.round(W.done - W.clickAt) }));
            for (const u of W.undo) u(); W.undo = []; return late; });
          if (lateReveal) await t.check(`${target} accordion reveal: the previous wait returned after the rail's own reveal began`, !lateReveal.length, JSON.stringify(lateReveal), { hard: true });
          await head.evaluate(e => { const W = window.__shelfReveal = { at: performance.now(), clickAt: null, done: 0, scs: [], undo: [] };
            const onClick = () => { if (W.clickAt === null) W.clickAt = performance.now(); };
            e.addEventListener('click', onClick, { capture: true }); W.undo.push(() => e.removeEventListener('click', onClick, { capture: true }));
            for (let a = e.parentElement; a; a = a.parentElement) if (a.scrollHeight > a.clientHeight) {
              const s = { el: a, scrolled: 0, ended: 0, asked: 0, moves: false }; W.scs.push(s);
              a.addEventListener('scroll', () => { s.scrolled = performance.now(); }, { passive: true });
              a.addEventListener('scrollend', () => { s.ended = performance.now(); }, { passive: true });
              for (const fn of ['scrollBy', 'scrollTo']) { const own = Object.prototype.hasOwnProperty.call(a, fn), was = a[fn];
                /* (whether the request can move the scroller: a smooth scroll's first scroll event can come a few hundred
                   ms after the request on a slow host, so a request that can move it is waited for until it ends) */
                a[fn] = function (...x) { s.asked = performance.now();
                  const o = x[0], max = a.scrollHeight - a.clientHeight, top0 = a.scrollTop;
                  const to = o && typeof o === 'object' ? (fn === 'scrollBy' ? top0 + (+o.top || 0) : (o.top == null ? top0 : +o.top)) : (typeof x[1] === 'number' ? (fn === 'scrollBy' ? top0 + x[1] : x[1]) : top0);
                  s.moves = Math.abs(Math.max(0, Math.min(max, to)) - top0) >= 1;
                  return was.apply(this, x); };
                W.undo.push(() => { if (own) a[fn] = was; else delete a[fn]; }); }
            } });
          await pressAt(head, hp, { at: {x:8,y:8} });
          await t.check(`${target} displayed accordion expanded`,await head.evaluate(e=>e.closest('[data-acc]').classList.contains('open')),JSON.stringify(await head.evaluate((e,hp)=>{const r=e.getBoundingClientRect(),h=document.elementFromPoint(hp.x,hp.y);return {text:e.textContent.trim().replace(/\s+/g,' ').slice(0,40),cls:e.className,acc:e.closest('[data-acc]').className,r:[r.x,r.y,r.width,r.height].map(Math.round),hp,hitNow:h?.tagName+'.'+(h?.className?.baseVal??h?.className),own:!!h&&(h===e||e.contains(h))};},hp)),{hard:true});
          // The rail skin scrolls an expander opened near the bottom into view 120 ms after the click, smoothly
          // (15-jj.js, 30-motion.js revealInView): let that reveal finish before the next press, or the next head moves
          // under its press point (a slow machine pressed mid-scroll, on the card above). T55 (opus-recheck-kit7 K4): the
          // wait is the reveal's own completion, not a guess from the scroll position (a 250 ms floor and a silent 3 s
          // cap): the rail decides at its own delay (REVEAL_MS, pinned: 120 ms, 0 under reduced motion) after the click's
          // frame, and a scroll it starts ends with that scroller's scrollend. So: wait out the delay and two frames, then
          // every head scroller that scrolled since the press must reach its scrollend; one that does not within
          // REVEAL_END_MS fails by name.
          // T98: the wait runs from the click itself (the head's capture listener), not from before Playwright's press:
          // the rail's delay is after the click, then REVEAL_MARGIN_MS for the rail's own frame before its timer and the
          // timer's lateness, then two frames; then every head scroller the product asked to scroll, or that scrolled, after the click
          // must reach its scrollend (a request that moved nothing is done once two frames show no scroll). A click that
          // never reached the head, or a reveal that does not end within REVEAL_END_MS, fails by name.
          const reveal = await head.evaluate((e, [ms, endMs, marginMs]) => new Promise(res => {
            const W = window.__shelfReveal, reduced = matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.motion === 'reduced';
            const raf = () => new Promise(r => requestAnimationFrame(r));
            (async () => {
              const t0 = performance.now();
              while (W.clickAt === null) { if (performance.now() - t0 > 1000) { W.done = performance.now(); return res({ ok: false, why: 'no click reached the head within 1 s of the press', pressLag: null }); } await raf(); }
              const decide = W.clickAt + (reduced ? 0 : ms) + marginMs;
              while (performance.now() < decide) await raf();
              await raf(); await raf();
              const t1 = performance.now();
              for (;;) {
                const now = performance.now();
                const open = W.scs.filter(s => {
                  if (s.scrolled > W.clickAt) return !(s.ended > s.scrolled);
                  if (s.asked > W.clickAt) return s.moves;     /* asked and able to move: wait for its scroll to begin and end */
                  return false; });
                if (!open.length) { W.done = performance.now(); return res({ ok: true, ms: Math.round(W.done - W.clickAt), pressLag: Math.round(W.clickAt - W.at), asked: W.scs.filter(s => s.asked > W.clickAt).map(s => Math.round(s.asked - W.clickAt)), scrolled: W.scs.filter(s => s.scrolled > W.clickAt).length }); }
                if (now - t1 > endMs) { W.done = performance.now(); const rel = x => x ? Math.round(x - W.clickAt) : null;
                  return res({ ok: false, ms: Math.round(now - W.clickAt), pressLag: Math.round(W.clickAt - W.at), open: open.map(s => s.el.className.toString().slice(0, 40)),
                    scrollers: open.map(s => ({ asked: rel(s.asked), scrolled: rel(s.scrolled), ended: rel(s.ended), moves: s.moves, top: Math.round(s.el.scrollTop), max: Math.round(s.el.scrollHeight - s.el.clientHeight) })) }); }
                await raf();
              }
            })();
          }), [REVEAL_MS, REVEAL_END_MS, REVEAL_MARGIN_MS]);
          await t.check(`${target} accordion reveal finished (the rail's own scroll ended) before the next press`, reveal.ok, JSON.stringify(reveal), { hard: true });
          revealLog.push(reveal);
          opened=true;
        }
        if(!opened)break;
        await t.check(`${target} accordion traversal bounded`,pass<19,'',{hard:true});
      }
      // T98: the last reveal's watch, judged as the next press would judge it (a request or scroll after the wait returned)
      await f.waitForTimeout(300);
      const lastLate = await panel.evaluate(() => { const W = window.__shelfReveal; if (!W || !W.done) return null;
        const late = W.scs.filter(s => s.asked > W.done).map(s => ({ el: s.el.className.toString().slice(0, 40), asked: Math.round(s.asked - W.clickAt), scrolled: s.scrolled ? Math.round(s.scrolled - W.clickAt) : null, waitReturned: Math.round(W.done - W.clickAt) }));
        for (const u of W.undo) u(); W.undo = []; window.__shelfReveal = null; return late; });
      if (lastLate) await t.check(`${target} accordion reveal: the last wait returned after the rail's own reveal began`, !lastLate.length, JSON.stringify(lastLate), { hard: true });
      if (revealLog.length) { const lag = revealLog.map(r => r.pressLag).filter(x => x !== null).sort((a, b) => a - b), asked = revealLog.flatMap(r => r.asked || []).sort((a, b) => a - b), med = a => a.length ? a[a.length >> 1] : null;
        t.log(`${target} accordion reveals (T98): ${revealLog.length} presses, ${asked.length} scroll requests by the rail at ${asked.length ? asked[0] + '-' + asked[asked.length - 1] : '-'} ms after the click (median ${med(asked)}), the click ${med(lag)} ms (median) after the watch began`); }
      for(const head of heads)await head.dispose();
      const discover = async () => panel.locator(selectors.wrap).evaluateAll((ws,sel)=>ws.map((w,i)=>{
        const e=w.querySelector(sel);
        if(!e)return null;
        e.setAttribute('data-shelf-route',String(i));
        return {key:e.getAttribute('aria-controls'),index:i};
      }).filter(Boolean),selectors.trigger);
      const exercise = async () => {
        await unfoldAll(`${state} (before its inventory)`);
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
          const rp = await reach(trigger);
          await t.visible(`#${target} [data-shelf-route="${c.index}"]`,`${target} ${c.key} reachable`,{scroll:false});
          await pressAt(trigger, rp);
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
            await pressAt(trigger, await reach(trigger));
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
    await laterWalk();
    await unfoldAll(`${roomState} (the panel's last state)`);
    if (engines.length > 1) {
      await panel.locator(`[data-pm7-scm-engine="${engines[0]}"]`).click();
      await t.check(`${target} engine ${engines[0]} restored`, await panel.evaluate((p, en) => p.dataset.scmEngine === en, engines[0]), '', { hard: true });
    }
    const row={target,tabs:tabsSeen,inventory:[...inventory],exercised:[...exercised],popups:popupRows.filter(r=>r.panel===target).map(r=>r.identity),context:contextRoutes.filter(r=>r.panel===target).length};routedRows.push(row);
    exercised.forEach(k => opened.add(k));
    await t.check(target+' routed shelf census',expectedRouted[target].every(k=>inventory.has(k)),JSON.stringify(row),{hard:true});
    await t.check(target+' complete shelf menu inventory exercised',inventory.size===exercised.size&&[...inventory].every(k=>exercised.has(k)),JSON.stringify(row),{hard:true});
    if (target === 'panel-source') await t.check(`${target} a disclosure in each engine`, engines.length > 0 && engines.every(en => (disclosures[en] || 0) >= 1), JSON.stringify(disclosures), { hard: true });
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
  for (const [arg, hits] of [['blockContext', '__blockedContext'], ['blockContextOn', '__blockedContextOn'], ['blockPopup', '__blockedPopup'], ['blockBranch', '__blockedBranch']])
    if (t.args[arg]) await t.check(`capture blocker ${arg} intercepted input`, await f.evaluate(h => window[h] || 0, hits) > 0, String(t.args[arg]));
  const marks = ['data-shelf-case','data-shelf-route','data-shelf-pop','data-shelf-probe','data-shelf-tab','data-shelf-branch','data-shelf-pick','data-shelf-fold','data-shelf-disc','data-shelf-kb','data-shelf-kbs','data-shelf-later','data-shelf-later-tab'];
  await f.evaluate(marks=>document.querySelectorAll(marks.map(a=>`[${a}]`).join(',')).forEach(e=>{for(const a of marks)e.removeAttribute(a);}), marks);
}
