/* O55.pipScenes — what each screen puts on Pip's stage (DL-238; the concept's scene(h) functions in
   Concepts/onboarding/opus-5.5-pip/wizard.js, carried to the real wizard's 44 screens). A screen's spec says which
   props hang (each on its own string, in a slot of the layout or on Creating's stack), what Pip looks at and how it
   feels, what it says, and what NieR's HUD and Retro's terminal print:
     { chapter, props: [{ id, kind, slot | stack, params, preview, scale, ground }], pip: { mood, look, pose, work,
       power }, say, target, label, cmd }
   The words are the copy lane's: Pip's lines pip.say.<screen>[id] ('enter' on arrival, a choice's control id for its
   preview, named states such as typing, checking, done), the HUD and terminal labels pip.stage.screens.<screen>. The
   face of each line is the copy manifest's (FACES; idea 3: Pip's face matches what it says), watch while it rests
   on a choice, happy when the choice is made (60-ui-core.js), wonder while the person types into a field, and the
   oops face when the screen shows something gone wrong (O55.pipOops below), with its cheer once it is put right. */
(function () {
  'use strict';
  const O55 = window.O55;
  const md = (S) => S.sess.drafts.main;
  const FACES = {"welcome":{"asleep":"sleep","wake":"happy","wakeAgain":"happy","resumed":"happy","returning":"happy"},"look":{"enter":"idle","keep":"watch","pickFamily:basic":"watch","pickFamily:friendly":"happy","pickFamily:glass":"wonder","pickFamily:retro":"happy","pickNier":"watch","pickMode:light":"watch","pickMode:dark":"watch","nierOff":"happy"},"where":{"enter":"watch","pick:this":"happy","pick:connect":"watch","pick:server":"watch","checking":"think","checked":"happy","offline":"watch"},"c-route":{"enter":"think","found":"wonder","group:pickServer":"happy","route:local_or_vpn":"watch","route:tailscale":"watch","route:reverse_proxy":"wonder","route:remote_link":"watch","typing":"wonder"},"c-review":{"enter":"watch","pairing:approval":"watch","pairing:code":"happy","pairing:qr":"happy"},"c-pair":{"enter":"watch","waiting":"think","qr":"think","typing":"wonder","checking":"think","done":"happy"},"c-ready":{"enter":"happy","empty":"watch","createNew":"happy","group:pickProject":"watch"},"s-kind":{"enter":"watch","kind:nas":"happy","kind:cloud":"wonder","kind:pc":"watch"},"s-wait":{"enter":"think","found":"happy","typing":"wonder","copied":"happy"},"s-confirm":{"enter":"watch","typing":"wonder","group:suggest":"happy","working":"think","selfMatch":"watch","done":"happy"},"s-ready":{"enter":"happy","waiting":"watch","approved":"happy","denied":"watch","newCode":"happy"},"r-source":{"enter":"watch","source:kit":"happy","source:folder":"watch","source:nas":"watch","source:cloud":"watch","typing":"wonder"},"r-unlock":{"enter":"watch","typing":"wonder","unlocked":"happy"},"r-pick":{"enter":"watch","group:pick":"watch"},"r-preview":{"enter":"watch","working":"think","done":"happy"},"r-done":{"enter":"happy","group:pickProject":"watch","createNew":"happy"},"begin":{"enter":"watch","server":"watch","pick:new":"happy","pick:existing":"watch","pick:restore":"happy","sub:folder":"watch","sub:online":"watch","sub:device":"watch","later":"happy"},"ex-folder":{"enter":"watch","reading":"think","hasHistory":"happy","noHistory":"happy"},"name":{"empty":"watch","typing":"wonder","named":"happy","group:suggest":"happy","loc:auto":"watch","loc:custom":"watch","loc:network":"wonder","storage:with_server":"happy","storage:this_device":"watch","storage:network_location":"watch"},"like":{"enter":"watch","pick:fresh":"happy","group:pick":"watch"},"online-service":{"enter":"watch","enterSource":"watch","pick:github":"happy","pick:gitlab":"watch","pick:azure_devops":"watch","pick:bitbucket_cloud":"watch","pick:forgejo":"watch","pick:gitea":"watch","pick:github_enterprise":"watch","pick:cursor_origin":"wonder","typing":"wonder"},"online-signin":{"enter":"watch","known":"happy","waiting":"think","code":"watch","typing":"wonder","create":"watch","done":"happy"},"online-details":{"enter":"watch","typing":"wonder","available":"happy","vis:private":"watch","vis:public":"watch","vis:internal":"watch"},"ex-repos":{"enter":"watch","typing":"wonder","group:pick":"happy","empty":"watch"},"safe":{"enter":"idle","backend:git":"watch","backend:jujutsu":"wonder","install":"watch","keeps":"happy","filesafe":"watch","filesafeOn":"happy","filesafeOff":"watch","online":"watch","backup":"watch","bdest:nas":"watch","bdest:gdrive":"watch","bdest:onedrive":"watch","bdest:s3":"happy","bdest:sftp":"watch","bdest:none":"watch","sync":"happy"},"away":{"enter":"watch","pick:home":"happy","pick:anywhere":"happy","route:headscale":"watch","route:reverse_proxy":"wonder","route:remote_link":"watch","typing":"wonder"},"review":{"enter":"watch","checked":"happy","later":"watch","changed":"wonder","group:edit":"watch"},"creating":{"folder":"think","history":"think","historyInstall":"think","clone":"think","restore":"think","device":"think","online":"think","settings":"think","remote":"think","check":"think","last":"think","done":"happy","doneLater":"happy","closeOk":"watch"},"protect":{"enter":"watch","step:signin":"watch","step:test":"think","step:kit":"watch","step:kitTest":"watch","step:policy":"happy","working":"think","done":"happy"},"ai":{"checking":"watch","none":"sleep","one":"happy","many":"happy","installing":"think","signingIn":"think","typing":"wonder","testing":"watch","free":"watch"},"ai-all":{"enter":"watch","typing":"wonder"},"ai-none":{"enter":"watch","pick:sub":"watch","pick:api":"watch","pick:free":"happy"},"free":{"enter":"watch","working":"think","ready":"happy"},"ready":{"enter":"happy","later":"happy"},"nas-find":{"enter":"think","group:device":"watch","method:ssh":"watch","method:smb":"watch","method:nfs":"watch","method:mounted":"happy","sshOff":"watch","pm":"happy","typing":"wonder"},"nas-identity":{"enter":"watch","known":"happy","trusted":"happy"},"nas-key":{"enter":"watch","looking":"think","group:pick":"watch","works":"happy","locked":"watch","notAdded":"watch","pick:new":"happy","typing":"wonder","testing":"think"},"nas-signin":{"enter":"watch","typing":"wonder","self":"watch"},"nas-install":{"enter":"think","done":"happy"},"nas-pmpair":{"enter":"watch","waiting":"think","typing":"wonder","done":"happy"},"nas-folder":{"enter":"watch","storage":"watch","typing":"wonder"},"nas-smb":{"enter":"watch","typing":"wonder","checking":"think"},"nas-nfs":{"enter":"think","done":"happy"},"nas-mounted":{"enter":"watch","group:volume":"watch"}};
  const lines = (scr) => { const m = O55.tx('pip.say.' + scr); return m && typeof m === 'object' ? m : {}; };
  const fill = (s, v) => String(s || '').replace(/\{(\w+)\}/g, (m, k) => (v && v[k] != null ? v[k] : m));
  const line = (scr, id, v) => { const t = lines(scr)[id]; return t ? fill(t, v) : ''; };
  const has = (scr, id) => !!lines(scr)[id];
  const stg = (scr, k, v) => { const t = O55.tx('pip.stage.screens.' + scr + '.' + k); return typeof t === 'string' ? fill(t, v) : ''; };
  const P = (kind, slot, o) => Object.assign({ id: kind, kind, slot }, o || {});
  const op = (S, key) => (O55.flow && key ? O55.flow.state(S, key) : null);
  const forgeName = (S) => { const f = O55.fixtures.forge(md(S).forge); return f ? f.name : 'GitHub'; };
  /* the phase Creating is on: the one under way, else the first not done (the operation keeps no 'current') */
  const phaseNow = (S) => { const st = op(S, (S.sess.commit || {}).key), ph = (st && st.phases) || []; const a = ph.find((p) => p.status === 'active') || ph.find((p) => p.status !== 'done'); return a ? a.key : null; };
  /* the review's clipboard: ticked off line by line as the recheck finds each part ready */
  const ticks = (S) => { const st = op(S, 'recheck:' + md(S).project_draft_revision); return st && st.state === 'done' ? 4 : st ? Math.min(4, (st.phases || []).filter((p) => p.status === 'done').length) : 0; };

  /* Each screen: props(S, hover) -> props; state(S) -> the line for where the screen stands ('enter' otherwise);
     look: the prop Pip watches; vars(S): the words its line and terminal fill in. A hover is a control id; a screen
     with prev(h) previews that choice's props (dashed strings) while Pip says that choice's line. */
  const one = (kind, slot) => () => [P(kind, slot || 'side')];
  const two = (a, b) => () => [P(a, 'pairA'), P(b, 'pairB')];
  const nasWith = (k) => () => [P('nas', 'pairA'), P(k, 'pairB')];
  const ORBS = (S) => {
    const ids = O55.ai ? O55.ai.shortlist(S).slice(0, 4).map((p) => p.id) : ['claude', 'codex', 'antigravity', 'cursor'];
    const ready = O55.ai ? O55.ai.readyIds(S) : [];
    return ids.map((id, i) => P('orb', 'o' + (i + 1), { id: 'o' + id, scale: 0.9, params: { lit: ready.includes(id), label: O55.ai && O55.ai.mono ? O55.ai.mono(O55.fixtures.provider(id) || { id, name: id }) : id.slice(0, 2).toUpperCase(), hue: ['e', 'b', 'c', 'd'][i] } }));
  };
  /* the choice on show: the one previewed (h, a control id <action>:<value>) or else the one chosen; preview only when
     the previewed choice is not the chosen one (Astra M02) */
  const choice = (h, action, chosen) => { const v = h && h.indexOf(action + ':') === 0 ? h.slice(action.length + 1) : null; return { v: v || chosen, preview: !!v && v !== chosen }; };
  const cdr = (S) => (S.sess.drafts && S.sess.drafts.connect) || {}, far = (m) => /^(tailscale|reverse_proxy|remote_link)$/.test(m || '');
  const WHERE = { this: 'laptop', connect: 'phone', server: 'server' };
  const BEGIN = { new: 'page', existing: 'folder', restore: 'restore' };
  const SUB = { folder: 'folder', online: 'forge', device: 'nas' };
  const SCREENS = {
    welcome: { props: () => [], state: (S) => (O55.S.resumed ? 'resumed' : S.env.here.projects.length ? 'returning' : 'wake'), look: [0, -2.4] },
    look: { props: () => [P('palette', 'side')], state: (S) => (S.env.here.projects.length ? 'keep' : 'enter'), vars: () => ({ look: O55.theme().family }) },
    where: {
      props(S, h) {
        const w = h && /^pick:/.test(h) ? h.slice(5) : S.sess.ui.where || 'this', pv = !!h && h !== 'pick:' + (S.sess.ui.where || 'this');
        return w === 'connect' ? [P('laptop', 'pairA', { preview: pv }), P('phone', 'pairB', { preview: pv })] : [P(WHERE[w] || 'laptop', 'side', { preview: pv })];
      },
      state(S) { const st = op(S, 'check:here'); return st && st.state === 'running' ? 'checking' : st && st.state === 'done' ? (S.env.here.internet ? 'checked' : 'offline') : 'enter'; },
      vars: (S) => ({ prop: WHERE[S.sess.ui.where || 'this'] })
    },
    'c-route': { props: (S, h) => { const m = cdr(S).remote_mode, c = choice(h, 'route', m || 'local_or_vpn'); return [P('laptop', 'pairA'), P(far(c.v) ? 'globe' : 'house', 'pairB', { preview: c.preview && far(c.v) !== far(m) })]; }, state: () => 'enter' },
    'c-review': { props: (S, h) => { const c = choice(h, 'pairing', cdr(S).connection_pairing || 'approval'); return [P('phone', 'pairA'), P({ qr: 'qr', code: 'key' }[c.v] || 'idcard', 'pairB', { preview: c.preview })]; }, vars: (S) => ({ method: cdr(S).connection_pairing || 'approval' }) },
    'c-pair': { props: two('idcard', 'qr') },
    'c-ready': { props: () => [P('laptop', 'pairA'), P('server', 'pairB')] },
    's-kind': { props: (S, h) => { const c = choice(h, 'kind', (S.sess.server && S.sess.server.kind) || 'nas'); return [P({ cloud: 'cloud', pc: 'server' }[c.v] || 'nas', 'side', { preview: c.preview })]; }, vars: (S) => ({ kind: (S.sess.server && S.sess.server.kind) || 'nas' }) },
    's-wait': { props: two('nas', 'key') },
    's-confirm': { props: two('server', 'key'), vars: (S) => ({ name: (S.sess.server && S.sess.server.displayName) || '' }) },
    's-ready': { props: () => [P('server', 'pairA'), P('qr', 'pairB'), P('phone', 'hi')] },
    'r-source': { props: (S, h) => { const c = choice(h, 'source', (S.sess.restore && S.sess.restore.source) || 'kit'); return [P('restore', 'pairA'), P({ folder: 'folder', nas: 'nas', cloud: 'cloud' }[c.v] || 'kit', 'pairB', { preview: c.preview })]; }, vars: (S) => ({ source: (S.sess.restore && S.sess.restore.source) || 'kit' }) },
    'r-unlock': { props: two('kit', 'lock') },
    'r-pick': { props: two('restore', 'clipboard') },
    'r-preview': { props: one('restore'), work: true },
    'r-done': { props: () => [P('restore', 'pairA'), P('page', 'pairB')] },
    begin: {
      props(S, h) {
        const ui = S.sess.ui, ch = ui.begin || 'new', b = h && /^pick:/.test(h) ? h.slice(5) : ch;
        let kind = BEGIN[b] || 'page';
        if (h && /^sub:/.test(h)) kind = SUB[h.slice(4)] || 'folder'; else if (!h && ch === 'existing' && ui.beginSub) kind = SUB[ui.beginSub] || 'folder';
        return [P(kind, 'side', { preview: !!h && h !== 'pick:' + ch && h !== 'sub:' + ui.beginSub })];
      },
      vars: (S) => ({ begin: S.sess.ui.begin || 'new' })
    },
    'ex-folder': { props: one('folder'), state: (S) => (S.sess.folderInfo ? (S.sess.folderInfo.history ? 'hasHistory' : 'noHistory') : 'enter') },
    name: { props: (S) => [P('sign', 'sign', { params: { text: (md(S).project_name || '').trim() } })], state: (S) => ((md(S).project_name || '').trim() ? 'named' : 'empty'), vars: (S) => ({ name: (md(S).project_name || '').trim().slice(0, 18) }) },
    like: { props: (S, h) => [P(h === 'pick:fresh' || (!h && md(S).settings_transfer.mode !== 'copy_from_project') ? 'page' : 'settings', 'side', { preview: !!h })], vars: (S) => ({ from: md(S).settings_transfer.mode === 'copy_from_project' ? 'copy' : 'fresh' }) },
    'online-service': { props: one('forge'), vars: (S) => ({ service: md(S).forge || 'github' }) },
    'online-signin': { props: two('forge', 'key'), state: (S) => { const si = S.sess.signin || {}; return si.state === 'done' ? 'done' : si.state === 'waiting' ? 'waiting' : si.state === 'code' ? 'code' : si.state === 'create' ? 'create' : 'enter'; }, vars: (S) => ({ service: (S.sess.signin || {}).name || forgeName(S) }) },
    'online-details': { props: (S) => [P('forge', 'pairA'), P('sign', 'pairB', { scale: 0.8, params: { text: md(S).repository_name || '' } })], vars: (S) => ({ name: md(S).repository_name || '' }) },
    'ex-repos': { props: two('forge', 'folder'), vars: (S) => ({ name: md(S).repository_name || '' }) },
    safe: {
      props(S, h) {
        const d = md(S), online = d.online_mode !== 'none' || h === 'online', backup = !!S.sess.backup.dest || h === 'backup' || (h && /^bdest:/.test(h) && h !== 'bdest:none');
        const out = [P('vault', online || backup ? 'pairA' : 'side')];
        if (online) out.push(P('cloud', 'hi', { preview: d.online_mode === 'none' }));
        if (backup) out.push(P('backup', 'pairB', { preview: !S.sess.backup.dest }));
        return out;
      },
      vars: (S) => ({ kind: md(S).history_backend === 'jujutsu' ? 'jujutsu' : 'git' })
    },
    away: { props: (S, h) => { const any = h ? h !== 'pick:home' : !['local_or_vpn', 'none'].includes(md(S).remote_mode); return any ? [P('house', 'pairA', { preview: !!h }), P('globe', 'pairB', { preview: !!h })] : [P('house', 'side', { preview: !!h })]; },
      vars: (S) => ({ mode: ['local_or_vpn', 'none'].includes(md(S).remote_mode) ? 'home' : 'anywhere' }) },
    review: { props: (S) => [P('clipboard', 'side', { params: { ticks: ticks(S), rows: 4 } })], state: (S) => (md(S).project_mode === 'later' ? 'later' : ticks(S) >= 4 ? 'checked' : 'enter'), vars: (S) => ({ done: ticks(S), total: 4 }) },
    creating: {
      /* O12: a block for each owner phase that has completed, lowered onto the stack as it completes; once the Project is
         made, Continue waits for the last to land (Jared's O12 B; about half a second, at once under Reduced Motion) */
      props(S) {
        /* (the phases Creating shows done: on the GitHub chain only what the accepted owner result settled, FO-9; a block
           keeps its phase's identity, so one not confirmed lifts off and a settled one stays where it landed) */
        const list = O55.review ? O55.review.phasesFor(S) : [], shown = O55.review && O55.review.shownPhases ? O55.review.shownPhases(S) : [];
        const keys = O55.review && O55.review.shownDone(S) ? list : shown.filter((p) => p.status === 'done').map((p) => p.key);
        const ICON = { folder: 'folder', device: 'nas', clone: 'cloud', restore: 'restore', history: 'history', historyInstall: 'history', online: 'cloud', settings: 'stack', remote: 'globe', check: 'check' };
        return keys.map((k, i) => ({ id: 'b-' + k, kind: 'block', stack: i, ground: true, params: { icon: ICON[k] || 'check', hue: 'abcde'[list.indexOf(k) % 5], count: list.length } }));
      },
      state(S) {
        if (O55.review && O55.review.shownDone(S)) return md(S).project_mode === 'later' ? 'doneLater' : 'done';
        const list = O55.review ? O55.review.phasesFor(S) : [], cur = phaseNow(S);
        if (!cur) return list[0] || 'folder';
        return list.indexOf(cur) === list.length - 1 && list.length > 1 ? 'last' : cur;
      },
      work: true,
      vars(S) {
        const list = O55.review ? O55.review.phasesFor(S) : [], done = O55.review && O55.review.shownPhases ? O55.review.shownPhases(S).filter((p) => p.status === 'done').length : 0;
        return { kind: md(S).history_backend === 'jujutsu' ? 'Jujutsu' : 'Git', service: forgeName(S), device: (S.sess.nas && S.sess.nas.folderLabel) || '', phase: phaseNow(S) || list[Math.min(done, list.length - 1)] || 'check', done, total: list.length };
      }
    },
    protect: { props: () => [P('lock', 'pairA'), P('kit', 'pairB'), P('backup', 'hi', { scale: 0.8 })], state: (S) => { const b = S.sess.backup || {}; return b.done && b.done.length >= 5 ? 'done' : 'enter'; },
      vars: (S) => { const b = S.sess.backup || {}, done = b.done || []; return { step: ['signin', 'test', 'kit', 'kitTest', 'policy'].find((s) => !done.includes(s)) || 'done' }; } },
    /* an account under way (installing, signing in, its key being tried) is where the screen stands, ahead of the count
       (Astra M07) */
    ai: { props: ORBS, state: (S) => {
      const acc = Object.values((S.sess.ai && S.sess.ai.accounts) || {}).map((a) => a.state), n = O55.ai ? O55.ai.readyIds(S).length : 0;
      if (acc.includes('signingIn')) return 'signingIn';
      if (acc.includes('installing')) return 'installing';
      if (acc.includes('keyChecking')) return 'testing';
      return n > 1 ? 'many' : n === 1 ? 'one' : (S.sess.ai && S.sess.ai.skipped) ? 'none' : 'checking';
    }, power: true, vars: (S) => ({ n: O55.ai ? O55.ai.readyIds(S).length : 0 }) },
    'ai-all': { props: ORBS, power: true },
    'ai-none': { props: () => [P('free', 'side')] },
    free: { props: () => [P('free', 'pairA'), P('gift', 'pairB')] },
    ready: {
      props(S) {
        const d = md(S), ch = [WHERE[S.sess.ui.where || 'this'] || 'laptop', d.project_mode === 'later' ? 'page' : BEGIN[S.sess.ui.begin || 'new'] || 'page', 'vault'];
        const out = ch.map((k, i) => ({ id: 'm' + i, kind: k, slot: 'm' + (i + 1), scale: 0.42 }));
        const props = O55.pipStage.h.part('role-props');
        [['crown', 'c1'], ['hardhat', 'c2'], ['glasses', 'c3']].forEach(([hat, slot]) => out.push({ id: 'crew-' + hat, kind: 'crew', slot, params: { hat: props ? hat : null }, scale: 0.82 }));
        return out;
      },
      state: (S) => (md(S).project_mode === 'later' ? 'later' : 'enter'), look: 'crew-hardhat'
    },
    'nas-find': { props: one('nas'), state: (S) => ((S.sess.nas || {}).sshOff ? 'sshOff' : 'enter'), vars: (S) => ({ method: (S.sess.nas || {}).method || 'ssh' }) },
    'nas-identity': { props: nasWith('idcard'), state: (S) => ((S.sess.nas || {}).trusted ? 'trusted' : 'enter') },
    'nas-key': { props: nasWith('key') },
    'nas-signin': { props: () => [P('nas', 'pairA'), P('key', 'pairB'), P('lock', 'hi', { scale: 0.8 })] },
    /* the owner's own operation key (70-screens-nas.js installKey: kept from when it started) */
    'nas-install': { props: nasWith('key'), work: true, state: (S) => { const n = S.sess.nas || {}, st = op(S, n.opKey || 'sshinstall:' + (n.device || '') + ':' + (n.key || 'new')); return (st && st.state === 'done') || n.installed ? 'done' : 'enter'; } },
    'nas-pmpair': { props: nasWith('qr') },
    'nas-folder': { props: nasWith('folder'), state: (S) => ((S.sess.nas || {}).purpose === 'storage' ? 'storage' : 'enter'), vars: (S) => ({ path: String((S.sess.nas || {}).at || '').split('/').pop() }) },
    'nas-smb': { props: nasWith('folder') },
    'nas-nfs': { props: nasWith('folder') },
    'nas-mounted': { props: nasWith('folder') }
  };

  /* The spec for the screen on show. hover: the control the pointer rests on (after the dwell) or keyboard focus;
     typing: the field being typed into; oops: what O55.pipOops read off the screen. */
  function spec(S, o) {
    o = o || {};
    const id = S.sess.screen, def = O55.screens.defs[id] || {}, sc = SCREENS[id] || { props: () => [] };
    const chapter = (def.chapterFor ? def.chapterFor(S) : def.chapter) || 'welcome';
    const v = Object.assign({ name: (md(S).project_name || '').trim(), look: O55.theme().family }, sc.vars ? sc.vars(S) : {});
    const h = o.hover && has(id, o.hover) ? o.hover : o.hover && /:/.test(o.hover) && has(id, 'group:' + o.hover.split(':')[0]) ? 'group:' + o.hover.split(':')[0] : null;
    let props = [];
    try { props = sc.props(S, o.hover || null) || []; } catch (e) { props = []; }
    let lid = h || (sc.state ? sc.state(S) : 'enter');
    if (o.typing && has(id, 'typing')) lid = 'typing';
    let mood = (FACES[id] && FACES[id][lid]) || (h ? 'watch' : 'idle');
    /* Pip parts (S9, onboarding and the chat only): watches, wonders-while-typing, oops, role-props */
    const part = O55.pipStage.h.part;
    if (h && !part('watches') && mood === 'watch') mood = 'idle';
    if (o.typing && part('wonders-while-typing')) mood = 'wonder';
    let say = line(id, lid, v), label = stg(id, 'label', v);
    const tgt = props.length ? props[props.length - 1].id : null;
    const out = { chapter, props, pip: { mood, look: sc.look || tgt, work: !!sc.work && !/^done/.test(lid) && !(O55.review && O55.review.shownDone && id === 'creating' && O55.review.shownDone(S)) },
      say, target: tgt, label, cmd: stg(id, 'cmd', Object.assign({ prop: tgt || '' }, v)) + (h ? ' --preview' : ''), lineId: lid };
    if (sc.power) out.pip.power = O55.ai ? O55.ai.readyIds(S).length : 0;
    /* (Welcome: the stage puts Pip to sleep and wakes it on a real arrival, 59-cheer.js wake; once awake it is lifted) */
    if (id === 'welcome') out.wakeSay = say;
    if (o.oops) {
      out.pip.mood = o.oops.face === 'oops' && !part('oops') ? 'idle' : o.oops.face;
      out.say = O55.t('pip.oops.' + o.oops.key, v);
      out.label = O55.t('pip.stage.labels.oops');
      out.oops = o.oops.key;
    }
    return out;
  }
  O55.pipScenes = { spec, SCREENS, FACES, line };
})();

