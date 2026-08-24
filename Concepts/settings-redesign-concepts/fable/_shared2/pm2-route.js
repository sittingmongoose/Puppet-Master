/* pm2-route.js — PM2.route
   Shared-v2 deep-link router for fable concepts 05-11 (CONTRACT2.md, "pm2-route.js").
   Grammar: <page>.html[?hub=1]#/<route>?<params>
     route  := home | all | copy | dest/<cat>[/<sub>]
             | manager/<managerId>[/<objectId>[/<tab>]]
             | setting/<settingId> | search/<query>
     params := scenario, fixture (comma list), trigger (comma list of name[:ref]),
               focus=<rid|id>, instant=1, pin=1, stress=1, theme, motion=reduced
   Apply order per navigation: scenario -> fixtures -> stress -> route -> focus
   -> triggers. URL-applied state is ephemeral unless pin=1. Route state is pure
   data (Slint-portable state machine); this file touches only window.location,
   window.history, and document.documentElement. bind({open}) calls the
   concept's own open(dest) for every navigation, so open must be idempotent;
   go(dest, {silent:true}) records a hash without re-opening (escape hatch for
   concepts that already rendered the surface). No emoji. */
(function () {
  'use strict';

  window.PM2 = window.PM2 || {};

  function arr(x) { return Array.isArray(x) ? x : []; }
  function obj(x) { return (x && typeof x === 'object') ? x : {}; }
  function str(x) { return typeof x === 'string' ? x : ''; }

  var openFn = null;
  var suppressNext = false;
  var bound = false;

  /* ---------------- parse ---------------- */

  function parse(loc) {
    var l = loc || window.location;
    var hash = str(l.hash);
    if (hash.indexOf('#/') !== 0) return null;
    var body = hash.slice(2);
    var qi = body.indexOf('?');
    var routePart = qi >= 0 ? body.slice(0, qi) : body;
    var paramPart = qi >= 0 ? body.slice(qi + 1) : '';

    var segs = routePart.split('/').filter(function (s) { return s !== ''; })
      .map(function (s) {
        try { return decodeURIComponent(s); } catch (e) { return s; }
      });

    var route = { kind: segs[0] || 'home' };
    if (route.kind === 'dest') {
      route.cat = segs[1] || null;
      route.sub = segs[2] || null;
    } else if (route.kind === 'manager') {
      route.managerId = segs[1] || null;
      route.objectId = segs[2] || null;
      route.tab = segs[3] || null;
    } else if (route.kind === 'setting') {
      route.settingId = segs[1] || null;
    } else if (route.kind === 'search') {
      route.query = segs.slice(1).join('/');
    } else if (route.kind !== 'home' && route.kind !== 'all' && route.kind !== 'copy') {
      route = { kind: 'home' };
    }

    var params = {};
    paramPart.split('&').forEach(function (pair) {
      if (!pair) return;
      var eq = pair.indexOf('=');
      var k = eq >= 0 ? pair.slice(0, eq) : pair;
      var v = eq >= 0 ? pair.slice(eq + 1) : '1';
      try { params[decodeURIComponent(k)] = decodeURIComponent(v); } catch (e) { params[k] = v; }
    });

    /* ?instant=1 may also arrive in the page query (hub probe links). */
    var pageInstant = str(l.search).indexOf('instant=1') >= 0;

    return {
      route: route,
      scenario: params.scenario || null,
      fixtures: params.fixture ? params.fixture.split(',').filter(Boolean) : [],
      triggers: params.trigger ? params.trigger.split(',').filter(Boolean).map(function (t) {
        var ci = t.indexOf(':');
        return ci >= 0 ? { name: t.slice(0, ci), ref: t.slice(ci + 1) } : { name: t, ref: null };
      }) : [],
      focus: params.focus || null,
      instant: params.instant === '1' || pageInstant,
      pin: params.pin === '1',
      stress: params.stress === '1',
      theme: params.theme || null,
      motion: params.motion || null
    };
  }

  /* A page opened with no hash at all still has to land somewhere: the hub
     entries and a double-clicked file both arrive as plain <page>.html, and
     parse() answers null for those. Every caller funnels through this Home
     link instead, so the concept's open() always runs at least once. */
  function defaultLink() {
    return {
      route: { kind: 'home' },
      scenario: null, fixtures: [], triggers: [],
      focus: null,
      instant: str(window.location.search).indexOf('instant=1') >= 0,
      pin: false, stress: false, theme: null, motion: null
    };
  }

  /* ---------------- build ---------------- */

  function routeSegs(route) {
    var r = obj(route);
    var kind = str(r.kind) || str(r.route) || 'home';
    if (kind === 'dest') return ['dest', r.cat, r.sub];
    if (kind === 'manager') return ['manager', r.managerId, r.objectId, r.tab];
    if (kind === 'setting') return ['setting', r.settingId];
    if (kind === 'search') return ['search', r.query];
    if (kind === 'all') return ['all'];
    if (kind === 'copy') return ['copy'];
    return ['home'];
  }

  function routePath(route) {
    var segs = routeSegs(route);
    var out = [];
    for (var i = 0; i < segs.length; i++) {
      if (segs[i] == null || segs[i] === '') break; /* no gaps: dest//sub is invalid */
      out.push(encodeURIComponent(String(segs[i])));
    }
    return out.join('/');
  }

  function build(route, params) {
    var p = obj(params);
    var pairs = [];
    function push(k, v) {
      if (v == null || v === '' || v === false) return;
      pairs.push(encodeURIComponent(k) + '=' + encodeURIComponent(v === true ? '1' : String(v)));
    }
    push('scenario', p.scenario);
    var fixtures = p.fixture != null ? p.fixture : p.fixtures;
    if (Array.isArray(fixtures)) fixtures = fixtures.join(',');
    push('fixture', fixtures);
    var triggers = p.trigger != null ? p.trigger : p.triggers;
    if (Array.isArray(triggers)) {
      triggers = triggers.map(function (t) {
        if (t && typeof t === 'object') return t.ref ? t.name + ':' + t.ref : t.name;
        return String(t);
      }).join(',');
    }
    push('trigger', triggers);
    push('focus', p.focus);
    push('instant', p.instant);
    push('pin', p.pin);
    push('stress', p.stress);
    push('theme', p.theme);
    push('motion', p.motion);
    return '#/' + routePath(route) + (pairs.length ? '?' + pairs.join('&') : '');
  }

  /* ---------------- stamps + hub handshake ---------------- */

  function stampRoute(route) {
    try {
      document.documentElement.setAttribute('data-pm2-route', routePath(route));
    } catch (e) { /* no DOM (harness) */ }
  }

  function markReady(applied) {
    try { document.documentElement.setAttribute('data-pm-state', 'ready'); } catch (e) { /* no DOM */ }
    try {
      if (window.parent && window.parent !== window && typeof window.parent.postMessage === 'function') {
        window.parent.postMessage({
          source: 'pm-concept', type: 'pm-concept-applied', applied: applied || null
        }, '*');
      }
    } catch (e) { /* cross-origin parent */ }
  }

  /* ---------------- apply ---------------- */

  function statesApi() {
    var S = window.PM2.states;
    return (S && typeof S === 'object') ? S : null;
  }

  function currentStore() {
    try {
      if (window.PM2.store && typeof window.PM2.store.current === 'function') {
        return window.PM2.store.current() || null;
      }
    } catch (e) { /* store optional in harness */ }
    return null;
  }

  function storeWrite(store, key, value, pin) {
    if (!store) return;
    if (pin) { store.set(key, value); }
    else if (typeof store._setSession === 'function') { store._setSession(key, value); }
    else { store.set(key, value); }
  }

  function destFromLink(dl) {
    var r = dl.route;
    var dest = { route: r.kind };
    if (r.kind === 'dest') { dest.cat = r.cat; dest.sub = r.sub; }
    else if (r.kind === 'manager') { dest.managerId = r.managerId; dest.objectId = r.objectId; dest.tab = r.tab; }
    else if (r.kind === 'setting') { dest.settingId = r.settingId; }
    else if (r.kind === 'search') { dest.query = r.query; }
    if (dl.focus) dest.focus = dl.focus;
    return dest;
  }

  /* Applies one parsed link: scenario -> fixtures -> stress -> route/focus
     -> triggers, then stamps ready and posts to the hub. */
  function applyLink(dl) {
    /* No hash yet (first open), or Back stepping off the last route and out
       of the hash entirely: fall back to Home so the stage is never left
       empty. */
    if (!dl) dl = defaultLink();

    var S = statesApi();
    var store = currentStore();

    if (dl.instant && S && typeof S.setTimescale === 'function') {
      try { S.setTimescale(0); } catch (e) { /* probe mode is best-effort */ }
    }
    try {
      if ((dl.theme || dl.motion) && window.PMShell && typeof window.PMShell.applyView === 'function') {
        window.PMShell.applyView({ theme: dl.theme, reducedMotion: dl.motion === 'reduced' });
      }
    } catch (e) { /* presentation is optional */ }

    /* 1. scenario */
    if (dl.scenario) {
      if (S && typeof S.applyScenario === 'function') {
        try { dl.pin ? S.applyScenario(dl.scenario) : S.applyScenario(dl.scenario, { persist: false }); }
        catch (e) { /* scenario errors stay local */ }
      } else {
        storeWrite(store, 'scenario', dl.scenario, dl.pin);
      }
    }
    /* 2. fixtures */
    if (dl.fixtures.length) {
      if (S && typeof S.setFixtures === 'function') {
        try { dl.pin ? S.setFixtures(dl.fixtures) : S.setFixtures(dl.fixtures, { persist: false }); }
        catch (e) { /* fixture errors stay local */ }
      } else {
        storeWrite(store, 'fixtures', dl.fixtures, dl.pin);
      }
    }
    /* 3. stress */
    if (dl.stress) {
      if (S && typeof S.setStress === 'function') {
        try { dl.pin ? S.setStress(true) : S.setStress(true, { persist: false }); }
        catch (e) { /* stress errors stay local */ }
      } else {
        storeWrite(store, 'stress', true, dl.pin);
      }
    }

    /* 4 + 5. route + focus (one open() call; the concept lands, scrolls,
       focuses, and applies its calm locator treatment). */
    stampRoute(dl.route);
    var openResult = null;
    if (typeof openFn === 'function') {
      try { openResult = openFn(destFromLink(dl)); }
      catch (e) { /* concept router errors stay local */ }
    }

    /* 6. triggers */
    return Promise.resolve(openResult).then(function () {
      var chain = Promise.resolve();
      dl.triggers.forEach(function (t) {
        chain = chain.then(function () {
          if (S && typeof S.trigger === 'function') {
            try { return S.trigger(t.name, t.ref); } catch (e) { return null; }
          }
          return null;
        });
      });
      return chain;
    }).then(function () {
      markReady({
        route: dl.route,
        scenario: dl.scenario,
        fixtures: dl.fixtures,
        triggers: dl.triggers.map(function (t) { return t.name; })
      });
      return dl;
    });
  }

  /* ---------------- go ---------------- */

  function normalizeHash(h) {
    var s = str(h);
    if (s.indexOf('#/') === 0) return s;
    if (s.indexOf('/') === 0) return '#' + s;
    return '#/' + s;
  }

  /* go(dest|route|hash, {replace, params, silent})
     pushState semantics: plain go() adds a real history entry (Back/Forward
     work); replace:true swaps the current entry (scrollspy). silent:true
     records the hash without re-invoking open (the surface is already up). */
  function go(target, opts) {
    var o = obj(opts);
    var hash = (typeof target === 'string') ? normalizeHash(target) : build(target, o.params);

    if (o.replace) {
      var changed = window.location.hash !== hash;
      try {
        if (window.history && typeof window.history.replaceState === 'function') {
          window.history.replaceState(null, '', hash);
        } else if (changed) {
          suppressNext = true;
          window.location.hash = hash; /* fallback: still no open() below */
        }
      } catch (e) { /* history unavailable */ }
      var dlr = parse({ hash: hash, search: str(window.location.search) });
      if (o.silent) { if (dlr) stampRoute(dlr.route); return Promise.resolve(dlr); }
      return applyLink(dlr);
    }

    if (window.location.hash === hash) return Promise.resolve(parse(window.location));
    if (o.silent) suppressNext = true;
    try { window.location.hash = hash; } catch (e) { /* location unavailable */ }
    if (o.silent) {
      var dls = parse({ hash: hash, search: str(window.location.search) });
      if (dls) stampRoute(dls.route);
      return Promise.resolve(dls);
    }
    if (!bound) {
      /* Before bind() no hashchange listener exists; apply directly. */
      return applyLink(parse(window.location));
    }
    /* The hashchange listener runs applyLink for real history entries. */
    return Promise.resolve(null);
  }

  /* ---------------- current / bind ---------------- */

  function current() {
    return parse(window.location) || defaultLink();
  }

  function bind(opts) {
    var o = obj(opts);
    openFn = typeof o.open === 'function' ? o.open : null;
    if (!bound) {
      bound = true;
      window.addEventListener('hashchange', function () {
        if (suppressNext) { suppressNext = false; return; }
        applyLink(parse(window.location));
      });
    }
    return applyLink(parse(window.location));
  }

  window.PM2.route = {
    parse: parse,
    build: build,
    go: go,
    current: current,
    bind: bind
  };
})();
