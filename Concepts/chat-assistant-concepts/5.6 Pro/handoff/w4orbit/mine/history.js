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

  EXT.slot('threadRowStatus', function(ctx){
    if(ctx.variant !== TAKE_PREVIEW_ROWS) return '';
    var t = ctx.thread || {};
    var s = String(t.status || 'idle');
    var label = ctx.statusLabel(s);
    return '<span class="ph-status ph-s-' + ctx.esc(s) + '" data-status="' + ctx.esc(s) + '"'
         + ' data-k="tstat:' + ctx.esc(t.id || '') + '" role="img"'
         + ' aria-label="' + ctx.esc(label) + '" title="' + ctx.esc(label) + '">'
         + '<i class="ph-ring"></i><i class="ph-mark"></i></span>';
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
  }

  /* Any code path that is not this module can still set historyMode to
     'pinned' — app.js does it in `show-archived` (overridden below) and in the
     "Archived threads" demo trigger, which is not an interceptable action.
     Rather than chase each one, every render normalises: 'pinned' is folded
     back into floating + pinned-drawer, which is the same thing on screen. */
  function normalise(){
    var st = api && S();
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
      if(normalise()){ api.renderApp(); return; }
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
    return '<div class="ph-chrome" data-k="phchrome">'
         + '<span class="ph-chrome-state">' + (pinned ? 'Pinned left' : 'Floating over chat') + '</span>'
         + '<button class="ph-pin' + (pinned ? ' is-pinned' : '') + '" data-action="ph-toggle-pin"'
         + ' aria-pressed="' + (pinned ? 'true' : 'false') + '"'
         + ' title="' + (pinned ? 'Unpin — float the drawer over the chat again' : 'Pin left — reserve a gutter so the transcript stays usable') + '">'
         + ctx.icon(pinned ? 'unpin' : 'pin', 12)
         + '<span>' + (pinned ? 'Unpin' : 'Pin left') + '</span></button>'
         + '</div>';
  });

  /* ---- open / pin / close ------------------------------------------------ */

  /* Opening, pinning and closing all change ONLY the overlay root and two body
     attributes — nothing in #pmRoot reads historyMode except a
     `!== 'pinned'` ternary this module never satisfies.  So these paths use
     renderOverlays (measured: 4ms) rather than renderApp (measured: 25-49ms on
     the 24-thread / 374-message fixture).  On a click path that is about to
     start a 240ms transition, a 25-49ms block is a visible late start. */
  function openDrawer(){
    if(!api) return;
    clearTimeout(closeTimer); closing = false;
    S().historyMode = 'floating';
    /* The resting state must be painted BEFORE the open class, or the browser
       has no start value to transition from and the drawer simply appears.
       This is the reference's `display:''` -> rAF -> add class idiom, with the
       render standing in for the display flip; the forced reflow is belt and
       braces for the case where the rAF is coalesced with the style flush. */
    setMode('shut');
    api.renderOverlays();
    var el = document.querySelector('.history-flyout');
    if(el) void el.offsetWidth;
    requestAnimationFrame(function(){
      if(mode() !== 'shut') return;
      setMode(pinned ? 'pinned' : 'open');
      sync();
    });
    api.savePrefs();
  }

  /* `implicit` is true for Esc and scrim-click.  THIS is the guard the
     reference put in the wrong place: it belongs here, at the dismissal call
     sites, never inside the close itself. */
  function closeDrawer(implicit){
    if(!api || closing) return;
    if(implicit && pinned) return;
    var el = document.querySelector('.history-flyout');
    /* The toggle closes a pinned drawer, and unpins on the way out so the
       reserved gutter collapses with it rather than being left behind. */
    if(pinned){ pinned = false; store('0'); }
    if(!el){ finishClose(); return; }
    closing = true;
    setMode('closing');
    /* Wave 1B's exit contract: mark the node, then read the wait back off the
       computed style rather than hard-coding it — under prefers-reduced-motion
       history.css collapses this to 1ms and a hard-coded 240 would stall the
       close.  The class is applied for the contract's sake; the animation is
       actually selected by `body[data-ph-drawer="closing"]`, because pmPatch
       would strip the class from the node on the next work tick. */
    el.classList.add('pm-leaving');
    var ms = parseFloat(window.getComputedStyle(el).animationDuration) * 1000;
    if(!(ms > 0)) ms = 0;
    clearTimeout(closeTimer);
    /* pmPatch cannot drop the node early because state.historyMode is still
       'floating' for the whole exit — renderOverlays keeps emitting the flyout,
       so an intervening work tick patches it in place instead of removing it.
       The state flip is what removes it, and it happens only here. */
    closeTimer = setTimeout(finishClose, ms + 30);
  }

  function finishClose(){
    closing = false;
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
    setMode(pinned ? 'pinned' : 'open');
    sync();
    if(api) api.renderOverlays();   // repaint the chrome strip's label / icon
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
    if(!isOpen()) return;
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
    if(mode() !== 'open') return;
    var pane = document.querySelector('.assistant-pane');
    if(!pane || e.target !== pane) return;
    e.stopPropagation();
    e.preventDefault();
    closeDrawer(true);
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
    sync();
    api.renderApp();
    requestAnimationFrame(sync);
  }
  if(document.body) setMode('closed');   // history.css is inert until this exists
  document.addEventListener('DOMContentLoaded', boot);
  setTimeout(boot, 0);

})();