/* O55.pipOops — what has gone wrong on the screen, for Pip (DL-238). Pip's face follows what the window shows: a
   field's error, a warning note or banner, a failed row, the reason a refused press gives. Each of those shows a copy
   key's words, and Pip's oops and cheer lines are keyed by the same key (pip.oops.<key>, pip.cheer.<key>, the copy
   lane's scheme), so the reader matches the words on screen against those keys' templates. It reads the screen and
   changes nothing. A few states are waits or a choice, not failures: Pip thinks through those, or naps (ai.skipNote).
   Under NieR Mode the same states light Pip's band (its oops face). */
(function () {
  'use strict';
  const O55 = window.O55;
  const FACE = {
    'server.confirm.pendingHost': 'think', 'protect.pendingHost': 'think', 'creating.recovery.pending': 'think',
    'creating.recovery.reasons.waitingHost': 'think', 'creating.recovery.reasons.claimBusy': 'think', 'creating.recovery.reasons.pending': 'think',
    'ai.skipNote': 'sleep'
  };
  /* states that show as information, not as a fault, are still read where they are written (a note, a row's line) */
  /* (a refused press's reason, .o55-reason, is told to Pip by the press itself: 60-ui-core.js renderScene's refused) */
  const WHERE = '.o55-err, .o55-note, .o55-banner, .o55-pill-fail, .o55-rowmeta, .o55-tag, .o55-phdetail';
  let table = null;
  const flat = (node, pre, out) => {
    Object.keys(node || {}).forEach((k) => { const v = node[k], key = pre ? pre + '.' + k : k; if (typeof v === 'string') out.push(key); else if (v && typeof v === 'object') flat(v, key, out); });
    return out;
  };
  const esc = (s) => s.replace(/[.*+?^$()|[\]\\]/g, '\\$&');
  function build() {
    if (table) return table;
    table = flat(O55.tx('pip.oops'), '', []).map((key) => {
      let tpl = O55.tx(key);
      if (tpl && typeof tpl === 'object') tpl = tpl.title || null;
      if (typeof tpl !== 'string') return null;
      const parts = tpl.split(/\{[A-Za-z]+\}/), fixed = parts.join('').trim();
      if (fixed.length < 6) return null;
      return { key, rx: new RegExp(parts.map((p) => esc(p.replace(/\s+/g, ' ').trim())).filter(Boolean).join('[\\s\\S]{0,80}?')) };
    }).filter(Boolean)
      /* longer templates first, so a state whose words contain a shorter state's are found as themselves */
      .sort((a, b) => b.rx.source.length - a.rx.source.length);
    return table;
  }
  /* words two states share (an AI row's and a service's "Didn't sign in") are the screen's own: its namespace first */
  const NS = (id) => (/^ai/.test(id) ? 'ai' : /^online-|^ex-repos/.test(id) ? 'online' : /^nas-/.test(id) ? 'nas' : /^c-/.test(id) ? 'connect' : /^s-/.test(id) ? 'server' : /^r-/.test(id) ? 'restore' : id);
  function match(text, screen) {
    text = String(text || '').replace(/\s+/g, ' ').trim();
    if (!text) return null;
    const hits = build().filter((r) => r.rx.test(text));
    if (!hits.length) return null;
    const ns = screen ? NS(screen) + '.' : null, own = ns && hits.find((r) => r.key.indexOf(ns) === 0);
    return (own || hits[0]).key;
  }
  /* the first state the current screen shows, in reading order: { key, face, el } or null */
  function read(scope) {
    if (!scope) return null;
    const screen = scope.getAttribute('data-screen') || (O55.S && O55.S.sess && O55.S.sess.screen);
    for (const el of scope.querySelectorAll(WHERE)) {
      if (el.closest('.o55-out, [hidden], .o55-explainer')) continue;
      const key = match(el.textContent, screen);
      if (key) return { key, face: FACE[key] || 'oops', el };
    }
    return null;
  }
  /* a line that is missing is never shown as its key (FO-13: "pip.cheer.endpoint.path" on screen): a cheer without its own
     line says the general one, and build.py --check fails on any pip.oops key without its pip.cheer twin */
  const said = (k, fb) => { const v = O55.tx(k); return typeof v === 'string' && v ? v : fb ? O55.t(fb) : ''; };
  O55.pipOops = { read, match, face: (key) => FACE[key] || 'oops', line: (key) => said('pip.oops.' + key, null), cheer: (key) => said('pip.cheer.' + key, 'pip.cheerFallback') };
})();
