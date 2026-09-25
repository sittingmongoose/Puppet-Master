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
  /* the picture follows the screen: as many keys as were found, the chosen one lit, a new key when one is chosen */
  const sceneParams = (S, extra) => {
    const ks = keyring(S), sel = N(S).key || (dev(S) ? defaultKey(S) : null);
    return Object.assign({ device: (dev(S) || {}).name ? dev(S).name.toLowerCase() : undefined, seed: (dev(S) || {}).hostKey, words: dev(S) ? words(dev(S).hostKey) : '',
      keys: ks.length, pick: ks.findIndex((k) => k.id === sel), newKey: sel === 'new', paired: !!N(S).viaPm }, extra || {});
  };

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
        if (n.manual) {
          out += `<div class="o55-fieldrow" data-key="manual">${C.field({ bind: 'addr', label: T('nas.find.addressLabel'), value: n.addr || '', placeholder: '192.168.1.20', hint: T('nas.find.addressHint') })}${C.field({ bind: 'port', label: T('nas.find.portLabel'), value: n.port || '22', cls: 'o55-field-port' })}</div>`;
        } else if (!st || st.state !== 'done') {
          out += `<div class="o55-row o55-row-wait" data-key="scan"><span class="o55-spin" aria-hidden="true"></span><span class="o55-rowtext"><span class="o55-rowtitle">${U.esc(T('nas.find.looking'))}</span></span></div>`;
        } else {
          const cards = S.env.here.sshConfigHosts.map((h) => { const d = S.env.devices.find((x) => x.address === h.host); return d && { v: d.id + '|cfg', glyph: 'key', title: h.alias + ' → ' + h.host, sub: T('nas.find.fromConfig') + ' · ' + T('nas.find.user', { user: h.user }) }; }).filter(Boolean)
            .concat(S.env.devices.map((d) => ({ v: d.id, glyph: 'server', title: d.name, sub: d.brand + ' ' + d.model + ' · ' + d.address, tag: d.pm ? T('nas.find.pmTag') : d.ssh ? T('nas.find.sshOn') : T('nas.find.sshOff') })));
          out += C.cards('device', cards, n.device ? n.device + (n.fromConfig ? '|cfg' : '') : null, { label: T('nas.find.titleSource') });
        }
        const d = dev(S);
        if (d && d.pm) out += C.note(T('nas.find.pmNote', { name: d.name }), 'ok', 'link');
        if (d && !d.ssh && !d.pm) {
          const cs = F.state(S, 'sshcheck:' + d.id);
          out += C.group(T('nas.find.offTitle', { name: d.name }), `<p class="o55-note o55-note-info">${C.small('power', 14)}<span>${U.esc(T('nas.find.offLead', { brand: d.brand }))}</span></p>`
            + `<p class="o55-path" data-key="path">${U.esc(O55.tx('nas.find.steps')[d.brand] || '')}</p>`
            + (cs && cs.state === 'failed' ? C.note(T('nas.find.stillOff', { name: d.name }), 'warn') : '')
            + `<div class="o55-inline" data-key="again">${O55.ui.btn({ label: T('nas.find.checkAgain'), do: 'checkAgain', cls: 'o55-small' }, 'o55-secondary')}</div>`, { cls: 'o55-sshoff' });
        }
        if (!n.manual) out += `<div class="o55-sublinks" data-key="addr">${C.link(T('nas.find.address'), 'manualOn')}</div>`;
      } else if (m === 'smb' || m === 'nfs') {
        out += C.group(T(m === 'smb' ? 'nas.find.shares' : 'nas.find.exports'), C.cards('share', S.env.shares.filter((s) => s.proto === m).map((s) => ({ v: s.id, glyph: 'folder', title: s.path, sub: (S.env.devices.find((d) => d.id === s.device) || {}).name })), n.share));
      } else {
        out += C.group(T('nas.find.volumes'), C.cards('volume', ['/Volumes/Home NAS', '/Volumes/Media'].map((v) => ({ v, glyph: 'folder', title: v.split('/').pop(), sub: v })), n.volume));
      }
      return out;
    },
    mounted(S) { if ((N(S).method || 'ssh') === 'ssh' && !N(S).manual) F.op(S, 'discover:ssh', 'cmd.server.discovery.refresh', [{ key: 'mdns', ms: 1100 }], { payload: { services: ['_ssh._tcp', '_sftp-ssh._tcp', '_smb._tcp'] } }); },
    foot(S) {
      const n = N(S), m = n.method || 'ssh', d = dev(S);
      let ok = false, reason = T('missing.storage');
      if (m === 'ssh') {
        ok = n.manual ? S.env.devices.some((x) => x.address === String(n.addr || '').trim()) : !!(d && (d.ssh || d.pm));
        if (n.manual) reason = F.nonEmpty(n.addr) ? T('nas.find.noAnswer', { addr: String(n.addr).trim() }) : T('nas.find.addressLabel');
        else if (d && !d.ssh && !d.pm) reason = T('nas.find.offTitle', { name: d.name });
        else if (!d) reason = T('nas.find.choose');
      }
      else if (m === 'mounted') ok = !!n.volume; else ok = !!n.share;
      return { primary: { label: T('chrome.continue'), do: 'next', disabled: !ok, reason } };
    },
    do: {
      method(S, v) { N(S).method = v; S.save(); O55.ui.refresh(); },
      device(S, v, el) {
        const [id, cfg] = v.split('|'), n = N(S), h = cfg ? S.env.here.sshConfigHosts.find((x) => S.env.devices.find((d) => d.id === id && d.address === x.host)) : null;
        if (n.device !== id) { Object.assign(n, { trusted: false, installed: false, key: null, paired: false, viaPm: false, pairAsked: false, useSsh: false, pairing: null, code: '' }); }
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
      volume(S, v) { N(S).volume = v; S.save(); O55.ui.refresh(); },
      manualOn(S) { N(S).manual = true; S.save(); O55.ui.refresh(); },
      next(S) {
        const n = N(S), m = n.method || 'ssh';
        if (m === 'ssh' && n.manual) { const d = S.env.devices.find((x) => x.address === String(n.addr || '').trim()); n.device = d && d.id; }
        S.save();
        O55.ui.go(m === 'ssh' ? entry(S) : { smb: 'nas-smb', nfs: 'nas-nfs', mounted: 'nas-mounted' }[m]);
      }
    },
    bind: { addr(S, v) { N(S).addr = v; S.save(); O55.ui.refresh(); }, port(S, v) { N(S).port = v.replace(/[^0-9]/g, '').slice(0, 5); S.save(); } }
  });

  /* ------------------------------------------------------------------ is this your device? (identity before trust) */
  function hostState(S) {
    const d = dev(S); if (!d) return 'new';
    const known = S.env.here.knownHosts[d.address];
    if (!known) return 'new';
    return known === d.hostKey ? 'known' : 'changed';
  }
  def('nas-identity', {
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
      out += C.details(S, 'fp', T('nas.identity.details'), C.kv([[T('nas.identity.fingerprint'), d.hostKey]].concat(hs === 'changed' ? [[T('nas.identity.old'), S.env.here.knownHosts[d.address]]] : [])));
      return out;
    },
    foot(S) {
      const hs = hostState(S), n = N(S);
      if (hs === 'changed' && !n.acceptedNew) return { secondary: [{ label: T('nas.identity.trustNew'), do: 'trustNew' }], primary: { label: T('nas.identity.stop'), do: 'stop' } };
      return { primary: { label: hs === 'known' || n.trusted ? T('chrome.continue') : T('nas.identity.confirm'), do: 'trust' } };
    },
    do: {
      trust(S) { const n = N(S); n.trusted = true; S.env.here.knownHosts[dev(S).address] = dev(S).hostKey; S.save(); O55.ui.go('nas-key'); },
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
  const K_PM = (S) => ({ id: 'k-pm', file: '~/.ssh/puppet_master_ed25519', comment: 'Puppet Master', pubComment: 'puppet-master@' + (S && onServer(S) ? O55.util.slug(machine(S)) : 'MacBook-Pro'), type: 'ed25519', where: 'file' });
  function makeNewKey(S) {
    if (!keyring(S).some((x) => x.id === 'k-pm')) keyring(S).push(K_PM(S));
    N(S).key = 'k-pm';
  }
  function keyStatus(S, k) {
    const d = dev(S);
    if (d && d.authorized.includes(k.id)) return 'works';
    if (/^(dsa|rsa-1024)/.test(k.type)) return 'old';
    if (k.passphrase && !N(S).unlocked) return 'locked';
    return 'notAdded';
  }
  const keyWhere = (k) => (k.where === 'file' && k.configHost ? T('nas.key.where.config', { host: k.configHost }) : T('nas.key.where.' + k.where));
  function defaultKey(S) { const works = keyring(S).find((k) => keyStatus(S, k) === 'works'); return works ? works.id : 'new'; }
  def('nas-key', {
    chapter: 'project', chapterFor: (S) => chapterOf(S), stage: 'server_storage_client',
    scene: (S) => ({ id: 'nas', beat: 'keys', params: sceneParams(S) }),
    eyebrow: () => T('nas.key.eyebrow'),
    title: () => T('nas.key.title'),
    lead: (S) => T('nas.key.lead', { where: machine(S) }),
    body(S) {
      const n = N(S), d = dev(S), st = F.state(S, 'keys:' + d.id);
      if (!st || st.state !== 'done') return F.phases(S, 'keys:' + d.id, ['discover', 'probe'], { discover: T('nas.key.looking'), probe: T('nas.key.testing', { name: d.name }) });
      const sel = n.key || defaultKey(S);
      const keys = keyring(S).map((k) => {
        const s = keyStatus(S, k);
        const tag = { works: T('nas.key.works', { name: d.name }), notAdded: T('nas.key.notAdded', { name: d.name }), locked: T('nas.key.locked'), old: T('nas.key.old') }[s];
        return { v: k.id, glyph: 'key', title: k.comment || k.file, sub: keyWhere(k) + (k.file ? ' · ' + k.file : ''), tag, disabled: s === 'old', reason: T('nas.key.old') };
      });
      let out = '';
      if (!keyring(S).length) out += C.note(T('nas.key.none', { where: machine(S) }), 'info', 'key');
      out += C.cards('pick', keys.concat([{ v: 'new', glyph: 'spark', title: T('nas.key.new'), sub: T('nas.key.newSub'), tag: defaultKey(S) === 'new' ? T('chrome.recommended') : '' }]), sel, { label: T('nas.key.title'), cls: 'o55-keys' });
      out += C.details(S, 'keys', T('nas.key.detailsLabel'), `<p>${U.esc(T('nas.key.details'))}</p>`);
      if (S.sess.ui.sheet === 'passphrase') {
        const k = keyring(S).find((x) => x.id === sel);
        out += C.sheet(S, 'passphrase', T('nas.key.passTitle', { key: k.file.split('/').pop() }),
          C.field({ bind: 'pass', type: 'password', protected: true, label: T('nas.key.passLabel'), value: '', hint: N(S).passEmpty ? '' : T('nas.key.passNote'), error: N(S).passEmpty ? T('nas.key.passEmpty', { key: k.comment }) : '', invalid: !!N(S).passEmpty }),
          O55.ui.btn({ label: T('nas.key.passCancel'), do: 'passCancel' }, 'o55-ghost') + O55.ui.btn({ label: T('nas.key.passOk'), do: 'passOk' }, 'o55-primary'));
      }
      if (n.passCancelled) out += C.note(T('nas.install.fail.cancelled', { key: (keyring(S).find((x) => x.id === sel) || {}).comment || '' }), 'warn');
      return out;
    },
    mounted(S) { const d = dev(S); F.op(S, 'keys:' + d.id, 'cmd.ssh_connection.keys.discover', [{ key: 'discover', ms: 700 }, { key: 'probe', ms: 1000 }], { payload: { device: d.id, publicOnly: true } }); },
    foot(S) { const st = F.state(S, 'keys:' + dev(S).id); return { primary: { label: T('chrome.continue'), do: 'next', disabled: !(st && st.state === 'done'), reason: T('nas.key.looking') } }; },
    do: {
      pick(S, v, el) { N(S).key = v; N(S).passCancelled = false; S.save(); O55.ui.refresh(); },
      passCancel(S) { N(S).passCancelled = true; S.sess.ui.sheet = null; S.save(); O55.sound.play('error'); O55.ui.refresh(); },
      passOk(S) { const i = S.root.querySelector('#o55f-pass'); if (!i || !i.value) { N(S).passEmpty = true; S.save(); O55.sound.play('error'); O55.ui.refresh(); O55.ui.shake('pass'); return; } N(S).passEmpty = false; i.value = ''; N(S).unlocked = true; S.sess.ui.sheet = null; S.save(); O55.screens.defs['nas-key'].do.next(S); },
      next(S) {
        const n = N(S); n.key = n.key || defaultKey(S);
        const k = keyring(S).find((x) => x.id === n.key);
        if (k && k.passphrase && !n.unlocked) { S.sess.ui.sheet = 'passphrase'; S.save(); return O55.ui.refresh(); }
        S.save();
        if (k && keyStatus(S, k) === 'works') return O55.ui.go('nas-install', { verifyOnly: true });
        O55.ui.go('nas-signin');
      }
    },
    bind: { pass(S, v) { if (N(S).passEmpty && v) { N(S).passEmpty = false; S.save(); O55.ui.refresh(); } } },
    leave(S) { if (S.sess.ui.sheet === 'passphrase') { S.sess.ui.sheet = null; S.save(); } }
  });

  /* ------------------------------------------------------------------ sign in once (only when the key isn't there yet) */
  def('nas-signin', {
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
        let out = `<p class="o55-lead-sm">${U.esc(T('nas.signin.selfLead', { name: d.name, key: k ? k.comment : '' }))}</p><div class="o55-codeline" data-key="pub"><code>${U.esc(line)}</code>${F.copyBtn(line, 'pub')}</div>`;
        if (n.selfMissing) out += C.note(T('nas.signin.selfNot', { name: d.name }), 'warn', 'key');
        return out + `<div class="o55-sublinks" data-key="back">${C.link(T('nas.signin.selfOff'), 'selfOff')}</div>`;
      }
      let out = C.field({ bind: 'user', label: T('nas.signin.user'), value: n.user || '', placeholder: '', hint: T('nas.signin.userHint', { name: d.name }), autocomplete: 'username' });
      out += C.field({ bind: 'pw', type: 'password', protected: true, label: T('nas.signin.password'), value: '', hint: n.pwError ? '' : T('nas.signin.passwordHint'), error: n.pwError ? T('nas.signin.wrong', { name: d.name }) : '', invalid: !!n.pwError, autocomplete: 'current-password' });
      if ((n.pwFails || 0) >= 2) out += C.note(T('nas.signin.lockout'), 'warn');
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
      selfOn(S) { N(S).self = true; N(S).selfMissing = false; S.save(); O55.ui.refresh(); makeIfNeeded(S); },
      selfOff(S) { N(S).self = false; N(S).selfMissing = false; S.save(); O55.ui.refresh(); },
      /* The person adds the line on the device themselves. The concept's device receives it at this click (the demo's
         stand-in for their step) unless the scenario says it is not there yet; the check that follows is real either way. */
      selfCheck(S) {
        const n = N(S), d = dev(S);
        if (S.env.failures.self_key_missing_once && !n.selfTried) n.selfTried = true;
        else if (!d.authorized.includes(n.key)) d.authorized.push(n.key);
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
      onDone: () => { makeNewKey(S); S.save(); } });
  }

  /* ------------------------------------------------------------------ automatic phases (selected-source auth) */
  def('nas-install', {
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
        if (code === 'not_allowed') out += C.note(T('nas.install.fail.notAllowedFix', { brand: d.brand }), 'info', 'power');
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
        F.reset(S, installKey(S)); N(S).opKey = null; O55.ui.refresh(); run(S);
      },
      fixPerms(S) { dev(S).homePermsOpen = false; F.reset(S, installKey(S)); N(S).opKey = null; S.save(); O55.ui.refresh(); run(S); },
      next(S) { connected(S); }
    },
    skipOnBack: (S) => { const st = F.state(S, installKey(S)); return !!(st && st.state === 'done'); }
  });
  /* The operation keeps the identity it started with, even after a new key gets its real id, so a finished install
     is never started again. */
  function installKey(S) { const n = N(S); return n.opKey || 'sshinstall:' + n.device + ':' + (n.key || 'new'); }
  function phaseOrder(S) {
    const n = N(S), k = keyring(S).find((x) => x.id === n.key);
    if (n.verifyOnly) return (k && k.passphrase ? ['unlock'] : []).concat(['verify', 'perms']);
    return (n.key === 'new' || !k ? ['make'] : k.passphrase ? ['unlock'] : []).concat(['add', 'verify', 'perms']);
  }
  function run(S) {
    const n = N(S), d = dev(S), order = phaseOrder(S);
    if (!n.opKey) { n.opKey = 'sshinstall:' + n.device + ':' + (n.key || 'new'); S.save(); }
    const failFor = {
      add: () => {
        if (!n.pwOnce) return 'wrong_password';
        if (S.env.failures.nas_password_once && !n.pwFailedOnce) { n.pwFailedOnce = true; S.save(); return 'wrong_password'; }
        if ((d.sshDisallowed || []).includes(n.user)) return 'not_allowed';
        return null;
      },
      /* the key must really be on the device: added just now by the add phase, already there, or added by the person */
      verify: () => (n.verifyOnly && !d.authorized.includes(n.key) ? 'not_added' : d.homePermsOpen ? 'refused' : null)
    };
    const ms = { make: 700, unlock: 500, add: 1100, verify: 800, perms: 700 };
    F.op(S, installKey(S), 'cmd.ssh_connection.key.install', order.map((k) => ({ key: k, ms: ms[k], fail: failFor[k] })), {
      payload: { device: d.id, key: n.key, publicOnly: true },
      onDone: () => {
        if (!n.verifyOnly) { if (n.key === 'new') makeNewKey(S); if (!d.authorized.includes(n.key)) d.authorized.push(n.key); }
        n.installed = true;
        const dd = md(S);
        O55.draft.set(dd, { source_access_authorization_refs: Array.from(new Set(dd.source_access_authorization_refs.concat(['ssh-key:' + U.slug(d.name) + ':' + (n.key || 'new')]))).slice(0, 16), preflight_result_refs: Array.from(new Set(dd.preflight_result_refs.concat(['preflight:ssh:' + U.slug(d.name)]))).slice(0, 32) });
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
    if (N(S).purpose === 'backup') { const r = S.sess.restore || {}; r.nasReady = true; S.save(); return O55.ui.go(r.scope !== 'project' ? 'r-unlock' : 'r-pick'); }
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
  function pairDone(S) {
    const n = N(S), d = dev(S), dd = md(S);
    n.paired = true; n.viaPm = true; n.installed = true;
    O55.draft.set(dd, { source_access_authorization_refs: Array.from(new Set(dd.source_access_authorization_refs.concat(['pairing:' + U.slug(d.name) + ':source-read']))).slice(0, 16),
      preflight_result_refs: Array.from(new Set(dd.preflight_result_refs.concat(['preflight:paired-source:' + U.slug(d.name)]))).slice(0, 32) });
    S.save(); checkFolders(S);
  }
  /* read-only: can this computer see the folders it will be offered (the write test waits for Creating); idempotent,
     so a reopen resumes it */
  function checkFolders(S) { F.op(S, pairKey(S, 'perms'), 'cmd.project.source_location.test', [{ key: 'perms', ms: 700 }], { payload: { device: N(S).device, readOnly: true } }); }
  function startPmPair(S) {
    const n = N(S), p = pmOf(S), m = n.pairing || 'approval', ctx = { sourcePairConfirmed: true };
    if (!n.pairAsked || n.paired) return;
    if (!n.pairStart || Date.now() - n.pairStart > PAIR_MS) { n.pairStart = Date.now(); S.save(); }
    const payload = { server: p.id, method: m, scope: 'selected_source_read', purpose: n.purpose };
    if (m === 'code') return F.op(S, pairKey(S, 'reach'), 'cmd.client.pair.start', [{ key: 'reach', ms: 700 }], { payload, ctx });
    const mid = m === 'qr' ? { key: 'qr', ms: 1900 } : { key: 'approve', ms: 2800 };
    F.op(S, pairKey(S), 'cmd.client.pair.start', [{ key: 'reach', ms: 700 }, mid, { key: 'trust', ms: 800 }], { payload, ctx, onDone: () => pairDone(S) });
  }
  def('nas-pmpair', {
    chapter: 'project', chapterFor: (S) => chapterOf(S), stage: 'server_storage_client',
    scene: (S) => { const n = N(S), st = F.state(S, pairKey(S)); return { id: 'nas', beat: n.paired ? 'paired' : 'pair', params: sceneParams(S, { seed: (pmOf(S) || {}).seed, words: words((pmOf(S) || {}).seed || ''), method: n.pairing || 'approval', waiting: !!(st && st.state === 'running') }) }; },
    eyebrow: () => T('nas.pmpair.eyebrow'),
    title: (S) => (N(S).paired ? T('nas.pmpair.doneTitle', { name: dname(S) }) : T('nas.pmpair.title', { name: dname(S) })),
    lead: (S) => T(N(S).paired ? 'nas.pmpair.doneLead' : N(S).pairAsked ? 'connect.pair.lead' : 'nas.pmpair.lead', { name: dname(S) }),
    body(S) {
      const n = N(S), p = pmOf(S), m = n.pairing || 'approval';
      const labels = { reach: T('connect.pair.phases.reach', { name: p.name }), approve: T('connect.pair.phases.approve', { device: p.approver }), code: T('connect.pair.phases.code'), qr: T('connect.pair.phases.qr'), trust: T('nas.pmpair.trust'), perms: T('nas.install.phases.perms') };
      let out = C.identity(p.seed, words(p.seed), p.name + ' · ' + p.address);
      if (!n.pairAsked) {
        out += C.note(T('nas.pmpair.why', { name: p.name }), 'info', 'link');
        return out + C.group(T('connect.review.confirmTitle'), C.cards('pairing', [
          { v: 'approval', glyph: 'phone', title: T('connect.review.approve.title'), sub: T('connect.review.approve.sub', { device: p.approver || '' }), tag: T('chrome.recommended') },
          { v: 'code', glyph: 'key', title: T('connect.review.code.title'), sub: T('connect.review.code.sub', { name: p.name }) },
          { v: 'qr', glyph: 'spark', title: T('connect.review.qr.title'), sub: T('connect.review.qr.sub') }
        ], m, { label: T('connect.review.confirmTitle') }));
      }
      if (m === 'code' && !n.paired) {
        out += F.phases(S, pairKey(S, 'reach'), ['reach'], labels);
        const reached = (F.state(S, pairKey(S, 'reach')) || {}).state === 'done', cs = F.state(S, pairKey(S, 'code'));
        if (reached) {
          out += C.field({ bind: 'pmcode', label: T('connect.pair.codeLabel', { name: p.name }), value: n.code || '', placeholder: 'A7K9-M2Q4', hint: T('connect.pair.codeHint'), error: cs && cs.state === 'failed' ? T('connect.pair.codeWrong', { name: p.name }) : '', invalid: !!(cs && cs.state === 'failed') });
          out += `<div class="o55-inline" data-key="checkcode">${O55.ui.btn({ label: T('connect.pair.check'), do: 'checkCode', cls: 'o55-small', disabled: !F.nonEmpty(n.code), reason: T('connect.pair.codeHint') }, 'o55-secondary')}</div>`;
        }
        if (cs) out += F.phases(S, pairKey(S, 'code'), ['code', 'trust'], labels);
      } else if (!n.paired) {
        out += F.phases(S, pairKey(S), ['reach', m === 'qr' ? 'qr' : 'approve', 'trust'], labels);
        const st = F.state(S, pairKey(S));
        const waiting = st && st.state === 'running' && (st.phases || []).some((ph) => (ph.key === 'approve' || ph.key === 'qr') && ph.status === 'active');
        if (waiting && m === 'approval') {
          const c = F.countdown((n.pairStart || Date.now()) + PAIR_MS);
          out += `<p class="o55-hint" data-key="expiry">${U.esc(T('chrome.expiresIn', { m: c.m, s: c.s }))}</p><div class="o55-sublinks" data-key="resend">${C.link(T('connect.pair.resend'), 'resend')}</div>`;
        }
        if (waiting && m === 'qr') out += `<div class="o55-viewfinder" data-key="vf" aria-label="${U.esc(T('connect.pair.qrAim', { name: p.name }))}"><span class="o55-vf-line"></span><span class="o55-vf-text">${U.esc(T('connect.pair.qrAim', { name: p.name }))}</span></div>`;
      }
      if (n.paired) {
        out += F.phases(S, pairKey(S, 'perms'), ['perms'], labels);
        if ((F.state(S, pairKey(S, 'perms')) || {}).state === 'done') out += C.note(T('nas.install.donePaired', { name: p.name }), 'ok', 'lock');
      }
      return out;
    },
    mounted(S) {
      const n = N(S);
      if (n.pairAsked && !n.paired) { startPmPair(S); if ((n.pairing || 'approval') === 'approval') F.ticker(S, 'nas-pmpair', 1000, () => N(S).paired); }
      if (n.paired) checkFolders(S);
    },
    foot(S) {
      const n = N(S);
      if (!n.pairAsked) return { secondary: [{ label: T('nas.pmpair.useSsh'), do: 'useSsh' }], primary: { label: T('nas.pmpair.pair'), do: 'pair' } };
      if (!n.paired) return { secondary: [{ label: T('nas.pmpair.another'), do: 'another' }], primary: { label: T('chrome.continue'), do: 'next', disabled: true, reason: T('connect.pair.phases.approve', { device: (pmOf(S) || {}).approver || '' }) } };
      const ps = F.state(S, pairKey(S, 'perms'));
      return { primary: { label: T('chrome.continue'), do: 'next', disabled: !(ps && ps.state === 'done'), reason: T('chrome.working') } };
    },
    do: {
      pairing(S, v) { if (N(S).pairAsked) return; N(S).pairing = v; S.save(); O55.ui.refresh(); },
      pair(S) { const n = N(S); n.pairAsked = true; n.useSsh = false; n.pairStart = Date.now(); S.save(); O55.ui.refresh(); startPmPair(S); if ((n.pairing || 'approval') === 'approval') F.ticker(S, 'nas-pmpair', 1000, () => N(S).paired); },
      resend(S) { N(S).pairStart = Date.now(); S.save(); O55.ui.refresh(); U.announce(T('connect.pair.phases.approve', { device: (pmOf(S) || {}).approver || '' }), S.root.querySelector('.o55-win')); },
      checkCode(S) {
        const n = N(S), p = pmOf(S), ok = String(n.code || '').replace(/[\s-]/g, '').toUpperCase() === String(p.code || '').replace(/-/g, '');
        F.reset(S, pairKey(S, 'code'));
        F.op(S, pairKey(S, 'code'), 'cmd.client.pair.start', [{ key: 'code', ms: 500, fail: () => (ok ? null : 'code_mismatch') }, { key: 'trust', ms: 800 }],
          { payload: { server: p.id, method: 'code', scope: 'selected_source_read' }, ctx: { sourcePairConfirmed: true }, onDone: () => pairDone(S) });
      },
      /* turning away cancels the owner's pairing run and records nothing */
      another(S) {
        const n = N(S), p = pmOf(S);
        ['', 'reach', 'code'].forEach((part) => { O55.owners.cancelOp(pairKey(S, part)); F.reset(S, pairKey(S, part)); });
        O55.owners.dispatch('cmd.client.pair.cancel', { server: p.id }, Object.assign(S.ctx(), { sourcePairConfirmed: true }));
        n.pairAsked = false; n.pairTry = (n.pairTry || 0) + 1; n.code = ''; S.save(); O55.ui.refresh();
      },
      useSsh(S) { const n = N(S); n.useSsh = true; n.viaPm = false; S.save(); O55.ui.go('nas-identity'); },
      next(S) { connected(S); }
    },
    bind: { pmcode(S, v) { N(S).code = v; S.save(); O55.ui.refresh(); } },
    skipOnBack: (S) => !!N(S).paired
  });

  /* ------------------------------------------------------------------ choose a folder (SFTP browser) */
  function readOnlyAt(S, path) { const d = dev(S); return (d.readOnly || []).some((p) => path === p || path.startsWith(p + '/')); }
  def('nas-folder', {
    chapter: 'project', stage: 'server_storage_client',
    scene: (S) => ({ id: 'nas', beat: 'folder', params: sceneParams(S, { folder: (N(S).at || '').split('/').pop() || undefined }) }),
    eyebrow: () => T('nas.folder.eyebrow'),
    title: (S) => T('nas.folder.title', { name: dname(S) }),
    lead: (S) => (N(S).purpose === 'storage' ? T('nas.folder.leadStorage') : T('nas.folder.lead')),
    body(S) {
      const n = N(S), d = dev(S), root = d.roots[0], at = n.at || root;
      const kids = (S.env.folders[at] || []).map((name) => ({ name, isNew: false })).concat((n.newFolders || []).filter((f) => f.parent === at).map((f) => ({ name: f.name, isNew: true })));
      const crumbs = at.split('/').filter(Boolean).map((part, i, arr) => C.link(part, 'cd', '/' + arr.slice(0, i + 1).join('/'))).join(' <span aria-hidden="true">›</span> ');
      let out = `<div class="o55-crumbs" data-key="crumbs">${C.small('server', 14)} ${U.esc(d.name)} <span aria-hidden="true">›</span> ${crumbs}</div>`;
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
      cd(S, path) { N(S).at = path; S.save(); O55.ui.refresh(); },
      adding(S) { N(S).adding = true; S.save(); O55.ui.refresh(); },
      addFolder(S) { const n = N(S), at = n.at || dev(S).roots[0]; n.newFolders = (n.newFolders || []).concat([{ parent: at, name: n.newName.trim() }]); n.adding = false; n.at = at + '/' + n.newName.trim(); n.newName = ''; S.save(); O55.ui.refresh(); },
      use(S) {
        const n = N(S), d = dev(S), at = n.at, tr = transport(S), ref = (tr === 'puppet_master' ? 'pm:' : 'ssh:') + U.slug(d.name) + at, dd = md(S);
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
  def('nas-smb', {
    chapter: 'project', stage: 'server_storage_client',
    scene: (S) => ({ id: 'nas', beat: 'share', params: sceneParams(S, { share: 'smb' }) }), /* a shared folder: no key, no lock */
    eyebrow: () => T('nas.smb.eyebrow'), title: () => T('nas.smb.title'), lead: () => T('nas.smb.lead'),
    body(S) {
      const n = N(S), sh = S.env.shares.find((s) => s.id === n.share) || {};
      let out = `<p class="o55-path" data-key="share">${U.esc(sh.path || '')}</p>`;
      out += C.field({ bind: 'user', label: T('nas.smb.user'), value: n.user || '', autocomplete: 'username' });
      out += C.field({ bind: 'pw', type: 'password', protected: true, label: T('nas.smb.password'), value: '', hint: T('nas.signin.passwordHint') });
      const st = F.state(S, 'smb:' + n.share);
      if (st) out += F.phases(S, 'smb:' + n.share, ['mount', 'read'], { mount: T('nas.smb.phases.mount'), read: T('nas.smb.phases.read') });
      return out;
    },
    foot(S) { const n = N(S), st = F.state(S, 'smb:' + n.share); if (st && st.state === 'done') return { primary: { label: T('chrome.continue'), do: 'use' } }; return { primary: { label: T('nas.smb.check'), do: 'check', disabled: !F.nonEmpty(n.user) || !n.pwTyped, reason: T('nas.signin.passwordHint') } }; },
    do: {
      check(S) { const i = S.root.querySelector('#o55f-pw'); if (i) i.value = ''; N(S).pwTyped = false; F.op(S, 'smb:' + N(S).share, 'cmd.storage.share.mount_check', [{ key: 'mount', ms: 900 }, { key: 'read', ms: 600 }], { payload: { share: N(S).share, readOnly: true } }); },
      use(S) { const sh = S.env.shares.find((s) => s.id === N(S).share); finishMounted(S, sh.path + '/' + (md(S).project_name || 'Project'), 'smb:' + sh.path.replace(/^\/\//, ''), 'smb'); }
    },
    bind: { user(S, v) { N(S).user = v; S.save(); O55.ui.refresh(); }, pw(S, v) { const had = !!N(S).pwTyped; N(S).pwTyped = v.length > 0; if (had !== N(S).pwTyped) { S.save(); O55.ui.refresh(); } } }
  });
  def('nas-nfs', {
    chapter: 'project', stage: 'server_storage_client',
    scene: (S) => ({ id: 'nas', beat: 'share', params: sceneParams(S, { share: 'nfs' }) }), /* a shared folder: no key, no lock */
    eyebrow: () => T('nas.nfs.eyebrow'), title: () => T('nas.nfs.title'), lead: () => T('nas.nfs.lead'),
    body(S) { const n = N(S), sh = S.env.shares.find((s) => s.id === n.share) || {}; return `<p class="o55-path" data-key="share">${U.esc(sh.path || '')}</p>` + F.phases(S, 'nfs:' + n.share, ['mount', 'read'], { mount: T('nas.nfs.phases.mount'), read: T('nas.nfs.phases.read') }); },
    mounted(S) { F.op(S, 'nfs:' + N(S).share, 'cmd.storage.share.mount_check', [{ key: 'mount', ms: 900 }, { key: 'read', ms: 600 }], { payload: { share: N(S).share, readOnly: true } }); },
    foot(S) { const st = F.state(S, 'nfs:' + N(S).share); return { primary: { label: T('chrome.continue'), do: 'use', disabled: !(st && st.state === 'done'), reason: T('chrome.working') } }; },
    do: { use(S) { const sh = S.env.shares.find((s) => s.id === N(S).share); finishMounted(S, sh.path, 'nfs:' + sh.path, 'nfs'); } }
  });
  def('nas-mounted', {
    chapter: 'project', stage: 'server_storage_client',
    scene: (S) => ({ id: 'nas', beat: 'share', params: sceneParams(S, { share: 'mounted' }) }), /* a shared folder: no key, no lock */
    eyebrow: () => T('nas.mounted.eyebrow'), title: () => T('nas.mounted.title'), lead: () => T('nas.mounted.lead'),
    body(S) { const n = N(S); return C.cards('volume', ['/Volumes/Home NAS', '/Volumes/Media'].map((v) => ({ v, glyph: 'folder', title: v.split('/').pop(), sub: v })), n.volume); },
    foot(S) { return { primary: { label: T('chrome.continue'), do: 'use', disabled: !N(S).volume, reason: T('missing.storage') } }; },
    do: { volume(S, v) { N(S).volume = v; S.save(); O55.ui.refresh(); }, use(S) { const v = N(S).volume; finishMounted(S, v, 'mounted:' + v, 'mounted'); } }
  });

  O55.onOpen = (O55.onOpen || []).concat([(S) => {
    const n = S.sess.nas; if (!n || !n.device) return;
    const d = S.env.devices.find((x) => x.id === n.device); if (!d) return;
    if (n.trusted) S.env.here.knownHosts[d.address] = d.hostKey;
    if (n.installed && n.key && !d.authorized.includes(n.key)) d.authorized.push(n.key);
    if (n.key === 'k-pm' && !keyring(S).some((x) => x.id === 'k-pm')) keyring(S).push(K_PM(S));
    if (S.sess.ops && S.sess.ops['sshcheck:' + d.id] && S.sess.ops['sshcheck:' + d.id].state === 'done') d.ssh = true;
  }]);
  O55.nas = { dev, N, pubLine, entry, transport };
})();
