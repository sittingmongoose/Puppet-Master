/* Settings managers, rethought (Fable 5.2): the chapter "Notifications & sounds".
   Today this is General › Notifications & Sounds: five tabs (Destinations, Events, Sounds, Quiet hours, History) with
   the master switch drawn on each. The same seven alerts are wired from three sides: per destination ("Alerts that
   arrive here"), per event row, and per sound ("Event sounds", "Use for events…"); what gets through quiet hours is
   told in three places. Here the chapter answers one question, "how do I find out when something needs me, and where?":
   - the first page says it in the person's own data, lists what needs them, then the destinations as things that open;
   - one table ("What you are told about") is the only place an alert is switched on, sent somewhere or given a sound.
     A destination's page and the Sounds page show those choices from their side and lead back to the table;
   - quiet hours is a picture of the day before it is a form, and holds the one list of what still gets through;
   - a destination, an alert and a sound each have a page. What PMConcept7 keeps in "More actions" and "Manage" menus
     are ordinary buttons there, and each runs PMConcept7's own menu item, so the dialog or the question is the real one.
   Every control is PMConcept7's own action. The Notifications manager exports no readers, and it makes its one-time
   data moves (a quiet-hours choice per destination, the built-in sound library, the sounds of setup and the tour) when
   it draws. The first page of this chapter that is shown asks it to draw once, out of sight (SMX.warm), so both views
   hold the same data; until that has happened the readers below cope with the older shape. */
