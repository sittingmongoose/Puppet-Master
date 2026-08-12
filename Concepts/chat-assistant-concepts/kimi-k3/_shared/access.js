/* ============================================================================
   Kimi K3 — access profiles + compact approvals (window.K3Access).

   Final cumulative packet, file 01: four access profiles (conversation mode
   and access profile stay separate; FileSafe/mandatory-deny rules always
   remain effective) and the compact approval model: compact decision,
   expandable evidence.

   Surface:
   - K3Access.PROFILES                  the four canonical profiles
   - K3Access.button(ctx)               selector-row peer (testid k3w-kit-access)
   - K3Access.approvalCard(ctx, record) DOM renderer for approvalCard
     transcript records (Deny / Allow once / Allow for session / Details)
   - K3Access.requestApproval(ctx, tid, record)
     appends the card, emits approval-requested, pushes a notifications entry
   - K3Access.crossProjectCard(ctx, record)
     cross-project grant card; one-time grants never persist

   Store: threadLocal.<tid>.access (+accessLimitedBy demo narrowing),
   approvals.<id> -> {decision, at}, notifications[].
   Events emitted on 'data': access-changed, approval-requested,
   approval-decided, notification-added, settings-deeplink.
   ========================================================================== */
(function () {
  'use strict';

  var PROFILES = [
    { id: 'ask', label: 'Ask for approval', desc: 'Every consequential action asks first.' },
    { id: 'auto-edits', label: 'Auto accept edits', desc: 'File edits apply automatically; commands still ask.' },
    { id: 'auto', label: 'Auto', desc: 'Commands and edits run without asking inside the workspace.' },
    { id: 'full', label: 'Full Access', desc: 'No approval prompts. FileSafe rules still apply.' }
  ];

  var DECISION_LABELS = {
    'deny': 'Denied',
    'once': 'Allowed once',
    'session': 'Allowed for session'
  };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function icon(name) { return window.K3Icons.get(name); }
  function activeTid(ctx) { return ctx.store.get('activeThreadId', null); }

  function profileById(id) {
    for (var i = 0; i < PROFILES.length; i++) if (PROFILES[i].id === id) return PROFILES[i];
    return PROFILES[0];
  }

  // --- approval card ------------------------------------------------------------
  function detailList(parent, label, items) {
    if (!items || !items.length) return;
    var box = el('div', 'k3a-detail-group');
    box.appendChild(el('div', 'k3a-detail-label', label));
    items.forEach(function (it) { box.appendChild(el('div', 'k3a-detail-item', String(it))); });
    parent.appendChild(box);
  }

  function approvalCard(ctx, record) {
    var store = ctx.store;
    var card = el('div', 'k3a-card');
    card.setAttribute('data-testid', 'k3a-approval-card');

    function decided() {
      var stored = store.get('approvals.' + record.id, null);
      return record.decision || (stored && stored.decision) || null;
    }

    function render() {
      card.textContent = '';
      var d = decided();
      var head = el('div', 'k3a-card-head');
      var ic = el('span', 'k3a-card-ic');
      ic.appendChild(icon('shield'));
      head.appendChild(ic);
      head.appendChild(el('span', 'k3a-card-title', record.title || 'Approval requested'));
      card.appendChild(head);
      card.appendChild(el('div', 'k3a-card-sub',
        (record.scope || 'Workspace only') + ' · ' + (record.reason || '')));

      if (d) {
        card.classList.add('is-decided');
        var line = el('div', 'k3a-card-decided' + (d === 'deny' ? ' is-denied' : ''));
        var dic = el('span', 'k3a-card-decided-ic');
        dic.appendChild(icon(d === 'deny' ? 'close' : 'check'));
        line.appendChild(dic);
        line.appendChild(el('span', '', DECISION_LABELS[d] || d));
        card.appendChild(line);
        return;
      }
      card.classList.remove('is-decided');

      var row = el('div', 'k3a-card-actions');
      function decide(decision) {
        return function () {
          store.set('approvals.' + record.id, { decision: decision, at: new Date().toISOString() });
          record.decision = decision;
          var tid = record.threadId || activeTid(ctx);
          if (tid) ctx.data.touchThread(tid);
          ctx.emit('data', { type: 'approval-decided', approvalId: record.id, decision: decision, threadId: tid });
          render();
        };
      }
      var deny = el('button', 'k3a-btn k3a-btn-deny', 'Deny');
      deny.type = 'button';
      deny.addEventListener('click', decide('deny'));
      var once = el('button', 'k3a-btn', 'Allow once');
      once.type = 'button';
      once.addEventListener('click', decide('once'));
      var session = el('button', 'k3a-btn', 'Allow for session');
      session.type = 'button';
      session.addEventListener('click', decide('session'));
      var details = el('button', 'k3a-btn k3a-btn-ghost', 'Details');
      details.type = 'button';
      details.addEventListener('click', function () {
        var panel = el('div', 'k3a-detail');
        panel.appendChild(el('div', 'k3a-detail-title', record.title || 'Approval details'));
        detailList(panel, 'Commands', record.commands);
        detailList(panel, 'Files', record.files);
        detailList(panel, 'Servers', record.servers);
        detailList(panel, 'Domains', record.domains);
        if (record.persistence) detailList(panel, 'Persistence', [record.persistence]);
        if (record.saferAlternative) detailList(panel, 'Safer alternative', [record.saferAlternative]);
        detailList(panel, 'Technical receipts', record.receipts);
        window.K3UI.popover(details, panel, { className: 'k3a-pop' });
      });
      row.appendChild(deny);
      row.appendChild(once);
      row.appendChild(session);
      row.appendChild(details);
      card.appendChild(row);
    }

    render();
    card.rerender = render;
    return card;
  }

  // --- cross-project grant card ---------------------------------------------------
  function crossProjectCard(ctx, record) {
    var card = el('div', 'k3a-card k3a-xp');
    card.setAttribute('data-testid', 'k3a-cross-project-card');

    function render() {
      card.textContent = '';
      var head = el('div', 'k3a-card-head');
      var ic = el('span', 'k3a-card-ic');
      ic.appendChild(icon('folder'));
      head.appendChild(ic);
      head.appendChild(el('span', 'k3a-card-title', 'Cross-project access'));
      card.appendChild(head);
      card.appendChild(el('div', 'k3a-card-sub',
        'This task will read ' + (record.readProject || 'Project A') +
        ' and modify ' + (record.writeProject || 'Project B') + '.'));

      var rw = el('div', 'k3a-xp-rw');
      var readRow = el('div', 'k3a-xp-row');
      readRow.appendChild(el('span', 'k3a-xp-tag k3a-xp-read', 'Read'));
      readRow.appendChild(el('span', '', record.readProject || 'Project A'));
      var writeRow = el('div', 'k3a-xp-row');
      writeRow.appendChild(el('span', 'k3a-xp-tag k3a-xp-write', 'Modify'));
      writeRow.appendChild(el('span', '', record.writeProject || 'Project B'));
      rw.appendChild(readRow);
      rw.appendChild(writeRow);
      card.appendChild(rw);

      if (record.state && record.state !== 'open') {
        card.classList.add('is-decided');
        var label = record.state === 'granted-once' ? 'Allowed once'
          : record.state === 'granted-goal' ? 'Allowed for this Goal'
          : 'Cancelled';
        var line = el('div', 'k3a-card-decided' + (record.state === 'cancelled' ? ' is-denied' : ''));
        var dic = el('span', 'k3a-card-decided-ic');
        dic.appendChild(icon(record.state === 'cancelled' ? 'close' : 'check'));
        line.appendChild(dic);
        line.appendChild(el('span', '', label));
        card.appendChild(line);
        return;
      }
      card.classList.remove('is-decided');

      function decide(state) {
        return function () {
          // one-time grants never persist across sessions — record state only
          record.state = state;
          var tid = record.threadId || activeTid(ctx);
          if (tid) ctx.data.touchThread(tid);
          ctx.emit('data', { type: 'approval-decided', approvalId: record.id, decision: state, threadId: tid });
          render();
        };
      }
      var row = el('div', 'k3a-card-actions');
      var cancel = el('button', 'k3a-btn k3a-btn-deny', 'Cancel');
      cancel.type = 'button';
      cancel.addEventListener('click', decide('cancelled'));
      var once = el('button', 'k3a-btn', 'Allow once');
      once.type = 'button';
      once.addEventListener('click', decide('granted-once'));
      var goal = el('button', 'k3a-btn', 'Allow for this Goal');
      goal.type = 'button';
      goal.addEventListener('click', decide('granted-goal'));
      var settings = el('button', 'k3a-btn k3a-btn-ghost', 'Open Settings');
      settings.type = 'button';
      settings.addEventListener('click', function () {
        var tid = record.threadId || activeTid(ctx);
        ctx.store.set('settingsReturn', { threadId: tid, routeKey: null });
        ctx.emit('data', { type: 'settings-deeplink', threadId: tid, routeKey: null, section: 'permissions' });
      });
      row.appendChild(cancel);
      row.appendChild(once);
      row.appendChild(goal);
      row.appendChild(settings);
      card.appendChild(row);
    }

    render();
    card.rerender = render;
    return card;
  }

  // --- public API ------------------------------------------------------------------
  var K3Access = {
    PROFILES: PROFILES,

    button: function (ctx) {
      var b = el('button', 'k3w-kit-sel k3a-access');
      b.type = 'button';
      b.setAttribute('aria-label', 'Access profile');
      b.setAttribute('data-testid', 'k3w-kit-access');
      var ic = el('span', 'k3w-kit-sel-ic');
      ic.appendChild(icon('shield'));
      var label = el('span', 'k3w-kit-sel-label');
      var chip = el('span', 'k3a-scope', 'This thread');
      chip.style.display = 'none';
      var chev = el('span', 'k3w-kit-sel-chev');
      chev.appendChild(icon('chevron-down'));
      b.appendChild(ic);
      b.appendChild(label);
      b.appendChild(chip);
      b.appendChild(chev);

      function current() {
        var t = activeTid(ctx);
        var eff = t ? ctx.data.effective(t) : null;
        return {
          tid: t,
          id: (eff && eff.access) || 'ask',
          overridden: !!(eff && eff.overrides && eff.overrides.access),
          limitedBy: t ? ctx.store.get('threadLocal.' + t + '.accessLimitedBy', null) : null
        };
      }
      function refresh() {
        var c = current();
        label.textContent = profileById(c.id).label;
        chip.style.display = c.overridden ? '' : 'none';
        b.title = 'Access: ' + profileById(c.id).label + (c.limitedBy ? ' · Limited by ' + c.limitedBy : '');
      }
      var unsubs = [
        ctx.store.subscribe('threadLocal', refresh),
        ctx.store.subscribe('activeThreadId', refresh)
      ];
      refresh();

      b.addEventListener('click', function () {
        var c = current();
        var items = PROFILES.map(function (p) {
          return {
            label: p.label,
            hint: p.desc,
            icon: 'shield',
            selected: p.id === c.id,
            action: function () {
              if (!c.tid) return;
              ctx.data.setThreadLocal(c.tid, { access: p.id });
              ctx.emit('data', { type: 'access-changed', threadId: c.tid, access: p.id });
            }
          };
        });
        items.push({ type: 'separator' });
        if (c.limitedBy) {
          items.push({ type: 'header', label: profileById(c.id).label + ' · Limited by ' + c.limitedBy });
        }
        items.push({ type: 'header', label: 'FileSafe rules still apply' });
        window.K3UI.menu(b, items, { width: 300 });
      });

      b.unmount = function () { unsubs.forEach(function (u) { if (u) u(); }); };
      return b;
    },

    approvalCard: approvalCard,

    requestApproval: function (ctx, tid, record) {
      record = record || {};
      if (!record.id) record.id = 'ap-' + tid + '-' + String((ctx.data.messages(tid) || []).length + 1);
      if (record.decision == null) record.decision = null;
      record.threadId = tid;
      var msg = ctx.data.appendRecord(tid, { approvalCard: record });
      ctx.emit('data', { type: 'approval-requested', threadId: tid, approvalId: record.id });
      var notes = (ctx.store.get('notifications', []) || []).slice();
      notes.push({
        id: 'ntf-' + record.id,
        kind: 'approval',
        title: record.title || 'Approval requested',
        body: (record.scope || '') + (record.reason ? ' · ' + record.reason : ''),
        at: new Date().toISOString(),
        read: false
      });
      ctx.store.set('notifications', notes);
      ctx.emit('data', { type: 'notification-added', threadId: tid, notificationId: 'ntf-' + record.id });
      return msg;
    },

    crossProjectCard: crossProjectCard
  };

  window.K3Access = K3Access;
})();
