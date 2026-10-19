/* Shared chat-context source for usage_layer.py. The redesigned Usage page lives in usage-redesign/src.
   The layer extracts the pinned module below and supplies its helpers; the old Prism controller is retired. */
  /* U11 context module, mounted into every Assistant header. */
  var CTX = { used: 42180, limit: 128000, pct: 33, input: 38200, output: 3980, cache: 96.8, segments: [43, 21, 14, 12, 10], labels: ['Messages', 'Instructions', 'Tools', 'Skills', 'Memory'], compact: 0 };
  function ctxPopupHTML() {
    return '<div class="pm7ctx-head"><b>Context usage</b><span>' + tok(CTX.used) + ' / ' + tok(CTX.limit) + '</span></div><div class="pm7ctx-segbar">' + CTX.segments.map(function (value) { return '<i style="width:' + value + '%"></i>'; }).join('') + '</div><div class="pm7ctx-legend">' + CTX.labels.slice(0, 4).map(function (label, index) { return '<span class="pm7ctx-leg"><i></i>' + label + ' ' + CTX.segments[index] + '%</span>'; }).join('') + '</div><div class="pm7ctx-limit"><span>Current window</span><b>' + CTX.pct + '% used</b><span>Input / output</span><b>' + tok(CTX.input) + ' / ' + tok(CTX.output) + '</b><span>Reclaimable</span><b>' + (CTX.compact ? '0 tokens' : '18.6k tokens') + '</b></div><div class="pm7ctx-status ' + (CTX.compact ? 'show' : '') + '" data-pm7ctx-status>' + (CTX.compact ? '<b>Compacted</b> · 18.6k tokens reclaimed.' : '') + '</div><div class="pm7ctx-actions"><span class="pm7ctx-cache">Cache hit <b>' + CTX.cache.toFixed(1) + '%</b></span><button type="button" class="chm-compact-btn" ' + (CTX.compact ? 'disabled' : '') + '>' + (CTX.compact ? 'Compacted' : 'Compact now') + '</button><button type="button" class="chm-details-link">More details</button></div>';
  }
  function enhanceContext(root) {
    $$('.context-usage', root || document).forEach(function (wrap) {
      if (wrap.getAttribute('data-pm7-context-ready')) return;
      wrap.setAttribute('data-pm7-context-ready', '1'); wrap.setAttribute('aria-label', 'Context usage, ' + CTX.pct + '% used');
      var module = $('.context-hover-module', wrap); if (module) { module.classList.add('pm7ctx-pop'); module.innerHTML = ctxPopupHTML(); }
      var arc = $('circle:last-child', wrap); if (arc) { arc.style.strokeDasharray = '62.8'; arc.style.strokeDashoffset = (62.8 * (1 - CTX.pct / 100)).toFixed(2); arc.style.strokeLinecap = 'round'; arc.style.stroke = CTX.pct >= 90 ? '#e36b78' : CTX.pct >= 70 ? 'var(--accent-orange)' : 'var(--accent-primary)'; }
    });
  }
  function activePageName() { var page = document.querySelector('.page.active'); return page ? page.id.replace(/^panel-/, '') : 'dashboard'; }
  function currentChatMount(from) { return from.closest('#chatPanel,#floatingChat') || document.getElementById('chatPanel'); }
  function contextDrawerHTML(title) {
    var raw = JSON.stringify({ thread_id: 'thread-main', title: title, context_used: CTX.used, effective_window: CTX.limit, cache_hit_rate: CTX.cache, segments: CTX.labels.map(function (label, index) { return { family: label, pct: CTX.segments[index] }; }), provider_payload: 'redacted' }, null, 2);
    return '<div class="pm7ctx-dhead"><b>Context details · ' + esc(title) + '</b><button type="button" class="pm7ctx-close" data-pm7ctx-close aria-label="Close context details"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div><div class="pm7ctx-tabs"><button type="button" class="pm7ctx-tab active" data-pm7ctx-tab="curated">Curated</button><button type="button" class="pm7ctx-tab" data-pm7ctx-tab="raw">Raw</button></div><div class="pm7ctx-dbody"><div class="pm7ctx-curated"><section class="pm7ctx-section"><h3>Current window</h3><div class="pm7ctx-overview"><div class="pm7ctx-tile"><b>' + CTX.pct + '%</b><span>used</span></div><div class="pm7ctx-tile"><b>' + tok(CTX.used) + '</b><span>tokens loaded</span></div><div class="pm7ctx-tile"><b>' + CTX.cache.toFixed(1) + '%</b><span>cache hit</span></div></div></section><section class="pm7ctx-section"><h3>Source composition</h3>' + CTX.labels.map(function (label, index) { return '<div class="pm7ctx-source"><i></i><span>' + label + '</span><b>' + CTX.segments[index] + '%</b><b>' + tok(Math.round(CTX.used * CTX.segments[index] / 100)) + '</b></div>'; }).join('') + '</section><section class="pm7ctx-section"><h3>Effective route</h3><div class="pm7ctx-kv"><span>Requested model</span><b>Claude Opus 4.6</b><span>Effective model</span><b>Claude Sonnet 4.6</b><span>Fallback reason</span><b>5h allowance pressure</b><span>Effective window</span><b>128k tokens</b><span>Context cache</span><b>' + CTX.cache.toFixed(1) + '% hit</b><span>Compaction state</span><b>' + (CTX.compact ? 'compacted just now' : '18.6k reclaimable') + '</b></div></section><section class="pm7ctx-section"><h3>Current limits</h3><div class="pm7ctx-kv"><span>Claude 5h window</span><b>78% · resets in 1h 42m</b><span>Codex 5h window</span><b>63% · resets in 3h 18m</b><span>Thread hard limit</span><b>128k tokens</b><span>Reserved output</span><b>16k tokens</b></div></section></div><pre class="pm7ctx-raw">' + esc(raw) + '</pre></div>';
  }
  function openContextDetails(trigger) {
    var mount = currentChatMount(trigger), title = ($('.chatHeaderTitle', mount) || {}).textContent || 'Current thread', drawer = $('.pm7ctx-drawer', mount);
    if (!drawer) { drawer = document.createElement('aside'); drawer.className = 'pm7ctx-drawer'; drawer.setAttribute('data-tab', 'curated'); mount.appendChild(drawer); }
    CONTEXT_DRAWER_TITLES.set(drawer, title.trim()); drawer.innerHTML = contextDrawerHTML(title.trim()); drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false');
    command('cmd.chat.open_thread_context_details', { thread_id: 'thread-main' }, { opened: true, source_page: activePageName() });
    usageEvent('view.chat.context_details_opened', { thread_id: 'thread-main', thread_title: title.trim(), source_page: activePageName() });
  }
  var CONTEXT_DRAWER_TITLES = new WeakMap();
  function contextFocusToken(root) {
    var active = document.activeElement;
    if (!active || !root.contains(active)) return null;
    if (active.hasAttribute('data-pm7ctx-close')) return 'close';
    if (active.hasAttribute('data-pm7ctx-tab')) return 'tab:' + active.getAttribute('data-pm7ctx-tab');
    if (active.classList.contains('chm-compact-btn')) return 'compact';
    if (active.classList.contains('chm-details-link')) return 'details';
    return 'root';
  }
  function restoreContextFocus(root, token) {
    if (!token) return;
    var target = token === 'close' ? $('[data-pm7ctx-close]', root) : token.indexOf('tab:') === 0 ? $('[data-pm7ctx-tab="' + token.slice(4) + '"]', root) : token === 'compact' ? $('.chm-compact-btn', root) : token === 'details' ? $('.chm-details-link', root) : null;
    if (target && target.disabled) target = $('.chm-details-link', root);
    if (!target) target = $('[data-pm7ctx-tab].active', root) || $('[data-pm7ctx-close]', root) || root.closest('.context-usage');
    if (target && typeof target.focus === 'function') target.focus();
  }
  function syncUsageContextProjection() {
    var context = DATA.context;
    context.used = CTX.used; context.limit = CTX.limit; context.pct = CTX.pct;
    context.input = CTX.input; context.output = CTX.output; context.cache = CTX.cache;
    context.reclaim = CTX.compact ? 0 : context.reclaim;
    context.segments = CTX.segments.slice(); context.labels = CTX.labels.slice();
    context.mutable = Math.max(0, context.used - context.pinned);
    context.compacted = !!CTX.compact;
    context.last_compact = context.compacted ? 'just now' : context.last_compact;
    context.last_maintenance = context.compacted ? 'just now' : context.last_maintenance;
    if (state.room === 'context') render();
  }
  function refreshContextModules() {
    $$('.context-usage').forEach(function (element) {
      var module = $('.context-hover-module', element), token = module ? contextFocusToken(module) : null;
      if (module) module.innerHTML = ctxPopupHTML();
      var arc = $('circle:last-child', element); if (arc) arc.style.strokeDashoffset = (62.8 * (1 - CTX.pct / 100)).toFixed(2);
      element.setAttribute('aria-label', 'Context usage, ' + CTX.pct + '% used');
      if (module) restoreContextFocus(module, token);
    });
  }
  function refreshOpenContextDrawers() {
    $$('.pm7ctx-drawer.open').forEach(function (drawer) {
      var tab = drawer.getAttribute('data-tab') || 'curated';
      var title = CONTEXT_DRAWER_TITLES.get(drawer) || 'Current thread';
      var focusToken = contextFocusToken(drawer);
      var body = $('.pm7ctx-dbody', drawer), scrollTop = body ? body.scrollTop : 0;
      drawer.innerHTML = contextDrawerHTML(title); drawer.setAttribute('data-tab', tab);
      $$('[data-pm7ctx-tab]', drawer).forEach(function (button) { button.classList.toggle('active', button.getAttribute('data-pm7ctx-tab') === tab); });
      drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false');
      body = $('.pm7ctx-dbody', drawer); if (body) body.scrollTop = scrollTop;
      restoreContextFocus(drawer, focusToken);
    });
  }
  function compactContext(trigger) {
    if (CTX.compact) return;
    var compactionReceipt = command('cmd.chat.compact_context', { thread_id: 'thread-main' }, { requested: true, before_tokens: CTX.used, effective_window: CTX.limit, projection_state: 'started' }, { defer_receipt: true });
    CTX.compaction_receipt = compactionReceipt;
    CTX.compact = 1;
    var wrap = trigger.closest('.context-usage'), status = wrap && $('[data-pm7ctx-status]', wrap);
    if (status) { status.classList.add('show'); status.innerHTML = '<b>Compacting context</b> · preserving pinned instructions and current work.'; }
    setTimeout(function () {
      CTX.used = 23580; CTX.input = CTX.used - CTX.output; CTX.pct = Math.round(CTX.used / CTX.limit * 100); CTX.segments = [47, 24, 11, 9, 9];
      refreshContextModules();
      syncUsageContextProjection();
      refreshOpenContextDrawers();
      if (CTX.compaction_receipt) completeCommandReceipt(CTX.compaction_receipt, { projection_state: 'completed', after_tokens: CTX.used, reclaimed_tokens: 18600 });
      toast('Context compacted · 18.6k tokens reclaimed');
    }, 850);
  }
  document.addEventListener('click', function (event) {
    var close = event.target.closest('[data-pm7ctx-close]');
    if (close) { event.preventDefault(); event.stopImmediatePropagation(); var drawer = close.closest('.pm7ctx-drawer'); if (drawer) { drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); } return; }
    var tab = event.target.closest('[data-pm7ctx-tab]');
    if (tab) { event.preventDefault(); event.stopImmediatePropagation(); var parent = tab.closest('.pm7ctx-drawer'), id = tab.getAttribute('data-pm7ctx-tab'); parent.setAttribute('data-tab', id); $$('[data-pm7ctx-tab]', parent).forEach(function (button) { button.classList.toggle('active', button === tab); }); return; }
    var more = event.target.closest('.context-usage .chm-details-link'); if (more) { event.preventDefault(); event.stopImmediatePropagation(); openContextDetails(more); return; }
    var compact = event.target.closest('.context-usage .chm-compact-btn'); if (compact) { event.preventDefault(); event.stopImmediatePropagation(); compactContext(compact); }
  }, true);
  var contextObserver = new MutationObserver(function (mutations) {
    /* Context affordances are local to the subtree that was just mounted.
       A document-wide enhancement pass on every Settings/content insertion
       made unrelated manager transitions pay for the entire application. */
    mutations.forEach(function (mutation) {
      Array.prototype.forEach.call(mutation.addedNodes || [], function (node) {
        if (node && node.nodeType === 1) enhanceContext(node);
      });
    });
  });
  contextObserver.observe(document.body, { childList: true, subtree: true });
  window.PM7_CONTEXT = { enhance: enhanceContext, openDetails: openContextDetails, compact: compactContext };
