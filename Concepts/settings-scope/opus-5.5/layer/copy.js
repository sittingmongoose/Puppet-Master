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
    'np.acct.expired': 'Expired on {computer}: sign in again after it’s made',
    'np.acct.keyWhy': 'You paste it once on the device in front of you, and it is kept in {computer}’s password store. Keys are not moved between computers.',
    'np.acct.install': 'Install {tool} on {computer}',
    'np.acct.installWhy': 'Puppet Master never installs a tool by itself. Install it there, then sign in.',
    'np.acct.cannot': 'Can’t be used on {computer}',                                    // cannot_move (guided-flows 3.12)
    'np.acct.cannotWhy': 'It belongs to one device. It stays this Project’s intended choice, and nothing replaces it.'
  };
  const SETTINGS = { sendKeys: false, usualWord: 'Your usual settings', computerWord: 'computer', copyWrites: 'project', computerLevelTravels: false, variesMark: 'origin-word' };
  const t = (k, v) => String(STR[k] || k).replace(/\{(\w+)\}/g, (_, x) => (v && v[x] != null ? v[x] : ''));

  /* ---- the ten kinds in one vocabulary (5.3.1); each setting id belongs to exactly one ---- */
  const KINDS = [
    ['appearance_workspace', 'Look and layout', 'look'], ['assistant_chat', 'Assistant and chat', 'chat'],
    ['providers_accounts_models_routing', 'AI accounts and models', 'AI models'], ['planning_goal', 'Planning and Goals', 'planning'],
    ['orchestrator_automation', 'Automation', 'automation'], ['tools_integrations', 'Tools and connections', 'tools'],
    ['testing_browser_devices', 'Testing, browser and devices', 'testing'], ['permissions_security', 'Permissions and safety', 'permissions'],
    ['memory_retention_history', 'Memory and history', 'memory'], ['notifications_usage_budgets', 'Notifications & limits', 'notifications']
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
  /* ---- which accounts each project chose (the world's, S10 A), and its own things [Demo only] ---- */
  const uses = (p) => (PSX.W.uses && PSX.W.uses[p]) || PSX.W.usualAccounts || [];
  /* what a copy of each thing becomes in the destination: an owned copy (a new record, its sign-in and folder access set
     again there, never copied as ready), a new version of a persona, or the library thing made available there */
  const OWN_THINGS = {
    tastebook: [
      { id: 'filesystem-mcp', name: 'Filesystem MCP', kind: 'MCP server', outcome: (dst, comp) => `copied as ${dst}’s own · its folder access is set again on ${comp}`,
        writes: (dst) => { const t0 = PSX.W.things.mcp['filesystem-mcp']; const comps = {}; PSX.computerIds().forEach((k) => { comps[k] = 'missing'; }); return [{ level: 'thing', key: 'mcp', id: `filesystem-mcp-${dst}`, value: { name: `Filesystem MCP (${dst})`, home: dst, reach: 'only', projects: [dst], copyOf: 'filesystem-mcp', computers: comps, kind: t0 ? 'copy' : 'copy' } }]; } },
      { id: 'reviewer', name: 'Reviewer', kind: 'persona', outcome: (dst) => `tastebook’s version, copied as ${dst}’s version`,
        writes: (dst) => { const r = PSX.clone(PSX.W.things.personas.reviewer); r.versions = [...new Set((r.versions || []).concat(dst))]; return [{ level: 'thing', key: 'personas', id: 'reviewer', value: r }]; } }
    ]
  };
  const REACH_THINGS = { tastebook: [{ id: 'figma-mcp', name: 'Figma MCP', kind: 'MCP server', outcome: (dst) => `make it available in ${dst} too`,
    writes: (dst) => { const t0 = PSX.clone(PSX.W.things.mcp['figma-mcp']); if (t0.reach !== 'only' || (t0.projects || []).includes(dst)) return []; t0.projects = (t0.projects || []).concat(dst); return [{ level: 'thing', key: 'mcp', id: 'figma-mcp', value: t0 }]; } }] };
  const accName = (a) => `${a.service} · ${a.name}`;
  function readiness(key, comp, sameComp) {
    const a = PSX.W.things.accounts[key], s = a.on[comp], cn = placeName('computer', comp);
    /* a sign-in tied to one device's hardware can't be used anywhere else: the account stays the intended choice with
       the reason, never another account in its place (MA-074, Settings_System cannot_move; guided-flows 3.12) */
    if (a.bound && a.bound !== comp) return { mark: 'blocked', text: t('np.acct.cannot', { computer: cn }), why: `${t('np.acct.cannotWhy')} Its sign-in is tied to ${placeName('device', a.bound)}.`, outcome: 'cannot_move' };
    if ((s === 'ready' || s === 'checked') && sameComp) return { mark: 'complete', text: t('np.acct.ready', { computer: cn }), why: t('np.acct.readyWhy'), outcome: 'ready_here' };
    if (s === 'ready' || s === 'checked') return { mark: 'reviewing', text: t('np.acct.checked', { computer: cn }), why: t('np.acct.checkedWhy', { computer: cn }), outcome: 'check_there' };
    if (s === 'missing') return { mark: 'off', text: t('np.acct.install', { tool: a.tool, computer: cn }), why: t('np.acct.installWhy'), outcome: 'not_installed' };
    if (s === 'expired') return { mark: 'warning', text: t('np.acct.expired', { computer: cn }), outcome: 'expired' };
    // a key is Puppet Master's to keep; a tool keeps its own sign-in (SSYS-008, MA-014)
    if (a.kind === 'key') return { mark: 'waiting', text: t('np.acct.key', { computer: cn }), why: t('np.acct.keyWhy', { computer: cn }), outcome: 'key_needed' };
    return { mark: 'waiting', text: t('np.acct.signin', { computer: cn }), why: `Sign-ins stay with the computer that does the work. The sign-in opens on the device in front of you, and ${a.tool} keeps it on ${cn}.`, outcome: 'sign_in_there' };
  }
  const AI_KIND = 'providers_accounts_models_routing';

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
  /* "Keep them fixed": every other setting the destination may own, as the source has it in use today, so later changes
     to your usual settings stop reaching it (S9). Screen, program and folder rows, and keys, stay out */
  function fixedRows(src, dstCtx, have) {
    const p = PSX.projectById(src), srcCtx = { project: src, device: S.ctx.device, on: p ? p.home : null };
    const w = PSX.W, out = [];
    Object.keys(DEF).forEach((id) => {
      const d = DEF[id];
      if (have.has(id) || d.home || d.demoRow || d.owner || !(d.may || []).includes('project')) return;
      const r = PSX.resolve(id, srcCtx); if (!r || r.notOffered) return;
      const v = r.asked !== undefined ? r.asked : r.value;
      const u = PSX.resolve(id, dstCtx);
      out.push({ id, value: clone(v), usual: u ? u.value : DEFAULTS[id], kind: kindOf(id), files: false, same: false, fixed: true, dstOwn: dstCtx.project && PSX.has(w.project[dstCtx.project], id) });
    });
    return out;
  }
  function fromComputer(src) {
    // what the source gets from its own computer (Advanced: "Copy what tastebook gets from This computer")
    const p = PSX.projectById(src), w = PSX.W, bag = w.computer[p ? p.home : 'here'] || {};
    return Object.keys(bag).filter((id) => DEF[id] && !DEF[id].home && (DEF[id].may || []).includes('project') && !PSX.has(w.project[src], id)).map((id) => ({ id, value: bag[id], kind: kindOf(id) }));
  }
  function ownCount(src) { return sourceDiff(src, { project: null, device: 'here', on: null }).filter((x) => !x.files).length; }

  /* ------------------------------------------------------------------ the sheet */
  function open(o) {
    o = o || {};
    const mode = o.mode || 'settings';                 // 'settings' (into this project) or 'new' (New Project, recipe-box on Home NAS)
    const c = PSX.ctxFull(S.ctx);
    // with no project open there is no "this project": the destination is chosen, never invented (section 6)
    /* kindOff: kinds you deselected (a kind's box, or every row in it unticked); pickFixed: fixed rows you unticked one by
       one. Keep them fixed adds only rows of selected kinds and never one you unticked (guided-flows 3.07) */
    const st = { dst: mode === 'new' ? 'recipe-box' : (o.dst || c.project || null), all: false, onlyDiff: true, q: '', pick: {}, things: {}, accts: {}, files: {}, kindOff: {}, pickFixed: {}, fixed: false, fromComp: false, useAccts: true, step: 'choose', openKinds: {}, advOpen: !!o.advanced, clash: {}, frozen: null, stale: null };
    // New Project starts on your usual settings unless a source was chosen first (5.2)
    st.src = o.src || (mode === 'new' ? 'usual' : (st.dst === 'tastebook' ? 'harbor' : 'tastebook'));
    const dstComp = () => (mode === 'new' ? (o.comp || 'homenas') : st.dst ? (PSX.projectById(st.dst) || { home: c.on }).home : c.on);
    const dstCtx = () => ({ project: mode === 'new' ? null : st.dst, device: S.ctx.device, on: dstComp() });
    const sources = () => PROJECTS.map((p) => p.id).filter((p) => p !== st.dst);
    const seed = () => {
      st.pick = {}; st.things = {}; st.accts = {}; st.files = {}; st.clash = {}; st.kindOff = {}; st.pickFixed = {}; st.frozen = null; st.stale = null;
      if (st.src === 'usual' || !st.dst) return;
      sourceDiff(st.src, dstCtx()).forEach((x) => { st.pick[x.id] = !x.files && !x.same; st.files[x.id] = false; if (x.dstOwn) st.clash[x.id] = 'keep'; });
      (OWN_THINGS[st.src] || []).concat(REACH_THINGS[st.src] || []).forEach((x) => { st.things[x.id] = true; });
      uses(st.src).forEach((k) => { st.accts[k] = 'same'; });
    };
    seed();
    const subFor = () => (mode === 'new' ? `${t('np.like.lead')} recipe-box will work on ${placeName('computer', dstComp())}.` : st.dst ? `Into ${st.dst}${st.dst === c.project ? ' (this project)' : ''}. What makes the other project different becomes ${st.dst}’s own.` : 'No project is open. Choose the project to copy into first.');
    const sh = PSX.sheet({
      id: 'copy', size: 'wide', cls: 'psx-copy',
      kicker: mode === 'new' ? 'New Project · recipe-box' : 'Settings Transfer',
      title: mode === 'new' ? t('np.like.title') : 'Copy settings from another project',
      sub: subFor(),
      body: '<div class="psx-copy-body"></div>',
      onClose: () => { if (o.onClose) o.onClose(); }
    });
    const body = sh.body.querySelector('.psx-copy-body');
    PSX.copy.current = { sh, st, mode };
    const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
    /* one plan: the rows (own values, then the fixed ones), the things' writes, the account choice. Totals, the
       preview, the commit and the receipt are all made from it */
    function plan() {
      if (st.src === 'usual' || !st.dst) return { rows: [], things: [], accts: [], copied: [], kept: [] };
      const diff = sourceDiff(st.src, dstCtx());
      let rows = diff.filter((x) => (x.files ? st.files[x.id] : st.pick[x.id]));
      if (!st.useAccts) rows = rows.filter((x) => x.kind !== AI_KIND);
      if (st.fromComp) rows = rows.concat(fromComputer(st.src).filter((x) => !rows.find((y) => y.id === x.id)).map((x) => Object.assign({ usual: PSX.resolve(x.id, dstCtx()).value, dstOwn: mode !== 'new' && PSX.has(PSX.W.project[st.dst], x.id) }, x)));
      if (st.fixed) rows = rows.concat(fixedEligible(diff, rows).filter((x) => !st.kindOff[x.kind] && st.pickFixed[x.id] !== false));
      rows.forEach((x) => { if (x.dstOwn && !st.clash[x.id]) st.clash[x.id] = 'keep'; });
      const things = (OWN_THINGS[st.src] || []).concat(REACH_THINGS[st.src] || []).filter((x) => st.things[x.id]);
      const accts = st.useAccts ? uses(st.src).filter((k) => st.accts[k] === 'same') : [];
      const kept = rows.filter((x) => x.dstOwn && st.clash[x.id] === 'keep');
      const copied = rows.filter((x) => !kept.includes(x));
      return { rows, things, accts, copied, kept };
    }
    /* every row Keep them fixed could add (before your kind and row choices): settings the destination may own, not
       already in the copy, and not AI rows when "Use the same AI accounts" is off */
    function fixedEligible(diff, rows) {
      diff = diff || sourceDiff(st.src, dstCtx());
      const have = new Set(diff.map((x) => x.id).concat((rows || []).map((x) => x.id)));
      return fixedRows(st.src, dstCtx(), have).filter((x) => st.useAccts || x.kind !== AI_KIND);
    }
    function totals() { const p = plan(); return { n: p.copied.length, kept: p.kept.length, things: p.things.length, accts: p.accts.length }; }
    function primaryLabel() {
      const x = totals();
      if (st.src === 'usual') return mode === 'new' ? 'Use your usual settings' : 'Nothing to copy';
      const parts = [plural(x.n, 'setting')]; if (x.things) parts.push(plural(x.things, 'thing')); if (x.accts) parts.push(plural(x.accts, 'AI account'));
      return `Copy ${parts.length > 1 ? parts.slice(0, -1).join(', ') + ' and ' + parts[parts.length - 1] : parts[0]}`;
    }
    function render(o2) {
      o2 = o2 || {};
      const a = D.activeElement && body.contains(D.activeElement) ? D.activeElement : null;
      const keep = a ? (a.getAttribute('data-k') || a.id) : null;
      const caret = a && typeof a.selectionStart === 'number' ? [a.selectionStart, a.selectionEnd] : null;
      const advWasOpen = body.querySelector('details.psx-adv') ? body.querySelector('details.psx-adv').open : st.advOpen;
      st.advOpen = advWasOpen;
      const sub = sh.el.querySelector('.dialog-sub'); if (sub) sub.textContent = subFor();
      body.innerHTML = st.step === 'preview' || st.step === 'done' ? previewHtml() : chooseHtml();
      body.querySelectorAll('input[data-mixed]').forEach((x) => { x.indeterminate = true; });
      const yolo = S.runMode === 'yolo' && mode !== 'new';
      const noDst = mode !== 'new' && !st.dst ? 'Choose the project to copy into.' : null;
      if (st.step === 'done') sh.setActions([{ spacer: true }, { label: 'Undo all of it', run: () => { sh.close('undo'); if (st.tx) PSX.undoTx(st.tx); } }, { label: 'Close', primary: true, run: () => sh.close('ok') }]);
      else if (st.step === 'preview') sh.setActions([{ label: 'Back', run: () => { st.step = 'choose'; render({ focus: `src-${st.src}` }); } }, { spacer: true }, { label: mode === 'new' ? 'Use these for recipe-box' : 'Copy', primary: true, run: apply }]);
      else sh.setActions([{ label: 'Cancel', run: () => sh.close('cancel') }, { spacer: true }, { label: yolo && st.src !== 'usual' ? primaryLabel() + ' now' : primaryLabel(), primary: true, disabled: noDst || (st.src === 'usual' && mode !== 'new' ? 'Choose a project to copy from.' : null), run: () => {
        if (st.src === 'usual') { sh.close(); PSX.note({ title: 'recipe-box will start on your usual settings.', body: 'It follows them from the moment it’s made.', mark: 'complete' }); return; }
        st.frozen = snapshot(plan());
        // YOLO: no Copy yes; the exact preview is shown as the report, after the change (5.3, 5.6)
        if (yolo) { apply(); return; }
        st.step = 'preview'; render({ focus: 'step' });
      } }]);
      if (o2.focus) { const f = o2.focus === 'step' ? body.querySelector('[data-k="step"]') : body.querySelector(`[data-k="${CSS.escape(o2.focus)}"]`); if (f) try { f.focus({ preventScroll: true }); } catch (e) { /* gone */ } return; }
      if (keep) {
        const f = body.querySelector(`[data-k="${CSS.escape(keep)}"]`) || body.querySelector('#' + CSS.escape(keep));
        if (f) { f.focus({ preventScroll: true }); if (caret && typeof f.setSelectionRange === 'function') try { f.setSelectionRange(caret[0], caret[1]); } catch (e) { /* not a text field */ } }
      }
    }
    /* what was previewed, including each chosen account's state on the destination computer: Copy checks all of it
       again at the moment it copies, and shows the preview again if anything moved (guided-flows 3.14) */
    const acctStates = (p) => { const sameComp = PSX.projectById(st.src) && PSX.projectById(st.src).home === dstComp(); return p.accts.map((k) => [k, readiness(k, dstComp(), sameComp).outcome]); };
    const snapshot = (p) => ({ rows: p.rows.map((x) => [x.id, JSON.stringify(x.value), !!x.dstOwn && st.clash[x.id] === 'keep']), things: p.things.map((x) => x.id), accts: p.accts.slice(), acctStates: acctStates(p), comp: dstComp(), dst: st.dst, src: st.src });
    function sourceRow(p) {
      const n = ownCount(p);
      const accts = uses(p).map((k) => PSX.W.things.accounts[k].service);
      const usesTxt = list([...new Set(accts)]) || 'your usual accounts';
      const sub = n ? t('np.like.rowSub', { own: plural(n, 'setting') + ((OWN_THINGS[p] || []).length ? ' and ' + plural((OWN_THINGS[p] || []).length, 'thing') : ''), accounts: usesTxt }) : t('np.like.rowSubNone', { accounts: usesTxt });
      return `<label class="psx-radio${st.src === p ? ' is-on' : ''}"><input type="radio" name="psx-src" value="${esc(p)}" data-k="src-${esc(p)}"${st.src === p ? ' checked' : ''}><span><b>${esc(t('np.like.row', { project: p }))}</b><small>${esc(sub)}</small></span></label>`;
    }
    function chooseHtml() {
      let h = '';
      if (mode !== 'new' && !c.project) h += `<div class="psx-h">Copy into</div><select class="psx-input" data-act="dst" data-k="dst" aria-label="Copy into which project"><option value="">Choose a project</option>${PROJECTS.map((p) => `<option value="${esc(p.id)}"${st.dst === p.id ? ' selected' : ''}>${esc(p.id)}</option>`).join('')}</select><div class="psx-h">Copy from</div>`;
      const srcs = sources();
      const top = mode === 'new' ? ['tastebook', 'harbor'] : srcs.slice(0, 3);
      const shown = st.all ? srcs : top.filter((p) => srcs.includes(p));
      if (st.src !== 'usual' && !shown.includes(st.src) && srcs.includes(st.src)) shown.push(st.src);
      h += `<div class="psx-copy-choice" role="radiogroup" aria-label="Start from">`;
      if (mode === 'new') h += `<label class="psx-radio${st.src === 'usual' ? ' is-on' : ''}"><input type="radio" name="psx-src" value="usual" data-k="src-usual"${st.src === 'usual' ? ' checked' : ''}><span><b>${esc(t('np.like.usual'))}</b><small>${esc(t('np.like.usualSub'))}</small></span></label>`;
      h += shown.map(sourceRow).join('');
      if (!st.all && srcs.length > shown.length) h += `<button type="button" class="psx-tb" data-k="more" data-act="more">${esc(t('np.like.more'))}</button>`;
      h += '</div>';
      if (st.src !== 'usual' && (st.dst || mode === 'new')) h += comesHtml() + advancedHtml();
      return h;
    }
    function comesHtml() {
      const p = plan();
      const diff = p.copied.filter((x) => !x.files && !x.fixed);
      const kinds = [...new Set(diff.map((x) => (KINDS.find((k) => k[0] === x.kind) || [])[2]).filter(Boolean))];
      const things = p.things.filter((x) => (OWN_THINGS[st.src] || []).includes(x));
      const accts = p.accts;
      const sameComp = PSX.projectById(st.src) && PSX.projectById(st.src).home === dstComp();
      let h = `<div class="psx-h">${esc(t('np.like.comes'))}</div><div class="psx-card">`;
      h += `<div class="psx-fact">${mark('complete')}<span>${esc(t('np.like.diffs', { n: diff.length, kinds: list(kinds) || 'none' }))}</span></div>`;
      if (st.fixed) h += `<div class="psx-fact">${mark('complete')}<span>${esc(`Keep them fixed: ${p.copied.filter((x) => x.fixed).length} more settings, each as ${st.src} has it today.`)}</span></div>`;
      if (things.length) h += `<div class="psx-fact">${mark('complete')}<span>${esc(things.length === 1 ? '1 thing of its own: ' : things.length + ' things of its own: ')}${esc(list(things.map((x) => x.kind === 'persona' ? `its version of the ${x.name} persona` : x.name)))}.</span></div>`;
      const reach = p.things.filter((x) => (REACH_THINGS[st.src] || []).includes(x));
      if (reach.length) h += `<div class="psx-fact">${mark('complete')}<span>${esc(list(reach.map((x) => x.name)))}, from your library, ${reach.length === 1 ? 'becomes' : 'become'} available in ${esc(st.dst)} too.</span></div>`;
      if (accts.length) {
        h += `<div class="psx-fact">${mark('complete')}<span>${esc(t('np.like.accounts', { accounts: list([...new Set(accts.map((k) => PSX.W.things.accounts[k].service))]) }))} Only which accounts, in their order: no sign-in, key or token is copied.</span></div><ul class="psx-list psx-accts">`;
        h += accts.map((k) => { const a = PSX.W.things.accounts[k], r = readiness(k, dstComp(), sameComp); return `<li class="psx-li" data-outcome="${esc(r.outcome)}"><span><span class="psx-li-name">${esc(accName(a))}</span>${r.outcome === 'cannot_move' ? `<span class="psx-li-sub" style="display:block">${esc(r.why)}</span>` : ''}</span><span class="psx-li-end" data-pm-hover-label="${esc(r.text)}" data-pm-hover-detail="${esc(r.why || '')}">${PSX.st(r.mark, r.text)}</span></li>`; }).join('') + '</ul>';
      } else if (!st.useAccts) h += `<div class="psx-fact">${mark('info')}<span>${esc(t('np.like.acctOff'))}</span></div>`;
      h += `<div class="psx-fact">${icon('lock')}<span>Never copied: sign-ins themselves, keys, files, history, Goals and Plans.</span></div>`;
      h += `<p class="psx-p psx-muted" style="margin:8px 0 0">${esc(mode === 'new' ? t('np.like.separate') : `These become ${st.dst}’s own settings. Later changes to ${st.src} won’t follow. To change every project at once, change the setting everywhere.`)}</p></div>`;
      return h;
    }
    const q0 = () => st.q.trim().toLowerCase();
    const vis = (x) => (!st.onlyDiff || !x.same) && (!q0() || label(x.id).toLowerCase().includes(q0()));
    function advancedHtml() {
      const all = sourceDiff(st.src, dstCtx());
      const q = q0();
      const settingsRows = all.filter((x) => !x.files);
      const fixedAll = st.fixed ? fixedEligible(all) : [];
      const kinds = KINDS.map(([kid, name]) => {
        const diffRows = settingsRows.filter((x) => x.kind === kid && vis(x));
        const fixedK = fixedAll.filter((x) => x.kind === kid && (!q || label(x.id).toLowerCase().includes(q)));
        const rows = diffRows.concat(fixedK);
        const on = (x) => (x.fixed ? !st.kindOff[kid] && st.pickFixed[x.id] !== false : !!st.pick[x.id]);
        const picked = rows.filter(on).length;
        if (!rows.length) return `<div class="psx-kind" aria-disabled="true"><label class="psx-check" aria-disabled="true"><input type="checkbox" disabled data-k="kind-${kid}"><span>${esc(name)}<small>${esc(t('np.like.kindNone'))}</small></span></label></div>`;
        if (kid === AI_KIND && !st.useAccts) return `<div class="psx-kind" aria-disabled="true"><label class="psx-check" aria-disabled="true"><input type="checkbox" disabled data-k="kind-${kid}"><span>${esc(name)}<small>${esc(t('np.like.singleOff'))}: “${esc(t('np.like.acctSwitch'))}” is off</small></span></label></div>`;
        const openK = !!st.openKinds[kid] || !!q;
        const countTxt = `${picked} of ${rows.length} · ${diffRows.length ? t('np.like.kindCount', { n: diffRows.length }) : t('np.like.kindNone')}${fixedK.length ? ` · ${fixedK.length} kept fixed` : ''}`;
        return `<div class="psx-kind"><div class="psx-kind-head"><label class="psx-check"><input type="checkbox" data-act="kind" data-kind="${kid}" data-k="kind-${kid}"${picked === rows.length ? ' checked' : ''}${picked && picked < rows.length ? ' data-mixed="1" aria-checked="mixed"' : ''}><span>${esc(name)}<small>${esc(countTxt)}</small></span></label><button type="button" class="psx-tb" data-act="openkind" data-kind="${kid}" data-k="open-${kid}" aria-expanded="${openK}" aria-label="${openK ? 'Hide' : 'Show'} the ${esc(name)} settings">${openK ? 'Hide settings' : 'Show settings'}</button></div>`
          + (openK ? `<div class="psx-kind-rows">${rows.map((x) => `<label class="psx-check"><input type="checkbox" data-act="${x.fixed ? 'onefixed' : 'one'}" data-kind="${kid}" data-id="${esc(x.id)}" data-k="${x.fixed ? 'fix' : 'one'}-${esc(x.id)}"${on(x) ? ' checked' : ''}><span>${esc(label(x.id))} · ${esc(vt(x.id, x.value))} <span class="psx-muted">${x.fixed ? '(kept fixed as it is today)' : `(your usual: ${esc(vt(x.id, x.usual))})`}</span>${on(x) ? '' : `<small>${esc(t('np.like.singleOff'))}</small>`}</span></label>`).join('')}</div>` : '') + '</div>';
      }).join('');
      const things = (OWN_THINGS[st.src] || []).concat(REACH_THINGS[st.src] || []);
      const thingsHtml = things.length ? things.map((x) => `<label class="psx-check"><input type="checkbox" data-act="thing" data-id="${esc(x.id)}" data-k="thing-${esc(x.id)}"${st.things[x.id] ? ' checked' : ''}><span>${esc(x.name)}${x.kind === 'persona' ? ' (persona)' : ''} · ${esc(x.outcome(st.dst, placeName('computer', dstComp())))}</span></label>`).join('') : `<p class="psx-p psx-muted">${esc(t('np.like.thingNone'))}</p>`;
      const accts = uses(st.src);
      const sameComp = PSX.projectById(st.src) && PSX.projectById(st.src).home === dstComp();
      const acctHtml = `<label class="psx-check"><input type="checkbox" data-act="useaccts" data-k="useaccts"${st.useAccts ? ' checked' : ''}><span>${esc(t('np.like.acctSwitch'))}<small>${esc(t('np.like.acctSwitchSub'))}</small></span></label>`
        + (st.useAccts ? `<ul class="psx-list">${accts.map((k) => { const a = PSX.W.things.accounts[k], r = readiness(k, dstComp(), sameComp); return `<li class="psx-li"><span><span class="psx-li-name">${esc(accName(a))}</span><span class="psx-li-sub" style="display:block">${PSX.st(r.mark, r.text)}</span></span><span class="psx-li-end"><select class="psx-input" data-act="acct" data-id="${esc(k)}" data-k="acct-${esc(k)}" aria-label="${esc(accName(a))}"><option value="same"${st.accts[k] === 'same' ? ' selected' : ''}>Use the same account</option><option value="later"${st.accts[k] === 'later' ? ' selected' : ''}>Choose later</option></select></span></li>`; }).join('')}</ul>` : `<p class="psx-p psx-muted">${esc(t('np.like.acctOff'))}</p>`);
      const files = all.filter((x) => x.files);
      const filesHtml = (files.length ? files : [{ id: 'memory.assembly.project-rules', value: '', none: true }]).map((x) => `<label class="psx-check"${x.none ? ' aria-disabled="true"' : ''}><input type="checkbox" data-act="file" data-id="${esc(x.id)}" data-k="file-${esc(x.id)}"${st.files[x.id] ? ' checked' : ''}${x.none ? ' disabled' : ''}><span>${esc(label(x.id))}${x.none ? '<small>It has none of its own</small>' : ` · ${esc(vt(x.id, x.value))}`}</span></label>`).join('')
        + `<label class="psx-check" aria-disabled="true"><input type="checkbox" disabled><span>Build files<small>It has none of its own</small></span></label><label class="psx-check" aria-disabled="true"><input type="checkbox" disabled><span>Its online copy’s address<small>A new project gets its own</small></span></label>`;
      const fc = fromComputer(st.src);
      const p = PSX.projectById(st.src);
      const nFixed = st.fixed ? plan().rows.filter((x) => x.fixed).length : fixedRows(st.src, dstCtx(), new Set(all.map((x) => x.id))).length;
      const alsoHtml = `<label class="psx-check"><input type="checkbox" data-act="fixed" data-k="fixed"${st.fixed ? ' checked' : ''}><span><b>Keep them fixed</b><small>Copy every setting as ${esc(st.src)} has it (${nFixed} more), so ${esc(st.dst)} stops following later changes to your usual settings. For a client’s project that must not drift. Screen, program and folder settings stay with each device and computer.</small></span></label>`
        + `<label class="psx-check"${fc.length ? '' : ' aria-disabled="true"'}><input type="checkbox" data-act="fromcomp" data-k="fromcomp"${st.fromComp ? ' checked' : ''}${fc.length ? '' : ' disabled'}><span>Copy what ${esc(st.src)} gets from ${esc(placeName('computer', p ? p.home : 'here'))} as ${esc(st.dst)}’s own (${fc.length})<small>${esc(fc.map((x) => label(x.id) + ' ' + vt(x.id, x.value)).join(' · ') || 'Nothing')}</small></span></label>`;
      const never = [['Shell', 'belongs to each computer'], ['Claude Code app location', 'belongs to each computer'], ['Text size', 'belongs to each device'], ['OpenRouter API key', 'keys never move'], ['Sign-ins', 'stay on the computer where you signed in']];
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
    function rowLi(x) {
      const clash = x.dstOwn ? st.clash[x.id] : null, done = st.step === 'done';
      return `<li class="psx-li"><span class="psx-li-name">${esc(label(x.id))}: ${esc(vt(x.id, x.value))}${x.fixed ? ' (fixed)' : ` instead of your usual ${esc(vt(x.id, x.usual))}`}.</span>${clash ? (done ? `<span class="psx-li-end">${PSX.st('info', clash === 'keep' ? `${st.dst}’s own kept` : 'theirs used')}</span>` : `<span class="psx-li-end"><select class="psx-input" data-act="clash" data-id="${esc(x.id)}" aria-label="${esc(label(x.id))}: ${esc(st.dst)} has its own"><option value="keep"${clash === 'keep' ? ' selected' : ''}>Keep ${esc(st.dst)}’s</option><option value="theirs"${clash === 'theirs' ? ' selected' : ''}>Use theirs</option></select></span>`) : ''}</li>`;
    }
    function previewHtml() {
      const p = st.step === 'done' && st.donePlan ? st.donePlan : plan(), sameComp = PSX.projectById(st.src) && PSX.projectById(st.src).home === dstComp();
      const own = p.rows.filter((x) => !x.fixed), fixed = p.rows.filter((x) => x.fixed);
      const done = st.step === 'done';
      let h = done
        ? `<h3 class="psx-h" tabindex="-1" data-k="step">${mark('complete')} Copied without asking (YOLO)</h3><p class="psx-p">${esc(receipt(p))} This is the exact preview it applied; YOLO didn’t ask for a yes.</p><ul class="psx-list">`
        : `<h3 class="psx-h" tabindex="-1" data-k="step">${esc(mode === 'new' ? 'recipe-box will start with' : `${st.dst} gets`)}</h3>${st.stale ? `<p class="psx-p" data-psx-stale="${st.staleAcct ? 'accounts' : 'source'}">${mark('warning')} <b>${esc(st.staleAcct ? `${placeName('computer', dstComp())} changed since this preview:` : `${st.src} changed since this preview:`)}</b> ${esc(st.stale)}. Look again; Copy uses what is shown now.</p>` : ''}<p class="psx-p">${mark('info')} Nothing changes until you choose ${esc(mode === 'new' ? 'Use these' : 'Copy')}.</p><ul class="psx-list">`;
      h += own.map(rowLi).join('');
      h += p.things.map((x) => `<li class="psx-li"><span class="psx-li-name">${esc(x.name)}: ${esc(x.outcome(st.dst, placeName('computer', dstComp())))}.</span></li>`).join('');
      h += p.accts.map((k) => { const a = PSX.W.things.accounts[k], r = readiness(k, dstComp(), sameComp); return `<li class="psx-li" data-outcome="${esc(r.outcome)}"><span class="psx-li-name">${esc(accName(a))}: chosen for ${esc(st.dst)} (the account, not its sign-in).</span><span class="psx-li-end" data-pm-hover-label="${esc(r.text)}" data-pm-hover-detail="${esc(r.why || '')}">${PSX.st(r.mark, r.text)}</span></li>`; }).join('');
      h += `</ul>`;
      if (fixed.length) h += `<details class="psx-adv"><summary data-k="fixedlist"><svg class="psx-chev" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M4.5 2.5 8 6l-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Keep them fixed: ${fixed.length} more settings, each as ${esc(st.src)} has it today</span></summary><ul class="psx-list">${fixed.map(rowLi).join('')}</ul></details>`;
      h += `<p class="psx-p psx-muted" style="margin-top:10px">Skipped: sign-ins, keys, files and history (never copied); screen settings (they belong to each device); program and folder settings (they belong to each computer).</p>`;
      if (!done) h += `<p class="psx-p psx-muted">${mode === 'new' ? 'Nothing applies before the project is made.' : 'It is one change with one Undo, checked when it is saved.'}</p>`;
      return h;
    }
    function receipt(p) {
      const kept = p.kept.length;
      return `Copied ${plural(p.copied.length, 'setting')}${kept ? ` (${kept} kept as ${st.dst}’s own)` : ''}${p.things.length ? ', ' + plural(p.things.length, 'thing') : ''}${p.accts.length ? ' and ' + plural(p.accts.length, 'AI account') : ''} from ${st.src} into ${st.dst}.`;
    }
    function apply() {
      const p = plan();
      // the preview is what is copied: a source that changed since is shown again, never copied blind (SSYS-007)
      const now = snapshot(p);
      if (st.frozen && JSON.stringify(now) !== JSON.stringify(st.frozen)) {
        const was = new Map(st.frozen.rows.map((r) => [r[0], r[1]]));
        const moved = p.rows.filter((x) => was.has(x.id) && was.get(x.id) !== JSON.stringify(x.value)).map((x) => `${label(x.id)} is now ${vt(x.id, x.value)}`);
        const sameComp = PSX.projectById(st.src) && PSX.projectById(st.src).home === dstComp();
        const wasA = new Map((st.frozen.acctStates || []).map((r) => [r[0], r[1]]));
        const acctMoved = p.accts.filter((k) => wasA.has(k) && wasA.get(k) !== readiness(k, dstComp(), sameComp).outcome).map((k) => `${accName(PSX.W.things.accounts[k])} on ${placeName('computer', dstComp())}: ${readiness(k, dstComp(), sameComp).text}`);
        if (st.frozen.comp && st.frozen.comp !== dstComp()) acctMoved.unshift(`the work computer is now ${placeName('computer', dstComp())}`);
        st.stale = moved.length || acctMoved.length ? list(moved.concat(acctMoved), 3) : 'what it brings is different now';
        st.staleAcct = !!acctMoved.length && !moved.length;
        st.frozen = now; st.step = 'preview'; render({ focus: 'step' });
        return;
      }
      if (mode === 'new') {
        sh.close('ok');
        PSX.note({ title: `recipe-box will start like ${st.src}.`, body: `${plural(p.copied.length, 'setting')}${p.things.length ? ', ' + plural(p.things.length, 'thing') : ''}${p.accts.length ? ' and ' + plural(p.accts.length, 'AI account') : ''}. Nothing is applied until it’s made; its Done page offers Undo the copied settings.`, mark: 'complete', ms: 9000 });
        return;
      }
      const writes = p.copied.map((x) => ({ level: 'project', key: st.dst, id: x.id, value: x.value }));
      p.things.forEach((x) => { (x.writes ? x.writes(st.dst) : []).forEach((w) => writes.push(w)); });
      if (st.useAccts) writes.push({ level: 'uses', key: null, id: st.dst, value: p.accts.slice() });
      const yolo = S.runMode === 'yolo';
      PSX.run('cmd.settings.transaction.apply', [500, 400], () => {
        const tx = PSX.write(writes, { batch: 'copy', yolo, text: receipt(p), extra: { from: st.src, into: st.dst, accounts: p.accts.slice(), things: p.things.map((x) => x.id) } });
        if (!tx) { if (yolo) sh.close('refused'); return; }
        st.tx = tx.id;
        if (yolo) { st.donePlan = p; st.step = 'done'; render({ focus: 'step' }); return; }
        sh.close('ok');
        PSX.note({ title: receipt(p), body: `They are ${st.dst}’s own now. History keeps “Undo all of it”.`, actions: [{ label: 'Undo', run: () => PSX.undoTx(tx.id) }], kind: 'saved' });
      });
    }
    // events
    body.addEventListener('change', (e) => {
      const el = e.target, act = el.dataset.act;
      if (el.name === 'psx-src') { st.src = el.value; seed(); render({ focus: `src-${st.src}` }); return; }
      if (act === 'dst') { st.dst = el.value || null; if (st.src === st.dst) st.src = st.dst === 'tastebook' ? 'harbor' : 'tastebook'; seed(); render({ focus: 'dst' }); return; }
      // a kind's box changes only the rows it shows (the find box and Only what's different filter it too)
      if (act === 'kind') {
        const kid = el.dataset.kind;
        const rows = sourceDiff(st.src, dstCtx()).filter((x) => !x.files && x.kind === kid && vis(x)); rows.forEach((x) => { st.pick[x.id] = el.checked; });
        // the kind itself is selected or not: Keep them fixed follows it, now and if it is turned on later
        st.kindOff[kid] = !el.checked;
        if (el.checked) fixedEligible().filter((x) => x.kind === kid).forEach((x) => { delete st.pickFixed[x.id]; });
        render(); return;
      }
      if (act === 'one' || act === 'onefixed') {
        const kid = el.dataset.kind;
        if (act === 'one') st.pick[el.dataset.id] = el.checked; else { st.pickFixed[el.dataset.id] = el.checked; if (el.checked) st.kindOff[kid] = false; }
        // a kind with nothing left ticked is a deselected kind
        const diffK = sourceDiff(st.src, dstCtx()).filter((x) => !x.files && x.kind === kid);
        const fixK = st.fixed ? fixedEligible().filter((x) => x.kind === kid) : [];
        const any = diffK.some((x) => st.pick[x.id]) || (!st.kindOff[kid] && fixK.some((x) => st.pickFixed[x.id] !== false));
        if (el.checked) st.kindOff[kid] = false; else if (!any) st.kindOff[kid] = true;
        render(); return;
      }
      if (act === 'thing') { st.things[el.dataset.id] = el.checked; render(); return; }
      if (act === 'acct') { st.accts[el.dataset.id] = el.value; render(); return; }
      if (act === 'useaccts') { st.useAccts = el.checked; render(); return; }
      if (act === 'file') { st.files[el.dataset.id] = el.checked; render(); return; }
      if (act === 'fixed') { st.fixed = el.checked; render(); return; }
      if (act === 'fromcomp') { st.fromComp = el.checked; render(); return; }
      if (act === 'onlydiff') { st.onlyDiff = el.checked; render(); return; }
      if (act === 'clash') { st.clash[el.dataset.id] = el.value; if (st.frozen) st.frozen = snapshot(plan()); return; }
    });
    body.addEventListener('input', (e) => { if (e.target.dataset.act === 'find') { st.q = e.target.value; render(); } });
    body.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]'); if (!b || b.tagName === 'INPUT' || b.tagName === 'SELECT') return;
      if (b.dataset.act === 'more') { st.all = true; render(); }
      if (b.dataset.act === 'openkind') { st.openKinds[b.dataset.kind] = !st.openKinds[b.dataset.kind]; render(); }
    });
    body.addEventListener('toggle', (e) => { if (e.target.matches && e.target.matches('details.psx-adv')) st.advOpen = e.target.open; }, true);
    render();
    PSX.copy.st = st;
    PSX.copy.totals = totals;
    PSX.copy.plan = plan;
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
