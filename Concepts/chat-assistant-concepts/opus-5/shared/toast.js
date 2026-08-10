/* PMX toast — Opus 5. Transient notice, theme-token styled, reduced-motion aware. */
(function (global) {
  'use strict';

  var MAX = 4, TTL = 3400;
  var host = null, queue = [];

  function ensureStyles() {
    if (document.getElementById('pmx-toast-styles')) return;
    var s = document.createElement('style');
    s.id = 'pmx-toast-styles';
    s.textContent =
      '.pmx-toast-host{position:fixed;left:50%;bottom:20px;transform:translateX(-50%);' +
      'z-index:1400;display:flex;flex-direction:column;gap:6px;pointer-events:none;align-items:center}' +
      '.pmx-toast{pointer-events:auto;max-width:min(420px,90vw);padding:7px 14px;' +
      'background:var(--surface-elevated,#222);color:var(--text-primary,#eee);' +
      'border:1px solid var(--border,#444);border-radius:var(--radius-pill,999px);' +
      'box-shadow:var(--elev-2,0 4px 14px rgba(0,0,0,.3));font-size:var(--fs-xs,12px);' +
      'opacity:0;transform:translateY(6px);' +
      'transition:opacity 160ms var(--ease-out,ease),transform 160ms var(--ease-out,ease)}' +
      '.pmx-toast.is-in{opacity:1;transform:translateY(0)}' +
      '[data-motion="reduced"] .pmx-toast{transition:none!important;opacity:1;transform:none}';
    document.head.appendChild(s);
  }

  function ensureHost() {
    if (host && host.isConnected) return host;
    ensureStyles();
    host = document.createElement('div');
    host.className = 'pmx-toast-host';
    /* Inherit theme tokens from a stage when one exists, so the toast matches the
     * concept under test rather than falling back to the raw defaults. */
    var stage = document.querySelector('.pmx-stage[data-theme]');
    if (stage) host.setAttribute('data-theme', stage.getAttribute('data-theme'));
    document.body.appendChild(host);
    return host;
  }

  function reduced() {
    return global.PMXMotion ? global.PMXMotion.reduced(host) : false;
  }

  function show(text) {
    if (!text) return null;
    var h = ensureHost();
    var el = document.createElement('div');
    el.className = 'pmx-toast';
    el.setAttribute('role', 'status');
    el.textContent = String(text);
    h.appendChild(el);
    queue.push(el);

    while (queue.length > MAX) {
      var old = queue.shift();
      if (old && old.parentNode) old.parentNode.removeChild(old);
    }

    if (reduced()) el.classList.add('is-in');
    else global.requestAnimationFrame(function () {
      global.requestAnimationFrame(function () { el.classList.add('is-in'); });
    });

    setTimeout(function () {
      var i = queue.indexOf(el);
      if (i >= 0) queue.splice(i, 1);
      if (reduced()) { if (el.parentNode) el.parentNode.removeChild(el); return; }
      el.classList.remove('is-in');
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 200);
    }, TTL);

    return el;
  }

  function clear() {
    queue.forEach(function (el) { if (el.parentNode) el.parentNode.removeChild(el); });
    queue = [];
  }

  global.PMXToast = { show: show, clear: clear };
})(window);
