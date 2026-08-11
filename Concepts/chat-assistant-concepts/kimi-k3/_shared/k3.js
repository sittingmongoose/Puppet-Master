/* ============================================================================
   Kimi K3 — core registry, environment, and composition contract.
   Every window and thread module registers here. The host boots pairings.

   THE ONE HARD RULE: a window module renders its own chrome and provides
   exactly one [data-k3-slot="thread"] and one [data-k3-slot="composer"].
   The host fills those slots. Neither module touches the other's DOM;
   cross-talk happens only through ctx.data / ctx.store events.
   ========================================================================== */
(function () {
  'use strict';

  const windows = {};
  const threads = {};
  const listeners = {};

  const env = {
    theme: 'friendly-dark',      // one of the 8 PM themes (kebab id)
    width: 750,                  // Assistant Chat width px, 520..1200
    reducedMotion: false,        // manual toggle wins over prefers-reduced-motion
    mode: 'docked',              // 'docked' | 'popout'
    railOpen: true,              // fake application rail
    label: 'Kimi K3',
    windowId: 'w1',
    threadId: 't1',
    seed: 1,
    state: null,                 // feature-state drive key (test harness)
    sess: 'default'              // persistence session key
  };

  const K3 = {
    env,
    label: 'Kimi K3',

    registerWindow(id, def) {
      if (!def || typeof def.mount !== 'function') throw new Error('window ' + id + ' needs mount()');
      def.meta = def.meta || {};
      def.meta.id = id;
      windows[id] = def;
    },
    registerThread(id, def) {
      if (!def || typeof def.mount !== 'function') throw new Error('thread ' + id + ' needs mount()');
      def.meta = def.meta || {};
      def.meta.id = id;
      threads[id] = def;
    },
    windows, threads,

    on(evt, fn) { (listeners[evt] = listeners[evt] || []).push(fn); },
    off(evt, fn) {
      const l = listeners[evt] || [];
      const i = l.indexOf(fn);
      if (i >= 0) l.splice(i, 1);
    },
    emit(evt, a, b) { (listeners[evt] || []).slice().forEach((fn) => fn(a, b)); },

    applyEnv() {
      const root = document.documentElement;
      root.dataset.theme = env.theme;
      root.dataset.motion = env.reducedMotion ? 'reduced' : 'full';
    },
    setEnv(patch) {
      Object.assign(env, patch);
      K3.applyEnv();
      K3.emit('env', env);
    },
    motionReduced() {
      return env.reducedMotion === true;
    }
  };

  // Build the ctx object handed to every module. Services (K3Store, K3Data,
  // K3UI) are attached by their own files before boot.
  K3.makeCtx = function (extra) {
    return Object.assign({
      env,
      on: K3.on, off: K3.off, emit: K3.emit,
      store: window.K3Store,
      data: window.K3Data,
      ui: window.K3UI,
      shell: window.K3Shell
    }, extra || {});
  };

  // Parse the documented query-param API. Every parameter is optional.
  K3.parseQuery = function () {
    const q = new URLSearchParams(location.search);
    const p = {};
    if (q.get('window')) p.windowId = q.get('window');
    if (q.get('thread')) p.threadId = q.get('thread');
    if (q.get('theme')) p.theme = q.get('theme');
    if (q.get('width')) p.width = Math.max(520, Math.min(1200, parseInt(q.get('width'), 10) || 750));
    if (q.get('rail')) p.railOpen = q.get('rail') !== 'closed';
    if (q.get('rm')) p.reducedMotion = q.get('rm') === '1';
    else if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) p.reducedMotion = true;
    if (q.get('mode')) p.mode = q.get('mode') === 'popout' ? 'popout' : 'docked';
    if (q.get('seed')) p.seed = parseInt(q.get('seed'), 10) || 1;
    if (q.get('state')) p.state = q.get('state');
    if (q.get('sess')) p.sess = q.get('sess');
    if (q.get('static')) p.static = q.get('static') === '1';
    return p;
  };

  window.K3 = K3;
})();
