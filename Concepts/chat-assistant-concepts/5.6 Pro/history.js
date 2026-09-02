/* history.js — feature module.  OWNER: Wave 3 — History agent (items 3 + 4: take-6 status indicators, W1 open/pin choreography)
 *
 * Load order (see build.py): data.js, motion.js, variants-*.js, then EVERY feature
 * module, then app.js.  Modules therefore run BEFORE the app boots, so anything
 * registered here is live on the very first render — no re-render, no flash.
 *
 * Registered through window.PM56_EXT rather than by editing app.js:
 *   slot('threadRowStatus')  — item 3, the nine take-6 status indicators
 *   slot('historyChrome')    — item 4, the drawer's pin control
 *   slot('headerExtras')     — item 4, a no-markup per-render heartbeat (see SYNC)
 *   action(...)              — item 4, the open / pin / close state machine
 */
(function(){
  'use strict';
  var EXT = window.PM56_EXT;
  if(!EXT || !EXT.slot) return;

  /* =====================================================================
     ITEM 3 — nine animated status indicators for take 6 "Preview Rows".
     ---------------------------------------------------------------------
     The Demo Studio labels this take "6. Preview Rows"; it is
     state.variants[1] === 5 (app.js:1301, zero-based).  renderStatus()
     returns `.status-orbit` for it — the same working spinner for all nine
     statuses in statusLabel().  The orbit is kept for `working` (it matches
     the Orbit working animation, the requester's current top pick) and the
     other eight get their own motion signature in the same family; the CSS
     lives in history.css.

     Only this take is overridden.  Returning '' makes extReplace() fall back
     to the built-in renderStatus(), so the other seven takes are untouched.

     data-k: the slot renders inside `.thread-row`, which survives the 2s work
     tick, so it MUST be keyed or pmPatch remounts it twice a second and
     restarts every animation.  The key is the THREAD id, not the status: a
     status change then patches the class on the same node — restarting only
     the incoming status's animation, which is what makes `complete` draw its
     check exactly when the thread completes — instead of remounting the node.
     ===================================================================== */
  var TAKE_PREVIEW_ROWS = 5;

  /* Check / pause / X are 15×15 SVGs whose geometry is centered on 7.5,7.5 —
     CSS rotated capsules could not hit that grid. Working / reviewing keep the
     empty .ph-mark satellite. */
  var MARK_SVG = {
    complete: '<svg viewBox="0 0 15 15" aria-hidden="true"><path d="M4.45 7.7 6.45 9.8 10.45 5.3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    paused: '<svg viewBox="0 0 15 15" aria-hidden="true"><rect x="4" y="4" width="2" height="7" rx="1"/><rect x="9" y="4" width="2" height="7" rx="1"/></svg>',
    failed: '<svg viewBox="0 0 15 15" aria-hidden="true"><path d="M5 5 10 10 M10 5 5 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'
  };

  EXT.slot('threadRowStatus', function(ctx){
    if(ctx.variant !== TAKE_PREVIEW_ROWS) return '';
    var t = ctx.thread || {};
    var s = String(t.status || 'idle');
    var label = ctx.statusLabel(s);
    var inner = MARK_SVG[s] || '';
    return '<span class="ph-status ph-s-' + ctx.esc(s) + '" data-status="' + ctx.esc(s) + '"'
         + ' data-k="tstat:' + ctx.esc(t.id || '') + '" role="img"'
         + ' aria-label="' + ctx.esc(label) + '" title="' + ctx.esc(label) + '">'
         + '<i class="ph-ring"></i><i class="ph-mark">' + inner + '</i></span>';
  });


  /* =====================================================================
     ITEM 4 — the kimi-k3 W1 open/pin choreography, ported.
     ---------------------------------------------------------------------
     THE SHAPE OF THE PORT.  In the reference there is exactly ONE drawer
     node: opening slides it in from translateX(-102%), and pinning does not
     move it at all — it narrows in place while the main column's padding-left
     grows to match, so the transcript slides right into a reserved gutter.
     5.6 Pro instead had TWO representations (a right-hand `.history-flyout`
     overlay and a left-hand `.history-panel` grid column) and teleported
     between them, which is why it "opens on the right and then pins left".

     So this module makes the flyout the single drawer for BOTH states:
     `state.historyMode` is never allowed to be 'pinned' (that value is what
     spawns the grid column); pinning is a module state carried on
     `<body data-ph-drawer>`, and history.css turns that into a narrower
     drawer plus a matching `padding-left` on `.assistant-grid`.

     WHY THE STATE LIVES ON <body>.  pmSyncAttrs (app.js:955-963) deletes any
     attribute that is not in the freshly rendered markup, so a class added
     imperatively to `.history-flyout` is wiped by the next pmPatch — and the
     2s work tick guarantees one within 2s.  `<body>` is outside both patched
     roots (#pmRoot / #pmOverlayRoot), so attributes there survive.

     THE CLOSE BUG THAT IS NOT PORTED.  w1-solo-column.js:330-333 puts
     `if (drawerPinned()) return;` INSIDE closeDrawer(), so it swallows the
     explicit toggle button too and a pinned drawer can never be closed.  Here
     the guard sits at the two implicit-dismissal call sites only — Esc and
     scrim-click — and the toggle is unguarded and additionally unpins, so the
     gutter collapses together with the drawer.  The reference's sibling
     defect (paintPin() hides the scrim on pin and never restores it on unpin)
     cannot occur here either: the scrim is declarative, keyed off the same
     `data-ph-drawer` value, so unpinning restores it with no JS at all.
     ===================================================================== */

  var PIN_KEY = 'pm56-history-pin';
  var api = null;               // captured PM56_EXT context (STABLE closures only)
  var pinned = false;
  var closing = false;
  var closeTimer = null;
  var syncQueued = false;
  var paneObserved = null;
  var paneRO = null;
  var flyoutObserved = null;
  var flyoutRO = null;

  /* globalReset() REASSIGNS the whole state object (`state = clone(DEFAULT)`,
     app.js:1429), so a cached `state` reference goes stale the first time the
     user hits Reset all.  The render helpers on the context are plain function
     declarations and never move, but state must be re-read every time. */
  function S(){ return EXT.ctx ? EXT.ctx().state : null; }
  function store(v){ try{ if(v==null) return window.localStorage.getItem(PIN_KEY); window.localStorage.setItem(PIN_KEY, v); }catch(e){} return null; }
  function reduced(){ return !!(window.PM56_MOTION && window.PM56_MOTION.reduced && window.PM56_MOTION.reduced()); }
  function mode(){ return document.body.dataset.phDrawer || ''; }
  function setMode(v){ document.body.dataset.phDrawer = v; }
  function isOpen(){ var m = mode(); return m === 'open' || m === 'pinned'; }

  /* ---- SYNC: where the drawer actually sits ------------------------------
     The drawer is position:fixed inside #pmOverlayRoot, but it belongs to the
     ASSISTANT PANE, not to the viewport: "open left" means the left edge of
     the pane the history column has always lived in, not the left edge of the
     screen (which is the editor).  So the pane's box is measured and published
     as custom properties that history.css uses for left/top/height, and for
     the 85%/42% clamps that the reference expresses as percentages of its own
     root.  A ResizeObserver covers editor-resizer drags and window resizes;
     the per-render heartbeat below covers everything else. */
  function sync(){
    var pane = document.querySelector('.assistant-pane');
    if(!pane) return;
    if(pane !== paneObserved){
      if(paneRO) paneRO.disconnect();
      paneObserved = pane;
      if(window.ResizeObserver){
        paneRO = new ResizeObserver(function(){ sync(); });
        paneRO.observe(pane);
      }
    }
    var r = pane.getBoundingClientRect();
    var s = document.documentElement.style;
    s.setProperty('--ph-x', r.left + 'px');
    s.setProperty('--ph-y', r.top + 'px');
    s.setProperty('--ph-h', r.height + 'px');
    s.setProperty('--ph-pane', r.width + 'px');
    syncHistoryHead();
    var flyout = document.querySelector('.history-flyout');
    if(flyout !== flyoutObserved){
      if(flyoutRO) flyoutRO.disconnect();
      flyoutObserved = flyout;
      if(flyout && window.ResizeObserver){
        flyoutRO = new ResizeObserver(function(){ syncHistoryHead(); });
        flyoutRO.observe(flyout);
      }
    }
  }

  function syncHistoryHead(){
    document.querySelectorAll('.history-head').forEach(function(head){
      var host = head.closest('.history-flyout, .history-panel');
      if(!host) return;
      var narrowPx = parseFloat(getComputedStyle(document.documentElement)
        .getPropertyValue('--ph-history-narrow-max')) || 204;
      /* Match the measured element the user tuned: .history-scroll width. */
      var scroll = host.querySelector('.history-scroll');
      var measureW = scroll ? scroll.getBoundingClientRect().width : host.clientWidth;
      var inNarrowBand = measureW <= narrowPx + 0.5;
      head.classList.toggle('is-hh-compact', inNarrowBand);
      host.classList.toggle('is-history-narrow', inNarrowBand);
    });
  }

  /* ---- the pinned drawer's width ----------------------------------------
     The JS clamp and history.css's min()/max() are deliberately the SAME two
     clamps stated twice, in the two places that can each be reached without the
     other: a pointer drag never touches CSS, and an editor-resizer drag or a
     window resize never touches JS. 170/360 are app.js:1928's own numbers for
     the deleted `.history-panel` column — kept identical so the restored handle
     has the range the original had, not a new one. */
  var W_MIN = 170, W_MAX = 360, W_PANE = 0.42;
  function paneWidth(){
    var pane = document.querySelector('.assistant-pane');
    return pane ? pane.getBoundingClientRect().width : window.innerWidth;
  }
  function clampWidth(px){
    var cap = Math.min(W_MAX, paneWidth() * W_PANE);
    if(!(cap > W_MIN)) cap = W_MIN;          /* a very narrow pane: floor wins */
    return Math.round(Math.max(W_MIN, Math.min(cap, Math.round(px))));
  }
  /* THE WIDTH IS MODULE STATE, exactly like `pinned` above, and for the same
     reason. It is deliberately NOT app.js's `state.historyWidth`: that field
     defaults to 224 (app.js:50) and is written to prefs on every savePrefs, so
     there is no way to tell "the user dragged to 224" from "nobody has ever
     touched it". Until someone actually drags, nothing is published and
     history.css falls back to --ph-pin-w — so the shipped default stays exactly
     the 200px this module declared, and only a deliberate drag changes it.
     (`pm56-history-pin` already sets this precedent, including surviving Reset
     all: see the note in normalise().) */
  var W_KEY = 'pm56-history-w';
  var userW = null;
  function storeW(v){ try{ if(v==null) return window.localStorage.getItem(W_KEY); window.localStorage.setItem(W_KEY, String(v)); }catch(e){} return null; }
  /* The fallback is read back from --ph-pin-w rather than repeated as a literal,
     so history.css stays the single place the default pinned width is stated.
     A custom-property read off documentElement is a style read, not a layout
     read, so it is safe to call from inside a render. */
  var pinDefault = null;
  function pinDefaultW(){
    if(pinDefault == null){
      var v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ph-pin-w'));
      pinDefault = v > 0 ? Math.round(v) : 200;
    }
    return pinDefault;
  }
  function widthNow(){ return userW == null ? pinDefaultW() : userW; }
  function setWidth(px){
    userW = clampWidth(px);
    document.documentElement.style.setProperty('--ph-user-w', userW + 'px');
    storeW(userW);
    syncHistoryHead();
    return userW;
  }

  /* Any code path that is not this module can still set historyMode to
     'pinned' — app.js does it in `show-archived` (overridden below) and in the
     "Archived threads" demo trigger, which is not an interceptable action.
     Rather than chase each one, every render normalises: 'pinned' is folded
     back into floating + pinned-drawer, which is the same thing on screen. */
  function normalise(st){
    if(!st || st.historyMode !== 'pinned') return false;
    st.historyMode = 'floating';
    pinned = true; store('1');
    setMode('pinned');
    /* deliberately no savePrefs(): globalReset() has just DELETED the prefs
       entry, and writing one straight back would half-undo the reset. */
    return true;
  }

  function heartbeat(){
    if(syncQueued) return;
    syncQueued = true;
    requestAnimationFrame(function(){
      syncQueued = false;
      var st = api && S();               /* read the state ONCE per heartbeat */
      if(normalise(st)){ api.renderApp(); return; }
      sync();
    });
  }

  /* headerExtras is an APPEND slot, so returning '' adds nothing to the
     markup.  It is registered purely because it is called once per renderApp
     (app.js:502) and is therefore the cheapest reliable "the app just
     rendered" signal a module can get without reopening app.js. */
  EXT.slot('headerExtras', function(){ heartbeat(); return ''; });

  /* ---- the drawer's own chrome ------------------------------------------
     The built-in head button is hard-coded to `pin-history` with a pin icon
     whenever the drawer is floating (app.js:469), so once pinning stops being
     a mode change it can no longer tell the truth in both directions.  It is
     hidden in history.css and replaced by this strip, which states the current
     mode and toggles it.  history.css also widens `.history-flyout`'s
     grid-template-rows from 3 to 4 to make room for the strip — without that
     the scroll surface lands in an implicit auto row and stops being bounded. */
  EXT.slot('historyChrome', function(ctx){
    if(!ctx.flyout) return '';
    heartbeat();
    requestAnimationFrame(function(){ requestAnimationFrame(syncHistoryHead); });
    void 'ph-chrome ph-chrome-state ph-pin';
    return ''
         /* THE RESIZE HANDLE the pinned grid column had and the drawer lost.
            Emitted here because historyChrome is the only append slot inside
            the flyout; it is position:absolute so it is not a flex item and
            its place in the child order does not matter.

            `data-ph-resize`, NOT app.js's `data-resize`: app.js would pick
            a `[data-resize]` up and run its own drag, which writes
            `--history-w` (dead here, see history.css) and, more to the point,
            would leave the 240ms width transition running under the pointer.
            The drag below is this module's, so it can suppress that and keep
            width and gutter on the same frame.

            data-k so pmPatch patches the same node across the 2s work tick
            instead of remounting it — a remount mid-drag would drop the pointer
            capture. role="separator" + aria-orientation + the three aria-value*
            attributes are the window-splitter pattern; aria-valuenow is
            re-emitted by the renderOverlays() at the end of each drag or key
            press, since nothing renders during a drag. */
         + '<div class="ph-resize" data-k="phresize" data-ph-resize'
         + ' role="separator" aria-orientation="vertical" tabindex="0"'
         + ' aria-valuemin="' + W_MIN + '" aria-valuemax="' + Math.round(Math.min(W_MAX, paneWidth() * W_PANE)) + '"'
         + ' aria-valuenow="' + clampWidth(widthNow()) + '"'
         + ' aria-label="Resize the pinned history drawer"'
         + ' title="Drag to resize the pinned drawer"></div>';
  });

  /* ---- open / pin / close ------------------------------------------------ */

  /* Opening, pinning and closing all change ONLY the overlay root and two body
     attributes — nothing in #pmRoot reads historyMode except a
     `!== 'pinned'` ternary this module never satisfies.  So these paths use
     renderOverlays (measured: 4ms) rather than renderApp (measured: 25-49ms on
     the 24-thread / 374-message fixture).  On a click path that is about to
     start a 240ms transition, a 25-49ms block is a visible late start. */
  function clearSettled(){ document.body.removeAttribute('data-ph-settled'); }
  function markSettled(){ document.body.dataset.phSettled = '1'; }
  /* Clip #pmOverlayRoot to the assistant pane so a leftward close cannot
     paint over the editor.  Open stays unclipped (user-approved).  inset()
     is relative to the overlay root's viewport-sized box. */
  function applyPaneClip(){
    var pane = document.querySelector('.assistant-pane');
    var root = document.getElementById('pmOverlayRoot');
    if(!pane || !root) return;
    sync();
    var r = pane.getBoundingClientRect();
    root.style.clipPath = 'inset('
      + Math.max(0, r.top) + 'px '
      + Math.max(0, window.innerWidth - r.right) + 'px '
      + Math.max(0, window.innerHeight - r.bottom) + 'px '
      + Math.max(0, r.left) + 'px)';
  }
  function clearPaneClip(){
    var root = document.getElementById('pmOverlayRoot');
    if(root) root.style.clipPath = '';
  }
  /* Prefer the transform transition duration (Details-panel contract).  Fall
     back across comma-separated lists if an older sheet reordered properties. */
  function readMotionMs(el, closing){
    if(!el) return 0;
    if(reduced()) return 0;
    var cs = window.getComputedStyle(el);
    var props = String(cs.transitionProperty || '').split(',');
    var durs = String(cs.transitionDuration || '').split(',');
    var ms = 0;
    for(var i = 0; i < props.length; i++){
      if(String(props[i]).trim() !== 'transform') continue;
      ms = parseFloat(durs[Math.min(i, durs.length - 1)]) * 1000;
      break;
    }
    if(!(ms > 0)) ms = parseFloat(durs[0]) * 1000;
    if(!(ms > 0)) ms = closing ? 240 : 320;
    return ms;
  }

  function openDrawer(){
    if(!api) return;
    clearTimeout(closeTimer); closing = false;
    S().historyMode = 'floating';
    clearSettled();
    clearPaneClip();
    document.body.removeAttribute('data-ph-closing');
    /* Opening into pinned must already be at pin width (see history.css
       [data-ph-want-pin]) so the spring slide does not also narrow mid-flight. */
    if(pinned) document.body.dataset.phWantPin = '1';
    else document.body.removeAttribute('data-ph-want-pin');
    /* The resting state must be painted BEFORE the open class, or the browser
       has no start value to transition from and the drawer simply appears.
       Details-panel idiom: display on -> force reflow -> double rAF -> is-open. */
    setMode('shut');
    sync(); /* publish --ph-pane before width calc so pin width is correct on frame 0 */
    api.renderOverlays();
    var el = document.querySelector('.history-flyout');
    if(el){
      el.classList.remove('pm-leaving');
      el.removeEventListener('transitionend', onOpenSettled);
      /* Hard-lock the enter width so a late cascade cannot morph it under the spring. */
      if(pinned) el.style.width = clampWidth(widthNow()) + 'px';
      else el.style.width = '';
      void el.offsetWidth;
    }
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        if(mode() !== 'shut') return;
        setMode(pinned ? 'pinned' : 'open');
        /* Keep want-pin through the open when pinned; clearing it here let width
           transition from open-w → pin-w mid-spring. Drop it after settle. */
        if(!pinned) document.body.removeAttribute('data-ph-want-pin');
        sync();
        if(el){
          if(reduced()){
            markSettled();
            el.style.width = '';
            document.body.removeAttribute('data-ph-want-pin');
          } else {
            el.addEventListener('transitionend', onOpenSettled);
          }
        }
      });
    });
    api.savePrefs();
  }

  function onOpenSettled(e){
    if(e.propertyName !== 'transform') return;
    var el = e.target;
    if(!el || !el.classList || !el.classList.contains('history-flyout')) return;
    el.removeEventListener('transitionend', onOpenSettled);
    if(!isOpen()) return;
    markSettled();
    el.style.width = '';
    document.body.removeAttribute('data-ph-want-pin');
  }

  /* `implicit` is true for Esc and scrim-click.  THIS is the guard the
     reference put in the wrong place: it belongs here, at the dismissal call
     sites, never inside the close itself. */
  function closeDrawer(implicit){
    if(!api || closing) return;
    if(implicit && pinned) return;
    var el = document.querySelector('.history-flyout');
    /* The toggle closes a pinned drawer, and unpins on the way out so the
       reserved gutter collapses with it rather than being left behind.
       Keep pin WIDTH locked for the exit (want-pin) — otherwise the drawer
       grows toward open-w while sliding out, which reads as jank. */
    var wasPinned = pinned;
    if(pinned){ pinned = false; store('0'); }
    if(wasPinned) document.body.dataset.phWantPin = '1';
    else document.body.removeAttribute('data-ph-want-pin');
    if(!el){ finishClose(); return; }
    closing = true;
    /* Exact Details close sequence (kimi.js closeDetailInspector):
         1. drop settled  → restore translate3d(0) while still open/pinned
         2. mark closing timing while still at rest
         3. reflow
         4. leave open/pinned so the off-screen transform transitions out
       Do NOT use .pm-leaving — motion.css attaches pm-overlay-out keyframes
       to that class and fights the transform transition. */
    clearSettled();
    el.removeEventListener('transitionend', onOpenSettled);
    if(wasPinned) el.style.width = clampWidth(widthNow()) + 'px';
    el.classList.remove('pm-leaving');
    document.body.dataset.phClosing = '1';
    /* Keep the slide inside the assistant pane — without this, translate
       -102% paints the drawer across the editor on the way out. */
    applyPaneClip();
    void el.offsetWidth;
    setMode('closing');
    var ms = readMotionMs(el, true);
    clearTimeout(closeTimer);
    /* pmPatch cannot drop the node early because state.historyMode is still
       'floating' for the whole exit — renderOverlays keeps emitting the flyout,
       so an intervening work tick patches it in place instead of removing it.
       The state flip is what removes it, and it happens only here. */
    closeTimer = setTimeout(finishClose, ms + 30);
  }

  function finishClose(){
    closing = false;
    clearSettled();
    clearPaneClip();
    document.body.removeAttribute('data-ph-want-pin');
    document.body.removeAttribute('data-ph-closing');
    setMode('closed');
    if(!api) return;
    S().historyMode = 'closed';
    api.renderOverlays();
    api.savePrefs();
  }

  function setPinned(v){
    pinned = !!v;
    store(pinned ? '1' : '0');
    if(!isOpen()) return;
    /* Mark pinning so width may transition; cleared after the pin duration. */
    document.body.dataset.phPinning = '1';
    setMode(pinned ? 'pinned' : 'open');
    sync();
    if(api) api.renderOverlays();   // repaint the chrome strip's label / icon
    clearTimeout(setPinned._t);
    setPinned._t = setTimeout(function(){
      document.body.removeAttribute('data-ph-pinning');
    }, reduced() ? 0 : 260);
  }

  EXT.action('toggle-history', function(){
    if(closing) return;
    if(isOpen()) closeDrawer(false);   // EXPLICIT: closes even when pinned
    else openDrawer();
  });
  EXT.action('close-history', function(){ closeDrawer(false); });
  EXT.action('pin-history',   function(){ setPinned(true); });
  EXT.action('unpin-history', function(){ setPinned(false); });
  EXT.action('ph-toggle-pin', function(){ setPinned(!pinned); });

  /* app.js's `show-archived` sets historyMode='pinned' directly (app.js:1587),
     which would spawn the grid column this module replaced.  Reimplemented
     rather than normalised-after-the-fact so it never flickers. */
  EXT.action('show-archived', function(ctx){
    ctx.state.historySearch = '';
    ctx.state.menu = null;
    if(!isOpen()) openDrawer(); else ctx.renderOverlays();
    requestAnimationFrame(function(){
      var hs = document.querySelector('.history-flyout [data-scroll-key="history"]');
      if(hs) hs.scrollTop = hs.scrollHeight;
    });
  });

  /* ---- implicit dismissal, guarded --------------------------------------- */

  /* Capture phase so this runs before app.js's own keydown listener, which
     would hard-close the drawer with no exit animation.  The first guard keeps
     app.js's Esc precedence intact: a menu, a dialog or the context drawer is
     closed by Esc BEFORE history is, so this only claims the key when history
     really is the thing Esc would hit. */
  document.addEventListener('keydown', function(e){
    if(e.key !== 'Escape' || !api) return;
    var st = S(); if(!st) return;
    if(st.menu || st.dialog || (st.context && st.context.details)) return;
    /* A pinned drawer explicitly ignores implicit dismissal in closeDrawer().
       Do not claim Escape in that state: Activity previews and transient
       Activity Detail must receive the key instead of needing a second press. */
    if(mode() !== 'open') return;
    e.stopImmediatePropagation();
    e.preventDefault();
    closeDrawer(true);
  }, true);

  /* Scrim click.  The scrim is `.assistant-pane::after`, so a click on it
     hit-tests as `.assistant-pane` itself — that identity test is the whole
     check, and it is exact: `.assistant-grid` covers the pane, so nothing else
     reaches the pane as a direct target.  Pinned drawers have no scrim at all
     (opacity 0, pointer-events none), so this cannot fire while pinned; the
     mode test is a second, explicit guard. */
  document.addEventListener('pointerdown', function(e){
    /* The resize handle is checked FIRST, and in the capture phase, so the
       stopPropagation() below also keeps app.js's own bubble-phase pointerdown
       (app.js:1882) out of it. */
    var h = e.target && e.target.closest && e.target.closest('[data-ph-resize]');
    if(h){
      if(mode() !== 'pinned') return;      /* the handle is display:none anyway */
      var el = document.querySelector('.history-flyout');
      /* Start from the PAINTED width, not from the stored number: if the 42%
         pane cap is currently binding, those two differ, and starting from the
         stored one would make the first pixel of the drag jump. */
      resizing = { x0:e.clientX, w0: el ? el.getBoundingClientRect().width : widthNow() };
      document.body.dataset.phResizing = '1';
      try{ h.setPointerCapture(e.pointerId); }catch(err){}
      e.stopPropagation();
      e.preventDefault();
      return;
    }
    if(mode() !== 'open') return;
    var pane = document.querySelector('.assistant-pane');
    if(!pane || e.target !== pane) return;
    e.stopPropagation();
    e.preventDefault();
    closeDrawer(true);
  }, true);

  /* ---- the drag ----------------------------------------------------------
     Nothing renders during the drag: the width and the gutter are both driven
     by one custom property on documentElement, which is outside #pmRoot and
     #pmOverlayRoot and therefore survives pmPatch. A renderOverlays() per
     pointermove would be 4ms of work sixty times a second to change one number
     that is not in the markup. */
  var resizing = null;
  document.addEventListener('pointermove', function(e){
    if(!resizing) return;
    setWidth(resizing.w0 + (e.clientX - resizing.x0));
  }, true);
  function endResize(){
    if(!resizing) return;
    resizing = null;
    delete document.body.dataset.phResizing;
    if(!api) return;
    settleWidth();
  }
  document.addEventListener('pointerup', endResize, true);
  document.addEventListener('pointercancel', endResize, true);

  /* One render at the END of an interaction, never during it: renderOverlays
     re-emits aria-valuenow from state. pmPatch matches the handle by data-k and
     patches it in place, so focus normally survives — the re-focus is
     belt-and-braces for the case where a sibling slot changes shape and the
     node really is rebuilt. */
  function settleWidth(){
    var had = document.activeElement && document.activeElement.hasAttribute
              && document.activeElement.hasAttribute('data-ph-resize');
    api.renderOverlays();
    if(!had) return;
    var h = document.querySelector('[data-ph-resize]');
    if(h && document.activeElement !== h) h.focus();
  }
  /* Keyboard: role="separator" with tabindex is the window-splitter pattern and
     it is only honest if the arrows actually move it. */
  document.addEventListener('keydown', function(e){
    var h = e.target && e.target.closest && e.target.closest('[data-ph-resize]');
    if(!h || mode() !== 'pinned') return;
    var cap = Math.min(W_MAX, paneWidth() * W_PANE);
    var step = e.shiftKey ? 40 : 12, cur = widthNow(), next = null;
    if(e.key === 'ArrowLeft')  next = cur - step;
    else if(e.key === 'ArrowRight') next = cur + step;
    else if(e.key === 'Home')  next = W_MIN;
    else if(e.key === 'End')   next = cap;
    if(next === null) return;
    e.preventDefault();
    e.stopPropagation();
    setWidth(next);
    if(api) settleWidth();
  }, true);

  window.addEventListener('resize', sync);

  /* ---- BETTER THAN THE REFERENCE: pinning a thread animates the move -------
     kimi-k3 rebuilds the list with `list.innerHTML = ''`, so a pinned thread
     teleports into the Pinned group.  Here the move is played back.

     The FLIP is keyed on `data-id` (CONTENT identity), not on node identity:
     `.thread-row` carries no data-k, so pmPatch matches rows POSITIONALLY and
     the DOM node showing a given thread changes when the groups re-sort.
     Measuring "where was thread X painted" -> "where is thread X painted now"
     is correct either way, and stays correct if a later wave adds data-k.
     Duration and easing are copied from flipMoves (app.js:1069-1081) so the
     concept keeps one vocabulary for "a keyed row moved". */
  function rowRects(){
    var out = Object.create(null);
    var rows = document.querySelectorAll('.thread-row[data-id]');
    for(var i=0;i<rows.length;i++){
      var r = rows[i].getBoundingClientRect();
      out[rows[i].getAttribute('data-id')] = {x:r.left, y:r.top};
    }
    return out;
  }
  function flipRows(before){
    if(reduced()) return;
    var rows = document.querySelectorAll('.thread-row[data-id]');
    for(var i=0;i<rows.length;i++){
      var el = rows[i];
      var b = before[el.getAttribute('data-id')];
      if(!b) continue;
      var r = el.getBoundingClientRect();
      var dx = b.x - r.left, dy = b.y - r.top;
      if(Math.abs(dx) < 1 && Math.abs(dy) < 1) continue;
      el.animate([{transform:'translate(' + dx + 'px,' + dy + 'px)'},{transform:'none'}],
        {duration:420, easing:'cubic-bezier(.22,.80,.28,1)'});
    }
  }

  /* Also fixes app.js:1506, which assigns state.menu=null AFTER mutateThread()
     has already re-rendered and then never renders again — so the thread menu
     stayed on screen until the next 2s work tick. */
  EXT.action('toggle-thread-pin', function(ctx, btn){
    var id = btn.dataset.id;
    var t = ctx.state.threads.filter(function(x){ return x.id === id; })[0];
    if(!t) return false;
    var before = rowRects();
    t.pinned = !t.pinned;
    ctx.state.menu = null;
    /* renderOverlays, not renderApp: the thread list and the thread menu are
       both in the overlay root, and a 25-49ms block here would push the FLIP a
       whole frame past the positions it just measured. */
    ctx.renderOverlays();
    flipRows(before);
  });

  /* ---- boot --------------------------------------------------------------
     Runs after app.js's IIFE has executed (it is the next <script>), so
     PM56_EXT.ctx is available.  Idempotent: DOMContentLoaded and the timeout
     race, and whichever wins wins. */
  function boot(){
    if(api || !EXT.ctx) return;
    api = EXT.ctx();
    var st = api.state;      // only used inside this function, before any reset
    var saved = store(null);
    /* First run has no stored pin, so it is inherited from the app's own
       default (`historyMode:'pinned'`, app.js:50) and written back at once —
       without that write the very next reload reads historyMode:'floating'
       (which boot itself just persisted) and comes back UNPINNED. */
    pinned = saved == null ? (st.historyMode === 'pinned') : saved === '1';
    if(st.historyMode === 'pinned'){
      /* app.js gated the pinned column on `!isNarrow()` (app.js:1043), so a
         narrow viewport showed NO history by default.  Inheriting 'pinned' here
         would silently change that to a drawer eating 42% of a phone screen.
         Only the DEFAULT is downgraded — a pin the user chose is still honoured
         at any width, and the 42% clamp keeps it usable. */
      st.historyMode = api.isNarrow() ? 'closed' : 'floating';
      if(api.isNarrow()) pinned = false;
      api.savePrefs();
    }
    store(pinned ? '1' : '0');
    setMode(st.historyMode === 'floating' ? (pinned ? 'pinned' : 'open') : 'closed');
    var savedW = storeW(null);
    if(savedW != null && isFinite(parseFloat(savedW))) setWidth(parseFloat(savedW));
    sync();
    api.renderApp();
    requestAnimationFrame(sync);
  }
  if(document.body) setMode('closed');   // history.css is inert until this exists
  document.addEventListener('DOMContentLoaded', boot);
  setTimeout(boot, 0);

})();
