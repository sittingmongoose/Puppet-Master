/* Accounts kinds and actions (owner: content; DESIGN-SPEC section 10, ARCHITECTURE.md sections 4.11 and 6):
   provider (single card or group), switch (bound auto-switch strip), providers (compact not-set-up rows), setup.
   Skeleton: working minimal provider and switch kinds over PMU.roster and PMU.settings, so the roster patch and the
   Settings write path are exercised end to end; the content builder replaces their bodies with the full design. */
(function () {
  var st = PMU.core.state;
  function accountMeters(account, max) {
    return account.windows.slice(0, max).map(function (w) {
      return { label: w.label, pct: w.pct, vs: w.vs === 'ok' || w.vs === 'zero' ? 'unknown' : w.vs, tone: w.tone, window: w.key,
        valueText: w.pct === null ? '' : PMU.fmt.used(w.pct), resetText: w.pct === null ? '' : PMU.fmt.reset(w).text };
    });
  }
  function stateHtml(a) {
    var glyph = { active: 'checkCircle', exhausted: 'alert', cooldown: 'hourglass', 'signed-out': 'key', 'needs-seat': 'minusCircle' }[a.state];
    return '<span class="pmu-acstate" data-state="' + a.state + '">' + (glyph ? PMU.icon(glyph) : '') + '<span>' + esc(a.override ? 'Active · override' : a.effective && a.state === 'standby' ? 'Active' : a.stateWord) + '</span></span>';
  }
  PMU.widgets.kind('provider', {
    render: function (body, ctx) {
      var p = PMU.roster.provider(ctx.id.replace(/^acct-/, ''));
      if (!p || !p.accounts.length) { body.innerHTML = '<div class="pmu-todo">' + esc(ctx.id) + '</div>'; return; }
      body.textContent = '';
      var list = document.createElement('div'); list.className = 'pmu-acclist'; body.appendChild(list);
      var maxRows = Math.max(1, Math.floor((ctx.tier.bh - 4) / (p.accounts.length > 1 ? 46 : 120)));
      p.accounts.slice(0, p.accounts.length > 1 ? maxRows : 1).forEach(function (a) {
        var row = document.createElement('div'); row.className = 'pmu-accrow'; row.setAttribute('data-account', a.key); row.setAttribute('data-state', a.state);
        row.innerHTML = '<div class="pmu-accid"><b>' + esc(a.nickname) + '</b>' + stateHtml(a) + '</div>';
        var meters = document.createElement('div'); meters.className = 'pmu-accmeters'; row.appendChild(meters);
        (p.accounts.length > 1 ? accountMeters(a, 2).slice(0, 1) : accountMeters(a, 3)).forEach(function (m) { PMU.charts.meter(meters, m); });
        if (!a.windows.length) meters.innerHTML = (a.extra[0] ? PMU.vs.html(a.extra[0].vs === 'ok' ? 'settled' : a.extra[0].vs, a.extra[0].label + ' · ' + a.extra[0].text) : '') +
          (a.credits ? '<span class="pmu-accline">Credits ' + PMU.fmt.num(a.credits.left) + ' left · ' + esc(a.credits.source) + '</span>' : '') +
          (a.spend ? '<span class="pmu-accline">' + esc(a.spend.label) + ' ' + PMU.fmt.money(a.spend.usd) + ' ' + esc(a.spend.state) + '</span>' : '');
        list.appendChild(row);
      });
    },
    update: function (body, ctx) { this.render(body, ctx); }
  });
  PMU.widgets.kind('switch', {
    render: function (body, ctx) {
      var th = PMU.roster.thresholds(), ok = PMU.settings.available();
      body.innerHTML = '<div class="pmu-switch">' +
        '<button type="button" class="pmu-toggle' + (th.auto ? ' on' : '') + '" role="switch" aria-checked="' + th.auto + '" data-pmu-act="auto"' + (ok ? '' : ' disabled') + '><i></i></button>' +
        '<span class="pmu-switchtext"><b>' + (th.auto ? 'On' : 'Off') + '</b> · Switch at ' + (100 - th.switchLeft) + '% used (' + th.switchLeft + '% left) · warn at ' + (100 - th.warnLeft) + '% used</span>' +
        '<span class="pmu-switchmeta">' + esc(t('accounts.shared')) + '</span></div>';
    },
    update: function (body, ctx) { this.render(body, ctx); }
  });

  PMU.accounts = {
    toggleAutoSwitch: function () {
      var next = !PMU.roster.thresholds().auto;
      var ok = PMU.settings.set('ai.accounts.multi-account-switching', next);
      if (ok) { PMU.shell.toast(t('toast.saved_settings')); PMU.board.refresh('settings'); }
      return ok;
    },
    setSwitchLevel: function (pctLeft) {
      var ok = PMU.settings.set('ai.accounts.hard-switch-level', Number(pctLeft));
      if (ok) { PMU.shell.toast(t('toast.saved_settings')); PMU.board.refresh('settings'); }
      return ok;
    },
    useAccount: function (key) {
      var a = PMU.roster.account(key); if (!a || !a.eligible.ok) return null;
      var legacy = a.legacy || {};
      var receipt = command('cmd.account.select_profile', { provider_id: a.providerId, account_id: a.id, connection_id: legacy.connection_id || null,
        override: true, scope: 'next_run', source: 'usage.accounts' }, { selected: true });
      if (receipt.dispatch_accepted === false) return receipt;
      PMU.settings.useNext(a.providerId, a.id);
      st.accountOverride = { key: key };
      if (window.PM7_USAGE) window.PM7_USAGE.active_account_id = legacy.account_id || 'account:' + a.providerId + ':' + a.id;
      PMU.roster.invalidate(); PMU.board.refresh('settings');
      return receipt;
    },
    openSettings: function (providerId, accountId) {
      var receipt = command('cmd.settings.open', { category: 'ai', setting_id: 'ai.accounts.provider-connections', provider_id: providerId || null, account_id: accountId || null }, { opened: true });
      PMU.settings.open(providerId);
      return receipt;
    },
    inspect: function (key, opener) {
      var a = PMU.roster.account(key); if (!a) return;
      PMU.inspector.open({ kind: 'account', title: a.nickname, sections: [{ title: 'Identity', rows: [['Provider', esc(a.providerId)], ['Plan', esc(a.planLine)], ['Host', esc(a.host)], ['Auth', esc(a.auth)], ['Priority', String(a.priority)]] }] }, opener);
    }
  };

  document.addEventListener('click', function (event) {
    var act = event.target.closest && event.target.closest('#pmuApp [data-pmu-act]');
    if (!act) return;
    if (act.getAttribute('data-pmu-act') === 'auto') PMU.accounts.toggleAutoSwitch();
  });
})();
