/* The inspector drawer (owner: engine; ARCHITECTURE.md section 4.9, DESIGN-SPEC section 12, DESIGN-SPEC-ATLAS 8.1).
   Local: it dispatches nothing; content passes an InspectorSpec {kind, title, subtitle?, actions?, sections, raw?}. A
   400 px drawer inside the stage that slides in from the right with the panel spring (520 ms); Curated / Raw switch
   (Raw lists every field with credential handles masked); Escape or the close button closes it and focus returns to
   the opener. */
(function () {
  var el = document.getElementById('pmuInspector'), body = document.getElementById('pmuInspBody'), title = document.getElementById('pmuInspTitle');
  var sub = document.getElementById('pmuInspSub'), actions = document.getElementById('pmuInspActions'), modeSeg = document.getElementById('pmuInspMode');
  var opener = null, spec = null, mode = 'curated';
  var SECRET = /(token|secret|password|api[_-]?key|credential|handle|cookie|auth[_-]?header)/i;

  function mask(key, value) {
    if (value == null) return value;
    if (SECRET.test(key) && typeof value === 'string' && value.length > 4) return value.slice(0, 2) + '…' + value.slice(-2) + ' (masked)';
    return value;
  }
  function rawHtml(obj) {
    var rows = [];
    (function walk(o, prefix) {
      Object.keys(o || {}).forEach(function (k) {
        var v = o[k], key = prefix ? prefix + '.' + k : k;
        if (v && typeof v === 'object' && !Array.isArray(v)) walk(v, key);
        else rows.push('<span class="pmu-rawk">' + esc(key) + '</span><code class="pmu-rawv">' + esc(Array.isArray(v) ? JSON.stringify(v) : String(mask(key, v))) + '</code>');
      });
    })(obj, '');
    return '<p class="pmu-inspnote">' + esc(t('inspector.raw_note')) + '</p><div class="pmu-inspgrid pmu-inspraw">' + (rows.join('') || '<span>None</span><code>-</code>') + '</div>';
  }
  function sectionsHtml(s) {
    return (s.sections || []).map(function (sec) {
      return '<section class="pmu-inspsec"><h4 class="pmu-cap">' + esc(sec.title) + '</h4>' + (sec.html != null ? sec.html : '<div class="pmu-inspgrid">' +
        (sec.rows || []).map(function (r) { return '<span>' + esc(r[0]) + '</span><b>' + (r[1] == null ? '-' : r[1]) + '</b>'; }).join('') + '</div>') + '</section>';
    }).join('');
  }
  function paint(first) {
    if (!spec) return;
    var raw = mode === 'raw';
    body.innerHTML = raw ? rawHtml(spec.raw || flatten(spec)) : sectionsHtml(spec);
    if (modeSeg) {
      PMU.core.$$('button[data-insp-mode]', modeSeg).forEach(function (b) { var on = b.getAttribute('data-insp-mode') === mode; b.classList.toggle('active', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      if (PMU.shell && PMU.shell.syncSegInk) PMU.shell.syncSegInk(modeSeg, first);
    }
    if (!first && PMU.motion) PMU.motion.reveal(body.querySelectorAll('.pmu-inspsec, .pmu-inspraw > *'), { step: 12, cap: 200 });
  }
  function flatten(s) {
    var out = {};
    (s.sections || []).forEach(function (sec) { (sec.rows || []).forEach(function (r) { out[sec.title + ' · ' + r[0]] = String(r[1] == null ? '' : r[1]).replace(/<[^>]+>/g, ''); }); });
    return out;
  }
  function close() {
    if (!el || !el.classList.contains('open')) return;
    el.classList.remove('open'); el.setAttribute('aria-hidden', 'true');
    if (opener && opener.isConnected && typeof opener.focus === 'function') { try { opener.focus({ preventScroll: true }); } catch (e) {} }
    opener = null;
  }
  function open(s, from) {
    if (!el || !s) return;
    if (PMU.menu) PMU.menu.close();
    var wasOpen = el.classList.contains('open');
    opener = from || (wasOpen ? opener : document.activeElement);
    spec = s; mode = 'curated';
    title.textContent = s.title || '';
    if (sub) { sub.textContent = s.subtitle || ''; sub.hidden = !s.subtitle; }
    if (actions) {
      actions.innerHTML = (s.actions || []).map(function (a, i) {
        return '<button type="button" class="pmu-inspact' + (a.primary ? ' primary' : '') + '" data-ai="' + i + '"' + (a.disabled ? ' disabled aria-disabled="true"' : '') +
          (a.reason ? ' data-pm-hover-label="' + esc(a.reason) + '"' : '') + '>' + esc(a.label) + '</button>' + (a.disabled && a.reason ? '<span class="pmu-inspreason">' + esc(a.reason) + '</span>' : '');
      }).join('');
      actions.hidden = !(s.actions && s.actions.length);
    }
    paint(true);
    el.classList.add('open'); el.setAttribute('aria-hidden', 'false');
    if (!wasOpen && PMU.motion) PMU.motion.reveal(body.querySelectorAll('.pmu-inspsec'), { delay: 120, step: 40, cap: 320 });
    var closeBtn = document.getElementById('pmuInspClose');
    setTimeout(function () { if (closeBtn && el.classList.contains('open')) closeBtn.focus({ preventScroll: true }); }, 30);
  }
  var closeBtn = document.getElementById('pmuInspClose');
  if (closeBtn) closeBtn.addEventListener('click', close);
  if (el) {
    el.addEventListener('keydown', function (event) { if (event.key === 'Escape') { event.stopPropagation(); close(); } });
    el.addEventListener('click', function (event) {
      var m = event.target.closest('button[data-insp-mode]');
      if (m) { mode = m.getAttribute('data-insp-mode'); paint(false); return; }
      var a = event.target.closest('.pmu-inspact');
      if (a && spec && spec.actions) { var act = spec.actions[+a.getAttribute('data-ai')]; if (act && !act.disabled && typeof act.onClick === 'function') { try { act.onClick(); } catch (error) { console.error('[pm-usage] inspector action', error); } } }
    });
  }
  PMU.inspector = { open: open, close: close, isOpen: function () { return !!(el && el.classList.contains('open')); }, spec: function () { return spec; } };
})();
