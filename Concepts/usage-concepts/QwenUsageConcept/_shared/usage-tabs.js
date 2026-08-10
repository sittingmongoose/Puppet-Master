(function () {
  'use strict';
  function reduced() {
    return document.documentElement.getAttribute('data-reduced-motion') === '1' ||
      (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  function knobs() {
    var t = (document.documentElement.getAttribute('data-theme') || '');
    if (t.indexOf('retro') === 0) return { mag: 0.8, stiff: 340, damp: 30 };
    if (t.indexOf('basic') === 0) return { mag: 0.9, stiff: 210, damp: 26 };
    if (t.indexOf('glass') === 0) return { mag: 1.15, stiff: 110, damp: 15 };
    if (t.indexOf('friendly') === 0) return { mag: 1.1, stiff: 150, damp: 14 };
    return { mag: 1, stiff: 170, damp: 22 };
  }
  function mount(el, opts) {
    opts = opts || {};
    var tabs = opts.tabs || [];
    var active = opts.active || (tabs[0] && tabs[0].id);
    var panelsRoot = opts.panelsRoot || null;
    el.classList.add('pm-tabs');
    el.setAttribute('role', 'tablist');
    var ink = document.createElement('span');
    ink.className = 'pm-tab-ink';
    ink.setAttribute('aria-hidden', 'true');
    el.insertBefore(ink, el.firstChild);
    var btns = {};
    var order = tabs.map(function (t) { return t.id; });
    tabs.forEach(function (t) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'pm-tab';
      b.id = 'pm-tab-' + t.id;
      b.setAttribute('role', 'tab');
      b.setAttribute('data-tab', t.id);
      b.setAttribute('aria-controls', 'pm-panel-' + t.id);
      if (t.tip) { b.setAttribute('data-tip', t.tip); b.setAttribute('aria-label', t.tip); }
      b.innerHTML = '<span class="pm-tab-lb">' + t.label + '</span>' +
        (t.badge ? '<span class="pm-tab-badge">' + t.badge + '</span>' : '');
      el.appendChild(b);
      btns[t.id] = b;
    });
    order.forEach(function (oid) {
      var on = oid === active;
      btns[oid].classList.toggle('active', on);
      btns[oid].setAttribute('aria-selected', on ? 'true' : 'false');
      btns[oid].setAttribute('tabindex', on ? '0' : '-1');
    });
    var pos = { x: null, w: null, vx: 0, vw: 0, raf: 0 };
    var SPRING = { stiffness: 500, damping: 35 };
    function snap(b) {
      cancelAnimationFrame(pos.raf); pos.vx = 0; pos.vw = 0;
      pos.x = b.offsetLeft; pos.w = b.offsetWidth;
      ink.style.width = pos.w + 'px'; ink.style.height = b.offsetHeight + 'px';
      ink.style.transform = 'translate3d(' + pos.x + 'px,' + b.offsetTop + 'px,0)';
    }
    function springTo(b) {
      var tx = b.offsetLeft, tw = b.offsetWidth;
      ink.style.height = b.offsetHeight + 'px';
      if (pos.x === null || reduced()) { snap(b); return; }
      cancelAnimationFrame(pos.raf);
      var last = performance.now();
      function step(now) {
        var dt = Math.min((now - last) / 1000, 1 / 30); last = now;
        for (var s = 0; s < 2; s++) {
          var h = dt / 2;
          pos.vx += (-SPRING.stiffness * (pos.x - tx) - SPRING.damping * pos.vx) * h;
          pos.vw += (-SPRING.stiffness * (pos.w - tw) - SPRING.damping * pos.vw) * h;
          pos.x += pos.vx * h; pos.w += pos.vw * h;
        }
        ink.style.width = pos.w + 'px';
        ink.style.transform = 'translate3d(' + pos.x + 'px,' + b.offsetTop + 'px,0)';
        if (Math.abs(pos.vx) < 0.5 && Math.abs(pos.vw) < 0.5 && Math.abs(pos.x - tx) < 0.25 && Math.abs(pos.w - tw) < 0.25) {
          pos.x = tx; pos.w = tw; pos.vx = 0; pos.vw = 0;
          ink.style.width = tw + 'px'; ink.style.transform = 'translate3d(' + tx + 'px,' + b.offsetTop + 'px,0)';
          return;
        }
        pos.raf = requestAnimationFrame(step);
      }
      pos.raf = requestAnimationFrame(step);
    }
    var pendingHide = {};
    function cancelHide(pid) {
      var ph = pendingHide[pid];
      if (ph) { ph.panel.removeEventListener('animationend', ph.fn); pendingHide[pid] = null; }
    }
    function crossfade(id, prev, fromUser) {
      if (!panelsRoot) return;
      var pi = order.indexOf(id), pp = order.indexOf(prev);
      el.style.setProperty('--pm-dir', (pi >= pp ? 1 : -1));
      panelsRoot.querySelectorAll('[data-pm-panel]').forEach(function (p) {
        var pid = p.getAttribute('data-pm-panel');
        if (pid === id) {
          cancelHide(pid);
          if (!reduced() && fromUser) { p.classList.remove('pm-out'); p.classList.add('pm-in'); }
          else { p.classList.remove('pm-out', 'pm-in'); }
          p.style.display = '';
        } else if (pid === prev && !reduced() && fromUser) {
          cancelHide(pid);
          p.classList.remove('pm-in'); p.classList.add('pm-out');
          var done = function () {
            p.removeEventListener('animationend', done);
            pendingHide[pid] = null;
            if (pid === active) return;
            p.style.display = 'none'; p.classList.remove('pm-out');
          };
          pendingHide[pid] = { fn: done, panel: p };
          p.addEventListener('animationend', done);
        } else { cancelHide(pid); p.style.display = 'none'; p.classList.remove('pm-in', 'pm-out'); }
      });
    }
    function select(id, fromUser) {
      if (!btns[id]) return;
      var prev = active; active = id;
      order.forEach(function (oid) {
        var on = oid === id;
        btns[oid].classList.toggle('active', on);
        btns[oid].setAttribute('aria-selected', on ? 'true' : 'false');
        btns[oid].setAttribute('tabindex', on ? '0' : '-1');
      });
      springTo(btns[id]);
      crossfade(id, prev, fromUser);
      if (typeof opts.onSelect === 'function') opts.onSelect(id, prev);
    }
    el.addEventListener('click', function (e) {
      var b = e.target.closest('.pm-tab');
      if (b && el.contains(b)) select(b.getAttribute('data-tab'), true);
    });
    el.addEventListener('keydown', function (e) {
      var b = e.target.closest('.pm-tab'); if (!b) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(b.getAttribute('data-tab'), true); }
      else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        var i = order.indexOf(b.getAttribute('data-tab'));
        var n = i + (e.key === 'ArrowRight' ? 1 : -1);
        if (n >= 0 && n < order.length) { btns[order[n]].focus(); select(order[n], true); }
      }
      else if (e.key === 'Home') { e.preventDefault(); btns[order[0]].focus(); select(order[0], true); }
      else if (e.key === 'End') { e.preventDefault(); btns[order[order.length - 1]].focus(); select(order[order.length - 1], true); }
    });
    var mag = {}, mraf = 0, hovering = null;
    function mloop() {
      var F = knobs(), any = false;
      order.forEach(function (id) {
        var b = btns[id], m = mag[id]; if (!m) return;
        var dt = 1 / 60;
        if (hovering === id && m.tx !== undefined) {
          any = true;
          m.vx += (F.stiff * (m.tx - m.x) - F.damp * m.vx) * dt;
          m.vy += (F.stiff * (m.ty - m.y) - F.damp * m.vy) * dt;
          m.x += m.vx * dt; m.y += m.vy * dt;
          b.style.translate = m.x.toFixed(2) + 'px ' + m.y.toFixed(2) + 'px';
        } else if (m.x * m.x + m.y * m.y > 0.01 || m.vx * m.vx + m.vy * m.vy > 0.01) {
          any = true;
          m.vx += (F.stiff * (0 - m.x) - F.damp * m.vx) * dt;
          m.vy += (F.stiff * (0 - m.y) - F.damp * m.vy) * dt;
          m.x += m.vx * dt; m.y += m.vy * dt;
          if (Math.abs(m.x) < 0.04 && Math.abs(m.y) < 0.04 && Math.abs(m.vx) < 0.5 && Math.abs(m.vy) < 0.5) {
            m.x = 0; m.y = 0; m.vx = 0; m.vy = 0; b.style.translate = '';
          } else b.style.translate = m.x.toFixed(2) + 'px ' + m.y.toFixed(2) + 'px';
        }
      });
      if (any) mraf = requestAnimationFrame(mloop); else mraf = 0;
    }
    function ensure(id) { if (!mag[id]) mag[id] = { x: 0, y: 0, vx: 0, vy: 0 }; }
    el.addEventListener('pointermove', function (e) {
      if (reduced()) return;
      var b = e.target.closest('.pm-tab'); if (!b || !el.contains(b)) return;
      var id = b.getAttribute('data-tab'); hovering = id; ensure(id);
      var r = b.getBoundingClientRect(), F = knobs();
      var maxShift = Math.min(r.width, r.height) * 0.055;
      maxShift = (maxShift < 2.5 ? 2.5 : maxShift > 8 ? 8 : maxShift) * F.mag;
      var nx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2)));
      var ny = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height / 2)));
      mag[id].tx = nx * maxShift; mag[id].ty = ny * maxShift;
      if (!mraf) mraf = requestAnimationFrame(mloop);
    });
    el.addEventListener('pointerout', function (e) {
      var b = e.target.closest('.pm-tab');
      if (b && el.contains(b) && (!e.relatedTarget || !b.contains(e.relatedTarget)) && hovering === b.getAttribute('data-tab')) hovering = null;
    });
    function resync() { if (btns[active]) snap(btns[active]); }
    window.addEventListener('resize', resync);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(resync);
    var mo = new MutationObserver(function () { if (btns[active]) { if (reduced()) snap(btns[active]); else springTo(btns[active]); } });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-reduced-motion'] });
    if (panelsRoot) {
      panelsRoot.classList.add('pm-tabpanels');
      panelsRoot.querySelectorAll('[data-pm-panel]').forEach(function (p) {
        var pid = p.getAttribute('data-pm-panel');
        p.id = 'pm-panel-' + pid;
        p.setAttribute('role', 'tabpanel');
        p.setAttribute('aria-labelledby', 'pm-tab-' + pid);
        p.style.display = (pid === active) ? '' : 'none';
      });
    }
    requestAnimationFrame(function () { if (btns[active]) snap(btns[active]); });
    return { select: function (id) { select(id, true); }, get active() { return active; }, resync: resync };
  }
  window.PMTabs = { mount: mount };
})();
