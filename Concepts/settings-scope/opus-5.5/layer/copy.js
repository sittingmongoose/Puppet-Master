/* Settings that apply everywhere (Opus 5.5): the copy-settings sheet (BUILD-SPEC section 10; SETTINGS-PROPOSAL 5).

   One sheet, two places:
     Settings › Settings Transfer   a primary choice at the top, "Copy settings from another project", into this project
     New Project (a moment)          Split v2's section `like`, "Start like another Project?", for a new project
                                     recipe-box that will work on Home NAS
   A copy brings what makes the source different (its own values, its own things, its AI account choices), once, with
   no live link afterwards. Advanced (the one disclosure) picks by kind, by setting and by thing, and "Keep them fixed"
   copies everything as the source has it. Sign-ins and keys never move; an account already signed in on the computer
   that does the work is reused and checked there first (NEW CANON MA-074, decisions S9 to S11).

   STR holds Split v2's keys (BUILD-SPEC-split-v2.md 6.7) copied verbatim, with SETTINGS-PROPOSAL 11's changes: the
   kinds' plain names (5.3.1), np.like.things, the check_there row (np.acct.checked), and sendKeys off (S11 A).
   tools/diff_strings.py diffs this table against Split v2's. Every count and account state is [Demo only]. */
(function (W) {
  'use strict';
  const PSX = W.PSX; if (!PSX || PSX.copy) return;
  const { D, DEF, DEFAULTS, esc, mark, icon, label, vt, placeName, list, same, clone, PROJECTS } = PSX;
  const S = PSX.S;

  /* ---- strings (Split v2 6.7; changed per SETTINGS-PROPOSAL 11 where marked) ---- */
  const STR = {
    'np.like.title': 'Start like another Project?',
    'np.like.lead': 'Use the setup you already trust, or just your usual settings.',
    'np.like.usual': 'Your usual settings',
    'np.like.usualSub': 'The settings every Project shares',
    'np.like.row': 'Like {project}',
    'np.like.rowSub': '{own} of its own · uses {accounts}',
    'np.like.rowSubNone': 'Same as your usual settings · uses {accounts}',
    'np.like.more': 'Show all Projects',
    'np.like.comes': 'What comes along',
    'np.like.diffs': 'Its {n} settings that differ from your usual ones: {kinds}.',
    'np.like.things': 'Its own things: {things}.',                                   // SETTINGS-PROPOSAL 11: added
    'np.like.accounts': 'The AI accounts and models it uses: {accounts}.',
    'np.like.never': 'Never copied: sign-ins themselves, files, history, Goals and Plans.',
    'np.like.separate': 'They become this Project’s own. Changing either Project later never changes the other; changes to your usual settings still reach both.',
    'np.like.adv': 'Advanced: choose what to copy',
    'np.like.kinds': 'Kinds of settings',
    'np.like.kindsAll': 'Everything is selected.',
    'np.like.kindsSome': '{k} of {total} kinds selected.',
    'np.like.kindCount': '{n} different',
    'np.like.kindNone': 'Nothing different',
    'np.like.singleFind': 'Find a setting',
    'np.like.singleRow': '{label}: usual {usual} → {project} {value}',
    'np.like.singleOff': 'Stays as usual',
    'np.like.thingsGroup': 'Its own things',
    'np.like.thingRow': '{thing} · {kind}',
    'np.like.thingNone': 'It has no things of its own',
    'np.like.acctSwitch': 'Use the same AI accounts and models',
    'np.like.acctSwitchSub': 'Which accounts and models it uses. Sign-ins stay on the computer that does the work.',
    'np.like.acctOff': 'This Project uses your usual AI accounts and models.',
    'np.acct.ready': 'Ready on {computer}',
    'np.acct.readyWhy': 'Already signed in there. The same account is used; nothing is copied.',
    'np.acct.checked': 'Signed in on {computer} · checked before first use',          // check_there (SETTINGS-PROPOSAL 11)
    'np.acct.checkedWhy': 'The same account is signed in there. Puppet Master checks it on {computer} before the first job.',
    'np.acct.signin': 'Sign in on {computer} after it’s made',
    'np.acct.signinWhy': 'Sign-ins stay with the computer that does the work. You sign in on the device in front of you, and it is kept on {computer}.',
    'np.acct.key': 'Add the key on {computer} after it’s made',
    'np.acct.expired': 'Expired on {computer}: sign in again after it’s made'
  };
  const SETTINGS = { sendKeys: false, usualWord: 'Your usual settings', computerWord: 'computer', copyWrites: 'project', computerLevelTravels: false, variesMark: 'origin-word' };
  const t = (k, v) => String(STR[k] || k).replace(/\{(\w+)\}/g, (_, x) => (v && v[x] != null ? v[x] : ''));

  /* ---- the ten kinds in one vocabulary (5.3.1); each setting id belongs to exactly one ---- */
  const KINDS = [
    ['appearance_workspace', 'Look and layout', 'look'], ['assistant_chat', 'Assistant and chat', 'chat'],
    ['providers_accounts_models_routing', 'AI accounts and models', 'AI models'], ['planning_goal', 'Planning and Goals', 'planning'],
    ['orchestrator_automation', 'Automation', 'automation'], ['tools_integrations', 'Tools and connections', 'tools'],
    ['testing_browser_devices', 'Testing, browser and devices', 'testing'], ['permissions_security', 'Permissions and safety', 'permissions'],
    ['memory_retention_history', 'Memory and history', 'memory'], ['notifications_usage_budgets', 'Notifications and limits', 'notifications']
  ];
  function kindOf(id) {
    if (/^general\.visual\.|^general\.startup\./.test(id)) return 'appearance_workspace';
    if (/^general\.interaction\.|^chat\./.test(id)) return 'assistant_chat';
    if (/^ai\.(models|accounts|routing)\./.test(id)) return 'providers_accounts_models_routing';
    if (/^planning\.testing\.|^browser\./.test(id)) return 'testing_browser_devices';
    if (/^planning\.|^goals\./.test(id)) return 'planning_goal';
    if (/^branching\.subagents\.|^orchestrator\.|^automation\./.test(id)) return 'orchestrator_automation';
    if (/^safety\./.test(id)) return 'permissions_security';
    if (/^memory\./.test(id)) return 'memory_retention_history';
    if (/^notifications\.|^ai\.usage\./.test(id)) return 'notifications_usage_budgets';
    return 'tools_integrations';
  }
  /* ---- which projects use which accounts, and their own things [Demo only] ---- */
  const USES = { tastebook: ['work-claude', 'codex', 'openrouter'], harbor: ['work-claude'], loom: ['work-claude'], 'docs-site': ['work-claude'], 'legacy-app': ['work-claude'], experiment: ['personal-claude'], 'garden-notes': ['work-claude'], 'recipe-app': ['work-claude'], 'lighting-rig': ['personal-claude'] };
  const OWN_THINGS = {
    tastebook: [
      { id: 'filesystem-mcp', name: 'Filesystem MCP', kind: 'MCP server', outcome: (dst, comp) => `copied as ${dst}’s own · its folder access is set again on ${comp}` },
      { id: 'reviewer', name: 'Reviewer', kind: 'persona', outcome: (dst) => `tastebook’s version, copied as ${dst}’s version` }
    ]
  };
  const REACH_THINGS = { tastebook: [{ id: 'figma-mcp', name: 'Figma MCP', kind: 'MCP server', outcome: (dst) => `make it available in ${dst} too` }] };
  const accName = (a) => `${a.service} · ${a.name}`;
  function readiness(key, comp, sameComp) {
    const a = PSX.W.things.accounts[key], s = a.on[comp], cn = placeName('computer', comp);
    if ((s === 'ready' || s === 'checked') && sameComp) return { mark: 'complete', text: t('np.acct.ready', { computer: cn }), why: t('np.acct.readyWhy'), outcome: 'ready_here' };
    if (s === 'ready' || s === 'checked') return { mark: 'reviewing', text: t('np.acct.checked', { computer: cn }), why: t('np.acct.checkedWhy', { computer: cn }), outcome: 'check_there' };
    if (s === 'missing') return { mark: 'off', text: `Install ${a.tool} on ${cn}`, why: 'Never installed by itself.', outcome: 'not_installed' };
    if (s === 'expired') return { mark: 'warning', text: t('np.acct.expired', { computer: cn }), outcome: 'expired' };
    if (a.kind === 'key') return { mark: 'waiting', text: t('np.acct.key', { computer: cn }), why: 'Keys are not moved between computers. You paste it once on the device in front of you.', outcome: 'key_needed' };
    return { mark: 'waiting', text: t('np.acct.signin', { computer: cn }), why: t('np.acct.signinWhy', { computer: cn }), outcome: 'sign_in_there' };
  }

  /* ---- what a source brings: its own values, against what the destination would have ---- */
  function sourceDiff(src, dstCtx) {
    const w = PSX.W, own = w.project[src] || {};
    const out = [];
    Object.keys(own).forEach((id) => {
      const def = DEF[id]; if (!def) return;
      const r = PSX.resolve(id, dstCtx);
      out.push({ id, value: own[id], usual: r.value === undefined ? DEFAULTS[id] : r.value, kind: def.home === 'project' ? 'project_only_rows' : kindOf(id), files: def.home === 'project', same: same(own[id], r.value), dstOwn: dstCtx.project && PSX.has(w.project[dstCtx.project], id) });
    });
    return out;
  }
  function fromComputer(src) {
    // what the source gets from its own computer (Advanced: "Copy what tastebook gets from This computer")
    const p = PSX.projectById(src), w = PSX.W, bag = w.computer[p ? p.home : 'here'] || {};
    return Object.keys(bag).filter((id) => DEF[id] && !DEF[id].home && (DEF[id].may || []).includes('project') && !PSX.has(w.project[src], id)).map((id) => ({ id, value: bag[id] }));
  }
  function ownCount(src) { return sourceDiff(src, { project: null, device: 'here', on: null }).filter((x) => !x.files).length; }

  /* ------------------------------------------------------------------ the sheet */
  function open(o) {
    o = o || {};
    const mode = o.mode || 'settings';                 // 'settings' (into this project) or 'new' (New Project, recipe-box on Home NAS)
    const c = PSX.ctxFull(S.ctx);
    const dst = mode === 'new' ? 'recipe-box' : (c.project || 'tastebook');
    const dstComp = mode === 'new' ? (o.comp || 'homenas') : c.on;
    const st = { src: o.src || (mode === 'new' ? 'tastebook' : (dst === 'tastebook' ? 'harbor' : 'tastebook')), all: false, onlyDiff: true, q: '', pick: {}, things: {}, accts: {}, files: {}, fixed: false, fromComp: false, useAccts: true, step: 'choose', openKinds: {}, advOpen: !!o.advanced, clash: {} };
    const dstCtx = () => ({ project: mode === 'new' ? null : dst, device: S.ctx.device, on: dstComp });
    const sources = () => PROJECTS.map((p) => p.id).filter((p) => p !== dst);
    const seed = () => {
      st.pick = {}; st.things = {}; st.accts = {}; st.files = {}; st.clash = {};
      if (st.src === 'usual') return;
      sourceDiff(st.src, dstCtx()).forEach((x) => { st.pick[x.id] = !x.files && !x.same; st.files[x.id] = false; if (x.dstOwn) st.clash[x.id] = 'keep'; });
      (OWN_THINGS[st.src] || []).concat(REACH_THINGS[st.src] || []).forEach((x) => { st.things[x.id] = true; });
      (USES[st.src] || []).forEach((k) => { st.accts[k] = 'same'; });
    };
    seed();
    const sh = PSX.sheet({
      id: 'copy', size: 'wide', cls: 'psx-copy',
      kicker: mode === 'new' ? 'New Project · recipe-box' : 'Settings Transfer',
      title: mode === 'new' ? t('np.like.title') : 'Copy settings from another project',
      sub: mode === 'new' ? `${t('np.like.lead')} recipe-box will work on ${placeName('computer', dstComp)}.` : `Into ${dst} (this project). What makes the other project different becomes ${dst}’s own.`,
      body: '<div class="psx-copy-body"></div>',
      onClose: () => { if (o.onClose) o.onClose(); }
    });
    const body = sh.body.querySelector('.psx-copy-body');
    PSX.copy.current = { sh, st, mode };
    function totals() {
      if (st.src === 'usual') return { n: 0, things: 0, accts: 0 };
      const diff = sourceDiff(st.src, dstCtx());
      let n = diff.filter((x) => (x.files ? st.files[x.id] : st.pick[x.id])).length;
      if (st.fixed) n += Object.keys(DEF).filter((id) => !DEF[id].home && !PSX.has(PSX.W.project[st.src], id) && !DEF[id].screen && !DEF[id].adopted).length;
      if (st.fromComp) n += fromComputer(st.src).length;
      const things = Object.keys(st.things).filter((k) => st.things[k]).length;
      const accts = st.useAccts ? Object.keys(st.accts).filter((k) => st.accts[k] === 'same').length : 0;
      return { n, things, accts };
    }
    const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
    function primaryLabel() {
      const x = totals();
      if (st.src === 'usual') return mode === 'new' ? 'Use your usual settings' : 'Nothing to copy';
      const parts = [plural(x.n, 'setting')]; if (x.things) parts.push(plural(x.things, 'thing')); if (x.accts) parts.push(plural(x.accts, 'AI account'));
      return `Copy ${parts.length > 1 ? parts.slice(0, -1).join(', ') + ' and ' + parts[parts.length - 1] : parts[0]}`;
    }
    function render() {
      const keep = D.activeElement && body.contains(D.activeElement) ? (D.activeElement.getAttribute('data-k') || D.activeElement.id) : null;
      const advWasOpen = body.querySelector('details.psx-adv') ? body.querySelector('details.psx-adv').open : st.advOpen;
      st.advOpen = advWasOpen;
      body.innerHTML = st.step === 'preview' ? previewHtml() : chooseHtml();
      sh.setActions(st.step === 'preview'
        ? [{ label: 'Back', run: () => { st.step = 'choose'; render(); } }, { spacer: true }, { label: mode === 'new' ? 'Use these for recipe-box' : 'Copy', primary: true, run: apply }]
        : [{ label: 'Cancel', run: () => sh.close('cancel') }, { spacer: true }, { label: primaryLabel(), primary: true, disabled: st.src === 'usual' && mode !== 'new' ? 'Choose a project to copy from.' : null, run: () => { if (st.src === 'usual') { sh.close(); PSX.note({ title: 'recipe-box will start on your usual settings.', body: 'It follows them from the moment it’s made.', mark: 'complete' }); return; } st.step = 'preview'; render(); } }]);
      if (keep) { const f = body.querySelector(`[data-k="${CSS.escape(keep)}"]`) || body.querySelector('#' + CSS.escape(keep)); if (f) f.focus({ preventScroll: true }); }
    }
    function sourceRow(p) {
      const n = ownCount(p);
      const accts = (USES[p] || []).map((k) => PSX.W.things.accounts[k].service);
      const uses = list([...new Set(accts)]) || 'your usual accounts';
      const sub = n ? t('np.like.rowSub', { own: plural(n, 'setting') + ((OWN_THINGS[p] || []).length ? ' and ' + plural((OWN_THINGS[p] || []).length, 'thing') : ''), accounts: uses }) : t('np.like.rowSubNone', { accounts: uses });
      return `<label class="psx-radio${st.src === p ? ' is-on' : ''}"><input type="radio" name="psx-src" value="${esc(p)}" data-k="src-${esc(p)}"${st.src === p ? ' checked' : ''}><span><b>${esc(t('np.like.row', { project: p }))}</b><small>${esc(sub)}</small></span></label>`;
    }
    function chooseHtml() {
      const srcs = sources();
      const top = mode === 'new' ? ['tastebook', 'harbor'] : srcs.slice(0, 3);
      const shown = st.all ? srcs : top.filter((p) => srcs.includes(p));
      let h = `<div class="psx-copy-choice" role="radiogroup" aria-label="Start from">`;
      if (mode === 'new') h += `<label class="psx-radio${st.src === 'usual' ? ' is-on' : ''}"><input type="radio" name="psx-src" value="usual" data-k="src-usual"${st.src === 'usual' ? ' checked' : ''}><span><b>${esc(t('np.like.usual'))}</b><small>${esc(t('np.like.usualSub'))}</small></span></label>`;
      h += shown.map(sourceRow).join('');
      if (!st.all && srcs.length > shown.length) h += `<button type="button" class="psx-tb" data-k="more" data-act="more">${esc(t('np.like.more'))}</button>`;
      h += '</div>';
      if (st.src !== 'usual') h += comesHtml() + advancedHtml();
      return h;
    }
    function comesHtml() {
      const diff = sourceDiff(st.src, dstCtx()).filter((x) => !x.files && !x.same);
      const kinds = [...new Set(diff.map((x) => (KINDS.find((k) => k[0] === x.kind) || [])[2]).filter(Boolean))];
      const things = (OWN_THINGS[st.src] || []);
      const accts = USES[st.src] || [];
      const sameComp = PSX.projectById(st.src) && PSX.projectById(st.src).home === dstComp;
      let h = `<div class="psx-h">${esc(t('np.like.comes'))}</div><div class="psx-card">`;
      h += `<div class="psx-fact">${mark('complete')}<span>${esc(t('np.like.diffs', { n: diff.length, kinds: list(kinds) || 'none' }))}</span></div>`;
      if (things.length) h += `<div class="psx-fact">${mark('complete')}<span>${esc(things.length === 1 ? '1 thing of its own: ' : things.length + ' things of its own: ')}${esc(list(things.map((x) => x.kind === 'persona' ? `its version of the ${x.name} persona` : x.name)))}.</span></div>`;
      const reach = REACH_THINGS[st.src] || [];
      if (reach.length) h += `<div class="psx-fact">${mark('complete')}<span>${esc(list(reach.map((x) => x.name)))}, from your library, ${reach.length === 1 ? 'becomes' : 'become'} available in ${esc(dst)} too.</span></div>`;
      if (accts.length) {
        h += `<div class="psx-fact">${mark('complete')}<span>${esc(t('np.like.accounts', { accounts: list(accts.map((k) => PSX.W.things.accounts[k].service)) }))}</span></div><ul class="psx-list psx-accts">`;
        h += accts.map((k) => { const a = PSX.W.things.accounts[k], r = readiness(k, dstComp, sameComp); return `<li class="psx-li"><span class="psx-li-name">${esc(accName(a))}</span><span class="psx-li-end" data-pm-hover-label="${esc(r.text)}" data-pm-hover-detail="${esc(r.why || '')}">${PSX.st(r.mark, r.text)}</span></li>`; }).join('') + '</ul>';
      }
      h += `<div class="psx-fact">${icon('lock')}<span>Never copied: sign-ins themselves, keys, files, history, Goals and Plans.</span></div>`;
      h += `<p class="psx-p psx-muted" style="margin:8px 0 0">${esc(mode === 'new' ? t('np.like.separate') : `These become ${dst}’s own settings. Later changes to ${st.src} won’t follow. To change every project at once, change the setting everywhere.`)}</p></div>`;
      return h;
    }
    function advancedHtml() {
      const all = sourceDiff(st.src, dstCtx());
      const q = st.q.trim().toLowerCase();
      const vis = (x) => (!st.onlyDiff || !x.same) && (!q || label(x.id).toLowerCase().includes(q));
      const settingsRows = all.filter((x) => !x.files);
      const kinds = KINDS.map(([kid, name]) => {
        const rows = settingsRows.filter((x) => x.kind === kid && vis(x));
        const picked = rows.filter((x) => st.pick[x.id]).length;
        if (!rows.length) return `<div class="psx-kind" aria-disabled="true"><label class="psx-check" aria-disabled="true"><input type="checkbox" disabled data-k="kind-${kid}"><span>${esc(name)}<small>${esc(t('np.like.kindNone'))}</small></span></label></div>`;
        const openK = !!st.openKinds[kid] || !!q;
        return `<div class="psx-kind"><div class="psx-kind-head"><label class="psx-check"><input type="checkbox" data-act="kind" data-kind="${kid}" data-k="kind-${kid}"${picked === rows.length ? ' checked' : ''}${picked && picked < rows.length ? ' data-mixed="1"' : ''}><span>${esc(name)}<small>${picked} of ${rows.length} · ${esc(t('np.like.kindCount', { n: rows.length }))}</small></span></label><button type="button" class="psx-tb" data-act="openkind" data-kind="${kid}" data-k="open-${kid}" aria-expanded="${openK}">${openK ? 'Hide settings' : 'Show settings'}</button></div>`
          + (openK ? `<div class="psx-kind-rows">${rows.map((x) => `<label class="psx-check"><input type="checkbox" data-act="one" data-id="${esc(x.id)}" data-k="one-${esc(x.id)}"${st.pick[x.id] ? ' checked' : ''}><span>${esc(label(x.id))} · ${esc(vt(x.id, x.value))} <span class="psx-muted">(your usual: ${esc(vt(x.id, x.usual))})</span>${st.pick[x.id] ? '' : `<small>${esc(t('np.like.singleOff'))}</small>`}</span></label>`).join('')}</div>` : '') + '</div>';
      }).join('');
      const things = (OWN_THINGS[st.src] || []).concat(REACH_THINGS[st.src] || []);
      const thingsHtml = things.length ? things.map((x) => `<label class="psx-check"><input type="checkbox" data-act="thing" data-id="${esc(x.id)}" data-k="thing-${esc(x.id)}"${st.things[x.id] ? ' checked' : ''}><span>${esc(x.name)}${x.kind === 'persona' ? ' (persona)' : ''} · ${esc(x.outcome(dst, placeName('computer', dstComp)))}</span></label>`).join('') : `<p class="psx-p psx-muted">${esc(t('np.like.thingNone'))}</p>`;
      const accts = USES[st.src] || [];
      const sameComp = PSX.projectById(st.src) && PSX.projectById(st.src).home === dstComp;
      const acctHtml = `<label class="psx-check"><input type="checkbox" data-act="useaccts" data-k="useaccts"${st.useAccts ? ' checked' : ''}><span>${esc(t('np.like.acctSwitch'))}<small>${esc(t('np.like.acctSwitchSub'))}</small></span></label>`
        + (st.useAccts ? `<ul class="psx-list">${accts.map((k) => { const a = PSX.W.things.accounts[k], r = readiness(k, dstComp, sameComp); return `<li class="psx-li"><span><span class="psx-li-name">${esc(accName(a))}</span><span class="psx-li-sub" style="display:block">${PSX.st(r.mark, r.text)}</span></span><span class="psx-li-end"><select class="psx-input" data-act="acct" data-id="${esc(k)}" data-k="acct-${esc(k)}" aria-label="${esc(accName(a))}"><option value="same"${st.accts[k] === 'same' ? ' selected' : ''}>Use the same account</option><option value="later"${st.accts[k] === 'later' ? ' selected' : ''}>Choose later</option></select></span></li>`; }).join('')}</ul>` : `<p class="psx-p psx-muted">${esc(t('np.like.acctOff'))}</p>`);
      const files = all.filter((x) => x.files);
      const filesHtml = (files.length ? files : [{ id: 'memory.assembly.project-rules', value: '', none: true }]).map((x) => `<label class="psx-check"${x.none ? ' aria-disabled="true"' : ''}><input type="checkbox" data-act="file" data-id="${esc(x.id)}" data-k="file-${esc(x.id)}"${st.files[x.id] ? ' checked' : ''}${x.none ? ' disabled' : ''}><span>${esc(label(x.id))}${x.none ? '<small>It has none of its own</small>' : ` · ${esc(vt(x.id, x.value))}`}</span></label>`).join('')
        + `<label class="psx-check" aria-disabled="true"><input type="checkbox" disabled><span>Build files<small>It has none of its own</small></span></label><label class="psx-check" aria-disabled="true"><input type="checkbox" disabled><span>Its online copy’s address<small>A new project gets its own</small></span></label>`;
      const fc = fromComputer(st.src);
      const p = PSX.projectById(st.src);
      const alsoHtml = `<label class="psx-check"><input type="checkbox" data-act="fixed" data-k="fixed"${st.fixed ? ' checked' : ''}><span><b>Keep them fixed</b><small>Copy every setting as ${esc(st.src)} has it, so ${esc(dst)} stops following later changes to your usual settings. For a client’s project that must not drift.</small></span></label>`
        + `<label class="psx-check"${fc.length ? '' : ' aria-disabled="true"'}><input type="checkbox" data-act="fromcomp" data-k="fromcomp"${st.fromComp ? ' checked' : ''}${fc.length ? '' : ' disabled'}><span>Copy what ${esc(st.src)} gets from ${esc(placeName('computer', p ? p.home : 'here'))} as ${esc(dst)}’s own (${fc.length})<small>${esc(fc.map((x) => label(x.id) + ' ' + vt(x.id, x.value)).join(' · ') || 'Nothing')}</small></span></label>`;
      const never = [['Shell', 'belongs to each computer'], ['Claude Code app location', 'belongs to each computer'], ['Text size', 'belongs to each device'], ['OpenRouter key', 'keys never move'], ['Sign-ins', 'stay on the computer where you signed in']];
      return `<details class="psx-adv"${st.advOpen ? ' open' : ''}><summary data-k="adv"><svg class="psx-chev" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M4.5 2.5 8 6l-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg><span>${esc(t('np.like.adv'))}</span></summary><div class="psx-adv-body">`
        + `<div class="psx-find"><input class="psx-input" type="search" id="psx-copy-find" data-act="find" data-k="find" placeholder="${esc(t('np.like.singleFind'))}" aria-label="${esc(t('np.like.singleFind'))}" value="${esc(st.q)}"><label class="psx-check"><input type="checkbox" data-act="onlydiff" data-k="onlydiff"${st.onlyDiff ? ' checked' : ''}><span>Only what’s different</span></label></div>`
        + `<div class="psx-h">${esc(t('np.like.kinds'))}</div>${kinds}`
        + `<div class="psx-h">${esc(t('np.like.thingsGroup'))}</div>${thingsHtml}`
        + `<div class="psx-h">AI accounts</div>${acctHtml}`
        + `<div class="psx-h">About its own files</div>${filesHtml}`
        + `<div class="psx-h">Also</div>${alsoHtml}`
        + `<div class="psx-h">Never copied</div><ul class="psx-list">${never.map(([a, b]) => `<li class="psx-li"><span class="psx-li-name">${esc(a)}</span><span class="psx-li-end psx-muted">${esc(b)}</span></li>`).join('')}</ul>`
        + `</div></details>`;
    }
    function plan() {
      const diff = sourceDiff(st.src, dstCtx());
      let rows = diff.filter((x) => (x.files ? st.files[x.id] : st.pick[x.id]));
      if (st.fromComp) rows = rows.concat(fromComputer(st.src).map((x) => Object.assign({ usual: PSX.resolve(x.id, dstCtx()).value }, x)));
      const things = (OWN_THINGS[st.src] || []).concat(REACH_THINGS[st.src] || []).filter((x) => st.things[x.id]);
      const accts = st.useAccts ? (USES[st.src] || []).filter((k) => st.accts[k] === 'same') : [];
      return { rows, things, accts };
    }
    function previewHtml() {
      const p = plan(), sameComp = PSX.projectById(st.src) && PSX.projectById(st.src).home === dstComp;
      let h = `<p class="psx-p">${mark('info')} <b>${esc(mode === 'new' ? 'recipe-box will start with:' : `${dst} gets:`)}</b> nothing changes until you choose ${esc(mode === 'new' ? 'Use these' : 'Copy')}.</p><ul class="psx-list">`;
      h += p.rows.map((x) => {
        const clash = st.clash[x.id];
        return `<li class="psx-li"><span class="psx-li-name">${esc(label(x.id))}: ${esc(vt(x.id, x.value))} instead of your usual ${esc(vt(x.id, x.usual))}.</span>${clash ? `<span class="psx-li-end"><select class="psx-input" data-act="clash" data-id="${esc(x.id)}" aria-label="${esc(label(x.id))}: ${esc(dst)} has its own"><option value="keep"${clash === 'keep' ? ' selected' : ''}>Keep ${esc(dst)}’s</option><option value="theirs"${clash === 'theirs' ? ' selected' : ''}>Use theirs</option></select></span>` : ''}</li>`;
      }).join('');
      h += p.things.map((x) => `<li class="psx-li"><span class="psx-li-name">${esc(x.name)}: ${esc(x.outcome(dst, placeName('computer', dstComp)))}.</span></li>`).join('');
      h += p.accts.map((k) => { const a = PSX.W.things.accounts[k], r = readiness(k, dstComp, sameComp); return `<li class="psx-li"><span class="psx-li-name">${esc(accName(a))}: chosen for ${esc(dst)}.</span><span class="psx-li-end">${PSX.st(r.mark, r.text)}</span></li>`; }).join('');
      h += `</ul>`;
      if (st.fixed) h += `<p class="psx-p">${mark('info')} Keep them fixed: every other setting is copied as ${esc(st.src)} has it today, so ${esc(dst)} stops following your usual settings.</p>`;
      h += `<p class="psx-p psx-muted">Skipped: sign-ins, keys, files and history (never copied); screen settings (they belong to each device); program and folder settings (they belong to each computer).</p>`;
      h += `<p class="psx-p psx-muted">${mode === 'new' ? 'Nothing applies before the project is made.' : 'It is one change with one Undo, checked after it is saved.'}</p>`;
      return h;
    }
    function apply() {
      const p = plan();
      const label2 = `${plural(p.rows.length, 'setting')}${p.things.length ? ' and ' + plural(p.things.length, 'thing') : ''}`;
      sh.close('ok');
      if (mode === 'new') {
        PSX.note({ title: `recipe-box will start like ${st.src}.`, body: `${label2}${p.accts.length ? ' and ' + plural(p.accts.length, 'AI account') : ''}. Nothing is applied until it’s made; its Done page offers Undo the copied settings.`, mark: 'complete', ms: 9000 });
        return;
      }
      PSX.run('cmd.settings.copy.apply', [500, 400], () => {
        const writes = p.rows.filter((x) => st.clash[x.id] !== 'keep').map((x) => ({ level: 'project', key: dst, id: x.id, value: x.value }));
        const reach = [];
        p.things.forEach((x) => { const th = PSX.W.things.mcp[x.id]; if (th && th.reach === 'only' && !(th.projects || []).includes(dst)) { th.projects = (th.projects || []).concat(dst); reach.push(x.id); } });
        const tx = PSX.apply(writes, { batch: 'copy', text: `Copied ${label2} from ${st.src} into ${dst}`, onUndo: () => reach.forEach((id) => { const th = PSX.W.things.mcp[id]; th.projects = (th.projects || []).filter((q) => q !== dst); }) });
        PSX.feed.push();
        PSX.note({ title: `Copied ${label2} from ${st.src}.`, body: `They are ${dst}’s own now. History keeps “Undo all of it”.`, actions: [{ label: 'Undo', run: () => PSX.undoTx(tx.id) }], kind: 'saved' });
      });
    }
    // events
    body.addEventListener('change', (e) => {
      const el = e.target, act = el.dataset.act;
      if (el.name === 'psx-src') { st.src = el.value; seed(); render(); return; }
      if (act === 'kind') { const rows = sourceDiff(st.src, dstCtx()).filter((x) => !x.files && x.kind === el.dataset.kind && (!st.onlyDiff || !x.same)); rows.forEach((x) => { st.pick[x.id] = el.checked; }); render(); return; }
      if (act === 'one') { st.pick[el.dataset.id] = el.checked; render(); return; }
      if (act === 'thing') { st.things[el.dataset.id] = el.checked; render(); return; }
      if (act === 'acct') { st.accts[el.dataset.id] = el.value; render(); return; }
      if (act === 'useaccts') { st.useAccts = el.checked; render(); return; }
      if (act === 'file') { st.files[el.dataset.id] = el.checked; render(); return; }
      if (act === 'fixed') { st.fixed = el.checked; render(); return; }
      if (act === 'fromcomp') { st.fromComp = el.checked; render(); return; }
      if (act === 'onlydiff') { st.onlyDiff = el.checked; render(); return; }
      if (act === 'clash') { st.clash[el.dataset.id] = el.value; return; }
    });
    body.addEventListener('input', (e) => { if (e.target.dataset.act === 'find') { st.q = e.target.value; render(); } });
    body.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]'); if (!b || b.tagName === 'INPUT' || b.tagName === 'SELECT') return;
      if (b.dataset.act === 'more') { st.all = true; render(); }
      if (b.dataset.act === 'openkind') { st.openKinds[b.dataset.kind] = !st.openKinds[b.dataset.kind]; render(); }
    });
    body.addEventListener('toggle', (e) => { if (e.target.matches && e.target.matches('details.psx-adv')) st.advOpen = e.target.open; }, true);
    render();
    // mixed kinds read as mixed to screen readers and sight
    sh.body.addEventListener('psx-render', () => {});
    PSX.copy.st = st;
    PSX.copy.totals = totals;
    return sh;
  }

  /* Settings › Settings Transfer: a primary choice at the top of the manager; the manager's own modes stay below */
  function decorate(mgr) {
    const scroll = mgr.querySelector('.manager-scroll'); if (!scroll || scroll.querySelector('[data-psx-copy]')) return;
    const c = PSX.ctxFull(S.ctx);
    const sec = D.createElement('section');
    sec.className = 'panel-card pm51-section psx-copy-start'; sec.setAttribute('data-psx-copy', '1'); sec.setAttribute('data-o55-foreign', '');
    sec.innerHTML = `<div class="pm51-section-head"><div class="pm51-section-copy"><h3 class="pm51-section-title">Copy settings from another project</h3><p class="pm51-section-help">Bring over what makes another project different: its own settings, its own things and the AI accounts it uses. Sign-ins and keys never move.</p></div><button type="button" class="btn primary" data-psx-copy-open="1">Copy settings…</button></div>`;
    sec.querySelector('[data-psx-copy-open]').addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); open({ mode: 'settings' }); });
    scroll.insertBefore(sec, scroll.firstChild);
  }
  PSX.copy = { open, decorate, STR, KINDS, kindOf, readiness, sourceDiff, SETTINGS };
})(window);