(function (W) {
  'use strict';
  const SMX = W.SMX; if (!SMX) return;
  const ui = SMX.ui, d = SMX.d, h = SMX.h, S = SMX.sec;
  const kit = () => W.PM51;
  const DOC = W.document;
  const enc = encodeURIComponent;
  const G = 'general.interaction.';
  const MASTER = G + 'notifications-enabled', SFX = G + 'sound-effects', METHOD = G + 'notification-method', TRAY = G + 'tray-notifications';
  const NOTIF = { domain: 'general', ws: 'notifications', manager: 'notifications' };

  /* ------------------------------------------------------------------ small helpers */
  const val = (id) => SMX.val(id);
  const isOn = (id) => { const v = val(id); return v !== false && v !== 'off' && v != null; };
  const word = (id) => { const v = val(id); try { return String(kit().valueLabel(id, v) || v || ''); } catch (e) { return String(v == null ? '' : v); } };
  const plural = d.plural;
  const listOf = (a, joiner) => (a.length <= 1 ? a.join('') : `${a.slice(0, -1).join(', ')} ${joiner || 'and'} ${a[a.length - 1]}`);
  const low = (s) => String(s || '').charAt(0).toLowerCase() + String(s || '').slice(1);
  const clock = (t) => String(t || '').replace(/\s?(AM|PM)$/i, (m) => m.toLowerCase()).replace(/^(\S+?)(am|pm)$/, '$1 $2');
  const when = (t) => (/^\d/.test(String(t)) ? `at ${clock(t)}` : low(t));
  const select = (value, options, o) => { try { return kit().dropdown(value, options, o); } catch (e) { return ''; } };
  const toggle = (on, o) => { try { return kit().toggle(on, o); } catch (e) { return ''; } };
  const seg = (value, options, o) => { try { return kit().segmented(value, options, o); } catch (e) { return ''; } };
  const input = (value, o) => { try { return kit().input(value, o); } catch (e) { return ''; } };
  /* a control keeps the keyboard focus when its block is drawn again */
  const keyed = (html, key) => String(html).replace('<button ', `<button data-smx-key="${h(key)}" `);
  const fold = (key, label, help, body, open) => `<details class="smx-fold smx-fold-more" data-smx-fold="${h(key)}"${SMX.local.openMore[key] || open ? ' open' : ''}><summary>${SMX.icon('fold')}<span class="smx-fold-label">${h(label)}</span><span class="smx-fold-help">${h(help)}</span></summary><div class="smx-fold-body">${body}</div></details>`;
  /* A field that saves as you type would be drawn again under the caret: while it has the focus its block keeps the
     value it was drawn with. */
  const held = {};
  const typingIn = (action) => { const a = DOC.activeElement; return !!(a && a.getAttribute && a.getAttribute('data-action') === action); };
  const steady = (key, live, action) => { if (!typingIn(action) || !(key in held)) held[key] = live; return held[key]; };

  /* ------------------------------------------------------------------ readers over the manager's demo state */
  const N = (st) => st.notifications || {};
  const X = (st) => (st.pm51 || {}).notifications || {};
  const dests = (st) => N(st).destinations || [];
  const alerts = (st) => N(st).events || [];
  const agents = (st) => N(st).agents || [];
  const allSounds = (st) => N(st).sounds || [];
  const sent = (st) => N(st).history || [];
  const packs = (st) => N(st).packs || [];
  const quiet = (st) => Object.assign({ enabled: false, start: '10:30 PM', end: '8:00 AM', weekends: 'Same schedule' }, N(st).quiet || {});
  const sset = (st) => Object.assign({ volume: 70, whenFocused: true }, N(st).soundSettings || {});

  /* The manager's one-time moves happen when it draws. Ask it to, once, the first time a page here is shown. */
  const moved = (st) => !!((st.pm51 || {}).o55NotifV2 && (st.pm51 || {}).o55NotifSoundsV2 && N(st).soundSettings);
  /* The lists are the truth. Three settings stand for them (the destinations, where each alert goes, the sound of each
     alert); PMConcept7 writes them from the lists each time its manager draws. A change made on these pages writes
     them too, so "Every setting, as a list" and a copy of the settings never show an older answer. */
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const stuck = new Set(); let mirroring = false;
  const mirror = (st) => {
    if (mirroring || SMX.view !== 'new') return;
    const want = [
      [G + 'notification-destinations', dests(st).map((x) => x.name)],
      [G + 'notification-mapping', Object.fromEntries(alerts(st).filter((e) => (e.destinations || []).length).map((e) => [e.name, e.destinations.join(', ')]))],
      [G + 'sound-mapping', Object.fromEntries(alerts(st).filter((e) => e.sound && e.sound !== 'None').map((e) => [e.name, e.sound]))]
    ].filter(([id, v]) => SMX.has(id) && !stuck.has(id) && !same(val(id), v));
    if (!want.length) return;
    mirroring = true;
    W.setTimeout(() => { for (const [id, v] of want) { let ok = false; try { ok = W.PM12_KIMI.setSettingFromHost(id, v, false) !== false; } catch (e) { ok = false; } if (!ok) stuck.add(id); } mirroring = false; SMX.fresh(); }, 0);
  };
  let asked = 0, tries = 0;
  const prime = (st) => {
    if (moved(st)) { mirror(st); return; }
    if (SMX.borrowing || SMX.view !== 'new' || Date.now() - asked < 4000 || tries > 3) return;
    asked = Date.now(); tries++;
    /* its Sounds tab: that draw also makes the place where the volume is kept */
    W.setTimeout(() => { try { SMX.visit(Object.assign({}, NOTIF, { tab: 'sounds' })); } catch (e) { /* the readers cope with the older shape */ } SMX.fresh(); SMX.soon(30); }, 0);
  };

  /* destinations */
  const BUILT = ['Built-in', 'Operating system', 'In-app', 'System / tray'];
  const builtIn = (x) => BUILT.includes(x.type);
  const kindKey = (x) => (x.id === 'in-app' || x.type === 'Built-in' || x.type === 'In-app' ? 'app' : x.type === 'Operating system' || x.type === 'System / tray' ? 'system' : /discord/i.test(x.type) ? 'discord' : /slack/i.test(x.type) ? 'slack' : /webhook/i.test(x.type) ? 'web' : /ntfy/i.test(x.type) ? 'ntfy' : /pushover/i.test(x.type) ? 'pushover' : /telegram/i.test(x.type) ? 'telegram' : 'other');
  /* kind: [icon, what it is in a few words, the sentence for its page, the address's name, what the address is] */
  const KIND = {
    app: ['bell', 'In this app', 'Alerts appear inside Puppet Master, in the Activity center.'],
    system: ['computer', 'On this device', 'Alerts appear in this device’s own notification area, also while Puppet Master is in the background.'],
    discord: ['chat', 'Discord', 'A Discord channel gets a message for each alert.', 'Its web address', 'The long address Discord gives a channel for incoming messages (a webhook).'],
    slack: ['chat', 'Slack', 'A Slack channel gets a message for each alert.', 'Its web address', 'The long address Slack gives a channel for incoming messages (a webhook).'],
    web: ['link', 'A web address', 'Each alert is sent to a web address of yours (a webhook), for any app that can receive one.', 'Its web address', 'The address that receives each alert.'],
    ntfy: ['phone', 'Phone, through ntfy', 'Your phone gets a push notification through the ntfy app.', 'Topic', 'The private name your phone’s ntfy app listens to.'],
    pushover: ['phone', 'Phone, through Pushover', 'Your phone gets a push notification through the Pushover app.', 'Your Pushover key', 'The user key from your Pushover account.'],
    telegram: ['chat', 'Telegram', 'A Telegram chat gets a message for each alert.', 'Chat number', 'The number Telegram gives the chat (its chat id).'],
    other: ['external', '', 'Each alert is sent to this service.', 'Address', 'Where the service receives alerts.']
  };
  const kind = (x) => { const k = KIND[kindKey(x)]; return { icon: k[0], name: k[1] || String(x.type || 'Another service'), about: k[2], addr: k[3] || 'Address', addrHelp: k[4] || '' }; };
  const dStatus = (x) => (x.status === 'active' ? { text: builtIn(x) ? 'Ready' : 'Connected', tone: 'ready' } : x.status === 'attention' ? { text: 'Needs attention', tone: 'attention' } : x.status === 'disabled' ? { text: 'Paused', tone: 'off' } : { text: 'Not tested yet', tone: 'info' });
  const mask = (x) => { if (builtIn(x)) return x.address || 'This device'; const s = String(x.address || ''); if (!s) return 'Not set'; if (s.includes('•')) return s; if (s.length <= 6) return '••••'; return s.slice(0, 2) + '••••' + s.slice(-4); };
  const QUIET = [{ value: 'hold', label: 'Hold everything', meta: 'Delivered when quiet hours end' }, { value: 'urgent', label: 'Let urgent alerts through' }, { value: 'always', label: 'Always deliver' }];
  const quietOf = (st, x) => { if (x.quiet) return x.quiet; const q = N(st).quiet || {}; return (q.exceptions || {})[x.id] ? 'always' : x.urgent && q.urgentOverride !== false ? 'urgent' : 'hold'; };
  const destRoute = (x) => `notifications/destination/${enc(x.id)}`;
  const destOf = (ctx) => dests(ctx.st).find((x) => x.id === (ctx.params || {}).id) || null;
  const lastSent = (st, x) => sent(st).find((r) => r.destination === x.name) || null;
  const arrives = (st, x) => alerts(st).filter((e) => (e.destinations || []).includes(x.name));

  /* alerts */
  const goesTo = (st, e) => dests(st).filter((x) => (e.destinations || []).includes(x.name));
  const alertRoute = (e) => `notifications/events/${enc(e.id)}`;
  const alertOf = (ctx) => alerts(ctx.st).find((e) => e.id === (ctx.params || {}).id) || null;
  const LEVELS = ['Low', 'Normal', 'Urgent'];
  const levelMeans = (st, p) => ((X(st).priorities || []).find((x) => x && x.value === p) || {}).meta || ({ Low: 'Waits for quiet hours to end', Normal: 'Arrives right away', Urgent: 'Gets through quiet hours' })[p] || '';
  const resultSay = (r) => (/deliver/i.test(r) ? 'delivered' : /retry/i.test(r) ? 'not delivered yet, still trying' : low(r));
  const tookSay = (v) => (!v ? '' : /^\d/.test(String(v)) ? `took ${v}` : /timeout/i.test(String(v)) ? 'timed out' : low(v));
  const resultTone = (r) => (/deliver/i.test(r) ? 'ready' : /retry|wait/i.test(r) ? 'attention' : /fail|drop/i.test(r) ? 'blocked' : 'off');
  /* where the thing an alert is about is set up, when a page of this concept owns it */
  const ABOUT = {
    'approval-required': ['What needs your OK, and where the question appears: Safety & permissions › When it asks you', 'safety/asking'],
    'agent-blocked': ['What a Goal does when it is stuck: Planning & goals › When something goes wrong', 'planning/recovery'],
    'goal-completed': ['How a Goal works: Planning & goals › Goals', 'planning/goals'],
    'provider-usage-exhausted': ['What happens when an account runs out: AI providers', 'ai/limits'],
    'backup-failed': ['Your backups: Backups & history', 'keeping'],
    'update-available': ['New versions: Health & updates › Updates', 'system/updates']
  };

  /* agents: PMConcept7 stores "what happens if nobody responds" as one sentence; read it the way the manager does */
  const followUp = (st, g) => {
    const m = /^(.*) after (\d+ minutes?)$/.exec(String(g.escalation || 'None')); if (!m) return null;
    if (/^repeat/i.test(m[1])) return { repeat: true, after: m[2] };
    const all = dests(st); const x = all.find((y) => y.name === m[1]) || all.find((y) => y.name.toLowerCase().includes(m[1].toLowerCase()));
    return x ? { to: x.name, after: m[2] } : null;
  };
  const followWords = (st, g) => { const p = followUp(st, g); return !p ? 'if nobody responds, nothing more happens' : p.repeat ? `if nobody responds, the alert repeats after ${p.after}` : `if nobody responds, it also goes to ${p.to} after ${p.after}`; };
  const watches = (st, g) => { const have = alerts(st).map((e) => e.name); const all = g.events || []; return { known: all.filter((n) => have.includes(n)), unknown: all.filter((n) => !have.includes(n)) }; };

  /* sounds */
  const builtInSound = (s) => /^Built-in/.test(String(s.source || ''));
  const appSound = (s) => !!(s && s.o55 && typeof s.o55 === 'object' && s.o55.kit);
  const appReady = () => { const p = W.O55 && W.O55.sound; return !!p && (typeof p.preview === 'function' || typeof p.renderBuffer === 'function'); };
  /* A sound of your own plays only while its file is attached in this window. PMConcept7 keeps that to itself, so the
     attaching is noted here as it happens (below); the engine marks an attached file by the source "Custom upload". */
  const hasFile = (s) => !!SMX.local.flags['nt:file:' + s.id] && s.source === 'Custom upload';
  const playable = (s) => (appSound(s) ? appReady() : builtInSound(s) || hasFile(s));
  const styleOf = (st, s) => (builtInSound(s) ? (s.style || (X(st).builtinStyles || {})[s.id] || 'Chimes') : 'Yours');
  const STYLES = (st) => [...(X(st).soundStyles || ['Chimes', 'Pings', 'Alerts', 'Soft', 'Playful', 'Retro']).filter((x) => x !== 'Setup & tour' && x !== 'NieR'), 'Yours'];
  const STYLE_ONE = { Chimes: 'chime', Pings: 'ping', Alerts: 'alarm tone', Soft: 'soft sound', Playful: 'playful sound', Retro: 'retro sound' };
  const STYLE_NAME = { Alerts: 'Alarms', Yours: 'Your own' };   /* "Alerts" is also what the sounds are for */
  const styleName = (x) => STYLE_NAME[x] || x;
  const secsOf = (v) => { const m = /^(?:(\d+):)?(\d+(?:\.\d+)?)$/.exec(String(v || '').trim()); return m ? Number(m[1] || 0) * 60 + Number(m[2]) : 0; };
  const lengthOf = (s) => { const n = secsOf(s.duration); return !n ? '' : n >= 60 ? `${Math.floor(n / 60)} min ${Math.round(n % 60)} s` : `${Number(n.toFixed(1))} s`; };
  const librarySounds = (st) => allSounds(st).filter((s) => !appSound(s));
  const usedBy = (st, s) => alerts(st).filter((e) => e.sound === s.name);
  const soundOf = (st, e) => (e.sound && e.sound !== 'None' ? allSounds(st).find((s) => s.name === e.sound) || null : null);
  const soundRoute = (s) => `notifications/sounds/${enc(s.id)}`;
  const soundAt = (ctx) => allSounds(ctx.st).find((s) => s.id === (ctx.params || {}).id) || null;
  const LOOK = { basic: 'Basic', friendly: 'Friendly', glass: 'Glass', retro: 'Retro', nier: 'NieR' };
  const lookName = (k) => LOOK[k] || String(k).charAt(0).toUpperCase() + String(k).slice(1);
  const shortName = (s) => { const pre = `${lookName(s.o55.kit)} · `; const n = String(s.name || ''); return n.startsWith(pre) && n.length > pre.length ? n.slice(pre.length) : n; };
  const moment = (s) => { let t = null; try { t = W.O55 && typeof W.O55.tx === 'function' ? W.O55.tx('soundLibrary.moments.' + s.o55.event) : null; } catch (e) { t = null; } return typeof t === 'string' && t.trim() ? t.trim() : String(s.o55.about || ''); };
  /* the choices of a sound list, as the manager builds them: no sound, the library by kind, your own */
  const soundOptions = (st, current) => {
    const order = STYLES(st);
    const rows = allSounds(st).filter((s) => !appSound(s) || s.name === current).map((s) => ({ value: s.name, label: s.name, group: builtInSound(s) && !appSound(s) ? styleName(styleOf(st, s)) : appSound(s) ? 'Setup and tour' : 'Your own', meta: playable(s) ? lengthOf(s) : appSound(s) ? 'Cannot play here' : 'File missing', rank: appSound(s) ? 98 : order.indexOf(styleOf(st, s)) }));
    rows.sort((a, b) => a.rank - b.rank);
    if (current && current !== 'None' && !allSounds(st).some((s) => s.name === current)) rows.push({ value: current, label: current, group: 'Your own', meta: 'File missing' });
    return [{ value: 'None', label: 'No sound', group: 'No sound' }, ...rows];
  };
  /* PMConcept7's own play button (its markup, so the engine keeps "Play" and "Stop" in step while a sound plays) */
  const playBtn = (st, s, o = {}) => {
    const playing = !!s && st.soundPlaying === s.id;
    const why = !s ? 'Choose a sound first.' : playable(s) ? '' : appSound(s) ? 'The player for the sounds of setup and the tour did not load on this page, so this sound cannot play here.' : 'Its file is missing. Attach the file again to hear it.';
    const name = s ? s.name : 'sound'; const aria = `${playing ? 'Stop' : 'Play'} ${name} preview`;
    return `<button type="button" class="${o.labelled ? 'btn small pm51-btn' : 'icon-btn'} pm51-sound-inline-play${playing ? ' is-playing' : ''}" data-action="play-sound" data-id="${h(s ? s.id : '')}" data-sound="${h(name)}" data-smx-key="play-${h(o.key || '')}${h(s ? s.id : '')}" aria-pressed="${playing ? 'true' : 'false'}" aria-label="${h(aria)}" data-pm-hover-label="${h(aria)}" data-pm-hover-detail="${h(why || (playing ? 'Stop this sound.' : 'Hear this sound here. Nothing is sent.'))}"${why ? ` aria-disabled="true" data-disabled-reason="${h(why)}"` : ''}>${SMX.icon(playing ? 'volume' : 'play')}${o.labelled ? `<span>${playing ? 'Stop' : 'Play'}</span>` : ''}</button>`;
  };

  /* ------------------------------------------------------------------ running PMConcept7's own menu items
     "Edit", "Turn off" and "Remove" of a destination, and "Rename" and "Remove" of a sound, exist only as items of a
     menu. A button here opens that menu at itself and chooses the item, so what follows (the dialog, the question, the
     clean-up) is PMConcept7's own. The menu is not shown for that moment (notifications.css). */
  const pickMenu = (text) => { const pop = DOC.querySelector('.pm51-popout.pm51-menu'); const it = pop ? [...pop.querySelectorAll('.pm51-menu-item')].find((b) => ((b.querySelector('.pm51-popout-label') || b).textContent || '').trim() === text) : null; if (it) it.click(); return !!it; };
  const pickSoon = async (text) => { for (let i = 0; i < 16; i++) { if (pickMenu(text)) return true; await SMX.wait(60); } return false; };
  const unseen = async (f) => { const H = DOC.documentElement; H.classList.add('smx-nt-picking'); try { return await f(); } finally { W.setTimeout(() => H.classList.remove('smx-nt-picking'), 300); } };
  const destMenu = (id) => Object.assign({}, NOTIF, { tab: 'destinations', select: { action: 'pm51-select', data: { manager: 'notifications', id } }, find: (b) => [...b.querySelectorAll('.pm51-detail-actions button, .pm51-detail button')].find((x) => /^More actions$/.test((x.getAttribute('aria-label') || x.textContent || '').trim())) });
  const viaDestMenu = (name, item) => {
    SMX.warmers[name] = (el) => destMenu(el.getAttribute('data-id'));
    SMX.act(name, (el) => unseen(async () => { const ok = await SMX.borrow(el, destMenu(el.getAttribute('data-id'))); if (ok && !(await pickSoon(item))) { try { kit().closePopouts(); } catch (e) { /* nothing open */ } } }));
  };
  viaDestMenu('notif-dest-edit', 'Edit'); viaDestMenu('notif-dest-pause', 'Turn off'); viaDestMenu('notif-dest-remove', 'Remove');
  /* the sound menu has an action name, so it opens at the pressed button without leaving this page */
  const lendClick = (el, action, data) => {
    const keep = {}; for (const a of [...el.attributes]) if (a.name.startsWith('data-')) { keep[a.name] = a.value; el.removeAttribute(a.name); }
    el.setAttribute('data-action', action); for (const [k, v] of Object.entries(data || {})) el.setAttribute('data-' + k, v); el.setAttribute('data-smx-borrowed', '1');
    el.dispatchEvent(new W.MouseEvent('click', { bubbles: true, cancelable: true, view: W }));
    for (const a of [...el.attributes]) if (a.name.startsWith('data-')) el.removeAttribute(a.name);
    for (const [k, v] of Object.entries(keep)) el.setAttribute(k, v);
  };
  const viaSoundMenu = (name, item) => SMX.act(name, (el) => unseen(async () => { lendClick(el, 'pm51-notifications-sound-menu', { id: el.getAttribute('data-id') }); if (!(await pickSoon(item))) { try { kit().closePopouts(); } catch (e) { /* nothing open */ } } }));
  viaSoundMenu('notif-sound-rename', 'Rename'); viaSoundMenu('notif-sound-remove', 'Remove');

  /* Attaching a file. PMConcept7's dialog ("Add sound to library", "Edit <name>") holds the file in this window only
     and tells nobody, so a sound added or edited from these pages is watched: once a file was chosen and the dialog
     saved, its page stops saying "File missing".
     Saving that dialog also sends the engine to its own Sounds tab. The framework keeps the person on the page they
     were on: these pages stand for that manager, and what its hidden page names while it is sent Home again is not
     followed (smx-core.js, onTheWayHome). */
  let watch = null;
  const watchSounds = (id) => { const st = SMX.st(); watch = { id: id || '', ids: allSounds(st).map((x) => x.id), picked: false, saved: 0, at: Date.now() }; };
  DOC.addEventListener('change', (e) => { const t = e.target; if (watch && t && t.matches && t.matches('#pm-settings-portals input[type="file"]')) watch.picked = !!(t.files && t.files.length); }, true);
  DOC.addEventListener('click', (e) => {
    const b = watch && e.target && e.target.closest ? e.target.closest('#pm-settings-portals .btn.primary') : null;
    const form = b ? b.closest('form, .dialog, [role="dialog"]') : null; if (!form || !form.querySelector('input[type="file"]')) return;   // only the dialog that takes a sound file
    if (watch.picked) watch.saved = Date.now();
    SMX.soon(60);                                    // after the dialog's own save, which runs with this click
  }, true);
  const noteFiles = (st) => {
    if (!watch) return;
    if (!watch.saved) { if (Date.now() - watch.at > 600000) watch = null; return; }
    if (Date.now() - watch.saved < 120) { SMX.soon(160); return; }
    const got = watch.id ? allSounds(st).filter((x) => x.id === watch.id) : allSounds(st).filter((x) => !watch.ids.includes(x.id));
    for (const x of got) if (x.source === 'Custom upload') SMX.local.flags['nt:file:' + x.id] = true;
    watch = null; SMX.soon(20);
  };
  SMX.act('notif-sound-add', (el) => { watchSounds(''); lendClick(el, 'pm51-notifications-add-sound', {}); });
  SMX.act('notif-sound-file', (el) => { watchSounds(el.getAttribute('data-id')); lendClick(el, 'replace-sound', { id: el.getAttribute('data-id') }); });

  /* ------------------------------------------------------------------ what needs you (this chapter, and Settings Home) */
  const needs = (st) => {
    const out = []; noteFiles(st);
    if (!isOn(MASTER)) return out;
    for (const x of dests(st)) {
      const test = { label: 'Send a test', action: 'pm51-notifications-test', data: { dest: x.id } }, open = { label: 'Open', go: destRoute(x) };
      if (x.status === 'attention') { const r = lastSent(st, x); out.push({ title: `${x.name} is not getting through`, detail: r && !/deliver/i.test(r.result) ? `The last alert sent there, ${r.event} (${when(r.time)}), did not arrive${/retry/i.test(r.result) ? ' and is being tried again' : ''}.` : 'Alerts sent there may not arrive.', fix: test, also: open }); }
      else if (x.status === 'setup') out.push({ tone: 'info', title: `${x.name} has not been tested yet`, detail: 'It is saved. A test shows whether an alert arrives.', fix: test, also: open });
    }
    for (const e of alerts(st)) {
      if (!e.enabled) continue;
      const to = goesTo(st, e); const fix = { label: 'Choose where it goes', go: 'notifications/events', anchor: 'table' };
      if (!to.length) out.push({ title: `“${e.name}” has nowhere to go`, detail: 'It is switched on, but no destination is ticked for it.', fix });
      else if (!to.some((x) => x.status === 'active')) out.push({ title: `“${e.name}” cannot reach you right now`, detail: `It only goes to ${listOf(to.map((x) => x.name))}, which ${to.length === 1 ? 'is' : 'are'} paused or not getting through.`, fix });
    }
    for (const s of librarySounds(st)) {
      if (playable(s)) continue;
      const used = usedBy(st, s).filter((e) => e.enabled);
      out.push({ tone: used.length ? 'attention' : 'info', title: `The sound “${s.name}” has lost its file`, detail: used.length ? `${listOf(used.map((e) => e.name))} will be silent until the file is attached again.` : 'It cannot play until the file is attached again. No alert uses it now.', fix: { label: 'Attach the file again', do: 'notif-sound-file', data: { id: s.id } }, also: { label: 'Open', go: soundRoute(s) } });
    }
    return out;
  };
  (SMX.needSources = SMX.needSources || []).push(Object.assign((st) => needs(st), { chapter: 'notifications' }));
  const chapter = SMX.chapters.find((c) => c.id === 'notifications');
  if (chapter && !chapter.status) chapter.status = (ctx) => { const n = needs(ctx.st).filter((x) => x.tone !== 'info').length; const on = alerts(ctx.st).filter((e) => e.enabled).length; return !isOn(MASTER) ? { tone: 'off', text: 'Off' } : n ? { tone: 'attention', text: n === 1 ? '1 needs you' : `${n} need you` } : { tone: 'ready', text: `${plural(on, 'alert')} on` }; };

  /* ------------------------------------------------------------------ quiet hours, in numbers and in words */
  const mins = (t) => { const m = /^(\d+):(\d+)\s*(AM|PM)$/i.exec(String(t || '').trim()); return m ? ((Number(m[1]) % 12) + (/pm/i.test(m[3]) ? 12 : 0)) * 60 + Number(m[2]) : 0; };
  const span = (q) => { const a = mins(q.start), b = mins(q.end); return { a, b, len: (b - a + 1440) % 1440, overnight: b < a, same: a === b }; };
  const lengthWords = (n) => { const hh = Math.floor(n / 60), mm = n % 60; return [hh ? plural(hh, 'hour') : '', mm ? `${mm} minutes` : ''].filter(Boolean).join(' '); };
  const quietDays = (q) => (q.weekends === 'Quiet all weekend' ? ' on weekdays, and all of Saturday and Sunday' : q.weekends === 'No quiet hours on weekends' ? ' on weekdays; Saturday and Sunday have none' : ', every day');
  const quietSay = (st) => { const q = quiet(st); if (!q.enabled) return 'Quiet hours are off: alerts arrive at any time.'; const s = span(q); return s.same ? `Quiet hours start and end at ${ui.b(clock(q.start))}, so no time is quiet.` : `Quiet from ${ui.b(clock(q.start))} to ${ui.b(clock(q.end))}${h(quietDays(q))}.`; };
  const through = (st) => { const by = { hold: [], urgent: [], always: [] }; for (const x of dests(st)) by[quietOf(st, x)].push(x); return by; };

  /* ================================================================== Where alerts go (the chapter's first page) */
  /* a flow that makes a destination or an alert ends here: go to what it made */
  const followNew = (st) => {
    const now = { d: dests(st).map((x) => x.id), e: alerts(st).map((x) => x.id) }; const was = SMX.local.flags['nt:seen']; SMX.local.flags['nt:seen'] = now;
    if (!was || SMX.route !== 'notifications') return;
    const nd = now.d.filter((id) => !was.d.includes(id)), ne = now.e.filter((id) => !was.e.includes(id));
    if (nd.length === 1 && ((st.pm51 || {}).sel || {}).notifications === nd[0]) W.setTimeout(() => SMX.go(`notifications/destination/${enc(nd[0])}`), 0);
    else if (ne.length === 1 && !nd.length) W.setTimeout(() => SMX.go('notifications/events', { anchor: 'table' }), 0);
  };
  const destThing = (st, x) => {
    const k = kind(x), s = dStatus(x); const got = arrives(st, x).filter((e) => e.enabled); const r = lastSent(st, x);
    return { icon: k.icon, name: x.name, tag: k.name === x.name ? '' : k.name, sub: got.length ? `${plural(got.length, 'alert')} ${got.length === 1 ? 'arrives' : 'arrive'} here: ${listOf(got.map((e) => e.name))}` : 'No alert is sent here yet', sub2: r ? `Last alert ${when(r.time)}: ${resultSay(r.result)}` : 'Nothing sent here yet', status: s, go: destRoute(x),
      side: x.status === 'disabled' ? ui.btn({ label: 'Resume', icon: 'play', action: 'pm51-notifications-dest-on', data: { dest: x.id } }) : ui.btn({ label: 'Send a test', icon: 'bell', action: 'pm51-notifications-test', data: { dest: x.id } }) };
  };
  const overview = SMX.extend('notifications', {
    purpose: 'Puppet Master can tell you when work finishes, gets stuck or needs your answer. A destination is a place an alert can reach you: this app, this device, a chat app or your phone.',
    keywords: ['alerts', 'notify', 'destination', 'phone', 'ntfy', 'slack', 'discord', 'telegram', 'pushover', 'webhook', 'tray', 'pop-up', 'banner'],
    lead: (ctx) => {
      const st = ctx.st; prime(st); followNew(st);
      const on = isOn(MASTER); const all = alerts(st), live = all.filter((e) => e.enabled); const nd = needs(st);
      const used = dests(st).filter((x) => live.some((e) => (e.destinations || []).includes(x.name)));
      const good = used.filter((x) => x.status === 'active'), bad = dests(st).filter((x) => x.status !== 'active');
      const badSay = bad.map((x) => `${ui.word(x.name, { go: destRoute(x) })} ${x.status === 'disabled' ? 'is paused' : x.status === 'attention' ? 'needs attention' : 'has not been tested yet'}`);
      const q = quiet(st), by = through(st);
      const master = `<span class="smx-nt-switch" data-smx-covers="${MASTER}"><span>Notifications</span>${ui.toggle(MASTER, { label: 'Notifications' })}</span>`;
      return [
        { key: 'summary', html: ui.summary({ icon: 'bell', tone: !on ? 'off' : nd.some((n) => n.tone !== 'info') ? 'attention' : 'ready', side: master, lines: on ? [
          `You are told about ${ui.word(plural(live.length, 'thing'), { go: 'notifications/events' })}${good.length ? `. They reach you through ${listOf(good.map((x) => ui.word(x.name, { go: destRoute(x) })))}` : '. No working destination gets them'}${badSay.length ? `; ${listOf(badSay)}` : ''}.`,
          `${q.enabled && !span(q).same ? `${ui.word('Quiet hours', { go: 'notifications/quiet' })} run from ${h(clock(q.start))} to ${h(clock(q.end))}${by.urgent.length + by.always.length ? '; urgent alerts still get through' : '; nothing gets through until they end'}.` : `${ui.word('Quiet hours', { go: 'notifications/quiet' })} are off.`} ${ui.word(isOn(SFX) ? 'Sounds are on' : 'Sounds are off', { go: 'notifications/sounds' })}.`
        ] : ['Notifications are off. Nothing alerts you, and you look in the app yourself.', 'Everything below is kept for when you turn them back on.'] }) },
        { key: 'needs', html: ui.needs(nd) },
        { key: 'things', html: `<div data-smx-covers="general.interaction.notification-destinations">` + ui.things({ title: 'Your destinations', help: 'Where an alert can reach you. Open one to see what arrives there, or add one for your phone, Slack, Discord, Telegram or a web address.', anchor: 'destinations', add: { label: 'Add a destination', action: 'pm51-notifications-add-dest' }, items: dests(st).map((x) => destThing(st, x)),
          empty: { icon: 'bell', title: 'No destinations yet', text: 'Add one so alerts have somewhere to go.', fix: { label: 'Add a destination', action: 'pm51-notifications-add-dest' } } }) + '</div>' },
        { key: 'tasks', html: ui.tasks([
          { icon: 'plus', title: 'Be told about something more', sub: 'Pick from what Puppet Master can report, or an alert of your own', action: 'pm51-notifications-add-event' },
          { icon: 'moon', title: 'Set quiet hours', sub: q.enabled ? 'Change when alerts wait, and what still gets through' : 'Times when only urgent alerts get through', go: 'notifications/quiet' },
          { icon: 'volume', title: 'Hear and change the sounds', sub: 'What each alert sounds like, how loud, and your own sounds', go: 'notifications/sounds' }
        ], { title: 'What do you want to do?', cols: 3 }) }
      ];
    },
    sections: [{ key: 'show', title: 'How alerts show up', help: 'For the two destinations that are part of Puppet Master itself.', ids: [METHOD, TRAY] }],
    tail: () => [{ key: 'links', html: ui.links([
      { label: 'Check every destination', action: 'pm51-notifications-diagnostics' }, { label: 'How notifications work', action: 'pm51-notifications-help' }, { label: 'Pair a phone or another device', go: 'computers/devices' }, { label: 'Put the example notifications back', action: 'pm51-notifications-reset' }
    ]) }],
    covers: { 'general.interaction.notification-destinations': 'The list “Your destinations” on this page.' },
    changes: [
      { was: 'Notifications & Sounds is five tabs (Destinations, Events, Sounds, Quiet hours, History). The switch “Notifications” is drawn at the top of all five, and the same three links (“How notifications work”, “Check every destination”, “Reset notification defaults”) at the foot of all five.', now: 'A chapter of five pages. The switch is here once, beside two sentences that say what you are told about and how it reaches you. The three links are here once, at the foot.' },
      { was: 'The first tab opens on four destinations beside the detail of the first. “Phone alerts” reads “Needs attention” in the list, with nothing saying what is wrong or what to do; the reason (“The ntfy destination timed out and is retrying”) is on Settings Home.', now: '“Needs you” says which destination is not getting through and since when, and offers “Send a test”. It also lists an alert that has nowhere to go and a sound whose file is missing, each with the one button that deals with it. The lines that matter are on Settings Home too.' },
      { was: 'A destination’s detail carries seven switches, “Alerts that arrive here”, which are the same choice as each alert’s destinations on the Events tab (28 switches for four destinations). One reads “Update available — Low · this alert is off” beside a switch that is on.', now: 'One table, on “What you are told about”, is the only place an alert is sent anywhere. A destination says here how many alerts arrive; its page lists them and says which are switched off.' },
      { was: '“Pop-up style” is inside the detail of the destination “In-app”, and “Only important events” inside “System notifications”, although each changes every alert shown there.', now: 'Both are on this page under “How alerts show up”, worded for where they apply.' },
      { was: 'A destination that was just added reads “Not set up”, while the message that confirms it says it “is saved. Send a test to make sure it works.”', now: 'It reads “Not tested yet”; “Needs you” offers the test, and the page of the new destination opens by itself.' },
      'Wording: PMConcept7 says “Turn off” for a destination and shows it as “Off”. Here it is “Pause” and “Paused”, because its address and its alerts are kept.'
    ]
  });
  if (overview && overview.covers) { delete overview.covers[METHOD]; delete overview.covers[TRAY]; }
  SMX.reword({
    [METHOD]: { label: 'In this app, an alert appears as', help: 'A small pop-up, a banner across the top, or this device’s notification area instead.' },
    [TRAY]: { label: 'On this device, only important alerts', help: 'This device’s own notifications show approvals, finished runs, failures and rate limits, and nothing else.' },
    [SFX]: { help: 'Short sounds when you send a message, when the answer arrives, and for approvals, finished work and errors. The speaker button at the top of a chat turns them off in one click.' }
  });

  /* ================================================================== one destination */
  SMX.page({
    id: 'notifications/destination/:id', chapter: 'notifications', parent: 'notifications',
    title: (ctx) => { const x = destOf(ctx); return x ? x.name : 'Destination'; },
    nav: (ctx) => { const x = destOf(ctx); return x ? x.name : 'Destination'; },
    purpose: (ctx) => { const x = destOf(ctx); return x ? kind(x).about : ''; },
    legacy: [['general', 'notifications', 'destinations', 'notifications']],
    // "Send a test" stays at the top of the page; while the destination is paused it says why it cannot be used, and
    // "Resume" is once on the page, among its actions (it was there twice, and the test was gone; review R2-9)
    headSide: (ctx) => { const x = destOf(ctx); if (!x) return ''; const paused = x.status === 'disabled'; return ui.btn({ label: 'Send a test', icon: 'bell', primary: !paused, action: 'pm51-notifications-test', data: { dest: x.id }, disabled: paused, reason: 'It is paused, so nothing is sent to it. Resume it first.' }); },
    lead: (ctx) => {
      const st = ctx.st, x = destOf(ctx); prime(st);
      if (!x) return [{ key: 'gone', html: ui.card({ title: 'This destination is no longer in your list', body: ui.btn({ label: 'Back to your destinations', go: 'notifications' }) }) }];
      const k = kind(x), s = dStatus(x), r = lastSent(st, x), data = { dest: x.id };
      const all = arrives(st, x), on = all.filter((e) => e.enabled), off = all.filter((e) => !e.enabled);
      const ag = agents(st).filter((g) => (g.destinations || []).includes(x.name));
      const q = quietOf(st, x);
      const say = x.status === 'active' ? 'is working' : x.status === 'attention' ? 'is not getting through' : x.status === 'disabled' ? 'is paused: nothing is sent here until you resume it' : 'is saved, and has not been tested yet';
      const rows = [
        { label: 'What it is', value: k.name },
        builtIn(x) ? { label: 'Where alerts appear', value: mask(x) } : { label: k.addr, help: `${k.addrHelp} Kept private on the computer that runs Puppet Master; only its ends are ever shown.`, value: mask(x), control: ui.btn({ label: 'Replace', icon: 'key', action: 'pm51-notifications-dest-address', data }) },
        kindKey(x) === 'app' ? { label: 'How an alert looks here', value: word(METHOD), control: ui.btn({ label: 'Change', go: 'notifications', reveal: METHOD }) } : null,
        kindKey(x) === 'system' ? { label: 'Only important alerts', help: 'Approvals, finished runs, failures and rate limits.', value: isOn(TRAY) ? 'On' : 'Off', control: ui.btn({ label: 'Change', go: 'notifications', reveal: TRAY }) } : null,
        { label: 'During quiet hours', help: 'Chosen for every destination in one list, under Quiet hours.', value: (QUIET.find((c) => c.value === q) || QUIET[0]).label, control: ui.btn({ label: 'Quiet hours', go: 'notifications/quiet', anchor: 'through' }) }
      ];
      const lately = sent(st).map((row, i) => [row, i]).filter(([row]) => row.destination === x.name);
      return [
        { key: 'summary', html: ui.summary({ icon: k.icon, tone: s.tone, lines: [`${ui.b(x.name)} ${h(say)}.`, r ? `The last alert sent here was ${ui.b(r.event)}, ${h(when(r.time))}: ${h(resultSay(r.result))}.` : 'Nothing has been sent here yet.'] }) },
        { key: 'needs', html: ui.needs(x.status === 'attention' ? [{ title: 'Alerts are not arriving here', detail: builtIn(x) ? 'A test shows what happens.' : `A test shows what happens. If the ${low(k.addr)} changed, replace it.`, fix: { label: 'Send a test', action: 'pm51-notifications-test', data }, also: builtIn(x) ? null : { label: `Replace the ${low(k.addr.replace(/^(Its|Your) /, ''))}`, action: 'pm51-notifications-dest-address', data } }] : x.status === 'setup' ? [{ tone: 'info', title: 'Not tested yet', detail: 'A test shows whether an alert arrives.', fix: { label: 'Send a test', action: 'pm51-notifications-test', data } }] : []) },
        { key: 'arrives', html: ui.card({ title: 'What arrives here', help: 'The same choice as the ticks in the table on “What you are told about”, seen from this destination. It is changed there.', side: ui.btn({ label: 'Change it in the table', icon: 'arrowRight', go: 'notifications/events', anchor: 'table' }), body:
          `<p class="smx-nt-say">${on.length ? `${ui.b(plural(on.length, 'alert'))} ${on.length === 1 ? 'arrives' : 'arrive'} here: ${listOf(on.map((e) => `${ui.word(e.name, { go: alertRoute(e) })}${e.priority === 'Urgent' ? ' (urgent)' : ''}`))}.` : 'No alert is sent here yet. Tick this destination for an alert in the table.'}</p>`
          + (off.length ? `<p class="smx-quiet-line">${listOf(off.map((e) => h(e.name)))} would arrive here too, but ${off.length === 1 ? 'that alert is' : 'those alerts are'} switched off.</p>` : '')
          + (ag.length ? `<p class="smx-quiet-line">${ag.length === 1 ? 'The agent' : 'The agents'} ${listOf(ag.map((g) => h(g.name)))} also ${ag.length === 1 ? 'sends' : 'send'} here when ${ag.length === 1 ? 'it follows' : 'they follow'} up on an alert.</p>` : '') }) },
        { key: 'about', html: ui.card({ title: 'About this destination', body: ui.rows(rows) }) },
        { key: 'lately', html: lately.length ? ui.things({ title: 'Sent here lately', items: lately.map(([row, i]) => ({ icon: 'history', name: row.event, sub: [row.time, tookSay(row.latency)].filter(Boolean).join(' · '), status: { text: row.result, tone: resultTone(row.result) }, action: 'pm51-notifications-history', data: { index: i } })) }) : '' },
        { key: 'actions', html: `<div class="smx-btn-row">${x.status === 'disabled' ? ui.btn({ label: 'Resume', icon: 'play', primary: true, action: 'pm51-notifications-dest-on', data }) : ui.btn({ label: 'Pause', icon: 'pause', do: 'notif-dest-pause', data: { id: x.id }, key: 'pause' })}${ui.btn({ label: 'Rename or change its kind…', icon: 'edit', do: 'notif-dest-edit', data: { id: x.id }, key: 'edit' })}${ui.btn({ label: 'Remove this destination…', icon: 'trash', danger: true, do: 'notif-dest-remove', data: { id: x.id }, key: 'remove' })}</div>` }
      ];
    },
    more: [{ key: 'message', count: 0, when: (ctx) => !!destOf(ctx), html: (ctx) => { const x = destOf(ctx); if (!x) return ''; const adv = x.advanced || {}; const dd = (key, list, label) => select(adv[key] || list[0], list, { action: 'pm51-notifications-dest-adv', data: { dest: x.id, key }, label }); return ui.card({ title: 'What is in the message', body: ui.rows([
      { label: 'What is left out', help: 'So a message sent outside Puppet Master does not carry more than it should.', control: dd('redaction', ['Hide file paths and secrets', 'Hide secrets only', 'Send everything'], 'What is left out') },
      builtIn(x) ? null : { label: 'How much it says', control: dd('payload', ['Standard', 'Compact', 'Full details'], 'Message format') }
    ]) }); } }],
    moreLabel: 'What is in the message', moreHelp: 'What is left out, and how much it says',
    expert: [{ key: 'delivery', count: 0, when: (ctx) => !!destOf(ctx), html: (ctx) => { const x = destOf(ctx); if (!x) return ''; const adv = x.advanced || {}; const dd = (key, list, label) => select(adv[key] || list[0], list, { action: 'pm51-notifications-dest-adv', data: { dest: x.id, key }, label }); return ui.card({ title: 'When the service does not answer', body: ui.rows(builtIn(x) ? [{ label: 'Trying again', value: 'Not needed. Alerts in this app never fail to arrive.' }] : [
      { label: 'Trying again', help: 'What happens when the service does not answer.', control: dd('retry', ['Retry 3 times, then give up', 'Retry once', 'Never retry'], 'Retry policy') },
      { label: 'At most this many', help: 'Stops a burst of alerts from flooding the service.', control: dd('rate', ['Up to 20 per minute', 'Up to 5 per minute', 'No limit'], 'Rate limit') }
    ]) }); } }],
    expertHelp: 'Trying again and a limit on bursts',
    changes: [
      { was: 'A destination is the right-hand pane of the Destinations tab: four facts, its seven alert switches and a folded “More options”. Edit, Turn off, Remove and Delivery history are items of a “More actions” menu.', now: 'A destination has a page. One sentence says whether alerts arrive; then what arrives there, its facts in everyday words, what was sent lately, and Pause, Rename and Remove as buttons. Each button runs PMConcept7’s own menu item.' },
      { was: 'The address is labelled “Webhook address”, “Topic”, “Chat id” or “User key”, with the line “Kept on your server. Only its ends are shown.”', now: '“Its web address”, “Topic”, “Chat number” or “Your Pushover key”, each with a line saying what it is, and that it is kept private on the computer that runs Puppet Master.' },
      { was: '“During quiet hours” is a list on every destination, one of three places that say what gets through.', now: 'The page says what this destination does in quiet hours and leads to the one list, under Quiet hours.' },
      { was: 'Retry policy, Rate limit, Message format and Redaction are one fold.', now: '“What is left out” and “How much it says” are under More options; trying again and the burst limit are under For experts.' },
      'The dialog that adds or edits a destination is PMConcept7’s own and keeps its words (“Webhook address, topic, or chat id”, “Kept on your server”); the concept rewords pages and rows, not PMConcept7’s dialogs.'
    ]
  });

  /* ================================================================== What you are told about: the one table */
  const tick = (on, e, x) => `<button type="button" class="smx-nt-check${on ? ' on' : ''}" role="switch" aria-checked="${on ? 'true' : 'false'}" data-action="pm51-notifications-event-dest" data-event="${h(e.id)}" data-dest="${h(x.id)}" data-smx-key="t-${h(e.id)}-${h(x.id)}" aria-label="${h(`Send ${e.name} to ${x.name}`)}" data-pm-hover-label="${h(`Send ${e.name} to ${x.name}`)}" data-pm-hover-detail="${on ? 'It goes there now. Press to stop.' : 'Press to send it there too.'}"><i aria-hidden="true">${SMX.icon('check')}</i><span>${h(x.name)}</span></button>`;
  const table = (st) => {
    const ds = dests(st), ev = alerts(st);
    const head = `<div class="smx-nt-tr smx-nt-th" role="row"><span role="columnheader" class="smx-nt-c-on">On</span><span role="columnheader" class="smx-nt-c-name">Alert</span><span class="smx-nt-dests" role="presentation">${ds.map((x) => { const s = dStatus(x); return `<span role="columnheader" class="smx-nt-c-dest"><button type="button" class="smx-nt-col" data-smx-go="${h(destRoute(x))}" title="${h(`${x.name}: ${s.text}`)}">${h(x.name)}</button>${x.status === 'active' ? '' : `<small>${h(s.text)}</small>`}</span>`; }).join('')}</span><span role="columnheader" class="smx-nt-c-sound">Sound</span></div>`;
    const row = (e) => {
      const s = soundOf(st, e); const lost = e.sound && e.sound !== 'None' && (!s || !playable(s));
      return `<div class="smx-nt-tr${e.enabled ? '' : ' is-off'}" role="row" data-nt-alert="${h(e.id)}">
        <span role="cell" class="smx-nt-c-on">${keyed(toggle(!!e.enabled, { action: 'pm51-notifications-event-toggle', data: { event: e.id }, label: `${e.name} alerts` }), 'on-' + e.id)}</span>
        <span role="cell" class="smx-nt-c-name"><button type="button" class="smx-nt-open" data-smx-go="${h(alertRoute(e))}"><span class="smx-nt-name">${h(e.name)}${e.priority === 'Urgent' || e.priority === 'Low' ? ` <span class="smx-thing-tag">${h(e.priority)}</span>` : ''}${e.custom ? ' <span class="smx-thing-tag">Your own</span>' : ''}</span><span class="smx-nt-desc">${h(e.enabled ? (e.description || '') : 'Switched off. Its ticks and sound are kept.')}</span></button></span>
        <span class="smx-nt-dests" role="presentation" data-label="Goes to">${ds.map((x) => `<span role="cell" class="smx-nt-c-dest">${tick((e.destinations || []).includes(x.name), e, x)}</span>`).join('')}</span>
        <span role="cell" class="smx-nt-c-sound"><span class="pm51-sound-pick">${keyed(select(e.sound || 'None', soundOptions(st, e.sound), { action: 'pm51-notifications-event-sound', data: { event: e.id }, label: `${e.name} sound` }), 'snd-' + e.id)}${playBtn(st, s, { key: 'row-' + e.id + '-' })}</span>${lost ? `<span class="smx-nt-lost">${ui.status('File missing', 'attention')}</span>` : ''}</span>
      </div>`;
    };
    return `<div class="smx-nt-table${ds.length > 5 ? ' is-stacked' : ''}" role="table" aria-label="What you are told about" style="--smx-nt-n:${ds.length || 1}">${head}${ev.map(row).join('')}</div>`;
  };
  const agentThing = (st, g) => {
    const w = watches(st, g); const to = (g.destinations || []);
    return { icon: 'users', name: g.name, sub: `Watches ${w.known.length ? listOf(w.known) : w.unknown.length ? 'nothing on your list' : 'no alert yet'}${w.unknown.length ? `${w.known.length ? ', and ' : ': it names '}${listOf(w.unknown)} (not ${w.unknown.length === 1 ? 'an alert' : 'alerts'} you have)` : ''}`, sub2: `Sends to ${to.length ? listOf(to) : 'nowhere yet'}; ${followWords(st, g)}`, status: { text: g.status === 'active' ? 'On' : 'Off', tone: g.status === 'active' ? 'ready' : 'off' }, action: 'pm51-notifications-group', data: { id: g.id } };
  };
  const SEV = G + 'notification-severity';
  const events = SMX.extend('notifications/events', {
    cls: 'is-wide',
    purpose: 'Each line is one kind of alert. This table is the one place where an alert is switched on, sent somewhere and given a sound.',
    keywords: ['events', 'alerts', 'goal finished', 'approval', 'failed', 'blocked', 'urgent', 'priority', 'agent', 'escalate', 'which sound'],
    blurb: (ctx) => { const a = alerts(ctx.st); const on = a.filter((e) => e.enabled); return `${on.length} of ${plural(a.length, 'alert')} on · ${on.filter((e) => e.priority === 'Urgent').length} urgent`; },
    status: (ctx) => { const n = needs(ctx.st).filter((x) => /nowhere|cannot reach/.test(x.title)).length; return n ? { text: `${n} cannot reach you`, tone: 'attention' } : { text: `${alerts(ctx.st).filter((e) => e.enabled).length} on`, tone: 'ready' }; },
    lead: (ctx) => {
      const st = ctx.st; prime(st);
      const all = alerts(st), on = all.filter((e) => e.enabled), urgent = on.filter((e) => e.priority === 'Urgent'), silent = on.filter((e) => !e.sound || e.sound === 'None');
      const sev = val(SEV); let order = []; try { order = (kit().setting(SEV).options || []).map(String); } catch (e) { order = []; }
      const levels = Array.isArray(sev) ? sev.slice().sort((a, b) => order.indexOf(String(a)) - order.indexOf(String(b))).map((v) => { try { return String(kit().valueLabel(SEV, v) || v); } catch (e) { return String(v); } }) : [];
      const stuck = needs(st).filter((n) => /nowhere|cannot reach/.test(n.title));
      const idle = agents(st).filter((g) => g.status === 'active' && !watches(st, g).known.length).map((g) => ({ tone: 'info', title: `${g.name} watches nothing on your list`, detail: watches(st, g).unknown.length ? `It names ${listOf(watches(st, g).unknown)}, which ${watches(st, g).unknown.length === 1 ? 'is not an alert' : 'are not alerts'} you have, so it never follows up.` : 'No alert is switched on for it yet, so it never follows up.', fix: { label: 'Open it', action: 'pm51-notifications-group', data: { id: g.id } } }));
      return [
        { key: 'summary', html: ui.summary({ icon: 'bell', tone: stuck.length ? 'attention' : 'ready', lines: [
          `${ui.b(`${on.length} of ${all.length}`)} alerts are on. ${urgent.length ? `${ui.b(String(urgent.length))} ${urgent.length === 1 ? 'is' : 'are'} urgent, and ${urgent.length === 1 ? 'gets' : 'get'} through ${ui.word('quiet hours', { go: 'notifications/quiet' })} wherever a destination lets urgent alerts through.` : 'None is urgent.'}`,
          `${silent.length ? `${ui.b(String(silent.length))} ${silent.length === 1 ? 'makes' : 'make'} no sound.` : 'Each makes a sound.'}${levels.length ? ` On top of the table, only the levels ${h(listOf(levels))} interrupt you: ${ui.word('a second filter', { go: 'notifications/events', reveal: SEV })}.` : ''}`
        ] }) },
        { key: 'needs', html: ui.needs(stuck.concat(idle)) },
        { key: 'table', html: `<div data-smx-covers="general.interaction.notification-mapping general.interaction.sound-mapping">` + ui.card({ anchor: 'table', cls: 'smx-nt-table-card', title: 'What you are told about', help: 'Switch an alert on, tick where it goes, pick its sound. Open an alert to say how urgent it is.', side: ui.btn({ label: 'Add an alert', icon: 'plus', action: 'pm51-notifications-add-event' }), body: all.length ? table(st) : `<div class="smx-empty">${SMX.icon('bell')}<div class="smx-empty-title">No alerts yet</div><div class="smx-empty-text">Add one to be told when something happens.</div>${ui.btn({ label: 'Add an alert', primary: true, action: 'pm51-notifications-add-event' })}</div>` }) + '</div>' },
        { key: 'agents', html: ui.things({ anchor: 'agents', title: 'If nobody responds', help: 'A notification agent is a follow-up rule, not an AI. It watches a few alerts and, when one gets no response, repeats it or sends it somewhere louder.', add: { label: 'Add an agent', action: 'pm51-notifications-add-agent' }, items: agents(st).map((g) => agentThing(st, g)),
          empty: { icon: 'users', title: 'No agents yet', text: 'Add one to send an important alert somewhere louder when nobody responds.', fix: { label: 'Add an agent', action: 'pm51-notifications-add-agent' } } }) }
      ];
    },
    sections: [],
    more: [
      S('notif-alerts', { title: 'Filters on top of the table', help: 'They apply to every alert: how serious one must be to interrupt you, how long a warning keeps repeating, and whether dismissing one asks for a reason.' }),
      { key: 'copy', count: 0, html: () => ui.card({ title: 'Take this table to another project', help: 'A file with the alerts, the names of their destinations and of their sounds. Addresses are never in it.', body: `<div class="smx-btn-row">${ui.btn({ label: 'Save the table to a file…', icon: 'download', action: 'pm51-notifications-export-events' })}${ui.btn({ label: 'Load a table from a file…', icon: 'upload', action: 'pm51-notifications-import-events' })}</div>` }) }
    ],
    moreHelp: 'A second filter, repeats, and saving the table to a file',
    tail: () => [{ key: 'links', html: ui.links([{ label: 'What the assistant asks you first, and where its question appears', go: 'safety/asking' }, { label: 'Being told quickly when a Goal is stuck', go: 'planning/goals' }]) }],
    covers: { 'general.interaction.notification-mapping': 'The ticks of the table on this page: where each alert goes.', 'general.interaction.sound-mapping': 'The Sound column of the table on this page.' },
    changes: [
      { was: 'The same seven alerts are set up from three sides: seven switches on each destination (“Alerts that arrive here”), the Events list (a switch, a list of 26 sounds and “Open” per alert), and “Event sounds” on the Sounds tab (the same seven lists of 26 again), plus “Use for events…” on each of 25 sound cards.', now: 'One table. Each line is an alert: on or off, a tick for each destination, and its sound with a play button. A destination’s page and the Sounds page show these choices from their side and lead back here.' },
      { was: 'An alert’s priority reads “Low”, “Normal” or “Urgent” on its row; what that changes (“Waits for quiet hours to end”, “Arrives right away”, “Gets through quiet hours”) is only inside the alert’s side panel.', now: 'An urgent alert is marked in the table, the page says in one sentence what urgent means, and the alert’s own page has the three levels with what each does.' },
      { was: '“Notification agents” uses the product’s word for an AI worker for what is a follow-up rule. Of the three example agents, one watches “Goal failed” and one watches “Usage exhausted” and “Authentication expired”, none of which is an alert on the list; the row counts them and the agent’s panel has no switch for them.', now: 'They are listed under “If nobody responds”, with a line saying an agent is a rule and not an AI. Each row says what the agent watches and marks a name that is not one of your alerts; an agent that watches nothing is listed under “Needs you”.' },
      { was: '“Alert me about” (five levels), “Stop repeating a warning after” and “Ask for a reason when I dismiss an alert” sit below the agents as “Which alerts reach you”: a third filter after each alert’s switch and its priority, which a newcomer has to scroll past the list to find.', now: 'The summary says which levels interrupt you and links to the rows, which are folded as “Filters on top of the table”.' }
    ]
  });
  const soundsPlan = SMX.pages.find((p) => p.id === 'notifications/sounds');
  if (soundsPlan && soundsPlan.covers) { delete soundsPlan.covers['general.interaction.sound-mapping']; delete soundsPlan.covers[SFX]; }
  SMX.reword({
    [SEV]: { label: 'How serious it must be to interrupt me' },
    [G + 'alert-quiet-window']: { label: 'Stop repeating a warning after' }
  });

  /* ================================================================== one alert */
  SMX.page({
    id: 'notifications/events/:id', chapter: 'notifications', parent: 'notifications/events',
    title: (ctx) => { const e = alertOf(ctx); return e ? e.name : 'Alert'; },
    nav: (ctx) => { const e = alertOf(ctx); return e ? e.name : 'Alert'; },
    purpose: (ctx) => { const e = alertOf(ctx); return e ? (e.custom ? `An alert of your own: ${low(e.description || 'your scripts raise it by its exact name.')}` : e.description || '') : ''; },
    legacy: [['general', 'notifications', 'events', 'notifications']],
    lead: (ctx) => {
      const st = ctx.st, e = alertOf(ctx); prime(st);
      if (!e) return [{ key: 'gone', html: ui.card({ title: 'This alert is no longer on your list', body: ui.btn({ label: 'Back to what you are told about', go: 'notifications/events' }) }) }];
      const data = { event: e.id }; const to = goesTo(st, e); const s = soundOf(st, e); const p = e.priority || 'Normal';
      const inTable = { go: 'notifications/events', anchor: 'table' };
      const mine = agents(st).filter((g) => (g.events || []).includes(e.name));
      const lately = sent(st).map((row, i) => [row, i]).filter(([row]) => row.event === e.name);
      const about = ABOUT[e.id];
      const nd = needs(st).filter((n) => n.title.includes(`“${e.name}”`));
      if (s && !playable(s) && e.enabled) nd.push({ title: 'Its sound cannot play', detail: `“${s.name}” has lost its file, so this alert is silent.`, fix: { label: 'Attach the file again', do: 'notif-sound-file', data: { id: s.id } }, also: { label: 'Pick another sound', go: 'notifications/events', anchor: 'table' } });
      return [
        { key: 'summary', html: ui.summary({ icon: 'bell', tone: !e.enabled ? 'off' : nd.length ? 'attention' : 'ready', lines: [
          `${ui.b(e.name)} is ${ui.word(e.enabled ? 'on' : 'off', inTable)}${e.enabled ? ` and ${ui.b(p.toLowerCase())}` : ''}. ${e.enabled ? '' : 'Nothing is sent for it. '}It ${e.enabled ? 'goes' : 'would go'} to ${to.length ? listOf(to.map((x) => ui.word(x.name, inTable))) : ui.word('nowhere yet', inTable)} and ${e.enabled ? 'plays' : 'would play'} ${ui.word(s ? s.name : e.sound && e.sound !== 'None' ? e.sound : 'no sound', inTable)}.`,
          'Whether it is on, where it goes and its sound are chosen in the table.'
        ], side: s ? playBtn(st, s, { labelled: true, key: 'alert-' }) : '' }) },
        { key: 'needs', html: ui.needs(nd) },
        { key: 'urgency', html: ui.card({ title: 'How urgent it is', help: 'Urgency decides what happens to this alert during quiet hours.', body: `<div class="smx-nt-seg">${seg(p, LEVELS, { action: 'pm51-notifications-event-priority', data, label: 'How urgent it is' })}</div>` + ui.facts(LEVELS.map((l) => [l === p ? `${l} (chosen)` : l, levelMeans(st, l)])) + `<p class="smx-sentence-note">Urgent alerts get through quiet hours when a destination allows it. ${ui.link({ label: 'What still gets through', go: 'notifications/quiet', anchor: 'through' })}</p>` }) },
        { key: 'agents', html: ui.things({ title: 'If nobody responds', help: mine.length ? 'The notification agents that watch this alert.' : '', items: mine.map((g) => agentThing(st, g)), empty: { icon: 'users', title: 'Nothing follows up on this alert', text: 'A notification agent can repeat it, or send it somewhere louder, when nobody responds. Agents are added on “What you are told about”.', fix: { label: 'See the agents', go: 'notifications/events', anchor: 'agents' } } }) },
        { key: 'lately', html: ui.things({ title: 'Sent lately', items: lately.map(([row, i]) => ({ icon: 'history', name: `To ${row.destination}`, sub: row.time, status: { text: row.result, tone: resultTone(row.result) }, action: 'pm51-notifications-history', data: { index: i } })), empty: { icon: 'history', title: 'Not sent lately', text: 'When this alert goes out, it is listed here and under Past alerts.' } }) },
        e.custom ? { key: 'own', html: ui.card({ title: 'Its name and when it happens', help: 'Scripts and automations raise this alert by its exact name.', body: ui.rows([
          { label: 'Name', control: input(steady('n:' + e.id, e.name, 'pm51-notifications-event-name'), { action: 'pm51-notifications-event-name', data, label: 'Alert name' }) },
          { label: 'When it happens', help: 'A note for you. It is shown under the name in the table.', control: input(steady('d:' + e.id, e.description || '', 'pm51-notifications-event-desc'), { action: 'pm51-notifications-event-desc', data, label: 'When it happens', placeholder: 'For example: raised by the nightly report script' }) }
        ]) + `<div class="smx-btn-row smx-pad">${ui.btn({ label: 'Remove this alert…', icon: 'trash', danger: true, action: 'pm51-notifications-event-remove', data })}</div>` }) } : null,
        about ? { key: 'links', html: ui.links([{ label: about[0], go: about[1] }]) } : null
      ].filter(Boolean);
    },
    changes: [
      { was: 'An alert opens as a side panel that repeats the row’s switch and sound and adds its destinations and its priority; only an alert of your own shows “Name”, “When it fires” and “Remove event”.', now: 'An alert has a page for what the table does not hold: how urgent it is and what each level does, which agents follow up on it, what was sent lately, and, for an alert of your own, its name and its removal. On, destinations and sound are said in one sentence whose words lead to the table.' },
      { was: 'Nothing connects an alert to the setting it is about: “Approval required” does not lead to where approvals are set, nor “Backup failed” to backups.', now: 'A link at the foot leads to the page that owns what the alert reports.' }
    ]
  });

  /* ================================================================== Sounds */
  const tile = (st, s, o = {}) => {
    const ok = playable(s); const used = usedBy(st, s); const app = appSound(s);
    const line = app ? [moment(s), lengthOf(s), used.length ? `Used by ${listOf(used.map((e) => e.name))}` : ''].filter(Boolean).join(' · ') : [lengthOf(s), used.length ? `Used by ${listOf(used.map((e) => e.name))}` : 'Not used yet'].filter(Boolean).join(' · ');
    return `<div class="smx-nt-tile${ok ? '' : ' is-missing'}">${playBtn(st, s, { key: (o.key || 'lib') + '-' })}<button type="button" class="smx-nt-tile-open" data-smx-go="${h(soundRoute(s))}"><span class="smx-nt-tile-name">${h(app ? shortName(s) : s.name)}${ok ? '' : ` ${ui.status(app ? 'Cannot play here' : 'File missing', 'attention')}`}</span><span class="smx-nt-tile-sub">${h(line)}</span></button></div>`;
  };
  SMX.act('notif-style', (el) => { SMX.local.flags['nt-style'] = el.getAttribute('data-style') || ''; });
  const tiles = (st, list, o) => `<div class="smx-nt-tiles">${list.map((s) => tile(st, s, o)).join('')}</div>`;
  const library = (st) => {
    const all = librarySounds(st); const mine = all.filter((s) => !builtInSound(s));
    const every = STYLES(st).map((style) => [style, all.filter((s) => styleOf(st, s) === style)]).filter(([, list]) => list.length);
    /* PMConcept7 has a style filter over its library (All | Chimes | Pings | …). The styles are headings here, so every
       sound is in sight at once; the filter is kept for showing one style only (review R2, D2-2). */
    const want = SMX.local.flags['nt-style'] || ''; const one = every.some(([style]) => style === want) ? want : '';
    const groups = one ? every.filter(([style]) => style === one) : every;
    const pick = every.length > 1 ? `<div class="segmented pm51-seg smx-nt-styles" role="group" aria-label="Show">${[['', 'All']].concat(every.map(([style]) => [style, styleName(style)])).map(([v, l]) => `<button type="button" class="${v === one ? 'active' : ''}" aria-pressed="${v === one}" data-smx-do="notif-style" data-style="${h(v)}" data-smx-key="nt-style-${h(v || 'all')}">${h(l)}</button>`).join('')}</div>` : '';
    return `<div data-smx-covers="general.interaction.sound-catalog general.interaction.sound-management">` + ui.card({ anchor: 'library', title: 'Sounds for alerts', help: `${plural(all.length - mine.length, 'sound')} ${all.length - mine.length === 1 ? 'comes' : 'come'} with Puppet Master${mine.length ? `, and ${mine.length} ${mine.length === 1 ? 'is' : 'are'} your own` : ''}. Press play to hear one; open it to rename it, or to use it for an alert.`,
      side: ui.btn({ label: 'Add a sound', icon: 'plus', do: 'notif-sound-add', key: 'add-sound' }),
      body: pick + (groups.map(([style, list]) => `<h4 class="smx-nt-group">${h(styleName(style))}</h4>${tiles(st, list)}`).join('') || '<p class="smx-quiet-line">No sounds yet. Add one of your own.</p>') }) + '</div>';
  };
  /* the sounds of setup and the Guided Tour (a set for each look), and of the NieR look: PMConcept7's own groups */
  const takes = (st, key) => { const t = (st.pm51 || {}).notifSoundTakes; return !!(t && typeof t === 'object' ? t[key] : t === true); };
  const appFold = (st, key) => {
    const all = allSounds(st).filter((s) => appSound(s) && (key === 'nier' ? s.o55.kit === 'nier' : s.o55.kit !== 'nier')); if (!all.length) return '';
    let list = all, head = '';
    if (key === 'setup') {
      const looks = ['basic', 'friendly', 'glass', 'retro'].filter((k) => all.some((s) => s.o55.kit === k)).concat([...new Set(all.map((s) => s.o55.kit))].filter((k) => !['basic', 'friendly', 'glass', 'retro'].includes(k)));
      const want = (st.pm51 || {}).notifSoundLook; const now = String(DOC.documentElement.getAttribute('data-theme') || '').split('-')[0];
      const look = looks.includes(want) ? want : looks.includes(now) ? now : looks[0];
      list = all.filter((s) => s.o55.kit === look);
      head = `<div class="smx-nt-seg">${seg(look, looks.map((k) => [k, `${lookName(k)} look`]), { action: 'pm51-notifications-sound-look', label: 'Which look' })}</div>`;
      head += `<p class="smx-quiet-line">${takeLine(st, list, key, `while setup and the Guided Tour use the ${lookName(look)} look`)}</p>`;
    } else head = `<p class="smx-quiet-line">${takeLine(st, list, key, 'in setup and the Guided Tour while the NieR look is on')}</p>`;
    const shown = takes(st, key) ? list : list.filter((s) => s.o55.featured !== false);
    return fold('notifications/sounds:' + key, key === 'nier' ? 'Sounds of the NieR look' : 'Sounds of setup and the Guided Tour', `${plural(all.length, 'sound')} · they follow “Play sounds” too`, head + tiles(st, shown, { key }));
  };
  const takeLine = (st, list, key, whenWords) => {
    const extra = list.filter((s) => s.o55.featured === false).length; const open = takes(st, key);
    if (!extra) return `These ${list.length} sounds play ${h(whenWords)}.`;
    return `All ${list.length} takes play ${h(whenWords)}; a moment that repeats is varied so it never sounds the same twice. ${open ? 'Every take is shown.' : `The main take of each of ${list.length - extra} moments is shown.`} ${ui.link({ label: open ? 'Show only the main take of each' : `Show ${extra} more ${extra === 1 ? 'take' : 'takes'}`, action: 'pm51-notifications-sound-takes', data: { group: key } })}`;
  };
  SMX.extend('notifications/sounds', {
    purpose: 'Whether Puppet Master makes sounds, how loud, and the sounds your alerts can use. Which sound an alert plays is chosen in the table on “What you are told about”.',
    keywords: ['sound', 'chime', 'volume', 'mute', 'upload sound', 'ringtone', 'play', 'pack', 'peonping'],
    blurb: (ctx) => { const on = alerts(ctx.st).filter((e) => e.enabled); return isOn(SFX) ? `Sounds are on at ${sset(ctx.st).volume}% · ${on.filter((e) => e.sound && e.sound !== 'None').length} of ${plural(on.length, 'alert')} make a sound` : 'Sounds are off'; },
    status: (ctx) => { const lost = librarySounds(ctx.st).filter((s) => !playable(s) && usedBy(ctx.st, s).some((e) => e.enabled)).length; return lost ? { text: 'A sound cannot play', tone: 'attention' } : isOn(SFX) ? { text: 'On', tone: 'ready' } : { text: 'Off', tone: 'off' }; },
    lead: (ctx) => {
      const st = ctx.st; prime(st); noteFiles(st);
      const on = isOn(SFX), v = sset(st); const live = alerts(st).filter((e) => e.enabled); const loud = live.filter((e) => e.sound && e.sound !== 'None');
      const nd = needs(st).filter((n) => /^The sound/.test(n.title));
      return [
        { key: 'summary', html: ui.summary({ icon: 'volume', tone: !on ? 'off' : nd.some((n) => n.tone !== 'info') ? 'attention' : 'ready', lines: on ? [
          `Sounds are ${ui.word('on', { go: 'notifications/sounds', reveal: SFX })} at ${ui.b(`${v.volume}%`)} volume${v.whenFocused === false ? ', and only while you are in another window' : ''}.`,
          `${ui.b(`${loud.length} of ${live.length}`)} alerts that are on make a sound. Which one each plays is chosen in ${ui.word('the table', { go: 'notifications/events', anchor: 'table' })}.`
        ] : [`Sounds are ${ui.word('off', { go: 'notifications/sounds', reveal: SFX })}. Alerts still arrive, silently.`, 'The choices on this page are kept for when you turn sounds back on.'] }) },
        { key: 'needs', html: ui.needs(nd) }
      ];
    },
    sections: [
      { key: 'play', title: 'Whether sounds play', ids: [SFX] },
      { key: 'loud', html: (ctx) => { const v = sset(ctx.st); if (!N(ctx.st).soundSettings) return ui.card({ title: 'How loud, and when', body: ui.rows([{ label: 'Volume', value: `${v.volume}%` }]) }); return ui.card({ title: 'How loud, and when', body: ui.rows([
        { label: 'Volume', help: 'Used unless a sound has its own.', control: `<label class="o55-num"><input class="text-control" type="number" inputmode="numeric" min="0" max="100" step="5" value="${h(steady('vol', v.volume, 'pm51-notifications-volume'))}" data-action="pm51-notifications-volume" data-smx-key="volume" aria-label="Volume"><span class="o55-unit">%</span></label>` },
        { label: 'Also while I am using Puppet Master', help: 'Off plays sounds only while you are in another window.', control: keyed(toggle(v.whenFocused !== false, { action: 'pm51-notifications-when-focused', label: 'Also while I am using Puppet Master' }), 'focused') }
      ]) }); } },
      { key: 'now', html: (ctx) => { const st = ctx.st; const ev = alerts(st); return ui.card({ title: 'What your alerts sound like now', help: 'The same choice as the Sound column of the table on “What you are told about”, listed here so you can hear them one after another. It is changed there.', side: ui.btn({ label: 'Change a sound in the table', icon: 'arrowRight', go: 'notifications/events', anchor: 'table' }),
        body: ev.length ? ui.rows(ev.map((e) => { const s = soundOf(st, e); const lost = e.sound && e.sound !== 'None' && (!s || !playable(s)); return { label: e.name, help: e.enabled ? '' : 'This alert is switched off.', status: lost ? ui.status('File missing', 'attention') : '', value: s ? s.name : e.sound && e.sound !== 'None' ? e.sound : 'No sound', muted: !s, control: s ? playBtn(st, s, { key: 'now-' + e.id + '-' }) : '' }; })) : '<p class="smx-quiet-line">No alerts yet.</p>' }); } },
      { key: 'library', html: (ctx) => library(ctx.st) },
      { key: 'setup', html: (ctx) => appFold(ctx.st, 'setup') },
      { key: 'nier', html: (ctx) => appFold(ctx.st, 'nier') }
    ],
    more: [{ key: 'packs', count: 0, html: (ctx) => { const ps = packs(ctx.st); return ui.card({ title: 'Sound packs', help: 'A pack is a set of sounds in one file, in the format the PeonPing apps use.', side: ui.btn({ label: 'Bring in a pack', icon: 'download', action: 'import-peonping-pack' }),
      body: (ps.length ? ui.rows(ps.map((p) => ({ label: p.name, help: `${p.sounds} sounds · licence ${low(p.license || 'unknown')} · version ${p.version || '?'} · ${low(p.source || '')} · an example only, its sounds cannot play`, control: toggle(p.status === 'active', { action: 'pm51-notifications-pack-toggle', data: { id: p.id }, label: p.name }) }))) : '<p class="smx-quiet-line">No packs yet.</p>')
        + `<div class="smx-btn-row smx-pad">${ui.btn({ label: 'Save your sounds as a pack…', icon: 'download', action: 'pm51-notifications-export-pack' })}</div>` }); } }],
    moreLabel: 'Sound packs', moreHelp: 'Bring in a set of sounds, or save yours as one',
    tail: () => [{ key: 'links', html: ui.links([{ label: 'Pip’s own sounds: Look & feel › Customize Pip', go: 'look', reveal: 'general.visual.pip-parts' }, { label: 'The terminal’s bell: Look & feel › Terminal look', go: 'look/terminal', reveal: 'code.terminal.bell' }]) }],
    covers: { 'general.interaction.sound-catalog': 'The card “Sounds for alerts” and the two folds under it on this page.', 'general.interaction.sound-management': 'The button “Add a sound” on this page.' },
    changes: [
      { was: 'The Sounds tab is 2,886 px tall: 104 buttons, 7 dropdowns, 4 switches and 1 number box for 4 settings. “Event sounds” repeats each alert’s list of 26 sounds, and each of the 25 sound cards repeats “Play”, “Manage” and “Use for events…”.', now: 'What your alerts sound like now is one short list with a play button each; the choice itself is in the table. The library is tiles grouped by kind of sound: a tile plays the sound, and opens it.' },
      { was: 'The library’s heading reads “378 sounds are built in, in eight styles, all generated demonstration tones”. 354 of those are the sounds of setup, the Guided Tour and the NieR look, in two groups at the end of the list.', now: 'The 24 sounds meant for alerts, and your own, come first. The sounds of setup and the tour and of the NieR look are two folds that say what they are and that they follow “Play sounds”.' },
      { was: 'The library has a row of ten style choices (All, Chimes, Pings, Alerts, Soft, Playful, Retro, Setup & tour, NieR, Uploaded); the sounds of one style show only after choosing it.', now: 'The styles are headings, so every sound for alerts is in sight at once, and the same row of choices above them shows one style only. Setup & tour and NieR are their own folds below, because they are not sounds for alerts.' },
      { was: '“Team jingle” shows “File missing” on its card and a greyed play button. The way to mend it is “Replace file”, inside its “Manage” menu.', now: '“Needs you” says the sound has lost its file and offers “Attach the file again”; if an alert uses it, the line says which alert is silent meanwhile.' },
      { was: '“Volume” and “Also while you are using this app” have no line saying what they change beyond their label; “Sound packs” and “Licence details” are two sections for one example pack.', now: 'Volume and when sounds play are one card under the switch. Packs are one folded card: the pack with its licence, “Bring in a pack” and “Save your sounds as a pack”.' }
    ]
  });

  /* ================================================================== one sound */
  SMX.page({
    id: 'notifications/sounds/:id', chapter: 'notifications', parent: 'notifications/sounds',
    title: (ctx) => { const s = soundAt(ctx); return s ? s.name : 'Sound'; },
    nav: (ctx) => { const s = soundAt(ctx); return s ? s.name : 'Sound'; },
    purpose: (ctx) => { const s = soundAt(ctx); if (!s) return ''; return appSound(s) ? `${s.o55.kit === 'nier' ? 'One of the sounds of the NieR look.' : `One of the sounds of setup and the Guided Tour, in the ${lookName(s.o55.kit)} look.`} ${moment(s)}` : builtInSound(s) ? `A ${STYLE_ONE[styleOf(ctx.st, s)] || 'sound'} that comes with Puppet Master.` : 'A sound of your own.'; },
    legacy: [['general', 'notifications', 'sounds', 'notifications']],
    headSide: (ctx) => { const s = soundAt(ctx); return s ? playBtn(ctx.st, s, { labelled: true, key: 'head-' }) : ''; },
    lead: (ctx) => {
      const st = ctx.st, s = soundAt(ctx); prime(st); noteFiles(st);
      if (!s) return [{ key: 'gone', html: ui.card({ title: 'This sound is no longer in the library', body: ui.btn({ label: 'Back to Sounds', go: 'notifications/sounds' }) }) }];
      const ok = playable(s), used = usedBy(st, s), app = appSound(s), own = !builtInSound(s);
      return [
        { key: 'summary', html: ui.summary({ icon: 'volume', tone: ok ? 'ready' : 'attention', lines: [
          ok ? `${ui.b(s.name)} is ${h(lengthOf(s) ? `${lengthOf(s)} long` : 'ready to play')}.` : app ? `${ui.b(s.name)} cannot play on this page: the player for the sounds of setup and the tour did not load.` : `${ui.b(s.name)} has lost its file, so it cannot play.`,
          used.length ? `${listOf(used.map((e) => ui.word(e.name, { go: alertRoute(e) })))} ${used.length === 1 ? 'plays' : 'play'} it${ok ? '' : `, and ${used.length === 1 ? 'is' : 'are'} silent until the file is back`}.` : 'No alert uses it yet.'
        ] }) },
        { key: 'needs', html: ui.needs(!ok && !app ? [{ title: 'Its file is missing', detail: 'A sound of your own is kept as a file. Choose the file again and it plays.', fix: { label: 'Attach the file again', do: 'notif-sound-file', data: { id: s.id } } }] : []) },
        { key: 'used', html: ui.card({ title: 'Alerts that play it', help: 'The same choice as the Sound column of the table on “What you are told about”.', side: ui.btn({ label: 'Use it for an alert…', icon: 'bell', action: 'pm51-notifications-assign-open', data: { id: s.id } }),
          body: used.length ? `<div class="smx-things">${used.map((e) => `<div class="smx-thing is-clickable" role="button" tabindex="0" data-smx-go="${h(alertRoute(e))}"><span class="smx-thing-avatar">${SMX.icon('bell')}</span><span class="smx-thing-copy"><span class="smx-thing-name">${h(e.name)}</span><span class="smx-thing-sub">${h(e.enabled ? (e.description || '') : 'This alert is switched off.')}</span></span><span class="smx-thing-end"><span class="smx-thing-go">${SMX.icon('go')}</span></span></div>`).join('')}</div>` : '<p class="smx-quiet-line">None yet. “Use it for an alert” lets you pick the alerts that should play it.</p>' }) },
        { key: 'about', html: ui.card({ title: 'About this sound', body: ui.facts([
          ['Where it comes from', app ? (s.o55.kit === 'nier' ? 'The NieR look' : `Setup and the Guided Tour, ${lookName(s.o55.kit)} look`) : own ? 'You added it' : `Comes with Puppet Master · ${styleName(styleOf(st, s))}`],
          ['Length', lengthOf(s) || 'Not known'],
          own && s.format ? ['Kind of file', s.format] : null,
          ['Its own volume', `${Number.isFinite(Number(s.volume)) ? Number(s.volume) : 70}%`]
        ].filter(Boolean)) }) },
        { key: 'actions', html: `<div class="smx-btn-row">${ui.btn({ label: 'Rename…', icon: 'edit', do: 'notif-sound-rename', data: { id: s.id }, key: 'rename' })}${app ? '' : ui.btn({ label: !ok ? 'Attach the file again…' : own ? 'Replace the file, or change its volume…' : 'Replace it with a file of your own…', icon: 'upload', do: 'notif-sound-file', data: { id: s.id }, key: 'file' })}${app ? '' : ui.btn({ label: 'Remove this sound…', icon: 'trash', danger: true, do: 'notif-sound-remove', data: { id: s.id }, key: 'remove' })}</div>${app ? '<p class="smx-quiet-line smx-pad">Setup and the tour play this sound whatever the library holds, so it has no file to replace and cannot be removed.</p>' : ''}` }
      ];
    },
    changes: [
      { was: 'A sound is a card in a grid: play, name, a “Manage” menu (Play preview, Use for events…, Rename, Replace file, Remove), a line of facts and a “Use for events…” link.', now: 'A sound has a page: whether it can play, which alerts play it, where it comes from, and Rename, Replace the file and Remove as buttons. Rename and Remove run PMConcept7’s own menu items.' },
      { was: 'A sound whose file is missing says so in two words on its card.', now: 'Its page says what that means (it cannot play, and which alerts are silent) and has the one button that mends it.' },
      { was: 'A sound can be renamed in two places. “Rename” in its menu keeps the alerts that use it. The “Sound name” box of the dialog behind “Replace file” does not: after renaming “Task done” there, “Goal completed” still names “Task done”, which no longer exists, and plays nothing. Saving that dialog for a built-in sound without choosing a file also turns it into a sound whose file is missing (both checked on PMConcept7, 2026-11-11).', now: '“Rename…” here is the menu’s Rename. The dialog is offered for what it is for, under a label that says so: “Replace it with a file of your own”, or “Attach the file again”. The dialog itself is PMConcept7’s and still has both faults.' }
    ]
  });

  /* ================================================================== Quiet hours */
  const TIMES = []; for (let hh = 0; hh < 24; hh++) for (const mm of ['00', '30']) TIMES.push(`${hh % 12 || 12}:${mm} ${hh < 12 ? 'AM' : 'PM'}`);
  const pct = (m) => Math.round(m / 1440 * 10000) / 100;
  const dayBar = (name, parts, o = {}) => {
    const label = parts.length ? parts.map(([a, b]) => `${a === 0 && b === 1440 ? 'all day' : `from ${clock(o.fmt(a))} to ${clock(o.fmt(b))}`}`).join(' and ') : 'no quiet time';
    return `<div class="smx-nt-day" role="img" aria-label="${h(`${name}: quiet ${label}`)}"><span class="smx-nt-day-name">${h(name)}</span><span class="smx-nt-day-bar"><u style="left:25%"></u><u style="left:50%"></u><u style="left:75%"></u>${parts.map(([a, b]) => `<i class="smx-nt-q" style="left:${pct(a)}%;width:${pct(b - a)}%"></i>`).join('')}${(o.marks || []).map(([m, text, side]) => `<b class="smx-nt-mark is-${side}" style="left:${pct(m)}%"><span>${h(text)}</span></b>`).join('')}${o.now != null ? `<b class="smx-nt-now" style="left:${pct(o.now)}%"><span>Now</span></b>` : ''}</span></div>`;
  };
  const fmtMin = (m) => { m = ((m % 1440) + 1440) % 1440; const hh = Math.floor(m / 60), mm = m % 60; return `${hh % 12 || 12}:${mm < 10 ? '0' + mm : mm} ${hh < 12 ? 'AM' : 'PM'}`; };
  const picture = (st) => {
    const q = quiet(st), s = span(q); const parts = s.same ? [] : s.overnight ? [[0, s.b], [s.a, 1440]] : [[s.a, s.b]];
    const near = Math.min(s.len, 1440 - s.len) < 150;   // closer than two and a half hours: one label, so the two do not overlap
    const marks = s.same ? [] : near && !s.overnight ? [[(s.a + s.b) / 2, `${clock(q.start)} to ${clock(q.end)}`, 'both']] : near ? [[s.a, `${clock(q.start)} to ${clock(q.end)}`, 'both']] : [[s.a, clock(q.start), 'start'], [s.b, clock(q.end), 'end']];
    const local = (q.timeZone || 'Same as this device') === 'Same as this device'; const t = new Date(); const now = local ? t.getHours() * 60 + t.getMinutes() : null; const weekend = t.getDay() === 0 || t.getDay() === 6;
    const split = q.weekends === 'Quiet all weekend' || q.weekends === 'No quiet hours on weekends';
    const bars = split
      ? dayBar('Monday to Friday', parts, { fmt: fmtMin, marks, now: weekend ? null : now }) + dayBar('Saturday and Sunday', q.weekends === 'Quiet all weekend' ? [[0, 1440]] : [], { fmt: fmtMin, now: weekend ? now : null })
      : dayBar('Every day', parts, { fmt: fmtMin, marks, now });
    const lengthSay = !q.enabled ? 'These are the hours that would be quiet.' : s.same ? 'Pick a different start or end below.' : `That is ${lengthWords(s.len)}${s.overnight ? ', overnight' : ', within one day'}.`;
    return `<section class="smx-nt-quiet${q.enabled ? '' : ' is-off'}" aria-label="Quiet hours, drawn on a day">
      <div class="smx-nt-quiet-head"><div class="smx-nt-quiet-copy"><p class="smx-summary-lead">${quietSay(st)}</p><p class="smx-summary-line">${h(lengthSay)}</p></div><span class="smx-nt-switch"><span>Quiet hours</span>${keyed(toggle(!!q.enabled, { action: 'pm51-notifications-quiet-toggle', data: { key: 'enabled' }, label: 'Quiet hours' }), 'quiet-on')}</span></div>
      <div class="smx-nt-days">${bars}<div class="smx-nt-day smx-nt-scale" aria-hidden="true"><span class="smx-nt-day-name"></span><span class="smx-nt-ticks"><span>12 am</span><span>6 am</span><span>noon</span><span>6 pm</span><span>12 am</span></span></div></div>
      <p class="smx-nt-legend" aria-hidden="true"><span><i class="smx-nt-q"></i>Quiet: alerts wait, unless they get through</span><span><i></i>Alerts arrive as they happen</span></p>
    </section>`;
  };
  SMX.extend('notifications/quiet', {
    purpose: 'Hours when alerts wait instead of interrupting you. You choose what still gets through.',
    keywords: ['do not disturb', 'night', 'weekend', 'quiet', 'sleep', 'urgent', 'repeat'],
    blurb: (ctx) => { const q = quiet(ctx.st); return q.enabled ? `${clock(q.start)} to ${clock(q.end)}${quietDays(q)}` : 'Off: alerts arrive at any time'; },
    status: (ctx) => { const q = quiet(ctx.st); return q.enabled && span(q).same ? { text: 'No time is quiet', tone: 'attention' } : q.enabled ? { text: 'On', tone: 'ready' } : { text: 'Off', tone: 'off' }; },
    lead: (ctx) => {
      const st = ctx.st; prime(st);
      const q = quiet(st), s = span(q), by = through(st); const names = (list) => listOf(list.map((x) => ui.b(x.name)));
      const urgent = alerts(st).filter((e) => e.enabled && e.priority === 'Urgent');
      const pick = (key, value, options, label) => keyed(select(value, options.includes(value) ? options : [value, ...options], { action: 'pm51-notifications-quiet', data: { key }, label }), 'q-' + key);
      const says = [by.always.length ? `Everything still reaches ${names(by.always)}.` : '', by.urgent.length ? `Urgent alerts still reach ${names(by.urgent)}.` : '', by.hold.length ? `${names(by.hold)} ${by.hold.length === 1 ? 'holds' : 'hold'} everything until quiet hours end.` : ''].filter(Boolean).join(' ');
      return [
        { key: 'picture', html: picture(st) },
        { key: 'needs', html: ui.needs(q.enabled && s.same ? [{ title: 'Quiet hours start and end at the same time', detail: `Both are ${clock(q.start)}, so no time is quiet. Choose a different end.`, fix: { label: 'Set the times', go: 'notifications/quiet', anchor: 'times' } }] : []) },
        { key: 'through', html: ui.card({ anchor: 'through', title: 'What still gets through', help: 'Each destination decides for itself. This list is the one place that choice is made.', body:
          `<p class="smx-nt-say">${says || 'Add a destination first.'}</p>`
          + ui.rows(dests(st).map((x) => ({ label: x.name, help: `${kind(x).name}${x.status === 'active' ? '' : ' · ' + dStatus(x).text}`, control: keyed(select(quietOf(st, x), QUIET, { action: 'pm51-notifications-dest-quiet', data: { dest: x.id }, label: `${x.name} during quiet hours` }), 'qd-' + x.id) })))
          + `<p class="smx-sentence-note">${urgent.length ? `Urgent now: ${listOf(urgent.map((e) => ui.word(e.name, { go: alertRoute(e) })))}.` : 'No alert is urgent now.'} How urgent an alert is, is chosen on the alert’s own page.</p>` }) },
        { key: 'times', html: ui.card({ anchor: 'times', title: 'When it is quiet', body:
          ui.sentence(`<span>Quiet from</span>${pick('start', q.start, TIMES, 'Start')}<span>to</span>${pick('end', q.end, TIMES, 'End')}`)
          + ui.sentence(`<span>On Saturday and Sunday</span>${pick('weekends', q.weekends, ['Same schedule', 'Quiet all weekend', 'No quiet hours on weekends'], 'Weekends')}`)
          + `<p class="smx-sentence-note">${q.enabled ? 'The picture above follows these as you change them.' : 'Quiet hours are off. Turn them on above; the times are kept.'}</p>` }) },
        { key: 'rest', html: ui.card({ title: 'Alerts that do not get through', body: ui.rows([
          { label: 'What happens to them', help: 'Deliver later sends them when quiet hours end. Skip throws them away.', control: seg(q.during || 'Deliver later', ['Deliver later', 'Skip'], { action: 'pm51-notifications-quiet-during', label: 'Alerts that do not get through' }) },
          { label: 'Repeat an urgent alert every', help: 'Until someone responds.', control: pick('repeatUrgent', q.repeatUrgent || '10 minutes', ['5 minutes', '10 minutes', '15 minutes', '30 minutes', 'Never'], 'Repeat urgent alerts every') }
        ]) }) }
      ];
    },
    more: [{ key: 'fine', count: 2, html: (ctx) => { const q = quiet(ctx.st); const pick = (key, value, options, label) => keyed(select(value, options.includes(value) ? options : [value, ...options], { action: 'pm51-notifications-quiet', data: { key }, label }), 'q-' + key); return ui.card({ title: 'Agents and the clock', body: ui.rows([
      { label: 'Notification agents', help: 'Whether the agents that follow up on an unanswered alert keep quiet too.', control: pick('escalation', q.escalation || 'Follow quiet hours', ['Follow quiet hours', 'Ignore quiet hours'], 'Notification agents during quiet hours') },
      { label: 'Whose clock', help: 'Quiet hours follow this clock.', control: pick('timeZone', q.timeZone || 'Same as this device', ['Same as this device', 'Same as your server'], 'Whose clock') }
    ]) }); } }],
    moreHelp: 'Agents during quiet hours, and whose clock counts',
    changes: [
      { was: 'Quiet hours is two lists of 48 times and the line “10:30 PM to 8:00 AM”. Nothing shows how long that is or that it runs overnight. Start and End can be set to the same time: the page then reads “11:00 PM to 11:00 PM” and says nothing about what that means (checked on PMConcept7, 2026-11-11).', now: 'The day is drawn as a bar with the quiet part marked, under a sentence that gives the times, the days and the length. Equal times are named as a mistake, with a button that leads to the two lists.' },
      { was: 'What gets through is told in three places: “During quiet hours” in each destination’s detail, “Still reaches you — 3 of 4 destinations” here, whose “Change” button only switches to the Destinations tab and shows a hint, and “Escalation groups” under More options.', now: 'One list on this page: every destination with its own choice, under a sentence that says where urgent alerts still arrive, and a line naming the alerts that are urgent now.' },
      { was: '“Other alerts — Deliver later | Skip” does not say other than what; “Escalation groups” is the old name of the notification agents and appears nowhere else.', now: '“Alerts that do not get through: what happens to them”, and the row “Notification agents”.' }
    ]
  });

  /* ================================================================== Past alerts */
  SMX.extend('notifications/history', {
    purpose: 'What was sent, where, and whether it arrived.',
    keywords: ['history', 'log', 'delivered', 'failed', 'retry', 'sent'],
    blurb: (ctx) => { const hs = sent(ctx.st); const bad = hs.filter((r) => !/deliver/i.test(r.result)).length; return `${plural(hs.length, 'alert')} sent lately${bad ? ` · ${bad} did not arrive` : ''}`; },
    status: (ctx) => { const bad = sent(ctx.st).filter((r) => !/deliver/i.test(r.result)).length; return bad ? { text: `${bad} did not arrive`, tone: 'attention' } : { text: 'All arrived', tone: 'ready' }; },
    lead: (ctx) => {
      const st = ctx.st; prime(st);
      const hs = sent(st); const bad = hs.map((r, i) => [r, i]).filter(([r]) => !/deliver/i.test(r.result));
      return [
        { key: 'summary', html: ui.summary({ icon: 'history', tone: bad.length ? 'attention' : 'ready', lines: [
          hs.length ? `${ui.b(plural(hs.length, 'alert'))} ${hs.length === 1 ? 'was' : 'were'} sent lately. ${bad.length ? `${ui.b(String(bad.length))} did not arrive.` : 'All of them arrived.'}` : 'Nothing has been sent yet.',
          'Open a line to see where it went and how long it took.'
        ] }) },
        { key: 'needs', html: ui.needs(bad.map(([r, i]) => ({ title: `${r.event} did not reach ${r.destination}`, detail: /retry/i.test(r.result) ? `Sent ${when(r.time)}. Puppet Master keeps trying for a while, then gives up and tells you.` : `Sent ${when(r.time)}: ${low(r.result)}.`, fix: { label: 'See what happened', action: 'pm51-notifications-history', data: { index: i } }, also: (() => { const x = dests(st).find((y) => y.name === r.destination); return x ? { label: `Open ${x.name}`, go: destRoute(x) } : null; })() }))) },
        { key: 'list', html: ui.things({ title: 'Sent lately', help: 'The newest first.', items: hs.map((r, i) => ({ icon: /deliver/i.test(r.result) ? 'check' : 'alert', name: r.event, sub: `${r.time} · to ${r.destination}`, status: { text: r.result, tone: resultTone(r.result) }, action: 'pm51-notifications-history', data: { index: i } })),
          empty: { icon: 'history', title: 'Nothing sent yet', text: 'An alert shows up here when it goes out.' } }) },
        { key: 'kept', html: ui.card({ title: 'About this list', body: ui.facts([['Kept for', '30 days'], ['Addresses and secrets', 'Never written to this list']]) + `<div class="smx-btn-row smx-pad">${ui.btn({ label: 'Save the list to a file…', icon: 'download', action: 'pm51-notifications-export' })}${ui.btn({ label: 'How long things are kept', go: 'keeping/cleanup' })}</div>` }) }
      ];
    },
    changes: [
      { was: 'History is a tab of three rows; a row that reads “Retrying” looks like the others, and “Kept for: 30 days” with “Export log” is folded under More options.', now: 'The page starts with how many alerts were sent and how many did not arrive. One that did not is listed under “Needs you” with “See what happened”, which opens PMConcept7’s own panel (it has “Retry now”). How long the list is kept is said on the page, with the way to the one page for keeping things.' }
    ]
  });

  /* search: destinations, alerts, sounds and agents by name */
  (SMX.thingSources = SMX.thingSources || []).push((st) => [
    ...dests(st).map((x) => ({ title: x.name, sub: 'Notifications & sounds › a destination', route: destRoute(x) })),
    ...alerts(st).map((e) => ({ title: e.name, sub: 'Notifications & sounds › What you are told about › an alert', route: alertRoute(e) })),
    ...librarySounds(st).map((s) => ({ title: s.name, sub: 'Notifications & sounds › Sounds › a sound', route: soundRoute(s) })),
    ...agents(st).map((g) => ({ title: g.name, sub: 'Notifications & sounds › What you are told about › If nobody responds', route: 'notifications/events' }))
  ]);
})(window);
