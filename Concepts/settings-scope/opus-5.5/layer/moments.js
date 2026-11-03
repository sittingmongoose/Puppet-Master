/* Settings that apply everywhere (Opus 5.5): the moments (BUILD-SPEC section 11) and History.

   Each moment is reachable from the review strip and starts from a fresh demo (fix pass: the last moment's world, its
   defaults, its computers and its device are put back first; the look, the strip's options and the run mode stay).
   Each changes the demo world only after its simulated owner result, through the one write path (guard.js), and names
   the command it stands for. Every yes-point goes through PSX.confirm, so the strip's Run mode shows Regular and YOLO.
   Every value is [Demo only]. */
(function (W) {
  'use strict';
  const PSX = W.PSX; if (!PSX || PSX.moments) return;
  const { D, DEF, DEFAULTS, esc, mark, icon, label, vt, placeName, list, same, clone, PROJECTS, COMPUTERS } = PSX;
  const S = PSX.S;
  const K = () => W.PM12_KIMI;
  const wait = PSX.wait;
  const ORIGINAL_DEFAULTS = clone(DEFAULTS);

  /* ------------------------------------------------------------------ helpers */
  async function go(domain, workspace, tab) {
    try { if (W.PM_PAGES.current !== 'settings') W.PM_PAGES.go('settings'); } catch (e) { /* ignore */ }
    try { K().navigate(domain, workspace); } catch (e) { /* ignore */ }
    await wait(250);
    if (tab) { try { K().dispatchAction('pm51-tab', { manager: tab[0], tab: tab[1] }); } catch (e) { /* ignore */ } await wait(200); }
  }
  async function reveal(id) {
    try { W.PM51.revealSetting(id, { detail: true }); } catch (e) { /* ignore */ }
    await wait(700);
    PSX.panel.decorate({ force: true });
  }
  function closePanel() { const b = D.querySelector('#pm-settings-root .detail-inspector .pm51-panel-close'); if (b && D.querySelector('#pm-settings-root .detail-inspector[aria-hidden="false"]')) b.click(); }
  /* a person's change, as if made on the row: the engine takes the value, then the router routes it */
  async function personChange(id, value) {
    const k = K(); if (!k) return;
    k.setSettingFromHost(id, value, false, false);
    try { W.PM51.refreshSavedRow(id); } catch (e) { /* not on screen */ }
    PSX.router.source = 'row';
    await wait(80);
    const st = k.getState().settings;
    if (!same(st[id], PSX.last[id])) PSX.route(id, clone(st[id]), clone(PSX.last[id]), 'row');
  }
  PSX.personChange = personChange;

  /* ------------------------------------------------------------------ Home NAS answering or not (11.1) */
  function homenas(up) {
    const was = PSX.W.up.homenas !== false;
    PSX.W.up.homenas = !!up;
    PSX.W.rev++;
    PSX.feed.push(); PSX.emit('redraw'); PSX.report && PSX.report('state');
    if (up && !was) {
      const away = (PSX.W.awayWrites || []).filter((x) => PSX.W.batches[x.tx] && !PSX.W.batches[x.tx].undone);
      if (away.length && PSX.home() === 'homenas') PSX.note({ title: 'Home NAS is back.', body: `While Home NAS was away you changed ${away.length} setting${away.length === 1 ? '' : 's'} just for now. Make ${away.length === 1 ? 'it' : 'them'} everywhere?`, mark: 'info', ms: 12000, actions: [{ label: 'Review', primary: true, run: () => reviewAway(away) }] });
      else PSX.note({ title: 'Home NAS is back.', body: 'Everything is current again.', mark: 'complete' });
    }
  }
  function studio(up) { PSX.W.up.studio = !!up; PSX.W.rev++; PSX.feed.push(); PSX.emit('redraw'); if (PSX.history.sheet && PSX.history.sheet.back.isConnected) PSX.history.draw(); PSX.report && PSX.report('state'); }
  /* each away change remembers exactly where it went (the work computer, or this screen): making it everywhere takes
     away that same own value, in one transaction. YOLO never does this by itself (7.5) */
  function reviewAway(away) {
    const where = (x) => (x.level === 'device' ? 'this screen' : placeName(x.level, x.key));
    const body = `<p class="psx-p">These were saved just for now while ${esc(PSX.homeName())} was away. Nothing was queued.</p><ul class="psx-list">${away.map((x, i) => `<li class="psx-li"><label class="psx-check"><input type="checkbox" checked data-i="${i}"><span>${esc(label(x.id))}: ${esc(vt(x.id, x.value))}<small>Just ${esc(where(x))} for now</small></span></label></li>`).join('')}</ul>`;
    PSX.confirm({ title: 'Make them everywhere?', kicker: `${PSX.homeName()} is back`, body, cancelLabel: 'Keep them where they are',
      guard: 'YOLO never makes a change from while your settings home was away everywhere by itself.',
      okLabel: 'Make these everywhere',
      onOpen: (s) => { PSX.away = s; },
      ok: () => {
        const s = PSX.away; const picked = s ? [...s.body.querySelectorAll('input:checked')].map((x) => away[+x.dataset.i]) : away;
        const writes = []; picked.forEach((x) => { writes.push({ level: 'everywhere', key: null, id: x.id, value: x.value }, { level: x.level, key: x.key, id: x.id, value: undefined }); });
        const tx = PSX.write(writes, { batch: 'away', text: `${picked.length} change${picked.length === 1 ? '' : 's'} made while ${PSX.homeName()} was away, made everywhere` });
        if (!tx) return null;
        PSX.W.awayWrites = (PSX.W.awayWrites || []).filter((x) => !picked.includes(x));
        PSX.note({ title: 'Saved for everywhere.', body: `${list(picked.map((x) => label(x.id)))} now ${picked.length === 1 ? 'applies' : 'apply'} everywhere.`, actions: [{ label: 'Undo', run: () => PSX.undoTx(tx.id) }] });
        return tx;
      } });
  }

  /* ------------------------------------------------------------------ intercepts the router hands moments first */
  function intercept(id, nv, ov, before) {
    // 11.2: a change from Studio Mac to the same setting lands first; the stale write is refused (SSYS-009 compare-and-set)
    if (S.conflictArmed && S.conflictArmed === id) {
      S.conflictArmed = null;
      const theirs = 16;
      PSX.apply([{ level: 'everywhere', key: null, id, value: theirs }], { from: 'studio' });
      PSX.feed.push();
      S.conflict = { id, theirs, mine: nv, from: 'studio' };
      PSX.emit('redraw');
      // instead of the note, the card in the panel (7.6); the note only when the panel isn't open on that setting
      const cur = PSX.panel.current();
      if (!cur || cur.id !== id) PSX.note({ title: `${label(id)} wasn’t changed`, body: `It was just changed on Studio Mac to ${vt(id, theirs)}.`, mark: 'change-conflict', kind: 'conflict', actions: [{ label: 'Choose in the panel', primary: true, run: () => reveal(id) }] });
      return true;
    }
    return false;
  }
  /* the conflict card replaces the panel's Now block until it is answered (7.6) */
  PSX.on('redraw', () => setTimeout(conflictCard, 30));
  PSX.on('fed', () => setTimeout(conflictCard, 30));
  function conflictCard() {
    const cur = PSX.panel.current(); if (!cur || !S.conflict || cur.id !== S.conflict.id) return;
    const { body } = cur, c = S.conflict, id = c.id;
    if (body.querySelector('[data-psx-block="conflict"]')) return;
    const now = body.querySelector(':scope > .o55-insp-now'); if (now) { now.hidden = true; now.setAttribute('data-psx-hidden', ''); }
    const card = D.createElement('section'); card.className = 'o55-insp-now psx-conflict'; card.setAttribute('data-psx-block', 'conflict'); card.setAttribute('role', 'group'); card.setAttribute('aria-label', 'A change from another device');
    card.innerHTML = `<div class="o55-insp-now-label">${PSX.st('change-conflict', 'Changed somewhere else first')}</div><div class="o55-insp-now-value">${esc(label(id))} was just changed on Studio Mac to ${esc(vt(id, c.theirs))}.</div><p class="psx-p" style="margin:6px 0 0">Your change to ${esc(vt(id, c.mine))} wasn’t saved, because it was made from an older view. Nothing is merged by time.</p>`;
    const acts = D.createElement('div'); acts.className = 'psx-wacts';
    const b1 = D.createElement('button'); b1.type = 'button'; b1.className = 'psx-tb is-primary'; b1.textContent = `Keep ${vt(id, c.theirs)}`; b1.setAttribute('data-psx-key', 'conflict-keep');
    const b2 = D.createElement('button'); b2.type = 'button'; b2.className = 'psx-tb'; b2.textContent = `Use ${vt(id, c.mine)}`; b2.setAttribute('data-psx-key', 'conflict-mine');
    const settle = () => { S.conflict = null; card.remove(); body.querySelectorAll(':scope > .o55-insp-now[data-psx-hidden]').forEach((n) => { n.hidden = false; n.removeAttribute('data-psx-hidden'); }); PSX.panel.decorate({ force: true }); };
    b1.addEventListener('click', () => { settle(); PSX.note({ title: `${label(id)} stays ${vt(id, c.theirs)}.`, body: 'Studio Mac’s change is kept.', mark: 'complete' }); });
    b2.addEventListener('click', () => { settle(); PSX.setOwn(id, { level: 'everywhere', key: null }, c.mine); });
    acts.appendChild(b1); acts.appendChild(b2); card.appendChild(acts);
    body.insertBefore(card, body.firstChild);
    setTimeout(() => { try { b1.focus({ preventScroll: true }); } catch (e) { /* gone */ } }, 30);
  }

  /* ------------------------------------------------------------------ a small guide card (11.3), non-modal */
  let guideEl = null;
  function guide(steps) {
    if (guideEl) guideEl.remove();
    let i = 0;
    const el = guideEl = D.createElement('div'); el.className = 'psx-guide'; el.setAttribute('role', 'region'); el.setAttribute('aria-label', 'Guided walk'); el.setAttribute('data-lg-surface', 'menu'); el.setAttribute('data-lg-dense', '');
    PSX.portal().appendChild(el);
    // a step's entry may still be running when the walk is closed or the next moment starts: then it draws nothing
    const draw = () => {
      if (!el.isConnected || guideEl !== el) return;
      const s = steps[i];
      el.innerHTML = `<div class="psx-kicker">Step ${i + 1} of ${steps.length}</div><div class="psx-guide-title">${esc(s.title)}</div><p class="psx-p">${esc(s.text)}</p><div class="psx-wacts">${s.act ? `<button type="button" class="psx-tb is-primary" data-g="act">${esc(s.act)}</button>` : ''}${i < steps.length - 1 ? '<button type="button" class="psx-tb" data-g="next">Next step</button>' : ''}<button type="button" class="psx-tb is-quiet" data-g="close">Close the walk</button></div>`;
      el.querySelectorAll('[data-g]').forEach((b) => b.addEventListener('click', async () => {
        if (b.dataset.g === 'act' && s.run) await s.run();
        else if (b.dataset.g === 'next') { i++; if (steps[i].enter) await steps[i].enter(); draw(); }
        else if (b.dataset.g === 'close') { el.remove(); if (guideEl === el) guideEl = null; }
      }));
    };
    if (steps[0].enter) Promise.resolve(steps[0].enter()).then(draw); else draw();
  }

  /* ------------------------------------------------------------------ the moments */
  const M = {};
  M['11.1'] = async () => { await go('ai', 'providers', ['providers', 'models']); homenas(false); await reveal('ai.models.default-model'); PSX.note({ title: 'Home NAS isn’t answering', body: 'Home NAS keeps your settings, so an everywhere change waits until it’s back, and nothing is queued.', mark: 'offline', ms: 9000 }); };
  M['11.2'] = async () => { await go('general', 'app-input'); await reveal('general.visual.font-size'); S.conflictArmed = 'general.visual.font-size'; await wait(300); await personChange('general.visual.font-size', 15); };
  M['11.3'] = async () => {
    await go('source', 'source-manager');
    guide([
      { title: 'A row with tastebook’s own value', text: 'Main branch name reads “This project”: tastebook has its own (trunk). A change there writes tastebook, and the note says so.', act: 'Change it to main-line', enter: async () => { await reveal('branching.worktrees.default-branch'); }, run: () => personChange('branching.worktrees.default-branch', 'main-line') },
      { title: 'A row that follows everywhere', text: 'Everyday model reads “Varies”: it comes from everywhere and docs-site has its own. A change writes everywhere; the note offers “Only for tastebook”.', act: 'Change it to GPT-5', enter: async () => { closePanel(); await go('ai', 'providers', ['providers', 'models']); }, run: () => personChange('ai.models.default-model', 'openai/gpt-5') },
      { title: 'Make it narrower in one click', text: 'Choose “Only for tastebook” in the note. Everywhere goes back to Claude Opus 4, tastebook keeps GPT-5, and the row’s word becomes “This project”.', act: 'Only for tastebook', run: () => { const tx = Object.values(PSX.W.batches).reverse().find((x) => x.writes[0] && x.writes[0].id === 'ai.models.default-model' && x.writes[0].level === 'everywhere' && !x.undone); if (tx) PSX.onlyFor('ai.models.default-model', tx, { level: 'project', key: 'tastebook' }); } }
    ]);
  };
  M['11.4'] = async () => { await go('ai', 'providers', ['providers', 'limits']); await reveal('ai.accounts.hard-switch-level'); await wait(300); await personChange('ai.accounts.hard-switch-level', 15); };
  M['11.5'] = async () => { await go('system', 'servers', ['servers', 'servers']); moveHome({}); };
  M['11.5-flight'] = async () => { await go('system', 'servers', ['servers', 'servers']); moveHome({ inFlight: true }); };
  M['11.5-lost'] = async () => { await go('system', 'servers', ['servers', 'servers']); homenas(false); moveHome({ lost: true }); };
  M['11.6'] = async () => joinSetups();
  M['11.7'] = async () => newComputer();
  M['11.8'] = async () => { S.viewAs = false; PSX.setCtx({ project: 'none', on: null }); await go('ai', 'providers', ['providers', 'models']); PSX.note({ title: 'No project is open', body: 'Changes here apply everywhere or on this computer. Rows about one project’s files read “Each project”.', mark: 'info' }); };
  M['11.9'] = async () => {
    PSX.apply([{ level: 'project', key: 'tastebook', id: 'general.visual.theme', value: 'Retro Dark' }, { level: 'device', key: 'studio', id: 'general.visual.theme', value: 'Basic Light' }], { batch: 'own-look', text: 'tastebook’s own look and Studio Mac’s own look', history: true });
    S.ownLook = true;
    if (S.ctx.project !== 'tastebook') PSX.setCtx({ project: 'tastebook' }); else PSX.feed.push();
    try { W.PM7_SETTINGS_TOME.applyPaint(K().getState()); } catch (e) { /* ignore */ }
    await go('general', 'app-input');
    PSX.note({ title: 'tastebook has its own look', body: 'Switch Project to harbor, or You’re using to Studio Mac: the look follows where it comes from.', mark: 'info', ms: 9000 });
    PSX.report && PSX.report('state');
  };
  M['11.10'] = async () => {
    PSX.setCtx({ project: 'loom' });
    await go('ai', 'providers', ['providers', 'models']);
    await wait(300);
    const tid = 'ai.models.reasoning-effort';
    const yolo = S.runMode === 'yolo';
    // a request about loom stays narrow in both run modes
    const tx = PSX.write([{ level: 'project', key: 'loom', id: tid, value: 'high' }], { by: 'assistant', yolo });
    if (tx) PSX.note({ title: 'The assistant set Thinking depth to High for loom.', body: `In loom’s chat: “Raise the thinking depth here.” It wrote the narrowest place, this project${yolo ? ', in YOLO too' : ''}.`, mark: 'complete', actions: [{ label: 'Undo', run: () => PSX.undoTx(tx.id, tid) }], ms: 8000 });
    await wait(1600);
    const f = PSX.followers('ai.models.default-model', 'openai/gpt-5');
    const keeps = f.keeps;
    const everywhere = (y) => {
      const t2 = PSX.write([{ level: 'everywhere', key: null, id: 'ai.models.default-model', value: 'openai/gpt-5' }], { by: 'assistant', yolo: !!(y && y.yolo), text: 'The assistant: Everyday model GPT-5 everywhere' });
      if (t2 && !(y && y.yolo)) PSX.note({ title: 'The assistant set Everyday model to GPT-5 everywhere.', body: `${list(keeps)} ${keeps.length === 1 ? 'keeps its' : 'keep their'} own.`, actions: [{ label: 'Undo', run: () => PSX.undoTx(t2.id) }] });
      return t2;
    };
    // the S13 yes is for Regular; in YOLO a requested Everywhere change shows the same preview as its report (7.9)
    PSX.confirm({
      title: 'Change Everyday model everywhere?', kicker: 'The assistant asks · loom’s chat',
      body: `<p class="psx-p">“Use GPT-5 as the everyday model everywhere.”</p><p class="psx-p">${mark('info')} <b>This changes ${f.changes.length} projects.</b> ${esc(list(keeps))} ${keeps.length === 1 ? 'keeps its' : 'keep their'} own.</p>${PSX.guard.changeList('ai.models.default-model', f.sim, 5)}<p class="psx-p psx-muted">An assistant changes the narrowest place a setting allows unless you say yes here.</p>`,
      alt: [{ label: 'Only for loom', run: () => { const t2 = PSX.write([{ level: 'project', key: 'loom', id: 'ai.models.default-model', value: 'openai/gpt-5' }], { by: 'assistant' }); if (t2) PSX.note({ title: 'The assistant set Everyday model to GPT-5 for loom.', actions: [{ label: 'Undo', run: () => PSX.undoTx(t2.id) }] }); } }],
      okLabel: 'Change everywhere', ok: everywhere,
      report: { title: 'The assistant set Everyday model to GPT-5 everywhere.', body: `In loom’s chat: “Use GPT-5 as the everyday model everywhere.” It changed ${f.changes.length} projects; ${list(keeps)} ${keeps.length === 1 ? 'keeps its' : 'keep their'} own.` }
    });
  };
  M['11.11'] = async () => { S.actor = 'ipad'; PSX.setCtx({ device: 'ipad' }); await go('general', 'app-input'); await reveal('general.visual.font-size'); PSX.note({ title: 'You’re using Sam’s iPad', body: 'A Member’s device: it can change only its own screen settings. Try Change on any other line.', mark: 'info', ms: 8000 }); };
  M['11.12'] = async () => {
    DEFAULTS['ai.models.reasoning-effort'] = 'auto'; DEFAULTS['system.mcp.timeout'] = 45000;
    PSX.W.rev++; PSX.feed.push(); PSX.emit('redraw');
    try { W.PM_PAGES.go('settings'); } catch (e) { /* ignore */ }
    try { K().dispatchAction('home'); } catch (e) { /* ignore */ }
    await wait(500);
    updateCard();
  };
  M['11.13'] = async () => projectRules();
  M['11.14'] = async () => fold();
  M['11.15'] = async () => {
    S.firstStart = true;
    PSX.H.setAttribute('data-psx-first', '');
    W.PM_ACTIVE_PROJECT_ID = 'none';
    const lab = D.getElementById('projectMenuLabel'); if (lab) lab.textContent = 'No project';
    try { K().reloadProject(); } catch (e) { /* ignore */ }
    PSX.rows.refreshAll();
    await go('ai', 'providers', ['providers', 'models']);
    firstCard();
    PSX.note({ title: 'First start', body: 'Nothing is set up yet, so Settings is a preview in Basic Dark and no change is kept.', mark: 'info', ms: 9000 });
  };
  /* first start: one card at the top of the page says it; every control reads as unavailable (core.css) */
  function firstCard() {
    const scroll = D.querySelector('#pm-settings-root .settings-scroll, #pm-settings-root .document-scroll, #pm-settings-root .manager-scroll, #pm-settings-root .home-page');
    const host = scroll || D.querySelector('#pm-settings-root .document-toolbar');
    if (!host || host.querySelector('[data-psx-first]')) return;
    const card = D.createElement('section'); card.className = 'panel-card psx-update psx-first-card'; card.setAttribute('data-psx-first', '1'); card.setAttribute('data-o55-foreign', ''); card.setAttribute('role', 'status');
    card.innerHTML = `<div class="psx-fact">${mark('info')}<span><b>Nothing is set up yet.</b> Set up Puppet Master on this computer first. Until then nothing is kept, so Settings is a preview in Basic Dark.</span></div>`;
    if (scroll) scroll.insertBefore(card, scroll.firstChild); else host.after(card);
  }
  M['11.16'] = async () => differences();
  M['11.17'] = async () => { await go('system', 'settings-transfer'); batchCopy(); };
  M['11.18'] = async () => { PSX.setCtx({ project: 'loom' }); approvals(); };
  M.copy = async () => { await go('system', 'settings-transfer'); PSX.copy.open({ mode: 'settings' }); };
  // New Project starts on your usual settings; the moment chooses Like tastebook for you, to show Advanced (the strip says so)
  M['copy-new'] = async () => { PSX.copy.open({ mode: 'new', comp: 'homenas', advanced: true, src: 'tastebook' }); };

  /* ------------------------------------------------------------------ 11.5 Move where your settings are kept
     An owner choice (7.2): YOLO never moves it. The variants (a change in flight, Home NAS gone for good) are moments of
     their own in the strip, so nothing for the review sits inside the sheet */
  function moveHome(v) {
    const from = PSX.home();
    const st = { to: from === 'here' ? 'studio' : 'here', inFlight: !!v.inFlight, lost: !!v.lost || PSX.W.up[from] === false };
    const opts = PSX.computerIds().filter((k) => k !== from);
    const draw = (s) => {
      const freshness = `${placeName('computer', st.to)}’s copy is from ${PSX.W.asOf}. Changes after that may be lost.`;
      s.body.innerHTML = (S.runMode === 'yolo' ? `<div class="psx-fact psx-yolo">${mark('info')}<span><b>YOLO still asks here.</b> Which computer keeps your settings is your choice; an agent never moves it.</span></div>` : '')
        + `<div class="psx-copy-choice" role="radiogroup" aria-label="Keep your settings on">${opts.map((k) => `<label class="psx-radio${st.to === k ? ' is-on' : ''}"><input type="radio" name="psx-home" value="${k}"${st.to === k ? ' checked' : ''}><span><b>${esc(placeName('computer', k))}</b><small>${esc(COMPUTERS[k].detail)}</small></span></label>`).join('')}</div>`
        + `<div class="psx-h">What happens</div><div class="psx-card">`
        + (st.lost
          ? `<div class="psx-fact">${mark('offline')}<span>${esc(placeName('computer', from))} hasn’t answered for a while. Make ${esc(placeName('computer', st.to))} keep your settings from its own copy.</span></div><div class="psx-fact">${mark('warning')}<span>${esc(freshness)}</span></div>`
          : `<div class="psx-fact">${mark('complete')}<span>Your everywhere settings and their history are copied from ${esc(placeName('computer', from))} to ${esc(placeName('computer', st.to))}, then checked.</span></div><div class="psx-fact">${mark('complete')}<span>Then ${esc(placeName('computer', st.to))} keeps your settings, and ${esc(placeName('computer', from))} follows it like every other computer.</span></div>`)
        + (st.inFlight ? `<div class="psx-fact">${mark('waiting')}<span>A change from iPhone is on its way to ${esc(placeName('computer', from))}. Move once it has been saved.</span></div>` : '')
        + `<div class="psx-fact">${icon('lock')}<span>Each computer’s own settings and each project’s own stay where they are.</span></div></div>`
        + `<p class="psx-p psx-muted">It never happens by itself.</p>`;
      s.setActions([{ label: 'Cancel', run: () => s.close() }, { spacer: true }, { label: st.lost ? `Make ${placeName('computer', st.to)} keep your settings` : `Move to ${placeName('computer', st.to)}`, primary: true, disabled: st.inFlight ? 'A change is on its way. Try again once it has been saved.' : null, run: () => {
        const tgt = st.to;
        const y = PSX.guard.why({ level: 'act', key: tgt, id: '' });
        if (y) { PSX.note({ title: 'Not moved', body: y.text + '. Nothing was changed.', mark: y.kind === 'offline' ? 'offline' : 'info' }); return; }
        s.close();
        PSX.run('cmd.server.settings_home.move', [600, 600, 500], () => {
          const tx = PSX.write([{ level: 'meta', key: null, id: 'home', value: tgt }], { batch: 'home', text: `${placeName('computer', tgt)} keeps your settings now (was ${placeName('computer', from)})` }, { silent: true });
          if (!tx) { PSX.note({ title: 'Not moved', body: 'Nothing was changed.', mark: 'info' }); return; }
          PSX.emit('redraw');
          PSX.note({ title: `${placeName('computer', tgt)} keeps your settings now.`, body: st.lost ? `From its own copy. ${placeName('computer', from)} follows it if it ever comes back.` : `${placeName('computer', from)} follows it from now on.`, mark: 'complete' });
        });
        PSX.note({ title: 'Moving your settings…', body: 'Copying, checking, then switching.', mark: 'working', sticky: true });
      } }]);
      s.body.querySelectorAll('input[name="psx-home"]').forEach((x) => x.addEventListener('change', () => { st.to = x.value; draw(s); }));
    };
    const s = PSX.sheet({ title: 'Keep your settings on another computer', kicker: placeName('computer', from), sub: 'One computer keeps your settings; every other one follows it.', body: '' });
    draw(s);
  }

  /* ------------------------------------------------------------------ 11.6 Two setups joining */
  const JOIN = [
    ['general.visual.theme', null, 'Basic Light'], ['general.visual.font-size', null, 16], ['ai.models.default-model', null, 'anthropic/claude-sonnet-4'],
    ['general.interaction.eli5-default', null, false], ['general.interaction.sound-effects', null, true], ['ai.models.reasoning-effort', null, 'high'],
    ['branching.worktrees.default-branch', null, 'master'], ['system.mcp.timeout', null, 45000], ['safety.rules.permission-preset', null, 'full']
  ];
  /* The keeper is the owner's choice (YOLO never picks it); each row then keeps the keeper's value, keeps the other's as
     that computer's own, or uses the other's everywhere. The settings home, Studio Mac's joining and every value move
     in one transaction, so Undo puts both setups back; what isn't kept stays in History (7.8, S12) */
  function joinSetups() {
    const st = { keepOn: 'homenas', pick: JOIN.map(() => 'keeper') };
    const nas = (id) => { const r = PSX.resolve(id, { project: 'none', on: 'homenas', device: 'here' }); return r.everywhere !== undefined ? r.everywhere : DEFAULTS[id]; };
    const studioOwnLevel = (id) => { const def = DEF[id]; return def && (def.may || []).includes('device') ? 'device' : 'computer'; };
    const other = () => (st.keepOn === 'homenas' ? 'studio' : 'homenas');
    const valueOf = (who, id, studioV) => (who === 'homenas' ? nas(id) : studioV);
    function plan() {
      const writes = [{ level: 'meta', key: null, id: 'home', value: st.keepOn }, { level: 'meta', key: null, id: 'studioJoined', value: true }];
      const lost = [];
      JOIN.forEach(([id, , studioV], i) => {
        const kv = valueOf(st.keepOn, id, studioV), ov = valueOf(other(), id, studioV);
        const lvl = studioOwnLevel(id);
        const pick = st.pick[i];
        const every = pick === 'every' ? ov : kv;
        if (!same(every, nas(id))) writes.push({ level: 'everywhere', key: null, id, value: every });
        // Studio Mac's own values from its separate setup go, unless kept as its own
        const studioKeeps = pick === 'own' && other() === 'studio';
        if (PSX.has(PSX.W[lvl].studio, id) || studioKeeps) writes.push({ level: lvl, key: 'studio', id, value: studioKeeps ? ov : undefined });
        if (pick === 'own' && other() === 'homenas' && lvl === 'computer') writes.push({ level: 'computer', key: 'homenas', id, value: ov });
        if (pick !== 'every' && pick !== 'own' && !same(kv, ov)) lost.push(`${label(id)}: ${placeName('computer', other())}’s ${vt(id, ov)}`);
      });
      return { writes, lost };
    }
    const draw = (s) => {
      s.body.innerHTML = (S.runMode === 'yolo' ? `<div class="psx-fact psx-yolo">${mark('info')}<span><b>YOLO still asks here.</b> Which computer keeps your settings is your choice, and pairing was finished on both computers. Once you choose, the merge applies without another yes.</span></div>` : '')
        + `<div class="psx-copy-choice" role="radiogroup" aria-label="Keep them on">${['homenas', 'studio'].map((k) => `<label class="psx-radio${st.keepOn === k ? ' is-on' : ''}"><input type="radio" name="psx-keep" value="${k}"${st.keepOn === k ? ' checked' : ''}><span><b>${esc(placeName('computer', k))}</b><small>${k === 'homenas' ? 'Always on · 2 projects · suggested' : 'Mac mini · 1 project'}</small></span></label>`).join('')}</div>`
        + `<div class="psx-h">${JOIN.length} settings are different</div><ul class="psx-list">${JOIN.map(([id, , studioV], i) => {
          const def = DEF[id], screen = def && def.screen && !(def.may || []).includes('project');
          const kn = placeName('computer', st.keepOn), on = placeName('computer', other());
          return `<li class="psx-li psx-join"><span><span class="psx-li-name">${esc(label(id))}</span><span class="psx-li-sub" style="display:block">Home NAS: ${esc(vt(id, nas(id)))} · Studio Mac: ${esc(vt(id, studioV))}</span></span><span class="psx-li-end"><select class="psx-input" data-i="${i}" aria-label="${esc(label(id))}"><option value="keeper"${st.pick[i] === 'keeper' ? ' selected' : ''}>Keep ${esc(kn)}’s</option>${screen && other() === 'homenas' ? '' : `<option value="own"${st.pick[i] === 'own' ? ' selected' : ''}>Keep ${esc(on)}’s on ${screen ? 'its screen' : esc(on)}</option>`}<option value="every"${st.pick[i] === 'every' ? ' selected' : ''}>Use ${esc(on)}’s everywhere</option></select></span></li>`;
        }).join('')}</ul><details class="psx-adv"><summary><svg class="psx-chev" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M4.5 2.5 8 6l-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Show the 31 settings that already match</span></summary><p class="psx-p psx-muted">They are the same on both, so nothing changes for them.</p></details>`
        + `<p class="psx-p" style="margin-top:12px">${icon('lock')} Projects keep their own values. Nothing is lost: what isn’t kept stays in History, and you can undo this for 30 days.</p>`;
      s.body.querySelectorAll('input[name="psx-keep"]').forEach((x) => x.addEventListener('change', () => { st.keepOn = x.value; draw(s); s.setActions(acts()); }));
      s.body.querySelectorAll('select[data-i]').forEach((x) => x.addEventListener('change', () => { st.pick[+x.dataset.i] = x.value; }));
    };
    const acts = () => [{ label: 'Not now', run: (x) => x.close() }, { spacer: true }, { label: S.runMode === 'yolo' ? `Keep them on ${placeName('computer', st.keepOn)}` : 'Use one set of settings', primary: true, run: (x) => {
      x.close();
      PSX.run('cmd.server.settings_home.join', [700, 600], () => {
        const p = plan(), keeper = placeName('computer', st.keepOn), follower = placeName('computer', other());
        const tx = PSX.write(p.writes, { batch: 'join', yolo: S.runMode === 'yolo', text: `Studio Mac joined: one set of settings, kept on ${keeper}`, extra: { notKept: p.lost } });
        if (!tx) return;
        PSX.emit('redraw');
        PSX.note({ title: 'One set of settings.', body: `${keeper} keeps them; ${follower} follows from now on.${p.lost.length ? ` Not kept, and in History: ${list(p.lost, 2)}.` : ''}${S.runMode === 'yolo' ? ' The merge applied without another yes (YOLO).' : ''}`, mark: 'complete', ms: 9000, actions: [{ label: 'Undo', run: () => PSX.undoTx(tx.id) }] });
      });
    } }];
    const s = PSX.sheet({ title: 'Use one set of settings?', kicker: 'Studio Mac is paired', sub: 'Studio Mac and Home NAS were set up separately. From now on one keeps your settings.', size: 'wide', body: '', actions: acts() });
    draw(s);
  }

  /* ------------------------------------------------------------------ 11.7 A new computer joins */
  /* Office PC joins: pairing and its identity were finished on both computers (YOLO never accepts those). Done records it
     as part of your setup; with Start like This computer, This computer's own capacity values come along, in the same
     change. Programs and folders are found there, never copied (7.7) */
  function newComputer() {
    PSX.sheet({
      title: 'Office PC is ready', kicker: 'A new computer joins', sub: `Uses your settings from ${PSX.homeName()}. It follows them from now on.`,
      body: (S.runMode === 'yolo' ? `<div class="psx-fact psx-yolo">${mark('info')}<span><b>YOLO still asks here.</b> A new computer’s identity and pairing are finished by you on both computers; YOLO never accepts them.</span></div>` : '')
        + `<div class="psx-card"><div class="psx-fact">${mark('complete')}<span>Found on Office PC: Claude Code, Git, Docker.</span></div><div class="psx-fact">${mark('off')}<span>Not found: Jujutsu.</span></div><div class="psx-fact">${mark('complete')}<span>Its Projects folder: C:\\Users\\jared\\Projects, found automatically.</span></div></div>`
        + `<details class="psx-adv"><summary><svg class="psx-chev" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M4.5 2.5 8 6l-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Advanced: Start like This computer</span></summary><p class="psx-p">Copies This computer’s own capacity values to Office PC: Helpers at once, at most (3). Programs and folders are found on each computer, never copied.</p><label class="psx-check"><input type="checkbox" data-like><span>Start like This computer</span></label></details>`
        + `<p class="psx-p psx-muted" style="margin-top:10px">Its own computer settings start empty: it follows everywhere, except what Puppet Master finds on it.</p>`,
      actions: [{ label: 'Not now', run: (s) => s.close() }, { spacer: true }, { label: 'Done', primary: true, run: (s) => {
        const like = !!s.body.querySelector('[data-like]:checked');
        s.close();
        const writes = [{ level: 'joined', key: null, id: 'office', value: true }];
        if (like) Object.keys(PSX.W.computer.here || {}).forEach((id) => { if (DEF[id] && DEF[id].combine === 'computer_ceiling') writes.push({ level: 'computer', key: 'office', id, value: PSX.W.computer.here[id] }); });
        const tx = PSX.write(writes, { batch: 'join-office', text: `Office PC joined and follows your settings${like ? '; it started like This computer (Helpers at once, at most 3)' : ''}` });
        if (!tx) return;
        PSX.emit('redraw');
        PSX.note({ title: 'Office PC follows your settings.', body: like ? 'It started with This computer’s own Helpers at once, at most: 3.' : 'It has no own values yet.', mark: 'complete', actions: [{ label: 'Undo', run: () => PSX.undoTx(tx.id) }] });
      } }]
    });
  }

  /* ------------------------------------------------------------------ 11.12 An update changed defaults */
  function updateCard() {
    const text = `This update changed 2 defaults: ${label('ai.models.reasoning-effort')} (Medium to Let the model decide) and ${label('system.mcp.timeout')} (30 to 45 seconds). Keep the old ones?`;
    const act = [{ label: 'Keep the old ones', primary: true, run: () => { const tx = PSX.apply([{ level: 'everywhere', key: null, id: 'ai.models.reasoning-effort', value: 'medium' }, { level: 'everywhere', key: null, id: 'system.mcp.timeout', value: 30000 }], { batch: 'migrated', text: 'Kept the old defaults (source: migrated)' }); PSX.feed.push(); PSX.note({ title: 'Kept the old ones.', body: 'They are your everywhere values now.', actions: [{ label: 'Undo', run: () => PSX.undoTx(tx.id) }] }); } }, { label: 'Use the new ones', run: () => PSX.note({ title: 'Using the new defaults.', mark: 'complete' }) }];
    const home = D.querySelector('#pm-settings-root .home-page');
    if (home) {
      home.querySelectorAll('[data-psx-update]').forEach((n) => n.remove());
      const card = D.createElement('section'); card.className = 'panel-card psx-update'; card.setAttribute('data-psx-update', '1'); card.setAttribute('data-o55-foreign', ''); card.setAttribute('role', 'status');
      card.innerHTML = `<div class="psx-fact">${mark('info')}<span><b>An update changed defaults.</b> ${esc(text)}</span></div><div class="psx-wacts"></div>`;
      const wrap = card.querySelector('.psx-wacts');
      act.forEach((a) => { const b = D.createElement('button'); b.type = 'button'; b.className = 'psx-tb' + (a.primary ? ' is-primary' : ''); b.textContent = a.label; b.addEventListener('click', () => { card.remove(); a.run(); }); wrap.appendChild(b); });
      home.insertBefore(card, home.firstChild);
    } else PSX.note({ title: 'An update changed defaults', body: text, mark: 'info', sticky: true, actions: act });
  }

  /* ------------------------------------------------------------------ 11.13 Rules a project brings */
  /* A trust decision (S15): looser rules from someone else's repository stay held until you accept them, in YOLO too.
     The choice is kept as open-recipes' accepted rules, with Undo, and the sheet shows it when opened again */
  const RULES = [
    { id: 'ask-delete', name: 'Ask before deleting files', sub: 'As careful as yours', looser: false },
    { id: 'persona', name: 'Persona “Recipe tester”', sub: 'Its own persona, used only in open-recipes', looser: false },
    { id: 'run-free', name: 'Run commands without asking', sub: 'Looser than yours: you ask first', looser: true }
  ];
  function projectRules() {
    const cur = PSX.W.rules['open-recipes'];
    const state = (r) => (!cur ? (r.looser ? ['paused', 'Held until you accept it'] : ['waiting', 'Not used yet']) : cur.used.includes(r.id) ? ['complete', 'Used'] : r.looser ? ['paused', 'Held'] : ['off', 'Not used']);
    const choose = (used, title, body, mk) => {
      const tx = PSX.write([{ level: 'rules', key: null, id: 'open-recipes', value: { used, held: RULES.filter((r) => r.looser && !used.includes(r.id)).map((r) => r.id) } }], { batch: 'rules', text: `open-recipes: ${title}` });
      if (tx) PSX.note({ title, body, mark: mk || 'complete', actions: [{ label: 'Undo', run: () => PSX.undoTx(tx.id) }] });
      return tx;
    };
    PSX.confirm({
      title: 'This project brings its own rules. Use them?', kicker: 'open-recipes · forked from GitHub', sub: 'They came with the project’s files, from someone else’s repository.',
      guard: 'Accepting rules from someone else’s repository is a trust choice: YOLO never accepts a looser one for you.',
      body: `<ul class="psx-list">${RULES.map((r) => { const [mk, w] = state(r); return `<li class="psx-li"><span><span class="psx-li-name">${esc(r.name)}</span><span class="psx-li-sub" style="display:block">${esc(r.sub)}</span></span><span class="psx-li-end">${PSX.st(mk, w)}</span></li>`; }).join('')}</ul><p class="psx-p" style="margin-top:10px">A rule looser than yours is held until you accept it. Rules you set later are yours and stay apart.</p>`,
      cancelLabel: 'Use none of them',
      alt: [{ label: 'Accept the looser one too', run: () => choose(RULES.map((r) => r.id), 'open-recipes may run commands without asking.', 'You accepted its looser rule. Change it in Permissions.', 'warning') }],
      okLabel: 'Use the careful ones',
      ok: () => choose(RULES.filter((r) => !r.looser).map((r) => r.id), 'Using 2 of its 3 rules.', '“Run commands without asking” stays held.'),
      onOpen: (s) => { const b = s.foot.querySelector('.btn'); if (b) b.addEventListener('click', () => choose([], 'open-recipes uses your rules only.', 'All three of its rules stay unused.'), { once: true }); }
    });
  }

  /* ------------------------------------------------------------------ 11.14 Settings now apply everywhere (the fold) */
  function fold() {
    PSX.sheet({
      title: 'Settings now apply everywhere', kicker: 'One time, after this update', sub: 'Nothing you use changes.',
      body: `<div class="psx-card"><div class="psx-fact">${mark('complete')}<span><b>12 settings every project agreed on</b> became your everywhere values, and the projects’ copies were cleared.</span></div><div class="psx-fact">${mark('complete')}<span><b>Where projects disagreed</b>, each keeps its value as its own: 9 settings in 4 projects.</span></div><div class="psx-fact">${mark('complete')}<span><b>Program and folder settings</b> moved to the computer that does each project’s work.</span></div><div class="psx-fact">${mark('info')}<span><b>Text size</b> now belongs to each device: your most recent value, 14, is your everywhere value.</span></div></div>`
        + `<div class="psx-h">A suggestion</div><div class="psx-card"><div class="psx-fact">${mark('info')}<span>5 of 7 projects use Glass Dark. Make it your usual look?</span></div><div class="psx-wacts"><button type="button" class="psx-tb is-primary" data-fold="look">Make Glass Dark my usual look</button></div></div>`,
      actions: [{ spacer: true }, { label: 'Continue', primary: true, run: (s) => s.close() }],
      // the suggestion is a real everywhere write (the look pair as one), with Undo; the button says Saved only after it
      onOpen: (s) => s.body.querySelector('[data-fold]').addEventListener('click', (e) => {
        const b = e.currentTarget;
        const tx = PSX.write([{ level: 'everywhere', key: null, id: 'general.visual.theme', value: 'Glass Dark' }], { batch: 'fold-look', text: 'Glass Dark made your usual look (the fold’s suggestion)' });
        if (!tx) return;
        try { W.PM7_SETTINGS_TOME.applyPaint(K().getState()); } catch (x) { /* paints on the next feed */ }
        b.setAttribute('aria-disabled', 'true'); b.textContent = 'Saved: Glass Dark is your usual look';
        PSX.note({ title: 'Glass Dark is your usual look.', body: 'Every project without its own look uses it.', actions: [{ label: 'Undo', run: () => PSX.undoTx(tx.id, 'general.visual.theme') }] });
      })
    });
  }

  /* ------------------------------------------------------------------ 11.16 Filters and the Differences view
     The facets filter the list (Changed, Set here, Varies, Per computer, Per project). Rows that belong to one project or
     one computer only (its own rules, a program's place) are listed but can't be made everywhere values or removed in
     bulk; Make these everywhere refuses two different values for one setting, and every write is admitted first */
  function differences() {
    const st = { by: 'project', facet: null, pick: {} };
    const resolved = {};
    const res = (id) => (resolved[id] = resolved[id] || PSX.resolve(id, S.ctx));
    const all = () => {
      const out = [];
      Object.keys(DEF).forEach((id) => { const r = res(id); if (!r) return; r.varies.filter((v) => v.level !== 'provider' && v.key !== 'psx-none').forEach((v) => out.push({ id, level: v.level, key: v.key, value: v.value, every: r.everywhere !== undefined ? r.everywhere : DEFAULTS[id], def: DEF[id], r })); });
      return out;
    };
    const FACETS = {
      changed: (x) => x.r.changed, here: (x) => x.r.here && x.r.from.level === x.level && (x.r.from.key || '') === (x.key || ''),
      varies: () => true, comp: (x) => x.level === 'computer' || x.level === 'device', proj: (x) => x.level === 'project'
    };
    const counts = () => {
      let changed = 0, here = 0, varies = 0, perComp = 0, perProj = 0;
      Object.keys(DEF).forEach((id) => { const r = res(id); if (!r) return; if (r.changed) changed++; if (r.here) here++; const v = r.varies.filter((x) => x.level !== 'provider' && x.key !== 'psx-none'); if (v.length) varies++; if (v.some((x) => x.level === 'computer' || x.level === 'device')) perComp++; if (v.some((x) => x.level === 'project')) perProj++; });
      return { changed, here, varies, perComp, perProj };
    };
    const draw = (s) => {
      Object.keys(resolved).forEach((k) => delete resolved[k]);
      const c = counts(), d = all().filter((x) => !st.facet || FACETS[st.facet](x));
      const facet = (k, n, w) => `<button type="button" class="psx-tb${st.facet === k ? ' is-primary' : ''}" aria-pressed="${st.facet === k}" data-f="${k}">${esc(w)} <span class="psx-muted">${n}</span></button>`;
      const groups = {};
      d.forEach((x) => { const g = st.by === 'project' ? (x.level === 'project' ? x.key : null) : (x.level !== 'project' ? placeName(x.level, x.key) : null); if (g) (groups[g] = groups[g] || []).push(x); });
      const keyOf = (x) => `${x.id}|${x.level}|${x.key}`;
      const only = (x) => !!x.def.home;
      s.body.innerHTML = `<div class="psx-facets" role="group" aria-label="Filters">${facet('changed', c.changed, 'Changed')}${facet('here', c.here, 'Set here')}${facet('varies', c.varies, 'Varies')}${facet('comp', c.perComp, 'Per computer')}${facet('proj', c.perProj, 'Per project')}</div>`
        + `<p class="psx-p">You changed ${c.changed} settings. ${c.perProj} differ by project and ${c.perComp} by computer or device.${st.facet ? ` Showing ${d.length} difference${d.length === 1 ? '' : 's'}.` : ''}</p>`
        + `<div class="psx-facets" role="radiogroup" aria-label="Group the differences">${['project', 'computer'].map((b) => `<button type="button" class="psx-tb${st.by === b ? ' is-primary' : ''}" role="radio" aria-checked="${st.by === b}" data-by="${b}">By ${b}</button>`).join('')}</div>`
        + Object.keys(groups).sort().map((g) => `<div class="psx-h">${esc(g)}</div><ul class="psx-list">${groups[g].map((x) => `<li class="psx-li">${only(x) ? `<span class="psx-check"><span>${esc(label(x.id))} · ${esc(st.by === 'project' ? x.key : placeName(x.level, x.key))}: ${esc(vt(x.id, x.value))}<small>${esc(x.def.home === 'project' ? 'Belongs to this project only, so it can’t be an everywhere value' : 'Belongs to this computer only')}</small></span></span>` : `<label class="psx-check"><input type="checkbox" data-k="${esc(keyOf(x))}"${st.pick[keyOf(x)] ? ' checked' : ''}><span>${esc(label(x.id))} · ${esc(st.by === 'project' ? x.key : placeName(x.level, x.key))}: ${esc(vt(x.id, x.value))} <span class="psx-muted">(everywhere: ${esc(vt(x.id, x.every))})</span></span></label>`}<span class="psx-li-end">${only(x) ? '' : `<button type="button" class="psx-tb" data-one="same" data-k="${esc(keyOf(x))}">Same as everywhere</button><button type="button" class="psx-tb" data-one="make" data-k="${esc(keyOf(x))}">Make it the everywhere value</button>`}</span></li>`).join('')}</ul>`).join('')
        + (Object.keys(groups).length ? '' : `<p class="psx-p psx-muted">${st.facet ? 'No differences with this filter.' : 'No differences.'}</p>`);
      const byKey = {}; all().forEach((x) => { byKey[keyOf(x)] = x; });
      // Per computer and Per project also pick the grouping they mean, so the filtered list is never empty by grouping
      s.body.querySelectorAll('[data-f]').forEach((b) => b.addEventListener('click', () => { st.facet = st.facet === b.dataset.f ? null : b.dataset.f; if (st.facet === 'comp') st.by = 'computer'; if (st.facet === 'proj') st.by = 'project'; draw(s); const f = s.body.querySelector(`[data-f="${b.dataset.f}"]`); if (f) f.focus(); }));
      s.body.querySelectorAll('[data-by]').forEach((b) => b.addEventListener('click', () => { st.by = b.dataset.by; draw(s); }));
      s.body.querySelectorAll('input[data-k]').forEach((x) => x.addEventListener('change', () => { st.pick[x.dataset.k] = x.checked; }));
      // one line: Same as everywhere and Make it the everywhere value are the panel's own actions (previews, safety)
      s.body.querySelectorAll('[data-one]').forEach((b) => b.addEventListener('click', () => { const x = byKey[b.dataset.k]; if (!x) return; if (b.dataset.one === 'same') PSX.setOwn(x.id, { level: x.level, key: x.key }, undefined); else PSX.panel.promote(x.id, { level: x.level, key: x.key, value: x.value }); setTimeout(() => { if (s.back.isConnected) draw(s); }, 60); }));
      s.setActions([{ label: 'Close', run: () => s.close() }, { spacer: true },
        { label: 'Remove these differences', run: () => bulk('remove') },
        { label: 'Make these everywhere', primary: true, run: () => bulk('make') }]);
      function bulk(kind) {
        const xs = Object.keys(st.pick).filter((k) => st.pick[k]).map((k) => byKey[k]).filter((x) => x && !x.def.home);
        if (!xs.length) { PSX.note({ title: 'Tick some differences first.', mark: 'info' }); return; }
        if (kind === 'make') {
          const byId = {}; xs.forEach((x) => { (byId[x.id] = byId[x.id] || []).push(x); });
          const clash = Object.keys(byId).filter((id) => new Set(byId[id].map((x) => JSON.stringify(x.value))).size > 1);
          if (clash.length) { const id = clash[0]; PSX.note({ title: 'Choose one value first', body: `${label(id)} has ${list(byId[id].map((x) => `${placeName(x.level, x.key)}’s ${vt(id, x.value)}`))} ticked. Untick all but one, then make it everywhere. Nothing was changed.`, mark: 'info', kind: 'refused' }); return; }
        }
        let writes = [], keptFor = [];
        xs.forEach((x) => {
          if (kind === 'make') writes.push({ level: 'everywhere', key: null, id: x.id, value: x.value });
          writes.push({ level: x.level, key: x.key, id: x.id, value: undefined });
        });
        // on a safety row, an own value that keeps a project careful is kept (as with Make one the everywhere value)
        [...new Set(xs.map((x) => x.id))].filter((id) => DEF[id].safety).forEach((id) => {
          if (PSX.simulate(writes.filter((w) => w.id === id), id).looser.length) { writes = writes.filter((w) => !(w.id === id && w.value === undefined)); keptFor.push(label(id)); }
        });
        const ids = [...new Set(writes.map((w) => w.id))];
        const changes = ids.reduce((n, id) => n + PSX.simulate(writes.filter((w) => w.id === id), id).changes.length, 0);
        const safety = ids.filter((id) => DEF[id].safety);
        const go = (y) => {
          const tx = PSX.write(writes, { batch: kind, yolo: !!(y && y.yolo), text: `${kind === 'make' ? 'Made' : 'Removed'} ${xs.length} difference${xs.length === 1 ? '' : 's'}` }, { atomic: false });
          if (!tx) return null;
          st.pick = {}; if (s.back.isConnected) draw(s);
          const missed = tx.missed.length ? ` Not changed: ${list(tx.missed.map((m) => `${placeName(m.write.level, m.write.key)} (${m.text})`), 2)}. Nothing was queued.` : '';
          if (!(y && y.yolo)) PSX.note({ title: kind === 'make' ? `${xs.length} made everywhere values.` : `${xs.length} differences removed.`, body: `${changes} project values changed.${keptFor.length ? ` For safety, the careful own values of ${list(keptFor)} were kept.` : ''}${missed}`, actions: [{ label: 'Undo', run: () => { PSX.undoTx(tx.id); if (s.back.isConnected) draw(s); } }] });
          return tx;
        };
        // one look first when the batch touches a safety row (1.7); in YOLO it is the report
        if (safety.length) PSX.confirm({ title: `${kind === 'make' ? 'Make these everywhere' : 'Remove these differences'}?`, kicker: 'Includes a safety setting', body: `<p class="psx-p">${mark('info')} <b>${xs.length} difference${xs.length === 1 ? '' : 's'}, ${changes} project value${changes === 1 ? '' : 's'} change.</b> ${esc(list(safety.map((id) => label(id))))} ${safety.length === 1 ? 'is a safety setting' : 'are safety settings'}.</p>${keptFor.length ? `<p class="psx-p">${mark('warning')} For safety, the careful own values of ${esc(list(keptFor))} are kept.</p>` : ''}`, okLabel: kind === 'make' ? 'Make these everywhere' : 'Remove them', ok: go, report: { title: kind === 'make' ? `${xs.length} made everywhere values.` : `${xs.length} differences removed.`, body: `${changes} project values changed.` } });
        else go();
      }
    };
    const s = PSX.sheet({ title: 'All settings: the differences', kicker: 'All Settings', sub: 'Every project’s and computer’s own values, in one place.', size: 'wide', body: '' });
    draw(s);
  }

  /* ------------------------------------------------------------------ 11.17 A batch that can't finish
     One batch with one receipt: the part whose computer is off is left as it is, never queued. The batch keeps the
     exact values it copied, so Finish brings those (and says if tastebook has changed since), and Finish joins the
     batch, so its "Undo all of it" undoes every part */
  function batchCopy() {
    studio(false);
    const targets = ['harbor', 'loom', 'docs-site', 'legacy-app', 'lighting-rig'];
    const ids = Object.keys(PSX.W.project.tastebook).filter((id) => DEF[id] && !DEF[id].home);
    PSX.sheet({
      title: 'Copy tastebook’s settings to other projects', kicker: 'Settings Transfer · Advanced', sub: `${ids.length} of tastebook’s own settings, into each project you tick.`,
      body: `<ul class="psx-list">${targets.map((p) => `<li class="psx-li"><label class="psx-check"><input type="checkbox" checked value="${p}"><span>${esc(p)}<small>works on ${esc(placeName('computer', PSX.projectById(p).home))}${p === 'lighting-rig' ? ' · Studio Mac is off' : ''}</small></span></label></li>`).join('')}</ul><p class="psx-p psx-muted" style="margin-top:10px">One batch with one receipt and one Undo. A part whose computer is off is not changed and not queued.</p>`,
      actions: [{ label: 'Cancel', run: (s) => s.close() }, { spacer: true }, { label: 'Copy into 5 projects', primary: true, run: (s) => {
        const picked = [...s.body.querySelectorAll('input:checked')].map((x) => x.value);
        s.close();
        PSX.run('cmd.settings.transaction.apply', [600, 500], () => {
          const payload = {}; picked.forEach((p) => { payload[p] = ids.map((id) => ({ level: 'project', key: p, id, value: clone(PSX.W.project.tastebook[id]) })); });
          const writes = [].concat(...picked.map((p) => payload[p]));
          const tx = PSX.write(writes, { batch: 'copy-many', text: `Copied tastebook’s settings into some of ${picked.length} projects`, extra: { ids, payload } }, { atomic: false });
          if (!tx) return;
          const missed = [...new Set(tx.missed.map((m) => m.write.key))];
          const done = picked.filter((p) => !missed.includes(p));
          tx.meta.extra.missed = missed;
          const h = PSX.W.history.find((e) => e.tx === tx.id); if (h) { h.text = `Copied tastebook’s settings into ${done.length} of ${picked.length} projects`; h.extra = tx.meta.extra; }
          PSX.note({ title: `${done.length} of ${picked.length} done.`, body: missed.length ? `${list(missed)} wasn’t changed because Studio Mac is off. Nothing is queued: History offers Finish ${list(missed)} when Studio Mac answers.` : '', mark: missed.length ? 'warning' : 'complete', ms: 12000, actions: [{ label: 'Open History', run: () => PSX.history.open() }, { label: 'Undo', run: () => PSX.undoTx(tx.id) }] });
        });
      } }]
    });
  }
  function finishMissed(e) {
    const missed = (e.extra && e.extra.missed) || [];
    const ready = missed.filter((p) => PSX.answering(PSX.projectById(p).home));
    if (!ready.length) { PSX.note({ title: 'Not yet', body: 'Studio Mac is still off. Nothing is queued.', mark: 'offline' }); return; }
    const writes = [].concat(...ready.map((p) => (e.extra.payload && e.extra.payload[p]) || []));
    const drift = (e.extra.ids || []).filter((id) => !same(PSX.W.project.tastebook[id], (writes.find((w) => w.id === id) || {}).value));
    PSX.run('cmd.settings.transaction.apply', [500], () => {
      const tx = PSX.write(writes, { batch: 'finish', text: `Finished ${list(ready)}, part of the copy from tastebook` });
      if (!tx) return;
      const orig = PSX.W.batches[e.tx]; if (orig) orig.links.push(tx.id);
      e.extra.missed = missed.filter((p) => !ready.includes(p));
      PSX.W.history = PSX.W.history.filter((x) => x.tx !== tx.id);     // the finished part is the original batch's
      PSX.note({ title: `Finished ${list(ready)}.`, body: `With the values the batch copied${drift.length ? `; tastebook has changed ${list(drift.map((id) => label(id)), 2)} since, so copy again to bring that` : ''}. “Undo all of it” on the batch now undoes this part too.`, actions: [{ label: 'Undo all of it', run: () => PSX.undoTx(e.tx) }] });
      if (PSX.history.sheet && PSX.history.sheet.back.isConnected) PSX.history.draw();
    });
  }

  /* ------------------------------------------------------------------ 11.18 What asks you, in Regular and in YOLO
     loom's chat, one run: every action that can ask, and what it does in the run mode the strip shows. Ordinary tool
     asks and git push or publish don't ask in YOLO (Jared, 2026-11-03); a path outside the project, a deletion on the
     remote and a looser rule from someone else's repository still ask. No skipped ask becomes an Always rule (S16) */
  const ASKS = [
    { id: 'test', what: 'Run npm test', cmd: 'npm test', kind: 'tool', path: false, yolo: 'run', report: 'Ran npm test: 214 passed.' },
    { id: 'push', what: 'Push to GitHub', cmd: 'git push origin feature/tags', kind: 'push', yolo: 'run', report: 'Pushed 3 commits to origin/feature/tags. A push can’t be undone exactly; a later push can change it back.' },
    { id: 'publish', what: 'Publish the image', cmd: 'docker push ghcr.io/jared/loom:1.4.0', kind: 'publish', yolo: 'run', report: 'Published ghcr.io/jared/loom:1.4.0 (private). A published image can’t be unpublished by Undo.' },
    { id: 'outside', what: 'Read a folder outside loom', cmd: 'read ~/Documents/taxes', kind: 'path', path: true, yolo: 'ask', why: 'A path outside the project that isn’t granted still asks.' },
    { id: 'delete', what: 'Delete a branch on GitHub', cmd: 'git push origin --delete old-ui', kind: 'remote-delete', yolo: 'ask', why: 'Deleting on the remote still asks, naming the branch (Y1).' }
  ];
  function approvals() {
    const st = { done: {}, rules: [] };
    const yolo = () => S.runMode === 'yolo';
    const draw = (s) => {
      s.body.innerHTML = `<p class="psx-p">“Tag the release and ship it.” What each step does in ${yolo() ? '<b>YOLO</b>' : '<b>Regular</b>'}; switch Run mode in the strip to see the other.</p>`
        + `<ul class="psx-list psx-ask">${ASKS.map((a) => {
          const d = st.done[a.id];
          let end = '';
          if (d) end = PSX.st(d.mark, d.word);
          else if (yolo() && a.yolo === 'run') end = PSX.st('working', 'Runs without asking');
          else end = `<button type="button" class="psx-tb is-primary" data-ask="${a.id}" data-a="once">Allow once</button>${a.kind === 'tool' || a.kind === 'path' ? `<button type="button" class="psx-tb" data-ask="${a.id}" data-a="always" aria-haspopup="menu">Always allow…</button>` : ''}<button type="button" class="psx-tb" data-ask="${a.id}" data-a="no">Don’t allow</button>`;
          const sub = d ? d.text : yolo() && a.yolo === 'ask' ? `YOLO still asks: ${a.why}` : yolo() ? 'No yes needed in YOLO; the chat reports what ran.' : a.kind === 'push' || a.kind === 'publish' ? 'Regular asks before a push or a publish.' : 'Regular asks before it runs.';
          return `<li class="psx-li"><span><span class="psx-li-name">${esc(a.what)}</span><span class="psx-li-sub" style="display:block"><code>${esc(a.cmd)}</code> · ${esc(sub)}</span></span><span class="psx-li-end">${end}</span></li>`;
        }).join('')}<li class="psx-li"><span><span class="psx-li-name">Use the looser rule open-recipes brings</span><span class="psx-li-sub" style="display:block">Held in both run modes until you accept it (S15). See moment 11.13.</span></span><span class="psx-li-end">${PSX.st('paused', 'Held')}</span></li></ul>`
        + `<div class="psx-h">Always rules</div>${st.rules.length ? `<ul class="psx-list">${st.rules.map((r) => `<li class="psx-li"><span class="psx-li-name"><code>${esc(r.cmd)}</code></span><span class="psx-li-end psx-muted">${esc(r.where)}</span></li>`).join('')}</ul>` : `<p class="psx-p psx-muted">None made. ${yolo() ? 'YOLO skips the asks, so it makes no Always rule; you can still make one in Permissions, choosing its pattern and its place.' : 'Always allow asks where it applies: This project, This computer or Everywhere, never chosen for you, and never Everywhere for a path.'}</p>`}`;
      s.body.querySelectorAll('[data-ask]').forEach((b) => b.addEventListener('click', () => {
        const a = ASKS.find((x) => x.id === b.dataset.ask);
        if (b.dataset.a === 'once') { st.done[a.id] = { mark: 'complete', word: 'Allowed once', text: a.report || 'Allowed once.' }; draw(s); }
        else if (b.dataset.a === 'no') { st.done[a.id] = { mark: 'off', word: 'Not allowed', text: 'Not run. The assistant stops at this step and says why.' }; draw(s); }
        else PSX.menu(b, [
          { label: 'In this project', meta: 'loom', run: () => always(a, 'Always in loom', s) },
          { label: 'On this computer', meta: 'This computer', run: () => always(a, 'Always on This computer', s) },
          { label: 'Everywhere', meta: a.path ? 'never for a path' : 'every project and computer', disabled: a.path ? 'A path means something on one computer only' : null, run: () => always(a, 'Always, everywhere', s) }
        ], { label: 'Always allow, where?', width: 280 });
      }));
      s.setActions([{ label: 'Run it again', run: () => PSX.approvals.draw() }, { spacer: true }, { label: 'Close', primary: true, run: () => s.close() }]);
    };
    const always = (a, where, s) => { st.rules.push({ cmd: a.cmd, where }); st.done[a.id] = { mark: 'complete', word: 'Allowed', text: `${a.report} Always rule: ${where}.` }; draw(s); PSX.note({ title: `Always allowed ${a.cmd}.`, body: `${where}. Change it in Permissions.`, mark: 'complete' }); };
    const s = PSX.sheet({ title: 'What asks you', kicker: 'loom’s chat · one run', sub: 'Approvals in Regular and in YOLO.', size: 'wide', body: '' });
    // in YOLO the steps that don't ask have run by the time you look: the chat shows the report for each. A new run
    // mode is a new run, so the strip's switch shows the other mode's answers at once
    const start = () => { st.done = {}; if (yolo()) ASKS.filter((a) => a.yolo === 'run').forEach((a) => { st.done[a.id] = { mark: 'complete', word: 'Ran, not asked', text: a.report }; }); draw(s); };
    PSX.approvals = { sheet: s, draw: () => { if (s.back.isConnected) start(); } };
    start();
  }

  /* ------------------------------------------------------------------ History (Settings › History, in the layer) */
  PSX.history = {
    sheet: null,
    open() {
      const s = PSX.sheet({ title: 'Setting changes', kicker: 'History', sub: 'Each change, where it applies, and from which device.', size: 'wide', body: '' });
      PSX.history.sheet = s; PSX.history.draw();
    },
    draw() {
      const s = PSX.history.sheet; if (!s || !s.back.isConnected) return;
      const items = PSX.W.history.slice(0, 40);
      const who = (e) => `${e.by === 'assistant' ? 'the assistant' : (PSX.DEVICES[e.from] || COMPUTERS[e.from] || { name: e.from || 'This computer' }).name}${e.yolo ? ' · in YOLO, no yes asked' : ''}`;
      s.body.innerHTML = `<ul class="psx-list">${items.map((e, i) => {
        const text = e.text || `${label(e.sid)}: ${e.before === undefined ? 'set to ' + vt(e.sid, e.after) : e.after === undefined ? vt(e.sid, e.before) + ' taken away' : vt(e.sid, e.before) + ' to ' + vt(e.sid, e.after)}, ${e.level === 'everywhere' ? 'everywhere' : 'for ' + placeName(e.level, e.key)}`;
        const tx = e.tx && PSX.W.batches[e.tx];
        let act = '';
        if (e.extra && e.extra.missed && e.extra.missed.length) act += `<button type="button" class="psx-tb${PSX.answering('studio') ? ' is-primary' : ''}" data-finish="${i}"${PSX.answering('studio') ? '' : ' aria-disabled="true"'}>Finish ${esc(list(e.extra.missed))}</button>`;
        if (tx && !tx.undone) act += `<button type="button" class="psx-tb" data-undo="${esc(e.tx)}">${e.batch ? 'Undo all of it' : 'Undo'}</button>`;
        const sub = e.extra && e.extra.notKept && e.extra.notKept.length ? ` · not kept: ${list(e.extra.notKept, 3)}` : '';
        return `<li class="psx-li"><span><span class="psx-li-name">${esc(text)}</span><span class="psx-li-sub" style="display:block">${esc(e.when)} · ${esc(who(e))}${esc(sub)}</span></span><span class="psx-li-end">${act}</span></li>`;
      }).join('')}</ul>`;
      s.body.querySelectorAll('[data-undo]').forEach((b) => b.addEventListener('click', () => { PSX.undoTx(b.dataset.undo); PSX.history.draw(); }));
      s.body.querySelectorAll('[data-finish]').forEach((b) => b.addEventListener('click', () => { if (b.getAttribute('aria-disabled') === 'true') { PSX.note({ title: 'Not yet', body: 'Studio Mac is still off. Nothing is queued.', mark: 'offline' }); return; } finishMissed(items[+b.dataset.finish]); }));
      s.setActions([{ spacer: true }, { label: 'Close', primary: true, run: () => s.close() }]);
    }
  };

  /* ------------------------------------------------------------------ running and resetting */
  function reset() {
    if (guideEl) { guideEl.remove(); guideEl = null; }
    Object.keys(ORIGINAL_DEFAULTS).forEach((k) => { DEFAULTS[k] = ORIGINAL_DEFAULTS[k]; });
    S.conflict = null; S.conflictArmed = null; S.firstStart = false; S.ownLook = false; S.mcpProject = null; S.actor = 'here';
    PSX.H.removeAttribute('data-psx-first');
    D.querySelectorAll('[data-psx-update], [data-psx-first]').forEach((n) => n.remove());
    closePanel();
    // the managers' own drawers and menus close too, so a moment never opens over the last one's screen
    D.querySelectorAll('#pm-settings-portals .pm51-drawer-wrap [data-action="close-overlay"]').forEach((b) => { try { b.click(); } catch (e) { /* gone */ } });
    try { if (W.PM51 && W.PM51.closePopouts) W.PM51.closePopouts(); } catch (e) { /* none open */ }
    try { if (W.PMR && W.PMR.menu && W.PMR.menu.isOpen()) W.PMR.menu.closeAll(); } catch (e) { /* closed */ }
  }
  async function run(id) {
    const fn = M[id]; if (!fn) return;
    // every moment starts from a fresh demo: the world, defaults, computers, the device in use and the context
    if (PSX.reset) PSX.reset({ keepMoment: true }); else { reset(); PSX.closeSheets(); }
    await wait(120);
    S.moment = id;
    try { await fn(); } catch (e) { console.error('[psx moment]', id, e); }
    PSX.report && PSX.report('state');
  }
  PSX.moments = { run, reset, homenas, studio, intercept, differences, list: Object.keys(M) };
})(window);
