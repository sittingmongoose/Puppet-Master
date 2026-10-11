/* Lane E (2026-10-09): Actions & pipelines (#panel-git, panel id repository_automation) in the Polish design.

   The shell's panel stays as it is (Runs / Workflows / Settings, the automation service selector, the provider views it
   renders for the other services); this file adds what d.css cannot, on top of the shared passes of 10-skin.js:
   - the automation service <select> opens as the chat-style PMR.menu of the project's bindings when it has several;
     picking sets the select and fires its change event, so the shell's own setService() renders the provider view
     exactly as before; a project with one binding shows its service as a fact instead (owner, 2026-10-10);
   - GitHub's first tab is Current Branch: this branch's runs, then the other branches' (owner, 2026-10-10);
   - full words for the shell's shorthand ("4 - 2 - 1", "7 · 5 refs", "on:", REPO / ORG, UPPERCASE micro labels) and a
     real arrow for "->";
   - job and run states as the shared glyph family (done is a solid badge, failed a cross, running a live dot, skipped
     a ring, queued the turning ring) instead of the shell's colour-only dots, which applyDots reads as "live";
   - a disabled dispatch keeps its reason inline (FinalGUISpec disabled-control model);
   - ids and paths that do not fit keep both ends (RELEASE_…_PASSPHRASE, src/…/mixed_fractions.rs);
   - a run whose facts would wrap beside its state word puts the state under them;
   - the provider view rises in when the service changes.
   Every DOM change goes through remember() / setAttr() / addClass() / inject() / setOwnText(), so "Current" is
   byte-identical after a switch. LANE_E is shared with 54-artifacts.js (the files share the wrapper scope). */

