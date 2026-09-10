/* Notifications & Sounds — where alerts go, what they sound like, and when to stay quiet. */
(function () {
  const ID = 'notifications';
  const KEY = 'notifications-sounds';
  const N = () => state.notifications;
  /* Fixture extras: the shipped copy (data.d/05-notifications.json) under whatever an older session persisted. */
  const X = () => Object.assign({}, DATA.notifications || {}, PM51.s().notifications || {});
  const TABS = [{ id: 'destinations', label: 'Destinations' }, { id: 'events', label: 'Events' }, { id: 'sounds', label: 'Sounds' }, { id: 'quiet', label: 'Quiet Hours' }, { id: 'history', label: 'History' }];
  const tab = () => PM51.tab(ID, 'destinations');
  const save = () => { saveState(); PM51.refresh(ID, { swap: false }); };
  const example = (title, message) => PM51.toast(title, message || 'Example data only. Nothing was sent or changed outside this preview.', 'info');
  const BUILT_IN_TYPES = ['Built-in', 'Operating system', 'In-app', 'System / tray'];
  const TYPE_LABEL = { 'Built-in': 'In this app', 'In-app': 'In this app', 'Operating system': 'System / tray', 'System / tray': 'System / tray', 'Discord webhook': 'Discord', Discord: 'Discord', ntfy: 'ntfy', Slack: 'Slack', Pushover: 'Pushover', Telegram: 'Telegram', 'Generic webhook': 'Generic webhook' };
  const RETRY = ['Retry 3 times, then give up', 'Retry once', 'Never retry'];
  const RATE = ['Up to 20 per minute', 'Up to 5 per minute', 'No limit'];
  const PAYLOAD = ['Standard', 'Compact', 'Full details'];
  const REDACTION = ['Hide file paths and secrets', 'Hide secrets only', 'Send everything'];
  const ESCALATIONS = ['None', 'Discord after 5 minutes', 'Repeat urgent after 10 minutes', 'Phone alerts after 15 minutes'];
  const PRIORITIES = ['Low', 'Normal', 'Urgent'];
  const SOUND_GROUPS = { none: 'No sound', builtIn: 'Built-in', uploaded: 'Uploaded' };
  const TIMES = []; for (let hh = 0; hh < 24; hh++) for (const mm of ['00', '30']) TIMES.push(`${hh % 12 || 12}:${mm} ${hh < 12 ? 'AM' : 'PM'}`);

  PM51.style(`
    /* events: the sound choice sits on the row; nothing on the row is whole-row clickable */
    #panel-settings .pm51-mgr .pm51-event-row { gap: 14px; }
    #panel-settings .pm51-mgr .pm51-event-row.is-off .pm51-item-title { color: var(--k3-text-2); }
    #panel-settings .pm51-mgr .pm51-event-row .pm51-item-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 0 5px; }
    #panel-settings .pm51-mgr .pm51-event-row .pm51-item-end { gap: 8px; }
    #panel-settings .pm51-sound-pick { display: inline-flex; align-items: center; gap: 6px; min-width: 0; }
    #panel-settings .pm51-mgr .pm51-item-end .pm51-sound-pick .pm51-dd-trigger, #panel-settings .pm51-mgr .pm51-row .pm51-sound-pick .pm51-dd-trigger { min-width: 156px; max-width: 200px; }
    #panel-settings .pm51-sound-inline-play.icon-btn { width: 30px; height: 30px; border-radius: 50%; color: var(--k3-accent-2); background: var(--k3-accent-soft); border-color: var(--k3-line-strong); }
    #panel-settings .pm51-sound-inline-play.icon-btn .icon { width: 12px; height: 12px; }
    #panel-settings .pm51-sound-inline-play:not(.is-playing) .icon svg { transform: translateX(1px); }
    #panel-settings .pm51-sound-inline-play.is-playing { border-color: rgba(var(--accent-primary-rgb), .7); box-shadow: 0 0 0 3px rgba(var(--accent-primary-rgb), .14); color: var(--k3-accent-2); }
    #panel-settings .pm51-sound-inline-play[aria-disabled="true"] { opacity: .45; cursor: not-allowed; box-shadow: none; }
    #panel-settings .pm51-panel .pm51-sound-pick { display: flex; width: 100%; }
    #panel-settings .pm51-panel .pm51-sound-pick .pm51-dd { flex: 1 1 auto; }
    #panel-settings .pm51-panel .pm51-sound-pick .pm51-dd-trigger { width: 100%; max-width: none; }
    #panel-settings .pm51-notif-inline { margin-top: 10px; display: flex; flex-wrap: wrap; gap: 8px; }
    #panel-settings .pm51-notif-result { display: inline-flex; align-items: center; gap: 7px; font-size: 12px; color: var(--k3-text-2); }
    #panel-settings .pm51-check-list { display: flex; flex-direction: column; gap: 2px; margin-top: 4px; }
    #panel-settings .pm51-check-list .check-row { min-height: 26px; font-size: 11.5px; }
    /* sound library: a two-column card grid (plan K.F). The engine's syncSoundPreviewRows keeps driving
       .sound-row[data-sound-row] / .sound-play[data-id] / is-playing, so that markup is unchanged. */
    #panel-settings .pm51-mgr .pm51-sound-list.pm51-sound-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 10px; }
    #panel-settings .pm51-mgr .pm51-sound-grid .sound-row { display: grid; grid-template-columns: 28px minmax(0, 1fr) 72px 32px; grid-template-rows: auto auto; align-items: center; gap: 5px 10px; min-height: 0; margin: 0; padding: 10px 12px 11px; border: 1px solid var(--k3-line); border-radius: 10px; background: var(--k3-bg-2); transition: border-color var(--k3-dur-fast) var(--k3-ease-out), box-shadow var(--k3-dur-fast) var(--k3-ease-out); }
    #panel-settings .pm51-mgr .pm51-sound-grid .sound-row:first-of-type { border-top: 1px solid var(--k3-line); }
    #panel-settings .pm51-mgr .pm51-sound-grid .sound-row:hover { border-color: var(--k3-line-strong); }
    #panel-settings .pm51-mgr .pm51-sound-grid .sound-row.is-playing { border-color: rgba(var(--accent-primary-rgb), .6); box-shadow: 0 0 0 3px rgba(var(--accent-primary-rgb), .12); }
    #panel-settings .pm51-mgr .pm51-sound-grid .sound-row.is-unavailable { background: var(--k3-bg-1); }
    #panel-settings .pm51-mgr .pm51-sound-grid .sound-play { grid-column: 1; grid-row: 1; }
    #panel-settings .pm51-mgr .pm51-sound-grid .sound-play[aria-disabled="true"] { opacity: .45; cursor: not-allowed; }
    #panel-settings .pm51-mgr .pm51-sound-grid .sound-copy { grid-column: 2; grid-row: 1; min-width: 0; display: flex; flex-wrap: wrap; align-items: center; gap: 4px 8px; }
    #panel-settings .pm51-mgr .pm51-sound-grid .sound-copy strong { display: inline; font-size: 12.5px; font-weight: 650; color: var(--k3-text-1); overflow-wrap: anywhere; }
    #panel-settings .pm51-mgr .pm51-sound-grid .sound-copy .pm51-status { display: inline-flex; margin: 0; font-size: 11px; }
    #panel-settings .pm51-mgr .pm51-sound-grid .sound-copy .pm51-status span { display: inline; margin: 0; font-size: 11px; color: inherit; }
    #panel-settings .pm51-mgr .pm51-sound-grid .sound-waveform { grid-column: 3; grid-row: 1; width: 72px; }
    #panel-settings .pm51-mgr .pm51-sound-grid .sound-row > .icon-btn { grid-column: 4; grid-row: 1; }
    #panel-settings .pm51-mgr .pm51-sound-grid .pm51-sound-lines { grid-column: 2 / 5; grid-row: 2; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
    #panel-settings .pm51-mgr .pm51-sound-grid .pm51-sound-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 0 5px; font-size: 11.5px; color: var(--k3-text-3); }
    #panel-settings .pm51-mgr .pm51-sound-grid .pm51-sound-meta .pm51-tag { display: inline-flex; margin: 0; font-size: 11px; }
    #panel-settings .pm51-mgr .pm51-sound-grid .pm51-sound-used { display: flex; align-items: center; gap: 10px; min-width: 0; }
    #panel-settings .pm51-mgr .pm51-sound-grid .pm51-sound-used-text { display: block; flex: 0 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 11.5px; color: var(--k3-text-3); }
    #panel-settings .pm51-mgr .pm51-sound-grid .pm51-sound-used .pm51-link { flex: 0 0 auto; white-space: nowrap; }
    @container settings-host (max-width: 960px) { #panel-settings .pm51-mgr .pm51-sound-list.pm51-sound-grid { grid-template-columns: minmax(0, 1fr); } }
    @container settings-host (max-width: 720px) {
      #panel-settings .pm51-mgr .pm51-sound-grid .sound-row { grid-template-columns: 28px minmax(0, 1fr) 32px; grid-template-rows: auto auto auto; padding: 9px 10px; }
      #panel-settings .pm51-mgr .pm51-sound-grid .pm51-sound-lines { grid-column: 2 / 4; grid-row: 2; }
      #panel-settings .pm51-mgr .pm51-sound-grid .sound-waveform { grid-column: 2; grid-row: 3; }
      #panel-settings .pm51-mgr .pm51-sound-grid .sound-row > .icon-btn { grid-column: 3; grid-row: 1; }
    }
    @container settings-host (max-width: 600px) {
      #panel-settings .pm51-mgr .pm51-event-row { flex-wrap: wrap; }
      #panel-settings .pm51-mgr .pm51-event-row .pm51-item-end { width: 100%; justify-content: flex-start; }
      #panel-settings .pm51-mgr .pm51-item-end .pm51-sound-pick .pm51-dd-trigger { flex: 1 1 auto; max-width: none; }
    }
  `);

  /* Unavailable recordings never play; say so instead of surfacing an audio error. */
  const pm51NotifPrevDispatch = dispatchAction;
  dispatchAction = function (action, el, event) {
    if (action === 'play-sound' && el && el.getAttribute && el.getAttribute('aria-disabled') === 'true') { PM51.toast('This sound is unavailable', el.dataset.disabledReason || 'The recording is missing. Replace the file to preview it.', 'info', 2600); return; }
    return pm51NotifPrevDispatch(action, el, event);
  };
  /* The engine mirrors playback onto .sound-row / .sound-play; the inline preview buttons on event rows and sheets follow too. */
  const pm51NotifPrevSync = syncSoundPreviewRows;
  syncSoundPreviewRows = function (activeId = null) {
    pm51NotifPrevSync(activeId);
    document.querySelectorAll('.pm51-sound-inline-play[data-id]').forEach(btn => {
      const id = btn.dataset.id; if (!id) return;
      const playing = id === activeId;
      const name = btn.dataset.sound || 'sound';
      btn.classList.toggle('is-playing', playing);
      btn.setAttribute('aria-pressed', playing ? 'true' : 'false');
      btn.setAttribute('aria-label', `${playing ? 'Stop' : 'Play'} ${name} preview`);
      btn.dataset.pmHoverLabel = btn.getAttribute('aria-label');
      if (btn.getAttribute('aria-disabled') !== 'true') btn.dataset.pmHoverDetail = playing ? 'Stop this local preview.' : 'Preview this sound locally.';
      const labelled = !!btn.querySelector('span:not(.icon)');
      btn.innerHTML = icon(playing ? 'volume' : 'play') + (labelled ? `<span>${playing ? 'Stop' : 'Play'}</span>` : '');
    });
  };

  /* ---------- state shape: events carry a stable id and a "when it fires" line ---------- */
  /* Persisted events from before this pass were index-addressed and had no id or description. Map them
     to the fixture by name, mint an id otherwise, and run the same repair inside ensureStateShape. */
  const fixtureEvents = () => (D.notifications && Array.isArray(D.notifications.events) ? D.notifications.events : []);
  const uniqueId = (base, taken) => { let id = base, k = 2; while (taken.has(id)) id = `${base}-${k++}`; taken.add(id); return id; };
  function migrateEvents() {
    const n = state.notifications; if (!n || !Array.isArray(n.events)) return;
    n.events = n.events.filter(e => e && typeof e === 'object');
    const taken = new Set();
    n.events.forEach(e => {
      e.name = String(e.name || '').trim() || 'Untitled event';
      const fx = fixtureEvents().find(f => f.id === e.id) || fixtureEvents().find(f => f.name === e.name);
      if (!e.id) e.id = fx ? fx.id : uid('event', e.name);
      e.id = uniqueId(String(e.id), taken);
      if (typeof e.description !== 'string') e.description = fx ? fx.description : (e.custom ? 'Raised by your own automation.' : '');
      if (!Array.isArray(e.destinations)) e.destinations = [];
      if (!PRIORITIES.includes(e.priority)) e.priority = 'Normal';
      if (typeof e.sound !== 'string' || !e.sound) e.sound = 'None';
      e.enabled = e.enabled !== false;
      e.custom = e.custom === true;
    });
  }
  const pm51NotifPrevEnsure = ensureStateShape;
  ensureStateShape = function () { pm51NotifPrevEnsure(); migrateEvents(); };
  migrateEvents();

  /* The engine's dialog autofocus lands on the head's close button (first match in document order); put it on the field. */
  const focusField = overlay => { const t = overlay && overlay.querySelector('[data-autofocus], .form-input, .pm51-dd-trigger'); if (t) { try { t.focus({ preventScroll: true }); } catch (err) { t.focus(); } } };
  /* ---------- shared helpers --------------------------------------------- */
  const dests = () => N().destinations || [];
  const currentDest = () => dests().find(d => d.id === PM51.sel(ID, 'in-app')) || dests()[0];
  const destById = id => dests().find(d => d.id === id) || currentDest();
  const isBuiltIn = d => BUILT_IN_TYPES.includes(d.type);
  const typeLabel = d => TYPE_LABEL[d.type] || d.type;
  const destStatus = d => d.status === 'active' ? (isBuiltIn(d) ? 'Ready' : 'Connected') : d.status === 'attention' ? 'Needs attention' : d.status === 'disabled' ? 'Off' : 'Not set up';
  const destRank = d => d.status === 'active' ? 0 : d.status === 'attention' ? 1 : d.status === 'disabled' ? 3 : 2;
  const destsSorted = () => dests().slice().sort((x, y) => destRank(x) - destRank(y));
  const mask = d => { if (isBuiltIn(d)) return d.address || 'This device'; const s = String(d.address || ''); if (!s) return 'Not set'; if (s.includes('•')) return s; if (s.length <= 6) return '••••'; return s.slice(0, 2) + '••••' + s.slice(-4); };
  const usedBy = d => { const ev = (N().events || []).filter(e => e.destinations.includes(d.name)).map(e => e.name); const ag = (N().agents || []).filter(a => a.destinations.includes(d.name)).map(a => a.name); return [...ev, ...ag]; };
  const lastDelivery = d => { const row = (N().history || []).find(x => x.destination === d.name); return row ? `${row.time} · ${row.result}` : 'None yet'; };
  const events = () => N().events || [];
  const eventById = id => events().find(e => e.id === id);
  const sounds = () => N().sounds || [];
  const soundAvailable = s => settingsSoundPreview.availability(s) !== 'file_unavailable';
  const soundByName = name => sounds().find(s => s.name === name);
  const isBuiltInSound = s => /^Built-in/.test(String(s.source || ''));
  const sourceLabel = s => isBuiltInSound(s) ? 'Built-in' : /pack/i.test(String(s.source || '')) ? 'Imported pack' : 'Uploaded';
  const eventsUsing = s => events().filter(e => e.sound === s.name);
  const groups = () => Object.assign({}, SOUND_GROUPS, X().soundGroups || {});
  const priorities = () => { const list = Array.isArray(X().priorities) ? X().priorities : []; return PRIORITIES.map(p => { const f = list.find(x => x && x.value === p) || {}; return { value: p, label: f.label || p, meta: f.meta || '' }; }); };
  const priorityMeta = p => (priorities().find(x => x.value === p) || {}).meta || '';
  const durationText = v => { const m = /^(?:(\d+):)?(\d+(?:\.\d+)?)$/.exec(String(v || '')); if (!m) return String(v || ''); const secs = Number(m[1] || 0) * 60 + Number(m[2]); return secs >= 60 ? `${Math.floor(secs / 60)} min ${Math.round(secs % 60)} s` : `${Number(secs.toFixed(1))} s`; };
  const resultTone = r => /deliver/i.test(r) ? 'ready' : /retry|wait/i.test(r) ? 'attention' : /fail|drop/i.test(r) ? 'blocked' : 'neutral';
  /* Options for every event-sound dropdown: No sound / Built-in / Uploaded; a missing upload says so. */
  function soundOptions(current) {
    const g = groups();
    const rows = sounds().map(s => ({ value: s.name, label: s.name, group: isBuiltInSound(s) ? g.builtIn : g.uploaded, meta: soundAvailable(s) ? durationText(s.duration) : 'File missing' }));
    rows.sort((x, y) => (x.group === g.builtIn ? 0 : 1) - (y.group === g.builtIn ? 0 : 1));
    if (current && current !== 'None' && !soundByName(current)) rows.push({ value: current, label: current, group: g.uploaded, meta: 'File missing' });
    return [{ value: 'None', label: 'None', group: g.none }, ...rows];
  }
  /* Inline preview: the engine's play-sound action with an id; None and missing files are aria-disabled with a reason. */
  function playButton(s, { labelled } = {}) {
    const playing = !!s && state.soundPlaying === s.id;
    const why = !s ? 'Choose a sound first.' : soundAvailable(s) ? '' : 'The uploaded file is missing. Replace it from the Sounds tab to preview it.';
    const name = s ? s.name : 'sound';
    const aria = `${playing ? 'Stop' : 'Play'} ${name} preview`;
    return `<button type="button" class="${labelled ? 'btn small pm51-btn' : 'icon-btn'} pm51-sound-inline-play${playing ? ' is-playing' : ''}" data-action="play-sound" data-id="${a(s ? s.id : '')}" data-sound="${a(name)}" aria-pressed="${playing ? 'true' : 'false'}" aria-label="${a(aria)}" data-pm-hover-label="${a(aria)}" data-pm-hover-detail="${a(why || (playing ? 'Stop this local preview.' : 'Preview this sound locally.'))}"${why ? ` aria-disabled="true" data-disabled-reason="${a(why)}"` : ''}>${icon(playing ? 'volume' : 'play')}${labelled ? `<span>${playing ? 'Stop' : 'Play'}</span>` : ''}</button>`;
  }
  function soundControl(e, { labelled } = {}) {
    const s = e.sound && e.sound !== 'None' ? soundByName(e.sound) : null;
    return `<span class="pm51-sound-pick">${PM51.dropdown(e.sound || 'None', soundOptions(e.sound), { action: 'pm51-notifications-event-sound', data: { event: e.id }, label: `${e.name} sound` })}${playButton(s, { labelled })}</span>`;
  }
  /* After a body re-render, put focus back on the control the user was using. */
  const refocus = selector => requestAnimationFrame(() => { const el = root.querySelector(selector); if (!el) return; const t = el.classList.contains('pm51-dd-native') ? el.closest('.pm51-dd')?.querySelector('.pm51-dd-trigger') : el; if (t && typeof t.focus === 'function') { try { t.focus({ preventScroll: true }); } catch (err) { t.focus(); } } });

  /* ---------- Destinations ------------------------------------------------ */
  function stats() {
    const ev = events();
    return PM51.stats([
      { label: 'Destinations', value: dests().length, help: `${dests().filter(d => d.status === 'active').length} working` },
      { label: 'Events routed', value: `${ev.filter(e => e.enabled).length} of ${ev.length}`, help: 'Alerts that are turned on' },
      { label: 'Sounds', value: sounds().filter(soundAvailable).length, help: 'Ready to play' },
      { label: 'Quiet hours', value: N().quiet?.enabled ? 'On' : 'Off', help: N().quiet?.enabled ? `${N().quiet.start} to ${N().quiet.end}` : 'Alerts arrive any time' }
    ]);
  }
  function destAdvanced(d) {
    const adv = d.advanced || (d.advanced = {});
    const data = k => ({ dest: d.id, key: k });
    const rows = isBuiltIn(d) ? [
      { label: 'Retry policy', value: 'Not needed. Alerts in this app never fail to arrive.' },
      { label: 'Redaction', help: 'What is left out of the alert text.', control: PM51.dropdown(adv.redaction || REDACTION[0], REDACTION, { action: 'pm51-notifications-dest-adv', data: data('redaction'), label: 'Redaction' }) }
    ] : [
      { label: 'Retry policy', help: 'What happens when the service does not answer.', control: PM51.dropdown(adv.retry || RETRY[0], RETRY, { action: 'pm51-notifications-dest-adv', data: data('retry'), label: 'Retry policy' }) },
      { label: 'Rate limit', help: 'Stops a burst of alerts from flooding the service.', control: PM51.dropdown(adv.rate || RATE[0], RATE, { action: 'pm51-notifications-dest-adv', data: data('rate'), label: 'Rate limit' }) },
      { label: 'Message format', control: PM51.dropdown(adv.payload || PAYLOAD[0], PAYLOAD, { action: 'pm51-notifications-dest-adv', data: data('payload'), label: 'Message format' }) },
      { label: 'Redaction', help: 'What is left out of the alert text.', control: PM51.dropdown(adv.redaction || REDACTION[0], REDACTION, { action: 'pm51-notifications-dest-adv', data: data('redaction'), label: 'Redaction' }) }
    ];
    return PM51.advanced(PM51.rows(rows) + PM51.section({ title: 'Technical details', body: PM51.kv([['Destination id', d.id], ['Type', d.type], ['Where it goes', mask(d)], ['Last delivery', lastDelivery(d)]]) + '<div class="pm51-notif-inline">' + PM51.btn({ label: 'Export log', icon: 'download', small: true, action: 'pm51-notifications-export', data: { dest: d.id } }) + PM51.btn({ label: 'Run diagnostics', icon: 'test', small: true, action: 'pm51-notifications-diagnostics', data: { dest: d.id } }) + '</div>' }));
  }
  function destDetail(d) {
    const off = d.status === 'disabled';
    const data = { dest: d.id };
    const used = usedBy(d);
    const rows = [
      { label: 'Type', value: typeLabel(d) },
      { label: 'Where it goes', help: isBuiltIn(d) ? undefined : 'Shown masked. Edit it from the menu.', value: mask(d) },
      { label: 'Allow urgent alerts', help: 'Urgent alerts get through even during quiet hours.', control: PM51.toggle(!!d.urgent, { action: 'pm51-notifications-dest-urgent', data, label: 'Allow urgent alerts' }) },
      { label: 'Used by', value: used.length ? used.join(', ') : 'No events yet. Pick it under Events.' },
      { label: 'Last delivery', value: lastDelivery(d) }
    ];
    return {
      title: d.name, pill: PM51.status(destStatus(d)), subtitle: `${typeLabel(d)} · ${mask(d)}`,
      primary: off ? { label: 'Turn on', icon: 'play', action: 'pm51-notifications-dest-on', data } : { label: 'Send test', icon: 'bell', action: 'pm51-notifications-test', data },
      menu: anchor => PM51.menu(anchor, [
        { label: 'Edit', icon: 'edit', onClick: () => editDest(d) },
        { label: off ? 'Turn on' : 'Turn off', icon: off ? 'play' : 'pause', onClick: () => { if (off) { d.status = d.prevStatus || 'active'; delete d.prevStatus; } else { d.prevStatus = d.status; d.status = 'disabled'; } save(); } },
        { label: 'Remove', icon: 'trash', danger: true, onClick: () => PM51.confirm(`Remove ${d.name}?`, used.length ? `${used.length} event${used.length === 1 ? '' : 's'} will stop going there.` : 'Nothing is sent there right now.', 'Remove', () => removeDest(d), true) },
        { separator: true },
        { label: 'Delivery history', icon: 'history', onClick: () => { PM51.setTab(ID, 'history'); PM51.refresh(ID); } }
      ], d.name),
      body: PM51.section({ title: 'Destination', body: PM51.rows(rows) }) + destAdvanced(d)
    };
  }
  function removeDest(d) {
    N().destinations = dests().filter(x => x.id !== d.id);
    events().forEach(e => { e.destinations = e.destinations.filter(n => n !== d.name); });
    (N().agents || []).forEach(a => { a.destinations = a.destinations.filter(n => n !== d.name); });
    PM51.setSel(ID, dests()[0]?.id || 'in-app'); save(); PM51.toast('Destination removed', `${d.name} is gone.`);
  }
  function editDest(d) {
    openDialog({
      title: `Edit ${d.name}`, subtitle: 'The address is stored in the credential store on your server.',
      body: PM51.form([
        { label: 'Name', name: 'name', value: d.name, autofocus: true },
        { label: 'Type', name: 'type', value: TYPE_LABEL[d.type] && (X().destinationTypes || []).includes(TYPE_LABEL[d.type]) ? TYPE_LABEL[d.type] : d.type, type: 'select', choices: [...new Set([...(X().destinationTypes || []), d.type])] },
        { label: 'Where it goes', name: 'address', value: isBuiltIn(d) ? d.address : '', placeholder: isBuiltIn(d) ? '' : 'Leave empty to keep the current address', full: true, help: isBuiltIn(d) ? 'Built into Puppet Master.' : 'Webhook address, topic, or chat id.' },
        { label: 'Allow urgent alerts', name: 'urgent', value: !!d.urgent, type: 'checkbox', full: true }
      ]),
      saveLabel: 'Save', onOpen: focusField, onSave: data => {
        const name = String(data.name || '').trim() || d.name;
        events().forEach(e => { e.destinations = e.destinations.map(n => n === d.name ? name : n); });
        (N().agents || []).forEach(a => { a.destinations = a.destinations.map(n => n === d.name ? name : n); });
        (N().history || []).forEach(hrow => { if (hrow.destination === d.name) hrow.destination = name; });
        d.name = name; if (data.type) d.type = data.type; if (String(data.address || '').trim()) d.address = String(data.address).trim(); d.urgent = !!data.urgent;
        save(); PM51.toast('Destination saved', `${d.name} was updated.`);
      }
    });
  }
  function destinationsTab() {
    const d = currentDest();
    if (!d) return stats() + PM51.empty('No destinations yet', 'Add one so alerts have somewhere to go.', { label: 'Add destination', icon: 'plus', action: 'pm51-notifications-add-dest' });
    return stats() + PM51.listDetail({
      id: ID, rosterTitle: 'Destinations', count: dests().length, add: { action: 'pm51-notifications-add-dest', label: 'Add destination' },
      items: dests().map(x => ({ id: x.id, title: x.name, meta: `${typeLabel(x)} · ${destStatus(x)}`, tone: PM51.tone(destStatus(x)), avatar: icon(isBuiltIn(x) ? 'bell' : 'external'), selected: x.id === d.id })),
      detail: destDetail(d)
    });
  }

  /* ---------- Events ------------------------------------------------------- */
  const eventGoesTo = e => e.destinations.length ? `${e.destinations.length} ${e.destinations.length === 1 ? 'place' : 'places'}` : 'Nowhere yet';
  const eventSoundName = e => e.sound && e.sound !== 'None' ? e.sound : 'None';
  function eventMeta(e) {
    const parts = [];
    if (e.custom) parts.push(PM51.tag('Custom event'));
    parts.push(h(e.destinations.length ? e.destinations.join(', ') : 'Nowhere yet'));
    parts.push(e.priority === 'Urgent' ? PM51.tag('Urgent') : h(e.priority || 'Normal'));
    return parts.join(' · ');
  }
  function eventRow(e) {
    return `<div class="pm51-item pm51-event-row${e.enabled ? '' : ' is-off'}" data-event="${a(e.id)}">
      <div class="pm51-item-copy"><div class="pm51-item-title">${h(e.name)}</div><div class="pm51-item-meta">${eventMeta(e)}</div></div>
      <div class="pm51-item-end">${soundControl(e)}${PM51.toggle(!!e.enabled, { action: 'pm51-notifications-event-toggle', data: { event: e.id }, label: `${e.name} alerts` })}${PM51.iconBtn({ icon: 'chevron', action: 'pm51-notifications-event', data: { event: e.id }, label: `Open ${e.name}` })}</div>
    </div>`;
  }
  function eventsTab() {
    const ev = events();
    const groupRows = (N().agents || []).map(g => ({
      title: g.name, pill: PM51.status(g.status === 'active' ? 'Ready' : 'Off'),
      meta: `${g.events.join(', ')} · ${g.escalation === 'None' ? 'No escalation' : g.escalation}`,
      end: icon('chevron'), action: 'pm51-notifications-group', data: { id: g.id }
    }));
    const map = PM51.kv(ev.map(e => [e.name, e.destinations.length ? e.destinations.join(', ') : 'Nowhere']));
    return PM51.section({ title: 'Events', help: 'Turn each alert on or off, choose its sound here, or open one to change where it goes.', action: { label: 'Add event', icon: 'plus', small: true, action: 'pm51-notifications-add-event' }, body: ev.length ? `<div class="pm51-list pm51-event-list">${ev.map(eventRow).join('')}</div>` : PM51.note('No events yet. Add one to get started.') })
      + PM51.section({ title: 'Escalation groups', help: 'When an alert is not handled, these groups send it somewhere louder.', body: groupRows.length ? PM51.list(groupRows) : PM51.note('No escalation groups yet.') })
      + PM51.advanced([
        PM51.section({ title: 'Event to destination map', help: 'Read-only. Where each event goes right now.', body: map }),
        PM51.section({ title: 'Import and export', body: '<div class="pm51-notif-inline">' + PM51.btn({ label: 'Export events', icon: 'download', small: true, action: 'pm51-notifications-export-events' }) + PM51.btn({ label: 'Import events', icon: 'upload', small: true, action: 'pm51-notifications-import-events' }) + '</div>' })
      ].join(''));
  }
  /* Event hero sheet: what it is, where it goes, how it sounds, how loud it is; custom events can be renamed or removed. */
  let eventSheet = null;
  const eventFacts = e => [{ label: 'Priority', value: e.priority || 'Normal' }, { label: 'Goes to', value: eventGoesTo(e) }, { label: 'Sound', value: eventSoundName(e) }];
  function eventPanel(id) {
    const e = eventById(id); if (!e) return;
    const data = { event: e.id };
    const where = PM51.rows([
      { label: 'Alert is on', help: 'Off means it is never delivered anywhere.', control: PM51.toggle(!!e.enabled, { action: 'pm51-notifications-event-toggle', data, label: `${e.name} alerts` }) },
      ...destsSorted().map(d => ({ label: d.name, help: `${typeLabel(d)}${d.status === 'active' ? '' : ' · ' + destStatus(d)}`, control: PM51.toggle(e.destinations.includes(d.name), { action: 'pm51-notifications-event-dest', data: { event: e.id, dest: d.id }, label: d.name }) }))
    ]);
    const sound = PM51.field('Sound', soundControl(e, { labelled: true }), 'Play is a local preview. Nothing is sent.');
    const priority = PM51.segmented(e.priority || 'Normal', PRIORITIES, { action: 'pm51-notifications-event-priority', data, label: 'Priority' }) + `<p class="pm51-ps-help pm51-priority-help">${h(priorityMeta(e.priority || 'Normal'))}</p>`;
    const details = e.custom ? PM51.panelSection('Details',
      PM51.field('Name', PM51.input(e.name, { action: 'pm51-notifications-event-name', data, label: 'Event name' }), 'Scripts and automations raise this event by its name.')
      + PM51.field('When it fires', PM51.input(e.description || '', { action: 'pm51-notifications-event-desc', data, label: 'When it fires', placeholder: 'e.g. Raised by the nightly report script' }))
      + '<div class="pm51-notif-inline">' + PM51.btn({ label: 'Remove event', icon: 'trash', danger: true, small: true, action: 'pm51-notifications-event-remove', data }) + '</div>',
      'Only custom events can be renamed or removed.', { icon: 'edit' }) : '';
    const wrap = PM51.panel({
      icon: 'bell', eyebrow: e.custom ? 'Custom event' : 'Event', title: e.name, summary: e.description || '',
      status: { label: e.enabled ? 'On' : 'Off', tone: e.enabled ? 'ready' : 'off' }, facts: eventFacts(e),
      body: PM51.panelSection('Where it goes', where, 'Pick every place this alert should arrive.', { icon: 'route' })
        + PM51.panelSection('Sound', sound, undefined, { icon: 'volume' })
        + PM51.panelSection('Priority', priority, 'Urgent alerts get through quiet hours when a destination allows it.', { icon: 'alert' })
        + details,
      primaryLabel: 'Done', onPrimary: () => save()
    });
    eventSheet = { id: e.id, wrap };
  }
  /* Keep the open sheet's header honest after a change made from either the sheet or the row behind it. */
  function refreshEventSheet(e) {
    const s = eventSheet; if (!s || s.id !== e.id || !s.wrap.isConnected) return;
    const facts = eventFacts(e);
    s.wrap.querySelectorAll('.pm51-hero-facts dd').forEach((dd, i) => { if (facts[i]) dd.textContent = String(facts[i].value); });
    const st = s.wrap.querySelector('.pm51-hero-status'); if (st) st.innerHTML = PM51.status(e.enabled ? 'On' : 'Off', e.enabled ? 'ready' : 'off');
    const title = s.wrap.querySelector('.pm51-panel-title'); if (title) title.textContent = e.name;
    const sum = s.wrap.querySelector('.pm51-hero-summary'); if (sum) sum.textContent = e.description || '';
    const ph = s.wrap.querySelector('.pm51-priority-help'); if (ph) ph.textContent = priorityMeta(e.priority || 'Normal');
    const dlg = s.wrap.querySelector('.drawer'); if (dlg) dlg.setAttribute('aria-label', e.name);
  }
  function renameEvent(e, name) {
    const old = e.name; if (!name || name === old) return;
    (N().agents || []).forEach(g => { g.events = (g.events || []).map(n => n === old ? name : n); });
    (N().history || []).forEach(r => { if (r.event === old) r.event = name; });
    e.name = name;
  }
  const nameTaken = (name, except) => events().some(e => e !== except && e.name.toLowerCase() === String(name).toLowerCase());
  function groupPanel(id) {
    const g = (N().agents || []).find(x => x.id === id); if (!g) return;
    PM51.panel({
      icon: 'users', eyebrow: 'Escalation group', title: g.name, status: { label: g.status === 'active' ? 'Ready' : 'Off', tone: g.status === 'active' ? 'ready' : 'off' },
      facts: [{ label: 'Watches', value: `${g.events.length} ${g.events.length === 1 ? 'event' : 'events'}` }, { label: 'Sends to', value: g.destinations.length ? g.destinations.join(', ') : 'Nowhere yet' }, { label: 'Escalation', value: g.escalation === 'None' ? 'None' : g.escalation }],
      body: PM51.panelSection('Watches', PM51.kv([['Events', g.events.join(', ')], ['Sends to', g.destinations.join(', ') || 'Nowhere yet']]), undefined, { icon: 'eye' })
        + PM51.panelSection('If nobody responds', PM51.field('Escalation', PM51.dropdown(g.escalation, ESCALATIONS.includes(g.escalation) ? ESCALATIONS : [g.escalation, ...ESCALATIONS], { action: 'pm51-notifications-group-escalation', data: { id }, label: 'Escalation' })), undefined, { icon: 'clock' })
        + PM51.panelSection('Status', PM51.rows([{ label: 'Group is active', control: PM51.toggle(g.status === 'active', { action: 'pm51-notifications-group-toggle', data: { id }, label: 'Group is active' }) }])),
      primaryLabel: 'Done', onPrimary: () => save()
    });
  }

  /* ---------- Sounds ------------------------------------------------------- */
  function waveform() {
    const hs = [7, 13, 19, 10, 22, 16, 8, 18, 24, 12, 20, 9, 15, 23, 11, 17, 8, 14];
    return `<span class="sound-waveform">${hs.map((hgt, i) => `<i style="--h:${hgt}px;--n:${i}"></i>`).join('')}</span>`;
  }
  /* Library card: play + name + menu, source tag + length, "Used by …" + Use for events… */
  function soundCard(s) {
    const available = soundAvailable(s);
    const playing = state.soundPlaying === s.id;
    const used = eventsUsing(s).map(e => e.name);
    const usedText = used.length ? 'Used by ' + used.join(', ') : 'Not used yet';
    const disabled = available ? '' : ` aria-disabled="true" data-disabled-reason="The uploaded file is missing. Choose Replace file from its menu to attach it again." data-pm-hover-label="${a(s.name)} is unavailable" data-pm-hover-detail="The uploaded file is missing."`;
    const hover = available ? ` data-pm-hover-label="${playing ? 'Stop' : 'Play'} ${a(s.name)} preview" data-pm-hover-detail="${playing ? 'Stop this local preview.' : 'Preview this sound locally.'}"` : '';
    return `<div class="sound-row pm51-sound-card${playing ? ' is-playing' : ''}${available ? '' : ' is-unavailable'}" data-sound-row="${a(s.id)}">
      <button type="button" class="sound-play${playing ? ' is-playing' : ''}" data-action="play-sound" data-id="${a(s.id)}" aria-pressed="${playing ? 'true' : 'false'}" aria-label="${playing ? 'Stop' : 'Play'} ${a(s.name)} preview"${hover}${disabled}>${icon(playing ? 'volume' : 'play')}</button>
      <span class="sound-copy"><strong>${h(s.name)}</strong>${available ? '' : PM51.status('File missing', 'attention')}</span>
      ${waveform()}
      <button type="button" class="icon-btn" data-action="pm51-notifications-sound-menu" data-id="${a(s.id)}" aria-label="Manage ${a(s.name)}" data-pm-hover-label="Manage ${a(s.name)}" data-pm-hover-detail="Rename, replace the file, or choose which events use it.">${icon('more')}</button>
      <span class="pm51-sound-lines"><span class="pm51-sound-meta">${PM51.tag(sourceLabel(s))} · ${h(durationText(s.duration))}${!isBuiltInSound(s) && s.format ? ' · ' + h(String(s.format)) : ''}</span><span class="pm51-sound-used"><span class="pm51-sound-used-text" title="${a(usedText)}">${h(usedText)}</span>${PM51.link({ label: 'Use for events…', action: 'pm51-notifications-assign-open', data: { id: s.id } })}</span></span>
    </div>`;
  }
  function soundsTab() {
    const ev = events();
    const packs = N().packs || [];
    const adv = N().soundSettings || (N().soundSettings = { volume: 70, whenFocused: true });
    const library = sounds().length ? `<div class="pm51-sound-list pm51-sound-grid">${sounds().map(soundCard).join('')}</div>` : PM51.note('No sounds yet. Add one to get started.');
    const eventRows = ev.map(e => ({ label: e.name, help: e.enabled ? undefined : 'This alert is off.', control: soundControl(e) }));
    const packRows = packs.map(p => ({ label: p.name, help: `${p.sounds} sounds · Licence ${String(p.license || 'unknown').toLowerCase()} · example only, not playable`, control: PM51.toggle(p.status === 'active', { action: 'pm51-notifications-pack-toggle', data: { id: p.id }, label: p.name }) }));
    return PM51.section({ title: 'Sound library', help: 'Six demo tones are built in. Upload your own or import a pack.', action: { label: 'Add sound', icon: 'plus', small: true, action: 'pm51-notifications-add-sound' }, body: library })
      + PM51.section({ title: 'Event sounds', help: 'Which sound plays for each alert. Press play to hear it.', body: ev.length ? PM51.rows(eventRows) : PM51.note('No events yet. Add one under Events.') })
      + PM51.section({ title: 'Sound packs', help: 'Sets of sounds made for PeonPing-compatible apps.', action: { label: 'Import pack', icon: 'download', small: true, action: 'import-peonping-pack' }, body: packRows.length ? PM51.rows(packRows) : PM51.note('No packs imported yet.') })
      + PM51.advanced([
        PM51.rows([
          { label: 'Default volume', help: 'Used unless a sound sets its own.', control: PM51.input(adv.volume, { type: 'number', action: 'pm51-notifications-volume', label: 'Default volume', placeholder: '0 to 100' }) },
          { label: 'Play when this app is focused', help: 'Off means sounds only play while you are elsewhere.', control: PM51.toggle(adv.whenFocused !== false, { action: 'pm51-notifications-when-focused', label: 'Play when this app is focused' }) }
        ]),
        PM51.section({ title: 'Licence details', body: packs.length ? PM51.kv(packs.map(p => [p.name, `Licence ${String(p.license || 'unknown').toLowerCase()} · version ${p.version || '?'} · ${p.source}`])) : PM51.note('No packs imported yet.') }),
        PM51.section({ title: 'Export', body: '<div class="pm51-notif-inline">' + PM51.btn({ label: 'Export pack', icon: 'download', small: true, action: 'pm51-notifications-export-pack' }) + '</div>' })
      ].join(''));
  }
  /* Assign sheet: one sound, a toggle per event. */
  function assignPanel(s) {
    const used = eventsUsing(s);
    const rows = PM51.rows(events().map(e => ({ label: e.name, help: e.sound && e.sound !== 'None' && e.sound !== s.name ? `Now: ${e.sound}` : (e.enabled ? undefined : 'This alert is off.'), control: PM51.toggle(e.sound === s.name, { action: 'pm51-notifications-assign', data: { event: e.id, sound: s.id }, label: e.name }) })));
    PM51.panel({
      icon: 'volume', eyebrow: 'Sound', title: `Use ${s.name} for`, subtitle: 'Each alert can have one sound.',
      status: { label: soundAvailable(s) ? 'Ready to play' : 'File missing', tone: soundAvailable(s) ? 'ready' : 'attention' },
      facts: [{ label: 'Source', value: sourceLabel(s) }, { label: 'Length', value: durationText(s.duration) }, { label: 'Used by', value: `${used.length} ${used.length === 1 ? 'event' : 'events'}` }],
      body: PM51.panelSection('Events', events().length ? rows : PM51.note('No events yet. Add one under Events.'), 'Turn on every alert that should play this sound.', { icon: 'bell' }),
      primaryLabel: 'Done', onPrimary: () => save()
    });
  }
  function renameSound(s) {
    openDialog({
      title: `Rename ${s.name}`, subtitle: 'Events keep using it under the new name.',
      body: PM51.form([{ label: 'Name', name: 'name', value: s.name, autofocus: true, full: true }]),
      saveLabel: 'Rename', onOpen: focusField, onSave: data => {
        const name = String(data.name || '').trim();
        if (!name) { PM51.toast('Give the sound a name', 'Something you will recognise in the list.', 'info'); return false; }
        if (name !== s.name && sounds().some(x => x !== s && x.name.toLowerCase() === name.toLowerCase())) { PM51.toast('That name is taken', `There is already a sound called ${name}.`, 'info'); return false; }
        events().forEach(e => { if (e.sound === s.name) e.sound = name; });
        s.name = name; save(); PM51.toast('Sound renamed', `${name} is ready.`);
      }
    });
  }

  /* ---------- Quiet hours -------------------------------------------------- */
  function quietTab() {
    const q = N().quiet || (N().quiet = { enabled: false, start: '10:30 PM', end: '8:00 AM', urgentOverride: true, weekends: 'Same schedule' });
    q.exceptions = q.exceptions || {};
    const sel = (key, value, options) => PM51.dropdown(value, options.includes(value) ? options : [value, ...options], { action: 'pm51-notifications-quiet', data: { key }, label: humanize(key) });
    return PM51.section({
      title: 'Quiet hours', help: 'A daily window when alerts wait instead of interrupting you.',
      body: PM51.rows([
        { label: 'Quiet hours', help: q.enabled ? `${q.start} to ${q.end}` : 'Alerts arrive any time.', control: PM51.toggle(!!q.enabled, { action: 'pm51-notifications-quiet-toggle', data: { key: 'enabled' }, label: 'Quiet hours' }) },
        { label: 'Start', control: sel('start', q.start, TIMES) },
        { label: 'End', control: sel('end', q.end, TIMES) },
        { label: 'Weekends', control: sel('weekends', q.weekends, ['Same schedule', 'Quiet all weekend', 'No quiet hours on weekends']) },
        { label: 'Let urgent alerts through', help: 'Only to destinations that allow urgent alerts.', control: PM51.toggle(!!q.urgentOverride, { action: 'pm51-notifications-quiet-toggle', data: { key: 'urgentOverride' }, label: 'Let urgent alerts through' }) }
      ])
    }) + PM51.section({
      title: 'During quiet hours',
      body: PM51.rows([
        { label: 'Other alerts', help: 'Deliver later sends them when quiet hours end.', control: PM51.segmented(q.during || 'Deliver later', ['Deliver later', 'Skip'], { action: 'pm51-notifications-quiet-during', label: 'Other alerts' }) },
        { label: 'Repeat urgent every', help: 'Until someone responds.', control: sel('repeatUrgent', q.repeatUrgent || '10 minutes', ['5 minutes', '10 minutes', '15 minutes', '30 minutes', 'Never']) }
      ])
    }) + PM51.advanced([
      PM51.section({ title: 'Destination exceptions', help: 'These always deliver, even during quiet hours.', body: PM51.rows(dests().map(d => ({ label: d.name, help: typeLabel(d), control: PM51.toggle(!!q.exceptions[d.id], { action: 'pm51-notifications-quiet-exception', data: { dest: d.id }, label: d.name }) }))) }),
      PM51.rows([
        { label: 'Escalation groups', control: sel('escalation', q.escalation || 'Follow quiet hours', ['Follow quiet hours', 'Ignore quiet hours']) },
        { label: 'Time zone', help: 'Quiet hours follow this clock.', control: sel('timeZone', q.timeZone || 'Same as this device', ['Same as this device', 'Same as your server']) }
      ])
    ].join(''));
  }

  /* ---------- History ------------------------------------------------------ */
  function historyTab() {
    const rows = (N().history || []).map((hrow, i) => ({
      title: hrow.event, meta: `${hrow.time} · ${hrow.destination}`,
      end: `<span class="pm51-notif-result">${PM51.dot(resultTone(hrow.result))}${h(hrow.result)}</span>${icon('chevron')}`,
      action: 'pm51-notifications-history', data: { index: i }
    }));
    return PM51.section({ title: 'Delivery history', help: 'The most recent alerts and what happened to them.', body: rows.length ? PM51.list(rows) : PM51.note('Nothing delivered yet.') })
      + PM51.advanced(PM51.section({ title: 'Log', body: PM51.kv([['Kept for', '30 days'], ['Secrets', 'Never written to the log']]) + '<div class="pm51-notif-inline">' + PM51.btn({ label: 'Export log', icon: 'download', small: true, action: 'pm51-notifications-export' }) + PM51.btn({ label: 'Run diagnostics', icon: 'test', small: true, action: 'pm51-notifications-diagnostics' }) + '</div>' }));
  }
  function historyPanel(i) {
    const hrow = (N().history || [])[i]; if (!hrow) return;
    const retrying = /retry/i.test(hrow.result);
    PM51.panel({
      icon: 'history', eyebrow: 'Delivery', title: hrow.event, status: { label: hrow.result, tone: resultTone(hrow.result) }, subtitle: `${hrow.time} · ${hrow.destination}`,
      facts: [{ label: 'Destination', value: hrow.destination }, { label: 'Took', value: hrow.latency || 'Unknown' }, { label: 'Time', value: hrow.time }],
      body: PM51.panelSection('What happened', PM51.kv([['Event', hrow.event], ['Destination', hrow.destination], ['Result', hrow.result], ['Took', hrow.latency || 'Unknown'], ['Time', hrow.time]])) + (retrying ? PM51.note('Puppet Master keeps retrying for a while, then gives up and tells you.', 'attention') : ''),
      primaryLabel: retrying ? 'Retry now' : '', onPrimary: retrying ? () => example('Retry requested', 'Example data only. No alert was sent in this preview.') : null
    });
  }

  /* ---------- page --------------------------------------------------------- */
  function render() {
    const t = tab();
    const body = t === 'events' ? eventsTab() : t === 'sounds' ? soundsTab() : t === 'quiet' ? quietTab() : t === 'history' ? historyTab() : destinationsTab();
    return PM51.page({ id: ID, key: KEY, tabs: TABS, active: t, body, quiet: [{ label: 'Reset notification defaults', action: 'pm51-notifications-reset' }, { label: 'How notifications work', action: 'pm51-notifications-help' }, { label: 'Run diagnostics', action: 'pm51-notifications-diagnostics' }] });
  }
  PM51.manager('notifications', { render });

  /* ---------- actions: destinations ---------------------------------------- */
  PM51.on('notifications-add-dest', () => openDialog({
    title: 'Add destination', subtitle: 'Where should alerts go?',
    body: PM51.form([
      { label: 'Type', name: 'type', type: 'select', choices: X().destinationTypes || ['Slack', 'Discord', 'Generic webhook', 'ntfy', 'Pushover', 'Telegram', 'In-app', 'System / tray'] },
      { label: 'Name', name: 'name', placeholder: 'e.g. Team Slack', autofocus: true },
      { label: 'Where it goes', name: 'address', placeholder: 'Webhook address, topic, or chat id', full: true, help: 'Stored in the credential store on your server and shown masked afterwards. Not needed for In-app or System / tray.' },
      { label: 'Allow urgent alerts', name: 'urgent', value: true, type: 'checkbox', full: true }
    ]),
    saveLabel: 'Add destination', onOpen: focusField, onSave: data => {
      const name = String(data.name || '').trim(); if (!name) { PM51.toast('Give it a name', 'Something you will recognise, like Team Slack.', 'info'); return false; }
      const type = data.type || 'Generic webhook'; const builtIn = BUILT_IN_TYPES.includes(type);
      if (!builtIn && !String(data.address || '').trim()) { PM51.toast('Add the address', 'The webhook address, topic, or chat id it should reach.', 'info'); return false; }
      const d = { id: uid('dest', name), name, type, status: builtIn ? 'active' : 'setup', address: builtIn ? (type === 'In-app' ? 'Activity center' : 'This device') : String(data.address).trim(), urgent: !!data.urgent };
      N().destinations.push(d); PM51.setSel(ID, d.id); PM51.setTab(ID, 'destinations'); save();
      PM51.toast('Destination added', builtIn ? `${name} is ready.` : `${name} is saved. Send a test to make sure it works.`);
    }
  }));
  PM51.on('notifications-test', el => { const d = destById(ds(el, 'dest')); PM51.check({ title: `Send test to ${d.name}`, steps: [
    { title: 'Destination reachable', desc: isBuiltIn(d) ? typeLabel(d) : mask(d) },
    { title: 'Message built', desc: '"Test alert from Puppet Master" with the current time' },
    { title: 'Delivered', desc: isBuiltIn(d) ? 'Appears in this app' : 'Waits for the service to confirm', status: 'Example', tone: 'info' }
  ] }); });
  PM51.on('notifications-dest-on', el => { const d = destById(ds(el, 'dest')); d.status = d.prevStatus || 'active'; delete d.prevStatus; save(); });
  PM51.on('notifications-dest-urgent', el => { const d = destById(ds(el, 'dest')); d.urgent = !d.urgent; save(); });
  PM51.onChange('notifications-dest-adv', el => { const d = destById(ds(el, 'dest')); d.advanced = d.advanced || {}; d.advanced[ds(el, 'key')] = el.value; saveState(); });
  PM51.on('notifications-export', el => PM51.panel({
    icon: 'download', title: 'Export delivery log', subtitle: ds(el, 'dest') ? destById(ds(el, 'dest')).name : 'All destinations',
    body: PM51.panelSection('What is included', PM51.kv([['Deliveries', `${(N().history || []).length} recent`], ['Addresses and secrets', 'Never included'], ['Format', 'Plain text file']])),
    primaryLabel: 'Save log', onPrimary: () => example('Log ready', 'Example data only. No file was written in this preview.')
  }));
  PM51.on('notifications-diagnostics', el => { const d = ds(el, 'dest') ? destById(ds(el, 'dest')) : null; PM51.check({ title: d ? `${d.name} diagnostics` : 'Notifications diagnostics', steps: d ? [
    { title: 'Settings readable', desc: 'Type, address, and urgent flag resolved' },
    { title: 'Address well formed', desc: mask(d), status: isBuiltIn(d) ? 'Checked' : 'Example', tone: isBuiltIn(d) ? 'ready' : 'info' },
    { title: 'Service answers', desc: 'A tiny test message', status: 'Example', tone: 'info' }
  ] : [
    { title: 'Destinations listed', desc: `${dests().length} destinations, ${dests().filter(x => x.status === 'active').length} working` },
    { title: 'Events routed', desc: `${events().filter(e => e.enabled).length} of ${events().length} on` },
    { title: 'Sounds playable', desc: `${sounds().filter(soundAvailable).length} of ${sounds().length}` },
    { title: 'Services answer', desc: 'One tiny test message each', status: 'Example', tone: 'info' }
  ] }); });

  /* ---------- actions: events (every handler is addressed by data-event="<id>") ---------- */
  const inBody = el => !!(el && el.closest && el.closest('[data-workspace-block]'));
  PM51.on('notifications-event', el => eventPanel(ds(el, 'event')));
  PM51.on('notifications-event-toggle', el => {
    const e = eventById(ds(el, 'event')); if (!e) return;
    e.enabled = !e.enabled; el.classList.toggle('on', e.enabled); el.setAttribute('aria-checked', e.enabled ? 'true' : 'false'); saveState();
    const fromBody = inBody(el); PM51.refresh(ID, { swap: false });
    if (fromBody) refocus(`[data-action="pm51-notifications-event-toggle"][data-event="${cssEscape(e.id)}"]`);
    refreshEventSheet(e);
  });
  PM51.on('notifications-event-dest', el => {
    const e = eventById(ds(el, 'event')); const d = dests().find(x => x.id === ds(el, 'dest')); if (!e || !d) return;
    const on = !e.destinations.includes(d.name);
    e.destinations = on ? [...e.destinations, d.name] : e.destinations.filter(n => n !== d.name);
    el.classList.toggle('on', on); el.setAttribute('aria-checked', on ? 'true' : 'false'); saveState();
    PM51.refresh(ID, { swap: false }); refreshEventSheet(e);
  });
  /* One handler for every event-sound dropdown: row, Event sounds list, and the sheet. The body re-renders so
     metas and the library's "Used by" follow; the sheet only swaps its own preview button and facts. */
  PM51.onChange('notifications-event-sound', el => {
    const e = eventById(ds(el, 'event')); if (!e) return;
    e.sound = el.value || 'None'; saveState();
    const label = el.closest('.pm51-dd')?.querySelector('.pm51-dd-value'); const opt = el.options[el.selectedIndex]; if (label && opt) label.textContent = opt.textContent;
    const pick = el.closest('.pm51-sound-pick'); const btn = pick && pick.querySelector('.pm51-sound-inline-play');
    if (btn) btn.outerHTML = playButton(e.sound !== 'None' ? soundByName(e.sound) : null, { labelled: btn.classList.contains('pm51-btn') });
    const fromBody = inBody(el); PM51.refresh(ID, { swap: false });
    if (fromBody) refocus(`select[data-action="pm51-notifications-event-sound"][data-event="${cssEscape(e.id)}"]`);
    refreshEventSheet(e);
  });
  PM51.on('notifications-event-priority', el => {
    const e = eventById(ds(el, 'event')); if (!e) return;
    e.priority = PRIORITIES.includes(ds(el, 'value')) ? ds(el, 'value') : 'Normal'; saveState();
    el.parentElement.querySelectorAll('button').forEach(b => { const on = b === el; b.classList.toggle('active', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    PM51.refresh(ID, { swap: false }); refreshEventSheet(e);
  });
  /* Typing only previews the title; the rename (and its propagation into groups and history) happens on a validated commit. */
  PM51.onInput('notifications-event-name', el => { const s = eventSheet; const t = s && s.wrap.isConnected ? s.wrap.querySelector('.pm51-panel-title') : null; if (t) t.textContent = String(el.value || '').trim() || (eventById(ds(el, 'event')) || {}).name || ''; });
  PM51.onChange('notifications-event-name', el => {
    const e = eventById(ds(el, 'event')); if (!e) return;
    const name = String(el.value || '').trim();
    if (!name) { el.value = e.name; PM51.toast('Keep a name', 'An event needs a name so scripts can raise it.', 'info'); }
    else if (nameTaken(name, e)) { el.value = e.name; PM51.toast('That name is taken', `There is already an event called ${name}. Pick another name.`, 'info'); }
    else renameEvent(e, name);
    saveState(); PM51.refresh(ID, { swap: false }); refreshEventSheet(e);
  });
  PM51.onInput('notifications-event-desc', el => { const e = eventById(ds(el, 'event')); if (!e) return; e.description = String(el.value || '').trim(); saveState(); refreshEventSheet(e); });
  PM51.on('notifications-event-remove', el => {
    const e = eventById(ds(el, 'event')); if (!e) return;
    PM51.confirm(`Remove ${e.name}?`, 'Nothing is delivered for it any more, and escalation groups stop watching it. Scripts that raise it are not changed.', 'Remove', () => {
      N().events = events().filter(x => x.id !== e.id);
      (N().agents || []).forEach(g => { g.events = (g.events || []).filter(n => n !== e.name); });
      eventSheet = null; PM51.setTab(ID, 'events'); save(); PM51.toast('Event removed', `${e.name} is gone.`);
    }, true);
  });
  PM51.on('notifications-group', el => groupPanel(ds(el, 'id')));
  PM51.onChange('notifications-group-escalation', el => { const g = (N().agents || []).find(x => x.id === ds(el, 'id')); if (g) { g.escalation = el.value; saveState(); } });
  PM51.on('notifications-group-toggle', el => { const g = (N().agents || []).find(x => x.id === ds(el, 'id')); if (!g) return; g.status = g.status === 'active' ? 'disabled' : 'active'; el.classList.toggle('on', g.status === 'active'); el.setAttribute('aria-checked', g.status === 'active' ? 'true' : 'false'); saveState(); });
  /* Add event: name, when it fires, priority, where it goes (working destinations first, In-app pre-checked), sound. */
  PM51.on('notifications-add-event', () => {
    const inApp = dests().find(d => TYPE_LABEL[d.type] === 'In this app');
    const checks = destsSorted().map(d => formField(d.name, 'dest:' + d.id, !!inApp && d.id === inApp.id, { type: 'checkbox', help: `${typeLabel(d)} · ${destStatus(d)}` })).join('');
    openDialog({
      title: 'Add event', subtitle: 'An alert your own scripts and automations can raise.',
      body: PM51.form([
        { label: 'Name', name: 'name', placeholder: 'e.g. Nightly report ready', autofocus: true, full: true, help: 'Scripts raise the event by this exact name.' },
        { label: 'When it fires', name: 'description', placeholder: 'e.g. Raised by the nightly report script', full: true }
      ])
      + `<label class="form-field"><span class="form-label">Priority</span>${PM51.dropdown('Normal', priorities(), { name: 'priority', label: 'Priority' })}</label>`
      + `<label class="form-field"><span class="form-label">Sound</span>${PM51.dropdown('None', soundOptions(), { name: 'sound', label: 'Sound' })}</label>`
      + `<div class="form-field full"><span class="form-label">Send to</span><div class="pm51-check-list">${checks || '<div class="form-help">No destinations yet. Add one under Destinations.</div>'}</div><div class="form-help">Working destinations are listed first. You can change this later from the event.</div></div>`,
      saveLabel: 'Add event', onOpen: focusField, onSave: data => {
        const name = String(data.name || '').trim();
        if (!name) { PM51.toast('Give the event a name', 'Something like Nightly report ready.', 'info'); return false; }
        if (nameTaken(name)) { PM51.toast('That name is taken', `There is already an event called ${name}. Pick another name.`, 'info'); return false; }
        const destinations = dests().filter(d => data['dest:' + d.id]).map(d => d.name);
        const e = { id: uniqueId(uid('event', name), new Set(events().map(x => x.id))), name, description: String(data.description || '').trim() || 'Raised by your own automation.', enabled: true, destinations, sound: data.sound || 'None', priority: PRIORITIES.includes(data.priority) ? data.priority : 'Normal', custom: true };
        N().events.push(e); PM51.setTab(ID, 'events'); save();
        PM51.toast('Event added', `Your scripts and automations raise it by name: "${name}". It goes to ${destinations.length ? destinations.join(', ') : 'nowhere yet'}.`);
      }
    });
  });
  PM51.on('notifications-export-events', () => PM51.panel({ icon: 'download', title: 'Export events', body: PM51.panelSection('What is included', PM51.kv([['Events', `${events().length}`], ['Destinations', 'Names only, never addresses'], ['Sounds', 'Names only']])), primaryLabel: 'Save file', onPrimary: () => example('Export ready', 'Example data only. No file was written in this preview.') }));
  PM51.on('notifications-import-events', () => openDialog({ title: 'Import events', subtitle: 'Bring event settings from another workspace.', body: PM51.form([{ label: 'File', name: 'file', type: 'file', full: true, help: 'A file exported from Puppet Master.' }]), saveLabel: 'Import', onSave: () => example('Import requested', 'Example data only. Nothing was imported in this preview.') }));

  /* ---------- actions: sounds ---------------------------------------------- */
  PM51.on('notifications-add-sound', el => PM51.menu(el, [
    { label: 'Upload file', icon: 'upload', meta: 'WAV, MP3, OGG, M4A', onClick: () => editSound() },
    { label: 'Import pack', icon: 'download', meta: 'PeonPing-compatible', onClick: () => dispatchAction('import-peonping-pack', el, null) }
  ], 'Add sound'));
  PM51.on('notifications-assign-open', el => { const s = sounds().find(x => x.id === ds(el, 'id')); if (s) assignPanel(s); });
  PM51.on('notifications-sound-menu', el => {
    const s = sounds().find(x => x.id === ds(el, 'id')); if (!s) return;
    const playBtn = root.querySelector(`.sound-play[data-id="${cssEscape(s.id)}"]`);
    const available = soundAvailable(s);
    const used = eventsUsing(s);
    PM51.menu(el, [
      { label: state.soundPlaying === s.id ? 'Stop preview' : 'Play preview', icon: state.soundPlaying === s.id ? 'volume' : 'play', ariaDisabled: !available, meta: available ? '' : 'File missing', onClick: () => { if (playBtn) dispatchAction('play-sound', playBtn, null); } },
      { label: 'Use for events…', icon: 'bell', meta: used.length ? `${used.length} now` : '', onClick: () => assignPanel(s) },
      { label: 'Rename', icon: 'edit', onClick: () => renameSound(s) },
      { label: 'Replace file', icon: 'upload', onClick: () => editSound(s) },
      { separator: true },
      { label: 'Remove', icon: 'trash', danger: true, onClick: () => PM51.confirm(`Remove ${s.name}?`, used.length ? `${used.map(e => e.name).join(', ')} will have no sound.` : 'No event uses it right now.', 'Remove', () => { events().forEach(e => { if (e.sound === s.name) e.sound = 'None'; }); settingsSoundPreview.releaseFile(s.id); N().sounds = sounds().filter(x => x.id !== s.id); save(); PM51.toast('Sound removed', `${s.name} is gone.`); }, true) }
    ], s.name);
  });
  PM51.on('notifications-assign', el => {
    const e = eventById(ds(el, 'event')); const s = sounds().find(x => x.id === ds(el, 'sound')); if (!e || !s) return;
    const on = e.sound !== s.name; e.sound = on ? s.name : 'None';
    el.classList.toggle('on', on); el.setAttribute('aria-checked', on ? 'true' : 'false');
    const help = el.closest('.pm51-row')?.querySelector('.pm51-row-help'); if (help) help.remove();
    saveState(); PM51.refresh(ID, { swap: false });
    const dd = el.closest('.drawer-wrap')?.querySelectorAll('.pm51-hero-facts dd')[2]; if (dd) { const n = eventsUsing(s).length; dd.textContent = `${n} ${n === 1 ? 'event' : 'events'}`; }
  });
  PM51.on('notifications-pack-toggle', el => { const p = (N().packs || []).find(x => x.id === ds(el, 'id')); if (!p) return; p.status = p.status === 'active' ? 'disabled' : 'active'; save(); });
  PM51.onInput('notifications-volume', el => { const n = Number(el.value); if (!Number.isFinite(n)) return; N().soundSettings.volume = Math.max(0, Math.min(100, n)); saveState(); });
  PM51.on('notifications-when-focused', () => { N().soundSettings.whenFocused = N().soundSettings.whenFocused === false; save(); });
  PM51.on('notifications-export-pack', () => PM51.panel({ icon: 'download', title: 'Export pack', subtitle: 'Share your sounds as a PeonPing-compatible pack.', body: PM51.panelSection('What is included', PM51.kv([['Sounds', `${sounds().filter(soundAvailable).length} playable`], ['Demo tones', 'Included as generated tones'], ['Licence', 'You choose one during export']])), primaryLabel: 'Save pack', onPrimary: () => example('Pack ready', 'Example data only. No file was written in this preview.') }));

  /* ---------- actions: quiet hours ------------------------------------------ */
  PM51.on('notifications-quiet-toggle', el => { const q = N().quiet; const k = ds(el, 'key'); q[k] = !q[k]; save(); });
  PM51.onChange('notifications-quiet', el => { N().quiet[ds(el, 'key')] = el.value; save(); });
  PM51.on('notifications-quiet-during', el => { N().quiet.during = ds(el, 'value'); save(); });
  PM51.on('notifications-quiet-exception', el => { const q = N().quiet; q.exceptions = q.exceptions || {}; const id = ds(el, 'dest'); q.exceptions[id] = !q.exceptions[id]; save(); });

  /* ---------- actions: history & page ------------------------------------- */
  PM51.on('notifications-history', el => historyPanel(Number(ds(el, 'index'))));
  PM51.on('notifications-reset', () => PM51.confirm('Reset notification defaults?', 'Destinations, events, sounds, and quiet hours go back to the example defaults. Uploaded recordings are forgotten.', 'Reset', () => {
    settingsSoundPreview.clearFiles(); state.notifications = clone(D.notifications); migrateEvents(); state.soundPlaying = null; eventSheet = null; PM51.setSel(ID, 'in-app'); save(); PM51.toast('Notifications reset', 'Defaults are back.');
  }, true));
  PM51.on('notifications-help', () => PM51.panel({
    icon: 'info', title: 'How notifications work',
    body: PM51.panelSection('In short', '<p class="pm51-ps-text">An event is something worth telling you about. Each event goes to the destinations you pick, with the sound you choose, unless quiet hours say otherwise.</p>')
      + PM51.panelSection('The pieces', PM51.kv([['Destinations', 'Places an alert can arrive: this app, your system tray, a chat service, or your phone.'], ['Events', 'What triggers an alert, and where it goes. Add your own for scripts and automations; they raise it by name.'], ['Sounds', 'Demo tones are built in. Upload your own or import a pack.'], ['Quiet hours', 'A daily window when alerts wait. Urgent ones can still get through.'], ['Escalation groups', 'If nobody responds, the alert is sent somewhere louder.']]))
  }));
})();
