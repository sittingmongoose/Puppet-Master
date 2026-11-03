/* Settings that apply everywhere (Opus 5.5): the moments (BUILD-SPEC section 11) and History.

   Each moment is reachable from the review strip and resets cleanly (Reset demo, or the next moment). Each changes the
   demo world only after its simulated owner result and names the command it stands for. Every value is [Demo only]. */
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
      if (away.length) PSX.note({ title: 'Home NAS is back.', body: `While Home NAS was away you changed ${away.length} setting${away.length === 1 ? '' : 's'} just for this computer. Make ${away.length === 1 ? 'it' : 'them'} everywhere?`, mark: 'info', ms: 12000, actions: [{ label: 'Review', primary: true, run: () => reviewAway(away) }] });
      else PSX.note({ title: 'Home NAS is back.', body: 'Everything is current again.', mark: 'complete' });
    }
  }
  function reviewAway(away) {
    const body = `<p class="psx-p">These were saved just for ${esc(placeName('computer', 'here'))} while Home NAS was away. Nothing was queued.</p><ul class="psx-list">${away.map((x, i) => `<li class="psx-li"><label class="psx-check"><input type="checkbox" checked data-i="${i}"><span>${esc(label(x.id))}: ${esc(vt(x.id, x.value))}<small>Just this computer for now</small></span></label></li>`).join('')}</ul>`;
    PSX.sheet({ title: 'Make them everywhere?', kicker: 'Home NAS is back', body, actions: [{ label: 'Keep them on this computer', run: (s) => s.close() }, { spacer: true }, { label: 'Make these everywhere', primary: true, run: (s) => {
      const picked = [...s.body.querySelectorAll('input:checked')].map((x) => away[+x.dataset.i]);
      s.close();
      const writes = []; picked.forEach((x) => { writes.push({ level: 'everywhere', key: null, id: x.id, value: x.value }, { level: 'computer', key: 'here', id: x.id, value: undefined }); });
      const tx = PSX.apply(writes, { batch: 'away', text: `${picked.length} change${picked.length === 1 ? '' : 's'} made while Home NAS was away, made everywhere` });
      PSX.W.awayWrites = [];
      PSX.feed.push();
      PSX.note({ title: 'Saved for everywhere.', body: `${list(picked.map((x) => label(x.id)))} now ${picked.length === 1 ? 'applies' : 'apply'} everywhere.`, actions: [{ label: 'Undo', run: () => PSX.undoTx(tx.id) }] });
    } }] });
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
      PSX.note({ title: `${label(id)} wasn’t changed`, body: `It was just changed on Studio Mac to ${vt(id, theirs)}. Choose in the panel.`, mark: 'change-conflict', kind: 'conflict' });
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
    b1.addEventListener('click', () => { S.conflict = null; PSX.emit('redraw'); PSX.note({ title: `${label(id)} stays ${vt(id, c.theirs)}.`, body: 'Studio Mac’s change is kept.', mark: 'complete' }); });
    b2.addEventListener('click', () => { S.conflict = null; PSX.setOwn(id, { level: 'everywhere', key: null }, c.mine); });
    acts.appendChild(b1); acts.appendChild(b2); card.appendChild(acts);
    body.insertBefore(card, body.firstChild);
    setTimeout(() => { try { b1.focus({ preventScroll: true }); } catch (e) { /* gone */ } }, 30);
  }

  /* ------------------------------------------------------------------ a small guide card (11.3), non-modal */
  let guideEl = null;
  function guide(steps) {
    if (guideEl) guideEl.remove();
    let i = 0;
    guideEl = D.createElement('div'); guideEl.className = 'psx-guide'; guideEl.setAttribute('role', 'region'); guideEl.setAttribute('aria-label', 'Guided walk'); guideEl.setAttribute('data-lg-surface', 'menu'); guideEl.setAttribute('data-lg-dense', '');
    PSX.portal().appendChild(guideEl);
    const draw = () => {
      const s = steps[i];
      guideEl.innerHTML = `<div class="psx-kicker">Step ${i + 1} of ${steps.length}</div><div class="psx-guide-title">${esc(s.title)}</div><p class="psx-p">${esc(s.text)}</p><div class="psx-wacts">${s.act ? `<button type="button" class="psx-tb is-primary" data-g="act">${esc(s.act)}</button>` : ''}${i < steps.length - 1 ? '<button type="button" class="psx-tb" data-g="next">Next step</button>' : ''}<button type="button" class="psx-tb is-quiet" data-g="close">Close the walk</button></div>`;
      guideEl.querySelectorAll('[data-g]').forEach((b) => b.addEventListener('click', async () => {
        if (b.dataset.g === 'act' && s.run) await s.run();
        else if (b.dataset.g === 'next') { i++; if (steps[i].enter) await steps[i].enter(); draw(); }
        else if (b.dataset.g === 'close') { guideEl.remove(); guideEl = null; }
      }));
    };
    if (steps[0].enter) Promise.resolve(steps[0].enter()).then(draw); else draw();
  }

  /* ------------------------------------------------------------------ the moments */
  const M = {};
  M['11.1'] = async () => { await go('ai', 'providers', ['providers', 'models']); homenas(false); await reveal('ai.models.default-model'); PSX.note({ title: 'Home NAS isn’t answering', body: 'Change Everyday model: it can’t change everywhere now, and nothing is queued. Set Home NAS back to Answering in the strip afterwards.', mark: 'offline', ms: 9000 }); };
  M['11.2'] = async () => { await go('general', 'app-input'); await reveal('general.visual.font-size'); S.conflictArmed = 'general.visual.font-size'; await wait(300); await personChange('general.visual.font-size', 15); };
  M['11.3'] = async () => {
    await go('source', 'source-manager');
    guide([
      { title: 'A row that comes from tastebook’s own', text: 'Main branch name reads “This project”: tastebook has its own (trunk). A change there writes tastebook, and the note says so.', act: 'Change it to main-line', enter: async () => { await reveal('branching.worktrees.default-branch'); }, run: () => personChange('branching.worktrees.default-branch', 'main-line') },
      { title: 'A row that follows everywhere', text: 'Everyday model reads “Varies”: it comes from everywhere and docs-site has its own. A change writes everywhere; the note offers “Only for tastebook”.', act: 'Change it to GPT-5', enter: async () => { closePanel(); await go('ai', 'providers', ['providers', 'models']); }, run: () => personChange('ai.models.default-model', 'openai/gpt-5') },
      { title: 'Make it narrower in one click', text: 'Choose “Only for tastebook” in the note. Everywhere goes back to Claude Opus 4, tastebook keeps GPT-5, and the row’s word becomes “This project”.', act: 'Only for tastebook', run: () => { const tx = Object.values(PSX.W.batches).reverse().find((x) => x.writes[0] && x.writes[0].id === 'ai.models.default-model' && x.writes[0].level === 'everywhere' && !x.undone); if (tx) PSX.onlyFor('ai.models.default-model', tx, { level: 'project', key: 'tastebook' }); } }
    ]);
  };
  M['11.4'] = async () => { await go('ai', 'providers', ['providers', 'limits']); await reveal('ai.accounts.hard-switch-level'); await wait(300); await personChange('ai.accounts.hard-switch-level', 15); };
  M['11.5'] = async () => { await go('system', 'servers', ['servers', 'servers']); moveHome(); };
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
    const id = 'ai.models.reasoning-effort';
    const tx = PSX.apply([{ level: 'project', key: 'loom', id, value: 'high' }], { by: 'assistant' });
    PSX.feed.push();
    PSX.note({ title: 'The assistant set Thinking depth to High for loom.', body: 'In loom’s chat: “Raise the thinking depth here.” It wrote the narrowest place, this project.', mark: 'complete', actions: [{ label: 'Undo', run: () => PSX.undoTx(tx.id, id) }], ms: 8000 });
    await wait(1600);
    const f = PSX.followers('ai.models.default-model', 'openai/gpt-5');
    PSX.sheet({
      title: 'Change Everyday model everywhere?', kicker: 'The assistant asks · loom’s chat',
      body: `<p class="psx-p">“Use GPT-5 as the everyday model everywhere.”</p><p class="psx-p">${mark('info')} <b>This changes ${f.changes.length} projects.</b> ${esc(list(f.keeps))} ${f.keeps.length === 1 ? 'keeps its' : 'keep their'} own.</p><p class="psx-p psx-muted">An assistant changes the narrowest place a setting allows unless you say yes here.</p>`,
      actions: [{ label: 'Cancel', run: (s) => s.close() }, { spacer: true }, { label: 'Only for loom', run: (s) => { s.close(); const t2 = PSX.apply([{ level: 'project', key: 'loom', id: 'ai.models.default-model', value: 'openai/gpt-5' }], { by: 'assistant' }); PSX.feed.push(); PSX.note({ title: 'The assistant set Everyday model to GPT-5 for loom.', actions: [{ label: 'Undo', run: () => PSX.undoTx(t2.id) }] }); } }, { label: 'Change everywhere', primary: true, run: (s) => { s.close(); const t2 = PSX.apply([{ level: 'everywhere', key: null, id: 'ai.models.default-model', value: 'openai/gpt-5' }], { by: 'assistant' }); PSX.feed.push(); PSX.note({ title: 'The assistant set Everyday model to GPT-5 everywhere.', body: `${list(f.keeps)} keeps its own.`, actions: [{ label: 'Undo', run: () => PSX.undoTx(t2.id) }] }); } }]
    });
  };
  M['11.11'] = async () => { PSX.setCtx({ device: 'ipad' }); await go('general', 'app-input'); await reveal('general.visual.font-size'); PSX.note({ title: 'You’re using Sam’s iPad', body: 'A Member’s device: it can change only its own screen settings. Try Change on any other line.', mark: 'info', ms: 8000 }); };
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
    W.PM_ACTIVE_PROJECT_ID = 'none';
    const lab = D.getElementById('projectMenuLabel'); if (lab) lab.textContent = 'No project';
    try { K().reloadProject(); } catch (e) { /* ignore */ }
    PSX.rows.refreshAll();
    await go('ai', 'providers', ['providers', 'models']);
    PSX.note({ title: 'First start', body: 'Nothing is set up yet, so Settings is a preview in Basic Dark and no change is kept. Reset demo ends the moment.', mark: 'info', ms: 9000 });
  };
  M['11.16'] = async () => differences();
  M['11.17'] = async () => { await go('system', 'settings-transfer'); batchCopy(); };
  M.copy = async () => { await go('system', 'settings-transfer'); PSX.copy.open({ mode: 'settings' }); };
  M['copy-new'] = async () => { PSX.copy.open({ mode: 'new', comp: 'homenas', advanced: true }); };

  /* ------------------------------------------------------------------ 11.5 Move where your settings are kept */
  function moveHome() {
    const st = { to: 'here', inFlight: false, lost: PSX.W.up.homenas === false };
    const draw = (s) => {
      const freshness = `This computer’s copy is from ${PSX.W.asOf}. Changes after that may be lost.`;
      s.body.innerHTML = `<div class="psx-copy-choice" role="radiogroup" aria-label="Keep your settings on">${['here', 'studio'].map((k) => `<label class="psx-radio${st.to === k ? ' is-on' : ''}"><input type="radio" name="psx-home" value="${k}"${st.to === k ? ' checked' : ''}><span><b>${esc(placeName('computer', k))}</b><small>${esc(COMPUTERS[k].detail)}</small></span></label>`).join('')}</div>`
        + `<div class="psx-h">What happens</div><div class="psx-card">`
        + (st.lost
          ? `<div class="psx-fact">${mark('offline')}<span>Home NAS hasn’t answered for a while. Make ${esc(placeName('computer', st.to))} keep your settings from its own copy.</span></div><div class="psx-fact">${mark('warning')}<span>${esc(freshness)}</span></div>`
          : `<div class="psx-fact">${mark('complete')}<span>Your everywhere settings and their history are copied from Home NAS to ${esc(placeName('computer', st.to))}, then checked.</span></div><div class="psx-fact">${mark('complete')}<span>Then ${esc(placeName('computer', st.to))} keeps your settings, and Home NAS follows it like every other computer.</span></div>`)
        + `<div class="psx-fact">${icon('lock')}<span>Each computer’s own settings and each project’s own stay where they are.</span></div></div>`
        + `<div class="psx-h">For the review</div><label class="psx-check"><input type="checkbox" data-x="flight"${st.inFlight ? ' checked' : ''}><span>A change is being saved right now<small>A change from iPhone is on its way to Home NAS.</small></span></label><label class="psx-check"><input type="checkbox" data-x="lost"${st.lost ? ' checked' : ''}><span>Home NAS is gone for good<small>Its disk failed: the lost-for-good variant.</small></span></label>`
        + `<p class="psx-p psx-muted">It never happens by itself.</p>`;
      s.setActions([{ label: 'Cancel', run: () => s.close() }, { spacer: true }, { label: st.lost ? `Make ${placeName('computer', st.to)} keep your settings` : `Move to ${placeName('computer', st.to)}`, primary: true, disabled: st.inFlight ? 'A change is on its way. Try again once it has been saved.' : null, run: () => {
        s.close();
        PSX.run('cmd.server.settings_home.move', [600, 600, 500], () => {
          const old = PSX.W.home || 'homenas';
          PSX.W.home = st.to; PSX.W.rev++;
          COMPUTERS.homenas.detail = 'Synology DS923+ · always on';
          PSX.W.history.unshift({ id: PSX.uid('h'), when: 'Just now', by: 'you', from: S.ctx.device, batch: 'home', text: `${placeName('computer', st.to)} keeps your settings now (was ${placeName('computer', old)})` });
          PSX.emit('redraw');
          PSX.note({ title: `${placeName('computer', st.to)} keeps your settings now.`, body: st.lost ? 'From its own copy. Home NAS follows it if it ever comes back.' : 'Home NAS follows it from now on.', mark: 'complete' });
        });
        PSX.note({ title: 'Moving your settings…', body: 'Copying, checking, then switching.', mark: 'working', sticky: true });
      } }]);
      s.body.querySelectorAll('input').forEach((x) => x.addEventListener('change', () => { if (x.name === 'psx-home') st.to = x.value; if (x.dataset.x === 'flight') st.inFlight = x.checked; if (x.dataset.x === 'lost') st.lost = x.checked; draw(s); }));
    };
    const s = PSX.sheet({ title: 'Keep your settings on another computer', kicker: 'Home NAS', sub: 'One computer keeps your settings; every other one follows it.', body: '' });
    draw(s);
  }

  /* ------------------------------------------------------------------ 11.6 Two setups joining */
  const JOIN = [
    ['general.visual.theme', null, 'Basic Light'], ['general.visual.font-size', null, 16], ['ai.models.default-model', null, 'anthropic/claude-sonnet-4'],
    ['general.interaction.eli5-default', null, false], ['general.interaction.sound-effects', null, true], ['ai.models.reasoning-effort', null, 'high'],
    ['branching.worktrees.default-branch', null, 'master'], ['system.mcp.timeout', null, 45000], ['safety.rules.permission-preset', null, 'full']
  ];
  function joinSetups() {
    const st = { keepOn: 'homenas', pick: JOIN.map(() => 'home') };
    const draw = (s) => {
      const nas = (id) => { const r = PSX.resolve(id, { project: null, on: 'homenas', device: 'here' }); return r.everywhere !== undefined ? r.everywhere : DEFAULTS[id]; };
      s.body.innerHTML = `<div class="psx-copy-choice" role="radiogroup" aria-label="Keep them on">${['homenas', 'studio'].map((k) => `<label class="psx-radio${st.keepOn === k ? ' is-on' : ''}"><input type="radio" name="psx-keep" value="${k}"${st.keepOn === k ? ' checked' : ''}><span><b>${esc(placeName('computer', k))}</b><small>${k === 'homenas' ? 'Always on · 2 projects · suggested' : 'Mac mini · 1 project'}</small></span></label>`).join('')}</div>`
        + `<div class="psx-h">${JOIN.length} settings are different</div><ul class="psx-list">${JOIN.map(([id, , other], i) => {
          const def = DEF[id], screen = def && def.screen && !(def.may || []).includes('project');
          return `<li class="psx-li psx-join"><span><span class="psx-li-name">${esc(label(id))}</span><span class="psx-li-sub" style="display:block">Home NAS: ${esc(vt(id, nas(id)))} · Studio Mac: ${esc(vt(id, other))}</span></span><span class="psx-li-end"><select class="psx-input" data-i="${i}" aria-label="${esc(label(id))}"><option value="home"${st.pick[i] === 'home' ? ' selected' : ''}>Keep Home NAS’s</option><option value="own"${st.pick[i] === 'own' ? ' selected' : ''}>Keep Studio Mac’s on ${screen ? 'its screen' : 'Studio Mac'}</option><option value="every"${st.pick[i] === 'every' ? ' selected' : ''}>Use Studio Mac’s everywhere</option></select></span></li>`;
        }).join('')}</ul><details class="psx-adv"><summary><svg class="psx-chev" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M4.5 2.5 8 6l-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Show the 31 settings that already match</span></summary><p class="psx-p psx-muted">They are the same on both, so nothing changes for them.</p></details>`
        + `<p class="psx-p" style="margin-top:12px">${icon('lock')} Projects keep their own values. Nothing is lost: what isn’t kept stays in History, and you can undo this for 30 days.</p>`;
      s.body.querySelectorAll('input[name="psx-keep"]').forEach((x) => x.addEventListener('change', () => { st.keepOn = x.value; draw(s); }));
      s.body.querySelectorAll('select[data-i]').forEach((x) => x.addEventListener('change', () => { st.pick[+x.dataset.i] = x.value; }));
    };
    const s = PSX.sheet({
      title: 'Use one set of settings?', kicker: 'Studio Mac is paired', sub: 'Studio Mac and Home NAS were set up separately. From now on one keeps your settings.', size: 'wide', body: '',
      actions: [{ label: 'Not now', run: (x) => x.close() }, { spacer: true }, { label: 'Use one set of settings', primary: true, run: (x) => {
        x.close();
        PSX.run('cmd.server.settings_home.join', [700, 600], () => {
          const writes = [];
          JOIN.forEach(([id, , other], i) => {
            const def = DEF[id], screen = def && def.screen && !(def.may || []).includes('project');
            if (st.pick[i] === 'own') writes.push({ level: screen || (def.may || []).includes('device') ? 'device' : 'computer', key: 'studio', id, value: other });
            if (st.pick[i] === 'every') writes.push({ level: 'everywhere', key: null, id, value: other });
          });
          PSX.W.studioJoined = true;
          const tx = PSX.apply(writes, { batch: 'join', text: `Studio Mac joined: one set of settings, kept on ${placeName('computer', st.keepOn)}`, onUndo: () => { PSX.W.studioJoined = false; } });
          PSX.feed.push();
          PSX.note({ title: 'One set of settings.', body: `${placeName('computer', st.keepOn)} keeps them; Studio Mac follows from now on. ${writes.length} of Studio Mac’s values were kept.`, mark: 'complete', actions: [{ label: 'Undo', run: () => PSX.undoTx(tx.id) }] });
        });
      } }]
    });
    draw(s);
  }

  /* ------------------------------------------------------------------ 11.7 A new computer joins */
  function newComputer() {
    PSX.sheet({
      title: 'Office PC is ready', kicker: 'A new computer joins', sub: 'Uses your settings from Home NAS. It follows them from now on.',
      body: `<div class="psx-card"><div class="psx-fact">${mark('complete')}<span>Found on Office PC: Claude Code, Git, Docker.</span></div><div class="psx-fact">${mark('off')}<span>Not found: Jujutsu.</span></div><div class="psx-fact">${mark('complete')}<span>Its Projects folder: C:\\Users\\jared\\Projects, found automatically.</span></div></div>`
        + `<details class="psx-adv"><summary><svg class="psx-chev" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M4.5 2.5 8 6l-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Advanced: Start like This computer</span></summary><p class="psx-p">Copies This computer’s own capacity and look values to Office PC: Helpers at once, at most (3). Programs and folders are found on each computer, never copied.</p><label class="psx-check"><input type="checkbox"><span>Start like This computer</span></label></details>`
        + `<p class="psx-p psx-muted" style="margin-top:10px">Its own computer settings start empty: it follows everywhere, except what Puppet Master finds on it.</p>`,
      actions: [{ spacer: true }, { label: 'Done', primary: true, run: (s) => s.close() }]
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
  function projectRules() {
    PSX.sheet({
      title: 'This project brings its own rules. Use them?', kicker: 'open-recipes · forked from GitHub', sub: 'They came with the project’s files, from someone else’s repository.',
      body: `<ul class="psx-list"><li class="psx-li"><span><span class="psx-li-name">Ask before deleting files</span><span class="psx-li-sub" style="display:block">As careful as yours</span></span><span class="psx-li-end">${PSX.st('complete', 'Used')}</span></li><li class="psx-li"><span><span class="psx-li-name">Persona “Recipe tester”</span><span class="psx-li-sub" style="display:block">Its own persona, used only in open-recipes</span></span><span class="psx-li-end">${PSX.st('complete', 'Used')}</span></li><li class="psx-li"><span><span class="psx-li-name">Run commands without asking</span><span class="psx-li-sub" style="display:block">Looser than yours: you ask first</span></span><span class="psx-li-end">${PSX.st('paused', 'Held until you accept it')}</span></li></ul><p class="psx-p" style="margin-top:10px">A rule looser than yours is held until you accept it. Rules you set later are yours and stay apart.</p>`,
      actions: [{ label: 'Use none of them', run: (s) => { s.close(); PSX.note({ title: 'open-recipes uses your rules only.', mark: 'complete' }); } }, { spacer: true }, { label: 'Accept the looser one too', run: (s) => { s.close(); PSX.note({ title: 'open-recipes may run commands without asking.', body: 'You accepted its looser rule. Change it in Permissions.', mark: 'warning' }); } }, { label: 'Use the careful ones', primary: true, run: (s) => { s.close(); PSX.note({ title: 'Using 2 of its 3 rules.', body: '“Run commands without asking” stays held.', mark: 'complete' }); } }]
    });
  }

  /* ------------------------------------------------------------------ 11.14 Settings now apply everywhere (the fold) */
  function fold() {
    PSX.sheet({
      title: 'Settings now apply everywhere', kicker: 'One time, after this update', sub: 'Nothing you use changes.',
      body: `<div class="psx-card"><div class="psx-fact">${mark('complete')}<span><b>12 settings every project agreed on</b> became your everywhere values, and the projects’ copies were cleared.</span></div><div class="psx-fact">${mark('complete')}<span><b>Where projects disagreed</b>, each keeps its value as its own: 9 settings in 4 projects.</span></div><div class="psx-fact">${mark('complete')}<span><b>Program and folder settings</b> moved to the computer that does each project’s work.</span></div><div class="psx-fact">${mark('info')}<span><b>Text size</b> now belongs to each device: your most recent value, 14, is your everywhere value.</span></div></div>`
        + `<div class="psx-h">A suggestion</div><div class="psx-card"><div class="psx-fact">${mark('info')}<span>5 of 7 projects use Glass Dark. Make it your usual look?</span></div><div class="psx-wacts"><button type="button" class="psx-tb is-primary" data-fold="look">Make Glass Dark my usual look</button></div></div>`,
      actions: [{ spacer: true }, { label: 'Continue', primary: true, run: (s) => { s.close(); PSX.W.history.unshift({ id: PSX.uid('h'), when: 'Just now', by: 'you', from: S.ctx.device, batch: 'fold', text: 'Settings now apply everywhere: 12 settings became everywhere values; nothing in use changed' }); PSX.note({ title: 'Settings apply everywhere now.', body: 'History keeps what moved.', mark: 'complete' }); } }],
      onOpen: (s) => s.body.querySelector('[data-fold]').addEventListener('click', (e) => { e.target.disabled = true; e.target.textContent = 'Saved: Glass Dark is your usual look'; })
    });
  }

  /* ------------------------------------------------------------------ 11.16 Filters and the Differences view */
  function differences() {
    const st = { by: 'project', facet: null, pick: {} };
    const all = () => {
      const out = [];
      Object.keys(DEF).forEach((id) => { const r = PSX.resolve(id, S.ctx); r.varies.filter((v) => v.level !== 'provider').forEach((v) => out.push({ id, level: v.level, key: v.key, value: v.value, every: r.everywhere !== undefined ? r.everywhere : DEFAULTS[id], def: DEF[id] })); });
      return out;
    };
    const counts = () => {
      let changed = 0, here = 0, varies = 0, perComp = 0, perProj = 0;
      Object.keys(DEF).forEach((id) => { const r = PSX.resolve(id, S.ctx); if (r.changed) changed++; if (r.here) here++; const v = r.varies.filter((x) => x.level !== 'provider'); if (v.length) varies++; if (v.some((x) => x.level === 'computer' || x.level === 'device')) perComp++; if (v.some((x) => x.level === 'project')) perProj++; });
      return { changed, here, varies, perComp, perProj };
    };
    const draw = (s) => {
      const c = counts(), d = all();
      const facet = (k, n, w) => `<button type="button" class="psx-tb${st.facet === k ? ' is-primary' : ''}" aria-pressed="${st.facet === k}" data-f="${k}">${esc(w)} <span class="psx-muted">${n}</span></button>`;
      const groups = {};
      d.forEach((x) => { const g = st.by === 'project' ? (x.level === 'project' ? x.key : null) : (x.level !== 'project' ? placeName(x.level, x.key) : null); if (g) (groups[g] = groups[g] || []).push(x); });
      const keyOf = (x) => `${x.id}|${x.level}|${x.key}`;
      s.body.innerHTML = `<div class="psx-facets" role="group" aria-label="Filters">${facet('changed', c.changed, 'Changed')}${facet('here', c.here, 'Set here')}${facet('varies', c.varies, 'Varies')}${facet('comp', c.perComp, 'Per computer')}${facet('proj', c.perProj, 'Per project')}</div>`
        + `<p class="psx-p">You changed ${c.changed} settings. ${c.perProj} differ by project and ${c.perComp} by computer or device.</p>`
        + `<div class="psx-facets" role="radiogroup" aria-label="Group the differences">${['project', 'computer'].map((b) => `<button type="button" class="psx-tb${st.by === b ? ' is-primary' : ''}" role="radio" aria-checked="${st.by === b}" data-by="${b}">By ${b}</button>`).join('')}</div>`
        + Object.keys(groups).sort().map((g) => `<div class="psx-h">${esc(g)}</div><ul class="psx-list">${groups[g].map((x) => `<li class="psx-li"><label class="psx-check"><input type="checkbox" data-k="${esc(keyOf(x))}"${st.pick[keyOf(x)] ? ' checked' : ''}><span>${esc(label(x.id))} · ${esc(st.by === 'project' ? x.key : placeName(x.level, x.key))}: ${esc(vt(x.id, x.value))} <span class="psx-muted">(everywhere: ${esc(vt(x.id, x.every))})</span></span></label><span class="psx-li-end"><button type="button" class="psx-tb" data-one="same" data-k="${esc(keyOf(x))}">Same as everywhere</button>${x.def.home ? '' : `<button type="button" class="psx-tb" data-one="make" data-k="${esc(keyOf(x))}">Make it the everywhere value</button>`}</span></li>`).join('')}</ul>`).join('')
        + (Object.keys(groups).length ? '' : `<p class="psx-p psx-muted">No differences.</p>`);
      const byKey = {}; d.forEach((x) => { byKey[keyOf(x)] = x; });
      s.body.querySelectorAll('[data-f]').forEach((b) => b.addEventListener('click', () => { st.facet = st.facet === b.dataset.f ? null : b.dataset.f; draw(s); PSX.note({ title: `${b.textContent.trim()}`, body: 'In the app this filters All Settings to these rows.', mark: 'info' }); }));
      s.body.querySelectorAll('[data-by]').forEach((b) => b.addEventListener('click', () => { st.by = b.dataset.by; draw(s); }));
      s.body.querySelectorAll('input[data-k]').forEach((x) => x.addEventListener('change', () => { st.pick[x.dataset.k] = x.checked; }));
      s.body.querySelectorAll('[data-one]').forEach((b) => b.addEventListener('click', () => { const x = byKey[b.dataset.k]; if (!x) return; if (b.dataset.one === 'same') PSX.setOwn(x.id, { level: x.level, key: x.key }, undefined); else { const tx = PSX.apply([{ level: 'everywhere', key: null, id: x.id, value: x.value }, { level: x.level, key: x.key, id: x.id, value: undefined }], { batch: 'promote', text: `${label(x.id)}: ${vt(x.id, x.value)} made the everywhere value` }); PSX.feed.push(); PSX.note({ title: 'Saved for everywhere.', actions: [{ label: 'Undo', run: () => PSX.undoTx(tx.id) }] }); } draw(s); }));
      s.setActions([{ label: 'Close', run: () => s.close() }, { spacer: true },
        { label: 'Remove these differences', run: () => bulk('remove') },
        { label: 'Make these everywhere', primary: true, run: () => bulk('make') }]);
      function bulk(kind) {
        const xs = Object.keys(st.pick).filter((k) => st.pick[k]).map((k) => byKey[k]).filter(Boolean);
        if (!xs.length) { PSX.note({ title: 'Tick some differences first.', mark: 'info' }); return; }
        const writes = [];
        xs.forEach((x) => { if (kind === 'make' && !x.def.home) writes.push({ level: 'everywhere', key: null, id: x.id, value: x.value }); writes.push({ level: x.level, key: x.key, id: x.id, value: undefined }); });
        const tx = PSX.apply(writes, { batch: kind, text: `${kind === 'make' ? 'Made' : 'Removed'} ${xs.length} difference${xs.length === 1 ? '' : 's'}` });
        PSX.feed.push(); st.pick = {}; draw(s);
        PSX.note({ title: kind === 'make' ? `${xs.length} made everywhere values.` : `${xs.length} differences removed.`, actions: [{ label: 'Undo', run: () => { PSX.undoTx(tx.id); draw(s); } }] });
      }
    };
    const s = PSX.sheet({ title: 'All settings: the differences', kicker: 'All Settings', sub: 'Every project’s and computer’s own values, in one place.', size: 'wide', body: '' });
    draw(s);
  }

  /* ------------------------------------------------------------------ 11.17 A batch that can't finish */
  function batchCopy() {
    PSX.W.up.studio = false; PSX.W.rev++; PSX.emit('redraw');
    const targets = ['harbor', 'loom', 'docs-site', 'legacy-app', 'lighting-rig'];
    const ids = Object.keys(PSX.W.project.tastebook).filter((id) => DEF[id] && !DEF[id].home);
    PSX.sheet({
      title: 'Copy tastebook’s settings to other projects', kicker: 'Settings Transfer · Advanced', sub: `${ids.length} of tastebook’s own settings, into each project you tick.`,
      body: `<ul class="psx-list">${targets.map((p) => `<li class="psx-li"><label class="psx-check"><input type="checkbox" checked value="${p}"><span>${esc(p)}<small>works on ${esc(placeName('computer', PSX.projectById(p).home))}${p === 'lighting-rig' ? ' · Studio Mac is off' : ''}</small></span></label></li>`).join('')}</ul><p class="psx-p psx-muted" style="margin-top:10px">One batch with one receipt and one Undo. A part whose computer is off is not changed and not queued.</p>`,
      actions: [{ label: 'Cancel', run: (s) => s.close() }, { spacer: true }, { label: 'Copy into 5 projects', primary: true, run: (s) => {
        const picked = [...s.body.querySelectorAll('input:checked')].map((x) => x.value);
        s.close();
        PSX.run('cmd.settings.copy.apply', [600, 500], () => {
          const done = picked.filter((p) => PSX.answering(PSX.projectById(p).home));
          const missed = picked.filter((p) => !done.includes(p));
          const writes = []; done.forEach((p) => ids.forEach((id) => writes.push({ level: 'project', key: p, id, value: PSX.W.project.tastebook[id] })));
          const tx = PSX.apply(writes, { batch: 'copy-many', text: `Copied tastebook’s settings into ${done.length} of ${picked.length} projects`, extra: { missed, ids } });
          PSX.feed.push();
          PSX.note({ title: `${done.length} of ${picked.length} done.`, body: missed.length ? `${list(missed)} wasn’t changed because Studio Mac is off. Nothing is queued: History offers Finish ${list(missed)} when Studio Mac answers.` : '', mark: missed.length ? 'warning' : 'complete', ms: 12000, actions: [{ label: 'Open History', run: () => PSX.history.open() }, { label: 'Undo', run: () => PSX.undoTx(tx.id) }] });
        });
      } }]
    });
  }
  function finishMissed(e) {
    const missed = (e.extra && e.extra.missed) || [];
    const ready = missed.filter((p) => PSX.answering(PSX.projectById(p).home));
    if (!ready.length) { PSX.note({ title: 'Not yet', body: 'Studio Mac is still off.', mark: 'offline' }); return; }
    const writes = []; ready.forEach((p) => e.extra.ids.forEach((id) => writes.push({ level: 'project', key: p, id, value: PSX.W.project.tastebook[id] })));
    PSX.run('cmd.settings.copy.apply', [500], () => {
      const tx = PSX.apply(writes, { batch: 'finish', text: `Finished ${list(ready)}` });
      e.extra.missed = missed.filter((p) => !ready.includes(p));
      PSX.feed.push();
      PSX.note({ title: `Finished ${list(ready)}.`, actions: [{ label: 'Undo', run: () => PSX.undoTx(tx.id) }] });
      if (PSX.history.sheet && PSX.history.sheet.back.isConnected) PSX.history.draw();
    });
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
      const who = (e) => (e.by === 'assistant' ? 'the assistant' : (PSX.DEVICES[e.from] || COMPUTERS[e.from] || { name: e.from || 'This computer' }).name);
      s.body.innerHTML = `${PSX.W.up.studio === false ? `<label class="psx-check"><input type="checkbox" data-studio><span>Studio Mac answers again<small>For the review: turn Studio Mac back on.</small></span></label>` : ''}<ul class="psx-list">${items.map((e, i) => {
        const text = e.text || `${label(e.sid)}: ${e.before === undefined ? 'set to ' + vt(e.sid, e.after) : e.after === undefined ? vt(e.sid, e.before) + ' taken away' : vt(e.sid, e.before) + ' to ' + vt(e.sid, e.after)}, ${e.level === 'everywhere' ? 'everywhere' : 'for ' + placeName(e.level, e.key)}`;
        const tx = e.tx && PSX.W.batches[e.tx];
        let act = '';
        if (e.extra && e.extra.missed && e.extra.missed.length) act += `<button type="button" class="psx-tb${PSX.answering('studio') ? ' is-primary' : ''}" data-finish="${i}"${PSX.answering('studio') ? '' : ' aria-disabled="true"'}>Finish ${esc(list(e.extra.missed))}</button>`;
        if (tx && !tx.undone) act += `<button type="button" class="psx-tb" data-undo="${esc(e.tx)}">${e.batch ? 'Undo all of it' : 'Undo'}</button>`;
        return `<li class="psx-li"><span><span class="psx-li-name">${esc(text)}</span><span class="psx-li-sub" style="display:block">${esc(e.when)} · ${esc(who(e))}</span></span><span class="psx-li-end">${act}</span></li>`;
      }).join('')}</ul>`;
      s.body.querySelectorAll('[data-undo]').forEach((b) => b.addEventListener('click', () => { PSX.undoTx(b.dataset.undo); PSX.history.draw(); }));
      s.body.querySelectorAll('[data-finish]').forEach((b) => b.addEventListener('click', () => { if (b.getAttribute('aria-disabled') === 'true') { PSX.note({ title: 'Not yet', body: 'Studio Mac is still off. Nothing is queued.', mark: 'offline' }); return; } finishMissed(items[+b.dataset.finish]); }));
      const sm = s.body.querySelector('[data-studio]'); if (sm) sm.addEventListener('change', () => { PSX.W.up.studio = true; PSX.W.rev++; PSX.emit('redraw'); PSX.history.draw(); PSX.note({ title: 'Studio Mac is back.', body: 'Finish lighting-rig is ready in History.', mark: 'complete' }); });
      s.setActions([{ spacer: true }, { label: 'Close', primary: true, run: () => s.close() }]);
    }
  };

  /* ------------------------------------------------------------------ running and resetting */
  function reset() {
    if (guideEl) { guideEl.remove(); guideEl = null; }
    Object.keys(ORIGINAL_DEFAULTS).forEach((k) => { DEFAULTS[k] = ORIGINAL_DEFAULTS[k]; });
    S.conflict = null; S.conflictArmed = null; S.firstStart = false; S.ownLook = false; S.mcpProject = null;
    COMPUTERS.homenas.detail = 'Synology DS923+ · always on · Keeps your settings';
    D.querySelectorAll('[data-psx-update]').forEach((n) => n.remove());
    closePanel();
  }
  async function run(id) {
    const fn = M[id]; if (!fn) return;
    // each moment starts from the demo as it is, after the last moment's own state is put back
    if (S.moment && S.moment !== id) {
      if (S.firstStart) { S.firstStart = false; PSX.feed.full(); }
      if (guideEl) { guideEl.remove(); guideEl = null; }
      PSX.closeSheets();
    }
    S.moment = id;
    try { await fn(); } catch (e) { console.error('[psx moment]', id, e); }
    PSX.report && PSX.report('state');
  }
  PSX.moments = { run, reset, homenas, intercept, list: Object.keys(M) };
})(window);
