/* Shared demo data loader for Grok 4.5 chat concepts. */
(function () {
  'use strict';

  function clone(data) {
    if (typeof structuredClone === 'function') {
      try {
        return structuredClone(data);
      } catch (_) {
        /* fall through */
      }
    }
    return JSON.parse(JSON.stringify(data));
  }

  function candidateUrls() {
    var path = String((window.location && window.location.pathname) || '');
    var base = document.currentScript && document.currentScript.src
      ? String(document.currentScript.src)
      : '';
    var urls = [];

    // host.html / index.html sit beside `_shared/`
    if (/\/(?:host|index)\.html$/i.test(path) || /\/grok-4-5\/?$/i.test(path)) {
      urls.push('_shared/demoData.json');
    }

    // Pages that resolve relative to `_shared/` itself
    if (/\/_shared\//i.test(path) || /\/_shared\//i.test(base)) {
      urls.push('./demoData.json', 'demoData.json');
    }

    urls.push('./_shared/demoData.json', '_shared/demoData.json', './demoData.json');

    var seen = Object.create(null);
    return urls.filter(function (u) {
      if (seen[u]) return false;
      seen[u] = true;
      return true;
    });
  }

  function fetchJson(url) {
    return fetch(url, { cache: 'no-store' }).then(function (res) {
      if (!res.ok) throw new Error('demoData fetch failed: ' + res.status + ' ' + url);
      return res.json();
    });
  }

  function load() {
    var urls = candidateUrls();
    var chain = Promise.reject(new Error('no urls'));
    urls.forEach(function (url) {
      chain = chain.catch(function () {
        return fetchJson(url);
      });
    });
    return chain.then(function (data) {
      var next = clone(data);
      if (window.PMChatDemoExtend && typeof window.PMChatDemoExtend.apply === 'function') {
        next = window.PMChatDemoExtend.apply(next) || next;
      }
      return next;
    });
  }

  window.PMChatDemoLoader = {
    load: load,
    clone: clone
  };
})();
