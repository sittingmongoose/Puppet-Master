/* Files on another computer or storage device — one reusable sub-flow for a Project's source (purpose 'source') or
   where its files should live (purpose 'storage'). SSH is the default method and almost everything is automatic:
   find the device, show its identity picture before trusting it, discover the SSH keys already on this computer and
   test them silently, ask for the NAS password once only when no key works yet, add the key, verify it, then browse
   folders over SFTP. Private keys are never read, copied or stored; the draft records references only.
   SMB, NFS and an already connected drive have their own short follow-ups (recorded as mounted for a source). */
(function () {
  'use strict';
  const O55 = window.O55, C = O55.c, U = O55.util, F = O55.flow, T = (k, v) => O55.t(k, v), def = (id, d) => O55.screens.define(id, d);
  const md = (S) => S.sess.drafts.main;
  const N = (S) => (S.sess.nas = S.sess.nas || { purpose: 'source', method: 'ssh' });
  /* the SSH steps belong to whatever they serve: a full or Server restore sits in the Computer chapter */
  const chapterOf = (S) => (N(S).purpose === 'backup' && (S.sess.restore || {}).scope !== 'project' ? 'computer' : 'project');
  const dev = (S) => S.env.devices.find((d) => d.id === N(S).device) || null;
  const dname = (S) => (dev(S) || { name: '' }).name;
  const words = (seed) => O55.art.identity(seed).words.join(' ');
  /* No numeric priority: O55.sound ranks coinciding events itself. Owner operations name their
     done/fail/phase sounds in opts.sound (O55.flow.op): what discovery turns up is `found`, a wrong code or password
     is a soft `warn` (the field or banner says what to do), and an approval on the other device is `found`. */
  const SND = { found: { intensity: 0.55 } };
  /* demo hints (O55.flow.hint): ready choices for steps a real device would answer, each taking a branch */
  const H = (id, items, o) => (F.hint ? F.hint(id, items, o) : '');
  const FOUND_SOUND = { done: 'found', intensity: 0.55 };
  /* A folder step is a click, so the generic tap (rank 30) is queued in the same moment. Move's own rank is 20 and
     would be dropped. Copy's rank (34) sits just above tap and under every outcome, so the step is the one sound. */
  const MOVE_OVER_TAP = 34;
  const depth = (path) => ({ step: path.split('/').length - 1, priority: MOVE_OVER_TAP });
  function addrKnown(S, a) {
    const want = String(a || '').trim();
    return !!want && S.env.devices.some((x) => x.address === want);
  }
  function seeSheet(S) {
    const layer = S.root.querySelector('.o55-pane > .o55-layer:not(.o55-out)');
    const sheet = layer && layer.querySelector('.o55-sheet[data-open="true"]');
    if (sheet) sheet.scrollIntoView({ block: 'nearest', behavior: O55.motion.reduced() ? 'auto' : 'smooth' });
    O55.sound.play('sheet');
  }
  /* the picture follows the screen: as many keys as were found, the chosen one lit, a new key when one is chosen */
  const sceneParams = (S, extra) => {
    const ks = keyring(S), sel = N(S).key || (dev(S) ? defaultKey(S) : null);
    return Object.assign({ device: (dev(S) || {}).name ? dev(S).name.toLowerCase() : undefined, seed: (dev(S) || {}).hostKey, words: dev(S) ? words(dev(S).hostKey) : '',
      keys: ks.length, pick: ks.findIndex((k) => k.id === sel), newKey: sel === 'new', paired: !!N(S).viaPm }, extra || {});
  };

  /* Opened straight at a later step (Demo Studio's Open at one screen): what the earlier steps would have left (QA2
     hunter H1: these screens opened with nothing on them). A Project's files on the Home NAS over SSH; its identity
     trusted from the key step on, a key chosen from the sign-in on, the key added for the folder; a NAS running Puppet
     Master for the pairing (or the first one with SSH where none does); a share for SMB and NFS. */
  const SEED_STEP = { 'nas-identity': 0, 'nas-pmpair': 0, 'nas-key': 1, 'nas-signin': 2, 'nas-install': 2, 'nas-folder': 3 };
  function seedNas(S, id) {
    const n = N(S), d0 = md(S);
    if (n.purpose === 'source' && d0.project_mode !== 'existing_local') O55.draft.set(d0, { project_mode: 'existing_local', project_transport: 'ssh', source_more: true });
    if (id === 'nas-smb' || id === 'nas-nfs') { n.method = id.slice(4); if (!shareOf(S)) n.share = (S.env.shares.find((x) => x.proto === n.method) || {}).id; if (n.purpose === 'source') O55.draft.set(d0, { project_transport: 'mounted' }); return S.save(); }
    if (id === 'nas-mounted') { n.method = 'mounted'; if (!n.volume) n.volume = volumes(S)[0]; if (n.purpose === 'source') O55.draft.set(d0, { project_transport: 'mounted' }); return S.save(); }
    n.method = 'ssh';
    if (!dev(S)) { const pick = (id === 'nas-pmpair' && S.env.devices.find((x) => x.pm)) || S.env.devices.find((x) => x.ssh); if (pick) n.device = pick.id; }
    const d = dev(S), step = SEED_STEP[id] || 0;
    if (d && step >= 1 && !n.trusted) { n.trusted = true; knownHosts(S)[hostId(S)] = d.hostKey; }
    if (d && step >= 2 && !n.key) n.key = defaultKey(S);
    if (d && step >= 3 && !n.installed) { if (n.key === 'new') makeNewKey(S); authorize(S, d, n.key); n.installed = true; }
    S.save();
  }

  /* ------------------------------------------------------------------ find the device */
  def('nas-find', {
    chapter: 'project', stage: 'server_storage_client',
    scene: (S) => ({ id: 'nas', beat: 'find', params: sceneParams(S) }),
    eyebrow: () => T('nas.find.eyebrow'),
    title: (S) => (N(S).purpose === 'storage' ? T('nas.find.titleStorage') : T('nas.find.titleSource')),
    lead: () => T('nas.find.lead'),
    body(S) {
      const n = N(S), m = n.method || 'ssh';
      let out = C.segmented({ do: 'method', value: m, label: T('nas.find.method'), options: [{ v: 'ssh', label: T('nas.find.ssh') }, { v: 'smb', label: T('nas.find.smb') }, { v: 'nfs', label: T('nas.find.nfs') }, { v: 'mounted', label: T('nas.find.mounted') }] });
      if (m === 'ssh') {
        const st = F.state(S, 'discover:ssh');
        /* what the chosen device needs (it runs Puppet Master; its SSH is off): under its own card, or under the typed
           address (QA round 2, Q7) */
        const d = dev(S);
        let about = '';
        if (d && d.pm) about += C.note(T('nas.find.pmNote', { name: d.name }), 'ok', 'link');
        if (d && !d.ssh && !d.pm) {
          const cs = F.state(S, 'sshcheck:' + d.id);
          about += C.group(T('nas.find.offTitle', { name: d.name }), `<p class="o55-note o55-note-info">${C.mark('off', 14, C.smallArt('power', 14))}<span>${U.esc(T('nas.find.offLead', { brand: d.brand }))}</span></p>`
            + `<p class="o55-path" data-key="path">${U.esc(O55.tx('nas.find.steps')[d.brand] || '')}</p>`
            + (cs && cs.state === 'failed' ? C.note(T('nas.find.stillOff', { name: d.name }), 'warn') : '')
            + `<div class="o55-inline" data-key="again">${O55.ui.btn({ label: T('nas.find.checkAgain'), do: 'checkAgain', cls: 'o55-small' }, 'o55-secondary')}</div>`, { cls: 'o55-sshoff' });
        }
        if (n.manual) {
          const pBad = n.port != null && n.port !== '' && !portOk(n.port);
          out += `<div class="o55-fieldrow" data-key="manual">${C.field({ bind: 'addr', label: T('nas.find.addressLabel'), value: n.addr || '', placeholder: '192.168.1.20', hint: T('nas.find.addressHint') })}${C.field({ bind: 'port', label: T('nas.find.portLabel'), value: n.port == null ? '22' : n.port, cls: 'o55-field-port', error: pBad ? T('nas.find.portBad') : '', invalid: pBad })}</div>`;
          out += H('nas-find:addr', [{ label: '192.168.1.20', outcome: 'works', fills: [['addr', '192.168.1.20'], ['port', '22']] }, { label: '192.168.1.99', outcome: 'noAnswer', fills: [['addr', '192.168.1.99']] }, { label: '192.168.1.20:99999', outcome: 'wrong', fills: [['addr', '192.168.1.20'], ['port', '99999']] }], { when: !addrKnown(S, n.addr) || pBad });
        } else if (!st || st.state !== 'done') {
          out += `<div class="o55-row o55-row-wait" data-key="scan" aria-busy="true">${C.loader(16)}<span class="o55-rowtext"><span class="o55-rowtitle">${U.esc(T('nas.find.looking'))}</span></span></div>`;
        } else {
          const cards = S.env.here.sshConfigHosts.map((h) => { const d = S.env.devices.find((x) => x.address === h.host); return d && { v: d.id + '|cfg', glyph: 'key', title: h.alias + ' → ' + h.host, sub: T('nas.find.fromConfig') + ' · ' + T('nas.find.user', { user: h.user }) }; }).filter(Boolean)
            .concat(S.env.devices.map((d) => ({ v: d.id, glyph: 'server', title: d.name, sub: d.brand + ' ' + d.model + ' · ' + d.address, tag: d.pm ? T('nas.find.pmTag') : d.ssh ? T('nas.find.sshOn') : T('nas.find.sshOff') })));
          const chosen = n.device ? n.device + (n.fromConfig ? '|cfg' : '') : null;
          out += C.cards('device', cards.map((c) => (c.v === chosen && about ? Object.assign(c, { under: about }) : c)), chosen, { label: T('nas.find.titleSource') });
          about = '';
        }
        out += about;
        if (!n.manual) out += `<div class="o55-sublinks" data-key="addr">${C.link(T('nas.find.address'), 'manualOn')}</div>`;
      } else if (m === 'smb' || m === 'nfs') {
        if (n.shareManual) {
          const t = n.shareText || '', ok = !!typedShare(m, t);
          out += C.field({ bind: 'shareText', label: T('nas.find.shareLabel.' + m), value: t, placeholder: m === 'smb' ? '//nas.local/projects' : 'nas.local:/export/projects', hint: ok || !t ? T('nas.find.shareHint.' + m) : '', error: t && !ok ? T('nas.find.shareBad.' + m) : '', invalid: !!t && !ok, valid: ok });
          out += H('nas-find:share-' + m, m === 'smb' ? [{ label: '//nas.local/projects', outcome: 'works', fills: [['shareText', '//nas.local/projects']] }, { label: 'nas.local/projects', outcome: 'wrong', fills: [['shareText', 'nas.local/projects']] }] : [{ label: 'nas.local:/export/projects', outcome: 'works', fills: [['shareText', 'nas.local:/export/projects']] }, { label: 'nas.local', outcome: 'wrong', fills: [['shareText', 'nas.local']] }], { when: !ok });
          out += `<div class="o55-sublinks" data-key="sharefound">${C.link(T('nas.find.shareFound'), 'shareManual', 'off')}</div>`;
        } else {
          out += C.group(T(m === 'smb' ? 'nas.find.shares' : 'nas.find.exports'), C.cards('share', S.env.shares.filter((s) => s.proto === m).map((s) => ({ v: s.id, glyph: 'folder', title: s.path, sub: (S.env.devices.find((d) => d.id === s.device) || {}).name })), n.share));
          out += `<div class="o55-sublinks" data-key="shareaddr">${C.link(T('nas.find.shareAddress.' + m), 'shareManual', 'on')}</div>`;
        }
      } else {
        out += C.group(T('nas.find.volumesOn', { where: machine(S) }), C.cards('volume', volumes(S).map((v) => ({ v, glyph: 'folder', title: v.split('/').pop(), sub: v })), n.volume));
      }
      return out;
    },
    mounted(S) { if ((N(S).method || 'ssh') === 'ssh' && !N(S).manual) F.op(S, 'discover:ssh', 'cmd.server.discovery.refresh', [{ key: 'mdns', ms: 1100 }], { payload: { services: ['_ssh._tcp', '_sftp-ssh._tcp', '_smb._tcp'] }, sound: FOUND_SOUND }); },
    foot(S) {
      const n = N(S), m = n.method || 'ssh', d = dev(S);
      let ok = false, reason = T('missing.storage');
      if (m === 'ssh') {
        const pBad = n.manual && n.port != null && n.port !== '' && !portOk(n.port);
        ok = n.manual ? !pBad && S.env.devices.some((x) => x.address === String(n.addr || '').trim()) : !!(d && (d.ssh || d.pm));
        if (n.manual) reason = pBad ? T('nas.find.portBad') : F.nonEmpty(n.addr) ? T('nas.find.noAnswer', { addr: String(n.addr).trim() }) : T('nas.find.addressLabel');
        else if (d && !d.ssh && !d.pm) reason = T('nas.find.offTitle', { name: d.name });
        else if (!d) reason = T('nas.find.choose');
      }
      else if (m === 'mounted') ok = !!n.volume && volumes(S).includes(n.volume); else { ok = !!shareOf(S); reason = n.shareManual ? T('nas.find.shareBad.' + m) : T('missing.storage'); }
      return { primary: { label: T('chrome.continue'), do: 'next', disabled: !ok, reason } };
    },
    do: {
      /* another way of reaching the files drops a share of the old way (FF-18) */
      method(S, v) {
        const n = N(S);
        if (n.method !== v) { n.shareManual = false; const sh = n.share === 'manual' ? n.manualShare : S.env.shares.find((x) => x.id === n.share); if (sh && sh.proto !== v) n.share = null; }
        n.method = v; S.save(); O55.ui.refresh();
      },
      shareManual(S, v) { const n = N(S); n.shareManual = v === 'on'; if (!n.shareManual && n.share === 'manual') n.share = null; S.save(); O55.ui.refresh(); if (n.shareManual) { O55.sound.play('reveal'); const i = S.root.querySelector('#o55f-shareText'); if (i) i.focus(); } },
      device(S, v, el) {
        const [id, cfg] = v.split('|'), n = N(S), h = cfg ? S.env.here.sshConfigHosts.find((x) => S.env.devices.find((d) => d.id === id && d.address === x.host)) : null;
        /* another device ends what was started for the one before (its pairing request is cancelled with the owner) */
        if (n.device !== id) { if (n.pairAsked && !n.paired) O55.nas.endPair(S, 'target_changed'); Object.assign(n, { trusted: false, installed: false, key: null, paired: false, viaPm: false, pairAsked: false, useSsh: false, pairing: null, pairFail: null, user: '', userEdit: false, opKey: null }); delete n.code; }
        n.device = id; n.fromConfig = !!cfg; if (h) { n.user = h.user; n.key = h.key; }
        S.save(); O55.ui.refresh(); O55.ui.charm(el, dev(S).name, 'server');
      },
      checkAgain(S) {
        const d = dev(S); if (!d) return;
        F.reset(S, 'sshcheck:' + d.id);
        /* detection runs only on this click (read-only probe); in the concept the person has switched SSH on meanwhile */
        F.op(S, 'sshcheck:' + d.id, 'cmd.ssh_connection.device.probe', [{ key: 'probe', ms: 900 }], { onDone: () => { d.ssh = true; S.save(); O55.ui.refresh(); } });
      },
      share(S, v) { N(S).share = v; S.save(); O55.ui.refresh(); },
      volume(S, v) { const n = N(S); if (n.volume !== v) F.reset(S, 'mounted:' + n.volume); n.volume = v; S.save(); O55.ui.refresh(); },
      manualOn(S) { N(S).manual = true; S.save(); O55.ui.refresh(); O55.sound.play('reveal'); },
      next(S) {
        const n = N(S), m = n.method || 'ssh';
        if (m === 'ssh' && n.manual) { const d = S.env.devices.find((x) => x.address === String(n.addr || '').trim()); n.device = d && d.id; }
        S.save();
        O55.ui.go(m === 'ssh' ? entry(S) : { smb: 'nas-smb', nfs: 'nas-nfs', mounted: 'nas-mounted' }[m]);
      }
    },
    bind: { shareText(S, v) { const n = N(S), sh = typedShare(n.method, v); n.shareText = v; n.manualShare = sh; n.share = sh ? 'manual' : n.share === 'manual' ? null : n.share; S.save(); O55.ui.refresh(); },
    addr(S, v) {
      const was = addrKnown(S, N(S).addr);
      N(S).addr = v; S.save(); O55.ui.refresh();
      if (!was && addrKnown(S, v)) O55.sound.play('found', SND.found); /* the typed address answers: Continue wakes up */
    }, port(S, v) { const n = N(S), p = String(v).replace(/[^0-9]/g, '').slice(0, 5), had = !n.port || portOk(n.port); if (p !== n.port) Object.assign(n, { port: p, trusted: false, installed: false, opKey: null }); S.save(); if (had !== (!p || portOk(p))) O55.ui.refresh(); } }
  });

  /* ------------------------------------------------------------------ is this your device? (identity before trust) */
  function hostState(S) {
    const d = dev(S); if (!d) return 'new';
    const known = knownHosts(S)[hostId(S)];
    if (!known) return 'new';
    return known === d.hostKey ? 'known' : 'changed';
  }
  def('nas-identity', {
    seed: (S) => seedNas(S, 'nas-identity'),
    chapter: 'project', chapterFor: (S) => chapterOf(S), stage: 'server_storage_client',
    scene: (S) => ({ id: 'nas', beat: 'identity', params: sceneParams(S) }),
    eyebrow: () => T('nas.identity.eyebrow'),
    title: (S) => (hostState(S) === 'changed' && !N(S).acceptedNew ? T('nas.identity.changedTitle', { name: dname(S) }) : T('nas.identity.title')),
    lead: (S) => (hostState(S) === 'changed' && !N(S).acceptedNew ? T('nas.identity.changedLead', { name: dname(S) }) : T('nas.identity.lead', { name: dname(S) })),
    body(S) {
      const d = dev(S), hs = hostState(S), n = N(S);
      let out = C.identity(d.hostKey, words(d.hostKey), d.name + ' · ' + d.address);
      if (hs === 'known' || n.trusted) out += C.note(hs === 'known' ? T('nas.identity.known', { name: d.name }) : T('chrome.alreadyDone'), 'ok', 'check');
      if (hs === 'changed' && !n.acceptedNew) out += `<div class="o55-banner o55-banner-warn" data-key="warn">${C.small('lock', 18)}<span>${U.esc(T('nas.identity.changedTitle', { name: d.name }))}</span></div>`;
      out += C.details(S, 'fp', T('nas.identity.details'), C.kv([[T('nas.identity.fingerprint'), d.hostKey]].concat(hs === 'changed' ? [[T('nas.identity.old'), knownHosts(S)[hostId(S)]]] : [])));
      return out;
    },
    foot(S) {
      const hs = hostState(S), n = N(S);
      if (hs === 'changed' && !n.acceptedNew) return { secondary: [{ label: T('nas.identity.trustNew'), do: 'trustNew' }], primary: { label: T('nas.identity.stop'), do: 'stop' } };
      return { primary: { label: hs === 'known' || n.trusted ? T('chrome.continue') : T('nas.identity.confirm'), do: 'trust' } };
    },
    do: {
      trust(S) { const n = N(S); n.trusted = true; knownHosts(S)[hostId(S)] = dev(S).hostKey; S.save(); O55.ui.go('nas-key'); },
      trustNew(S) { N(S).acceptedNew = true; S.save(); O55.ui.refresh(); },
      stop(S) { O55.ui.back(); }
    }
  });

  /* ------------------------------------------------------------------ choose a key (discovered, silently tested) */
  /* The public half of a key, as the person would paste it. The concept derives a stable body from the key's id; the
     private half is never read. */
  function pubLine(k) {
    const b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/', rsa = /^rsa/.test(k.type);
    let h = 2166136261, body = '';
    for (const ch of k.id + (k.comment || '')) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
    for (let i = 0; i < (rsa ? 64 : 43); i++) { h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; body += b64[h % 64]; }
    return (rsa ? 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQ' : 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI') + body + ' ' + (k.pubComment || k.comment || 'puppet-master');
  }
  /* a new key made just for Puppet Master (made on this computer; only its public half ever leaves it) */
  /* The keys belong to the machine that will reach the NAS: the Server when the work happens on one (a new Server has
     none yet, so it makes its own), this computer otherwise, and this computer for a full restore onto it. (The key
     step offered this laptop's keys on Server paths; logic crawl.) */
  const onServer = (S) => md(S).server_mode !== 'this_device' && !(N(S).purpose === 'backup' && (S.sess.restore || {}).scope === 'full');
  function keyring(S) {
    if (!onServer(S)) return S.env.here.sshKeys;
    const all = (S.env.serverKeys = S.env.serverKeys || {}), ref = md(S).server_ref || 'server';
    return (all[ref] = all[ref] || []);
  }
  const machine = (S) => (onServer(S) && O55.project ? O55.project.serverName(S) : O55.t('nas.key.thisComputer'));
  /* The SSH connection is one profile (SCR-10): the computer that connects (this one, or the Server doing the work),
     the device's address and port, the account it signs in as, the key, and the device's identity as that computer
     knows it. A change to any of them is another connection: key tests and an added key belong to the profile they ran
     for. The profile id is opaque and goes into the references the draft keeps. */
  const portOk = (v) => /^\d{1,5}$/.test(String(v)) && +v >= 1 && +v <= 65535;
  const sshPort = (S) => { const n = N(S), d = dev(S); return n.manual && portOk(n.port) ? +n.port : (d && d.port) || 22; };
  /* the account: one named in SSH settings or typed; otherwise ssh's own default, the name of the account on the
     computer that connects (known for this computer, not for a Server) */
  const sshUser = (S) => { const n = N(S); return String(n.user || '').trim() || (onServer(S) ? '' : S.env.client.user || ''); };
  const hostId = (S) => { const d = dev(S); return d ? d.address + (sshPort(S) !== 22 ? ':' + sshPort(S) : '') : ''; };
  /* A share is chosen from those found, or typed (SCR-11): SMB as //host/share, NFS as host:/path. It must be of the
     method chosen now (FF-18: an SMB share stayed chosen after switching to NFS). */
  const SHARE_FORM = { smb: /^(?:smb:)?\/\/([^/\s]+)\/([^\s]+)$/i, nfs: /^([^:/\s]+):(\/[^\s]*)$/ };
  function shareOf(S) {
    const n = N(S), m = n.method || 'ssh';
    if (n.share === 'manual' && n.manualShare && n.manualShare.proto === m) return n.manualShare;
    const sh = S.env.shares.find((x) => x.id === n.share);
    return sh && sh.proto === m ? sh : null;
  }
  function typedShare(m, v) {
    const t = String(v || '').trim(), x = SHARE_FORM[m] && SHARE_FORM[m].exec(t);
    if (!x) return null;
    return m === 'smb' ? { id: 'manual', proto: 'smb', path: '//' + x[1] + '/' + x[2].replace(/\/+$/, ''), host: x[1], device: null } : { id: 'manual', proto: 'nfs', path: x[1] + ':' + x[2], host: x[1], device: null };
  }
  /* the drives the computer that connects already has (this computer's, or the Server's own) */
  const volumes = (S) => (onServer(S) ? ['/mnt/home-nas', '/mnt/media'] : ['/Volumes/Home NAS', '/Volumes/Media']);
  function knownHosts(S) {
    if (!onServer(S)) return S.env.here.knownHosts;
    const all = (S.env.serverKnownHosts = S.env.serverKnownHosts || {}), ref = md(S).server_ref || 'server';
    return (all[ref] = all[ref] || {});
  }
  function hash8(t) { let h = 2166136261; for (const ch of String(t)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0; return h.toString(16).padStart(8, '0'); }
  function profileId(S) { const d = dev(S); if (!d) return ''; return 'sshp:' + U.slug(onServer(S) ? md(S).server_ref || 'server' : S.env.here.id) + ':' + hash8(sshUser(S) + '@' + d.address + ':' + sshPort(S)); }
  /* a key added for one account works for that account (a bare key id in the fixture is the device's own account's) */
  /* the key tests and the key added are named by the device and, unless it is this computer's usual connection (its
     own account, port 22), by the profile too: another account or port never finds the other one's result */
  const opSuffix = (S) => (!onServer(S) && sshPort(S) === 22 && sshUser(S) === (S.env.client.user || '') ? '' : ':' + hash8(profileId(S)));
  const keysKey = (S) => 'keys:' + N(S).device + opSuffix(S);
  const authorizedFor = (S, d, keyId) => !!d && (d.authorized.includes(sshUser(S) + ':' + keyId) || (sshUser(S) === d.user && d.authorized.includes(keyId)));
  const authorize = (S, d, keyId) => { const k = sshUser(S) + ':' + keyId; if (!d.authorized.includes(k)) d.authorized.push(k); };
  const K_PM = (S) => ({ id: 'k-pm', file: '~/.ssh/puppet_master_ed25519', comment: 'Puppet Master', pubComment: 'puppet-master@' + (S && onServer(S) ? O55.util.slug(machine(S)) : 'MacBook-Pro'), type: 'ed25519', where: 'file' });
  function makeNewKey(S) {
    if (!keyring(S).some((x) => x.id === 'k-pm')) keyring(S).push(K_PM(S));
    N(S).key = 'k-pm';
  }
  function keyStatus(S, k) {
    const d = dev(S);
    if (authorizedFor(S, d, k.id)) return 'works';
    if (/^(dsa|rsa-1024)/.test(k.type)) return 'old';
    if (k.passphrase && N(S).unlocked !== k.id) return 'locked'; /* (unlocked for that key only: QA2 review N1's sweep) */
    return 'notAdded';
  }
  const keyWhere = (k) => (k.where === 'file' && k.configHost ? T('nas.key.where.config', { host: k.configHost }) : T('nas.key.where.' + k.where));
  function defaultKey(S) { const works = keyring(S).find((k) => keyStatus(S, k) === 'works'); return works ? works.id : 'new'; }
  def('nas-key', {
    seed: (S) => seedNas(S, 'nas-key'),
    chapter: 'project', chapterFor: (S) => chapterOf(S), stage: 'server_storage_client',
    scene: (S) => ({ id: 'nas', beat: 'keys', params: sceneParams(S) }),
    eyebrow: () => T('nas.key.eyebrow'),
    title: () => T('nas.key.title'),
    lead: (S) => T('nas.key.lead', { where: machine(S) }),
    body(S) {
      const n = N(S), d = dev(S), st = F.state(S, keysKey(S));
      /* which account the keys are tried for, on which address: changing it is another connection (SCR-10) */
      const user = sshUser(S);
      let acct = n.userEdit || !user
        ? C.field({ bind: 'sshUser', label: T('nas.key.accountLabel', { name: d.name }), value: n.user || user, placeholder: '', hint: user ? T('nas.key.accountHint', { name: d.name }) : '', error: user ? '' : T('nas.key.accountNeeded', { name: d.name, where: machine(S) }), invalid: !user, autocomplete: 'username' })
        : `<p class="o55-locline" data-key="acct">${C.small('person', 16)}<span>${U.esc(T('nas.key.account', { name: d.name, user, address: hostId(S) }))}</span>${C.link(T('nas.key.accountChange'), 'userEdit')}</p>`;
      if (!user) return acct;
      if (!st || st.state !== 'done') return acct + F.phases(S, keysKey(S), ['discover', 'probe'], { discover: T('nas.key.looking'), probe: T('nas.key.testing', { name: d.name }) });
      const sel = n.key || defaultKey(S);
      const keys = keyring(S).map((k) => {
        const s = keyStatus(S, k);
        const tag = { works: T('nas.key.works', { name: d.name }), notAdded: T('nas.key.notAdded', { name: d.name }), locked: T('nas.key.locked'), old: T('nas.key.old') }[s];
        return { v: k.id, glyph: 'key', title: k.comment || k.file, sub: keyWhere(k) + (k.file ? ' · ' + k.file : ''), tag, disabled: s === 'old', reason: T('nas.key.old') };
      });
      let out = acct;
      if (!keyring(S).length) out += C.note(T('nas.key.none', { where: machine(S) }), 'info', 'key');
      out += C.cards('pick', keys.concat([{ v: 'new', glyph: 'spark', title: T('nas.key.new'), sub: T('nas.key.newSub'), tag: defaultKey(S) === 'new' ? T('chrome.recommended') : '' }]), sel, { label: T('nas.key.title'), cls: 'o55-keys' });
      /* ("What does Puppet Master read?" was an old-style explainer; the key list's ? now says it whole: QA round 2, Q8) */
      if (S.sess.ui.sheet === 'passphrase') {
        const k = keyring(S).find((x) => x.id === sel);
        out += C.sheet(S, 'passphrase', T('nas.key.passTitle', { key: k.file.split('/').pop() }),
          C.field({ bind: 'pass', type: 'password', protected: true, label: T('nas.key.passLabel'), value: '', hint: N(S).passEmpty ? '' : T('nas.key.passNote'), error: N(S).passEmpty ? T('nas.key.passEmpty', { key: k.comment }) : '', invalid: !!N(S).passEmpty }),
          O55.ui.btn({ label: T('nas.key.passCancel'), do: 'passCancel' }, 'o55-ghost') + O55.ui.btn({ label: T('nas.key.passOk'), do: 'passOk' }, 'o55-primary'));
      }
      if (n.passCancelled) out += C.note(T('nas.install.fail.cancelled', { key: (keyring(S).find((x) => x.id === sel) || {}).comment || '' }), 'warn');
      return out;
    },
    mounted(S) { const d = dev(S); if (!sshUser(S)) return; F.op(S, keysKey(S), 'cmd.ssh_connection.keys.discover', [{ key: 'discover', ms: 700 }, { key: 'probe', ms: 1000 }], { payload: { device: d.id, address: d.address, port: sshPort(S), user: sshUser(S), profile: profileId(S), publicOnly: true }, sound: FOUND_SOUND }); },
    foot(S) { const st = F.state(S, keysKey(S)), user = sshUser(S); return { primary: { label: T('chrome.continue'), do: 'next', disabled: !user || !(st && st.state === 'done'), reason: user ? T('nas.key.looking') : T('nas.key.accountNeeded', { name: dname(S), where: machine(S) }) } }; },
    do: {
      pick(S, v, el) { N(S).key = v; N(S).passCancelled = false; S.save(); O55.ui.refresh(); },
      userEdit(S) { N(S).userEdit = true; S.save(); O55.ui.refresh(); const i = S.root.querySelector('#o55f-sshUser'); if (i) i.focus(); },
      /* a deliberate cancel closes the sheet (it is not an error; the note under the keys says what it means) */
      passCancel(S) { N(S).passCancelled = true; S.sess.ui.sheet = null; S.save(); O55.sound.play('unsheet'); O55.ui.refresh(); },
      passOk(S) { const i = S.root.querySelector('#o55f-pass'); if (!i || !i.value) { N(S).passEmpty = true; S.save(); O55.sound.play('warn'); O55.ui.refresh(); O55.ui.shake('pass'); return; } N(S).passEmpty = false; i.value = ''; N(S).unlocked = N(S).key; S.sess.ui.sheet = null; S.save(); O55.screens.defs['nas-key'].do.next(S); },
      next(S) {
        const n = N(S); n.key = n.key || defaultKey(S);
        const k = keyring(S).find((x) => x.id === n.key);
        if (k && k.passphrase && n.unlocked !== k.id) { S.sess.ui.sheet = 'passphrase'; S.save(); O55.ui.refresh(); seeSheet(S); return; }
        S.save();
        if (k && keyStatus(S, k) === 'works') return O55.ui.go('nas-install', { verifyOnly: true });
        O55.ui.go('nas-signin');
      }
    },
    bind: {
      pass(S, v) { if (N(S).passEmpty && v) { N(S).passEmpty = false; S.save(); O55.ui.refresh(); } },
      /* another account is another connection: the keys are tested again for it and an added key doesn't carry over */
      sshUser(S, v) { const n = N(S), u = String(v || '').trim(); if (u === String(n.user || '').trim()) return; const had = !!sshUser(S); Object.assign(n, { user: u, installed: false, opKey: null }); S.save(); if (had !== !!sshUser(S)) O55.ui.refresh(); }
    },
    leave(S) { if (S.sess.ui.sheet === 'passphrase') { S.sess.ui.sheet = null; S.save(); } }
  });

  /* ------------------------------------------------------------------ sign in once (only when the key isn't there yet) */
  def('nas-signin', {
    seed: (S) => seedNas(S, 'nas-signin'),
    chapter: 'project', chapterFor: (S) => chapterOf(S), stage: 'server_storage_client',
    scene: (S) => ({ id: 'nas', beat: 'keys', params: sceneParams(S) }),
    eyebrow: () => T('nas.signin.eyebrow'),
    title: (S) => T(N(S).self ? 'nas.signin.selfTitle' : 'nas.signin.title', { name: dname(S) }),
    lead: (S) => T(N(S).self ? 'nas.signin.selfTop' : 'nas.signin.lead', { name: dname(S) }),
    body(S) {
      const n = N(S), d = dev(S);
      if (n.self) {
        /* a new key has to exist before its public half can be shown */
        const mk = F.state(S, 'sshmake:' + d.id);
        if (n.key === 'new' && !(mk && mk.state === 'done')) return F.phases(S, 'sshmake:' + d.id, ['make'], { make: T('nas.install.phases.make') });
        const k = keyring(S).find((x) => x.id === n.key), line = k ? pubLine(k) : '';
        let out = `<p class="o55-lead-sm">${U.esc(T('nas.signin.selfLead', { name: d.name, key: k ? k.comment : '' }))}</p><div class="o55-codeline" data-key="pub"><code>${U.esc(line)}</code>${F.copyBtn(line, 'pub')}</div>${F.copyNote('pub')}`;
        if (n.selfMissing) out += C.note(T('nas.signin.selfNot', { name: d.name }), 'warn', 'key');
        return out + `<div class="o55-sublinks" data-key="back">${C.link(T('nas.signin.selfOff'), 'selfOff')}</div>`;
      }
      let out = C.field({ bind: 'user', label: T('nas.signin.user'), value: n.user || '', placeholder: '', hint: T('nas.signin.userHint', { name: d.name }), autocomplete: 'username' });
      out += C.field({ bind: 'pw', type: 'password', protected: true, label: T('nas.signin.password'), value: '', hint: n.pwError ? '' : T('nas.signin.passwordHint'), error: n.pwError ? T('nas.signin.wrong', { name: d.name }) : '', invalid: !!n.pwError, autocomplete: 'current-password' });
      if ((n.pwFails || 0) >= 2) out += C.note(T('nas.signin.lockout'), 'warn');
      out += H('nas-signin:pw', [{ label: (d.user || 'jared') + ' · ' + T('nas.signin.hintAny'), outcome: 'works', fills: [['user', d.user || 'jared'], ['pw', 'correct horse']] }, { label: T('nas.signin.hintRefused'), outcome: 'wrong', act: ['demoRefused'] }], { when: !n.pwTyped });
      out += `<div class="o55-sublinks" data-key="self">${C.link(T('nas.signin.self'), 'selfOn')}</div>`;
      return out;
    },
    foot(S) {
      const n = N(S);
      if (n.self) { const mk = F.state(S, 'sshmake:' + dev(S).id); return { primary: { label: T('nas.signin.selfCheck'), do: 'selfCheck', disabled: n.key === 'new' && !(mk && mk.state === 'done'), reason: T('nas.install.phases.make') } }; }
      const ready = F.nonEmpty(n.user) && n.pwTyped;
      return { primary: { label: T('nas.signin.button'), do: 'add', disabled: !ready, reason: T('nas.signin.passwordHint') } };
    },
    do: {
      /* (demo: the device refuses the next password once, as the wrongPassword situation does; the fields are filled) */
      demoRefused(S) { const d = dev(S); S.env.failures = S.env.failures || {}; S.env.failures.nas_password_once = true; N(S).pwFailedOnce = false; O55.ui.fill('user', (d && d.user) || 'jared'); O55.ui.fill('pw', 'correct horse'); },
      selfOn(S) { N(S).self = true; N(S).selfMissing = false; S.save(); O55.ui.refresh(); O55.sound.play('reveal'); makeIfNeeded(S); },
      selfOff(S) { N(S).self = false; N(S).selfMissing = false; S.save(); O55.ui.refresh(); O55.sound.play('unsheet'); }, /* the public-key line folds away */
      /* The person adds the line on the device themselves. The concept's device receives it at this click (the demo's
         stand-in for their step) unless the scenario says it is not there yet; the check that follows is real either way. */
      selfCheck(S) {
        const n = N(S), d = dev(S);
        if (S.env.failures.self_key_missing_once && !n.selfTried) n.selfTried = true;
        else authorize(S, d, n.key);
        n.selfMissing = false; S.save(); O55.ui.go('nas-install', { verifyOnly: true, selfAdded: true });
      },
      add(S) {
        const i = S.root.querySelector('#o55f-pw'), pw = i ? i.value : '';
        if (i) i.value = '';
        N(S).pwTyped = false; N(S).pwOnce = !!pw; S.save();
        O55.ui.go('nas-install', { password: !!pw });
      }
    },
    /* a protected field is always empty when the screen is drawn afresh (after Back or a reload), so a password typed
       before does not count and the button waits for a new one */
    mounted(S, layer, fresh) { const n = N(S); if (fresh && n.pwTyped) { n.pwTyped = false; S.save(); O55.ui.refresh(); } if (n.self) makeIfNeeded(S); },
    skipOnBack: (S) => !!N(S).installed,
    bind: {
      user(S, v) { N(S).user = v; S.save(); O55.ui.refresh(); },
      /* the password lives only in the field until "Add my key"; the session records that one was typed, never what */
      pw(S, v) { const had = !!N(S).pwTyped; N(S).pwTyped = v.length > 0; N(S).pwError = false; if (had !== N(S).pwTyped) { S.save(); O55.ui.refresh(); } }
    }
  });

  function makeIfNeeded(S) {
    const n = N(S), d = dev(S);
    if (n.key !== 'new') return;
    F.op(S, 'sshmake:' + d.id, 'cmd.ssh_connection.key.install', [{ key: 'make', ms: 700 }], { payload: { device: d.id, key: 'new', makeOnly: true, publicOnly: true },
      /* (made for this device and a new key: if the person has since chosen another device or key, it is not theirs now) */
      onDone: () => { const cur = N(S); if (cur !== n || cur.device !== d.id || cur.key !== 'new') return; makeNewKey(S); S.save(); } });
  }

  /* ------------------------------------------------------------------ automatic phases (selected-source auth) */
  def('nas-install', {
    seed: (S) => seedNas(S, 'nas-install'),
    chapter: 'project', chapterFor: (S) => chapterOf(S), stage: 'server_storage_client',
    scene: (S) => { const st = F.state(S, installKey(S)); return { id: 'nas', beat: st && st.state === 'done' ? 'verified' : 'install', params: sceneParams(S) }; },
    eyebrow: () => T('nas.install.eyebrow'),
    title: () => T('nas.install.title'),
    lead: () => T('nas.install.lead'),
    enter(S, opts) { const n = N(S); n.verifyOnly = !!(opts && opts.verifyOnly); n.viaPm = false; n.opKey = null; S.save(); },
    body(S) {
      const n = N(S), d = dev(S), k = keyring(S).find((x) => x.id === n.key), st = F.state(S, installKey(S));
      const order = phaseOrder(S);
      const labels = { make: T('nas.install.phases.make'), unlock: T('nas.install.phases.unlock', { key: k ? k.comment : '' }), add: T('nas.install.phases.add', { name: d.name }), verify: T('nas.install.phases.verify'), perms: T('nas.install.phases.perms') };
      let out = F.phases(S, installKey(S), order, labels);
      if (st && st.state === 'failed') {
        const code = st.code, fix = { refused: 'refusedFix', not_allowed: 'notAllowedFix' }[code];
        out += `<div class="o55-banner o55-banner-warn" data-key="fail">${C.small('lock', 18)}<span>${U.esc(T('nas.install.fail.' + code, { name: d.name, brand: d.brand, key: k ? k.comment : '' }))}</span></div>`;
        /* what lets an account use SSH differs by maker (Synology: administrators only; Unraid: root): say that one, and
           offer a way in that needs no SSH rather than a wider grant (SCR-10) */
        if (code === 'not_allowed') out += C.note(O55.tx('nas.install.fail.notAllowedBy.' + d.brand) ? T('nas.install.fail.notAllowedBy.' + d.brand, { name: d.name, user: sshUser(S) }) : T('nas.install.fail.notAllowedFix', { name: d.name }), 'info', 'power')
          + (d.smb ? `<div class="o55-inline" data-key="usesmb">${O55.ui.btn({ label: T('nas.install.fail.useSmb'), do: 'useSmb', cls: 'o55-small', tip: false }, 'o55-secondary')}</div>` : '');
        if (fix === 'refusedFix') out += `<div class="o55-inline" data-key="fix">${O55.ui.btn({ label: T('nas.install.fail.refusedFix'), do: 'fixPerms', cls: 'o55-small' }, 'o55-secondary')}</div>`;
      }
      if (st && st.state === 'done') out += C.note(T('nas.install.done'), 'ok', 'lock');
      return out;
    },
    mounted(S) { run(S); },
    foot(S) {
      const st = F.state(S, installKey(S));
      if (st && st.state === 'failed') return { primary: { label: T('nas.install.fail.tryAgain'), do: 'retry' } };
      return { primary: { label: T('chrome.continue'), do: 'next', disabled: !(st && st.state === 'done'), reason: T('chrome.working') } };
    },
    do: {
      retry(S) {
        const st = F.state(S, installKey(S));
        if (st && st.code === 'wrong_password') { N(S).pwError = true; N(S).pwFails = (N(S).pwFails || 0) + 1; F.reset(S, installKey(S)); N(S).opKey = null; S.save(); return O55.ui.back(); }
        if (st && st.code === 'not_added') { N(S).selfMissing = true; F.reset(S, installKey(S)); N(S).opKey = null; S.save(); return O55.ui.back(); }
        F.reset(S, installKey(S)); N(S).opKey = null; O55.ui.refresh(); O55.sound.play('tap'); run(S);
      },
      /* a shared folder on the same device instead: the SSH steps are left and the share is chosen on Where are the files */
      useSmb(S) { const n = N(S), h = S.sess.history || [], at = h.lastIndexOf('nas-find'); F.reset(S, installKey(S)); Object.assign(n, { method: 'smb', share: null, opKey: null, installed: false }); S.save(); if (at >= 0) S.sess.history = h.slice(0, at); O55.ui.go('nas-find', { dir: 'back', noHistory: true }); },
      fixPerms(S) { dev(S).homePermsOpen = false; F.reset(S, installKey(S)); N(S).opKey = null; S.save(); O55.ui.refresh(); run(S); },
      next(S) { connected(S); }
    },
    skipOnBack: (S) => { const st = F.state(S, installKey(S)); return !!(st && st.state === 'done'); }
  });
  /* The operation keeps the identity it started with, even after a new key gets its real id, so a finished install
     is never started again. */
  function installKey(S) { const n = N(S); return n.opKey || 'sshinstall:' + n.device + opSuffix(S) + ':' + (n.key || 'new'); }
  function phaseOrder(S) {
    const n = N(S), k = keyring(S).find((x) => x.id === n.key);
    if (n.verifyOnly) return (k && k.passphrase ? ['unlock'] : []).concat(['verify', 'perms']);
    return (n.key === 'new' || !k ? ['make'] : k.passphrase ? ['unlock'] : []).concat(['add', 'verify', 'perms']);
  }
  function run(S) {
    const n = N(S), d = dev(S), order = phaseOrder(S);
    if (!n.opKey) { n.opKey = 'sshinstall:' + n.device + opSuffix(S) + ':' + (n.key || 'new'); S.save(); }
    const failFor = {
      add: () => {
        if (!n.pwOnce) return 'wrong_password';
        if (S.env.failures.nas_password_once && !n.pwFailedOnce) { n.pwFailedOnce = true; S.save(); return 'wrong_password'; }
        if ((d.sshDisallowed || []).includes(sshUser(S))) return 'not_allowed';
        return null;
      },
      /* the key must really be on the device: added just now by the add phase, already there, or added by the person */
      verify: () => (n.verifyOnly && !authorizedFor(S, d, n.key) ? 'not_added' : d.homePermsOpen ? 'refused' : null)
    };
    const ms = { make: 700, unlock: 500, add: 1100, verify: 800, perms: 700 };
    /* the result belongs to the device, key and attempt it ran for: after Back and another device or key it is dropped
       (it marked the newly chosen key as added; SCR-01's class, the pm7-srv sweep) */
    const at = { device: n.device, key: n.key, op: installKey(S) };
    const still = () => { const cur = N(S); return cur === n && cur.device === at.device && cur.opKey === at.op && (cur.key === at.key || (at.key === 'new' && cur.key === 'k-pm')); };
    F.op(S, installKey(S), 'cmd.ssh_connection.key.install', order.map((k) => ({ key: k, ms: ms[k], fail: failFor[k] })), {
      payload: { device: d.id, address: d.address, port: sshPort(S), user: sshUser(S), profile: profileId(S), key: n.key, publicOnly: true }, sound: { fail: 'warn', intensity: 0.8 }, /* every failure here offers its fix */
      onDone: () => {
        if (!still()) return;
        if (!n.verifyOnly) { if (n.key === 'new') makeNewKey(S); authorize(S, d, n.key); }
        n.installed = true;
        const dd = md(S);
        n.profile = profileId(S);
        O55.draft.set(dd, { source_access_authorization_refs: Array.from(new Set(dd.source_access_authorization_refs.concat(['ssh-key:' + n.profile + ':' + (n.key || 'new')]))).slice(0, 16), preflight_result_refs: Array.from(new Set(dd.preflight_result_refs.concat(['preflight:ssh:' + n.profile]))).slice(0, 32) });
        S.save();
      }
    });
  }

  /* ------------------------------------------------------------------ where the device's steps lead */
  /* A device that runs Puppet Master is reached through it by pairing (PWIZ-029), unless the person chose SSH; every
     other device starts with its SSH identity. */
  const entry = (S) => (dev(S) && dev(S).pm && !N(S).useSsh ? 'nas-pmpair' : 'nas-identity');
  const transport = (S) => (N(S).viaPm ? 'puppet_master' : 'ssh');
  /* connected either way: a backup source goes back to the restore (its backups are listed there), a backup
     destination back to Finish protecting your work, everything else picks a folder */
  function connected(S) {
    if (N(S).purpose === 'backup') { const r = S.sess.restore || {}; r.reachedFor = 'nas:' + N(S).device; S.save(); return O55.ui.go(O55.restore.afterReach(S)); } /* (the phrase only if no kit unlocked it) */
    if (N(S).purpose === 'dest') return O55.ui.go('protect');
    O55.ui.go('nas-folder');
  }

  /* ------------------------------------------------------------------ pair with the Puppet Master on the device */
  /* The Server owner's pairing, as on Connect: the device's identity first, then approval from a device that already
     uses it, its code or its QR. Nothing is paired until the owner reports approval, no SSH key is added, and the
     person may use SSH instead. Turning away from a pairing cancels it and records nothing. */
  const pmOf = (S) => { const d = dev(S); if (!d) return null; return S.env.pmServers.find((p) => p.device === d.id) || { id: 'pm:' + d.id, name: d.name, address: d.address, seed: d.hostKey, approver: '', code: '' }; };
  const pairKey = (S, part) => 'pmpair' + (part || '') + ':' + N(S).device + ':' + (N(S).pairTry || 0);
  const PAIR_MS = 600000;
  /* One pairing request at a time, for one device and one try (SRV-004 §4.2, as on Connect: SCR-01). A result is adopted
     only while that device and that try are still the ones on screen; choosing another device, Another device, Use SSH
     instead or a new request ends it, and an answer that arrives afterwards changes nothing. Its code lives only in
     this page's memory (SCR-02); a request from before a reload is gone, and Pair sends a new one. */
  const livePairs = new Set(), pairCodes = new Map();
  const tryId = (S) => N(S).device + ':' + (N(S).pairTry || 0) + ':' + (N(S).pairNonce || '');
  const pairLive = (S) => livePairs.has(tryId(S));
  const pairExpired = (S) => !!N(S).pairStart && Date.now() - N(S).pairStart > PAIR_MS;
  function stillThis(S, at) { const n = N(S); return n.pairAsked && !n.paired && tryId(S) === at.id && n.purpose === at.purpose && pairLive(S) && !pairExpired(S); }
  function endPair(S, reason) {
    const n = N(S), p = pmOf(S);
    ['', 'reach', 'code'].forEach((part) => { O55.owners.cancelOp(pairKey(S, part)); F.reset(S, pairKey(S, part)); });
    if (n.pairAsked && !n.paired && p) O55.owners.dispatch('cmd.client.pair.cancel', { server: p.id, reason }, Object.assign(S.ctx(), { sourcePairConfirmed: true }));
    livePairs.delete(tryId(S)); pairCodes.delete(tryId(S));
    n.pairTry = (n.pairTry || 0) + 1; n.pairNonce = ''; n.pairFail = null; delete n.code;
  }
  function pairDone(S, at) {
    if (!stillThis(S, at)) return;
    const n = N(S), d = dev(S), dd = md(S);
    livePairs.delete(at.id); pairCodes.delete(at.id);
    n.paired = true; n.viaPm = true; n.installed = true;
    O55.draft.set(dd, { source_access_authorization_refs: Array.from(new Set(dd.source_access_authorization_refs.concat(['pairing:' + U.slug(d.name) + ':source-read']))).slice(0, 16),
      preflight_result_refs: Array.from(new Set(dd.preflight_result_refs.concat(['preflight:paired-source:' + U.slug(d.name)]))).slice(0, 32) });
    S.save(); checkFolders(S); O55.ui.refresh();
  }
  /* read-only: can this computer see the folders it will be offered (the write test waits for Creating); idempotent,
     so a reopen resumes it */
  function checkFolders(S) { F.op(S, pairKey(S, 'perms'), 'cmd.project.source_location.test', [{ key: 'perms', ms: 700 }], { payload: { device: N(S).device, readOnly: true }, sound: FOUND_SOUND }); }
  /* a fixture owner's terminal answer other than approval (Demo Studio's failures.pair_once, shared with Connect) */
  const PM_FAIL_AT = { reach: ['unreachable', 'identity_mismatch', 'protocol_mismatch'], approve: ['denied', 'expired'], qr: ['denied', 'expired'] };
  function pmFailOnce(S, phase) { const f = S.env.failures || {}, code = f.pair_once; if (!code || !(PM_FAIL_AT[phase] || []).includes(code)) return null; f.pair_once = null; return code; }
  function startPmPair(S) {
    const n = N(S), p = pmOf(S), m = n.pairing || 'approval', ctx = { sourcePairConfirmed: true };
    /* (a request that ended, refused or ran out stays ended until the person sends a new one) */
    if (!n.pairAsked || n.paired || n.pairFail) return;
    /* a request this page did not send (saved before a reload) is not resumed: a new one is sent */
    if (!pairLive(S)) {
      if (n.pairNonce) endPair(S, 'page_closed');
      n.pairNonce = Math.random().toString(36).slice(2, 8); n.pairStart = Date.now(); n.pairFail = null; livePairs.add(tryId(S)); S.save();
    }
    if (pairExpired(S)) return;
    const at = { id: tryId(S), purpose: n.purpose };
    const payload = { server: p.id, method: m, scope: 'selected_source_read', purpose: n.purpose, pairing_run: 'pairingrun:' + at.id };
    const onFail = (S2, st) => { if (stillThis(S, at)) { N(S).pairFail = st.code; S.save(); O55.ui.refresh(); } };
    if (m === 'code') return F.op(S, pairKey(S, 'reach'), 'cmd.client.pair.start', [{ key: 'reach', ms: 700, fail: () => pmFailOnce(S, 'reach') }], { payload, ctx, sound: { fail: 'warn' }, onFail });
    const mid = m === 'qr' ? { key: 'qr', ms: 1900, fail: () => pmFailOnce(S, 'qr') } : { key: 'approve', ms: 2800, fail: () => pmFailOnce(S, 'approve') };
    /* the approval on the other device (or the QR read) is a finding; trust done is the pairing's success */
    F.op(S, pairKey(S), 'cmd.client.pair.start', [{ key: 'reach', ms: 700, fail: () => pmFailOnce(S, 'reach') }, mid, { key: 'trust', ms: 800 }], { payload, ctx, sound: { phase: { approve: 'found', qr: 'found' }, intensity: 0.8 }, onDone: () => pairDone(S, at), onFail });
  }
  const PM_FAIL_ACTIONS = {
    unreachable: [{ label: 'connect.pair.fail.retry', do: 'newRequest' }, { label: 'nas.pmpair.useSsh', do: 'useSsh' }],
    denied: [{ label: 'connect.pair.fail.askAgain', do: 'newRequest' }, { label: 'nas.pmpair.another', do: 'another' }],
    expired: [{ label: 'connect.pair.fail.newRequest', do: 'newRequest' }],
    identity_mismatch: [{ label: 'nas.pmpair.another', do: 'another' }],
    protocol_mismatch: [{ label: 'connect.pair.fail.retry', do: 'newRequest' }, { label: 'nas.pmpair.useSsh', do: 'useSsh' }]
  };
  def('nas-pmpair', {
    seed: (S) => seedNas(S, 'nas-pmpair'),
    chapter: 'project', chapterFor: (S) => chapterOf(S), stage: 'server_storage_client',
    scene: (S) => { const n = N(S), st = F.state(S, pairKey(S)); return { id: 'nas', beat: n.paired ? 'paired' : 'pair', params: sceneParams(S, { seed: (pmOf(S) || {}).seed, words: words((pmOf(S) || {}).seed || ''), method: n.pairing || 'approval', waiting: !!(st && st.state === 'running') }) }; },
    eyebrow: () => T('nas.pmpair.eyebrow'),
    title: (S) => (N(S).paired ? T('nas.pmpair.doneTitle', { name: dname(S) }) : T('nas.pmpair.title', { name: dname(S) })),
    lead: (S) => T(N(S).paired ? 'nas.pmpair.doneLead' : N(S).pairAsked ? 'connect.pair.lead' : 'nas.pmpair.lead', { name: dname(S) }),
    /* a code typed before a reload is not kept anywhere (SCR-02): older sessions saved it, so it goes */
    enter(S) { delete N(S).code; S.save(); },
    body(S) {
      const n = N(S), p = pmOf(S), m = n.pairing || 'approval';
      const labels = { reach: T('connect.pair.phases.reach', { name: p.name }), approve: T('connect.pair.phases.approveAny', { name: p.name }), code: T('connect.pair.phases.code'), qr: T('connect.pair.phases.qr'), trust: T('nas.pmpair.trust'), perms: T('nas.install.phases.perms') };
      let out = C.identity(p.seed, words(p.seed), p.name + ' · ' + p.address);
      if (!n.pairAsked) {
        out += C.note(T('nas.pmpair.why', { name: p.name }), 'info', 'link');
        return out + C.group(T('connect.review.confirmTitle'), C.cards('pairing', [
          { v: 'approval', glyph: 'phone', title: T('connect.review.approve.title'), sub: T('connect.review.approve.subAny', { name: p.name }), tag: T('chrome.recommended') },
          { v: 'code', glyph: 'key', title: T('connect.review.code.title'), sub: T('connect.review.code.sub', { name: p.name }) },
          { v: 'qr', glyph: 'spark', title: T('connect.review.qr.title'), sub: T('connect.review.qr.sub') }
        ], m, { label: T('connect.review.confirmTitle') }));
      }
      const fail = !n.paired && pairLive(S) ? n.pairFail || (pairExpired(S) ? 'expired' : null) : null;
      if (m === 'code' && !n.paired) {
        out += F.phases(S, pairKey(S, 'reach'), ['reach'], labels);
        const reached = (F.state(S, pairKey(S, 'reach')) || {}).state === 'done', cs = F.state(S, pairKey(S, 'code'));
        if (reached && !fail) {
          const v = pairCodes.get(tryId(S)) || '';
          out += C.field({ bind: 'pmcode', label: T('connect.pair.codeLabel', { name: p.name }), value: v, placeholder: 'A7K9-M2Q4', hint: T('connect.pair.codeHint'), error: cs && cs.state === 'failed' ? T('connect.pair.codeWrong', { name: p.name }) : '', invalid: !!(cs && cs.state === 'failed') });
          out += `<div class="o55-inline" data-key="checkcode">${O55.ui.btn({ label: T('connect.pair.check'), do: 'checkCode', cls: 'o55-small', disabled: !F.nonEmpty(v), reason: T('connect.pair.codeHint') }, 'o55-secondary')}</div>`;
          out += H('nas-pmpair:code', [{ label: p.code || 'A7K9-M2Q4', outcome: 'works', fills: [['pmcode', p.code || 'A7K9-M2Q4']] }, { label: 'AAAA-BBBB', outcome: 'wrong', fills: [['pmcode', 'AAAA-BBBB']] }]);
        }
        if (cs && !fail) out += F.phases(S, pairKey(S, 'code'), ['code', 'trust'], labels);
      } else if (!n.paired) {
        out += F.phases(S, pairKey(S), ['reach', m === 'qr' ? 'qr' : 'approve', 'trust'], labels);
        const st = F.state(S, pairKey(S));
        const waiting = !fail && st && st.state === 'running' && (st.phases || []).some((ph) => (ph.key === 'approve' || ph.key === 'qr') && ph.status === 'active');
        if (waiting && m === 'approval') {
          const c = F.countdown((n.pairStart || Date.now()) + PAIR_MS);
          out += `<p class="o55-hint" data-key="expiry">${U.esc(T('chrome.expiresIn', { m: c.m, s: c.s }))}</p><div class="o55-sublinks" data-key="resend">${C.link(T('connect.pair.resend'), 'resend')}</div>`;
        }
        if (waiting && m === 'qr') out += `<div class="o55-viewfinder" data-key="vf" aria-label="${U.esc(T('connect.pair.qrAim', { name: p.name }))}"><span class="o55-vf-line"></span><span class="o55-vf-text">${U.esc(T('connect.pair.qrAim', { name: p.name }))}</span></div>`;
      }
      if (!fail && !n.paired) out += H('nas-pmpair:outcome', [['denied', 'refused'], ['expired', 'expired'], ['unreachable', 'noAnswer']].filter(([code]) => m !== 'code' || code === 'unreachable').map(([code, word]) => ({ label: T('connect.pair.hint.' + code), outcome: word, act: ['demoOutcome', code] })));
      if (fail) {
        const acts = PM_FAIL_ACTIONS[fail] || PM_FAIL_ACTIONS.unreachable;
        out += `<div class="o55-banner o55-banner-warn" data-key="pairfail-${U.esc(fail)}">${C.small('lock', 18)}<span>${U.esc(T('connect.pair.fail.' + fail, { name: p.name }))}</span></div>`
          + `<div class="o55-inline" data-key="pairfail-acts">${acts.map((a, i) => O55.ui.btn({ label: T(a.label), do: a.do, cls: 'o55-small', tip: false }, i ? 'o55-ghost' : 'o55-secondary')).join('')}</div>`;
      }
      if (n.paired) {
        out += F.phases(S, pairKey(S, 'perms'), ['perms'], labels);
        if ((F.state(S, pairKey(S, 'perms')) || {}).state === 'done') out += C.note(T('nas.install.donePaired', { name: p.name }), 'ok', 'lock');
      }
      return out;
    },
    mounted(S) {
      const n = N(S);
      if (n.pairAsked && !n.paired) { startPmPair(S); F.ticker(S, 'nas-pmpair', 1000, () => N(S).paired); }
      if (n.paired) checkFolders(S);
    },
    foot(S) {
      const n = N(S);
      if (!n.pairAsked) return { secondary: [{ label: T('nas.pmpair.useSsh'), do: 'useSsh' }], primary: { label: T('nas.pmpair.pair'), do: 'pair' } };
      if (!n.paired) return { secondary: [{ label: T('nas.pmpair.another'), do: 'another' }], primary: { label: T('chrome.continue'), do: 'next', disabled: true, reason: n.pairFail || pairExpired(S) ? T('connect.pair.fail.reason') : T('connect.pair.phases.approveAny', { name: (pmOf(S) || {}).name || '' }) } };
      const ps = F.state(S, pairKey(S, 'perms'));
      return { primary: { label: T('chrome.continue'), do: 'next', disabled: !(ps && ps.state === 'done'), reason: T('chrome.working') } };
    },
    do: {
      pairing(S, v) { if (N(S).pairAsked) return; N(S).pairing = v; S.save(); O55.ui.refresh(); },
      pair(S) { const n = N(S); n.pairAsked = true; n.useSsh = false; S.save(); O55.ui.refresh(); O55.sound.play('tap'); startPmPair(S); F.ticker(S, 'nas-pmpair', 1000, () => N(S).paired); },
      /* a new request, never the old one's timer reset: the old try ends and its answers no longer count (SCR-15) */
      resend(S) { endPair(S, 'resend'); S.save(); startPmPair(S); O55.ui.refresh(); U.announce(T('connect.pair.phases.approveAny', { name: (pmOf(S) || {}).name || '' }), S.root.querySelector('.o55-win')); },
      newRequest(S) { endPair(S, 'retry'); S.save(); startPmPair(S); O55.ui.refresh(); O55.sound.play('tap'); },
      /* (demo: a new request that the concept's Server answers this way: failures.pair_once) */
      demoOutcome(S, code) { if (!PM_FAIL_ACTIONS[code]) return; S.env.failures = S.env.failures || {}; S.env.failures.pair_once = code; endPair(S, 'retry'); S.save(); startPmPair(S); O55.ui.refresh(); O55.sound.play('tap'); },
      checkCode(S) {
        const n = N(S), p = pmOf(S), at = { id: tryId(S), purpose: n.purpose };
        if (!stillThis(S, at)) return O55.ui.refresh();
        const ok = String(pairCodes.get(at.id) || '').replace(/[\s-]/g, '').toUpperCase() === String(p.code || '').replace(/-/g, '');
        F.reset(S, pairKey(S, 'code'));
        F.op(S, pairKey(S, 'code'), 'cmd.client.pair.start', [{ key: 'code', ms: 500, fail: () => (ok ? null : 'code_mismatch') }, { key: 'trust', ms: 800 }],
          { payload: { server: p.id, method: 'code', scope: 'selected_source_read', pairing_run: 'pairingrun:' + at.id }, ctx: { sourcePairConfirmed: true }, sound: { fail: 'warn', intensity: 0.8 }, onDone: () => pairDone(S, at) });
      },
      /* turning away cancels the owner's pairing run and records nothing */
      another(S) { const n = N(S); endPair(S, 'cancelled'); n.pairAsked = false; S.save(); O55.ui.refresh(); },
      useSsh(S) { const n = N(S); if (n.pairAsked && !n.paired) endPair(S, 'cancelled'); n.pairAsked = false; n.useSsh = true; n.viaPm = false; S.save(); O55.ui.go('nas-identity'); },
      next(S) { connected(S); }
    },
    /* the code stays in this page's memory beside its try: never in the session, never saved */
    bind: { pmcode(S, v) { const id = tryId(S), had = F.nonEmpty(pairCodes.get(id)); pairCodes.set(id, String(v || '')); if (had !== F.nonEmpty(v)) O55.ui.refresh(); } },
    skipOnBack: (S) => !!N(S).paired
  });

  /* ------------------------------------------------------------------ choose a folder (SFTP browser) */
  function readOnlyAt(S, path) { const d = dev(S); return (d.readOnly || []).some((p) => path === p || path.startsWith(p + '/')); }
  def('nas-folder', {
    seed: (S) => seedNas(S, 'nas-folder'),
    chapter: 'project', stage: 'server_storage_client',
    scene: (S) => ({ id: 'nas', beat: 'folder', params: sceneParams(S, { folder: (N(S).at || '').split('/').pop() || undefined }) }),
    eyebrow: () => T('nas.folder.eyebrow'),
    title: (S) => T('nas.folder.title', { name: dname(S) }),
    lead: (S) => (N(S).purpose === 'storage' ? T('nas.folder.leadStorage') : T('nas.folder.lead')),
    body(S) {
      const n = N(S), d = dev(S), root = d.roots[0], at = n.at || root;
      const kids = (S.env.folders[at] || []).map((name) => ({ name, isNew: false })).concat((n.newFolders || []).filter((f) => f.parent === at).map((f) => ({ name: f.name, isNew: true })));
      const crumbs = at.split('/').filter(Boolean).map((part, i, arr) => C.link(part, 'cd', '/' + arr.slice(0, i + 1).join('/'))).join(' <span aria-hidden="true">›</span> ');
      let out = `<div class="o55-crumbs" data-key="crumbs">${C.small('server', 14)} ${U.esc(d.name)} <span aria-hidden="true">›</span> ${crumbs}${O55.tips.q('group:cd')}</div>${O55.tips.explainer('group:cd')}`;
      out += `<div class="o55-treelist" role="listbox" aria-label="${U.esc(T('nas.folder.title', { name: d.name }))}" data-key="list">`
        + (kids.length ? kids.map(({ name, isNew }) => `<button type="button" class="o55-treeitem${isNew ? ' o55-new' : ''}" role="option" data-o55-do="cd" data-arg="${U.esc(at + '/' + name)}" data-pm-hover-exempt="true" data-key="f-${U.esc(U.slug(name))}">${C.small('folder', 16)}<span>${U.esc(name)}</span>${isNew ? `<span class="o55-tag">${U.esc(T('nas.folder.newFolder'))}</span>` : ''}</button>`).join('') : `<p class="o55-hint">${U.esc(T('nas.folder.empty'))}</p>`) + '</div>';
      if (n.adding) out += `<div class="o55-fieldrow" data-key="newf">${C.field({ bind: 'newName', label: T('nas.folder.newName'), value: n.newName || '', hint: T('nas.folder.newNote') })}${O55.ui.btn({ label: T('chrome.done'), do: 'addFolder', cls: 'o55-small', disabled: !F.nonEmpty(n.newName), reason: T('nas.folder.newName') }, 'o55-secondary')}</div>`;
      else out += `<div class="o55-sublinks" data-key="add">${C.link(T('nas.folder.newFolder'), 'adding')}</div>`;
      if (readOnlyAt(S, at)) out += C.note(T('nas.folder.readOnly', { user: n.user || d.user }), 'warn', 'lock');
      else out += C.note(n.viaPm ? T('nas.install.donePaired', { name: d.name }) : T('nas.install.done'), 'ok', 'lock');
      return out;
    },
    foot(S) { const n = N(S), d = dev(S), at = n.at || d.roots[0]; const bad = readOnlyAt(S, at) || at === d.roots[0]; return { primary: { label: T('nas.folder.use'), do: 'use', disabled: bad, reason: readOnlyAt(S, at) ? T('nas.folder.readOnly', { user: n.user || d.user }) : T('missing.storage') } }; },
    do: {
      cd(S, path) { N(S).at = path; S.save(); O55.ui.refresh(); O55.sound.play('move', depth(path)); },
      adding(S) { N(S).adding = true; S.save(); O55.ui.refresh(); },
      addFolder(S) { const n = N(S), at = n.at || dev(S).roots[0]; n.newFolders = (n.newFolders || []).concat([{ parent: at, name: n.newName.trim() }]); n.adding = false; n.at = at + '/' + n.newName.trim(); n.newName = ''; S.save(); O55.ui.refresh(); },
      use(S) {
        /* (an SSH folder is named by its connection profile, so two accounts or ports on one device never collide: SCR-10) */
        const n = N(S), d = dev(S), at = n.at, tr = transport(S), ref = (tr === 'puppet_master' ? 'pm:' + U.slug(String((pmOf(S) || {}).id || d.id).replace(/^pm:/, '')) : 'ssh:' + (n.profile || profileId(S))) + at, dd = md(S);
        n.folderLabel = d.name + ' › ' + at.split('/').filter(Boolean).join(' › ');
        if (n.purpose === 'storage') O55.draft.set(dd, { storage_mode: 'network_location', storage_transport: tr, storage_location: ref });
        else O55.draft.set(dd, { project_source_ref: ref, project_transport: tr, project_name: dd.project_name || O55.project.pretty(at.split('/').pop()) });
        S.save();
        O55.ui.go('name');
      }
    },
    bind: { newName(S, v) { N(S).newName = v; S.save(); O55.ui.refresh(); } }
  });

  /* ------------------------------------------------------------------ SMB / NFS / already connected follow-ups */
  function finishMounted(S, label, ref, transport) {
    const n = N(S), dd = md(S);
    n.folderLabel = label;
    if (n.purpose === 'storage') O55.draft.set(dd, { storage_mode: 'network_location', storage_transport: transport, storage_location: ref });
    else O55.draft.set(dd, { project_source_ref: ref, project_transport: 'mounted', project_name: dd.project_name || O55.project.pretty(label.split(/[›/]/).pop()) });
    S.save(); O55.ui.go('name');
  }
  /* A share is opened by the computer that does the work, which keeps its sign-in in its own password store (SCR-11):
     the screen names that computer. Its reference carries an opaque profile of the share, that computer and the account,
     so two accounts on one share never collide. A domain or workgroup is asked only where a network uses one. */
  const shareProfile = (S, sh, user, domain) => 'shp:' + U.slug(onServer(S) ? md(S).server_ref || 'server' : S.env.here.id) + ':' + hash8([sh.proto, sh.path, user || '', domain || ''].join('|'));
  def('nas-smb', {
    seed: (S) => seedNas(S, 'nas-smb'),
    chapter: 'project', stage: 'server_storage_client',
    scene: (S) => ({ id: 'nas', beat: 'share', params: sceneParams(S, { share: 'smb' }) }), /* a shared folder: no key, no lock */
    eyebrow: () => T('nas.smb.eyebrow'), title: () => T('nas.smb.title'), lead: (S) => T('nas.smb.leadOn', { where: machine(S) }),
    body(S) {
      const n = N(S), sh = shareOf(S) || {}, key = 'smb:' + (n.share === 'manual' ? sh.path : n.share);
      let out = `<p class="o55-path" data-key="share">${U.esc(sh.path || '')}</p>`;
      out += C.field({ bind: 'user', label: T('nas.smb.user'), value: n.user || '', autocomplete: 'username' });
      const st = F.state(S, key), refused = !!(st && st.state === 'failed' && st.code === 'wrong_password');
      /* (the computer that opens the share keeps its sign-in, as for any shared folder: not the SSH key's one-time password) */
      out += C.field({ bind: 'pw', type: 'password', protected: true, label: T('nas.smb.password'), value: '', hint: refused ? '' : T('nas.smb.passwordHintOn', { where: machine(S) }), error: refused ? T('nas.smb.wrong') : '', invalid: refused });
      out += H('nas-smb:signin', [{ label: 'jared · ' + T('nas.signin.hintAny'), outcome: 'works', fills: [['user', 'jared'], ['pw', 'correct horse']] }, { label: T('nas.signin.hintRefused'), outcome: 'wrong', act: ['demoRefused'] }], { when: !n.pwTyped && !(st && st.state === 'done') });
      out += C.details(S, 'smbdomain', T('nas.smb.more'), C.field({ bind: 'domain', label: T('nas.smb.domain'), value: n.domain || '', hint: T('nas.smb.domainHint'), autocomplete: 'off' }));
      if (st) out += F.phases(S, key, ['mount', 'read'], { mount: T('nas.smb.phases.mount'), read: T('nas.smb.phases.read') });
      return out;
    },
    foot(S) { const n = N(S), sh = shareOf(S) || {}, st = F.state(S, 'smb:' + (n.share === 'manual' ? sh.path : n.share)); if (st && st.state === 'done') return { primary: { label: T('chrome.continue'), do: 'use' } }; return { primary: { label: T('nas.smb.check'), do: 'check', disabled: !shareOf(S) || !F.nonEmpty(n.user) || !n.pwTyped, reason: T('nas.signin.passwordHint') } }; },
    do: {
      check(S) {
        const n = N(S), sh = shareOf(S); if (!sh) return;
        const i = S.root.querySelector('#o55f-pw'), pwv = i ? i.value : ''; if (i) i.value = ''; n.pwTyped = false; O55.sound.play('tap');
        const key = 'smb:' + (n.share === 'manual' ? sh.path : n.share);
        /* situation smbWrong: the share refuses the first password, as it would a mistyped one (and the demo's wrong one) */
        const f = S.env.failures || {}, wrong = !!f.smb_password_once || pwv === (O55.fixtures.DEMO || {}).wrongPassword; if (f.smb_password_once) f.smb_password_once = false;
        F.reset(S, key);
        F.op(S, key, 'cmd.project.source_location.test', [{ key: 'mount', ms: 900, fail: wrong ? () => 'wrong_password' : undefined }, { key: 'read', ms: 600 }], { payload: { share: sh.path, proto: 'smb', from: onServer(S) ? md(S).server_ref : S.env.here.id, user: String(n.user || '').trim(), domain: n.domain || null, readOnly: true } });
      },
      /* (demo: the share refuses the next password once, the smbWrong situation's own flag; the fields are filled) */
      demoRefused(S) { S.env.failures = S.env.failures || {}; S.env.failures.smb_password_once = true; O55.ui.fill('user', 'jared'); O55.ui.fill('pw', 'correct horse'); },
      use(S) { const n = N(S), sh = shareOf(S), prof = shareProfile(S, sh, String(n.user || '').trim(), n.domain); finishMounted(S, sh.path + '/' + (md(S).project_name || 'Project'), 'smb:' + prof + ':' + sh.path.replace(/^\/\//, ''), 'smb'); }
    },
    bind: {
      user(S, v) { N(S).user = v; S.save(); O55.ui.refresh(); },
      domain(S, v) { N(S).domain = String(v || '').trim(); S.save(); },
      pw(S, v) { const had = !!N(S).pwTyped; N(S).pwTyped = v.length > 0; if (had !== N(S).pwTyped) { S.save(); O55.ui.refresh(); } }
    }
  });
  /* NFS has no password: the share lets in the computers it lists, so the check says which computer is asking */
  const nfsKey = (S) => { const n = N(S), sh = shareOf(S) || {}; return 'nfs:' + (n.share === 'manual' ? sh.path : n.share); };
  def('nas-nfs', {
    seed: (S) => seedNas(S, 'nas-nfs'),
    chapter: 'project', stage: 'server_storage_client',
    scene: (S) => ({ id: 'nas', beat: 'share', params: sceneParams(S, { share: 'nfs' }) }), /* a shared folder: no key, no lock */
    eyebrow: () => T('nas.nfs.eyebrow'), title: () => T('nas.nfs.title'), lead: (S) => T('nas.nfs.leadOn', { where: machine(S) }),
    body(S) { const sh = shareOf(S) || {}; return `<p class="o55-path" data-key="share">${U.esc(sh.path || '')}</p>` + C.note(T('nas.nfs.noPassword', { where: machine(S) }), 'info', 'lock') + F.phases(S, nfsKey(S), ['mount', 'read'], { mount: T('nas.nfs.phases.mount'), read: T('nas.nfs.phases.read') }); },
    mounted(S) { const sh = shareOf(S); if (!sh) return; F.op(S, nfsKey(S), 'cmd.project.source_location.test', [{ key: 'mount', ms: 900 }, { key: 'read', ms: 600 }], { payload: { share: sh.path, proto: 'nfs', from: onServer(S) ? md(S).server_ref : S.env.here.id, readOnly: true } }); },
    foot(S) { const sh = shareOf(S), st = sh && F.state(S, nfsKey(S)); return { primary: { label: T('chrome.continue'), do: 'use', disabled: !(st && st.state === 'done'), reason: sh ? T('chrome.working') : T('missing.storage') } }; },
    do: { use(S) { const sh = shareOf(S); if (!sh) return; finishMounted(S, sh.path, 'nfs:' + shareProfile(S, sh) + ':' + sh.path, 'nfs'); } }
  });
  /* The drive chosen on Where are the files is not asked for again (FF-23): this step names it, says which computer has
     it, and checks that computer can read it. */
  def('nas-mounted', {
    seed: (S) => seedNas(S, 'nas-mounted'),
    chapter: 'project', stage: 'server_storage_client',
    scene: (S) => ({ id: 'nas', beat: 'share', params: sceneParams(S, { share: 'mounted' }) }), /* a shared folder: no key, no lock */
    eyebrow: () => T('nas.mounted.eyebrow'), title: () => T('nas.mounted.titleCheck'), lead: (S) => T('nas.mounted.leadOn', { where: machine(S) }),
    body(S) { const v = N(S).volume || ''; return `<p class="o55-path" data-key="vol">${C.small('folder', 14)} ${U.esc(v)}</p>` + F.phases(S, 'mounted:' + v, ['read'], { read: T('nas.mounted.read', { where: machine(S) }) }) + `<div class="o55-sublinks" data-key="other">${C.link(T('nas.mounted.other'), 'other')}</div>`; },
    mounted(S) { const v = N(S).volume; if (v) F.op(S, 'mounted:' + v, 'cmd.project.source_location.test', [{ key: 'read', ms: 600 }], { payload: { path: v, from: onServer(S) ? md(S).server_ref : S.env.here.id, readOnly: true } }); },
    foot(S) { const v = N(S).volume, st = v && F.state(S, 'mounted:' + v); return { primary: { label: T('chrome.continue'), do: 'use', disabled: !(st && st.state === 'done'), reason: v ? T('chrome.working') : T('missing.storage') } }; },
    do: { other(S) { O55.ui.back(); }, use(S) { const v = N(S).volume; finishMounted(S, v, 'mounted:' + v, 'mounted'); } }
  });

  O55.onOpen = (O55.onOpen || []).concat([(S) => {
    const n = S.sess.nas; if (!n || !n.device) return;
    const d = S.env.devices.find((x) => x.id === n.device); if (!d) return;
    if (n.trusted) knownHosts(S)[hostId(S)] = d.hostKey;
    if (n.installed && n.key) authorize(S, d, n.key);
    if (n.key === 'k-pm' && !keyring(S).some((x) => x.id === 'k-pm')) keyring(S).push(K_PM(S));
    if (S.sess.ops && S.sess.ops['sshcheck:' + d.id] && S.sess.ops['sshcheck:' + d.id].state === 'done') d.ssh = true;
  }]);
  O55.nas = { dev, N, pubLine, entry, transport, endPair };
})();
