/* Notification lab (pm7-notifications, Opus 5.5): a small panel over the published PMConcept7 that fires every kind of
   notice and switches the look, Reduced Motion and How Alerts Appear, so the notification system can be reviewed in
   every look. It lives only on this concept page (index.html, tools/build_preview.py), never in PMConcept7. */
(function () {
  'use strict';
  if (document.getElementById('pmn-lab')) return;
  var LOOKS = [['basic', 'Basic'], ['friendly', 'Friendly'], ['retro', 'Retro'], ['glass', 'Glass'], ['nier', 'NieR']];
  var N = function () { return window.PM_TITLEBAR_NOTIFY; };
  var D = {
    run: { title: 'Run #47 complete: all seams closed.', body: 'Orchestrator · just now', severity: 'success', page: 'orchestrator', allowed_action_ids: ['open', 'acknowledge'] },
    usage: { title: 'Claude 5-hour is at 80% used.', body: 'Usage · another signed-in account can take over', severity: 'warn', kind: 'advisory', page: 'usage', allowed_action_ids: ['open', 'acknowledge'] },
    hitl: { title: 'Builder needs approval to run cargo publish', body: 'Publishing is an outward action; the node is parked at a safe point.', severity: 'warn', kind: 'hitl', page: 'orchestrator', allowed_action_ids: ['approve', 'decline', 'open_details', 'explain'], explain: 'The plan marks publishing a crate as an outward action, so it waits for you.' },
    perm: { title: 'Query Analyzer asks to run psql against staging', body: 'Allow once, for this session, or always for this pattern.', severity: 'warn', kind: 'permission', allowed_action_ids: ['deny', 'once', 'for_session', 'always'], patternSuggest: 'psql --host staging-db *' },
    safe: { title: 'Builder wants to delete 14 files in migrations/', body: 'FileSafe holds the delete for 60 s.', severity: 'error', kind: 'filesafe', allowed_action_ids: ['filesafe_once', 'deny'], ttlMs: 60000 },
    concern: { title: 'Reviewer raised a concern on the cache key', body: 'Two plans write the same key; say why before you resolve it.', severity: 'warn', kind: 'concern', needsRationale: true, allowed_action_ids: ['resolve', 'acknowledge', 'dismiss'] },
    sw: { title: 'Work moved to another account because of rate limits.', body: 'Usage · the account you chose stays your choice', severity: 'warn', page: 'usage', allowed_action_ids: ['open', 'acknowledge'] },
    fail: { title: 'Run #48 failed at the integration gate', body: 'Orchestrator · 3 of 12 checks failed', severity: 'error', page: 'orchestrator', allowed_action_ids: ['open', 'acknowledge'] }
  };
  var FIRE = [
    ['Quiet', 'A confirmation: "Settings saved"', function () { window.toast('Settings saved'); }],
    ['Notice', 'Something finished: a run completed', function () { window.toast.important(D.run); }],
    ['Attention', 'The 80 % usage warning (sent twice, shown once)', function () { window.toast.important(D.usage); setTimeout(function () { window.toast('Usage warning: Claude 5h window crossed 80%'); }, 90); }],
    ['Approval', 'Work waits on a decision', function () { window.toast.important(D.hitl); }],
    ['Permission', 'A permission ask with a pattern', function () { window.toast.important(D.perm); }],
    ['FileSafe', 'A 60 s hold', function () { window.toast.important(D.safe); }],
    ['Concern', 'Needs a reason to resolve', function () { window.toast.important(D.concern); }],
    ['Failure', 'A failed run', function () { window.toast.important(D.fail); }],
    ['Again', 'The same words twice count up', function () { window.toast('Copied'); setTimeout(function () { window.toast('Copied'); }, 350); setTimeout(function () { window.toast('Copied'); }, 700); }],
    ['Burst', 'Six notices in two seconds', function () { N().demo('burst'); setTimeout(function () { window.toast.important(D.sw); }, 1700); }],
    ['Setup prompt', '"Continue optional setup", pinned', function () { try { var O = window.O55, s = O.store.get('onboarding', null) || {}; O.store.set('onboarding', Object.assign({}, s, { status: 'closed', commit: { state: 'done' } })); O.boot.chip(); } catch (e) {} }],
    ['Terminal', 'The restored-terminal notice', function () { try { var ids = window.PMT.sessions().map(function (s) { return s.id; }); var v = window.PMT.view(ids[0]); v.notice({ id: 'restored', tone: 'info', focus: false, text: 'This terminal was restored with its scrollback. Its earlier session ended when Puppet Master closed; this is a new session.', actions: [{ label: 'OK' }] }); } catch (e) {} }],
    ['Home note', 'Home\'s own quiet line', function () { try { window.PMW.toast('Panel moved to the right column'); } catch (e) {} }]
  ];
  function setLook(fam, mode) {
    var cap = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };
    try { window.PM12_KIMI.setSettingFromHost('general.visual.theme', (fam === 'nier' ? 'Basic' : cap(fam)) + ' ' + cap(mode)); } catch (e) {}
    try { if (window.PM_NIER) window.PM_NIER.set(fam === 'nier'); } catch (e) {}
    setTimeout(sync, 900);
  }
  function setting(id, v) { try { window.PM12_KIMI.setSettingFromHost(id, v); } catch (e) {} setTimeout(sync, 300); }
  function current() {
    var h = document.documentElement, t = (h.getAttribute('data-theme') || 'basic-dark').split('-');
    return { fam: h.getAttribute('data-o55-nier') === 'on' ? 'nier' : t[0], mode: t[1] || 'dark', reduced: h.getAttribute('data-motion') === 'reduced' };
  }
  var root = document.createElement('aside');
  root.id = 'pmn-lab'; root.setAttribute('aria-label', 'Notification lab'); root.setAttribute('data-pm-hover-exempt', 'true');
  var html = '<header><b>Notification lab</b><button type="button" data-lab="fold" aria-label="Fold">&#8211;</button></header><div class="lab-body">';
  html += '<div class="lab-row lab-looks">' + LOOKS.map(function (l) { return '<button type="button" data-fam="' + l[0] + '">' + l[1] + '</button>'; }).join('') + '</div>';
  html += '<div class="lab-row"><button type="button" data-mode="dark">Dark</button><button type="button" data-mode="light">Light</button><label><input type="checkbox" data-lab="reduced"> Reduced Motion</label></div>';
  html += '<div class="lab-row lab-method"><span>Alerts appear as</span><button type="button" data-method="Toast">Toasts</button><button type="button" data-method="Banner">Banner</button><button type="button" data-method="System Tray">Tray only</button><label><input type="checkbox" data-lab="master" checked> On</label></div>';
  html += '<div class="lab-grid">' + FIRE.map(function (f, i) { return '<button type="button" data-fire="' + i + '" title="' + f[1].replace(/"/g, '&quot;') + '">' + f[0] + '</button>'; }).join('') + '</div>';
  html += '<div class="lab-row"><button type="button" data-lab="open">Open the inbox</button><button type="button" data-lab="read">Mark read</button><button type="button" data-lab="clear">Clear all</button></div></div>';
  root.innerHTML = html;
  document.body.appendChild(root);
  function sync() {
    var c = current();
    root.querySelectorAll('[data-fam]').forEach(function (b) { b.toggleAttribute('data-on', b.getAttribute('data-fam') === c.fam); });
    root.querySelectorAll('[data-mode]').forEach(function (b) { b.toggleAttribute('data-on', b.getAttribute('data-mode') === c.mode); });
    var m = 'Toast'; try { m = window.PM51.value('general.interaction.notification-method') || 'Toast'; } catch (e) {}
    root.querySelectorAll('[data-method]').forEach(function (b) { b.toggleAttribute('data-on', b.getAttribute('data-method') === m); });
    var on = true; try { on = window.PM51.value('general.interaction.notifications-enabled') !== false; } catch (e) {}
    root.querySelector('[data-lab="master"]').checked = on;
    root.querySelector('[data-lab="reduced"]').checked = c.reduced;
  }
  root.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    e.stopPropagation();
    if (b.hasAttribute('data-fam')) setLook(b.getAttribute('data-fam'), current().mode);
    else if (b.hasAttribute('data-mode')) setLook(current().fam, b.getAttribute('data-mode'));
    else if (b.hasAttribute('data-method')) setting('general.interaction.notification-method', b.getAttribute('data-method'));
    else if (b.hasAttribute('data-fire')) FIRE[+b.getAttribute('data-fire')][2]();
    else if (b.getAttribute('data-lab') === 'open') setTimeout(function () { N().open(); }, 0);
    else if (b.getAttribute('data-lab') === 'read') N().markAllRead();
    else if (b.getAttribute('data-lab') === 'clear') N().clearAll();
    else if (b.getAttribute('data-lab') === 'fold') root.toggleAttribute('data-folded');
  });
  root.addEventListener('change', function (e) {
    var k = e.target.getAttribute('data-lab');
    if (k === 'reduced') { if (e.target.checked) document.documentElement.setAttribute('data-motion', 'reduced'); else document.documentElement.removeAttribute('data-motion'); }
    if (k === 'master') setting('general.interaction.notifications-enabled', e.target.checked);
  });
  setTimeout(sync, 600);
  window.PMN_LAB = { setLook: setLook, fire: function (name) { var f = FIRE.filter(function (x) { return x[0].toLowerCase() === String(name).toLowerCase(); })[0]; if (f) f[2](); return !!f; }, D: D };
})();
