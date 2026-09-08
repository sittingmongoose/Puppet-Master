/* Notifications & Sounds — where alerts go, what they sound like, and when to stay quiet. */
(function () {
  const ID = 'notifications';
  const KEY = 'notifications-sounds';
  const N = () => state.notifications;
  const X = () => PM51.s().notifications || {};
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
  const TIMES = []; for (let hh = 0; hh < 24; hh++) for (const mm of ['00', '30']) TIMES.push(`${hh % 12 || 12}:${mm} ${hh < 12 ? 'AM' : 'PM'}`);

  PM51.style(`
    #panel-settings .pm51-mgr .pm51-sound-list { display: flex; flex-direction: column; }
    #panel-settings .pm51-mgr .sound-row { min-height: 50px; padding: 8px 0; gap: 12px; }
    #panel-settings .pm51-mgr .sound-row:first-of-type { border-top: 0; }
    #panel-settings .pm51-mgr .sound-play[aria-disabled="true"] { opacity: .55; cursor: not-allowed; }
    #panel-settings .pm51-mgr .sound-copy .pm51-sound-title { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin: 0; color: var(--k3-text-1); font-size: 12.5px; }
    #panel-settings .pm51-mgr .sound-copy .pm51-sound-title strong { display: inline; font-size: 12.5px; font-weight: 650; color: var(--k3-text-1); }
    #panel-settings .pm51-mgr .sound-copy .pm51-sound-title .pm51-pill { display: inline-flex; margin: 0; font-size: 10.5px; min-height: 19px; padding: 0 7px; color: var(--k3-text-3); }
    #panel-settings .pm51-mgr .sound-copy > .pm51-sound-meta { font-size: 11.5px; color: var(--k3-text-3); margin-top: 2px; }
    #panel-settings .pm51-mgr .pm51-notif-inline { margin-top: 10px; display: flex; flex-wrap: wrap; gap: 8px; }
    #panel-settings .pm51-mgr .pm51-notif-result { display: inline-flex; align-items: center; gap: 7px; font-size: 12px; color: var(--k3-text-2); }
    #panel-settings .pm51-panel .pm51-notif-play { display: flex; align-items: center; gap: 8px; }
    #panel-settings .pm51-panel .pm51-notif-play .pm51-field { flex: 1 1 auto; }
  `);

  /* Unavailable recordings never play; say so instead of surfacing an audio error. */
  const pm51NotifPrevDispatch = dispatchAction;
  dispatchAction = function (action, el, event) {
    if (action === 'play-sound' && el && el.getAttribute && el.getAttribute('aria-disabled') === 'true') { PM51.toast('This sound is unavailable', el.dataset.disabledReason || 'The recording is missing. Replace the file to preview it.', 'info', 2600); return; }
    return pm51NotifPrevDispatch(action, el, event);
  };

  /* ---------- shared helpers --------------------------------------------- */
  const dests = () => N().destinations || [];
  const currentDest = () => dests().find(d => d.id === PM51.sel(ID, 'in-app')) || dests()[0];
  const destById = id => dests().find(d => d.id === id) || currentDest();
  const isBuiltIn = d => BUILT_IN_TYPES.includes(d.type);
  const typeLabel = d => TYPE_LABEL[d.type] || d.type;
  const destStatus = d => d.status === 'active' ? (isBuiltIn(d) ? 'Ready' : 'Connected') : d.status === 'attention' ? 'Needs attention' : d.status === 'disabled' ? 'Off' : 'Not set up';
  const mask = d => { if (isBuiltIn(d)) return d.address || 'This device'; const s = String(d.address || ''); if (!s) return 'Not set'; if (s.includes('•')) return s; if (s.length <= 6) return '••••'; return s.slice(0, 2) + '••••' + s.slice(-4); };
  const usedBy = d => { const ev = (N().events || []).filter(e => e.destinations.includes(d.name)).map(e => e.name); const ag = (N().agents || []).filter(a => a.destinations.includes(d.name)).map(a => a.name); return [...ev, ...ag]; };
  const lastDelivery = d => { const row = (N().history || []).find(x => x.destination === d.name); return row ? `${row.time} · ${row.result}` : 'None yet'; };
  const sounds = () => N().sounds || [];
  const soundAvailable = s => settingsSoundPreview.availability(s) !== 'file_unavailable';
  const soundNames = () => ['None', ...sounds().map(s => s.name)];
  const soundIdByName = name => sounds().find(s => s.name === name)?.id || '';
  const durationText = v => { const m = /^(?:(\d+):)?(\d+(?:\.\d+)?)$/.exec(String(v || '')); if (!m) return String(v || ''); const secs = Number(m[1] || 0) * 60 + Number(m[2]); return secs >= 60 ? `${Math.floor(secs / 60)} min ${Math.round(secs % 60)} s` : `${Number(secs.toFixed(1))} s`; };
  const resultTone = r => /deliver/i.test(r) ? 'ready' : /retry|wait/i.test(r) ? 'attention' : /fail|drop/i.test(r) ? 'blocked' : 'neutral';

  /* ---------- Destinations ------------------------------------------------ */
  function stats() {
    const ev = N().events || [];
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
      { label: 'Redaction', help: 'What is left out of the alert text.', control: PM51.select(adv.redaction || REDACTION[0], REDACTION, { action: 'pm51-notifications-dest-adv', data: data('redaction'), label: 'Redaction' }) }
    ] : [
      { label: 'Retry policy', help: 'What happens when the service does not answer.', control: PM51.select(adv.retry || RETRY[0], RETRY, { action: 'pm51-notifications-dest-adv', data: data('retry'), label: 'Retry policy' }) },
      { label: 'Rate limit', help: 'Stops a burst of alerts from flooding the service.', control: PM51.select(adv.rate || RATE[0], RATE, { action: 'pm51-notifications-dest-adv', data: data('rate'), label: 'Rate limit' }) },
      { label: 'Message format', control: PM51.select(adv.payload || PAYLOAD[0], PAYLOAD, { action: 'pm51-notifications-dest-adv', data: data('payload'), label: 'Message format' }) },
      { label: 'Redaction', help: 'What is left out of the alert text.', control: PM51.select(adv.redaction || REDACTION[0], REDACTION, { action: 'pm51-notifications-dest-adv', data: data('redaction'), label: 'Redaction' }) }
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
      title: d.name, pill: PM51.pill(destStatus(d)), subtitle: `${typeLabel(d)} · ${mask(d)}`,
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
    (N().events || []).forEach(e => { e.destinations = e.destinations.filter(n => n !== d.name); });
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
      saveLabel: 'Save', onSave: data => {
        const name = String(data.name || '').trim() || d.name;
        (N().events || []).forEach(e => { e.destinations = e.destinations.map(n => n === d.name ? name : n); });
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
  function eventsTab() {
    const ev = N().events || [];
    const eventItems = ev.map((e, i) => ({
      title: e.name, pill: e.priority === 'Urgent' ? PM51.chip('Urgent') : '',
      meta: `${e.destinations.length ? e.destinations.join(', ') : 'Nowhere yet'} · ${e.sound && e.sound !== 'None' ? e.sound : 'No sound'}`,
      end: PM51.toggle(!!e.enabled, { action: 'pm51-notifications-event-toggle', data: { index: i }, label: e.name }),
      action: 'pm51-notifications-event', data: { index: i }
    }));
    const groups = (N().agents || []).map(a => ({
      title: a.name, pill: PM51.pill(a.status === 'active' ? 'Ready' : 'Off'),
      meta: `${a.events.join(', ')} · ${a.escalation === 'None' ? 'No escalation' : a.escalation}`,
      end: icon('chevron'), action: 'pm51-notifications-group', data: { id: a.id }
    }));
    const map = PM51.kv(ev.map(e => [e.name, e.destinations.length ? e.destinations.join(', ') : 'Nowhere']));
    return PM51.section({ title: 'Events', help: 'Turn each alert on or off. Open one to choose where it goes and how it sounds.', body: PM51.list(eventItems) })
      + PM51.section({ title: 'Escalation groups', help: 'When an alert is not handled, these groups send it somewhere louder.', body: groups.length ? PM51.list(groups) : PM51.note('No escalation groups yet.') })
      + PM51.advanced([
        PM51.section({ title: 'Event to destination map', help: 'Read-only. Where each event goes right now.', body: map }),
        PM51.section({ title: 'Custom events', help: 'Alerts from your own automations and scripts.', action: { label: 'Add custom event', icon: 'plus', small: true, action: 'pm51-notifications-add-event' }, body: ev.some(e => e.custom) ? PM51.kv(ev.filter(e => e.custom).map(e => [e.name, e.priority])) : PM51.note('None yet. Custom events show up in the list above once added.') }),
        PM51.section({ title: 'Import and export', body: '<div class="pm51-notif-inline">' + PM51.btn({ label: 'Export events', icon: 'download', small: true, action: 'pm51-notifications-export-events' }) + PM51.btn({ label: 'Import events', icon: 'upload', small: true, action: 'pm51-notifications-import-events' }) + '</div>' })
      ].join(''));
  }
  function eventPanel(i) {
    const e = (N().events || [])[i]; if (!e) return;
    const checks = PM51.rows(dests().map(d => ({ label: d.name, help: `${typeLabel(d)}${d.status === 'active' ? '' : ' · ' + destStatus(d)}`, control: PM51.toggle(e.destinations.includes(d.name), { action: 'pm51-notifications-event-dest', data: { index: i, dest: d.id }, label: d.name }) })));
    const soundId = soundIdByName(e.sound);
    const sound = `<div class="pm51-notif-play">${PM51.field('Sound', PM51.select(e.sound || 'None', soundNames(), { action: 'pm51-notifications-event-sound', data: { index: i }, label: 'Sound' }))}<button type="button" class="btn small pm51-btn pm51-notif-play-btn" data-action="play-sound" data-id="${a(soundId)}" ${soundId ? '' : 'aria-disabled="true" data-disabled-reason="Choose a sound first."'}>${icon('play')}<span>Play</span></button></div>`;
    PM51.panel({
      title: e.name, pill: e.enabled ? PM51.chip('On') : PM51.pill('Off'),
      body: PM51.panelSection('Where it goes', checks, 'Pick every place this alert should arrive.') + PM51.panelSection('Sound', sound) + PM51.panelSection('Priority', PM51.segmented(e.priority || 'Normal', PRIORITIES, { action: 'pm51-notifications-event-priority', data: { index: i }, label: 'Priority' }), 'Urgent alerts get through quiet hours when a destination allows it.'),
      primaryLabel: 'Done', onPrimary: () => save()
    });
  }
  function groupPanel(id) {
    const g = (N().agents || []).find(x => x.id === id); if (!g) return;
    PM51.panel({
      title: g.name, pill: PM51.pill(g.status === 'active' ? 'Ready' : 'Off'),
      body: PM51.panelSection('Watches', PM51.kv([['Events', g.events.join(', ')], ['Sends to', g.destinations.join(', ') || 'Nowhere yet']]))
        + PM51.panelSection('If nobody responds', PM51.field('Escalation', PM51.select(g.escalation, ESCALATIONS.includes(g.escalation) ? ESCALATIONS : [g.escalation, ...ESCALATIONS], { action: 'pm51-notifications-group-escalation', data: { id }, label: 'Escalation' })))
        + PM51.panelSection('Status', PM51.rows([{ label: 'Group is active', control: PM51.toggle(g.status === 'active', { action: 'pm51-notifications-group-toggle', data: { id }, label: 'Group is active' }) }])),
      primaryLabel: 'Done', onPrimary: () => save()
    });
  }

  /* ---------- Sounds ------------------------------------------------------- */
  function waveform() {
    const hs = [7, 13, 19, 10, 22, 16, 8, 18, 24, 12, 20, 9, 15, 23, 11, 17, 8, 14];
    return `<span class="sound-waveform">${hs.map((hgt, i) => `<i style="--h:${hgt}px;--n:${i}"></i>`).join('')}</span>`;
  }
  function soundRow(s) {
    const available = soundAvailable(s);
    const playing = state.soundPlaying === s.id;
    const used = (N().events || []).filter(e => e.sound === s.name).map(e => e.name);
    const meta = `${s.source} · ${durationText(s.duration)} · ${used.length ? 'Used by ' + used.join(', ') : 'Not used yet'}`;
    const disabled = available ? '' : ` aria-disabled="true" data-disabled-reason="The uploaded file is missing. Choose Replace file from its menu to attach it again." data-pm-hover-label="${a(s.name)} is unavailable" data-pm-hover-detail="The uploaded file is missing."`;
    return `<div class="sound-row${playing ? ' is-playing' : ''}" data-sound-row="${a(s.id)}">
      <button type="button" class="sound-play${playing ? ' is-playing' : ''}" data-action="play-sound" data-id="${a(s.id)}" aria-pressed="${playing ? 'true' : 'false'}" aria-label="${playing ? 'Stop' : 'Play'} ${a(s.name)} preview"${disabled}>${icon(playing ? 'volume' : 'play')}</button>
      <span class="sound-copy"><span class="pm51-sound-title"><strong>${h(s.name)}</strong>${available ? '' : PM51.pill('Unavailable', 'neutral')}</span><span class="pm51-sound-meta">${h(meta)}${available ? '' : ' · File missing'}</span></span>
      ${waveform()}
      <button type="button" class="icon-btn" data-action="pm51-notifications-sound-menu" data-id="${a(s.id)}" aria-label="Manage ${a(s.name)}">${icon('more')}</button>
    </div>`;
  }
  function soundsTab() {
    const ev = N().events || [];
    const packs = N().packs || [];
    const adv = N().soundSettings || (N().soundSettings = { volume: 70, whenFocused: true });
    const library = sounds().length ? `<div class="pm51-sound-list">${sounds().map(soundRow).join('')}</div>` : PM51.note('No sounds yet. Add one to get started.');
    const eventRows = ev.map((e, i) => ({ label: e.name, help: e.enabled ? undefined : 'This alert is off.', control: PM51.select(e.sound || 'None', soundNames(), { action: 'set-event-sound', data: { index: i }, label: `${e.name} sound` }) }));
    const packRows = packs.map(p => ({ label: p.name, help: `${p.sounds} sounds · Licence ${String(p.license || 'unknown').toLowerCase()} · example only, not playable`, control: PM51.toggle(p.status === 'active', { action: 'pm51-notifications-pack-toggle', data: { id: p.id }, label: p.name }) }));
    return PM51.section({ title: 'Sound library', help: 'Six demo tones are built in. Upload your own or import a pack.', action: { label: 'Add sound', icon: 'plus', small: true, action: 'pm51-notifications-add-sound' }, body: library })
      + PM51.section({ title: 'Event sounds', help: 'Which sound plays for each alert.', body: PM51.rows(eventRows) })
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
  function assignPanel(s) {
    const rows = PM51.rows((N().events || []).map((e, i) => ({ label: e.name, help: e.sound && e.sound !== 'None' && e.sound !== s.name ? `Now: ${e.sound}` : undefined, control: PM51.toggle(e.sound === s.name, { action: 'pm51-notifications-assign', data: { index: i, sound: s.id }, label: e.name }) })));
    PM51.panel({ title: `Use ${s.name} for`, subtitle: 'Each alert can have one sound.', body: PM51.panelSection('Events', rows), primaryLabel: 'Done', onPrimary: () => save() });
  }

  /* ---------- Quiet hours -------------------------------------------------- */
  function quietTab() {
    const q = N().quiet || (N().quiet = { enabled: false, start: '10:30 PM', end: '8:00 AM', urgentOverride: true, weekends: 'Same schedule' });
    q.exceptions = q.exceptions || {};
    const sel = (key, value, options) => PM51.select(value, options.includes(value) ? options : [value, ...options], { action: 'pm51-notifications-quiet', data: { key }, label: humanize(key) });
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
      title: hrow.event, pill: `<span class="pm51-notif-result">${PM51.dot(resultTone(hrow.result))}${h(hrow.result)}</span>`, subtitle: `${hrow.time} · ${hrow.destination}`,
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
    saveLabel: 'Add destination', onSave: data => {
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
    title: 'Export delivery log', subtitle: ds(el, 'dest') ? destById(ds(el, 'dest')).name : 'All destinations',
    body: PM51.panelSection('What is included', PM51.kv([['Deliveries', `${(N().history || []).length} recent`], ['Addresses and secrets', 'Never included'], ['Format', 'Plain text file']])),
    primaryLabel: 'Save log', onPrimary: () => example('Log ready', 'Example data only. No file was written in this preview.')
  }));
  PM51.on('notifications-diagnostics', el => { const d = ds(el, 'dest') ? destById(ds(el, 'dest')) : null; PM51.check({ title: d ? `${d.name} diagnostics` : 'Notifications diagnostics', steps: d ? [
    { title: 'Settings readable', desc: 'Type, address, and urgent flag resolved' },
    { title: 'Address well formed', desc: mask(d), status: isBuiltIn(d) ? 'Checked' : 'Example', tone: isBuiltIn(d) ? 'ready' : 'info' },
    { title: 'Service answers', desc: 'A tiny test message', status: 'Example', tone: 'info' }
  ] : [
    { title: 'Destinations listed', desc: `${dests().length} destinations, ${dests().filter(x => x.status === 'active').length} working` },
    { title: 'Events routed', desc: `${(N().events || []).filter(e => e.enabled).length} of ${(N().events || []).length} on` },
    { title: 'Sounds playable', desc: `${sounds().filter(soundAvailable).length} of ${sounds().length}` },
    { title: 'Services answer', desc: 'One tiny test message each', status: 'Example', tone: 'info' }
  ] }); });

  /* ---------- actions: events ---------------------------------------------- */
  PM51.on('notifications-event', el => eventPanel(Number(ds(el, 'index'))));
  PM51.on('notifications-event-toggle', el => { const e = N().events[Number(ds(el, 'index'))]; if (!e) return; e.enabled = !e.enabled; save(); });
  PM51.on('notifications-event-dest', el => { const e = N().events[Number(ds(el, 'index'))]; const d = destById(ds(el, 'dest')); if (!e || !d) return; if (e.destinations.includes(d.name)) e.destinations = e.destinations.filter(n => n !== d.name); else e.destinations.push(d.name); el.classList.toggle('on', e.destinations.includes(d.name)); el.setAttribute('aria-checked', e.destinations.includes(d.name) ? 'true' : 'false'); saveState(); });
  PM51.onChange('notifications-event-sound', el => { const e = N().events[Number(ds(el, 'index'))]; if (!e) return; e.sound = el.value; saveState(); const btn = el.closest('.pm51-notif-play')?.querySelector('.pm51-notif-play-btn'); if (btn) { const id = soundIdByName(el.value); btn.dataset.id = id; if (id) { btn.removeAttribute('aria-disabled'); btn.removeAttribute('data-disabled-reason'); } else { btn.setAttribute('aria-disabled', 'true'); btn.dataset.disabledReason = 'Choose a sound first.'; } } });
  PM51.on('notifications-event-priority', el => { const e = N().events[Number(ds(el, 'index'))]; if (!e) return; e.priority = ds(el, 'value'); saveState(); el.parentElement.querySelectorAll('button').forEach(b => { const on = b === el; b.classList.toggle('active', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); }); });
  PM51.on('notifications-group', el => groupPanel(ds(el, 'id')));
  PM51.onChange('notifications-group-escalation', el => { const g = (N().agents || []).find(x => x.id === ds(el, 'id')); if (g) { g.escalation = el.value; saveState(); } });
  PM51.on('notifications-group-toggle', el => { const g = (N().agents || []).find(x => x.id === ds(el, 'id')); if (!g) return; g.status = g.status === 'active' ? 'disabled' : 'active'; el.classList.toggle('on', g.status === 'active'); el.setAttribute('aria-checked', g.status === 'active' ? 'true' : 'false'); saveState(); });
  PM51.on('notifications-add-event', () => openDialog({
    title: 'Add custom event', subtitle: 'An alert your own automations can raise.',
    body: PM51.form([
      { label: 'Name', name: 'name', placeholder: 'e.g. Nightly report ready', autofocus: true, full: true },
      { label: 'Priority', name: 'priority', type: 'select', choices: PRIORITIES, value: 'Normal' },
      { label: 'Sound', name: 'sound', type: 'select', choices: soundNames(), value: 'None' }
    ]),
    saveLabel: 'Add event', onSave: data => {
      const name = String(data.name || '').trim(); if (!name) { PM51.toast('Give the event a name', 'Something like Nightly report ready.', 'info'); return false; }
      N().events.push({ name, enabled: true, destinations: ['In-app'], sound: data.sound || 'None', priority: data.priority || 'Normal', custom: true });
      PM51.setTab(ID, 'events'); save(); PM51.toast('Custom event added', `${name} goes to In-app until you change it.`);
    }
  }));
  PM51.on('notifications-export-events', () => PM51.panel({ title: 'Export events', body: PM51.panelSection('What is included', PM51.kv([['Events', `${(N().events || []).length}`], ['Destinations', 'Names only, never addresses'], ['Sounds', 'Names only']])), primaryLabel: 'Save file', onPrimary: () => example('Export ready', 'Example data only. No file was written in this preview.') }));
  PM51.on('notifications-import-events', () => openDialog({ title: 'Import events', subtitle: 'Bring event settings from another workspace.', body: PM51.form([{ label: 'File', name: 'file', type: 'file', full: true, help: 'A file exported from Puppet Master.' }]), saveLabel: 'Import', onSave: () => example('Import requested', 'Example data only. Nothing was imported in this preview.') }));

  /* ---------- actions: sounds ---------------------------------------------- */
  PM51.on('notifications-add-sound', el => PM51.menu(el, [
    { label: 'Upload file', icon: 'upload', meta: 'WAV, MP3, OGG, M4A', onClick: () => editSound() },
    { label: 'Import pack', icon: 'download', meta: 'PeonPing-compatible', onClick: () => dispatchAction('import-peonping-pack', el, null) }
  ], 'Add sound'));
  PM51.on('notifications-sound-menu', el => {
    const s = sounds().find(x => x.id === ds(el, 'id')); if (!s) return;
    const playBtn = root.querySelector(`.sound-play[data-id="${cssEscape(s.id)}"]`);
    const available = soundAvailable(s);
    PM51.menu(el, [
      { label: 'Play preview', icon: 'play', ariaDisabled: !available, meta: available ? '' : 'File missing', onClick: () => { if (playBtn) dispatchAction('play-sound', playBtn, null); } },
      { label: 'Rename', icon: 'edit', onClick: () => editSound(s) },
      { label: 'Replace file', icon: 'upload', onClick: () => editSound(s) },
      { label: 'Use for events', icon: 'bell', onClick: () => assignPanel(s) },
      { separator: true },
      { label: 'Remove', icon: 'trash', danger: true, onClick: () => PM51.confirm(`Remove ${s.name}?`, 'Events using it will have no sound.', 'Remove', () => { (N().events || []).forEach(e => { if (e.sound === s.name) e.sound = 'None'; }); settingsSoundPreview.releaseFile(s.id); N().sounds = sounds().filter(x => x.id !== s.id); save(); PM51.toast('Sound removed', `${s.name} is gone.`); }, true) }
    ], s.name);
  });
  PM51.on('notifications-assign', el => { const e = N().events[Number(ds(el, 'index'))]; const s = sounds().find(x => x.id === ds(el, 'sound')); if (!e || !s) return; e.sound = e.sound === s.name ? 'None' : s.name; el.classList.toggle('on', e.sound === s.name); el.setAttribute('aria-checked', e.sound === s.name ? 'true' : 'false'); saveState(); });
  PM51.on('notifications-pack-toggle', el => { const p = (N().packs || []).find(x => x.id === ds(el, 'id')); if (!p) return; p.status = p.status === 'active' ? 'disabled' : 'active'; save(); });
  PM51.onInput('notifications-volume', el => { const n = Number(el.value); if (!Number.isFinite(n)) return; N().soundSettings.volume = Math.max(0, Math.min(100, n)); saveState(); });
  PM51.on('notifications-when-focused', () => { N().soundSettings.whenFocused = N().soundSettings.whenFocused === false; save(); });
  PM51.on('notifications-export-pack', () => PM51.panel({ title: 'Export pack', subtitle: 'Share your sounds as a PeonPing-compatible pack.', body: PM51.panelSection('What is included', PM51.kv([['Sounds', `${sounds().filter(soundAvailable).length} playable`], ['Demo tones', 'Included as generated tones'], ['Licence', 'You choose one during export']])), primaryLabel: 'Save pack', onPrimary: () => example('Pack ready', 'Example data only. No file was written in this preview.') }));

  /* ---------- actions: quiet hours ------------------------------------------ */
  PM51.on('notifications-quiet-toggle', el => { const q = N().quiet; const k = ds(el, 'key'); q[k] = !q[k]; save(); });
  PM51.onChange('notifications-quiet', el => { N().quiet[ds(el, 'key')] = el.value; save(); });
  PM51.on('notifications-quiet-during', el => { N().quiet.during = ds(el, 'value'); save(); });
  PM51.on('notifications-quiet-exception', el => { const q = N().quiet; q.exceptions = q.exceptions || {}; const id = ds(el, 'dest'); q.exceptions[id] = !q.exceptions[id]; save(); });

  /* ---------- actions: history & page ------------------------------------- */
  PM51.on('notifications-history', el => historyPanel(Number(ds(el, 'index'))));
  PM51.on('notifications-reset', () => PM51.confirm('Reset notification defaults?', 'Destinations, events, sounds, and quiet hours go back to the example defaults. Uploaded recordings are forgotten.', 'Reset', () => {
    settingsSoundPreview.clearFiles(); state.notifications = clone(D.notifications); state.soundPlaying = null; PM51.setSel(ID, 'in-app'); save(); PM51.toast('Notifications reset', 'Defaults are back.');
  }, true));
  PM51.on('notifications-help', () => PM51.panel({
    title: 'How notifications work',
    body: PM51.panelSection('In short', '<p class="pm51-ps-text">An event is something worth telling you about. Each event goes to the destinations you pick, with the sound you choose, unless quiet hours say otherwise.</p>')
      + PM51.panelSection('The pieces', PM51.kv([['Destinations', 'Places an alert can arrive: this app, your system tray, a chat service, or your phone.'], ['Events', 'What triggers an alert, and where it goes.'], ['Sounds', 'Demo tones are built in. Upload your own or import a pack.'], ['Quiet hours', 'A daily window when alerts wait. Urgent ones can still get through.'], ['Escalation groups', 'If nobody responds, the alert is sent somewhere louder.']]))
  }));
})();
