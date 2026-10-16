/* Wallpapers for every look: the choice, its paint and the Settings gallery (pm7-wallpapers, Opus 5.5, 2026-10-13).
 *
 * Jared, 2026-10-11: "The user should be able to choose any wallpaper for their background ... Ribbon is default for
 * the glass theme." One choice serves every look: 'look' (each look's own: Glass shows its default, Ribbons; Basic,
 * Friendly, Retro and NieR Mode keep their own ground) or a wallpaper id, shown in every look in the print (dark or
 * light) that follows the look's mode.
 *
 * The shared contract (CONTRACT.md), which Glass's glass.js already follows, so the two never disagree:
 *   - the choice is localStorage['pm-lg-wallpaper'] ('look' or an id); ?lgwall= overrides it for one visit;
 *   - <html data-lg-wall="<id>"> names the wallpaper on show; data-lg-wall-any is present when a look other than Glass
 *     shows one; both are computed exactly as glass.js's applyWall computes them;
 *   - the images are CSS variables --lg-wall-<id>-<dark|light> (and thumbnails --wpk-t-<id>-<dark|light>), and the
 *     catalog comes from catalog.d, merged by tools/build_walls.py into window.PM_WALLPAPERS_CATALOG.
 * A saved id this build does not have is set back to 'look' when the page loads, so nothing paints an image that is not
 * there and glass.js, which reads the same key, agrees at its next pass.
 *
 * The gallery is one row in Settings > App & Input > Theme & colors, right after Light or dark, with the id
 * setting-general.visual.wallpaper. If an older picker (glass.js's mountPicker) put a row there, it is replaced, and
 * because the id is then taken it is never mounted again. It is one radiogroup: "Look's own" first, then every
 * wallpaper by family. Arrow keys move and choose (the paint follows after a short pause, so browsing with the keys
 * never repaints the app on every step), Home and End go to the ends, and the chosen tile is the one tab stop.
 * Test hook: window.PM_WALLPAPERS.
 */