const LANE_E = (() => {
  /* whole-text replacements over one panel's text nodes, plus the ASCII arrow; the shell's hidden sprout menus are
     skipped (their labels feed PMR.menu as written). A " · " separator is glued to the word before it (no-break space),
     so a line that wraps ends on the dot instead of starting with it ("Live · 6 actions ·" / "streaming").
     In the fact lines that keep (keep: a selector), a part never breaks inside: a ref keeps its hyphens (a word joiner
     after each: "import-fixes", "v1.4.2-rc.1", "lane-c") and a count keeps its word ("6 actions"). Never used on the
     ids midFit cuts (it rewrites their text whole). */
  /* a token longer than this is a path or a URL: it keeps its hyphens as break points (better than a cut anywhere) */
  const KEEP_MAX = 24;
  function words(root, map, keep) {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const hits = [];
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      const p = n.parentElement;
      if (!p || p.closest('.pm6-tb-menu')) continue;
      /* matched with plain spaces: the shared applyDetail (10-skin) has already glued each " · " in a fact value to the
         word before it with a no-break space, so "4 success · 2 failed · 1 running" missed its entry */
      const t = n.nodeValue.trim(), k = t.replace(/\u00A0/g, ' ');
      if (t && (Object.prototype.hasOwnProperty.call(map, k) || t.indexOf(' -> ') >= 0 || t.indexOf(' · ') >= 0 || (keep && p.closest(keep)))) hits.push(n);
    }
    hits.forEach(n => {
      const orig = n.nodeValue, t = orig.trim(), k = t.replace(/\u00A0/g, ' ');
      let v = Object.prototype.hasOwnProperty.call(map, k) ? orig.replace(t, map[k]) : orig;
      v = v.replace(/ -> /g, ' → ').replace(/ · /g, '\u00A0· ');
      if (keep && n.parentElement.closest(keep)) {
        v = v.replace(/\S+/g, w => (w.length <= KEEP_MAX ? w.replace(/([0-9A-Za-z])-(?=[0-9A-Za-z])/g, '$1-\u2060') : w))
          .replace(/(\d) (?=[a-z])/g, '$1\u00A0');
      }
      if (v === orig) return;
      n.nodeValue = v;
      remember(() => { n.nodeValue = orig; });
    });
  }
  /* does the text overflow its box at all? scrollWidth is rounded, so a cut of under a pixel (an ellipsis all the same)
     reads as a fit there; the text's own range is measured to the subpixel */
  function inkOver(el) {
    if (el.scrollWidth > el.clientWidth) return true;
    const cs = getComputedStyle(el);
    const room = el.getBoundingClientRect().width - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0)
      - (parseFloat(cs.borderLeftWidth) || 0) - (parseFloat(cs.borderRightWidth) || 0);
    const r = document.createRange();
    r.selectNodeContents(el);
    return r.getBoundingClientRect().width > room + .05;
  }
  /* a lane glyph as a direct child of host (default: first), its state written on it so it takes the state colour */
  function mark(host, st, before) {
    let g = host.querySelector(':scope > .d-e-gl');
    if (!g) {
      g = glyph(st);
      g.classList.add('d-e-gl');
      inject(host, g, before === undefined ? host.firstChild : before);
    } else if (g.getAttribute('data-gl') !== st) {
      g.setAttribute('data-gl', st);
      g.innerHTML = svgFor(st);
    }
    if (g.getAttribute('data-d-st') !== st) g.setAttribute('data-d-st', st);
    if (st === 'run') { if (!g.hasAttribute('data-pulse')) g.setAttribute('data-pulse', ''); } else if (g.hasAttribute('data-pulse')) g.removeAttribute('data-pulse');
    return g;
  }
  /* a shell chip whose word the shared vocabulary reads wrongly: force its state (and glyph); "token" = a plain fact */
  function chipAs(el, st) {
    if (el.getAttribute('data-d-st') !== st) setAttr(el, 'data-d-st', st);
    if (st === 'token') return;
    const g = el.querySelector(':scope > .d-gl');
    if (!g) inject(el, glyph(st), el.firstChild);
    else if (g.getAttribute('data-gl') !== st) { g.setAttribute('data-gl', st); g.innerHTML = svgFor(st); }
  }
  /* sentence case for an element's own text when the shell wrote it in lower case */
  function capOwn(el) { const t = ownText(el); if (t && /^[a-z]/.test(t)) setOwnText(el, capFirst(t)); }
  /* middle truncation (20-fit.js midFit) for the lane's ids and paths, measured again only when the room or the font
     changed (a theme, NieR or a late font load changes the font without changing the room) */
  function mid(root, sel, force) {
    const els = Array.from(root.querySelectorAll(sel));
    const keys = els.map(el => (el.offsetParent ? el.clientWidth + '|' + getComputedStyle(el).font : ''));
    els.forEach((el, i) => {
      if (!keys[i]) return;
      const key = keys[i] + '|' + (el._dFull != null ? el._dFull : el.textContent);
      if (!force && el._dEFit === key) return;
      midFit(el);
      el._dEFit = el.clientWidth + '|' + getComputedStyle(el).font + '|' + (el._dFull != null ? el._dFull : el.textContent);
    });
  }
  function clearMid(root) { root.querySelectorAll('*').forEach(el => { delete el._dEFit; delete el._dEStack; }); }
  /* refit on rail width, theme, NieR and text size changes (the shared watcher refits only its own selectors) */
  function watch(panel, refit) {
    if (panel._dEWatch) return;
    panel._dEWatch = true;
    let timer = 0;
    const soon = () => { clearTimeout(timer); timer = setTimeout(() => { if (D.on && panel.offsetWidth) refit(true); }, 90); };
    const slot = document.getElementById('sidePanelSlot');
    if (window.ResizeObserver && slot) { const ro = new ResizeObserver(soon); ro.observe(slot); D.observers.push(ro); }
    /* the list's own content box: a scrollbar that comes with an opened row narrows it without resizing the slot */
    const sc = panel.querySelector(':scope > .sh-scroll');
    if (window.ResizeObserver && sc) { const ro2 = new ResizeObserver(soon); ro2.observe(sc); D.observers.push(ro2); }
    const mo = new MutationObserver(soon);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-o55-nier', 'data-o55-nier-parts', 'style'] });
    D.observers.push(mo);
    if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', soon);
    remember(() => { clearTimeout(timer); if (document.fonts && document.fonts.removeEventListener) document.fonts.removeEventListener('loadingdone', soon); delete panel._dEWatch; });
  }
  /* a status phrase in a shelf head ("Connected") gets its glyph and colour */
  function headStates(panel) {
    panel.querySelectorAll('.sh-head > .sh-hcount').forEach(hc => {
      const st = stateOfWord(hc.textContent.trim());
      if (!st) return;
      if (hc.getAttribute('data-d-st') !== st) setAttr(hc, 'data-d-st', st);
      mark(hc, st);
    });
  }
  /* the panel's rows take the NieR cursor (ink bar + square cursor) like the shared rows do */
  function cursor(panel, sel) { panel.querySelectorAll(sel).forEach(el => addClass(el, 'pmr-cur')); }
  return { words, mark, chipAs, capOwn, mid, clearMid, watch, headStates, cursor, inkOver };
})();

