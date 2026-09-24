/* Chapter 2 — Computer [simple_path -> server_storage_client (server part) -> remote_access_setup].
   Where the work happens. The connect and Server paths live in 67-screens-connect.js / 68-screens-server.js. */
(function () {
  'use strict';
  const O55 = window.O55, C = O55.c, U = O55.util, T = (k, v) => O55.t(k, v), def = (id, d) => O55.screens.define(id, d);

  /* The quick read-only check of this computer (read_only_preflight): free space, Safe History tool, internet.
     Runs once per session when "This computer" is chosen; results are cached in the session. */
  function runCheck(S) {
    const ck = S.sess.ui.check;
    if (ck && (ck.state === 'done' || (ck.state === 'running' && O55.owners.opState('preflight:this_device')))) return;
    S.sess.ui.check = { state: 'running', done: [] }; S.save();
    O55.owners.dispatch('cmd.project.source_location.test', { target: 'this_device' }, S.ctx(), () =>
      O55.owners.operation('preflight:this_device', [{ key: 'space', ms: 420 }, { key: 'history', ms: 380 }, { key: 'net', ms: 360 }], (st) => {
        S.sess.ui.check = { state: st.state, done: st.phases.filter((p) => p.status === 'done').map((p) => p.key), current: st.current };
        S.save(); if (S.sess.screen === 'where') O55.ui.refresh();
      }));
  }
  function checkChips(S) {
    const here = S.env.here, ck = S.sess.ui.check || { done: [] };
    const chip = (key, label) => {
      const done = (ck.done || []).includes(key);
      return `<span class="o55-chip${done ? ' o55-chip-ok' : ''}" data-key="chip-${key}">${done ? C.small('check', 13) : '<span class="o55-spin" aria-hidden="true"></span>'}<span>${U.esc(done ? label : T('where.check.checking'))}</span></span>`;
    };
    return `<div class="o55-chiprow" data-key="check" role="status" aria-label="${U.esc(T('where.check.label'))}">`
      + chip('space', T('where.check.space', { gb: here.freeGB }))
      + chip('history', here.git ? T('where.check.history') : T('where.check.historyLater'))
      + chip('net', here.internet ? T('where.check.internet') : T('where.check.offline')) + '</div>';
  }

  def('where', {
    chapter: 'computer', stage: 'simple_path', charmSlot: 'where',
    scene: (S) => ({ id: 'where', beat: S.sess.ui.where === 'connect' ? 'connect' : S.sess.ui.where === 'server' ? 'server' : 'this' }),
    eyebrow: () => T('where.eyebrow'),
    title: () => T('where.title'),
    lead: () => T('where.lead'),
    body(S) {
      const sel = S.sess.ui.where || 'this';
      const here = S.env.here;
      let out = C.cards('pick', [
        { v: 'this', glyph: 'computer', title: T('where.this.title'), sub: T('where.this.sub'), tag: T('chrome.recommended') },
        { v: 'connect', glyph: 'link', title: T('where.connect.title'), sub: T('where.connect.sub') },
        { v: 'server', glyph: 'server', title: T('where.server.title'), sub: T('where.server.sub') }
      ], sel, { label: T('where.title') });
      if (sel === 'this') out += checkChips(S);
      out += `<div class="o55-sublinks" data-key="links">${C.link(T('where.restoreAll'), 'restoreAll')}</div>`;
      out += C.details(S, 'where', T('where.detailsLabel'), `<p>${U.esc(T('where.details'))}</p>`);
      return out;
    },
    mounted(S) { if ((S.sess.ui.where || 'this') === 'this') runCheck(S); },
    foot: () => ({ primary: { label: T('chrome.continue'), do: 'next' } }),
    do: {
      pick(S, v, el) { S.sess.ui.where = v; S.save(); if (v === 'this') runCheck(S); O55.ui.refresh(); O55.ui.charm(el, T('where.' + v + '.short'), { this: 'computer', connect: 'link', server: 'server' }[v]); },
      next(S) {
        const v = S.sess.ui.where || 'this';
        if (v === 'this') { S.sess.active = 'main'; O55.draft.set(S.sess.drafts.main, { server_mode: 'this_device', storage_mode: 'this_device', remote_mode: 'none' }); S.save(); return O55.ui.go('begin'); }
        if (v === 'connect') { S.sess.active = 'connect'; S.save(); return O55.ui.go('c-route'); }
        S.sess.active = 'main'; O55.draft.set(S.sess.drafts.main, { server_mode: 'new_server', storage_mode: 'with_server' }); S.save();
        return O55.ui.go('s-kind');
      },
      restoreAll(S) { S.sess.restore = { scope: 'full' }; S.save(); O55.ui.go('r-source'); }
    }
  });
})();