(function () {
  'use strict';
  if (window.PM_WALLPAPERS) return;
  var CAT = window.PM_WALLPAPERS_CATALOG;
  if (!CAT || !CAT.families) return;
  var root = document.documentElement, q = new URLSearchParams(location.search);
  var KEY = 'pm-lg-wallpaper', ROW_ID = 'setting-general.visual.wallpaper';
  var LOOK_NAMES = { basic: 'Basic', glass: 'Glass', friendly: 'Friendly', retro: 'Retro' };
  var byId = Object.create(null), order = [];
  CAT.families.forEach(function (f) { f.wallpapers.forEach(function (w) { w.family = f.family; w.familyLabel = f.label; byId[w.id] = w; order.push(w.id); }); });

  function look() { return (root.getAttribute('data-theme') || 'basic-dark').split('-')[0]; }
  function inNier() { return root.getAttribute('data-o55-nier') === 'on'; }
  function lookDefault(fam) { for (var i = 0; i < order.length; i++) if (byId[order[i]].default_for === fam) return order[i]; return ''; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  /* ---- the choice ------------------------------------------------------------------------------------------------ */
  var stale = null;
  function saved() { try { return localStorage.getItem(KEY) || 'look'; } catch (e) { return 'look'; } }
  function choice() {
    var c = saved();
    if (c !== 'look' && !byId[c]) {   /* saved by a build with a wallpaper this one lacks: back to the default, saved */
      stale = { value: c, at: new Date().toISOString() };
      try { localStorage.setItem(KEY, 'look'); } catch (e) {}
      c = 'look';
    }
    return c;
  }
  /* the wallpaper on show: ?lgwall= first, as glass.js reads it, then the saved choice */
  function shown() { var c = q.get('lgwall') || choice(); return c === 'look' ? lookDefault(look()) : c; }
  function attr(a, v) { if (v === null) { if (root.hasAttribute(a)) root.removeAttribute(a); } else if (root.getAttribute(a) !== v) root.setAttribute(a, v); }
  /* A selected radio paints before decoding or restyling. Two permanent background layers carry the print fade;
     the cached frost joins when the fade starts. No snapshots or nodes are added to the live sheets on a choice. */
  var paintedChoice = choice(), paintKey = '', paintedUrl = '', paintSerial = 0, commitT = 0, commitFrame = 0;
  var printLayers = [], printAnimations = [], printFinish = null, imageUrls = new Map();
  function mountPrints() {
    if (printLayers.length || !document.body) return;
    for (var i = 0; i < 2; i++) {
      var e = document.createElement('div'); e.className = 'wpk-print'; e.setAttribute('aria-hidden', 'true');
      document.body.appendChild(e); printLayers.push(e);
    }
  }
  function imageUrl(id) {
    if (!id) return '';
    var mode = /-light$/.test(root.getAttribute('data-theme') || '') ? 'light' : 'dark';
    var key = id + '-' + mode; if (imageUrls.has(key)) return imageUrls.get(key);
    var v = getComputedStyle(root).getPropertyValue('--lg-wall-' + key).trim();
    var m = v.match(/url\(["']?(.*?)["']?\)\s*$/), url = m ? m[1] : '';
    imageUrls.set(key, url); return url;
  }
  function still() {
    return root.getAttribute('data-lg-tier') === 'cpu' || root.getAttribute('data-motion') === 'reduced' ||
      root.getAttribute('data-reduced-motion') === '1' || matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  function prepare(url, options) {
    if (!url) return Promise.resolve(true);
    if (window.PM_LG && PM_LG.prepareWallpaper) return PM_LG.prepareWallpaper(url, options);
    var im = new Image(); im.src = url;
    return im.decode ? im.decode().then(function () { return true; }, function () { return false; }) : Promise.resolve(true);
  }
  /* Prepare only choices in and immediately around the gallery's viewport. Glass owns the byte budget and both
     caches; this queue stores no images. One idle job at a time leaves the input path independent of warming. */
  var warmObserver = null, warmTargets = new Map(), warmDone = new Map(), warmEpoch = 0;
  var warmTimer = 0, warmIdle = 0, warmRunning = false, warmInput = 0;
  function warmBusy() {
    if (document.hidden) return true;
    if (window.PM51 && PM51.place && PM51.place.mode === 'nav') return true;
    if (document.querySelector('#panel-settings .o55-leaving,#panel-settings [data-o55-nav-pending]')) return true;
    if (typeof window.PM_BUSY === 'function') return !!window.PM_BUSY();
    if (root.hasAttribute('data-pm-page-transition') || root.hasAttribute('data-pmu-moment') || root.hasAttribute('data-o55-open')) return true;
    if (document.querySelector('#o55np-reboot,#o55np-calm,.o55nw-boot,.o55t-bootcover')) return true;
    var n = window.PM_NIER;
    return !!(n && n.wanted && n.on && n.wanted() !== n.on());
  }
  function warmAllowed(epoch) {
    var panel = document.getElementById('panel-settings');
    return epoch === warmEpoch && panel && panel.classList.contains('active') && !warmBusy() &&
      performance.now() - warmInput >= 120 &&
      !(navigator.scheduling && navigator.scheduling.isInputPending && navigator.scheduling.isInputPending());
  }
  function queueWarm() {
    if (warmTimer || warmIdle || warmRunning || !warmTargets.size || !window.requestIdleCallback ||
        !window.PM_LG || !PM_LG.prepareWallpaper) return;
    warmIdle = requestIdleCallback(function (deadline) {
      warmIdle = 0;
      var epoch = warmEpoch;
      if (!warmAllowed(epoch) || deadline.timeRemaining() < 8) {
        warmTimer = setTimeout(function () { warmTimer = 0; queueWarm(); }, 200);
        return;
      }
      /* IntersectionObserver supplies geometry without a new layout read. Keep two spare frost slots for the
         current print and an explicit hover/click; opaque looks use only the two-image decoded cache. */
      var glass = look() === 'glass' && !inNier(), limit = glass ? 6 : 2, viewport = innerWidth + 'x' + innerHeight;
      var candidates = Array.from(warmTargets.entries()).filter(function (item) { return item[0].isConnected; });
      candidates.sort(function (a, b) { return b[1].intersectionRatio - a[1].intersectionRatio || a[1].boundingClientRect.top - b[1].boundingClientRect.top; });
      var ids = [];
      candidates.some(function (item) {
        var id = item[0].getAttribute('data-wpk-pick'); if (id === 'look') id = lookDefault(look());
        if (id && ids.indexOf(id) < 0) ids.push(id);
        return ids.length >= limit;
      });
      var mode = /-light$/.test(root.getAttribute('data-theme') || '') ? 'light' : 'dark';
      var id = ids.find(function (value) { return !warmDone.has(value + '-' + mode + '|' + viewport); });
      if (!id) return;
      var key = id + '-' + mode + '|' + viewport;
      warmRunning = true;
      prepare(imageUrl(id), { canRun: function () { return warmAllowed(epoch); } }).catch(function () { return false; }).then(function (ok) {
        /* Retry a cover/input cancellation when idle again. A failed image gets one attempt per viewport/epoch;
           the explicit choice path can still retry it without a background error spinning an idle loop. */
        if (epoch === warmEpoch && (ok || warmAllowed(epoch))) {
          warmDone.delete(key); warmDone.set(key, !!ok);
          while (warmDone.size > (glass ? 8 : 2)) warmDone.delete(warmDone.keys().next().value);
        }
      }).then(function () { warmRunning = false; queueWarm(); });
    });
  }
  function resetWarm() { ++warmEpoch; warmDone.clear(); queueWarm(); }
  function watchWarm(r) {
    if (!window.IntersectionObserver) return;
    if (warmObserver) warmObserver.disconnect();
    warmTargets.clear(); resetWarm();
    warmObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) warmTargets.set(entry.target, entry); else warmTargets.delete(entry.target);
      });
      queueWarm();
    }, { root: r.closest('#settings-document'), rootMargin: '160px 0px', threshold: [0, 0.5, 1] });
    r.querySelectorAll('.wpk-tile').forEach(function (tile) { warmObserver.observe(tile); });
  }
  ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(function (type) {
    document.addEventListener(type, function () { warmInput = performance.now(); }, { capture: true, passive: true });
  });
  window.addEventListener('pm-idle', queueWarm);
  window.addEventListener('resize', resetWarm, { passive: true });
  function apply(animate) {
    var id = shown(), selected = choice(), theme = root.getAttribute('data-theme'), key = theme + '|' + id;
    if (key === paintKey) { paintedChoice = selected; return; }
    var serial = ++paintSerial, url = imageUrl(id);
    prepare(url).then(function (ok) {
      if (!ok || serial !== paintSerial || theme !== root.getAttribute('data-theme')) return;
      var viewport = { width: innerWidth, height: innerHeight };
      var commit = function () {
        if (serial !== paintSerial) return;
        paintedChoice = selected; paintKey = key; paintedUrl = url;
        attr('data-lg-wall', id || null); attr('data-lg-wall-any', id && look() !== 'glass' ? '' : null);
        if (url && window.PM_LG && PM_LG.commitWallpaper) PM_LG.commitWallpaper(id, url, viewport);
      };
      if (printFinish) printFinish();
      mountPrints();
      if (!animate || still() || printLayers.length !== 2) { commit(); return; }
      var ground = getComputedStyle(document.body).backgroundColor;
      printLayers.forEach(function (e, i) {
        e.style.backgroundColor = ground;
        e.style.backgroundImage = (i ? url : paintedUrl) ? 'url(' + JSON.stringify(i ? url : paintedUrl) + ')' : 'none';
      });
      printLayers[0].style.opacity = '1'; printLayers[1].style.opacity = '0';
      var done = false;
      function finish() {
        if (done) return; done = true;
        printLayers.forEach(function (e) { e.style.opacity = '0'; });
        printAnimations.forEach(function (a) { a.cancel(); }); printAnimations = [];
        if (printFinish === finish) printFinish = null;
      }
      printFinish = finish;
      /* Start the prepared frost with the body fade. Waiting for the midpoint left the sheets showing the old
         print for another 120 ms, followed by their raster cost, even when preparation was a cache hit. */
      var fade = printLayers[1].animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240, easing: 'linear', fill: 'forwards' });
      printAnimations = [fade]; commit();
      fade.finished.then(finish, finish);
    });
  }

  function choose(c, later) {
    if (c !== 'look' && !byId[c]) return false;
    try { localStorage.setItem(KEY, c); } catch (e) {}
    clearTimeout(commitT); cancelAnimationFrame(commitFrame); ++paintSerial;
    sync();
    /* The timeout begins after a presented frame, rather than inside that frame's rAF callback. */
    commitFrame = requestAnimationFrame(function () { commitFrame = 0; commitT = setTimeout(function () { apply(true); }, later ? 160 : 0); });
    return true;
  }

  /* ---- the gallery ----------------------------------------------------------------------------------------------- */
  function tile(id, name, label, detail) {
    return '<button type="button" class="wpk-tile" role="radio" aria-checked="false" tabindex="-1" data-wpk-pick="' + esc(id) + '" aria-label="' + esc(label) + '"' +
      ' data-pm-hover-label="' + esc(name) + '" data-pm-hover-detail="' + esc(detail) + '">' +
      '<span class="wpk-thumb"' + (id === 'look' ? ' data-wpk-own=""' : ' data-wpk-id="' + esc(id) + '"') + '><i class="wpk-check" aria-hidden="true"></i></span>' +
      '<span class="wpk-name">' + esc(name) + '</span></button>';
  }
  function rowHtml() {
    var h = '<div class="setting-copy"><div class="setting-label" id="wpk-label">Wallpaper<span class="o55-changed" title="Changed from the default" hidden>' +
      '<span class="pm-status-mark" data-status="change-modified" data-tone="changed" aria-hidden="true"></span><span>Changed</span></span></div>' +
      '<div class="setting-description" id="wpk-desc">Shows behind the panels in every look. Its light or dark print follows the look.</div></div>' +
      '<div class="wpk-gallery" role="radiogroup" aria-labelledby="wpk-label" aria-describedby="wpk-desc">' +
      '<div class="wpk-grid wpk-own">' + tile('look', "Look's own", "Look's own", 'Each look keeps its own background.') + '<p class="wpk-note"></p></div>';   /* not live: each radio already announces itself */
    CAT.families.forEach(function (f) {
      h += '<div class="wpk-fam" aria-hidden="true">' + esc(f.label) + '</div><div class="wpk-grid">';
      f.wallpapers.forEach(function (w) { h += tile(w.id, w.name, w.name + ', ' + f.label, w.description); });
      h += '</div>';
    });
    return h + '</div>';
  }
  function row() { return document.getElementById(ROW_ID); }
  function mine(r) { return r && r.classList.contains('wpk-row') && !!r.querySelector('.wpk-gallery'); }
  function mount() {
    var themeRow = document.getElementById('setting-general.visual.theme'); if (!themeRow) return;
    var r = row(); if (mine(r)) return;
    var el = document.createElement('div');
    el.className = 'setting-row o55-row wpk-row'; el.id = ROW_ID; el.setAttribute('data-o55-kind', 'gallery'); el.innerHTML = rowHtml();
    if (r) r.parentNode.replaceChild(el, r);   /* an older picker in the same place */
    else { var after = document.getElementById('setting-general.visual.theme-mode') || themeRow; after.parentNode.insertBefore(el, after.nextSibling); }
    sync(); watchWarm(el);
  }
  /* bring the gallery's state up to the choice: the chosen tile, the one tab stop, the Changed mark, the note */
  function sync() {
    var r = row(); if (!mine(r)) return;
    var c = choice(), fam = look(), def = lookDefault(fam), w = byId[c];
    r.querySelectorAll('.wpk-tile').forEach(function (t) {
      var on = t.getAttribute('data-wpk-pick') === c;
      if (t.getAttribute('aria-checked') !== String(on)) t.setAttribute('aria-checked', String(on));
      /* The tabIndex property can ask whether a button is focusable, flushing the pending wallpaper restyle.
         Its reflected attribute carries the same keyboard state without a synchronous style read. */
      var tabIndex = on ? '0' : '-1';
      if (t.getAttribute('tabindex') !== tabIndex) t.setAttribute('tabindex', tabIndex);
    });
    r.classList.toggle('is-changed', c !== 'look'); r.querySelector('.o55-changed').hidden = c === 'look';
    var own = r.querySelector('[data-wpk-own]');
    if (def) own.setAttribute('data-wpk-id', def); else own.removeAttribute('data-wpk-id');
    own.setAttribute('data-wpk-own', inNier() && !def ? 'nier' : fam);
    var lookName = inNier() && !def ? 'NieR Mode' : (LOOK_NAMES[fam] || 'This look');
    /* in the opaque looks Settings itself covers most of the wallpaper: say where it shows */
    var note = w ? w.name + ' shows in every look, in its light or dark print.' + (fam === 'glass' ? '' : ' Home and Usage show the most of it.')
      : def ? lookName + ' shows ' + byId[def].name + ' until you choose another.' : lookName + ' keeps its own background until you choose one.';
    var n = r.querySelector('.wpk-note'); if (n.textContent !== note) n.textContent = note;
  }

  document.addEventListener('pointerover', function (e) {
    var t = e.target.closest && e.target.closest('.wpk-row .wpk-tile');
    if (!t || t.contains(e.relatedTarget)) return;
    var id = t.getAttribute('data-wpk-pick'); if (id === 'look') id = lookDefault(look());
    if (id) prepare(imageUrl(id));
  });

  /* clicks and keys: one radiogroup across the families */
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('.wpk-row .wpk-tile'); if (!t) return;
    choose(t.getAttribute('data-wpk-pick'), false);
  });
  document.addEventListener('keydown', function (e) {
    var t = e.target.closest && e.target.closest('.wpk-row .wpk-tile'); if (!t) return;
    var tiles = Array.prototype.slice.call(row().querySelectorAll('.wpk-tile')), i = tiles.indexOf(t), next = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') next = (i + (e.key === 'ArrowRight' ? 1 : tiles.length - 1)) % tiles.length;
    else if (e.key === 'Home') next = 0; else if (e.key === 'End') next = tiles.length - 1;
    else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {   /* the nearest tile in the next row, by where it is drawn */
      var a = t.getBoundingClientRect(), down = e.key === 'ArrowDown', best = Infinity;
      tiles.forEach(function (o, k) {
        var b = o.getBoundingClientRect(); if (down ? b.top < a.bottom - 2 : b.bottom > a.top + 2) return;
        var d = Math.abs(down ? b.top - a.bottom : a.top - b.bottom) * 4 + Math.abs((b.left + b.right) / 2 - (a.left + a.right) / 2);
        if (d < best) { best = d; next = k; }
      });
      if (next < 0) return;
    } else if (e.key === ' ' || e.key === 'Enter') { choose(t.getAttribute('data-wpk-pick'), false); e.preventDefault(); return; }
    else return;
    e.preventDefault();
    tiles[next].focus(); choose(tiles[next].getAttribute('data-wpk-pick'), true);
  });

  /* ---- keeping up ---------------------------------------------------------------------------------------------- */
  /* the look changes (theme, NieR Mode): repaint the choice; another writer (glass.js's concept control) changes the
     wallpaper: only the gallery follows, nothing is written back, so no two writers can answer each other */
  new MutationObserver(function (recs) {
    var relook = false, was = stale; recs.forEach(function (r) { if (r.attributeName !== 'data-lg-wall') relook = true; });
    choice();
    /* the other writer showed a saved id this build lacks (choice() has just set it back to 'look'): paint the default
       now, not at the other writer's next pass, so no frame shows a missing image */
    if (relook || stale !== was) { apply(); resetWarm(); }
    sync();
  }).observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-o55-nier', 'data-lg-wall'] });
  /* Settings renders its rows again on many changes: mount the gallery whenever the Theme row is there without it */
  var mountQ = 0;
  function queueMount() { if (!mountQ) mountQ = requestAnimationFrame(function () { mountQ = 0; mount(); }); }
  function watch() { new MutationObserver(function () { var r = row(); if (!mine(r) && document.getElementById('setting-general.visual.theme')) queueMount(); }).observe(document.body, { childList: true, subtree: true }); mount(); }
  /* another window chose a wallpaper */
  window.addEventListener('storage', function (e) { if (e.key === KEY || e.key === null) { sync(); requestAnimationFrame(function () { setTimeout(function () { apply(true); }, 0); }); } });

  /* Jared #18 (2026-10-14): the most recent wallpaper decision wins, from either control. NieR Mode's customizer writes
     only its own background (general.visual.nier-background); when that committed value changes, this package hands the
     wallpaper back to the look ('look'), so NieR's choice shows. A pick in this gallery then wins again. This package
     stays the only writer of the wallpaper choice. A NieR preview (the onboarding window's) is not a change: only the
     committed setting counts. */
  function nierBackground() { try { return window.PM51 && typeof PM51.value === 'function' ? String(PM51.value('general.visual.nier-background') || '') : ''; } catch (e) { return ''; } }
  var nierBg = null;
  function hookNier() {
    var N = window.PM_NIER; if (!N || typeof N.onChange !== 'function') return false;
    nierBg = nierBackground();
    N.onChange(function (ev) {
      if (!ev || !(ev.reason === 'background' || (ev.changed && ev.changed.indexOf('background') >= 0))) return;
      var now = nierBackground(); if (now === nierBg) return;
      nierBg = now;
      if (choice() !== 'look') choose('look', false);
    });
    return true;
  }
  if (!hookNier()) { var nierTries = 0; (function retry() { if (hookNier() || ++nierTries > 60) return; setTimeout(retry, 250); })(); }

  mountPrints(); apply();
  if (document.body) watch(); else document.addEventListener('DOMContentLoaded', watch);

  window.PM_WALLPAPERS = {
    version: 'wpk-2026-10-14', key: KEY,
    catalog: function () { return CAT.families.map(function (f) { return { family: f.family, label: f.label, ids: f.wallpapers.map(function (w) { return w.id; }) }; }); },
    /* Consumers of the committed print must not force root style from an attribute observer. Preparation fills this
       immutable catalog cache before publishing data-lg-wall. Unknown is undefined; a print with no image is null. */
    sourceUrl: function (id, mode) {
      if (!id) return null;
      var source = imageUrls.get(id + '-' + (mode || (/-light$/.test(root.getAttribute('data-theme') || '') ? 'light' : 'dark')));
      return source === '' ? null : source;
    },
    choice: choice, shown: shown, paintChoice: function () { return paintedChoice; }, choose: function (c) { return choose(c, false); }, stale: function () { return stale; }
  };
})();