(() => {
  const PANEL = 'panel-git';
  const WORDS_GIT = {
    /* a count keeps its word on a wrap (no-break spaces); the Readiness fact counts the same runs in the same words */
    '4 - 2 - 1': '4\u00A0passed · 2\u00A0failed · 1\u00A0running',
    '4 success · 2 failed · 1 running': '4\u00A0passed · 2\u00A0failed · 1\u00A0running',
    '7 · 5 refs': '7 runs · 5 refs',
    'push · PR · manual': 'push · pull request · manual',
    '4 · 2 dispatchable': '4 workflows · 2 dispatchable',
    'on:': 'Triggers',
    'MANUAL DISPATCH': 'Manual dispatch',
    'REPO': 'Repository',
    'ORG': 'Organization',
    'Reconnect + workflow': 'Reconnect with workflow scope',
  };
  /* ids and paths that keep their two ends: secret names, workflow files, changed paths */
  const MID_GIT = '.sh-kvwrap > .sh-k.sh-mono, .sh-kv > .sh-v.sh-mono';
  /* fact lines whose parts never break inside (refs keep their hyphens, counts their words) */
  const KEEP_GIT = '.sh-run-h .sh-meta, .sh-kv > .sh-v:not(.sh-mono), .pm7-post-kv > dd:not(.sh-mono), .pm7-automation-run-copy > small';

  /* a job's state from the shell's dot colour and its duration word */
  function jobState(dot, dur) {
    const s = dot.getAttribute('style') || '', c = dot.classList;
    if (c.contains('dot-run') || /--graph-running/.test(s)) return 'run';
    if (c.contains('dot-err') || /--graph-failed/.test(s)) return 'fail';
    if (c.contains('dot-ok') || /--graph-passed/.test(s)) return 'ok';
    if (/skipped|cancel/i.test(dur)) return 'idle';
    return 'pending';
  }
  function jobs(panel) {
    panel.querySelectorAll('.sh-job').forEach(job => {
      const dot = job.querySelector(':scope > .sh-dot');
      if (!dot) return;
      const dur = job.querySelector(':scope > .sh-jdur');
      LANE_E.mark(job, jobState(dot, dur ? dur.textContent : ''), dot.nextSibling);
    });
  }

  /* the automation bindings this project has (Forge_Integrations: binding selection shows only when several exist;
     owner, 2026-10-10). The demo project tastebook pushes to GitHub and the Origin mirror, whose checks are GitHub's
     own (the shell's "Origin checks" view is the fallback when the GitHub binding is unavailable), so it has one:
     GitHub Actions. The shell's select lists every service it can draw; ?bindings=github,gitlab (any of its values)
     gives the page that project instead, to review the picker. */
  function bindings(sel) {
    const all = Array.from(sel.options).map(o => o.value);
    const q = new URLSearchParams(location.search).get('bindings');
    const want = q ? q.split(',').map(s => s.trim()).filter(v => all.indexOf(v) >= 0) : [];
    return want.length ? Array.from(new Set(want)) : ['github'];
  }
  /* the automation service: with several bindings the native select becomes a chat-style dropdown of those bindings;
     with one, the service is a plain fact beside Revision and Pinned and there is nothing to choose. The select stays
     the source of truth either way. */
  function service(panel) {
    const sel = panel.querySelector('#pm7AutomationService');
    if (!sel || sel._dE) return;
    sel._dE = true;
    const applies = bindings(sel);
    if (applies.indexOf(sel.value) < 0) {
      const was = sel.value;
      sel.value = applies[0];
      sel.dispatchEvent(new Event('change', { bubbles: true }));
      remember(() => { sel.value = was; sel.dispatchEvent(new Event('change', { bubbles: true })); });
    }
    const nameOf = v => { const o = Array.from(sel.options).find(x => x.value === v); return o ? o.textContent.trim() : v; };
    if (applies.length < 2) { serviceFact(panel, sel, nameOf(applies[0])); return; }
    const value = PMR.h('span.d-select-v');
    const trig = PMR.h('button', { type: 'button', class: 'd-select d-e-service', 'aria-haspopup': 'menu', 'aria-expanded': 'false', 'aria-label': 'Automation service' },
      value, PMR.icon('chevD'));
    PMR.hover(trig, 'Choose the automation service', 'This project has ' + applies.length + ' automation services. GitHub keeps Current Branch, Workflows and Settings; the others show their own native view.');
    const sync = () => { const o = sel.options[sel.selectedIndex]; value.textContent = o ? o.textContent.trim() : ''; };
    sync();
    trig.addEventListener('click', ev => {
      ev.preventDefault(); ev.stopPropagation();
      const items = applies.map(v => ({ label: nameOf(v), value: v, selected: v === sel.value }));
      PMR.menu.toggle({ id: 'd-e-service', label: 'Automation service', value: sel.value, groups: [{ items }] }, trig, {
        width: Math.max(220, Math.round(trig.getBoundingClientRect().width)),
        onPick: it => {
          if (it.value != null && sel.value !== it.value) { sel.value = it.value; sel.dispatchEvent(new Event('change', { bubbles: true })); }
          requestAnimationFrame(sync);
        },
      });
    });
    const onChange = () => { sync(); requestAnimationFrame(() => riseProvider(panel)); };
    sel.addEventListener('change', onChange);
    inject(sel.parentNode, trig, sel);
    addClass(sel, 'd-hidden');
    remember(() => { sel.removeEventListener('change', onChange); delete sel._dE; });
  }
  /* one binding: the field goes and the service leads the facts (Service · Revision · Pinned), in their grid */
  function serviceFact(panel, sel, name) {
    const main = sel.closest('.pm7-automation-context-main');
    const common = panel.querySelector('.pm7-automation-context > .pm7-automation-common');
    if (!main || !common) return;
    const fact = PMR.h('div.pm7-automation-fact.d-e-service-fact', PMR.h('small', { text: 'Service' }), PMR.h('strong', { text: name }));
    PMR.hover(fact, 'Automation service', name + ' is the one automation service this project has. A picker appears here when a project has several.');
    inject(common, fact, common.firstChild);
    addClass(main, 'd-hidden');
    remember(() => { delete sel._dE; });
  }
  /* the other view comes in: provider cards rise in one after the other, or the GitHub pane deals back in */
  function riseProvider(panel) {
    if (!D.on || !panel.offsetWidth) return;
    const view = panel.querySelector(':scope > .pm7-automation-provider-view');
    if (view && visible(view)) { cascade(Array.from(view.children), { max: 6 }); return; }
    const tabs = panel.querySelector(':scope > .pm-segtab');
    if (tabs) fitTabs(tabs);
    const pane = activePane(panel);
    if (pane) deal(dealList(pane), { max: 12 });
  }

  /* a disabled control keeps its reason inline, next to it, not only in a hover tag */
  function reasons(panel) {
    panel.querySelectorAll('.sh-acts > .pm-btn[aria-disabled="true"][data-demo-reason]').forEach(b => {
      const acts = b.parentNode;
      const next = acts.nextElementSibling;
      if (next && next.classList.contains('d-e-reason')) return;
      const g = glyph('blocked');
      g.setAttribute('data-d-st', 'blocked');
      inject(acts.parentNode, PMR.h('div.d-e-reason', g, PMR.h('span', { text: capFirst(b.getAttribute('data-demo-reason').trim()) })), acts.nextSibling);
    });
    panel.querySelectorAll('.pm-footnote').forEach(fn => {
      if (/^\s*Dispatch is blocked\b/.test(fn.textContent)) { addClass(fn, 'd-e-note'); LANE_E.mark(fn, 'blocked'); }
    });
  }

  /* a run whose number · ref · age wraps beside its state word puts the state under it (fit by layout): the facts
     get the row's whole width and break only between their parts. The attribute is the shared data-d-stack, which
     clearFit() removes on a concept switch; the measure is cached on room, font and text. */
  function lines(el) {
    const r = document.createRange();
    r.selectNodeContents(el);
    return new Set(Array.from(r.getClientRects()).filter(x => x.width > 0).map(x => Math.round(x.top))).size;
  }
  function stackRuns(panel, force) {
    panel.querySelectorAll('.sh-run-h').forEach(h => {
      const meta = h.querySelector('.sh-meta'), chip = h.querySelector(':scope > .pm-chip');
      if (!meta || !chip || !h.offsetParent) return;
      const key = h.clientWidth + '|' + getComputedStyle(meta).font + '|' + meta.textContent + '|' + chip.textContent;
      if (!force && h._dEStack === key) return;
      h._dEStack = key;
      h.removeAttribute('data-d-stack');
      if (lines(meta) > 1) h.setAttribute('data-d-stack', '');
    });
  }

  /* GitHub's first subview is Current Branch (GitHub_Integration GI-011; owner, 2026-10-10): the branch this worktree
     is on with its readiness and its runs, and under them the other branches' runs, still in view (a background run
     never takes focus). The shell lists every ref's runs in one Recent runs shelf; this splits that shelf in two. The
     branch is the one Source Control's branch menu names. */
  const plainOf = el => el.textContent.replace(/⁠/g, '').replace(/ /g, ' ');
  const refOf = run => {
    const m = run.querySelector(':scope > .sh-run-h .sh-meta');
    const p = m ? plainOf(m).split(' · ') : [];
    return p.length > 2 ? p.slice(1, -1).join(' · ').trim() : '';
  };
  const runsWord = n => n + ' ' + (n === 1 ? 'run' : 'runs');
  function headCount(head, full, abbr, own) {
    const hc = head.querySelector('.sh-hcount');
    if (!hc) return;
    const f = hc.querySelector(':scope > .hc-full'), a = hc.querySelector(':scope > .hc-abbr');
    if (own) { if (f) f.textContent = full; if (a) a.textContent = abbr; hc.setAttribute('title', full); return; }
    if (f) setOwnText(f, full);
    if (a) setOwnText(a, abbr);
    if (hc.getAttribute('title') !== full) setAttr(hc, 'title', full);
  }
  function currentBranch(panel) {
    const tab = panel.querySelector(':scope > .pm-segtab > .pm-segtab-item[data-tab="runs"] > span');
    if (tab && ownText(tab) !== 'Current Branch') setOwnText(tab, 'Current Branch');
    const pane = panel.querySelector(':scope > .sh-scroll > [data-pane="runs"]');
    if (!pane || pane._dEBranch) return;
    const shelf = pane.querySelector(':scope > .sh-shelf');
    const head = shelf && shelf.querySelector(':scope > .sh-head'), body = shelf && shelf.querySelector(':scope > .sh-body');
    const menu = document.querySelector('#panel-source .pm6-tb-menu-label.sh-branch');
    const branch = menu ? menu.textContent.trim() : '';
    if (!head || !body || !branch) return;
    const runs = Array.from(body.querySelectorAll(':scope > .sh-run'));
    const mine = runs.filter(r => refOf(r) === branch), other = runs.filter(r => refOf(r) !== branch);
    pane._dEBranch = true;
    remember(() => { delete pane._dEBranch; });
    /* this branch: its name and worktree first, its readiness counted over its own runs */
    const label = head.querySelector(':scope > .sh-hlabel');
    if (label) setOwnText(label, 'Current branch');
    headCount(head, runsWord(mine.length), String(mine.length));
    const kvs = Array.from(body.querySelectorAll(':scope > .sh-kv'));
    const ready = kvs.find(kv => { const k = kv.querySelector(':scope > .sh-k'); return k && k.textContent.trim() === 'Readiness'; });
    if (ready) {
      const n = { ok: 0, fail: 0, live: 0 };
      mine.forEach(r => { const st = r.querySelector(':scope > .sh-run-h > .pm-chip'); const s = st && st.getAttribute('data-d-st'); if (s === 'run') n.live += 1; else if (s in n) n[s] += 1; });
      const words = [[n.ok, 'passed'], [n.fail, 'failed'], [n.live, 'running']].filter(x => x[0]).map(x => x[0] + ' ' + x[1]);
      const v = ready.querySelector(':scope > .sh-v');
      if (v && words.length) setOwnText(v, words.join(' · '));
    }
    inject(body, PMR.h('div.sh-kv.d-e-branch', PMR.h('span.sh-k', { text: 'Branch' }),
      PMR.h('span.sh-v', { text: branch + ' · this worktree' })), kvs[0] || body.firstChild);
    if (!other.length) return;
    /* the other branches: the same shelf, its own head, the runs moved in their order */
    const shelf2 = shelf.cloneNode(false), head2 = head.cloneNode(true), body2 = body.cloneNode(false);
    const l2 = head2.querySelector(':scope > .sh-hlabel');
    if (l2) l2.textContent = 'Other branches';
    const refs = new Set(other.map(refOf)).size;
    headCount(head2, runsWord(other.length) + ' · ' + refs + ' ' + (refs === 1 ? 'ref' : 'refs'), String(other.length), true);
    shelf2.classList.add('d-e-others');
    shelf2.append(head2, body2);
    inject(pane, shelf2, shelf.nextSibling);
    other.forEach(r => {
      const home = r.parentNode, next = r.nextSibling;
      body2.appendChild(r);
      remember(() => { home.insertBefore(r, next && next.parentNode === home ? next : null); });
    });
  }

  function fit(panel, force) { LANE_E.mid(panel, MID_GIT, force); stackRuns(panel, force); }

  function onClick(ev) {
    if (!D.on) return;
    const panel = document.getElementById(PANEL);
    if (!panel || !panel.contains(ev.target)) return;
    requestAnimationFrame(() => fit(panel, false));
  }

  panelHook(PANEL, {
    apply(panel) {
      LANE_E.words(panel, WORDS_GIT, KEEP_GIT);
      panel.querySelectorAll('.sh-dfrow > .sh-k, .sh-chk, .sh-head > .sh-hcount, [data-pane="workflows"] .sh-run-h .sh-meta').forEach(LANE_E.capOwn);
      LANE_E.headStates(panel);
      jobs(panel);
      currentBranch(panel);
      reasons(panel);
      service(panel);
      LANE_E.cursor(panel, '.sh-run-h, .sh-art[data-demo-action]');
      fit(panel, false);
      LANE_E.watch(panel, force => fit(panel, force));
      if (!panel._dEClick) {
        panel._dEClick = true;
        listen(panel, 'click', onClick);
        remember(() => { delete panel._dEClick; });
      }
    },
    show(panel) { fit(panel, false); },
    unmount(panel) { LANE_E.clearMid(panel); },
  });
})();
