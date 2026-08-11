/* PANEL BAKEOFF — x-docker.js : three one-off Docker Manager explorations
   =====================================================================
   Docker Manager is the hardest panel in the app — 78 wired commands, 11
   canonical subviews (CRAU-007), 24 containers, 16 images, 10 compose
   services, 4 registries, a 5-node publish chain, and identity strings that
   run to 51 characters against a 224px band. The six full systems each had
   to solve seven panels with one thesis. These three are free of that
   obligation and exist only to attack the 240px Docker problem from three
   directions that no full system took.

   Each variant registers a version that populates ONLY the docker panel.
   Every other panel deliberately falls back to the harness placeholder.

   WHAT IS SHARED, AND WHY
   -----------------------
   All three draw from ONE model builder (modelFor) so they differ in
   presentation, never in content. All three use the same status vocabulary,
   the same PMK elision policy, the same reason-code discipline. If two of
   them disagreed about what a container IS, the comparison would be noise.

   COPY POLICY (deliberate, and stricter than the six)
   ---------------------------------------------------
   No version-local prose is attached to a fixture row. Where a fixture entry
   ships a "sentence" (registries, the k8s subview) it renders verbatim. Where
   it does not, the row shows its own "detail" verbatim and nothing else. Row
   commands that are unavailable render the unmet PRECONDITION TOKEN from
   UI_Command_Catalog (container_stopped, image_selected, k8s_kubeconfig_
   missing) as the reason code rather than an invented sentence — except the
   two strings the spec fixes verbatim, "No direct access URL detected"
   (Containers_Registry_and_Unraid.md:427) and the "unknown" fallback for an
   unresolved effective state (:226). Empty states and control labels are UI
   chrome and are written here; nothing else is.

   DEFENSIVE READS
   ---------------
   "why()" reads a reason from "row.blocked" OR the flat "reason"/"sentence"
   pair OR neither, and never throws — five of six existing versions crashed
   when a row whose status was "blocked" arrived without a "blocked" object.
   Nothing indexes a fixture array by fixed position; every lookup is a
   predicate scan, so adding a container cannot silently repoint a summary
   line at the wrong row.

   MOTION
   ------
   One primitive each, all three from the shared layer (_pm-motion.css / PMM),
   because the bakeoff is meant to compare designs and not whose animation
   happened to feel nicer. There is no @keyframes, no easing and no duration
   in this file.

     xD1   PMM.expand   a severity group opening IS an accordion
     xD2   PMM.push     the column pager steps the attribute window, and a
                        step is a direction, not a redraw
     xD3   PMM.enter    the result list re-enters as the query changes

   See the "motion" block above the wiring section for the two rules that are
   not obvious: nothing .pmm-* is written into the markup, and a keystroke
   re-filter enters at --motion-fast with no stagger.

   THE CONFIRMATION GATE (blind spot 20)
   -------------------------------------
   Every destructive and every egress command in this file used to be a
   one-click menu item with a red flag and nothing behind it. `PM.confirm`
   (_pm-components.js:498) has been sitting there the whole time -- a modal
   sheet with a scrim, role="dialog", aria-modal, focus capture and no
   auto-close, documented at :9 as "replaces confirm()". Zero versions called
   it. GitHub_Integration.md:L156 requires scope, consequence and confirmation
   before a `strong` action executes. This routes them through it.

   WHAT IS GATED IS NOT A JUDGEMENT CALL. The `CMDS` table below already
   carries the catalogue's own gate class on every one of the 78 ids -- D
   destructive, HG hard gate, A audited privileged session -- so the gate is
   `classOf(id)` and nothing else. That has three consequences worth stating:
   a command cannot be forgotten (there is no per-call-site list to keep in
   sync), a command cannot be gated twice, and adding a command to CMDS with a
   class gates it everywhere it appears at once. The eleven cmd.docker.host.*
   ids carry no class in the catalogue and are therefore NOT gated; that is
   the catalogue's answer, not this file's, and it is reported rather than
   overridden.

   THE COMMAND ID STAYS IN THE MARKUP. The obvious implementation is to swap
   the menu item's value for a gate token and keep the real id in a side
   table. It works, and it makes `data-value="cmd.docker.image.push"`
   disappear from the emitted DOM -- which is exactly the string the audits
   grep for. So the value is untouched and the gate keys off the id at the
   moment the menu ACTS: `pm:menuaction` carries the id, the row carries the
   subject in data-pm-key (PMK.row emits it) or data-xd-subj (this file's
   hand-rolled rows), and the sheet is built from the two.

   ONE GAP, REPORTED NOT PATCHED. `PM.ctx` -- the right-click menu -- RESOLVES
   a promise instead of dispatching `pm:menuaction`, and `PM.mountAll` drops
   the promise on the floor (_pm-components.js:781), so a context-menu copy of
   a gated action reaches nothing at all today: not the gate, and not an
   execution either. There is no bypass, only an inert path. Making ctx
   dispatch the same event is a four-line shared-file change that every
   version needs, and this file must not make it on the other fourteen's
   behalf.

   WHAT ELSE PASS 3 ADDED, AND WHERE IT LANDS BY DEFAULT
   -----------------------------------------------------
   A surface that only appears after you navigate somewhere is a surface the
   fit sweep never measures, so each of these has a home in the DEFAULT state
   of at least one variant as well as its full home:

     compose scenarios   The regression against v0 (AUDIT-SUMMARY section 4).
                         `compose.scenarios` ships four rows, two stale, with
                         `drift`, `driftSummary` and a `repair` action. They
                         enter the model as a SECOND GROUP of the compose
                         subview, so xD1's cross-surface feed picks the two
                         unhealthy ones up by default at every width, xD2
                         gets the drift strip and the Repair button under the
                         row at every bucket, and xD3 lists them as their own
                         result group.
     registry identity   `docker.auth`, the six exact CRAU:L927 labels
                         verbatim from `auth.labels`, plus the capability
                         enum with images:push ABSENT and the two `gated`
                         controls rendered visible-but-disabled citing the
                         capability they need (CRAU:L323). Default homes: a
                         triage row in xD1, a context line in xD2, a zero
                         state group in xD3.
     host context        `runtime.hostId` joins `hosts[]`, so kind, readable,
                         writable and terminalCapable describe the host you
                         are actually on -- rendered on one clipped line in
                         all three variants at every width, and in the header
                         kebab where the line is too narrow to carry it.
   ===================================================================== */
