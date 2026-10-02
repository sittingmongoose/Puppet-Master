/* The inspector drawer (owner: engine; ARCHITECTURE.md section 4.9, DESIGN-SPEC section 12). Local: it dispatches
   nothing; content passes an InspectorSpec. Skeleton: open / close with sections; Curated / Raw and the slide come next. */
(function () {
  var el = document.getElementById('pmuInspector'), body = document.getElementById('pmuInspBody'), title = document.getElementById('pmuInspTitle');
  var opener = null;
  function close() {
    if (!el) return;
    el.classList.remove('open'); el.setAttribute('aria-hidden', 'true');
    if (opener && typeof opener.focus === 'function') opener.focus();
    opener = null;
  }
  function open(spec, from) {
    if (!el || !spec) return;
    opener = from || document.activeElement;
    title.textContent = spec.title || '';
    body.innerHTML = (spec.sections || []).map(function (s) {
      return '<section class="pmu-inspsec"><h4>' + esc(s.title) + '</h4>' + (s.html ? s.html : '<div class="pmu-inspgrid">' +
        (s.rows || []).map(function (r) { return '<span>' + esc(r[0]) + '</span><b>' + r[1] + '</b>'; }).join('') + '</div>') + '</section>';
    }).join('');
    el.classList.add('open'); el.setAttribute('aria-hidden', 'false');
  }
  var closeBtn = document.getElementById('pmuInspClose');
  if (closeBtn) closeBtn.addEventListener('click', close);
  if (el) el.addEventListener('keydown', function (event) { if (event.key === 'Escape') { event.stopPropagation(); close(); } });
  PMU.inspector = { open: open, close: close, isOpen: function () { return !!(el && el.classList.contains('open')); } };
})();