(function (global) {
  'use strict';

  var PMK = global.PMK;
  var esc = PMK.esc;
  var ic = PMK.icon;
  var ell = PMK.elide;
  var MID = ' · ';

  /* ================================================================== CSS
     Injected once for all three variants. Tokens only: no hard-coded radius,
     no colour math beyond the :root-declared --accent-soft, no
     backdrop-filter, and never --display-font below 12px (retro renders
     Orbitron there and it is unreadable). */
  (function injectCss() {
    if (document.querySelector('style[data-xd-css]')) return;
    var s = document.createElement('style');
    s.setAttribute('data-xd-css', '');
    s.textContent = [
      /* ---------------------------------------------------- shared frame */
      '.xD1-strip,.xD2-strip,.xD3-strip{display:flex;flex-direction:column;',
      'gap:var(--sm);flex:none;min-width:0;padding:var(--sm) var(--md);',
      'border-bottom:1px solid var(--border-light,var(--border))}',
      '.xD1-strip--row,.xD2-strip--row,.xD3-strip--row{flex-direction:row;align-items:center}',
      '.xD1-foot,.xD2-foot,.xD3-foot{display:flex;align-items:center;gap:var(--sm);',
      'flex:none;min-width:0;padding:var(--sm) var(--md);',
      'border-top:1px solid var(--border-light,var(--border))}',
      '.xD1-foot .pmk-btn,.xD3-foot .pmk-btn{flex:1 1 auto;min-width:0}',
      '.xD1-note,.xD2-note,.xD3-note{flex:1 1 auto;min-width:0;overflow:hidden;',
      'text-overflow:ellipsis;white-space:nowrap;font-size:var(--fs-2xs);color:var(--text-muted)}',
      '.xD1-mono,.xD2-mono,.xD3-mono{font-family:var(--mono-font)}',
      /* A row's second line is a BLOCK inside the kit's clipped stack, and the
         only element inside it is the short reason code. An inline span sized
         to a 46-character image ref keeps its own box even when an ancestor
         clips, and that box is what R2 measures — 3px of overflow in retro
         (2px borders, condensed body face) was exactly this. */
      '.xD1-sub,.xD3-sub{display:block;min-width:0;overflow:hidden;',
      'text-overflow:ellipsis;white-space:nowrap}',
      /* The ONE motion rule this file owns, and it paints nothing: it steps
         two knobs the shared layer already exposes, for the keystroke case
         only. A re-filter that runs on every character must not leave the
         list translucent while you are still typing, so the enter drops to
         --motion-fast (still the theme's own token, still per-family) and the
         stagger goes to zero so every row arrives together — which is what
         basic already does at every width. Reducing a knob is always safe;
         raising one would not be. */
      '.xD-fast{--pmm-dur-in:var(--motion-fast);--pmm-step:0ms}',
      /* The host-context and identity lines. One clipped line, text placed
         DIRECTLY in the block and never inside an inline span: an inline span
         sized to a 51-character host line keeps its own box when its ancestor
         clips, and that box is what R2 measures. Same rule as .xD1-sub. */
      '.xD-ctx{flex:none;min-width:0;padding:0 var(--md) var(--sm);overflow:hidden;',
      'text-overflow:ellipsis;white-space:nowrap;font-size:var(--fs-2xs);',
      'color:var(--text-muted)}',
      '.xD-ctx--top{padding-top:var(--sm)}',
      /* The CRAU:L323 line under the identity card. It WRAPS -- a capability
         sentence is 60 characters and the panel is 224px at its floor, so
         clipping it would be disclosure in name only. overflow-wrap:anywhere
         because "repositories:read_private" has no space to break at. */
      '.xD-gated,.xD-cap{display:block;min-width:0;padding:var(--xs) var(--md) 0;',
      'font-size:var(--fs-2xs);color:var(--text-secondary);',
      'line-height:var(--lh-body);overflow-wrap:anywhere}',
      /* A group band inside a body that holds two kinds of row: compose
         scenarios above compose services. Not a section button -- these do
         not collapse, because the scenario list is four rows and an accordion
         over four rows is chrome charging rent. */

      /* ------------------------------------------------------------ xD1 */
      '.xD1-vitals{display:flex;flex-wrap:wrap;gap:var(--sm);flex:none;',
      'min-width:0;padding:var(--sm) var(--md)}',
      '.xD1-vital{display:inline-flex;align-items:center;gap:var(--sm);',
      'min-height:24px;padding:0 var(--md);cursor:pointer;white-space:nowrap;',
      'border:var(--border-width,1px) solid var(--border-light,var(--border));',
      'border-radius:var(--radius-pill);background:var(--surface);',
      'color:var(--text-secondary);font-family:var(--body-font);',
      'font-size:var(--fs-2xs);font-weight:600}',
      '.xD1-vital:hover{color:var(--text-primary);border-color:var(--accent-primary)}',
      '.xD1-vital:focus-visible{outline:2px solid var(--accent-primary);outline-offset:1px}',
      '.xD1-vital[aria-pressed="true"]{background:var(--accent-soft);',
      'border-color:var(--accent-primary);color:var(--text-primary)}',
      '.xD1-vital-g{flex:0 0 12px;width:12px;height:12px}',
      '.xD1-band,.xD-band{display:flex;align-items:center;gap:var(--sm);min-height:22px;',
      'min-width:0;padding:var(--md) var(--md) var(--xs);color:var(--text-muted);',
      'font-family:var(--display-font-sm,var(--body-font));font-size:var(--fs-2xs);',
      'font-weight:700;letter-spacing:.08em;text-transform:uppercase}',
      '.xD1-band-n,.xD-band-n{flex:none;font-weight:500;letter-spacing:0}',
      '.xD1-why{padding:0 var(--md) var(--sm) 29px}',

      /* ------------------------------------------------------------ xD2 */
      '.xD2-step{display:inline-flex;align-items:center;justify-content:center;',
      'flex:0 0 24px;width:24px;min-height:24px;padding:0;cursor:pointer;',
      'border:var(--border-width,1px) solid var(--border-light,var(--border));',
      'border-radius:var(--radius-sm);background:var(--surface-elevated);',
      'color:var(--text-secondary)}',
      '.xD2-step:hover{border-color:var(--accent-primary);color:var(--text-primary)}',
      '.xD2-step:focus-visible{outline:2px solid var(--accent-primary);outline-offset:1px}',
      '.xD2-step[aria-disabled="true"]{opacity:.5;cursor:not-allowed}',
      '.xD2-thead{display:flex;align-items:center;gap:var(--sm);min-height:20px;',
      'min-width:0;padding:3px var(--md) 3px 0;position:sticky;top:0;z-index:2;',
      'background:var(--surface);color:var(--text-muted);',
      'font-family:var(--display-font-sm,var(--body-font));font-size:var(--fs-2xs);',
      'font-weight:700;letter-spacing:.06em;text-transform:uppercase}',
      '.xD2-thead>*{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.xD2-gut{flex:0 0 21px;width:21px}',
      '.xD2-row{display:flex;align-items:center;gap:var(--sm);min-height:26px;',
      'min-width:0;padding:0 var(--md) 0 0;position:relative;cursor:pointer;',
      'border-radius:var(--radius-xs);color:var(--text-primary);font-size:var(--fs-xs)}',
      '.xD2-row:hover{background:var(--accent-soft)}',
      '.xD2-row:focus-visible{outline:2px solid var(--accent-primary);outline-offset:-2px}',
      '.xD2-row--2{min-height:40px;align-items:stretch;padding-block:3px}',
      '.xD2-row .pmk-of{opacity:0}',
      '.xD2-row:hover .pmk-of,.xD2-row:focus-within .pmk-of{opacity:1}',
      '.xD2-id{flex:1 1 auto;min-width:96px;overflow:hidden;',
      'text-overflow:ellipsis;white-space:nowrap}',
      '.xD2-stack{flex:1 1 auto;min-width:96px;display:flex;flex-direction:column;',
      'justify-content:center;gap:1px}',
      '.xD2-stack>*{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.xD2-sub{font-size:var(--fs-2xs);color:var(--text-muted)}',
      '.xD2-sub b{font-weight:700;color:var(--text-secondary)}',
      '.xD2-cell{flex:0 0 auto;overflow:hidden;text-overflow:ellipsis;',
      'white-space:nowrap;color:var(--text-secondary);font-size:var(--fs-2xs);',
      'text-align:right}',
      '.xD2-ck{display:inline-flex;align-items:center;justify-content:center;',
      'flex:0 0 24px;width:24px;min-height:24px;padding:0;cursor:pointer;',
      'border:var(--border-width,1px) solid var(--border-light,var(--border));',
      'border-radius:var(--radius-xs);background:var(--surface);color:var(--surface)}',
      '.xD2-ck[aria-pressed="true"]{border-color:var(--accent-primary);',
      'color:var(--accent-primary)}',
      '.xD2-ck:focus-visible{outline:2px solid var(--accent-primary);outline-offset:1px}',
      '.xD2-batch{display:flex;align-items:center;gap:var(--sm);flex:none;',
      'min-width:0;padding:var(--sm) var(--md);',
      'border-top:1px solid var(--border-light,var(--border));background:var(--surface-elevated)}',

      /* ------------------------------------------------------------ xD3 */
      '.xD3-glyph{flex:0 0 14px;width:14px;height:14px;color:var(--text-muted)}',
      '.xD3-gut{flex:0 0 21px;width:21px}',
      '.xD3-scope{display:inline-flex;align-items:center;gap:var(--sm);flex:none;',
      'max-width:44%;min-height:24px;padding:0 var(--sm) 0 var(--md);',
      'border:var(--border-width,1px) solid var(--accent-primary);',
      'border-radius:var(--radius-pill);background:var(--accent-soft);',
      'color:var(--text-primary);font-size:var(--fs-2xs);font-weight:600;min-width:0}',
      '.xD3-scope-l{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}',
      '.xD3-x{display:inline-flex;align-items:center;justify-content:center;',
      'flex:0 0 24px;width:24px;min-height:24px;padding:0;border:0;cursor:pointer;',
      'background:transparent;color:var(--text-secondary)}',
      '.xD3-x:focus-visible{outline:2px solid var(--accent-primary);outline-offset:1px}',
      '.xD3-hint{flex:none;min-width:0;padding:0 var(--md) var(--sm);overflow:hidden;',
      'text-overflow:ellipsis;white-space:nowrap;font-size:var(--fs-2xs);',
      'color:var(--text-muted)}',
      '.xD3-item{display:flex;align-items:center;gap:var(--sm);width:100%;',
      'min-height:26px;min-width:0;padding:0 var(--md);border:0;cursor:pointer;',
      'background:transparent;color:var(--text-primary);font-family:var(--body-font);',
      'font-size:var(--fs-xs);text-align:left}',
      '.xD3-item:hover{background:var(--accent-soft)}',
      '.xD3-item:focus-visible{outline:2px solid var(--accent-primary);outline-offset:-2px}',
      '.xD3-item[aria-disabled="true"]{cursor:not-allowed}',
      '.xD3-item--2{min-height:40px;align-items:stretch;padding-block:3px}',
      '.xD3-lab{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;',
      'justify-content:center;gap:1px}',
      '.xD3-lab>*{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.xD3-id{font-family:var(--mono-font);font-size:var(--fs-2xs);color:var(--text-muted)}',
      '.xD3-n{flex:none;color:var(--text-muted);font-size:var(--fs-2xs)}',
      '.xD3-gate{flex:none;padding:0 var(--sm);border-radius:var(--radius-xs);',
      'font-family:var(--mono-font);font-size:var(--fs-2xs);font-weight:700;',
      'color:var(--text-secondary);',
      'border:1px solid var(--border-light,var(--border))}',
      '.xD3-why{display:block;min-width:0;padding:0 var(--md) var(--sm) 29px;',
      'font-size:var(--fs-2xs);color:var(--text-secondary);line-height:var(--lh-body)}',
      '.xD3-why span{font-family:var(--mono-font)}',
      '.xD3-more{display:flex;align-items:center;gap:var(--sm);width:100%;',
      'min-height:24px;min-width:0;padding:0 var(--md);border:0;cursor:pointer;',
      'background:transparent;color:var(--text-secondary);',
      'font-family:var(--body-font);font-size:var(--fs-2xs);font-weight:600;text-align:left}',
      '.xD3-more:hover{background:var(--accent-soft);color:var(--text-primary)}',
      '.xD3-more:focus-visible{outline:2px solid var(--accent-primary);outline-offset:-2px}'
    ].join('');
    document.head.appendChild(s);
  })();

  /* ============================================================== helpers */
  function arr(a) { return Object.prototype.toString.call(a) === '[object Array]' ? a : []; }
  function firstBy(a, fn) {
    a = arr(a);
    for (var i = 0; i < a.length; i++) if (fn(a[i], i)) return a[i];
    return null;
  }
  function word(t) { return (PMK.statusOf(t) || {}).word || 'unknown'; }
  function chPx(th) { return /^basic/.test(th || '') ? 6.6 : /^retro/.test(th || '') ? 5.4 : 6.2; }
  function capFor(px, th) { return Math.max(4, Math.floor(px / chPx(th))); }

  /* Second-line and metadata caps use a FLAT 6.6px/char, not chPx. chPx is
     tuned to each theme's ~11px body face; a second line is 10px and often
     monospace, and retro's condensed 5.4 badly under-counts SF Mono there.
     One conservative constant is worth more than four wrong ones. */
  var CH_SAFE = 6.6;
  function capSafe(px) { return Math.max(8, Math.floor(px / CH_SAFE) - 2); }
  function subCap(w) { return capSafe(w - 16 - 21 - 24 - 12); }

  /* PMK.metaRun budgets by width but its floor is Math.max(1, fit): one
     segment always survives, at whatever length it happens to be. A 51-char
     image ref in a 193px box is therefore an R1 on .pmk-meta, which is
     overflow:hidden. Pre-elide every segment to what the slot can hold so the
     guaranteed segment is guaranteed to FIT. */
  var META_KIND = { ctr: 'image', img: '', svc: '', reg: '', stg: '', sub: '', hst: '' };
  function metaFor(r, b, w, hasChip) {
    var avail = w - 16 - 8 - 21 - 24;
    if (b >= 1) avail -= 44;
    if (hasChip && b >= 2) avail -= 78;
    var cap = Math.max(6, capSafe(avail - 96));
    var kind = META_KIND[r.group] || '';
    return arr(r.meta).filter(Boolean).map(function (sg, i) {
      var s = String(sg);
      return s.length > cap ? ell(s, i === 0 ? kind : '', cap) : s;
    });
  }

  /* Severity ladder. Anything the fixture invents later lands mid-table
     rather than throwing or silently reading as healthy. */
  var SEV = {
    failed: 0, prohibited: 1, blocked: 1, attention: 2, stale: 3,
    disabled: 4, queued: 5, running: 6, ok: 7
  };
  function sev(t) { var v = SEV[t]; return v == null ? 3 : v; }
  function isProblem(t) { return sev(t) <= 3; }

  /* THE DEFENSIVE READ. A row may carry a "blocked" object, a flat
     reason/sentence pair, or nothing at all while still reporting a blocked
     status. All three shapes resolve; none throws. An unresolved effective
     state renders the literal "unknown" per :226, never an assumed failure. */
  function why(o) {
    if (!o) return null;
    var b = (o.blocked && typeof o.blocked === 'object') ? o.blocked : null;
    /* degradedReason is the THIRD place a code can live: a subview that is
       available and partly unreachable carries its code there and its
       sentence flat. Reading only `reason` made this function answer the
       literal "unknown" for a row that shipped a real CRAU:L449 code, and
       that token was already being stamped onto the picker option as
       data-reason. :226 permits "unknown" for an unresolved effective state;
       it does not permit it as a substitute for a code the row carries. */
    var code = (b && (b.code || b.reason)) || o.reason || o.degradedReason || '';
    var say = (b && b.sentence) || o.sentence || '';
    if (!code && !say) return null;
    return { code: code || 'unknown', sentence: say };
  }

  function runtimeOf(d) {
    var rt = (d && d.runtime) || {};
    return {
      engine: rt.engine || 'unknown',
      context: rt.context || 'unknown',
      state: rt.state || 'unknown',
      detected: rt.detected === true ? 'detected'
        : rt.detected === false ? 'not_detected' : 'unknown'
    };
  }

  function subviewsOf(d) {
    var s = arr(d && d.subviews);
    return s.length ? s : [{ id: 'containers', label: 'Containers', count: '', available: true }];
  }
  function subById(d, id) {
    return firstBy(subviewsOf(d), function (s) { return s.id === id; });
  }
  function k8sWhy(d) {
    var s = subById(d, 'k8s');
    return why(s) || { code: 'unknown', sentence: '' };
  }

  /* ------------------------------------------------------- registry identity
     BLIND SPOT 3 / M20. `docker.auth` ships the six CRAU:L927 labels as DATA
     (`auth.labels`), which is the fixture saying, unusually loudly, that the
     labels are not the renderer's to choose. So they are read, never spelled
     here, and the fallback strings exist only so a fixture that drops the
     labels object degrades to the spec's own wording instead of to nothing.

     `state` is a four-value enum and `degradedReason` is where the code
     lives, which is the same three-place read `why()` already performs -- so
     the identity reuses it rather than growing a second reason vocabulary. */
  function authOf(d) {
    var a = (d && d.auth) || {};
    var L = a.labels || {};
    return {
      L: {
        requested: L.requested || 'Requested',
        effective: L.effective || 'Effective',
        reason: L.reason || 'Reason',
        support: L.support || 'Support',
        inheritedFrom: L.inheritedFrom || 'Inherited from',
        overriddenBy: L.overriddenBy || 'Overridden by'
      },
      requested: a.requested || '', effective: a.effective || '',
      reason: a.reason || '', support: a.support || '',
      inherited: a.inheritedFrom || '', overridden: a.overriddenBy || '',
      state: a.state || 'unknown',
      code: a.degradedReason || '',
      caps: arr(a.capabilities), gated: arr(a.gated),
      allowed: arr(a.allowedActionIds),
      healthy: a.state === 'authenticated',
      diverged: !!(a.requested && a.effective && a.requested !== a.effective)
    };
  }

  /* An identity state is not a run state, so it is mapped to the status
     vocabulary rather than passed to it: `expired` is a failure, `degraded`
     and `unauthenticated` are attention, and anything the enum grows later
     lands on attention rather than silently reading as healthy. */
  function authStatus(A) {
    return A.state === 'expired' ? 'failed' : A.healthy ? 'ok' : 'attention';
  }

  /* CRAU:L323: a control the identity cannot use stays VISIBLE and disabled,
     citing the capability. `auth.gated` names the control and the capability
     but not the command, and the two commands are unambiguous, so the join
     lives here in one place where it can be read and challenged. A capability
     the fixture adds later with no mapping renders the control disabled with
     no value, which is the honest outcome -- it is unclickable anyway. */
  var CAP_CMD = {
    'images:push': 'cmd.docker.image.push',
    'repositories:create': 'cmd.docker.create_repository'
  };
  function gatedItems(A) {
    return A.gated.map(function (g) {
      return {
        value: CAP_CMD[g.capability] || '', label: g.control,
        disabled: true, reason: g.capability, sentence: g.sentence
      };
    });
  }
  function authItems(A) {
    return A.allowed.map(function (id) {
      return { value: id, label: PMK.actionLabel(id) };
    }).concat(A.gated.length ? [{ type: 'sep' }] : []).concat(gatedItems(A));
  }

  /* -------------------------------------------------------- host context
     BLIND SPOT 10 / M29. `runtime.hostId` and `hosts[].id` are the same key,
     and joining them is the difference between "Docker, context default" --
     which says nothing about whether you can write -- and the three axes
     CRAU:L2097-L2157 makes independent. The join is a scan, not an index, so
     a reordered fixture cannot repoint it. */
  function hostCtx(d) {
    var rt = (d && d.runtime) || {};
    var h = firstBy(arr(d && d.hosts), function (x) { return x.id === rt.hostId; }) || {};
    var known = h.kind != null;
    return {
      name: h.name || rt.host || 'unknown',
      kind: h.kind || '',
      /* With no host row the runtime's own writable flag is all there is, and
         it answers one axis of three. Saying "read-only" from it would be
         asserting the other two; the axis is simply absent instead. */
      access: known ? accessOf(h) : (rt.writable === true ? 'read+write' : ''),
      term: known ? termOf(h) : '',
      observed: rt.observedAt || '',
      stale: rt.stale === true,
      code: h.reason || '', sentence: h.sentence || ''
    };
  }

  /* The one-line form. The AXES are fixed-length and are the content; the
     NAME is variable and is the label, so the axes are budgeted first and the
     name takes whatever is left -- the same allocation axisLine() makes for a
     host ROW, for the same reason. At 240px nothing is left (the name alone
     is 22 characters of a 31-character band) and the name is simply absent
     rather than rendered as "loc...", because it is in the kebab head at
     every width and a stub of it here would only spend the band on nothing.
     Terminal joins at 380px and the observation age at 480px. */
  function hostLine(d, b, cap) {
    var c = hostCtx(d);
    var axes = [c.kind, c.access];
    if (b >= 2) axes.push(c.term);
    if (b >= 3 && c.observed) axes.push('observed ' + c.observed);
    if (c.stale) axes.push('stale');
    var tail = axes.filter(Boolean).join(MID);
    if (b === 0 || !c.name) return tail;
    var room = cap - tail.length - MID.length;
    if (room < 10) return tail;
    return ell(c.name, '', room) + MID + tail;
  }
  /* MEASURED, not guessed, and measured for THIS line rather than borrowed
     from another one. CH_SAFE (6.6) is calibrated for an --fs-xs second line
     that is often monospace; the context strip is --fs-2xs body text, and
     rendering the same 53-character string into it across all eight themes
     gives 4.18 px/char in retro, 4.35 friendly, 4.74 glass and 4.90 in basic
     -- the widest. 5.2 is basic plus 6% headroom. Reusing 6.6 here cost the
     host NAME an ellipsis at 380px in every theme while 300px of the band sat
     empty, which is a conservative estimator deleting real content. */
  var CH_CTX = 5.2;
  function ctxCap(w) { return Math.max(8, Math.floor((w - 32) / CH_CTX)); }

  function hostCtxLine(d, b, w, top) {
    var cap = ctxCap(w);
    var t = hostLine(d, b, cap);
    if (!t) return '';
    return '<div class="xD-ctx' + (top ? ' xD-ctx--top' : '') + '">' +
      esc(ell(t, '', cap)) + '</div>';
  }

  /* The header kebab. Identical in all three so the runtime identity strip
     (P0 #1: engine, effective context, detection tri-state) is disclosed the
     same way everywhere it does not fit inline. */
  function globalItems(d) {
    var rt = runtimeOf(d);
    var kw = k8sWhy(d);
    var hc = hostCtx(d);
    var hs = subById(d, 'hosts');
    var hw = why(hs);
    return [
      { type: 'head', label: rt.engine + MID + rt.context + MID + rt.detected },
      /* The second head line is BLIND SPOT 10's floor: at 240px the context
         line above the body carries only two axes, and the kebab is the one
         control present at every width in all three variants, so the host you
         are actually on names all four of them here whatever the band. */
      { type: 'head', label: [hc.name, hc.kind, hc.access, hc.term].filter(Boolean).join(MID) },
      { value: 'cmd.docker.host.refresh', label: 'Refresh' },
      { value: 'cmd.docker.context.select', label: 'Switch context' },
      { value: 'cmd.docker.cleanup.scan', label: 'Cleanup advisor' },
      { value: 'cmd.docker.drift.compare', label: 'Compare drift' },
      { type: 'sep' },
      /* The destination is navigable and four of its five rows are not
         healthy, which is CRAU-007's third state. The hint slot renders for
         an ENABLED item; the reason line does not (_pm-components.js:86), so
         a degraded destination discloses its code here or nowhere. */
      {
        value: 'cmd.docker.hosts.open', label: 'Docker / Hosts',
        hint: (hs && hs.degraded === true && hw) ? hw.code : ''
      },
      { value: 'cmd.docker.open_dockerfile', label: 'Open Dockerfile' },
      {
        value: 'cmd.docker.k8s.select_context', label: 'Kubernetes',
        disabled: true, reason: kw.code, sentence: kw.sentence
      },
      { type: 'sep' },
      { value: 'cmd.docker.cleanup.prune', label: 'Prune unused', danger: true }
    ];
  }

  function headOf(d, b) {
    var rt = runtimeOf(d);
    return PMK.head(
      b === 0 ? 'Docker' : 'Docker Manager',
      rt.engine + '/' + rt.context,
      PMK.overflow(globalItems(d), 'Docker Manager actions')
    );
  }

  /* ============================================================== the gate
     BLIND SPOT 20. `PM.confirm` is a wired, tested modal sheet and no version
     called it. These four functions are the whole of this file's answer.

     classOf is the ONLY policy. It reads the catalogue gate class off the
     CMDS table (declared under xD3, hoisted, populated before any render), so
     there is no second list of "things that feel dangerous" to drift out of
     sync with the first. */
  var GATE_CLASS = null;
  function classOf(id) {
    if (!GATE_CLASS) {
      GATE_CLASS = {};
      CMDS.forEach(function (c) { if (c[2]) GATE_CLASS[c[0]] = c[2]; });
    }
    return GATE_CLASS[String(id == null ? '' : id)] || '';
  }

  /* The CONSEQUENCE half of GitHub_Integration.md:L156, one sentence per gate
     class. These are the legend of this file's own CMDS table spelled out --
     "D destructive / HG hard gate / A audited privileged session" -- and not
     a claim about any fixture row, which is why they are written here and the
     row's own text never is. */
  var GATE_SAY = {
    D: 'Destructive: the target is removed and this cannot be undone.',
    HG: 'Hard gate: this writes to a remote registry, outside this machine.',
    A: 'Audited: this opens a privileged session on the target.'
  };

  /** The sheet. Scope names WHAT and WHERE, consequence names the class, and
   *  the command id is printed so the reader can check the claim against the
   *  catalogue. Returns true when it took the click.
   *
   *  DEFERRED BY ONE TASK on purpose. pm-menu closes itself after dispatching
   *  and refocuses its trigger (_pm-components.js:270); running the sheet in
   *  the same tick means that refocus lands AFTER PM.confirm has focused its
   *  own button, which pulls focus straight back out of the dialog and
   *  defeats the capture the sheet exists to provide.
   *
   *  The dismiss label is 'Cancel' and stays checkable: no gated command in
   *  this panel is itself named Cancel (cmd.docker.create_repository.cancel
   *  carries no gate class), so the sheet never renders two buttons reading
   *  the same word. */
  function askConfirm(cmdId, label, subject, from) {
    var g = classOf(cmdId);
    if (!g) return false;
    var PMc = global.PM && global.PM.confirm;
    if (!PMc) return false;
    var rt = runtimeOf((global.PM_DATA || {}).docker || {});
    var where = rt.engine + '/' + rt.context;
    var scope = 'Scope: ' + (subject ? subject + ' on ' + where : where) + '.';
    var verb = label || PMK.actionLabel(cmdId);
    setTimeout(function () {
      PMc({
        /* The title asks the question with the target IN it. "Delete?" over a
           body that names the target is a question you can answer without
           reading the target, which is the failure mode a confirmation sheet
           exists to prevent. */
        title: verb + (subject ? ' ' + subject : '') + '?',
        body: scope + ' ' + (GATE_SAY[g] || '') + ' Command: ' + cmdId + '.',
        confirmLabel: verb,
        cancelLabel: 'Cancel',
        danger: g !== 'A',
        from: from
      });
    }, 0);
    return true;
  }

  /** The subject a gated action applies to, read from the DOM rather than
   *  carried through the menu: PMK.row already stamps the UN-elided identity
   *  into data-pm-key, and this file's hand-rolled rows stamp data-xd-subj.
   *  A control outside any row (the header kebab, the footer) has no subject
   *  and the sheet falls back to naming the runtime. */
  function subjectOf(node) {
    var row = node && node.closest ? node.closest('[data-xd-subj],[data-pm-row]') : null;
    if (!row) return '';
    return row.getAttribute('data-xd-subj') || row.getAttribute('data-pm-key') || '';
  }

  /** PMK.btn plus this file's click hooks. String surgery on the kit's
   *  output, because PMK.btn taking a command id is the right home for this
   *  and every version needs it -- but the shared file is not this one's to
   *  change. Reported, not patched. */
  function actBtn(label, opts, act, val, subj) {
    return PMK.btn(label, opts).replace('<button type="button"',
      '<button type="button" data-xd-act="' + esc(act) + '" data-xd-val="' + esc(val || '') +
      '"' + (subj ? ' data-xd-subj="' + esc(subj) + '"' : ''));
  }

  /* --------------------------------------------------------- row commands
     Values are the real cmd.docker.* ids. Where a command is unavailable the
     unmet PRECONDITION TOKEN is the reason code; no sentence is invented. */
  function cActions(c) {
    var run = c.status === 'running';
    return [
      { value: 'cmd.docker.container.view_logs', label: 'Logs' },
      {
        value: 'cmd.docker.container.open', label: 'Open app', disabled: !c.url,
        reason: c.url ? '' : 'access_url_unresolved',
        sentence: c.url ? '' : 'No direct access URL detected'
      },
      {
        value: 'cmd.docker.container.attach_shell', label: 'Attach shell',
        disabled: !run, reason: run ? '' : 'container_running'
      },
      { value: 'cmd.docker.container.stats', label: 'Stats' },
      { value: 'cmd.docker.container.inspect', label: 'Inspect' },
      { type: 'sep' },
      {
        value: 'cmd.docker.container.start', label: 'Start', disabled: run,
        reason: run ? 'container_stopped' : ''
      },
      { value: 'cmd.docker.container.stop', label: 'Stop' },
      { value: 'cmd.docker.container.restart', label: 'Restart' },
      { type: 'sep' },
      { value: 'cmd.docker.container.delete', label: 'Delete', danger: true }
    ];
  }
  function iActions(im) {
    return [
      { value: 'cmd.docker.run', label: 'Run' },
      {
        value: 'cmd.docker.image.push', label: 'Push', disabled: im.dangling === true,
        reason: im.dangling === true ? 'image_selected' : ''
      },
      { value: 'cmd.docker.image.tag', label: 'Tag' },
      { value: 'cmd.docker.image.inspect', label: 'Inspect' },
      { type: 'sep' },
      { value: 'cmd.docker.registry.tag_push', label: 'Tag and push' },
      { value: 'cmd.docker.registry.promote', label: 'Promote' },
      { type: 'sep' },
      { value: 'cmd.docker.image.delete', label: 'Delete', danger: true }
    ];
  }
  function sActions(sv) {
    var up = sv.status === 'running';
    return [
      { value: 'cmd.docker.compose.up_subset', label: 'Up', disabled: up, reason: up ? 'compose_subset_valid' : '' },
      { value: 'cmd.docker.compose.down_subset', label: 'Down', disabled: !up, reason: up ? '' : 'compose_subset_running' },
      { value: 'cmd.docker.container.view_logs', label: 'Logs' },
      { value: 'cmd.docker.container.restart', label: 'Restart' },
      { type: 'sep' },
      { value: 'cmd.docker.compose.scenario.save', label: 'Save scenario' },
      { value: 'cmd.docker.compose.scenario.delete', label: 'Delete scenario', danger: true }
    ];
  }
  /* The registry row is gated on TWO independent things and used to read only
     one of them. The registry's own `capability` says what that endpoint
     accepts; `auth.gated` says what this IDENTITY may do, and the fixture's
     identity may not push to any of them because its token expired. The
     sentence for the identity half is the fixture's own
     ("Push needs images:push, which this identity does not have."), which is
     why the capability half still carries only its token: there is no
     sentence for it and one is not invented. */
  function rActions(r, d) {
    var live = r.state === 'ok' || r.state === 'attention';
    var A = authOf(d);
    var byCap = {};
    A.gated.forEach(function (g) { byCap[g.capability] = g.sentence; });
    function cap(value, label, need) {
      var offEndpoint = r.capability !== 'push_pull';
      var offIdentity = !!byCap[need];
      if (!offEndpoint && !offIdentity) return { value: value, label: label };
      return {
        value: value, label: label, disabled: true, reason: need,
        sentence: offIdentity ? byCap[need] : ''
      };
    }
    return [
      { value: 'cmd.docker.registry.promote', label: 'Browse', disabled: !live, reason: live ? '' : 'registry_target_allowed' },
      cap('cmd.docker.registry.tag_push', 'Tag and push', 'images:push'),
      cap('cmd.docker.create_repository', 'Create repository', 'repositories:create'),
      { type: 'sep' },
      { value: 'cmd.docker.host.preflight', label: 'Reconnect' }
    ];
  }

  /* --------------------------------------------------------- scenario rows
     BLIND SPOT 11 / M21, and the one regression against the SHIPPED panel:
     v0 has a scenario list and nine of nine redesigns dropped it.

     Run is disabled by `valid`, not by `stale`. The two are different claims
     and the fixture keeps them apart: sc-integration is stale and still valid
     (the compose file moved under it), sc-observability is stale AND invalid
     (it names a service that no longer exists). A stale-but-valid scenario
     still runs, and refusing it would be the panel inventing a precondition
     the data does not state. The repair action is the fixture's own id and
     the fixture's own label, verbatim -- it is NOT a cmd.docker.* id and is
     not pretended to be one. */
  function scActions(sc) {
    var bad = sc.valid === false;
    var out = [
      {
        value: 'cmd.docker.compose.scenario.run', label: 'Run scenario',
        disabled: bad, reason: bad ? (sc.drift || 'unknown') : '',
        sentence: bad ? (sc.driftSummary || '') : ''
      },
      { value: 'cmd.docker.compose.scenario.edit', label: 'Edit scenario' }
    ];
    if (sc.repair && sc.repair.id) {
      out.push({ value: sc.repair.id, label: sc.repair.label || PMK.actionLabel(sc.repair.id) });
    }
    out.push({ type: 'sep' });
    out.push({ value: 'cmd.docker.compose.up_subset', label: 'Up subset' });
    out.push({ value: 'cmd.docker.compose.scenario.save', label: 'Save scenario' });
    out.push({ type: 'sep' });
    out.push({ value: 'cmd.docker.compose.scenario.delete', label: 'Delete scenario', danger: true });
    return out;
  }
  /* At bucket 0 and 1 a row is one line and the stale flag has nowhere to go,
     so it goes where the reason already goes in this file: the menu head. */
  function scMenu(sc) {
    return [{
      type: 'head',
      label: [sc.stale === true ? 'stale' : '', sc.services + ' services',
              sc.lastRun ? 'ran ' + sc.lastRun + ' ago' : ''].filter(Boolean).join(MID)
    }].concat(scActions(sc));
  }
  function pActions() {
    return [
      { value: 'cmd.docker.host.receipt.open', label: 'Open receipt' },
      { value: 'cmd.docker.template.commit', label: 'Commit template' },
      { value: 'cmd.docker.template.push', label: 'Push template' },
      { type: 'sep' },
      { value: 'cmd.docker.drift.compare', label: 'Compare drift' }
    ];
  }

  /* ------------------------------------------------------------ host access
     CRAU-021 (:L218, :L2097-L2157) makes these THREE independent axes, not
     one "connected" flag. tower.platyr.lan is the row that proves it:
     readable, NOT writable, and still terminal-capable. A single boolean
     would render that host wrong in three different ways — it would hide the
     inventory it can still serve, offer the writes it cannot take, or refuse
     the session it can still open. Two rules only become testable because
     the axes are separate: a read stays available whenever access is
     readable even when writes are blocked, and a session falls only when no
     terminal-capable path resolves. */
  function accessOf(h) {
    return h.writable === true ? 'read+write'
      : h.readable === true ? 'read-only' : 'no access';
  }
  function termOf(h) { return h.terminalCapable === true ? 'terminal' : 'no terminal'; }

  /* All ELEVEN cmd.docker.host.* commands, gated on those axes.
     UI_Command_Catalog publishes NO precondition for any of the eleven
     (research/docker.md section 9.1), so there is no precondition TOKEN to
     use as the disabled reason the way the container and compose rows do.
     The honest code is then the host's own CRAU:L449 reason, verbatim, with
     its own sentence — offline_cached, network_blocked_by_policy,
     host_unreachable and host_untrusted are not interchangeable and the
     recovery differs for each. A host that carries no reason discloses none;
     nothing here is invented. */
  function hActions(h) {
    var code = h.reason || '', say = h.sentence || '';
    function cmd(value, label, on) {
      return on
        ? { value: value, label: label }
        : { value: value, label: label, disabled: true, reason: code, sentence: say };
    }
    return [
      cmd('cmd.docker.hosts.open', 'Open Docker / Hosts', true),
      cmd('cmd.docker.host.refresh', 'Refresh hosts', true),
      /* Preflight stays live on every host. It is the recovery path for the
         three unreachable states, so disabling it on exactly the rows that
         need it would be the gate eating its own purpose. */
      cmd('cmd.docker.host.preflight', 'Run preflight', true),
      cmd('cmd.docker.host.profile.save', 'Save host profile', true),
      cmd('cmd.docker.host.receipt.open', 'Open receipt', true),
      { type: 'sep' },
      cmd('cmd.docker.host.session.launch', 'Launch host session', h.terminalCapable === true),
      cmd('cmd.docker.host.access.open_app', 'Open app on host', h.readable === true),
      { type: 'sep' },
      cmd('cmd.docker.host.instance.start', 'Start instance', h.writable === true),
      cmd('cmd.docker.host.instance.stop', 'Stop instance', h.writable === true),
      cmd('cmd.docker.host.instance.restart', 'Restart instance', h.writable === true),
      cmd('cmd.docker.host.instance.retain', 'Retain instance', h.writable === true)
    ];
  }

  /* The same eleven commands, headed by the three axes. At bucket 0 and 1 a
     host row is one line and there is no second line to put them on — xD1's
     own ladder already sends the REASON to the kebab at those two widths, so
     the axes go to the same place rather than to a width that cannot pay for
     them. PMK.overflow renders a head item; the kit's row-level ctx template
     does not (it would emit the label as a value-less item), so the head goes
     on the MENU and the plain action list stays the context payload. That
     asymmetry is a kit gap, reported rather than patched here. */
  function hMenu(h) {
    return [{ type: 'head', label: [h.kind || '', accessOf(h), termOf(h)].join(MID) }]
      .concat(hActions(h));
  }

  /* CRAU-021's three axes are what the Hosts subview EXISTS to answer, and a
     host carrying a reason used to lose all three: the sentence took the
     whole second line and the elision reached its cap before "remote" or
     "read-only" was ever printed. Four of the five hosts carry a reason, so
     four of five rows disclosed no axis at any width.

     The axes are short and fixed-length, the sentence is neither, so the axes
     go FIRST and the sentence takes the elision. Nothing becomes unreachable:
     the sentence stays verbatim in the row's own command menu — every command
     the axes disable already cites it — and in xD1's PMK.blocked strip at
     bucket 3. Terminal joins only at bucket 3 because at 380px the longest
     code (network_blocked_by_policy, 25 chars) leaves 19 for the rest, and
     "remote · no access" is 18 of them.

     Geometry is untouched: this changes WHICH text goes into the same
     single-line span, under the same cap, in all three variants. */
  function axisLine(r, b, say) {
    var parts = arr(r.axes).slice(0, b >= 3 ? 3 : 2).filter(Boolean);
    var last = say || r.note || '';
    if (last) parts.push(last);
    return parts.join(MID);
  }

  /* ============================================================== the model
     ONE builder, three renderers. "cells" is xD2's table projection, "meta"
     is the kit's metadata run, "text" is xD3's match haystack. */
  function modelFor(d, id) {
    var m = { id: id, label: '', cols: [], rows: [], primary: null, kind: 'list', paging: null };
    var sv = subById(d, id);
    m.label = (sv && sv.label) || id;

    if (id === 'containers') {
      m.cols = [
        { key: 'image', label: 'Image', kind: 'image', u: 2 },
        { key: 'ports', label: 'Ports', u: 1 },
        { key: 'age', label: 'Age', u: 1 },
        { key: 'state', label: 'State', u: 1 },
        { key: 'detail', label: 'Detail', u: 1 }
      ];
      m.primary = { label: 'Refresh', value: 'cmd.docker.host.refresh' };
      m.paging = (d.paging || {}).containers || null;
      arr(d.containers).forEach(function (c, i) {
        m.rows.push({
          key: 'c' + i, group: 'ctr', groupLabel: 'Containers',
          status: c.status, id: c.name, idKind: 'path',
          meta: [c.image, c.ports, c.age], tail: c.age,
          detail: c.detail || '', why: why(c),
          text: [c.name, c.image, c.ports, c.status, c.detail].join(' ').toLowerCase(),
          cells: {
            image: c.image, ports: c.ports || '—', age: c.age,
            state: word(c.status), detail: c.detail || '—'
          },
          actions: cActions(c)
        });
      });
    } else if (id === 'images') {
      m.cols = [
        { key: 'size', label: 'Size', u: 1 },
        { key: 'age', label: 'Age', u: 1 },
        { key: 'digest', label: 'Digest', kind: 'digest', u: 2 },
        { key: 'state', label: 'State', u: 1 }
      ];
      m.primary = { label: 'Push image', value: 'cmd.docker.image.push' };
      m.paging = (d.paging || {}).images || null;
      arr(d.images).forEach(function (im, i) {
        var st = im.dangling === true ? 'stale' : 'ok';
        m.rows.push({
          key: 'i' + i, group: 'img', groupLabel: 'Images',
          status: st, id: im.ref, idKind: 'image',
          meta: [im.size, im.age, ell(im.digest, 'digest')], tail: im.age,
          detail: im.dangling === true ? 'dangling' : '',
          why: im.dangling === true ? { code: 'dangling', sentence: '' } : null,
          text: [im.ref, im.digest, im.size].join(' ').toLowerCase(),
          cells: {
            size: im.size, age: im.age, digest: ell(im.digest, 'digest'),
            state: im.dangling === true ? 'dangling' : 'present'
          },
          actions: iActions(im)
        });
      });
    } else if (id === 'compose') {
      var co = d.compose || {};
      /* Two kinds of row share one column set, so `kind` is a column rather
         than a chip: it is the discriminator, it is four characters wide, and
         a table that mixes scenarios and services without naming which is
         which is the thing worth avoiding. `project` is gone -- it held one
         value for every row in the subview, and a column of one repeated
         string is 2 units of the band spent saying nothing. It survives in
         the service rows' metadata run, where it always was. */
      m.cols = [
        { key: 'kind', label: 'Kind', u: 1 },
        { key: 'state', label: 'State', u: 1 },
        { key: 'file', label: 'File', kind: 'path', u: 2 },
        /* "Ran", not "Last run". xD2 pre-elides cell VALUES and hands column
           LABELS to CSS, so a label wider than its 1-unit box is a hard clip
           -- which is the same reason Containers is "Ctrs" on the hosts
           table. The sweep found "Last run" cut in six of eight themes at
           480px before this. */
        { key: 'last', label: 'Ran', u: 1 }
      ];
      m.primary = { label: 'Compose up', value: 'cmd.docker.compose_up' };
      var sce = [], svc = [];
      arr(co.scenarios).forEach(function (sc, i) {
        var dr = sc.drift
          ? {
              code: sc.drift, sentence: sc.driftSummary || '',
              /* `valid:false` is a blocked scenario and `stale` alone is a
                 warning. Those are the only two severities PMK.severityOf
                 accepts, and the mapping is the fixture's own distinction. */
              severity: sc.valid === false ? 'blocked' : 'warning',
              actions: sc.repair && sc.repair.id
                ? [{ id: sc.repair.id, label: sc.repair.label || '' }] : []
            }
          : null;
        sce.push({
          key: 'sc' + i, group: 'sce', groupLabel: 'Compose scenarios',
          status: sc.status || 'unknown', id: sc.name || '', idKind: '',
          /* The stale BADGE leads the run because it is four characters and
             survives every cap; the file and the profile follow it. */
          meta: [sc.stale === true ? 'stale' : '', sc.services + ' services',
                 arr(sc.profiles).join('+'), sc.file || ''],
          /* THE STALE BADGE, using the slot the host rows already proved. The
             axes are short and fixed-length and the drift summary is neither,
             so the axes lead the second line and the summary takes the
             elision -- otherwise a 62-character sentence consumes the whole
             cap and the badge this requirement is named after never renders.
             `stale` is its own flag and not a synonym for the status: one of
             the two stale scenarios reports `attention`, so reading the
             status alone would render "two stale" as one. */
          axes: [sc.stale === true ? 'stale' : '', sc.services + ' services',
                 arr(sc.profiles).join('+')].filter(Boolean),
          note: sc.file || '',
          tail: sc.lastRun || '',
          detail: sc.driftSummary || '', why: dr,
          text: [sc.name, sc.id, sc.file, sc.drift, sc.driftSummary,
                 sc.stale === true ? 'stale' : ''].join(' ').toLowerCase(),
          cells: {
            /* The badge rides the Kind cell in the table grammar, and leads
               it, so a cell narrow enough to elide still shows "stale scen…"
               rather than eliding the badge away. At bucket 0 the table
               transposes and the whole band renders "Kind stale scenario". */
            kind: (sc.stale === true ? 'stale ' : '') + 'scenario',
            state: word(sc.status),
            file: sc.file || '—', last: sc.lastRun || '—'
          },
          actions: scActions(sc), menu: scMenu(sc)
        });
      });
      arr(co.services).forEach(function (s, i) {
        svc.push({
          key: 's' + i, group: 'svc', groupLabel: 'Compose services',
          status: s.status, id: s.name, idKind: 'path',
          meta: [co.project || '', co.file || ''], tail: '',
          detail: '', why: null,
          text: [s.name, s.status, co.project, co.file].join(' ').toLowerCase(),
          cells: {
            kind: 'service', state: word(s.status),
            file: co.file || '—', last: '—'
          },
          actions: sActions(s)
        });
      });
      m.rows = sce.concat(svc);
      m.groups = [
        { key: 'sce', label: 'Compose scenarios', rows: sce },
        { key: 'svc', label: 'Compose services', rows: svc }
      ].filter(function (g) { return g.rows.length; });
    } else if (id === 'registries') {
      /* No "reason" COLUMN. A blocked_reason_code renders verbatim or not at
         all (GI-017), and registry_daemon_unreachable in a 48px cell is
         "registry_d…", which is worse than absent — it looks like disclosure
         and is not. The code goes in a PMK.blocked strip under the row. */
      m.cols = [
        { key: 'cap', label: 'Capability', u: 2 },
        { key: 'state', label: 'State', u: 1 }
      ];
      m.primary = { label: 'Reconnect', value: 'cmd.docker.host.preflight' };
      arr(d.registries).forEach(function (r, i) {
        var w = why(r);
        m.rows.push({
          key: 'r' + i, group: 'reg', groupLabel: 'Registries',
          status: r.state || 'unknown', id: r.host, idKind: 'path',
          meta: [r.capability || '', (w && w.code) || ''], tail: '',
          detail: (w && w.sentence) || '', why: w,
          text: [r.host, r.capability, w && w.code, w && w.sentence].join(' ').toLowerCase(),
          cells: { cap: r.capability || '—', state: word(r.state) },
          actions: rActions(r, d)
        });
      });
    } else if (id === 'publish') {
      var pb = d.publish || {};
      m.cols = [
        { key: 'state', label: 'State', u: 1 },
        { key: 'n', label: 'Step', u: 1 }
      ];
      m.primary = { label: 'Push image', value: 'cmd.docker.image.push' };
      arr(pb.stages).forEach(function (s, i) {
        m.rows.push({
          key: 'p' + i, group: 'stg', groupLabel: 'Publish',
          status: s.status, id: s.label, idKind: '',
          meta: [s.id, 'step ' + s.n], tail: '',
          detail: '', why: null,
          text: [s.label, s.id, s.status].join(' ').toLowerCase(),
          cells: { state: word(s.status), n: String(s.n) + '/' + arr(pb.stages).length },
          actions: pActions()
        });
      });
    } else if (id === 'hosts' && arr(d.hosts).length) {
      /* This subview ships five rows and a count of 5, and all three
         renderers used to fall through to the "no rows" empty written for
         networks / volumes / contexts — which genuinely have counts and no
         rows. The result was a header reading 5 over a body saying none
         exist, in the same frame, at the same instant.

         The columns are CRAU-021's axes kept SEPARATE rather than folded
         into one connected/disconnected column, because that is the whole
         content of M29: local vs remote is not the same question as
         writable vs read-only, and neither answers whether a terminal
         resolves. Six columns is two more than any other subview here, which
         is exactly what xD2's column pager exists for.

         The unit weights are measured rather than chosen. Six one-unit
         columns split a 480px window four ways at 60px each, and 60px buys
         eight characters — which cuts "read+write" to "read+wr…" and
         "no terminal" to "no term…", i.e. it elides the two answers this
         subview exists to give. Access and Terminal therefore take two units
         each, which drops the window to three cells at 96px and renders both
         whole. The same arithmetic keeps every HEADER inside its cell: xD2
         pre-elides cell VALUES but hands labels to CSS, so a label wider than
         its box is a hard clip, which is why "Containers" is "Ctrs". */
      m.cols = [
        { key: 'kind', label: 'Host', u: 1 },
        { key: 'access', label: 'Access', u: 2 },
        { key: 'term', label: 'Terminal', u: 2 },
        { key: 'ctrs', label: 'Ctrs', u: 1 },
        { key: 'age', label: 'Age', u: 1 },
        { key: 'state', label: 'State', u: 1 }
      ];
      m.primary = { label: 'Refresh hosts', value: 'cmd.docker.host.refresh' };
      arr(d.hosts).forEach(function (h, i) {
        var hw = why(h);
        /* An unreadable host reports no inventory, and its containers: 0 is
           the absence of a reading rather than a reading of zero. Printing
           the 0 would state that the host has no containers, which is a
           different claim from being unable to look. */
        var seen = h.readable === true;
        m.rows.push({
          key: 'h' + i, group: 'hst', groupLabel: 'Docker / Hosts',
          /* idKind is deliberately the DEFAULT head-keep elision, not 'ref'.
             A hostname's discriminating token is its leading label —
             ci-pool-3, build-01, lab-shared — so keeping the tail would
             render three of these five as the same domain suffix. */
          status: h.state || 'unknown', id: h.name, idKind: '',
          meta: [h.kind || '', accessOf(h), termOf(h),
                 seen ? h.containers + ' containers' : ''],
          /* The same three values the meta run carries, kept as their own
             slot so a renderer can order them against a sentence without
             index maths over a run metaFor() has already filtered and
             elided. The note is what a HEALTHY host says where an unhealthy
             one says its sentence, so the second line is never empty. */
          axes: [h.kind || '', accessOf(h), termOf(h)],
          note: seen ? h.containers + ' containers' : '',
          tail: h.age || '',
          detail: (hw && hw.sentence) || '', why: hw,
          text: [h.name, h.context, h.kind, accessOf(h), termOf(h), h.state,
                 hw && hw.code, hw && hw.sentence].join(' ').toLowerCase(),
          cells: {
            kind: h.kind || '—', access: accessOf(h), term: termOf(h),
            ctrs: seen ? String(h.containers) : '—',
            age: h.age || '—', state: word(h.state)
          },
          actions: hActions(h), menu: hMenu(h)
        });
      });
    } else if (id === 'build') {
      m.kind = 'card';
      m.primary = { label: 'Build image', value: 'cmd.docker.build.run' };
    } else {
      m.kind = 'empty';
      m.primary = { label: 'Refresh', value: 'cmd.docker.host.refresh' };
    }
    /* ONE group unless a subview said otherwise, so all three renderers walk
       groups and none of them needs an "is this the compose one" branch. */
    if (!m.groups) m.groups = [{ key: m.id, label: m.label, rows: m.rows }];
    return m;
  }

  function buildCard(d, b) {
    var bd = (d && d.build) || {};
    return PMK.card(
      PMK.kv('Tag', bd.tag || 'unknown', 'measure', b) +
      PMK.kv('Context', bd.context || 'unknown', 'token', b) +
      PMK.kv('Dockerfile', bd.dockerfile || 'unknown', 'token', b) +
      PMK.kv('Digest', ell(bd.digest || 'unknown', 'digest'), 'measure', b)
    );
  }
  /* The six-label block, CRAU:L927. Every label comes off `auth.labels`; the
     four long values are `prose` and therefore stacked and two-line clamped
     by the kit, because Requested and Effective are 21 and 24 characters and
     the reason, support and override strings are 46 to 50 -- inline them and
     the value slot is 88px of a 46-character sentence.

     The capability enum is rendered as itself: the closed list with a present
     / absent word per entry, not a filtered "what you can do" list. The
     absence of images:push is the whole content of the block, and a list that
     silently omits what is missing cannot express it. */
  function authCard(d, b) {
    var A = authOf(d);
    var h = '';
    h += PMK.kv(A.L.requested, A.requested, 'prose', b);
    h += PMK.kv(A.L.effective, A.effective, 'prose', b);
    if (A.reason) h += PMK.kv(A.L.reason, A.reason, 'prose', b);
    if (A.support) h += PMK.kv(A.L.support, A.support, 'prose', b);
    if (A.inherited) h += PMK.kv(A.L.inheritedFrom, A.inherited, 'prose', b);
    if (A.overridden) h += PMK.kv(A.L.overriddenBy, A.overridden, 'prose', b);
    var card = PMK.card(h);
    /* The capability enum is NOT a kv list, and the sweep is why. PMK.kv
       renders `token` inline from bucket 1 with the KEY capped at 40% of the
       band, and "repositories:read_private" is 25 characters -- it came back
       as a W1 ellipsis in six theme/width combinations, cutting the one
       string in the row that carries the meaning. A wrapping line has no cap
       and no clamp, so the id renders whole at 240px in all eight themes. */
    A.caps.forEach(function (c) {
      card += '<div class="xD-cap"><span class="xD1-mono">' + esc(c.id) + '</span>' +
        esc(MID + (c.present === true ? 'present' : 'absent')) + '</div>';
    });
    if (!A.healthy) {
      card += PMK.blocked({
        code: A.code || A.state, sentence: A.reason,
        severity: A.state === 'expired' ? 'blocked' : 'warning',
        allowedActionIds: A.allowed
      }, A.state === 'expired' ? 'err' : '');
      /* CRAU:L323 in its own words, once per gated control. The sentence is
         the fixture's; the control name is the fixture's; the capability is
         the fixture's. */
      A.gated.forEach(function (g) {
        card += '<div class="xD-gated"><span class="xD1-mono">' + esc(g.capability) +
          '</span>' + esc(MID + g.sentence) + '</div>';
      });
    }
    return card;
  }

  function emptyFor(m, d) {
    var sv = subById(d, m.id);
    var n = (sv && sv.count) || '';
    return PMK.empty('no-data', m.label,
      n ? n + ' recorded upstream, none carried in this projection.'
        : 'Nothing has been read for this subview yet.',
      'Refresh');
  }

  /* Cross-surface triage feed. Draws from every list the fixture ships plus
     the subview roster itself, because "what is wrong" does not respect the
     CRAU-007 taxonomy: a missing kubeconfig and an exited container are the
     same class of thing to the person reading the panel. */
  /* `hosts` belongs in this list, and not only because the feed reads better
     with it. Four of the five hosts are stale, blocked, failed or prohibited,
     so without it xD1's browse half would render the subview as "Settled 1"
     under a band reading 5 — trading one false empty for a quieter one. A
     host that cannot be written to is the same class of thing to the person
     reading the panel as a container that exited. */
  var FEEDS = ['containers', 'compose', 'registries', 'images', 'publish', 'hosts'];
  function triageOf(d) {
    var out = [];
    FEEDS.forEach(function (id) {
      modelFor(d, id).rows.forEach(function (r) {
        if (isProblem(r.status)) out.push(r);
      });
    });
    subviewsOf(d).forEach(function (s, i) {
      if (s.available === false) {
        var w = why(s);
        out.push({
          key: 'v' + i, group: 'sub', groupLabel: 'Subviews',
          status: 'disabled', id: s.label, idKind: '',
          meta: [(w && w.code) || 'unknown'], tail: '',
          detail: (w && w.sentence) || '', why: w,
          text: [s.label, w && w.code, w && w.sentence].join(' ').toLowerCase(),
          actions: [
            { value: 'cmd.docker.switch_subview', label: 'Show anyway' },
            { value: 'cmd.docker.k8s.select_context', label: 'Select cluster context', disabled: true, reason: (w && w.code) || 'unknown' }
          ]
        });
      }
    });
    /* The identity is the sixth surface, and it is the one that decides what
       the other five will let you DO. An expired token is the same class of
       thing to the person reading the panel as an unreachable host: something
       is open and it is not going to fix itself. A healthy identity adds no
       row -- the feed is the exception set, and "you are logged in" is not an
       exception. */
    var A = authOf(d);
    if (!A.healthy) {
      out.push({
        key: 'idn', group: 'idn', groupLabel: 'Registry identity',
        status: authStatus(A), id: A.effective, idKind: '',
        meta: [A.L.requested + ' ' + A.requested, A.state],
        tail: '',
        detail: A.reason,
        why: {
          code: A.code || A.state, sentence: A.reason,
          severity: A.state === 'expired' ? 'blocked' : 'warning',
          allowedActionIds: A.allowed
        },
        text: [A.requested, A.effective, A.state, A.code, A.reason]
          .join(' ').toLowerCase(),
        actions: authItems(A)
      });
    }
    out.sort(function (a, c) { return sev(a.status) - sev(c.status); });
    return out;
  }

  /* Every disabled subview keeps its reason VISIBLE (CRAU-009), so the
     subview picker is built here once and reused by xD1 and xD2. */
  function subOptions(d) {
    return subviewsOf(d).map(function (s) {
      var w = why(s);
      /* CRAU-007's THIRD state, in the one control that lists all eleven.
         `degraded` is available and partly unreachable at once, and the
         component renders its reason LINE only for a disabled option
         (_pm-components.js:86), so keying disclosure off `disabled` alone
         renders a three-state value as a two-state one — and the state that
         vanishes is the unhealthy one. The hint slot is rendered for every
         option regardless of state, so the code lands there: Docker / Hosts
         reads as degraded in the picker as well as at the destination. The
         option stays enabled, because a degraded subview is still navigable
         and its rows are exactly what the reader is being sent to. */
      var deg = s.available !== false && s.degraded === true;
      return {
        value: s.id,
        label: s.label + (s.count ? '  ' + s.count : ''),
        hint: deg && w ? w.code : '',
        disabled: s.available === false,
        reason: w ? w.code : '',
        sentence: w ? w.sentence : ''
      };
    });
  }
  function activeSub(d, want) {
    var s = firstBy(subviewsOf(d), function (x) { return x.id === want && x.available !== false; });
    return s || firstBy(subviewsOf(d), function (x) { return x.available !== false; }) || subviewsOf(d)[0];
  }

  function sectionBtn(key, label, count, open) {
    return '<button type="button" class="pmk-sec" aria-expanded="' + (open ? 'true' : 'false') +
      '" data-xd-act="sec" data-xd-val="' + esc(key) + '">' +
      ic('chev', 10, 'pmk-sec-chev') +
      '<span class="pmk-sec-lbl">' + esc(label) + '</span>' +
      (count != null ? '<span class="pmk-sec-n">' + esc(count) + '</span>' : '') +
      '</button>';
  }
  /* The body of one section, and the ONLY structural change motion cost this
     file: two nested plain <div>s where the rows used to be direct children
     of the scroller.

     Both are needed and neither is decorative. PMM.expand sizes the OUTER box
     with grid-template-rows 0fr -> 1fr, and 0fr sizes the FIRST ROW ONLY — a
     box holding nine rows directly does not collapse, it collapses to the
     height of row one. So the outer box gets exactly one element child and
     the rows live inside that. Neither div is styled, neither is a flex or
     grid parent, and .pmk-body is a plain block scroller (.pmk-pad is off for
     all three variants), so a block wrapper is layout-transparent: measured
     at 0 R-tier findings across all 3,584 combinations, the same as before.

     The header stays OUTSIDE the box on purpose. .pmk-sec is position:sticky
     inside .pmk-body and a clipping wrapper around a sticky element kills the
     stick — the motion layer says so, and these sections are tall enough for
     it to matter. */
  function grp(key, inner) {
    return '<div data-xd-grp="' + esc(key) + '"><div>' + inner + '</div></div>';
  }
  function field(hook, value, placeholder) {
    return '<input class="pmk-field" type="text" data-xd-q="' + esc(hook) +
      '" value="' + esc(value || '') + '" placeholder="' + esc(placeholder) + '">';
  }

  /* ================================================================ state
     Module-local, keyed per variant. The harness rebuilds a stage on control
     changes; between those, repaint() below re-renders in place. */
  var S = {
    xD1: { sub: 'containers', sev: 'all', q: '', open: {} },
    xD2: { sub: 'containers', col: 0, selecting: false, picked: {} },
    xD3: { q: '', scope: '', open: {} }
  };

  /* =====================================================================
     xD1 — TRIAGE BOARD
     ---------------------------------------------------------------------
     THESIS. A list of 24 containers sorted by name answers a question nobody
     asked. The panel opens with what is WRONG — across every surface at once,
     not per subview — and the 16 healthy containers collapse to a single
     accordion row you open only when you want to browse. This inverts the
     usual grammar: the default view is the exception set, and the inventory
     is the thing you have to ask for.

     Cross-surface is the load-bearing part. An exited container, a compose
     service that is down, a registry with an expiring token and a subview
     with no kubeconfig are four different fixtures and one human concern.
     Group headers carry the origin, so no row spends width on a source chip
     and the origin survives at 240px where a chip cannot.

     The eleven-subviews problem is answered by REFUSING the switcher as
     primary navigation: the subview picker is a PMK.select at EVERY bucket —
     one 24px line, never a strip, never a grid — because in this design you
     navigate by problem, not by taxonomy. That is the only honest way to keep
     all eleven visible with disabled reasons in 224px (11 x 24px = 264px), and
     making it bucket-invariant means the control never changes shape on you.

     LADDER
              240 (b0)        320 (b1)       380 (b2)         480 (b3)
     strip    select over     same           select + filter  same, one line
              filter, stacked                on one line
     vitals   glyph + count   + count        + status word    + status word
     rows     identity only   + age tail     two-line: the    two-line: the
              (one line)                     reason code in   reason code, the
                                             mono then the    sentence AND the
                                             sentence on L2   image ref on L2
     reasons  in the kebab    in the kebab   on row line 2    + a full
                                                              PMK.blocked
                                                              strip with its
                                                              first allowed
                                                              action
     settled  collapsed       collapsed      collapsed        open by default

     Both halves take the same row at every bucket, and neither uses the kit's
     tail meta slot above bucket 1. That is deliberate rather than lazy: the
     kit budgets the tail run as if the identity took only its 96px floor, and
     a 35-character container name takes 230px, so the run is handed less
     space than it reserved and .pmk-meta (overflow:hidden) clips — an R1 in
     four themes at 480px. A version does not own the metadata-degradation
     rule, so the fix is to stop asking for a slot the row cannot pay for, not
     to loosen the kit's clip.

     MOTION. PMM.expand, the shared accordion. It is the one design here whose
     central gesture is a section opening — "the 16 healthy containers collapse
     to a single accordion row" is the thesis sentence — so the primitive is
     not decoration on top of the design, it is the design's verb. The
     severity vitals additionally re-enter the feed with PMM.enter, because
     changing the filter changes which rows exist and rows arriving is
     primitive 3. Neither ever runs on the browse half alone; the body is one
     list and it enters as one.

     SLINT MAPPING. Two VecModels — triage and browse — plus an int bucket, an
     int severity filter and a string query, all computed in Rust. The feed is
     a flat_map over the four source models with a severity comparator; the
     accordions are Buttons with accessible-expanded driving an "if" on the
     row block. The picker is a ComboBox in every bucket, so there is no
     bucket-conditional widget swap to port at all.

     HONEST WEAKNESS. It optimises for the bad day. On a clean runtime the
     hero region is a single empty state and the panel degrades to a plain
     list with two extra bars of chrome above it — strictly worse than vD.
     Second: the browse half is one accordion tap away from every healthy
     container, so the routine "open a log for a working service" costs a tap
     that no other design charges. The pinned filter is the mitigation, not a
     fix. Third: cross-surface triage means the feed can exceed the subview
     you are scoped to, which is a real scope-mismatch the group headers
     explain but do not remove.
     ===================================================================== */
  function pD1(D, st) {
    var d = D.docker || {};
    var b = D.bucket(st.width), w = st.width, th = st.theme;
    var s1 = S.xD1;
    var cur = activeSub(d, s1.sub);
    s1.sub = cur.id;

    var feed = triageOf(d);
    var q = String(s1.q || '').toLowerCase();
    var counts = {};
    feed.forEach(function (r) { counts[r.status] = (counts[r.status] || 0) + 1; });
    if (s1.sev !== 'all' && !counts[s1.sev]) s1.sev = 'all';
    var shown = feed.filter(function (r) {
      if (s1.sev !== 'all' && r.status !== s1.sev) return false;
      if (q && r.text.indexOf(q) < 0) return false;
      return true;
    });

    /* ---- strip: the bucket-invariant picker plus the mandatory filter ---- */
    var strip = '<div class="xD1-strip' + (b >= 2 ? ' xD1-strip--row' : '') + '">' +
      PMK.select(cur.id, subOptions(d), { style: 'flex:1 1 auto;min-width:0' })
        .replace('data-pm-select', 'data-pm-select data-xd-sel="d1sub"') +
      '<span style="flex:1 1 auto;min-width:0;display:flex">' +
      field('d1', s1.q, b === 0 ? 'Filter' : 'Filter this runtime') +
      '</span></div>' +
      /* Which host these findings are FROM, before any of them are read. A
         triage board that does not say whether it is looking at a writable
         local engine or a cached read-only remote is triaging an unnamed
         machine. */
      hostCtxLine(d, b, w, true);

    /* ---- vitals: one button per severity actually present ---- */
    var order = ['failed', 'blocked', 'prohibited', 'attention', 'stale'];
    var vit = '<div class="xD1-vitals">' +
      '<button type="button" class="xD1-vital" data-xd-act="sev" data-xd-val="all"' +
      ' aria-pressed="' + (s1.sev === 'all' ? 'true' : 'false') + '"' +
      ' data-pm-tip="Show every open item">' +
      '<span>' + esc(b === 0 ? String(feed.length) : 'All ' + feed.length) + '</span></button>';
    order.forEach(function (t) {
      if (!counts[t]) return;
      var s = PMK.statusOf(t);
      vit += '<button type="button" class="xD1-vital pmk-t-' + s.tone + '"' +
        ' data-xd-act="sev" data-xd-val="' + esc(t) + '"' +
        ' aria-pressed="' + (s1.sev === t ? 'true' : 'false') + '"' +
        ' data-pm-tip="' + esc(counts[t] + ' ' + s.label.toLowerCase()) + '">' +
        ic(t === 'failed' ? 'x' : t === 'attention' ? 'warn' : t === 'stale' ? 'clock' : 'bar',
           12, 'xD1-vital-g pmk-glyph') +
        '<span>' + esc(String(counts[t]) + (b >= 2 ? ' ' + s.word : '')) + '</span></button>';
    });
    vit += '</div>';

    /* ---- triage rows, grouped by origin ---- */
    var idm = PMK.idChars(w, th, b >= 1 ? 44 : 0);
    function triRow(r) {
      var wy = r.why;
      var code = wy ? wy.code : '';
      var say = (wy && wy.sentence) || r.detail || '';
      var sub = '';
      if (b >= 2) {
        var cap = subCap(w);
        var segs = metaFor(r, b, w, false);
        /* At 480 the reason and the discriminating metadata BOTH fit on line
           two, so the row stops choosing between "why" and "which". */
        var rest = r.axes
          ? axisLine(r, b, say)
          : [say, b >= 3 ? segs.slice(0, 2).join(MID) : ''].filter(Boolean).join(MID) ||
            segs.join(MID);
        if (code) rest = rest ? MID + rest : '';
        sub = '<span class="xD1-sub">' +
          (code ? '<span class="xD1-mono">' + esc(ell(code, '', 34)) + '</span>' : '') +
          esc(ell(rest, '', Math.max(8, cap - (code ? code.length : 0)))) + '</span>';
      }
      var h = PMK.row({
        status: r.status, id: r.id, idKind: r.idKind, idMax: idm,
        meta: metaFor(r, b, w, false), tail: r.tail,
        twoLine: b >= 2, sub: sub, bucket: b, width: w,
        actions: r.menu || r.actions, ctx: r.actions
      });
      if (b >= 3 && wy) {
        /* The row's OWN authorised actions when it carries any -- the repair
           CTA on a drifted scenario, the two allowedActionIds on the expired
           identity -- and the two generic ones only when it carries none.
           Reaching for the generic pair first is how a fixture that ships a
           named recovery ends up offering "Explain this state" instead of
           "Repair scenario". Severity likewise: the row says which of the two
           tiers it is, and PMK.severityOf defaults the rest to blocked. */
        h += '<div class="xD1-why">' + PMK.blocked({
          code: wy.code, sentence: wy.sentence, severity: wy.severity,
          allowedActionIds: wy.allowedActionIds,
          actions: (wy.actions && wy.actions.length) ? wy.actions
            : (wy.allowedActionIds && wy.allowedActionIds.length) ? []
            : [{ label: 'Explain this state' }, { label: 'Refresh remote state' }]
        }, sev(r.status) === 0 ? 'err' : '') + '</div>';
      }
      return h;
    }

    var body = '';
    body += '<div class="xD1-band"><span class="pmk-1">Needs you</span>' +
      '<span class="xD1-band-n">' + esc(String(shown.length) +
        (shown.length === feed.length ? '' : ' of ' + feed.length)) + '</span></div>';

    if (!shown.length) {
      body += feed.length
        ? PMK.empty('no-results', 'No match', 'Nothing open matches this filter.', 'Clear filter')
        : PMK.empty('no-data', 'Nothing open', 'Every surface reports a settled state.', 'Refresh');
    } else {
      var seen = {}, groups = [];
      shown.forEach(function (r) {
        if (!seen[r.group]) { seen[r.group] = []; groups.push(r.group); }
        seen[r.group].push(r);
      });
      groups.forEach(function (g) {
        var rows = seen[g];
        var key = 'g:' + g;
        var open = s1.open[key] !== false;
        body += sectionBtn(key, rows[0].groupLabel, String(rows.length), open);
        if (!open) return;
        var inner = '';
        rows.forEach(function (r) { inner += triRow(r); });
        body += grp(key, inner);
      });
    }

    /* ---- browse: the scoped subview, healthy remainder collapsed ---- */
    var m = modelFor(d, cur.id);

    /* The identity block belongs where the identity BITES, and ABOVE the
       band: Registries and the publish chain are the two subviews whose every
       action it decides, but it is not one of their rows and must not sit
       under a header counting them. The triage row above carries the state at
       every width regardless, so this navigation hides no state -- only
       detail. */
    if (cur.id === 'registries' || cur.id === 'publish') {
      body += '<div class="pmk-pad">' + authCard(d, b) + '</div>';
    }

    body += '<div class="xD1-band"><span class="pmk-1">' + esc(m.label) + '</span>' +
      '<span class="xD1-band-n">' + esc(m.paging ? m.paging.shown + ' of ' + m.paging.total
        : String(m.rows.length)) + '</span></div>';

    if (m.kind === 'card') {
      body += '<div class="pmk-pad">' + buildCard(d, b) + '</div>';
    } else if (m.kind === 'empty') {
      body += emptyFor(m, d);
    } else {
      var settled = function (r) {
        if (isProblem(r.status)) return false;
        if (q && r.text.indexOf(q) < 0) return false;
        return true;
      };
      var gsets = m.groups.map(function (g) {
        return { label: g.label, rows: g.rows.filter(settled) };
      }).filter(function (g) { return g.rows.length; });
      var restN = 0;
      gsets.forEach(function (g) { restN += g.rows.length; });
      var okKey = 'ok:' + cur.id;
      var okOpen = s1.open[okKey] != null ? s1.open[okKey] : b >= 3;
      body += sectionBtn(okKey, 'Settled', String(restN), okOpen);
      if (okOpen) {
        var okIn = '';
        if (!restN) {
          okIn += PMK.empty('no-results', 'Nothing settled', 'Every row here is in the list above.', '');
        } else {
          gsets.forEach(function (g) {
            /* A band only when there is something to tell apart. One group is
               the subview's own name, already printed on the band above. */
            if (gsets.length > 1) {
              okIn += '<div class="xD-band"><span class="pmk-1">' + esc(g.label) +
                '</span><span class="xD-band-n">' + esc(String(g.rows.length)) +
                '</span></div>';
            }
            g.rows.forEach(function (r) {
            /* Two-line from bucket 2, exactly like the triage half. The kit's
               tail meta run budgets as if the identity took only its 96px
               floor; a 35-character container name takes 230px, the run is
               squeezed below what it reserved, and .pmk-meta is
               overflow:hidden — an R1, not a cosmetic one. Rather than
               override the kit's drop rule (which a version does not own),
               this design simply stops asking for a slot the row cannot pay
               for and moves the same segments onto a clipped second line. */
              var segs = metaFor(r, b, w, false);
              okIn += PMK.row({
                status: r.status, id: r.id, idKind: r.idKind, idMax: idm,
                meta: segs, tail: r.tail,
                twoLine: b >= 2,
                sub: b >= 2 ? '<span class="xD1-sub">' +
                  esc(ell(segs.slice(0, b >= 3 ? 3 : 2).join(MID), '', subCap(w))) +
                  '</span>' : '',
                chip: word(r.status), bucket: b, width: w,
                actions: r.menu || r.actions, ctx: r.actions
              });
            });
          });
        }
        body += grp(okKey, okIn);
      }
    }

    var foot = '<div class="xD1-foot">' +
      actBtn(m.primary ? m.primary.label : 'Refresh', { primary: true }, 'run',
             m.primary ? m.primary.value : 'cmd.docker.host.refresh') +
      PMK.overflow([
        { type: 'head', label: m.label },
        { value: 'cmd.docker.switch_subview', label: 'Show advanced subviews' },
        { value: 'cmd.docker.compose_up', label: 'Compose up' },
        { value: 'cmd.docker.build.run', label: 'Build image' },
        { type: 'sep' },
        { value: 'cmd.docker.cleanup.prune', label: 'Prune unused', danger: true }
      ], 'Subview actions') + '</div>';

    return '<div class="pmk-panel">' + headOf(d, b) + strip + vit +
      PMK.body(body, false) + foot + '</div>';
  }

  /* =====================================================================
     xD2 — COLUMN LEDGER
     ---------------------------------------------------------------------
     THESIS. 24 containers x 5 homogeneous attributes is a TABLE, and the
     narrow-panel literature is wrong that tables cannot survive 240px — what
     cannot survive is a table whose columns silently DROP. So: the identity
     column is frozen and always present, and the attribute axis becomes
     NAVIGABLE rather than droppable. No attribute is ever unreachable at any
     width; you page the column window with two 24px steppers or pick a column
     by name. Horizontal scroll is the usual answer here and it is rejected:
     it fails the fit checker's R5 legitimately, it has no Slint equivalent
     without sticky positioning, and a scroll offset is not a state you can
     name. A column INDEX is.

     The fold is the interesting part. At 240px the table TRANSPOSES: the
     selected column stops being a cell on the right and becomes a labelled
     second line under the identity, which buys the identity back the whole
     179px band — enough for 28 characters, where a cell-bearing row leaves it
     16 and turns tastebook_integration-test-runner_1 into noise. One rule,
     four widths, no special cases.

     This is also the only variant that carries CRAU-021 multi-select. A dense
     table is the one grammar where a 24px checkbox column is affordable, and
     the batch bar is honest about the spec gap: cleanup.prune is the only
     command in the catalogue with a plural target, so batch stop/delete has
     no contract yet (research/docker.md section 8.8).

     LADDER
                240 (b0)         320 (b1)       380 (b2)      480 (b3)
     cells      0 — transposed   1 cell         2 cells       4 cells
                to row line 2
     identity   96px floor,      110px target   130px target  150px target
                whole band
     head row   none (the        sticky column  sticky        sticky
                pager names it)  header
     steppers   yes              yes            yes           disabled when
                                                              all columns fit
     select     off              off            available     available
     paging     count in footer  + Load older   + column      same
                                                position

     Columns carry a UNIT WEIGHT, not an equal share: an image ref is worth two
     units and an age one, because a uniform grid spends the same 73px on "6h"
     as on a 46-character ref and only one of them becomes unreadable. The
     identity's target grows with the bucket for the same reason — 96px is the
     kit's floor, not a goal, and holding it there renders an 18-character name
     as "tastebook-post…" at 380px, which inverts the row's own priority.

     MOTION. PMM.push, the shared push/pop. A column step is the one gesture
     in these three variants that has a DIRECTION, and direction is the whole
     content of primitive 2: the window moving right enters from the right,
     moving left enters from the left, which is the only thing that tells you
     the pager went somewhere rather than the table redrawing. The frozen
     identity travels with it, because it is frozen relative to the COLUMNS,
     not relative to the panel — freezing it against a moving column window
     would say the two are unrelated, and the pager's entire claim is that
     they are one table. Picking a column by name takes the same push, from
     the same comparison of old index to new, so the two controls are one
     navigation rather than a slide and a jump. Selection mode and the
     checkboxes animate NOTHING: they fire per click on a dense table and they
     are not arrivals.

     SLINT MAPPING. A [TableColumn] model plus an int window start, and cells
     are a slice of it — Slint has no sticky column, but it does not need one,
     because the window never scrolls: it is re-sliced. Rows are one
     component with an "if bucket == 0" branch swapping the cell row for a
     second Text line. Selection is a HashSet<String> in Rust and the batch
     bar an "if !selection.is_empty()".

     HONEST WEAKNESS. Two, and they are real. First, this grammar only fits
     the four LIST subviews; Build and Publish are objects, not tables, so the
     system is really "a table plus two exceptions" and the exceptions are
     where the design says nothing. Second, the column pager charges a
     keystroke for a value a wider panel gives free — reading "which of these
     24 is unhealthy AND on which port" at 240px is two passes down the list,
     and no amount of layout cleverness makes that one pass. Third, at bucket
     0 the transposed line-2 shows one attribute for every row including rows
     where it is empty, so the fixture's port-less containers render a dash
     column of nothing.
     ===================================================================== */
  function pD2(D, st) {
    var d = D.docker || {};
    var b = D.bucket(st.width), w = st.width, th = st.theme;
    var s2 = S.xD2;
    var cur = activeSub(d, s2.sub);
    s2.sub = cur.id;
    var m = modelFor(d, cur.id);

    /* How many attribute cells fit and how wide, without ever eating the 96px
       identity floor. Purely arithmetic; no measurement, so the port makes the
       same decision from the same numbers. Columns carry a unit weight because
       an image ref and an age are not the same problem: a uniform grid spends
       the same 73px on "6h" as on a 46-character ref, and the ref is the one
       that becomes unreadable. */
    /* The identity TARGET grows with the bucket. 96px is the kit's floor, not
       a goal: holding the identity at the floor while the cells take the rest
       renders "tastebook-post…" for an 18-character name at 380px, which
       inverts the row's own priority. */
    var idTarget = [96, 110, 130, 150][b];
    function fitCells(want, start) {
      var band = w - 16;                       /* panel padding */
      var fixed = 21 + 24 + 8 +                /* status gutter, kebab, row pad */
                  (s2.selecting && b >= 2 ? 28 : 0);   /* the select column */
      var n = Math.min(want, m.cols.length);
      while (n > 0) {
        var win = m.cols.slice(start, start + n);
        if (win.length < n) win = m.cols.slice(Math.max(0, m.cols.length - n));
        var units = 0;
        win.forEach(function (c) { units += (c.u || 1); });
        var per = Math.floor((band - fixed - idTarget - (n + 1) * 4) / Math.max(1, units));
        if (per >= 42) return { n: n, per: Math.min(per, 90) };
        n--;
      }
      return { n: 0, per: 0 };
    }
    var want = [0, 1, 2, 4][b];
    var fit = fitCells(want, s2.col);
    var maxStart = Math.max(0, m.cols.length - Math.max(1, fit.n));
    if (s2.col > maxStart) s2.col = maxStart;
    if (s2.col < 0) s2.col = 0;
    fit = fitCells(want, s2.col);
    var win = m.cols.slice(s2.col, s2.col + Math.max(1, fit.n));
    if (!win.length) win = m.cols.slice(0, 1);
    var pagerOff = m.cols.length <= fit.n;
    function cellPx(c) { return Math.min(160, (c.u || 1) * fit.per); }
    var cellsPx = 0;
    if (fit.n) win.forEach(function (c) { cellsPx += cellPx(c) + 4; });

    /* ---- strip 1: subview picker (all eleven, disabled ones annotated) --- */
    var strip = '<div class="xD2-strip xD2-strip--row">' +
      PMK.select(cur.id, subOptions(d), { style: 'flex:1 1 auto;min-width:0' })
        .replace('data-pm-select', 'data-pm-select data-xd-sel="d2sub"') +
      PMK.overflow([
        { type: 'head', label: m.label },
        { value: 'cmd.docker.host.refresh', label: 'Refresh' },
        { value: 'cmd.docker.cleanup.scan', label: 'Cleanup advisor' },
        { value: 'cmd.docker.drift.compare', label: 'Compare drift' }
      ], 'Subview actions') + '</div>';

    /* ---- strip 2: the column pager ---- */
    var colOpts = m.cols.map(function (c, i) { return { value: String(i), label: c.label }; });
    var bar = '';
    if (m.cols.length) {
      bar = '<div class="xD2-strip xD2-strip--row">' +
        '<button type="button" class="xD2-step" data-xd-act="col" data-xd-val="-1"' +
        (pagerOff || s2.col <= 0 ? ' aria-disabled="true"' : '') +
        ' data-pm-tip="Previous column">' + ic('back', 12) + '</button>' +
        PMK.select(String(s2.col), colOpts, { style: 'flex:1 1 auto;min-width:0' })
          .replace('data-pm-select', 'data-pm-select data-xd-sel="d2col"') +
        '<button type="button" class="xD2-step" data-xd-act="col" data-xd-val="1"' +
        (pagerOff || s2.col >= maxStart ? ' aria-disabled="true"' : '') +
        ' data-pm-tip="Next column">' + ic('chev', 12) + '</button>' +
        (b >= 2
          ? '<button type="button" class="xD2-step" data-xd-act="selmode"' +
            ' aria-pressed="' + (s2.selecting ? 'true' : 'false') + '"' +
            ' data-pm-tip="Select rows for a batch action">' + ic('check', 12) + '</button>'
          : '') +
        '</div>';
    }

    /* ---- context: whose machine, and whose credentials ----
       A ledger states its provenance or it is a list of numbers. Two clipped
       lines, both from the fixture: the host the rows were read from, and the
       identity that decides which of the row commands will be refused. The
       identity line renders only when the identity is NOT healthy, because an
       authenticated identity changes nothing about the table. */
    var A2 = authOf(d);
    var ctx = hostCtxLine(d, b, w, true);
    if (!A2.healthy) {
      ctx += '<div class="xD-ctx">' + esc(ell(
        A2.L.effective + ' ' + A2.effective + MID + (A2.code || A2.state),
        '', ctxCap(w))) + '</div>';
    }

    /* ---- table ---- */
    var reserved = cellsPx + (s2.selecting && b >= 2 ? 28 : 0);
    var idm = Math.max(8, PMK.idChars(w, th, reserved) - 2);
    var body = '';
    if (cur.id === 'registries' || cur.id === 'publish') {
      body += '<div class="pmk-pad">' + authCard(d, b) + '</div>';
    }

    if (m.kind === 'card') {
      body += '<div class="pmk-pad">' + buildCard(d, b) + '</div>';
    } else if (m.kind === 'empty') {
      body += emptyFor(m, d);
    } else if (!m.rows.length) {
      body += PMK.empty('no-data', m.label, 'No rows were read for this subview.', 'Refresh');
    } else {
      if (b >= 1) {
        body += '<div class="xD2-thead"><span class="xD2-gut"></span>' +
          (s2.selecting && b >= 2 ? '<span class="xD2-gut" style="flex:0 0 28px"></span>' : '') +
          '<span style="flex:1 1 auto;min-width:96px">' + esc(m.label) + '</span>' +
          win.map(function (c) {
            return '<span class="xD2-cell" style="flex:0 0 ' + cellPx(c) + 'px">' +
              esc(c.label) + '</span>';
          }).join('') +
          '<span class="xD2-gut" style="flex:0 0 24px"></span></div>';
      }
      var tRow = function (r) {
        var two = b === 0;
        /* The subject a gated action names. PMK.row stamps the un-elided
           identity into data-pm-key for free; a hand-rolled row has to say
           it, and the ELIDED text in the cell above is not it. */
        var h = '<div class="xD2-row' + (two ? ' xD2-row--2' : '') +
          '" tabindex="0" role="button" data-pm-ctx="Row actions"' +
          ' data-xd-subj="' + esc(r.id || '') + '">' +
          PMK.statusMark(r.status);
        if (s2.selecting && b >= 2) {
          var on = s2.picked[r.key] === true;
          h += '<button type="button" class="xD2-ck" data-xd-act="ck" data-xd-val="' +
            esc(r.key) + '" aria-pressed="' + (on ? 'true' : 'false') +
            '" data-pm-tip="Select this row">' + ic('check', 12) + '</button>';
        }
        if (two) {
          var c0 = win[0];
          var val = String((r.cells && r.cells[c0.key]) || '—');
          h += '<span class="xD2-stack"><span>' + esc(ell(r.id, r.idKind, idm)) + '</span>' +
            '<span class="xD2-sub"><b>' + esc(c0.label) + '</b> ' +
            esc(ell(val, c0.kind, capSafe(w - 16 - 21 - 24 - 12 - c0.label.length * 7))) +
            '</span></span>';
        } else {
          h += '<span class="xD2-id">' + esc(ell(r.id, r.idKind, idm)) + '</span>';
          win.forEach(function (c) {
            var v = String((r.cells && r.cells[c.key]) || '—');
            h += '<span class="xD2-cell' + (c.kind === 'digest' || c.kind === 'image' ? ' xD2-mono' : '') +
              '" style="flex:0 0 ' + cellPx(c) + 'px">' +
              esc(ell(v, c.kind, capSafe(cellPx(c)))) + '</span>';
          });
        }
        h += PMK.overflow(r.menu || r.actions, 'Row actions') + '</div>';
        /* Verbatim disclosure, at EVERY bucket. A row that ships a sentence
           gets the full reason strip under it; a row that ships only a state
           token (a dangling image) gets nothing, because inventing prose to
           fill a component is how a panel starts lying.

           The strip's BUTTONS are the row's own authorised actions when it
           has any -- which is how a drifted compose scenario gets "Repair
           scenario" here instead of the generic "Explain this state". */
        if (r.why && r.why.sentence) {
          h += PMK.blocked({
            code: r.why.code, sentence: r.why.sentence, severity: r.why.severity,
            allowedActionIds: r.why.allowedActionIds,
            actions: (r.why.actions && r.why.actions.length) ? r.why.actions
              : [{ label: 'Explain this state' }]
          }, sev(r.status) === 0 ? 'err' : '');
        }
        return h;
      };
      /* One band per group when a subview holds two kinds of row -- compose
         scenarios above compose services. Every other subview has one group
         and emits no band at all, so the table is unchanged there. */
      m.groups.forEach(function (g) {
        if (m.groups.length > 1) {
          body += '<div class="xD-band"><span class="pmk-1">' + esc(g.label) +
            '</span><span class="xD-band-n">' + esc(String(g.rows.length)) +
            '</span></div>';
        }
        g.rows.forEach(function (r) { body += tRow(r); });
      });
    }

    /* ---- batch bar + paging footer ---- */
    var picks = [];
    for (var k in s2.picked) {
      if (Object.prototype.hasOwnProperty.call(s2.picked, k) && s2.picked[k]) picks.push(k);
    }
    var batch = '';
    if (picks.length && b >= 2) {
      /* The batch prune is the sharpest case for the gate in the whole file:
         one click, a plural target, and destructive. Its subject is the
         SELECTION, so the sheet names the count rather than a row. Stop and
         Restart are not gated because the catalogue does not class them as
         destructive, and gating on a feeling instead of on the catalogue is
         how a confirmation becomes a click-through. */
      batch = '<div class="xD2-batch"><span class="xD2-note">' +
        esc(picks.length + ' selected') + '</span>' +
        PMK.btn('Stop', {}) + PMK.btn('Restart', {}) +
        actBtn('Prune', { danger: true, tip: 'cleanup.prune is the only command with a plural target' },
               'run', 'cmd.docker.cleanup.prune', picks.length + ' selected rows') +
        '<button type="button" class="xD2-step" data-xd-act="clear" data-pm-tip="Clear the selection">' +
        ic('x', 12) + '</button></div>';
    }
    var pg = m.paging;
    var foot = '<div class="xD2-foot"><span class="xD2-note">' +
      esc(pg ? pg.shown + ' of ' + pg.total : m.rows.length + ' rows') +
      esc(pagerOff || !m.cols.length || b < 2
        ? '' : MID + 'column ' + (s2.col + 1) + '/' + m.cols.length) +
      '</span>' +
      (pg && pg.total > pg.shown && b >= 1 ? PMK.btn('Load older', {}) : '') +
      actBtn(m.primary ? m.primary.label : 'Refresh', { primary: true }, 'run',
             m.primary ? m.primary.value : 'cmd.docker.host.refresh') + '</div>';

    return '<div class="pmk-panel">' + headOf(d, b) + strip + bar + ctx +
      PMK.body(body, false) + batch + foot + '</div>';
  }

  /* =====================================================================
     xD3 — COMMAND LINE
     ---------------------------------------------------------------------
     THESIS. With 78 wired commands and 11 subviews, chrome is the wrong
     medium: any control surface big enough to expose them costs more than the
     224px band has, and any that fits hides most of them. So there is exactly
     ONE control — a persistent line at the top — and everything else is its
     result set. Type text and you get FEDERATED results: "worker" returns
     containers, images and compose services together, because the fixture's
     tastebook-worker exists as all three and the CRAU-007 taxonomy is a
     filing decision, not a mental model. Type ">" and the same line searches
     all 78 cmd.docker.* ids. Type ":" and it searches the subview roster.

     The eleven-subviews problem dissolves rather than being solved: the
     subview index IS the zero state of the query. Eleven 26px rows cost
     height, which the panel has, and zero width, which it does not — each
     carries its count and, when unavailable, its reason code and sentence
     rendered INLINE and permanently visible, which is stricter than CRAU-009
     asks (it would accept a disabled control with a tooltip).

     Selecting a subview sets a SCOPE chip on the line rather than navigating
     away, so the query narrows instead of the panel changing mode. There is
     no back stack anywhere in this design.

     LADDER
                240 (b0)        320 (b1)      380 (b2)       480 (b3)
     line       input only      + scope chip  + scope chip   same
     hint       none            result count  count + the    + the two
                                              two prefixes    prefixes
     groups     top 3 + more    top 5         top 6, rows    top 8, all
                                              two-line with  metadata, gate
                                              metadata       chips on
                                                             commands
     commands   label only      label only    + cmd id in    + cmd id +
                                              mono            gate class
     subviews   ALL of them     ALL           ALL            ALL

     That last row is the one that matters. Result sets are capped and carry a
     "+N more"; the SUBVIEW ROSTER never is. CRAU-009 requires every subview
     stay visible with its disabled reason, so capping it behind a "+7 more"
     would hide exactly what the rule says must not be hidden — and would also
     falsify this design's central claim, that the roster is free because it
     lives in the zero state.

     MOTION. PMM.enter, the shared list enter, and it is the one variant where
     the enter runs PER KEYSTROKE — the result set is the whole panel, so it
     is also the whole feedback that the query did anything. That is exactly
     the case a default-duration enter would ruin: at --motion-med the list
     would still be fading up while you typed the next character, which is
     the panel making you wait to read what you asked for. So the keystroke
     path steps two knobs the layer already publishes (.xD-fast: --pmm-dur-in
     down to --motion-fast, --pmm-step to 0 so the rows arrive together) and
     the discrete paths — setting or clearing a scope — keep the family's own
     duration and stagger. "+N more" animates nothing: revealing four rows
     below is not a reason to re-fade the six you were already reading.
     Section headers use PMM.expand, the same accordion as xD1, because they
     are the same control.

     SLINT MAPPING. A single string property drives everything: a Rust
     matcher returns Vec<Group{ kind, label, Vec<Hit> }>, and the panel is a
     ListView over the flattened groups. The prefix rules are two char
     comparisons. The zero state is the same ListView fed by the subview model
     — no second component, no mode flag, which is why this is the smallest
     port of the three.

     HONEST WEAKNESS. It only wins after you know the vocabulary. A blank
     input teaches nothing, which is exactly why the zero state must carry the
     whole index — and that index is precisely the chrome the thesis claimed
     to abolish, just rendered lazily. A mouse-only user is strictly worse off
     than with a menu: every one of the 78 commands is two interactions away
     (focus the line, then scroll a group) where a kebab is one. And the
     federated result set has no stable ordering across kinds, so the same
     query can rank a container above an image today and below it tomorrow —
     the group headers bound that, but do not remove it.
     ===================================================================== */

  /* All 78 wired cmd.docker.* ids (research/docker.md section 3, sourced from
     Wiring_Matrix.production.json). gate: HG hard gate / D destructive /
     A audited privileged session. */
  var CMDS = [
    ['cmd.docker.show', 'Show Docker Manager', ''],
    ['cmd.docker.switch_subview', 'Switch subview', ''],
    ['cmd.docker.hosts.open', 'Open Docker / Hosts', ''],
    ['cmd.docker.open_dockerfile', 'Open Dockerfile', ''],
    ['cmd.docker.container', 'Containers', ''],
    ['cmd.docker.image', 'Images', ''],
    ['cmd.docker.compose', 'Compose', ''],
    ['cmd.docker.context', 'Contexts', ''],
    ['cmd.docker.network', 'Networks', ''],
    ['cmd.docker.volume', 'Volumes', ''],
    ['cmd.docker.k8s', 'Kubernetes', ''],
    ['cmd.docker.container.start', 'Start container', ''],
    ['cmd.docker.container.stop', 'Stop container', ''],
    ['cmd.docker.container.restart', 'Restart container', ''],
    ['cmd.docker.container.delete', 'Delete container', 'D'],
    ['cmd.docker.container.open', 'Open app', ''],
    ['cmd.docker.container.view_logs', 'View logs', ''],
    ['cmd.docker.container.attach_shell', 'Attach shell', 'A'],
    ['cmd.docker.container.stats', 'Container stats', ''],
    ['cmd.docker.container.inspect', 'Inspect container', ''],
    ['cmd.docker.run', 'Run image', ''],
    ['cmd.docker.stop', 'Stop', ''],
    ['cmd.docker.restart', 'Restart', ''],
    ['cmd.docker.remove', 'Remove', 'D'],
    ['cmd.docker.logs', 'Logs', ''],
    ['cmd.docker.exec', 'Exec', 'A'],
    ['cmd.docker.inspect', 'Inspect', ''],
    ['cmd.docker.image.push', 'Push image', 'HG'],
    ['cmd.docker.image.tag', 'Tag image', ''],
    ['cmd.docker.image.inspect', 'Inspect image', ''],
    ['cmd.docker.image.delete', 'Delete image', 'D'],
    ['cmd.docker.compose_up', 'Compose up', ''],
    ['cmd.docker.compose_down', 'Compose down', ''],
    ['cmd.docker.compose.up_subset', 'Up subset', ''],
    ['cmd.docker.compose.down_subset', 'Down subset', ''],
    ['cmd.docker.compose.scenario.save', 'Save scenario', ''],
    ['cmd.docker.compose.scenario.run', 'Run scenario', ''],
    ['cmd.docker.compose.scenario.edit', 'Edit scenario', ''],
    ['cmd.docker.compose.scenario.delete', 'Delete scenario', 'D'],
    ['cmd.docker.build.select_target', 'Select build target', ''],
    ['cmd.docker.build.run', 'Run build', ''],
    ['cmd.docker.build', 'Build', ''],
    ['cmd.docker.build.image', 'Build mode: image', ''],
    ['cmd.docker.build.compose', 'Build mode: compose', ''],
    ['cmd.docker.build.bake', 'Build mode: bake', ''],
    ['cmd.docker.bake.preview', 'Preview bake', ''],
    ['cmd.docker.bake.run', 'Run bake', ''],
    ['cmd.docker.bake', 'Bake', ''],
    ['cmd.docker.registry.tag_push', 'Tag and push', 'HG'],
    ['cmd.docker.registry.promote', 'Promote image', 'HG'],
    ['cmd.docker.create_repository', 'Create repository', 'HG'],
    ['cmd.docker.create_repository.confirm', 'Confirm repository creation', 'HG'],
    ['cmd.docker.create_repository.cancel', 'Cancel repository creation', ''],
    ['cmd.docker.template.commit', 'Commit template', ''],
    ['cmd.docker.template.push', 'Push template', 'HG'],
    ['cmd.docker.drift.compare', 'Compare drift', ''],
    ['cmd.docker.cleanup.scan', 'Cleanup advisor', ''],
    ['cmd.docker.cleanup.prune', 'Prune targets', 'D'],
    ['cmd.docker.context.select', 'Select context', ''],
    ['cmd.docker.k8s.select_context', 'Select cluster context', ''],
    ['cmd.docker.k8s.select_namespace', 'Select namespace', ''],
    ['cmd.docker.k8s.apply', 'Apply manifest', 'HG'],
    ['cmd.docker.k8s.diff', 'Diff manifest', ''],
    ['cmd.docker.k8s.logs', 'Workload logs', ''],
    ['cmd.docker.k8s.exec', 'Exec in workload', 'A'],
    ['cmd.docker.k8s.port_forward', 'Port forward', 'A'],
    ['cmd.docker.k8s.helm_preview', 'Preview Helm release', ''],
    ['cmd.docker.k8s.helm_install', 'Install Helm release', 'HG'],
    ['cmd.docker.host.refresh', 'Refresh hosts', ''],
    ['cmd.docker.host.preflight', 'Run preflight', ''],
    ['cmd.docker.host.profile.save', 'Save host profile', ''],
    ['cmd.docker.host.session.launch', 'Launch host session', ''],
    ['cmd.docker.host.instance.start', 'Start instance', ''],
    ['cmd.docker.host.instance.stop', 'Stop instance', ''],
    ['cmd.docker.host.instance.restart', 'Restart instance', ''],
    ['cmd.docker.host.instance.retain', 'Retain instance', ''],
    ['cmd.docker.host.access.open_app', 'Open app on host', ''],
    ['cmd.docker.host.receipt.open', 'Open receipt', '']
  ];

  /* The command namespace each destination OWNS. Nothing is invented: every
     value is the longest prefix shared by that subview's ids in CMDS above,
     which is why `hosts` maps to cmd.docker.host and picks up exactly the
     eleven. `publish` is absent on purpose — its commands are scattered
     across image.push, registry.*, create_repository and template.*, so it
     has no prefix, and a scope with no namespace falls back to showing no
     command group rather than a wrong one. */
  var NS = {
    containers: 'cmd.docker.container', images: 'cmd.docker.image',
    compose: 'cmd.docker.compose', registries: 'cmd.docker.registry',
    build: 'cmd.docker.build', networks: 'cmd.docker.network',
    volumes: 'cmd.docker.volume', contexts: 'cmd.docker.context',
    k8s: 'cmd.docker.k8s', hosts: 'cmd.docker.host'
  };

  function pD3(D, st) {
    var d = D.docker || {};
    var b = D.bucket(st.width), w = st.width, th = st.theme;
    var s3 = S.xD3;
    var raw = String(s3.q || '');
    var mode = raw.charAt(0) === '>' ? 'cmd' : raw.charAt(0) === ':' ? 'sub' : 'any';
    var q = (mode === 'any' ? raw : raw.slice(1)).trim().toLowerCase();
    var scope = s3.scope && subById(d, s3.scope) ? s3.scope : '';
    var cap = [3, 5, 6, 8][b];
    var kw = k8sWhy(d);

    /* ---- the line ---- */
    var line = '<div class="xD3-strip xD3-strip--row">' + ic('search', 14, 'xD3-glyph');
    if (scope && b >= 1) {
      var sv = subById(d, scope);
      line += '<span class="xD3-scope"><span class="xD3-scope-l">' +
        esc((sv && sv.label) || scope) + '</span>' +
        '<button type="button" class="xD3-x" data-xd-act="scope" data-xd-val=""' +
        ' data-pm-tip="Clear the subview scope">' + ic('x', 12) + '</button></span>';
    }
    line += '<span style="flex:1 1 auto;min-width:0;display:flex">' +
      field('d3', raw, b === 0 ? 'Filter' : 'Filter, : subview, > command') +
      '</span>' +
      PMK.overflow(globalItems(d), 'Docker Manager actions') + '</div>';

    var hint = '';
    if (b >= 1) {
      hint = '<div class="xD3-hint">' + esc(
        (scope ? 'Scoped to ' + ((subById(d, scope) || {}).label || scope) + MID : '') +
        (b >= 2 ? 'type : for subviews, > for the 78 commands' : String(CMDS.length) + ' commands')
      ) + '</div>';
    }

    /* ---- matching ---- */
    var groups = [];
    var idm = PMK.idChars(w, th, b >= 1 ? 44 : 0);
    var A3 = authOf(d);

    /* The identity is a RESULT, in the design where everything is a result.
       It leads the zero state because it is the answer to a question the
       query line cannot be asked ("as whom?"), it follows a scope onto the
       two subviews it gates, and it appears for a query that names it. A
       healthy identity is not a result at all -- there is nothing to report. */
    var idnHit = !A3.healthy && (
      (!q && !scope) || scope === 'registries' || scope === 'publish' ||
      (!!q && [A3.requested, A3.effective, A3.state, A3.code, A3.reason,
               A3.L.requested, A3.L.effective].join(' ').toLowerCase().indexOf(q) >= 0)
    );
    if (idnHit && mode === 'any') {
      groups.push({ id: 'idn', label: 'Registry identity', rows: [A3], render: 'idn' });
    }

    if (mode !== 'cmd') {
      var svRows = subviewsOf(d).filter(function (s) {
        return !q || (s.label + ' ' + s.id).toLowerCase().indexOf(q) >= 0;
      });
      if (mode === 'sub' || (!q && !scope)) {
        groups.push({ id: 'sub', label: 'Subviews', rows: svRows, render: 'sub' });
      }
    }
    if (mode === 'any' && (q || scope)) {
      var feeds = scope ? [scope] : FEEDS;
      feeds.forEach(function (fid) {
        /* One result group per MODEL group, so the compose subview federates
           as two: four scenarios and ten services, each under its own header
           with its own count. Folding them into one "Compose" group would put
           a scenario and a service side by side under a label that is true of
           neither. */
        modelFor(d, fid).groups.forEach(function (g) {
          var rows = g.rows.filter(function (r) { return !q || r.text.indexOf(q) >= 0; });
          if (!rows.length) return;
          groups.push({ id: fid + '-' + g.key, label: g.label, rows: rows, render: 'obj' });
        });
      });
    }
    /* A scope is a DESTINATION, and a destination's commands live at it.
       Gating the command group off whenever a scope was set with an empty
       query is what let this panel report "Nothing in this runtime or the
       command catalogue matches" for Docker / Hosts while ">host" in the
       same field returned eleven — the eleven that belong to precisely that
       destination. A scope now filters the catalogue by the subview's own
       command namespace instead of suppressing it. */
    var ns = scope ? (NS[scope] || '') : '';
    if (mode === 'cmd' || (mode === 'any' && q) || (!q && !scope) || (!q && ns)) {
      var cmds = CMDS.filter(function (c) {
        if (q) return (c[0] + ' ' + c[1]).toLowerCase().indexOf(q) >= 0;
        return !ns || c[0].indexOf(ns) === 0;
      });
      groups.push({ id: 'cmd', label: 'Commands', rows: cmds, render: 'cmd' });
    }

    /* ---- rendering ---- */
    var body = '';
    var total = 0;
    groups.forEach(function (g) { total += g.rows.length; });

    if (!total) {
      body = PMK.empty('no-results', 'No match',
        'Nothing in this runtime or the command catalogue matches.', 'Clear');
    }

    groups.forEach(function (g) {
      if (!g.rows.length) return;
      var key = 'q:' + g.id;
      var open = s3.open[key] !== false;
      var full = s3.open['n:' + g.id] === true;
      /* The identity group has one "row" and it is a block, not a list, so it
         carries no count -- "Registry identity 1" would be counting a card. */
      body += sectionBtn(key, g.label, g.render === 'idn' ? null : String(g.rows.length), open);
      if (!open) return;
      /* The subview roster is NEVER capped. CRAU-009 requires every subview
         stay visible with its disabled reason, and this design's whole claim
         is that the roster is the query's zero state — capping it would hide
         behind a "+7 more" exactly what the rule says must not be hidden.
         Result sets are capped; the contract is not. */
      var list = (full || g.render === 'sub') ? g.rows : g.rows.slice(0, cap);
      var inner = '';

      if (g.render === 'idn') {
        inner += '<div class="pmk-pad">' + authCard(d, b) + '</div>';
      } else if (g.render === 'sub') {
        list.forEach(function (s) {
          var off = s.available === false;
          /* CRAU-007's THIRD state. `degraded` is available and partly
             unreachable at once, and keying disclosure off available===false
             alone renders a three-state value as a two-state one — with the
             unhealthy state as the one that disappears. Docker / Hosts is
             reachable, and four of the five hosts behind it are not. */
          var deg = !off && s.degraded === true;
          var wy = why(s);
          inner += '<button type="button" class="xD3-item"' +
            (off ? ' aria-disabled="true"' : '') +
            ' data-xd-act="scope" data-xd-val="' + esc(off ? '' : s.id) + '">' +
            /* A live subview has no STATUS — it is a destination, not a run.
               Only the unavailable and the degraded take a mark, so the two
               unhealthy shapes are the only shapes in the column and read
               instantly. A degraded destination is still navigable, so it
               keeps its chevron and its scope value. */
            (off ? PMK.statusMark('disabled')
              : deg ? PMK.statusMark('attention') : '<span class="xD3-gut"></span>') +
            '<span class="xD3-lab"><span>' + esc(s.label) + '</span></span>' +
            (s.count ? '<span class="xD3-n">' + esc(s.count) + '</span>' : '') +
            ic('chev', 12, 'xD3-glyph') + '</button>';
          if ((off || deg) && wy) {
            inner += '<span class="xD3-why"><span>' + esc(wy.code) + '</span>' +
              (wy.sentence ? esc(MID + wy.sentence) : '') + '</span>';
          }
        });
      } else if (g.render === 'obj') {
        list.forEach(function (r) {
          var wy = r.why;
          var code = wy ? wy.code : '';
          var say = (wy && wy.sentence) || r.detail || metaFor(r, b, w, false).join(MID);
          /* A host row answers the axes first and the sentence with whatever
             cap is left; every other kind keeps the sentence-led line it had,
             because only the Hosts subview has axes to lead with. */
          if (r.axes) say = axisLine(r, b, (wy && wy.sentence) || '');
          inner += PMK.row({
            status: r.status, id: r.id, idKind: r.idKind, idMax: idm,
            meta: metaFor(r, b, w, false), tail: r.tail,
            twoLine: b >= 2,
            sub: b >= 2 ? '<span class="xD3-sub">' +
              (code ? '<span class="xD3-id">' + esc(ell(code, '', 34)) + '</span> ' : '') +
              esc(ell(say, '', Math.max(8, subCap(w) - code.length))) + '</span>' : '',
            bucket: b, width: w, actions: r.menu || r.actions, ctx: r.actions
          });
        });
      } else {
        list.forEach(function (c) {
          var k8 = c[0].indexOf('cmd.docker.k8s') === 0;
          inner += '<button type="button" class="xD3-item' + (b >= 2 ? ' xD3-item--2' : '') + '"' +
            (k8 ? ' aria-disabled="true"' : '') +
            ' data-xd-act="run" data-xd-val="' + esc(c[0]) + '">' +
            '<span class="xD3-glyph">' + ic(c[2] === 'D' ? 'x' : c[2] ? 'warn' : 'chev', 14) + '</span>' +
            '<span class="xD3-lab"><span>' + esc(c[1]) + '</span>' +
            (b >= 2 ? '<span class="xD3-id">' + esc(ell(c[0], 'ref', capSafe(w - 16 - 24 - 24 - 44))) +
              '</span>' : '') +
            '</span>' +
            (c[2] && b >= 3 ? '<span class="xD3-gate">' + esc(c[2]) + '</span>' : '') +
            '</button>';
          if (k8 && b >= 2) {
            inner += '<span class="xD3-why"><span>' + esc(kw.code) + '</span>' +
              (kw.sentence ? esc(MID + kw.sentence) : '') + '</span>';
          }
        });
      }

      if (g.rows.length > list.length) {
        inner += '<button type="button" class="xD3-more" data-xd-act="more" data-xd-val="' +
          esc(g.id) + '">' + ic('down', 12) + '<span>' +
          esc(String(g.rows.length - list.length) + ' more in ' + g.label) + '</span></button>';
      }
      body += grp(key, inner);
    });

    var pm = scope ? modelFor(d, scope).primary : null;
    var foot = '<div class="xD3-foot">' +
      actBtn(pm ? pm.label : 'Refresh', { primary: true }, 'run',
             pm ? pm.value : 'cmd.docker.host.refresh',
             scope ? ((subById(d, scope) || {}).label || scope) : '') +
      (b >= 1 ? actBtn('Cleanup advisor', {}, 'run', 'cmd.docker.cleanup.scan') : '') + '</div>';

    /* The host line sits UNDER the hint, not above it: the hint tells you how
       to drive the one control this design has, and the context tells you
       what you are driving. Both are single clipped lines. */
    return '<div class="pmk-panel">' + headOf(d, b) + line + hint +
      hostCtxLine(d, b, w, false) +
      PMK.body(body, false) + foot + '</div>';
  }

  /* ================================================================ wiring
     One delegated listener set for all three, scoped by the stage's
     data-pm-version. Repaint rebuilds the panel view in place from the
     STAGE's own config, not the control bar's — during a contact sheet those
     differ by theme, and rendering against the wrong one is the exact bug
     that made a width-responsive version report ~1,900 phantom failures. */
  var PANELS = { xD1: pD1, xD2: pD2, xD3: pD3 };

  function stageOf(node) {
    var s = node && node.closest ? node.closest('.pm-stage') : null;
    return s && PANELS[s.getAttribute('data-pm-version')] ? s : null;
  }
  function cfgOf(stage) {
    var base = (global.PM_BAKEOFF && global.PM_BAKEOFF.state) || {};
    var px = parseInt(stage.style.getPropertyValue('--files-panel-w'), 10);
    return {
      width: px || base.width || 380,
      theme: stage.getAttribute('data-theme') || base.theme || 'friendly-dark',
      density: stage.getAttribute('data-density') || 'comfortable'
    };
  }

  /* ================================================================ motion
     Three variants, three primitives, all of them the shared layer's. There
     is no @keyframes, no easing and no duration in this file; the personality
     is whatever the theme family's --pmm-* knobs say it is.

       expand   xD1. A severity group opening IS an accordion. Only the OPEN
                animates: a closed section renders no rows at all, so on close
                there is no outgoing box to collapse — the same asymmetry the
                motion layer names for a re-rendering harness.
       push     xD2. Stepping the column window is a navigation, not a redraw,
                so it takes a DIRECTION: forward when the window moves right,
                back when it moves left. The whole ledger carries the step,
                identity column included, because the identity is frozen
                relative to the columns and not relative to the panel.
       enter    xD1 and xD3. The result list arriving after the query, the
                severity filter, the scope or the subview changed.

     NOTHING .pmm-* is written into the markup. Every class is added here,
     after a repaint, so the stage the harness builds — and the fit checker
     measures — is the same static DOM it was before this file could move.

     Two interactions deliberately do NOT animate. "+N more" would re-enter
     rows you are already reading in order to reveal a few below them, and the
     xD2 select/checkbox toggles fire per click on a dense table. Neither is
     an arrival, and the rule is: if in doubt, less. */
  function play(view, mo) {
    var PMM = global.PMM;
    if (!PMM || !view || !mo) return;
    var body = view.querySelector('.pmk-body');

    if (mo.kind === 'push') {
      if (body) PMM.push(body, mo.dir);
      return;
    }
    if (mo.kind === 'enter') {
      if (!body) return;
      if (mo.fast) body.classList.add('xD-fast');
      PMM.enter(body);
      return;
    }
    if (mo.kind === 'expand') {
      var box = view.querySelector('[data-xd-grp="' + mo.key + '"]');
      if (!box) return;
      box.classList.add('pmm-expand', 'pmm-expand--fade');
      /* The box came out of innerHTML a moment ago and has never been styled,
         so 0fr is not yet a value anything transitioned FROM: toggling
         is-open in the same tick resolves straight to 1fr with no start
         state. One forced style flush fixes it — the same one PMM uses
         internally to restart an animation. Once per section toggle, never
         per frame, and never in a loop. */
      void box.offsetWidth;
      PMM.expand(box, true);
    }
  }

  function repaint(stage, after, mo) {
    var fn = PANELS[stage.getAttribute('data-pm-version')];
    var view = stage.querySelector('[data-pm-panelview]');
    if (!fn || !view || stage.getAttribute('data-pm-panel') !== 'docker') return;
    view.innerHTML = fn(global.PM_DATA, cfgOf(stage));
    if (global.PM && global.PM.mountAll) global.PM.mountAll(view);
    play(view, mo);
    if (after) after(view);
  }
  function stateOf(stage) { return S[stage.getAttribute('data-pm-version')] || {}; }

  function onClick(e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var btn = t.closest('[data-xd-act]');
    if (!btn) return;
    var stage = stageOf(btn);
    if (!stage) return;
    if (btn.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
    var act = btn.getAttribute('data-xd-act');
    var val = btn.getAttribute('data-xd-val') || '';
    var s = stateOf(stage);
    var mo = null;

    if (act === 'sec') {
      s.open = s.open || {};
      var wasOpen = btn.getAttribute('aria-expanded') === 'true';
      s.open[val] = !wasOpen;
      /* Opening only. Closing renders no rows, so there is nothing left in
         the document for a collapse to animate. */
      if (!wasOpen) mo = { kind: 'expand', key: val };
    } else if (act === 'sev') {
      s.sev = val;
      mo = { kind: 'enter' };
    } else if (act === 'col') {
      var back = val === '-1';
      s.col = Math.max(0, (s.col || 0) + (back ? -1 : 1));
      mo = { kind: 'push', dir: back ? 'back' : 'fwd' };
    } else if (act === 'selmode') {
      s.selecting = !s.selecting;
      if (!s.selecting) s.picked = {};
    } else if (act === 'ck') {
      s.picked = s.picked || {};
      s.picked[val] = !s.picked[val];
    } else if (act === 'clear') {
      s.picked = {};
    } else if (act === 'scope') {
      s.scope = val;
      s.q = '';
      mo = { kind: 'enter' };
    } else if (act === 'more') {
      s.open = s.open || {};
      s.open['n:' + val] = true;
    } else if (act === 'run') {
      /* Commands stay inert in the bakeoff -- nothing here starts a
         container. What is NOT inert is the gate: a destructive or egress id
         opens PM.confirm, which is the behaviour under test. An ungated id
         does nothing, exactly as before, and no repaint happens either way.
         The subject is the button's own when it has one (the batch bar names
         a selection, not a row), else the row it sits in, else nothing. */
      var lab = firstBy(CMDS, function (c) { return c[0] === val; });
      askConfirm(val, lab ? lab[1] : PMK.actionLabel(val),
                 btn.getAttribute('data-xd-subj') || subjectOf(btn), btn);
      e.preventDefault();
      return;
    } else { return; }
    e.preventDefault();
    repaint(stage, null, mo);
  }

  /* THE GATE'S OTHER HALF. pm-menu dispatches pm:menuaction with the item's
     value and its item record (_pm-components.js:255), so every overflow menu
     and every row kebab in all three variants reaches this with the real
     command id -- one listener, no per-call-site wiring, and nothing in the
     markup had to change to carry a token. */
  function onMenuAction(e) {
    var host = e.target;
    if (!stageOf(host)) return;
    var det = e.detail || {};
    var item = det.item || {};
    askConfirm(det.action, item.label || PMK.actionLabel(det.action),
               subjectOf(host), host);
  }

  function onInput(e) {
    var t = e.target;
    if (!t || !t.getAttribute) return;
    var hook = t.getAttribute('data-xd-q');
    if (!hook) return;
    var stage = stageOf(t);
    if (!stage) return;
    var pos = t.selectionStart;
    var s = stateOf(stage);
    s.q = t.value;
    /* The keystroke case, and the only one that runs per character: a fast
       enter, no stagger. The field itself lives in the strip, not in the
       scroller, so the row the caret is in never animates under the caret. */
    repaint(stage, function (view) {
      var n = view.querySelector('[data-xd-q="' + hook + '"]');
      if (!n) return;
      n.focus();
      try { n.setSelectionRange(pos, pos); } catch (err) { /* not a text input */ }
    }, { kind: 'enter', fast: true });
  }

  function onChange(e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var host = t.closest('[data-xd-sel]');
    if (!host) return;
    var stage = stageOf(host);
    if (!stage) return;
    var which = host.getAttribute('data-xd-sel');
    var s = stateOf(stage);
    var v = e.detail && e.detail.value;
    if (v == null) return;
    var mo;
    if (which === 'd2col') {
      /* Picking a column by name is the same navigation as the steppers, so
         it takes the same direction rather than a different primitive. */
      var next = parseInt(v, 10) || 0;
      mo = { kind: 'push', dir: next < (s.col || 0) ? 'back' : 'fwd' };
      s.col = next;
    } else {
      s.sub = v; s.col = 0; s.picked = {};
      mo = { kind: 'enter' };
    }
    repaint(stage, null, mo);
  }

  /* Keyboard: the query line reaches the result list without a mouse, and the
     list walks with Up/Down/Home/End as FinalGUISpec.md:2129 requires. */
  function rowsIn(view) {
    return Array.prototype.slice.call(
      view.querySelectorAll('.xD3-item,.xD3-more,.pmk-row,.xD2-row'));
  }
  function onKey(e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var stage = stageOf(t);
    if (!stage) return;
    var view = stage.querySelector('[data-pm-panelview]');
    if (!view) return;

    if (t.getAttribute && t.getAttribute('data-xd-q')) {
      if (e.key === 'ArrowDown') {
        var list = rowsIn(view);
        if (list.length) { e.preventDefault(); list[0].focus(); }
      } else if (e.key === 'Escape' && t.value) {
        e.preventDefault();
        stateOf(stage).q = '';
        repaint(stage, function (v) {
          var n = v.querySelector('[data-xd-q]');
          if (n) n.focus();
        }, { kind: 'enter', fast: true });
      }
      return;
    }
    if (!t.closest('.xD3-item,.xD3-more,.pmk-row,.xD2-row')) return;
    var kids = rowsIn(view);
    var i = kids.indexOf(t.closest('.xD3-item,.xD3-more,.pmk-row,.xD2-row'));
    var j = -1;
    if (e.key === 'ArrowDown') j = i + 1;
    else if (e.key === 'ArrowUp') j = i - 1;
    else if (e.key === 'Home') j = 0;
    else if (e.key === 'End') j = kids.length - 1;
    else return;
    e.preventDefault();
    if (j < 0) {
      var q = view.querySelector('[data-xd-q]');
      if (q) q.focus();
      return;
    }
    if (kids[j] && kids[j].focus) kids[j].focus();
  }

  if (!global.__xDockerBound) {
    global.__xDockerBound = true;
    document.addEventListener('click', onClick);
    document.addEventListener('input', onInput);
    document.addEventListener('pm:change', onChange);
    document.addEventListener('pm:menuaction', onMenuAction);
    document.addEventListener('keydown', onKey);
  }

  /* ============================================================== register
     Three separate versions, each populating ONLY the docker panel. Every
     other panel falls back to the harness placeholder on purpose: a
     panel-scoped variant stays comparable against the six full systems
     without pretending to be one. */
  global.PM_BAKEOFF.register('xD1', {
    name: 'Docker: Triage Board',
    blurb: 'Leads with what is wrong across every surface; the 16 healthy containers collapse to one row.',
    panels: { docker: pD1 }
  });
  global.PM_BAKEOFF.register('xD2', {
    name: 'Docker: Column Ledger',
    blurb: 'A dense table with a frozen identity and a navigable column window that transposes at 240px.',
    panels: { docker: pD2 }
  });
  global.PM_BAKEOFF.register('xD3', {
    name: 'Docker: Command Line',
    blurb: 'One query line over federated results; the subview index is its zero state and all 78 commands are typed.',
    panels: { docker: pD3 }
  });
})(window);
