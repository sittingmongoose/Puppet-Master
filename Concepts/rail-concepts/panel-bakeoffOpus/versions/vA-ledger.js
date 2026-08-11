/* PANEL BAKEOFF - vA LEDGER
   =====================================================================
   THESIS
   Every panel is ONE flat virtualized list of uniform two-line receipts
   under sticky section headers. Horizontal competition is abolished by
   splitting the row in two: line 1 carries ONLY identity, line 2 carries
   ONLY metadata. Nothing ever competes with the label for width again,
   because nothing else is on the label's line.

   The narrow-width mechanic is vertical decomposition plus ZERO container
   nesting. There are no cards, no accordion bodies, no boxes inside boxes.
   A section is a sticky header INSIDE the same scroller and its rows are
   its siblings. Source Control's card-in-card-in-accordion problem is not
   fixed here, it is deleted: the wrapper that caused it never exists.

   The only horizontal neighbours identity ever has are the 21px status
   gutter on the left (rail + glyph, OUTSIDE the text band) and the
   permanently reserved 24px overflow slot on the right. Both are fixed.
   Everything else - meta run, state chip, tail time, inline actions -
   lives on line 2 or is dropped whole by the width ladder.

   ---------------------------------------------------------------------
   WIDTH LADDER - the inversion is the point. The list gets DENSER as the
   panel gets WIDER, because at 480px the metadata fits on line 1 and the
   second line evaporates.

                        240 (b0)   320 (b1)   380 (b2)   480 (b3)
     lines per row         2          2          2          1  (44 -> 28px)
     meta segments      2 + "+N"      3          4          all
     tail slot            none      rel time   state+time  meta+state+time
     inline row action    none       none      1 on hover      2
     section header      count     + overflow  + sort/group  + inline filter

   The state word arrives at bucket 2 as promised, but as the LAST meta
   segment rather than a chip - PMK.row draws a chip only on a one-line row,
   and last is where it belongs: status already has three non-colour channels
   in the gutter (rail dash, glyph shape, accessible label), so the word is
   the redundant fourth and must drop before an image ref loses its tag. At
   bucket 3 it becomes the chip the kit draws. Below bucket 2 the gutter
   carries status alone.

   Those segment counts are CEILINGS, not promises. Widths are budgeted here
   and handed to PMK.metaRun, which still does all the dropping and still
   emits the +N escape - it is only told a truthful number. Three corrections
   the kit cannot make for itself:

     - line 2 sits INSIDE the id stack, so its band is the row minus the tail
       and the inline actions, not the whole row;
     - left alone the one-line meta claims everything above identity's 96px
       floor, which made identity read WORSE at 480px than at 380px, the
       exact inverse of this thesis. Identity now takes what it needs and the
       run gets the remainder, floored at ~84px;
     - metaRun drops segments whole but always keeps at least ONE, so the
       first segment is clamped BY KIND (an image ref keeps its tag) while
       every later one either fits as it stands or drops whole into the
       escape, where it is still readable in full.

   Get any of those wrong and .pmk-meta clips, which is an R1 finding rather
   than anything a reader would ever see.

   With the adversarial fixtures a 23-character owner label ("Orchestrator
   lane-b API") spends the whole line-2 band even at 380px, so the run drops
   to one segment plus a +N escape. That is the finding, not a bug: segments
   drop whole and stay reachable, they never mid-clip. Likewise bucket 3 is
   the tightest bucket in the ladder, not the roomiest: gutter 21 + chip 78 +
   time 44 + two inline actions 60 + overflow 24 + padding 16 = 243px of a
   480px band before one character of identity or metadata is drawn.

   Section headers are PMK.section(...) - real <button aria-expanded>,
   because GI-004 requires accordion headers be accessible buttons - and
   they are position:sticky inside the one scroller. Each section is
   wrapped in a transparent .vA-grp so headers PUSH rather than stack, and
   so Source Control's commit composer can be position:sticky;bottom:0
   scoped to the Changes group alone.

   ---------------------------------------------------------------------
   MOTION - two of the six shared primitives, and no third.
     PMM.expand   the section accordion. The header is left alone (it is
                  position:sticky and a clipping wrapper around a sticky
                  element kills the stick), so the primitive wraps the BODY,
                  which is the one structural change this version needed -
                  see grp() and SECMARK.
     .pmm-enter   the rows arriving, as a class in the markup rather than a
                  call, because a list "arrives" exactly when it is painted.
                  Capped at four stagger steps by the shared layer, 2-4px of
                  travel, and 0ms of stagger in basic - a reader never waits
                  for a ledger to finish assembling itself.
   No flash, no push/pop, no lens: nothing in this version changes under the
   user and there is no navigation stack to push. Everything above is dead
   under [data-motion="reduced"] and prefers-reduced-motion, centrally.

   ---------------------------------------------------------------------
   THE CONFIRMATION GATE - blind spot 20, and no new code
   GitHub_Integration.md:L156 wants scope, consequence and a confirmation
   before a strong action runs. Every destructive or egress action here used
   to ship as a one-click menu item with a danger flag and nothing else.
   PM.confirm (_pm-components.js:498) is a real modal sheet - scrim,
   role="dialog", aria-modal, focus capture, no auto-close, documented at :9
   as "replaces confirm()" - and no version had ever called it. This one
   calls it, through three channels that add no markup:

     menu items      an item that is ENABLED, danger and carries a `sentence`
                     is by construction a gated one, and the sentence is its
                     CONSEQUENCE. The kit already carries data-sentence into
                     pm:menuaction for every item and only PAINTS it when the
                     item is disabled, so a disabled item keeps the old
                     meaning (why it is unavailable) and the two never collide.
     buttons         a bare .pmk-btn has no such slot, so the destructive ones
                     carry data-va-gate with the same sentence.
     banner actions  PMK.blocked emits the fixture's own action ids, and the
                     fixture marks exactly one of them destructive:true /
                     needsConfirm:true. The gate reads those flags.

   SCOPE comes from data-pm-key, which PMK.row writes UN-elided, so the sheet
   names the exact path, branch, container or run - never the ellipsized
   label the row happens to show at 240px. Panel- and section-level actions
   have no row, so their scope is stated inside the sentence, in the
   fixture's own counts.

   ---------------------------------------------------------------------
   ONE BUDGET, COMPUTED AT THE WIDEST THEME
   Every character budget here is computed with basic-* metrics (Inter
   15px + 0.02em tracking, the widest of the eight families per
   versions/README). A row that fits in basic fits in all eight, so the
   numbers are theme-invariant exactly like the --xs / --fs-* tokens are.
   It also decouples the design from state.theme, which the harness does
   not vary per frame in contact and matrix modes.

   ---------------------------------------------------------------------
   SLINT MAPPING - artifacts, the representative panel
   The whole version is a ListView of one component with a fixed height
   per bucket, which is precisely what Slint wants: no text measurement
   during layout, one integer read from Rust.

     export component LedgerRow inherits Rectangle {
       in property <int>    bucket;        // 0..3, computed once in Rust
       in property <string> ident;         // already elided in Rust
       in property <string> meta-line;     // already joined and capped
       in property <string> tail;
       in property <string> state-word;    // "" when nothing to say
       in property <StatusTone> tone;
       height: bucket == 3 ? 28px : 44px;
       HorizontalLayout {
         spacing: 4px; padding-left: 8px; padding-right: 8px;
         Rectangle { width: 3px; background: tone-rail(tone); }
         Image { width: 14px; source: tone-glyph(tone); }
         VerticalLayout {
           horizontal-stretch: 1;
           Text { text: ident; overflow: elide; }
           if bucket < 3 : Text { text: meta-line; font-size: 10px; }
         }
         if bucket >= 2 && state-word != "" : StateChip { word: state-word; }
         if bucket >= 1 && tail != ""       : Text { text: tail; }
         Rectangle { width: 24px; OverflowButton {} }   // always reserved
       }
     }

     export component ArtifactsPanel {
       VerticalLayout {
         PanelHead {}                                  // fixed
         FamilyLenses { bucket: root.bucket; }         // strip, fixed
         ListView {                                    // the ONE scroller
           for item in model : if item.kind == RowKind.section
             ? SectionHeader { }                       // sticky via viewport-y
             : LedgerRow { bucket: root.bucket; }
         }
       }
     }

   The model is one flat array of tagged rows. Sections are entries in it,
   not containers, which is why there is no nesting to port.
   ===================================================================== */
(function () {
  'use strict';

  var K = window.PMK;
  var E = K.esc;
  var DOT = '·';      /* the meta separator, matching the kit */
  var ELL = '…';

  /* ------------------------------------------------------- metrics (basic) */
  var PX_ID   = 6.6;    /* identity advance, basic-* Inter + .02em */
  var PX_SEC  = 7.8;    /* --fs-2xs 10px, 700, uppercase, .08em tracking */
  var PX_MONO = 6.62;   /* --fs-xs 11px monospace - theme invariant */

  /* PMK.row's own budget constants, mirrored so this version can predict what
     the kit will decide and elide identity to match. Kept in sync with
     _pm-kit.js deliberately: the kit owns the drop rule, this version only
     owes it an honest width. */
  var W_TIME = 44, W_CHIP = 78, ID_MIN = 96;

  /* What the kit's budget does NOT know about: the inline-action pair this
     version splices in, and the row's own flex gaps. Both are hidden from the
     kit by shrinking the width handed to it, so its arithmetic stays true for
     the row actually emitted. */
  /* Net gap cost: the kit assumes 16px of panel padding plus 8px of row
     padding; this version's rows carry 8 + 8, so 8px comes back. A two-line
     row has at most five children (4 gaps), a one-line row eight (7 gaps). */
  var W_ACT = 30, W_GAPS2 = 8, W_GAPS1 = 20;

  /* ---------------------------------------------------------------- style
     Version-local only, every selector prefixed .vA-. Emitted inside
     PMK.panel; <style> is display:none so it costs no layout and cannot be
     mistaken for content by the fit checker. */
  var CSS = '<style>' +
    '.vA-grp{display:block}' +
    /* The accordion primitive is a one-column grid, and an AUTO track is
       sized by its content: it takes the item's min-content contribution as
       its floor, so a section body whose widest row cannot shrink pushes the
       track past the panel and the whole section reads as an escape. Pin the
       column to minmax(0,1fr) and the item is exactly the container's content
       width - which is what a plain block child was before the wrapper
       existed. Measured, all four widths x eight themes: 5,020 R2 + 336 R1
       findings -> 0. Version-local because it is a width fix, not motion. */
    '.vA-grp>.pmm-expand{grid-template-columns:minmax(0,1fr)}' +
    '.vA-secbody{min-width:0}' +
    '.vA-sec{position:sticky;top:0;z-index:3;display:flex;align-items:center;' +
      'gap:var(--sm);padding-right:var(--md);background:var(--surface)}' +
    '.vA-sec>.pmk-sec{position:static;flex:1 1 auto;min-width:0;background:transparent}' +
    '.vA-sec .pmk-of,.pmk-head .pmk-of{opacity:1}' +
    '.vA-secf{flex:0 0 116px;min-width:0}' +
    '.vA-list .pmk-row{padding-left:var(--md)}' +
    '.vA-list .pmk-note .pmk-meta{display:inline-flex;vertical-align:middle;max-width:100%}' +
    '.vA-list .pmk-note .pmk-menu{display:inline-flex;vertical-align:middle}' +
    '.vA-list .pmk-row>.pmk-menu{flex:0 0 auto}' +
    '.vA-list .pmk-row--2line>.pmk-chip,.vA-list .pmk-row--2line>.pmk-tail,' +
      '.vA-list .pmk-row--2line>.pmk-of,.vA-list .pmk-row--2line>.pmk-meta,' +
      '.vA-list .pmk-row--2line>.pmk-menu,.vA-list .pmk-row--2line>.vA-i' +
      '{align-self:center}' +
    '.vA-i{flex:0 0 auto;padding:3px 5px}' +
    '.vA-ib{opacity:0;transition:opacity 90ms}' +
    '.pmk-row:hover .vA-ib,.pmk-row:focus-within .vA-ib{opacity:1}' +
    '[data-motion="reduced"] .vA-ib{transition:none}' +
    /* nothing in a strip or the composer may shrink except .vA-grow: a
       control that shrinks below 24px is an R4 hit-target defect */
    '.pmk-strip>.pmk-btn,.pmk-strip>.pmk-menu,.pmk-strip>.vA-i,' +
      '.pmk-strip>.pmk-chip,.pmk-strip>.pmk-mark,.pmk-strip>.pmk-tail,' +
      '.vA-composer>.pmk-btn,.vA-composer>.pmk-menu{flex:0 0 auto}' +
    '.vA-tg{min-width:30px;padding:3px 6px;font-family:var(--mono-font)}' +
    '.vA-tg[aria-pressed="true"]{border-color:var(--accent-primary);' +
      'color:var(--accent-primary);background:var(--accent-soft)}' +
    '.vA-tm{display:inline-block;padding:0 6px;line-height:24px;' +
      'font-family:var(--body-font);font-size:var(--fs-2xs);font-weight:600;' +
      'color:var(--text-primary);white-space:nowrap;max-width:150px;' +
      'overflow:hidden;text-overflow:ellipsis}' +
    '.vA-ln{flex:0 0 auto;font-family:var(--mono-font);font-size:var(--fs-xs);' +
      'color:var(--text-muted);font-variant-numeric:tabular-nums}' +
    '.vA-code{font-family:var(--mono-font);font-size:var(--fs-xs)}' +
    '.vA-hl{background:var(--accent-soft);font-weight:700;' +
      'color:var(--text-primary);border-radius:var(--radius-xs)}' +
    '.vA-composer{position:sticky;bottom:0;z-index:2;display:flex;' +
      'align-items:center;gap:var(--sm);padding:var(--sm) var(--md);' +
      'background:var(--surface-elevated);' +
      'border-top:1px solid var(--border-light,var(--border))}' +
    '.vA-ctl{display:flex;align-items:center;gap:var(--sm);min-height:26px;' +
      'padding:0 var(--md);min-width:0}' +
    '.vA-ctl-k{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;' +
      'white-space:nowrap;font-size:var(--fs-xs);color:var(--text-secondary)}' +
    '.vA-ctl>.pmk-btn{flex:0 0 auto}' +
    '.vA-pad{padding:var(--xs) var(--md)}' +
    '.vA-triage{padding:var(--sm) var(--md);' +
      'border-left:3px solid var(--accent-error);background:var(--surface)}' +
    '.vA-log{font-family:var(--mono-font);font-size:var(--fs-2xs);' +
      'color:var(--text-muted);white-space:nowrap;overflow:hidden;' +
      'text-overflow:ellipsis}' +
    /* The triage sentence WRAPS. It is prose, it is the one line that says
       what to do next, and a clamped or ellipsized instruction is a worse
       answer than no instruction - so it is the only text in the panel with
       no nowrap and no line clamp. */
    '.vA-next{font-size:var(--fs-2xs);line-height:var(--lh-body);' +
      'color:var(--text-secondary);overflow-wrap:anywhere}' +
    '.vA-k{font-size:var(--fs-2xs);color:var(--text-muted);' +
      'letter-spacing:.06em;text-transform:uppercase}' +
    '.vA-grow{flex:1 1 auto;min-width:0}' +
    '</style>';

  /* ------------------------------------------------------------ utilities */

  function ctx(D, state) {
    var w = (state && state.width) || 380;
    return { D: D, w: w, b: D.bucket(w) };
  }

  /** Characters that fit a section label, after chevron + count + extras. */
  function secChars(C, reserved) {
    return Math.max(6, Math.floor((C.w - 16 - (reserved || 0)) / PX_SEC));
  }

  function tmpl(items) {
    return (items || []).map(function (it) {
      if (it.type === 'sep') return '<div data-sep></div>';
      if (it.type === 'head') return '<div data-head>' + E(it.label) + '</div>';
      return '<div data-value="' + E(it.value || '') + '"' +
        (it.hint ? ' data-hint="' + E(it.hint) + '"' : '') +
        (it.danger ? ' data-danger' : '') +
        (it.disabled ? ' data-disabled' : '') +
        (it.reason ? ' data-reason="' + E(it.reason) + '"' : '') +
        (it.sentence ? ' data-sentence="' + E(it.sentence) + '"' : '') +
        '>' + E(it.label) + '</div>';
    }).join('');
  }

  /** Icon-only control. Every one carries data-pm-tip - never a native title.
      `gate` is the consequence sentence for a destructive icon (the stop
      button on a live run is the only one in the panel); it rides on
      data-va-gate because a button has no `sentence` slot the way a menu item
      does, and data-va-label names the action for the sheet, since the button
      itself is an SVG with no text to read. */
  function ibtn(icon, tip, cls, disabled, gate, label) {
    return '<button type="button" class="pmk-btn vA-i' + (cls ? ' ' + cls : '') + '"' +
      (disabled ? ' aria-disabled="true"' : '') +
      (gate && !disabled ? ' data-va-gate="' + E(gate) + '" data-va-label="' +
        E(label || tip) + '"' : '') +
      ' data-pm-tip="' + E(tip) + '">' + K.icon(icon, 14) + '</button>';
  }

  /** A destructive text button. Same markup and same geometry as PMK.btn - the
      gate is two attributes, so nothing about the layout changes. */
  function dbtn(label, gate, opts) {
    opts = opts || {};
    return '<button type="button" class="pmk-btn pmk-btn--danger"' +
      ' data-va-gate="' + E(gate) + '" data-va-label="' + E(opts.act || label) + '"' +
      (opts.tip ? ' data-pm-tip="' + E(opts.tip) + '"' : '') +
      '>' + E(label) + '</button>';
  }

  /** A live destructive or egress MENU item: the danger flag plus the
      consequence the gate will state. Never call it for an item that is
      disabled - there the sentence belongs to the block, not the consequence,
      and a disabled item cannot be clicked so it can never reach the gate. */
  function strong(value, label, consequence, extra) {
    var it = { value: value, label: label, danger: true, sentence: consequence };
    if (extra) Object.keys(extra).forEach(function (k) { it[k] = extra[k]; });
    return it;
  }

  function menuBtn(icon, tip, items) {
    return '<span class="pmk-menu" data-pm-menu>' +
      '<button type="button" class="pm-menu-trigger" data-pm-tip="' + E(tip) + '">' +
      K.icon(icon, 14) + '</button>' +
      '<template data-pm-items>' + tmpl(items) + '</template></span>';
  }

  function textMenu(label, tip, items) {
    return '<span class="pmk-menu" data-pm-menu>' +
      '<button type="button" class="pm-menu-trigger vA-tm" data-pm-tip="' + E(tip) + '">' +
      E(label) + '</button>' +
      '<template data-pm-items>' + tmpl(items) + '</template></span>';
  }

  function tgl(label, on, tip) {
    return '<button type="button" class="pmk-btn vA-tg" aria-pressed="' +
      (on ? 'true' : 'false') + '" data-pm-tip="' + E(tip) + '">' + E(label) + '</button>';
  }

  function field(value, placeholder) {
    return '<input class="pmk-field" type="text" value="' + E(value || '') +
      '" placeholder="' + E(placeholder) + '">';
  }

  function grow(inner) { return '<span class="vA-grow">' + (inner || '') + '</span>'; }

  /* ------------------------------------------------------------- MOTION
     Two of the six shared primitives, and no third: PMM.expand for the
     sections and .pmm-enter for the rows arriving. Nothing else in this
     version changes under the user, so nothing else earns a flash.

     THE ONE STRUCTURAL CHANGE. .pmm-expand animates grid-template-rows
     0fr -> 1fr and therefore needs EXACTLY ONE element child (see
     _pm-motion.css: a box holding six rows directly does not collapse at
     all). Every section here is emitted as one flat string - header first,
     then its rows concatenated onto it - so there was no box to hand the
     helper. sec() now closes its header with a sentinel comment and grp()
     splits on it, wrapping everything AFTER the header in the two divs the
     primitive needs. That is the smallest change that buys the motion:
     nothing moves, nothing is re-ordered, and the ~20 call sites that build
     a section by string concatenation are untouched.

     The wrapper always starts open and settled, because today every section
     body renders regardless of the header's aria-expanded (Docker's
     unavailable subviews are aria-expanded="false" with a visible blocked
     panel). Starting from the state actually on screen is what keeps this a
     motion change and not a layout change; the click handler reads the
     wrapper's real class, not the aria attribute, so the first click on one
     of those headers reconciles the two rather than jumping.

     .pmm-settled is on from the start for the same reason the primitive
     releases the clip at all: friendly's 2px hover ring plus 22px glow needs
     ~12px of clearance that an overflow:hidden box would eat. */
  var SECMARK = '<!--vA-secbody-->';

  function grp(inner) {
    var i = inner.indexOf(SECMARK);
    if (i < 0) return '<div class="vA-grp">' + inner + '</div>';
    return '<div class="vA-grp">' + inner.slice(0, i) +
      '<div class="pmm-expand pmm-expand--fade is-open pmm-settled" data-va-body>' +
      '<div class="vA-secbody pmm-enter">' + inner.slice(i + SECMARK.length) +
      '</div></div></div>';
  }

  function kvs(rows) { return '<div class="vA-pad">' + rows.join('') + '</div>'; }
  function ctl(label, control) {
    return '<div class="vA-ctl"><span class="vA-ctl-k">' + E(label) + '</span>' +
      control + '</div>';
  }
  function btnrow(rows) {
    return '<div class="vA-pad"><div class="pmk-btnrow">' + rows.join('') + '</div></div>';
  }

  /** One state chip, and only when the state is NOT the default. Never paint
      "healthy": projection freshness and health do not collapse, so a green
      chip on every row would spend the slot saying nothing. Applied
      version-wide so the chip slot means the same thing in all seven panels. */
  function stateChip(token) {
    if (!token || token === 'ok') return { chip: null, tone: null };
    var s = K.statusOf(token);
    return { chip: s.word, tone: { ok: 'ok', warn: 'warn', err: 'err' }[s.tone] || null };
  }

  function aheadBehind(a, b) {
    var s = (a ? '+' + a : '') + (b ? (a ? ' ' : '') + '-' + b : '');
    return s || 'in sync';
  }

  /* ------------------------------------------------------ allowed actions
     Blocked rows ship allowed_action_ids and the fixture deliberately ships
     no id->label table, so the label is DERIVED from the id - last dotted
     segment, underscores to spaces, sentence case - never minted. That
     distinction is the whole defect this replaces: a fixed triple of buttons
     is how a panel ends up offering "Abort node" beside a sentence that says
     the session is restoring and no action is needed. The button set is now
     exactly the set the data allows, in the order the data gives, and a row
     that allows nothing renders no buttons at all rather than three.

     `named` lets a caller pass the fixture's own label for an id that
     carries one (redactionFailed.authorize.label is the only such case), so
     an authored string still wins over the derived one.

     THE LOCAL DERIVATION IS GONE. PMK.blockedActions and PMK.actionLabel now
     do exactly this in the kit, and they do one thing this file could not:
     they keep the ID on the button (data-pm-action), which is what makes an
     allowed action dispatchable rather than decorative. So every blocked
     payload is now handed to PMK.blocked WHOLE - code, sentence, severity and
     allowedActionIds together - and the labels, the ordering, the severity
     tier and the derived-label marking all come from one place instead of six.
     Where the fixture authors a label for one id (redactionFailed.authorize),
     the payload is rebuilt in the FIXTURE's order with that one label
     supplied, because PMK.blockedActions puts labelled actions first and the
     destructive route must stay last. */

  /* --------------------------------------------------------------- section
     PMK.section is the accessible button (GI-004). The wrapper carries the
     sticky positioning and the ladder's header extras, because a sticky
     button inside a static wrapper would never stick. */
  function sec(C, o) {
    var b = C.b, extras = '';
    /* chevron + gaps, plus the count, which is flex:none and has no ellipsis
       of its own - Artifacts' "fixed / strong / 5" is 18 characters */
    var res = 22 + (o.count != null ? String(o.count).length * 6 + 8 : 0);
    if (b >= 3 && o.filter) {
      extras += '<span class="vA-secf">' + K.filter(o.filter) + '</span>';
      res += 124;
    }
    if (b >= 2 && o.sort) { extras += menuBtn('bar', 'Sort and group', o.sort); res += 28; }
    if (b >= 1 && o.more) {
      extras += K.overflow(o.more, o.moreTip || 'Section actions');
      res += 28;
    }
    return '<div class="vA-sec">' +
      K.section(K.elide(o.label, o.labelKind || '', secChars(C, res)), o.count, o.open !== false) +
      extras + '</div>' + SECMARK;
  }

  /* -------------------------------------------------------------- meta run
     PMK.metaRun drops segments by WIDTH and surfaces a +N escape; this only
     predicts how much width the surviving run will take, mirroring the kit's
     own loop (PMK.metaWidth, 6px separators, 28px reserved for the escape) so
     identity can be elided against what will really be beside it. */
  function metaPx(segs, cap, maxPx) {
    var w = 0, n = 0;
    for (var i = 0; i < segs.length && n < cap; i++) {
      var add = K.metaWidth([segs[i]]) + (i ? 6 : 0);
      if (w + add > maxPx - (segs.length > i + 1 ? 28 : 0)) break;
      w += add; n++;
    }
    if (!n) { n = 1; w = K.metaWidth([segs[0]]); }   /* the kit forces one */
    return w + (n < segs.length ? 28 : 0);           /* the +N escape button */
  }

  /* ------------------------------------------------------------------ row
     PMK.row owns the three invariants (one growing slot and it is the
     identity; tail slots drop WHOLE by budget; the 24px overflow is always
     reserved). This version adds exactly two things the kit has no slot for:
     the inline-action pair, and - below bucket 3, where the kit will not
     render a chip on a two-line row - the state word promoted to the FIRST
     meta segment, which is where the ladder puts it anyway.

     Both are hidden from the kit's budget by shrinking the width handed to
     it, so an inline action can never steal from the label. Line 2 is then
     re-budgeted explicitly: it lives INSIDE the id stack, so its real width
     is the band minus the tail, and the kit budgets it against the whole
     band. Get that wrong and .pmk-meta clips, which is an R1 finding rather
     than anything a reader would see. */
  function lrow(C, o) {
    var b = C.b, two = b < 3;
    /* a meta entry is a string, or [text, elisionKind] when the kind matters -
       an image ref tail-cut loses its tag, which is the one token that tells
       two builds of the same repository apart */
    var kind0 = '';
    var segs = (o.meta || []).filter(function (s) {
      return s != null && s !== '' && (!s.push || s[0]);
    }).map(function (s, i) {
      if (s.push) { if (!i) kind0 = s[1] || ''; return String(s[0]); }
      return String(s);
    });
    var inline = o.inline || [];
    var nInline = b >= 3 ? Math.min(2, inline.length)
                : b >= 2 ? Math.min(1, inline.length) : 0;

    /* The state word rides at the END of the run, so it drops before real
       metadata does. Status is already carried by three non-colour channels
       in the gutter (rail dash, glyph shape, accessible label); the word is
       the redundant fourth, and it must not cost an image ref its tag. */
    if (o.chip && two && b >= 2) segs = segs.concat([o.chip]);

    var W = C.w - nInline * W_ACT - (two ? W_GAPS2 : W_GAPS1);
    var avail = W - 16 - 8 - (o.status ? 21 : 0) - 24;
    if (o.tail && b >= 1 && avail - W_TIME >= ID_MIN) avail -= W_TIME;

    var postChip = avail;
    if (!two && o.chip && avail - W_CHIP >= ID_MIN) postChip -= W_CHIP;

    /* THE META BUDGET, owned here rather than by the kit.
       Left to itself PMK.row hands the one-line meta everything above the
       96px identity floor, which makes identity read WORSE at 480px than at
       380px - the exact inverse of this version's thesis. So the run is
       capped at 45% of what is left after the chip, and identity keeps the
       remainder. PMK.metaRun still does the dropping and still emits the +N
       escape; it is only told a smaller number.

       The text clamp matters too: metaRun drops segments whole but always
       keeps at least ONE, so a single over-long segment (Testing's 60-char
       assertion) would clip .pmk-meta rather than degrade. Only the FIRST
       segment is clamped, because only it is forced - every later segment
       either fits as it stands or drops whole into the +N escape, where it
       is still readable in full. */
    var idNeed = String(o.id || '').length * PX_ID;
    var runPx = 0, runHTML = '';
    if (segs.length) {
      /* identity takes what it NEEDS, never less than its 96px min-width and
         never so much that the run drops below the ~84px where it stops
         saying anything; the run gets the rest */
      var idFloor = Math.max(ID_MIN,
        Math.min(idNeed, Math.max(ID_MIN, postChip - 84)));
      var budget = two ? avail : Math.max(0, postChip - idFloor);
      if (budget >= 40) {
        segs[0] = K.elide(segs[0], kind0,
          Math.max(6, Math.floor((budget - (segs.length > 1 ? 28 : 0)) / 6.2)));
        runHTML = K.metaRun(segs, b, { maxPx: budget });
        runPx = metaPx(segs, [2, 3, 4, 99][b], budget);
      }
    }
    var idPx = two ? avail : postChip - runPx;

    var opts = {
      width: W,
      bucket: b,
      twoLine: two,
      status: o.status,
      /* The row's identity UN-elided. It defaults to the label, which is
         enough for most rows, but a file row's label is its basename and the
         confirmation gate must name the PATH - a sheet that says "Discard
         changes - import.rs" over two files called import.rs is exactly the
         ambiguity a gate exists to remove. */
      key: o.key,
      id: o.id,
      idKind: o.idKind || '',
      idMax: o.idMax || Math.max(8, Math.floor(idPx / PX_ID)),
      meta: [],                      /* the run is spliced in, budgeted above */
      tail: o.tail,
      chip: o.chip,
      chipTone: o.chipTone,
      actions: o.actions,
      ctx: o.actions
    };
    if (two) opts.sub = runHTML;

    var h = K.row(opts);
    /* one-line: the run belongs immediately after identity, so anchor on the
       first slot the kit emitted after it rather than on the overflow */
    if (!two && runHTML) {
      var at = h.indexOf('<span class="pmk-chip');
      if (at < 0) at = h.indexOf('<span class="pmk-tail');
      if (at < 0) at = h.indexOf('<span class="pmk-of');
      h = h.slice(0, at) + runHTML + h.slice(at);
    }
    /* [icon, tip, disabled, gateSentence, gateLabel] - the last two are the
       confirmation gate, and only the stop icon on a live run carries them. */
    var extra = '';
    for (var i = 0; i < nInline; i++) {
      extra += ibtn(inline[i][0], inline[i][1], 'vA-ib', inline[i][2],
                    inline[i][3], inline[i][4]);
    }
    if (extra) h = h.replace('<span class="pmk-of', extra + '<span class="pmk-of');
    return h;
  }

  function shell(parts) { return K.panel([CSS].concat(parts)); }
  function list(inner) { return K.body('<div class="vA-list">' + inner + '</div>', false); }

  /* =====================================================================
     SEARCH
     The ~130px index card dies. Per research/search.md the panel owes a
     subtle freshness annotation, not a four-row card - build progress is
     status-bar territory. So INDEX becomes the LAST section in the one
     scroller: 26px of header at 240px, and the real control surface below
     it from 320px up, where it costs nothing above the fold.

     Result rows are the one place the two-line receipt collapses to a
     single line by design: there is no metadata beyond the line number, and
     that goes INLINE. A left gutter would cost 28px of 224px - 12.5% of the
     panel, on every row, forever. The text window is centred on the match,
     never on column 0.
     ===================================================================== */

  /* Window a source line around the match. Trim indentation, take up to 8
     characters of leading context, fill the remainder after the match, then
     spend anything left over extending back to the left. The match itself is
     never scrolled out; if it alone overruns the budget it truncates right. */
  function windowHit(h, budget) {
    var full = String(h.pre).replace(/^\s+/, '');
    var mid = String(h.hit), post = String(h.post);
    if (budget < 6) budget = 6;
    if (mid.length >= budget - 1) {
      return { pre: '', mid: mid.slice(0, budget - 1), post: '',
               left: full.length > 0, right: true };
    }
    var room = budget - mid.length;
    var pre = full.length > 8 ? full.slice(full.length - 8) : full;
    var left = pre.length < full.length;
    if (pre.length + (left ? 1 : 0) > room - 1) {
      var keep = Math.max(0, room - 2 - (left ? 1 : 0));
      pre = keep ? full.slice(full.length - keep) : '';
      left = pre.length < full.length;
    }
    var after = room - pre.length - (left ? 1 : 0);
    var right = post.length > after;
    var outPost = right ? post.slice(0, Math.max(0, after - 1)) : post;
    var over = after - outPost.length - (right ? 1 : 0);
    if (over > 0 && left) {
      var want = Math.min(over, full.length - pre.length);
      pre = full.slice(full.length - (pre.length + want));
      left = pre.length < full.length;
    }
    return { pre: pre, mid: mid, post: outPost, left: left, right: right };
  }

  function hitRow(C, f, h) {
    var lead = String(h.line);
    var budget = Math.max(8,
      Math.floor((C.w - 16 - 24 - 8) / PX_MONO) - lead.length - 1);
    var w = windowHit(h, budget);
    return '<div class="pmk-row" tabindex="0" role="button" data-pm-ctx="Match actions">' +
      '<span class="vA-ln">' + E(lead) + '</span>' +
      '<span class="pmk-id vA-code">' + (w.left ? ELL : '') + E(w.pre) +
      '<span class="vA-hl">' + E(w.mid) + '</span>' + E(w.post) +
      (w.right ? ELL : '') + '</span>' +
      K.overflow([
        { value: 'open', label: 'Open at line ' + h.line, hint: f.path },
        { value: 'replace', label: 'Replace this match' },
        { value: 'copy', label: 'Copy path and line' },
        { type: 'sep' },
        { value: 'exclude', label: 'Exclude this file from results' }
      ], 'Match actions') +
      '</div>';
  }

  /* The six index states ship in search.index.states with the exact copy for
     each (FinalGUISpec.md:L699, :L6511). The live token is the SHARED status
     vocabulary's 'ok', which is this vocabulary's 'indexed'; that alias is the
     only mapping, everything else is a straight id lookup. An unknown token
     falls back to itself - raw, but true - because inventing a line for a
     state the array does not carry is how a freshness surface starts lying. */
  function indexState(idx) {
    var want = idx.state === 'ok' ? 'indexed' : idx.state;
    var hit = null;
    (idx.states || []).forEach(function (s) { if (s.id === want) hit = s; });
    return hit || { id: idx.state, line: idx.state, annotateRows: false };
  }

  function pSearch(D, state) {
    var C = ctx(D, state), b = C.b, S = D.search, idx = S.index;
    /* The toggle is the ONLY control in this panel that governs indexing, and
       it used to be hard-coded `On`: under index.state 'disabled' the header
       said DISABLED, the section count said DISABLED, and the switch beneath
       them said On. It is now read from the state, and the annotation beside
       the match count is the state's own sanctioned line rather than the raw
       enum. */
    var ixs = indexState(idx);
    var indexOn = idx.state !== 'disabled';
    var fresh = idx.state !== 'ok' ? ' (' + ixs.line + ')' : '';

    /* ------------------------------------------- BLIND SPOT 15, both halves
       search.remote says available:false with a reason code and a ready-made
       sentence, and search.index.lastBuild says the last build was CANCELLED,
       with its own copy, detail and action. Neither rendered anywhere in the
       bakeoff, and every version - this one included - went on offering
       "Evict remote cache" for a service the same fixture says is down. Two
       reads fix both: the sentence becomes a banner (silentFallback is false,
       so the panel must SAY the results are local rather than quietly
       degrade), and Evict becomes a disabled item carrying the remote's own
       reason code instead of a live destructive one. */
    var RM = S.remote || {};
    var LB = idx.lastBuild || null;
    var remoteDown = RM.available === false;

    /* The one destructive item in this panel that is still live. Its scope is
       the RESULT SET, not the query: paging says 48 of 132 matches are
       loaded, so a Replace All acts on 48 and leaves 84 untouched, and a gate
       that does not say so is worse than none. */
    var loaded = S.summary.matches, total = S.paging.total;
    var evictItem = remoteDown
      ? { value: 'evict', label: 'Evict remote cache', disabled: true,
          reason: RM.reason, sentence: RM.sentence }
      : strong('evict', 'Evict remote cache',
          'Evicts the cached remote index on ' + RM.host +
          '. The next search rebuilds it from scratch and runs local-only until it does.');

    var panelItems = [
      { value: 'replace', label: 'Replace in files' },
      strong('replace_all', 'Replace all',
        'Replaces the ' + loaded + ' matches loaded in this result set, across ' +
        S.summary.files + ' files. ' + total + ' matches exist for ' + S.query +
        '; the ' + (total - loaded) + ' not loaded are not touched. Every file is ' +
        'written on disk and there is no single undo.',
        { hint: 'Validates the current result snapshot first' }),
      { type: 'sep' },
      { value: 'expand', label: 'Expand all' },
      { value: 'collapse', label: 'Collapse all' }
    ];
    if (b < 1) {
      panelItems.push({ type: 'sep' }, { type: 'head', label: 'Scope' });
      S.scopeOptions.forEach(function (o) {
        panelItems.push({ value: o.value, label: o.label });
      });
    }
    panelItems.push({ type: 'sep' },
      { value: 'rebuild', label: 'Rebuild index' },
      { value: 'reanchor', label: 'Re-anchor index' },
      evictItem);

    var head = K.head('Search',
      (b >= 2 ? S.summary.matches + ' in ' + S.summary.files + ' files'
              : String(S.summary.matches)) + fresh,
      K.overflow(panelItems, 'Search actions'));

    var s1 = K.strip(grow(field(S.query, 'Find in files')) +
      ibtn('back', 'Previous match') + ibtn('chev', 'Next match'));

    var s2 = K.strip(
      tgl('.*', S.flags.regex, 'Use regular expression') +
      tgl('Aa', S.flags.caseSensitive, 'Match case') +
      tgl('\\b', S.flags.wholeWord, 'Match whole word') +
      (b >= 1
        ? K.select(S.scope, S.scopeOptions, { style: 'flex:1 1 auto;min-width:0' })
        : grow('')) +
      (b >= 2 ? ibtn('down', 'Show the replace row') : ''));

    /* The file group IS the section. No extra nesting level. Sort/group and
       filter stay panel-level here (the query strip) instead of repeating on
       every file header - the only ladder deviation in this version, and it
       is because search's sections are groups of one list, not peer views. */
    var body = '';
    S.files.forEach(function (f) {
      var rows = '';
      f.hits.forEach(function (h) { rows += hitRow(C, f, h); });
      body += grp(sec(C, {
        label: f.path, labelKind: 'path', count: String(f.count), open: true,
        more: [
          { value: 'collapse', label: 'Collapse this file' },
          { value: 'replace_file', label: 'Replace in this file' },
          { value: 'open', label: 'Open file' },
          { value: 'copy', label: 'Copy path' }
        ], moreTip: 'File group actions'
      }) + rows);
    });

    /* INDEX last: settings-shaped, so it never competes with results. */
    var ix = sec(C, {
      label: 'Index',
      count: b >= 2 ? ixs.id + ' ' + DOT + ' ' + idx.documents.toLocaleString()
                    : ixs.id,
      open: b >= 1,
      more: [
        { value: 'rebuild', label: 'Rebuild index' },
        { value: 'reanchor', label: 'Re-anchor index' },
        { type: 'sep' },
        evictItem
      ], moreTip: 'Index actions'
    });
    /* The last build is a TERMINAL state with its own copy, and it is the
       first thing in the section at every width - including 240px, where the
       controls below it are dropped. `cancelled` is not a synonym for stale:
       partialDiscarded is true and resumable is false, which is why the
       fixture's only action here is a fresh build, and it is rendered as the
       button it is rather than paraphrased. */
    if (LB) {
      ix += K.blocked({
        code: LB.state, severity: 'warning',
        sentence: LB.line + '. ' + LB.detail,
        actions: LB.actions
      });
    }
    if (b >= 1) {
      ix += ctl('Indexing', tgl(indexOn ? 'On' : 'Off', indexOn,
        indexOn ? 'Disable the project index for this project'
                : 'Enable the project index for this project'));
      ix += kvs([
        K.kv('State', ixs.line, 'measure', b),
        K.kv('Engine', idx.engine, 'token', b),
        K.kv('Documents', idx.documents.toLocaleString(), 'token', b),
        K.kv('Last built', idx.builtAt, 'measure', b),
        K.kv('Last build', LB ? LB.state + ', ' + LB.at : 'none', 'token', b),
        /* WHERE the unavailable accelerator lives and WHEN it was last
           checked. The banner above states the consequence; these two say
           which host is down, which is the difference between a notice and
           something a reader can act on. */
        K.kv('Remote search', RM.host + ', checked ' + RM.checkedAt, 'measure', b)
      ]);
      ix += ctl('Large files over', K.btn(idx.largeFileThresholdMb + ' MB',
        { tip: 'Files above this size are never indexed' }));
      ix += ctl('Exclude generated files', tgl(idx.excludeGenerated ? 'On' : 'Off',
        idx.excludeGenerated, 'Exclude generated files from the index'));
      ix += ctl('Follow symlinks', tgl(idx.followSymlinks ? 'On' : 'Off',
        idx.followSymlinks, 'Follow symlinks while indexing'));
      ix += btnrow([
        K.btn('Rebuild', { tip: 'Rebuild the index from scratch' }),
        K.btn('Re-anchor', { tip: 'Re-anchor the index to the current commit' })
      ]);
    }
    body += grp(ix);

    /* NO SILENT LOCAL FALLBACK. The statement qualifies every row below it,
       so it sits in the FIXED region with the query strips and not in the
       scroller: a sentence the reader can scroll away from is not a statement
       about the results, it is a note. Severity is `warning` and not the
       kit's default `blocked` because the fixture's own state is
       `unavailable` - the search ran, the acceleration did not - and drawing
       a degradation as a prohibition is the same class of lie in the other
       direction. Both of the remote's own actions render as real buttons,
       with their fixture ids on them. */
    var remoteNote = remoteDown
      ? K.blocked({ code: RM.reason, severity: 'warning',
                    sentence: RM.sentence, actions: RM.actions })
      : '';

    return shell([head, s1, s2, remoteNote, list(body)]);
  }

  /* =====================================================================
     SOURCE CONTROL
     Five sections, one scroller, zero cards. The branch switcher is a
     PMK.select - never a native select, because GI-005 forbids the
     single-repo assumption a flat native list encodes and a native option
     cannot carry a per-option disabled reason. Worktree rows carry W-014
     ownership on line 2. The composer is sticky to the BOTTOM of the
     Changes group, so the file list scrolls under it: that is the two-level
     scroll model expressed without a second scroller.
     Worktrees sits second as a PINNED section, not a re-ordered canonical
     list - its header overflow carries "Unpin this section".
     ===================================================================== */
  /* ------------------------------------------------------ worktree lifecycle
     WorktreeGitImprovement.md:L297 RESERVES five words - reserved | active |
     blocked_preserved | released | orphaned - and the shared status
     vocabulary cannot express them, which is exactly why the fixture carries
     `lifecycle` as its own field beside `status`. Substituting the status
     word for it is not a near-miss: thread/ratings-schema was released after
     a clean merge into main and is retained for lineage, and its status token
     'disabled' renders the word "Unavailable", so the panel and the
     accessible name both announced a successful merge as broken.

     So the word is READ, never derived, and each non-active state carries the
     fixture's own reason code and its own sentence. Nothing renders for
     'active': this version paints a state only when it is NOT the default
     (see stateChip), and an active worktree has no reserved word to lose. */
  function lifeOf(w) {
    switch (w.lifecycle) {
      case 'reserved':
        return { code: w.lifecycle, sentence: w.reservedSentence };
      case 'orphaned':
        return { code: w.orphanReason, sentence: w.orphanSentence };
      case 'released':
        return { code: w.lifecycle, sentence: w.releasedSentence };
      case 'blocked_preserved':
        return { code: w.preservedReason, sentence: w.preservedSentence };
      default:
        return null;
    }
  }

  function pSource(D, state) {
    var C = ctx(D, state), b = C.b, S = D.source, P = D.project;
    var changed = S.counts.staged + S.counts.unstaged;
    var parallel = S.counts.worktrees - 1;
    /* ------------------------------------------------------- BLIND SPOT 2
       source.repo carries name, owner, nameWithOwner, host, remote,
       lifecycle, visibility, defaultBranch and two SIBLING repositories, and
       ten of ten versions rendered none of it. GitHub_Integration.md:L397
       forbids assuming a single repo context, and a panel that never names
       the repository has assumed one by omission - every branch, worktree and
       commit below is stated as if there could only be one place they came
       from. So identity arrives twice, by the ladder: as items in the strip
       menu at EVERY width (zero pixels, and the trigger's tooltip is the
       repository's own name), and as a section of receipts. */
    var RP = S.repo || {};
    var repoIdent = [
      { type: 'head', label: 'Repository' },
      { value: 'repo', label: RP.nameWithOwner, hint: RP.visibility },
      { value: 'host', label: RP.host, hint: 'host' },
      { value: 'remote', label: RP.remote, hint: 'remote' },
      { value: 'lifecycle', label: 'Lifecycle ' + RP.lifecycle },
      { value: 'default_branch', label: 'Default branch ' + RP.defaultBranch },
      { type: 'sep' },
      { type: 'head', label: RP.siblingCount + ' other repositories in this window' }
    ].concat((RP.siblings || []).map(function (n) {
      return { value: 'sibling', label: n, hint: 'switch' };
    }));

    var ownerOf = {};
    S.worktrees.forEach(function (w) { ownerOf[w.branch] = w; });

    var branchOpts = S.branchList.map(function (x) {
      var own = ownerOf[x.name], locked = own && own.lockedBy;
      return {
        value: x.name, label: x.name, hint: aheadBehind(x.ahead, x.behind),
        disabled: !!locked,
        reason: locked ? own.lockReason : '',
        sentence: locked
          ? 'Locked by ' + own.lockedBy + '. The branch opens read-only until the lane releases it.'
          : ''
      };
    });

    var wtItems = [{ type: 'head', label: parallel + ' parallel contexts' }];
    S.worktrees.forEach(function (w) {
      wtItems.push({ value: w.branch, label: w.branch,
        hint: w.owner + (w.run ? ' / run ' + w.run : '') });
    });

    var head = K.head('Source Control',
      b >= 2 ? changed + ' changed ' + DOT + ' ' + S.counts.worktrees + ' worktrees'
             : String(changed),
      K.overflow([
        { value: 'review', label: 'Open Review Mode' },
        { value: 'pr', label: 'Create pull request' },
        { value: 'merge', label: 'Merge pull request', disabled: true,
          reason: 'pr_open', sentence: 'No open pull request for this branch.' },
        { type: 'sep' },
        { value: 'generated', label: 'Show generated files' },
        { value: 'stale', label: 'Hide stale worktrees' },
        { type: 'sep' },
        { value: 'actions', label: 'Open in GitHub Actions' }
      ], 'Source Control actions'));

    var s1 = K.strip(
      K.select(P.branch, branchOpts, { style: 'flex:1 1 auto;min-width:0' }) +
      textMenu('+' + parallel,
        parallel + ' parallel worktree contexts - open the drilldown', wtItems) +
      K.overflow(repoIdent.concat([
        { type: 'sep' },
        { value: 'switch', label: 'Switch worktree' },
        { value: 'create', label: 'New worktree' },
        { type: 'sep' },
        { value: 'remote_state',
          label: 'Remote: ' + S.remote.freshness + ', ' + S.remote.health }
      ]), RP.nameWithOwner + ' on ' + RP.host));

    var s2 = b >= 1 ? K.strip(
      '<span class="pmk-btnrow vA-grow">' +
      K.btn('Pull', { tip: 'Pull ' + S.remote.incoming + ' incoming commits' }) +
      K.btn('Push', { tip: 'Push ' + S.remote.outgoing + ' outgoing commits' }) +
      K.btn('Fetch', { tip: 'Fetch from the remote' }) +
      '</span><span class="pmk-tail">' + E(S.remote.outgoing + ' out') + '</span>') : '';

    /* ---- Changes ---- */
    function fileRow(f, group, status) {
      var parts = f.path.split('/'), base = parts.pop(), dir = parts.join('/');
      var staged = group === 'staged';
      return lrow(C, {
        status: status, id: base, key: f.path,
        meta: (b >= 2 ? [] : [group]).concat([f.code,
          K.elide(dir, 'path', b >= 2 ? 24 : 16)]),
        chip: group, chipTone: staged ? 'ok' : 'warn',
        inline: [
          [staged ? 'x' : 'plus', staged ? 'Unstage this file' : 'Stage this file'],
          ['ext', 'Open diff']
        ],
        actions: [
          { value: 'diff', label: 'Open diff', hint: f.path },
          { value: staged ? 'unstage' : 'stage', label: staged ? 'Unstage' : 'Stage' },
          { type: 'sep' },
          /* The hint used to PROMISE a confirmation that did not exist. Now
             the sentence is the confirmation's own body, and the numbers in
             it are the file's own add/del counts - a gate that says "are you
             sure" and nothing else is a speed bump, not a scope statement. */
          strong('discard', 'Discard changes',
            'Discards ' + f.add + ' added and ' + f.del + ' removed lines in ' +
            f.path + '. The file returns to its last committed state and the ' +
            'change cannot be recovered.',
            { hint: 'Cannot be undone' })
        ]
      });
    }

    var changes = sec(C, {
      label: 'Changes', count: String(changed), open: true,
      more: [
        { value: 'stage_all', label: 'Stage all' },
        { value: 'unstage_all', label: 'Unstage all' },
        { type: 'sep' },
        strong('discard_all', 'Discard all changes',
          'Discards every uncommitted change in ' + RP.nameWithOwner + ': ' +
          S.counts.staged + ' staged and ' + S.counts.unstaged + ' unstaged files, ' +
          S.counts.conflicts + ' of them conflicted. None of it is recoverable ' +
          'afterwards, and worktrees on other branches are not affected.'),
        { type: 'sep' },
        { value: 'generated', label: 'Toggle generated-file filter' }
      ],
      sort: [
        { value: 'group', label: 'Group by staged / unstaged' },
        { value: 'path', label: 'Sort by path' },
        { value: 'status', label: 'Sort by status' }
      ],
      filter: 'Filter changes'
    });
    S.staged.forEach(function (f) { changes += fileRow(f, 'staged', 'ok'); });
    S.unstaged.forEach(function (f) { changes += fileRow(f, 'unstaged', 'attention'); });
    changes += '<div class="vA-composer">' +
      grow(field(S.commitDraft, 'Commit message')) +
      K.btn('Commit', { primary: true,
        tip: 'Commit ' + S.counts.staged + ' staged files' }) +
      K.overflow([
        { value: 'generate', label: 'Generate commit message' },
        { value: 'batches', label: 'Suggest commit batches',
          hint: 'Advisory - nothing is canonical until you commit' },
        { type: 'sep' },
        { value: 'amend', label: 'Amend last commit', disabled: true,
          reason: 'commit_amend_unspecified',
          sentence: 'No canonical command id exists for amend or sign-off yet.' }
      ], 'Composer actions') + '</div>';

    /* ---- Worktrees ---- */
    var worktrees = sec(C, {
      label: 'Worktrees', count: String(S.counts.worktrees), open: true,
      more: [
        { value: 'unpin', label: 'Unpin this section' },
        { value: 'create', label: 'New worktree' },
        { type: 'sep' },
        { type: 'head', label: 'Filter' },
        { value: 'all', label: 'All' },
        { value: 'threads', label: 'Threads' },
        { value: 'orch', label: 'Orchestrator' },
        { value: 'manual', label: 'Manual' }
      ], moreTip: 'Worktree section actions',
      sort: [
        { value: 'recent', label: 'Sort by last change' },
        { value: 'branch', label: 'Sort by branch' },
        { value: 'stale', label: 'Collapse stale worktrees' }
      ],
      filter: 'Filter worktrees'
    });
    S.worktrees.forEach(function (w) {
      var sc = stateChip(w.status);
      var life = lifeOf(w);
      worktrees += lrow(C, {
        status: w.status, id: w.branch, idKind: 'path',
        /* no tail: a worktree has no timestamp, and an ahead count in the
           tail slot reads as a second "+N" next to the meta escape */
        meta: [w.owner, w.run ? 'run ' + w.run : null, aheadBehind(w.ahead, 0),
               w.dirty ? 'dirty' : null, 'base ' + w.base],
        chip: sc.chip, chipTone: sc.tone,
        inline: [['ext', 'Open files'], ['branch', 'Compare with ' + w.base]],
        actions: [
          { value: 'open', label: 'Open', hint: w.path },
          { value: 'open_files', label: 'Open Files' },
          { value: 'compare', label: 'Compare' },
          { value: 'lineage', label: 'Focus lineage' },
          { value: w.kind === 'orch' ? 'lane' : 'thread',
            label: w.kind === 'orch' ? 'Open Lane' : 'Open Thread' },
          { type: 'sep' },
          { value: 'reuse', label: 'Reuse', disabled: !!w.lockedBy,
            reason: w.lockedBy ? w.lockReason : '',
            sentence: w.lockedBy ? 'Owned by ' + w.lockedBy + '.' : '' },
          { value: 'release', label: 'Release', disabled: !!w.lockedBy,
            reason: w.lockedBy ? w.lockReason : '',
            sentence: w.lockedBy ? 'Owned by ' + w.lockedBy + '.' : '' },
          { value: 'request_prune', label: 'Request prune' },
          /* Disabled and gated are different states and this row can be
             either. Locked or dirty, the item stays visible and carries the
             fixture's reason code; live, it carries the consequence, and the
             sheet names the PATH the removal lands on rather than the branch
             label, because two worktrees can sit on sibling paths. */
          (w.lockedBy || w.dirty)
            ? { value: 'remove', label: 'Remove worktree', danger: true, disabled: true,
                reason: w.lockedBy ? w.lockReason : 'dirty_worktree',
                sentence: w.lockedBy
                  ? 'Owned by ' + w.lockedBy + '; Remove unlocks when the lane releases it.'
                  : 'The worktree has uncommitted changes.' }
            : strong('remove', 'Remove worktree',
                'Removes the worktree at ' + (w.path || 'no path on disk') +
                ' for branch ' + w.branch + ', lifecycle ' + w.lifecycle +
                '. The checkout on disk is deleted; the branch and its commits stay.')
        ]
      });
      /* One notice per worktree, and the LIFECYCLE owns it when there is one:
         its sentence already states the lock in the fixture's own words
         ("Kept for the blocked episode on run #46. Release it explicitly
          before pruning."), and the lock's reason code is still rendered
         verbatim on the disabled Reuse / Release / Remove items above. The
         label is what was missing - the panel had no `Lifecycle` anywhere. */
      if (life) {
        worktrees += kvs([K.kv('Lifecycle', w.lifecycle, 'token', b)]) +
          K.blocked({
            code: life.code, sentence: life.sentence,
            actions: w.lockedBy
              ? [{ label: 'Open Lane' }, { label: 'Focus lineage' },
                 { label: 'Request prune' }]
              : []
          });
      } else if (w.lockedBy) {
        worktrees += K.blocked({
          code: w.lockReason,
          sentence: 'Locked by ' + w.lockedBy +
            '. Remove, prune and reuse stay disabled until the lane releases it.',
          actions: [{ label: 'Open Lane' }, { label: 'Focus lineage' },
                    { label: 'Request prune' }]
        });
      }
    });

    /* ---- History ---- */
    var history = sec(C, {
      label: 'History', count: String(S.counts.commits), open: true,
      more: [
        { value: 'review', label: 'Open Review Mode' },
        { value: 'older', label: 'Load older commits' }
      ],
      sort: [
        { value: 'date', label: 'Sort by date' },
        { value: 'author', label: 'Group by author' }
      ],
      filter: 'Filter commits'
    });
    S.history.forEach(function (c) {
      history += lrow(C, {
        status: 'ok', id: c.subject, meta: [c.sha, c.who], tail: c.when,
        inline: [['ext', 'Open commit ' + c.sha], ['branch', 'Set as compare target']],
        actions: [
          { value: 'open', label: 'Open commit', hint: c.sha },
          { value: 'compare', label: 'Set compare target' },
          { value: 'review', label: 'Open Review Mode' },
          { type: 'sep' },
          { value: 'copy', label: 'Copy sha' }
        ]
      });
    });

    /* ---- Graph: default-collapsed, and never the only path to the data.
            Its overflow routes to the list equivalent below. ---- */
    var graph = sec(C, {
      label: 'Graph', count: String(S.counts.branches), open: false,
      more: [
        { value: 'focus', label: 'Focus this worktree' },
        { value: 'filter', label: 'Filter graph' },
        { value: 'layout', label: 'Change layout' },
        { type: 'sep' },
        { value: 'list', label: 'Open list equivalent',
          hint: 'Branches and Stash carries the same lineage as rows' }
      ], moreTip: 'Graph actions'
    });

    /* ---- Branches and Stash ---- */
    var branches = sec(C, {
      label: 'Branches & Stash',
      count: S.counts.branches + '/' + S.counts.stash, open: true,
      more: [
        { value: 'create', label: 'New branch' },
        { value: 'stash', label: 'Stash changes' },
        { type: 'sep' },
        strong('prune', 'Prune merged branches',
          'Deletes every local branch already merged into ' + RP.defaultBranch +
          ' in ' + RP.nameWithOwner + '. ' + S.counts.branches + ' branches are ' +
          'listed here and ' + S.counts.worktrees + ' worktrees hold one each; a ' +
          'branch a worktree owns is kept. Deleted tips are not recoverable from ' +
          'this panel.')
      ],
      sort: [
        { value: 'name', label: 'Sort by name' },
        { value: 'recent', label: 'Sort by last commit' },
        { value: 'owner', label: 'Group by owning worktree' }
      ],
      filter: 'Filter branches'
    });
    S.branchList.forEach(function (x) {
      var own = ownerOf[x.name];
      var st = own ? own.status : (x.current ? 'ok' : 'queued');
      var sc = stateChip(st);
      var locked = !!(own && own.lockedBy);
      branches += lrow(C, {
        status: st, id: x.name, idKind: 'path',
        meta: [x.current ? 'current' : null, aheadBehind(x.ahead, x.behind),
               own ? own.owner : null],
        chip: sc.chip, chipTone: sc.tone,
        inline: [
          ['branch', locked ? 'Switch is read-only: owned by ' + own.lockedBy
                            : 'Switch to this branch', locked],
          ['ext', 'Compare with ' + P.branch]
        ],
        actions: [
          { value: 'switch', label: 'Switch', disabled: locked,
            reason: locked ? own.lockReason : '',
            sentence: locked
              ? 'Owned by ' + own.lockedBy + '; the branch opens read-only.' : '' },
          { value: 'compare', label: 'Compare' },
          { value: 'pr', label: 'Create pull request' }
        ]
      });
    });
    S.stash.forEach(function (s) {
      branches += lrow(C, {
        status: 'stale', id: s.label, meta: ['stash'], tail: s.when,
        inline: [['play', 'Apply this stash'], ['plus', 'Pop this stash']],
        actions: [
          { value: 'apply', label: 'Apply' },
          { value: 'pop', label: 'Pop' },
          { type: 'sep' },
          strong('drop', 'Drop stash',
            'Drops the stash saved ' + s.when + ' ago: ' + s.label +
            '. A dropped stash is not listed anywhere afterwards and cannot be ' +
            'applied again.')
        ]
      });
    });

    /* ---- Repository: identity as receipts, first in the scroller ----
       It leads because it is the frame every section under it is stated in,
       and because the failure this closes is acting on the wrong repository -
       which is a mistake you make BEFORE you read the list, not after. One
       row per repository, the ledger's own idiom, so the width ladder and the
       elision policy apply to it for free. The siblings are real rows rather
       than a count: siblingCount says two, and a count you cannot open is
       still an assumption that this repo is the only one that matters.
       Below 320px only the current repository renders, and the siblings stay
       one tap away in the strip menu, which is the same rule the Available
       registry in Agents already follows. */
    var repo = sec(C, {
      label: 'Repository', count: String(RP.siblingCount + 1), open: true,
      more: repoIdent.concat([
        { type: 'sep' },
        { value: 'open', label: 'Open on ' + RP.host },
        { value: 'copy_remote', label: 'Copy remote URL' }
      ]), moreTip: 'Repository actions'
    });
    repo += lrow(C, {
      /* No status gutter: a repository is not a live thing with a run state,
         and no token in the shared vocabulary describes one truthfully. The
         same reasoning as the Available registry rows in Agents. */
      status: null, id: RP.nameWithOwner, idKind: 'path', key: RP.nameWithOwner,
      meta: [RP.host, RP.visibility, RP.lifecycle, 'default ' + RP.defaultBranch],
      inline: [['ext', 'Open ' + RP.nameWithOwner + ' on ' + RP.host],
               ['branch', 'Copy ' + RP.remote]],
      actions: [
        { value: 'open', label: 'Open on ' + RP.host, hint: RP.nameWithOwner },
        { value: 'copy_remote', label: 'Copy remote URL', hint: RP.remote },
        { value: 'lifecycle', label: 'Lifecycle ' + RP.lifecycle },
        { value: 'visibility', label: 'Visibility ' + RP.visibility }
      ]
    });
    if (b >= 1) {
      repo += kvs([K.kv('Remote', RP.remote, 'measure', b)]);
      (RP.siblings || []).forEach(function (n) {
        repo += lrow(C, {
          status: null, id: n, idKind: 'path', key: n,
          meta: ['sibling repository'],
          inline: [['ext', 'Open ' + n]],
          actions: [
            { value: 'open', label: 'Open repository', hint: n },
            { value: 'switch', label: 'Switch this window to it' }
          ]
        });
      });
    }

    return shell([head, s1, s2,
      list(grp(repo) + grp(changes) + grp(worktrees) + grp(history) +
           grp(graph) + grp(branches))]);
  }

  /* =====================================================================
     GITHUB ACTIONS
     Current Branch / Workflows / Settings are STABLE SUBVIEWS (GI-008), so
     exactly one renders at a time - the current build's five stacked cards
     are the primary structural defect. PMK.lenses is the switcher and it
     portals to a picker at 240px on its own.
     The blocked banner sits OUTSIDE the scroller: GI-017 requires the code
     verbatim plus the sentence plus ordered allowed_action_ids as real
     buttons, and it is never suppressed for space.
     Run rows elide at the END OF THE NAME; run number, branch and duration
     are meta segments that drop whole.
     ===================================================================== */
  function pGit(D, state) {
    var C = ctx(D, state), b = C.b, A = D.actions;

    /* --------------------------------------------- GI-021 repository lifecycle
       GitHub_Integration.md:L1271-L1275: archived, deleted and
       historical_only disable mutation DETERMINISTICALLY, and a capability
       limit must show as effective capability state - in prose - rather than
       as a hidden control. The panel used to offer Re-run and Cancel on a
       repository the data says is archived, because it read none of
       repository.lifecycle / capabilities / mutationDisabled /
       capabilitySentence.

       Every mutation below reads the lifecycle AND its own named capability,
       because the fixture models them separately and the second canonical
       sentence ("You can dispatch but cannot manage secrets") is a state
       where they differ. Controls stay VISIBLE and disabled, each carrying
       repository.sentence as its reason.

       The gated set is exactly the mutations: re-run, re-run failed, cancel,
       dispatch, repository secrets and the two pin-set writes. Every read
       survives - Open run, View logs, Open related diff, Open related
       worktree, Compare last success, Open in browser, the status filters,
       Load older runs, both sorts and both filter fields - because a reader
       who cannot open a run to read it on an archived repository has been
       failed by the gate just as surely as one who can still re-run it.
       Over-gating and under-gating are the same defect. */
    var R = A.repository || {}, CAP = R.capabilities || {};
    var repoCode = R.lifecycle || '', repoWhy = R.sentence || '';

    /* THE GATE IS DERIVED FROM THE STATE, NOT FROM A LIST OF DEAD ONES.
       lifecycleStates carries seven values and exactly one of them is live;
       archived, deleted, historical_only, transferred, renamed_redirected and
       remote_mismatch all disable mutation. Naming the LIVE state and treating
       everything else as gated is what makes a different lifecycle value gate
       identically with no second edit here - the inverse, a list of dead
       states, is one fixture change away from silently re-enabling every
       mutating control on a repository that no longer exists.

       Reading `capabilities` alone was not enough for the same reason: that
       map is authored per fixture, so a repo flipped to 'deleted' while its
       map still said dispatch:true would have drawn a live Dispatch button.
       The map may now only ever REMOVE capability - the second canonical
       sentence, "You can dispatch but cannot manage secrets", is a LIVE repo
       with a narrowed map - and can never restore one the lifecycle took.
       mutationDisabled is honoured on its own so the flag alone suffices. */
    var LIVE_LIFECYCLE = 'active';
    var mutBlocked = R.mutationDisabled === true ||
                     (!!repoCode && repoCode !== LIVE_LIFECYCLE);
    function mut(name) { return mutBlocked || CAP[name] === false; }

    /* The code that gets printed verbatim wherever a control says why it is
       grey. mutationDisabled can arrive without a lifecycle - the flag is
       sufficient on its own - and an empty code renders an empty chip, so the
       flag names itself rather than showing a blank. */
    var repoTag = repoCode || (mutBlocked ? 'mutation_disabled' : '');

    var noRerun = mut('rerun'), noCancel = mut('cancel');
    var noDispatch = mut('dispatch'), noSecrets = mut('manage_secrets');
    /* The fixture ships no `pin` capability at all, which is precisely the
       case the derivation exists for: an unnamed mutation is still a mutation
       and is still gated by the lifecycle. Pinning writes to the repository's
       pin set, so it belongs here beside re-run and dispatch. */
    var noPin = mut('pin');

    var subs = [
      { id: 'branch', label: 'Current Branch', count: String(A.runs.length),
        available: true },
      { id: 'workflows', label: 'Workflows', count: String(A.workflows.length),
        available: true },
      { id: 'settings', label: 'Settings', count: String(A.secrets.length),
        available: true }
    ];

    var head = K.head('GitHub Actions',
      b >= 2 ? A.readiness.green + '/' + A.readiness.of + ' green ' + DOT + ' ' +
               A.readiness.branch
             : A.readiness.green + '/' + A.readiness.of,
      K.overflow([
        { value: 'refresh', label: 'Refresh observations' },
        { value: 'validate', label: 'Validate dispatch readiness' },
        /* Visible and disabled, never hidden: L1275 is explicit that a
           capability limit is not a reason to remove the control. */
        { value: 'dispatch', label: 'Dispatch workflow', disabled: noDispatch,
          reason: noDispatch ? repoTag : '', sentence: noDispatch ? repoWhy : '' },
        { value: 'secrets', label: 'Edit repository secrets', disabled: noSecrets,
          reason: noSecrets ? repoTag : '', sentence: noSecrets ? repoWhy : '' },
        { type: 'sep' },
        { value: 'browser', label: 'Open in browser' },
        { value: 'settings', label: 'Open Actions settings' },
        { type: 'sep' },
        /* The scope of a disconnect is the ACCOUNT, not the repository - and
           this panel's repository is not the one Source Control is showing,
           which is precisely the multi-repo context L397 is about. So the
           sentence names the account first and the repository only as the one
           it is currently effective for. */
        strong('disconnect', 'Disconnect GitHub account',
          'Disconnects the GitHub account ' + A.connection.effective +
          ', currently effective for ' + R.nameWithOwner +
          '. Every GitHub surface in this window stops updating - ' +
          A.runs.length + ' runs, ' + A.workflows.length + ' workflows and ' +
          A.secrets.length + ' repository secrets become unreadable until an ' +
          'account is reconnected.')
      ], 'GitHub Actions'));

    var missing = 'missing ' + A.connection.missingScopes.join(', ');

    var s1 = K.strip(
      textMenu(A.connection.effective,
        'Effective account ' + A.connection.effective + ', requested ' +
          A.connection.requested,
        [
          { type: 'head', label: 'Scopes' },
          { value: 'scopes', label: A.connection.scopes.join(', ') },
          { value: 'missing', label: missing, disabled: true,
            reason: A.connection.blocked.code,
            sentence: A.connection.blocked.sentence },
          { type: 'sep' },
          { value: 'reconnect', label: 'Reconnect' },
          strong('disconnect', 'Disconnect account',
            'Disconnects the GitHub account ' + A.connection.effective +
            ', effective for ' + R.nameWithOwner + ' and requested as ' +
            A.connection.requested + '. Scopes ' + A.connection.scopes.join(', ') +
            ' are surrendered and every GitHub surface in this window stops ' +
            'updating until an account is reconnected.')
        ]) +
      grow('') +
      (b >= 1 ? '<span class="pmk-tail">' + E(missing) + '</span>' : '') +
      K.overflow([
        { value: 'connect', label: 'Connect a different account' },
        { value: 'requested', label: 'Requested vs effective' }
      ], 'Account'));

    var s2 = K.strip(K.lenses(subs, 'branch', b, 'GitHub Actions subview'));

    /* ------------------------------- the capability sentence, AS PROSE
       GI-021 requires that a capability limit show as effective capability
       state IN WORDS, not as an inference from which buttons happen to be
       grey - and it is the one thing v0 does that all six redesigns dropped,
       which the audit scores as an introduced regression.

       It lives in the panel's FIXED region beside the connection banner
       rather than inside the Readiness section, where it used to sit. That
       section is collapsible and scrolls with the list, and a sentence the
       reader can fold away is not a statement of capability - it is a note.
       Rendered off the derived gate, so every non-live lifecycle states its
       own capability without another edit. */
    var repoBanner = mutBlocked
      ? K.blocked({ code: repoTag,
                    sentence: R.capabilitySentence || repoWhy })
      : '';
    var banner = K.blocked(A.connection.blocked);

    /* ---- Current Branch subview ---- */
    var readiness = sec(C, {
      label: 'Readiness', count: A.readiness.green + '/' + A.readiness.of, open: true,
      more: [
        { value: 'validate', label: 'Validate dispatch readiness' },
        { value: 'refresh', label: 'Refresh observations' }
      ], moreTip: 'Readiness actions'
    }) +
      kvs([
      K.kv('Repository', R.nameWithOwner, 'measure', b),
      K.kv('Lifecycle', repoCode, 'token', b),
      K.kv('Branch', A.readiness.branch, 'token', b),
      K.kv('Checks', A.readiness.green + ' of ' + A.readiness.of, 'token', b),
      K.kv('Observed', A.readiness.snapshot + ', ' + A.readiness.age, 'measure', b)
    ]);

    function runRow(r, badge) {
      var sc = stateChip(r.status);
      var isBlocked = r.status === 'blocked';
      return lrow(C, {
        status: r.status, id: r.name,
        meta: [r.run, r.branch, badge || (r.dur && r.dur !== '--' ? r.dur : null)],
        tail: r.age, chip: sc.chip, chipTone: sc.tone,
        /* The repository capability outranks the row's own state: an archived
           repo cannot re-run a green run either, and saying so with the run's
           reason code would be the wrong answer to the right question. */
        inline: [
          ['refresh', noRerun ? repoWhy
                    : isBlocked ? 'Rerun is blocked: ' + r.blocked.code
                                : 'Rerun this run', noRerun || isBlocked],
          ['ext', 'Open run in browser']
        ],
        actions: [
          { value: 'open', label: 'Open run', hint: r.run + ' on ' + r.branch },
          { value: 'logs', label: 'View logs' },
          { value: 'rerun', label: 'Rerun', disabled: noRerun || isBlocked,
            reason: noRerun ? repoTag : (isBlocked ? r.blocked.code : ''),
            sentence: noRerun ? repoWhy : (isBlocked ? r.blocked.sentence : '') },
          { value: 'rerun_failed', label: 'Rerun failed jobs',
            disabled: noRerun || r.status !== 'failed',
            reason: noRerun ? repoTag
                  : (r.status !== 'failed' ? 'has_failed_jobs' : ''),
            sentence: noRerun ? repoWhy
                    : (r.status !== 'failed' ? 'This run has no failed jobs.' : '') },
          (noCancel || r.status !== 'running')
            ? { value: 'cancel', label: 'Cancel run', danger: true, disabled: true,
                reason: noCancel ? repoTag : 'run_in_progress',
                sentence: noCancel ? repoWhy
                        : 'Only a run in progress can be cancelled.' }
            : strong('cancel', 'Cancel run',
                'Cancels run ' + r.run + ' of ' + r.name + ' on ' + r.branch +
                ' in ' + R.nameWithOwner + '. Jobs still in flight stop where ' +
                'they are, the run records a cancelled result, and it cannot be ' +
                'resumed - only started again as a new run.'),
          { type: 'sep' },
          { value: 'diff', label: 'Open related diff' },
          { value: 'worktree', label: 'Open related worktree' },
          { value: 'compare', label: 'Compare last success' },
          { value: 'browser', label: 'Open in browser' }
        ]
      });
    }

    var pinned = sec(C, {
      label: 'Pinned', count: String(A.pinned.length), open: true,
      /* Pinning writes to the repository, so both of these are mutations and
         both were live on an archived repo until this pass. Sorting and
         filtering the same list are reads and stay enabled. */
      more: [
        { value: 'manage', label: 'Manage pins', disabled: noPin,
          reason: noPin ? repoTag : '', sentence: noPin ? repoWhy : '' },
        { value: 'stale', label: 'Clear stale pins', disabled: noPin,
          reason: noPin ? repoTag : '', sentence: noPin ? repoWhy : '' }
      ], moreTip: 'Pin actions',
      sort: [
        { value: 'health', label: 'Sort by health' },
        { value: 'name', label: 'Sort by name' }
      ],
      filter: 'Filter pinned'
    });
    A.pinned.forEach(function (r) { pinned += runRow(r, r.badge); });

    var runs = sec(C, {
      label: 'Runs', count: String(A.runs.length), open: true,
      more: [
        { value: 'older', label: 'Load older runs' },
        { type: 'sep' },
        { type: 'head', label: 'Status filter' },
        { value: 'all', label: 'All' },
        { value: 'failed', label: 'Failed' },
        { value: 'running', label: 'Running' },
        { value: 'success', label: 'Success' }
      ], moreTip: 'Run list actions',
      sort: [
        { value: 'recent', label: 'Sort by most recent' },
        { value: 'branch', label: 'Group by branch' }
      ],
      filter: 'Filter runs'
    });
    A.runs.forEach(function (r) {
      runs += runRow(r);
      if (r.triage) {
        var tg = r.triage;
        var pathMax = Math.max(10, Math.floor((C.w - 32) / PX_MONO));
        runs += '<div class="vA-triage">' +
          '<div class="vA-log">' + E(tg.job + ' > ' + tg.step) + '</div>' +
          (b >= 2 ? tg.lines.map(function (l) {
            return '<div class="vA-log">' + E(l) + '</div>';
          }).join('') : '') +
          /* REGRESSION VS v0, closed. changedFiles, changedCount and
             likelyNext ride on all four triage blocks; the shipped panel
             renders them and every redesign in the bakeoff dropped them, so
             whatever wins Actions was shipping a triage capsule worse than
             the one users already have. The count states itself at every
             width; the paths arrive from 320px and are elided BY KIND, so the
             basename - the only part that identifies a file - survives; the
             sentence WRAPS, because a truncated instruction is worse than no
             instruction. */
          '<div class="vA-k">' + E(tg.changedCount +
            (tg.changedCount === 1 ? ' changed file' : ' changed files')) + '</div>' +
          (b >= 1 ? tg.changedFiles.map(function (p) {
            return '<div class="vA-log">' + E(K.elide(p, 'path', pathMax)) + '</div>';
          }).join('') : '') +
          '<div class="vA-next">' + E(tg.likelyNext) + '</div>' +
          '<div class="pmk-acts">' +
          K.btn('Rerun failed jobs', { disabled: noRerun,
            tip: noRerun ? repoWhy : 'Rerun only the failed jobs in ' +
              r.run + ', touching ' + tg.changedCount + ' changed files' }) +
          (b >= 2 ? K.btn('Compare last success',
            { tip: 'Compare with the last green run' }) : '') +
          '</div>' +
          /* WHY the text button beside this log is grey, on screen. Everywhere
             else in this panel a disabled control is a menu item, and the menu
             renders its own reason line; a bare button has no such slot, and a
             data-pm-tip - though never a native title - still only speaks on
             hover. GI-017 and GAAAF-005 both want the reason visible, so it is
             printed. Kit classes, no new CSS, and it wraps rather than
             truncating so no width can hide it. */
          (noRerun ? '<div class="pmk-blocked-say">' +
            '<span class="pmk-blocked-code">' + E(repoTag) + '</span> ' +
            E(repoWhy) + '</div>' : '') +
          '</div>';
      }
      if (r.blocked) runs += K.blocked(r.blocked);
    });

    return shell([head, s1, s2, repoBanner, banner,
      list(grp(readiness) + grp(pinned) + grp(runs))]);
  }

  /* =====================================================================
     DOCKER MANAGER
     Eleven canonical subviews (CRAU-007; the fixture carries ten, with
     Docker Hub nested under Registries as the spec requires). 11 x 24px =
     264px against a 224px band, so a chip strip is arithmetically
     impossible at 240px - and still impossible at 320px, where ten items at
     the kit's 56px lens floor need 560px against 304px. So the switcher is
     a portaled picker below 360px and a lens strip above. Unsupported
     subviews stay VISIBLE with their reason code and sentence attached, in
     the picker AND as a collapsed section in the list.
     Filter-first is mandatory, so the filter strip is never dropped.
     Container rows elide the image with PMK.elide(ref,'image',n), which
     keeps the tag: a tail-elided image ref loses the one token that
     differentiates two builds of the same repository.
     ===================================================================== */
  function pDocker(D, state) {
    var C = ctx(D, state), b = C.b, X = D.docker;
    var active = 'containers', cur = null;
    X.subviews.forEach(function (s) { if (s.id === active) cur = s; });

    var picker = b >= 2
      ? K.lenses(X.subviews, active, b, 'Docker subview')
      : K.select(active, X.subviews.map(function (i) {
          return {
            value: i.id, label: i.label + (i.count ? '  ' + i.count : ''),
            disabled: i.available === false, reason: i.reason, sentence: i.sentence
          };
        }), { style: 'flex:1 1 auto;min-width:0' });

    var head = K.head('Docker Manager',
      b >= 2 ? cur.label + ' ' + DOT + ' ' + cur.count : cur.count,
      K.overflow([
        { value: 'hosts', label: 'Docker / Hosts' },
        { value: 'cleanup', label: 'Cleanup advisor' },
        { value: 'drift', label: 'Compare drift' },
        { type: 'sep' },
        { value: 'advanced', label: 'Show advanced subviews' },
        { value: 'explain', label: 'Explain this state' }
      ], 'Docker Manager'));

    var s1 = K.strip(
      K.statusMark(X.runtime.state === 'ok' ? 'ok' : 'attention') +
      '<span class="vA-grow pmk-1 pmk-note">' +
      E(X.runtime.engine + ' ' + DOT + ' ' + X.runtime.context) + '</span>' +
      K.chip(X.runtime.detected ? 'detected' : 'not_detected', 'ok') +
      K.overflow([
        { type: 'head', label: 'Context' },
        { value: 'default', label: X.runtime.context },
        { type: 'sep' },
        { value: 'refresh', label: 'Refresh remote state' },
        { value: 'explain', label: 'Explain this state' }
      ], 'Runtime context'));

    var s2 = K.strip(picker);

    var s3 = K.strip(
      grow(K.filter('Filter ' + cur.label.toLowerCase())) +
      K.btn('Compose up', { primary: true,
        tip: 'Start the ' + X.compose.project + ' compose project from ' + X.compose.file }));

    function containerRow(c) {
      var sc = stateChip(c.status);
      var noUrl = !c.url;
      return lrow(C, {
        status: c.status, id: c.name,
        /* the image is elided by KIND, not by tail cut: jared/tasteb...:v1.1
           keeps the tag, which is what tells two builds of one repo apart */
        meta: [
          [c.image, 'image'],
          c.ports ? 'port ' + c.ports : null,
          c.detail || null
        ],
        tail: c.age, chip: sc.chip, chipTone: sc.tone,
        inline: [
          ['bar', 'View logs for ' + c.name],
          ['ext', noUrl ? 'No direct access URL detected' : 'Open ' + c.url, noUrl]
        ],
        actions: [
          { value: 'logs', label: 'Logs' },
          { value: 'open', label: 'Open', disabled: noUrl,
            reason: noUrl ? 'access_url_unresolved' : '',
            sentence: noUrl ? 'No direct access URL detected' : '' },
          { value: 'start', label: 'Start', disabled: c.status === 'running',
            reason: c.status === 'running' ? 'container_stopped' : '',
            sentence: c.status === 'running'
              ? 'The container is already running.' : '' },
          { value: 'stop', label: 'Stop' },
          { value: 'restart', label: 'Restart' },
          { type: 'sep' },
          { value: 'shell', label: 'Attach shell',
            hint: 'Audited privileged session' },
          { value: 'stats', label: 'Stats' },
          { value: 'inspect', label: 'Inspect' },
          { type: 'sep' },
          strong('delete', 'Delete container',
            'Deletes the container ' + c.name + ' from ' + X.runtime.engine +
            ' context ' + X.runtime.context + ' on host ' + X.runtime.host +
            '. It has been ' + c.status + ' for ' + c.age + '. The container and ' +
            'its writable layer go; the image ' + c.image + ' stays, and so do ' +
            'named volumes.')
        ]
      });
    }

    var groups = [
      { token: 'running', label: 'Running' },
      { token: 'attention', label: 'Needs attention' },
      { token: 'failed', label: 'Failed' }
    ];
    var body = '';
    groups.forEach(function (g) {
      var rows = X.containers.filter(function (c) { return c.status === g.token; });
      if (!rows.length) return;
      var h = sec(C, {
        label: g.label, count: String(rows.length), open: true,
        more: [
          { value: 'stop_all', label: 'Stop all in this group' },
          { value: 'logs_all', label: 'Open combined logs' },
          { type: 'sep' },
          /* The scope is 16 containers in the Running group, and a sheet that
             lists all sixteen names is a scroll, not a scope statement. Name
             the first three - enough to recognise WHICH group is meant - and
             count the rest. The count is the load-bearing number. */
          strong('prune', 'Prune containers',
            'Prunes the ' + rows.length + ' containers in the ' + g.label +
            ' group on ' + X.runtime.engine + ' context ' + X.runtime.context +
            ', beginning with ' + rows.slice(0, 3).map(function (c) {
              return c.name;
            }).join(', ') + (rows.length > 3 ? ' and ' + (rows.length - 3) +
            ' more' : '') + '. Each is deleted with its writable layer and its ' +
            'logs; images, named volumes and the other groups in this panel are ' +
            'untouched.')
        ], moreTip: g.label + ' actions',
        sort: [
          { value: 'name', label: 'Sort by name' },
          { value: 'age', label: 'Sort by uptime' },
          { value: 'image', label: 'Group by image' }
        ],
        filter: 'Filter ' + g.label.toLowerCase()
      });
      rows.forEach(function (c) { h += containerRow(c); });
      body += grp(h);
    });

    /* CRAU-009: hide only when truly unavailable. Otherwise the subview stays
       visible with its exact disabled reason, here and in the picker. */
    X.subviews.forEach(function (s) {
      if (s.available !== false) return;
      body += grp(sec(C, { label: s.label, count: 'unavailable', open: false }) +
        K.blocked({
          code: s.reason, sentence: s.sentence,
          actions: [{ label: 'Open Settings' }, { label: 'Explain this state' }]
        }));
    });

    return shell([head, s1, s2, s3, list(body)]);
  }

  /* =====================================================================
     TESTING
     All five contractual regions render, in the spec's own order: run_list,
     active_run_detail, failure_list, artifact_preview, redaction_notice -
     with redaction ABOVE the preview, because it is a display gate, not a
     footnote, and it carries no dismiss control.
     Enablement is PER ADAPTER, so the capability families are rows with
     their own state and their own blocked payload, not one global boolean.
     ===================================================================== */
  function pTests(D, state) {
    var C = ctx(D, state), b = C.b, T = D.tests, A = T.active;
    var aSc = stateChip(A.status);

    /* ------------------------------------------------------ the redaction gate
       Automated_Testing_System.md:L83-L98: a redaction failure BLOCKS display
       and persistence until it is resolved or EXPLICITLY authorized. The gate
       exists for the failure case, and this panel used to hard-code
       code:'redaction_clean' over run 209 - whose redaction failed on 2 of 6
       fields - and then render the artifacts anyway. A clean assertion over a
       failed run, followed by the very preview the failure forbids.

       Three states, not two, and they are read from T.redactionStates rather
       than branched on here: `preview` is 'render' | 'placeholder' |
       'suppress', so pending holds the preview back too - it is not a slower
       clean - and a fourth state added to the fixture would change this panel
       without touching this file.

       The gate is entered from the DATA: a run in the list carrying
       redactionState 'redaction_failed'. Nothing here is dismissible, which
       every version passes by accident today; the state row says
       dismissible:false and no dismiss control is emitted, deliberately. */
    var RF = T.redactionFailed || null;
    var failedRun = null;
    T.runs.forEach(function (r) {
      if (r.redactionState === 'redaction_failed') failedRun = r;
    });
    var gated = !!(RF && failedRun);
    var want = gated ? RF.state : (T.redaction && T.redaction.state);
    var RS = null;
    (T.redactionStates || []).forEach(function (s) { if (s.id === want) RS = s; });
    var preview = RS ? RS.preview : 'render';

    /* The fixture names the authorize route, gives it a label of its own and
       marks it destructive:true / needsConfirm:true. The allowed set is
       therefore rebuilt in the FIXTURE's order with that one authored label
       supplied - PMK.blockedActions puts labelled actions first, and the
       destructive route has to stay last, where the data put it. Every other
       label is derived from its id by the kit, and every button keeps its id. */
    function redactionActions() {
      if (!gated) return [{ label: 'Inspect redaction profile' }];
      return (RF.allowedActionIds || []).map(function (id) {
        return (RF.authorize && id === RF.authorize.id)
          ? { id: id, label: RF.authorize.label } : { id: id };
      });
    }

    /* ------------------------------------------------------------- EGRESS
       An export LEAVES THE APP, so the gate states the redaction attestation
       rather than the word "export": which state the profile is in, how many
       fields it covered, and - when it failed - exactly which artifacts would
       leave unmasked and from which run. Every number here is a fixture
       field, and all of them were previously read by nobody. */
    function egressSay(what) {
      if (gated) {
        return what + ' leaves the app while redaction is ' + RF.state + '. ' +
          RF.sentence + ' ' + RF.detail + ' Exporting now carries ' +
          RF.affectedArtifacts.join(' and ') + ' out of run ' + RF.affectedRunId +
          ' with ' + RF.failed + ' of ' + RF.attempted + ' fields unmasked.';
      }
      return what + ' leaves the app. Redaction is ' + T.redaction.state + ': ' +
        T.redaction.note + '. The copy that leaves is not covered by this ' +
        'profile again.';
    }

    var head = K.head('Testing',
      b >= 2 ? T.runtime.adapter + ' ' + DOT + ' ' + T.runtime.probe : T.runtime.probe,
      K.overflow([
        { value: 'policy', label: 'Capability policy' },
        { value: 'session', label: 'Visible session controls' },
        { value: 'redaction', label: 'Inspect redaction profile' },
        { type: 'sep' },
        strong('export', 'Export bundle', egressSay('The run bundle'),
          { hint: 'Export leaves the app' })
      ], 'Testing'));

    var s1 = K.strip(
      K.statusMark(T.runtime.enabled ? 'ok' : 'disabled') +
      textMenu(T.runtime.adapter,
        'Adapter ' + T.runtime.adapter + ', capability probe ' + T.runtime.probe,
        T.policy.capabilities.map(function (c) {
          return { value: c.id, label: c.label + '  ' + c.mode,
                   disabled: c.state !== 'ok', reason: c.reason, sentence: c.sentence };
        })) +
      grow('') +
      K.btn('Run', { primary: true,
        tip: 'Run ' + T.runtime.adapter + ' for this project' }));

    /* ---- 1. run_list ---- */
    var runs = sec(C, {
      label: 'Runs', count: String(T.runs.length), open: true,
      more: [
        { value: 'older', label: 'Load older runs' },
        { value: 'receipt', label: 'Open receipt' }
      ], moreTip: 'Run list actions',
      sort: [
        { value: 'recent', label: 'Sort by most recent' },
        { value: 'adapter', label: 'Group by adapter' }
      ],
      filter: 'Filter runs'
    });
    T.runs.forEach(function (r) {
      var sc = stateChip(r.status);
      var live = r.status === 'running' || r.status === 'queued';
      runs += lrow(C, {
        status: r.status, id: r.name, idKind: 'path', key: 'run ' + r.id,
        /* The run whose redaction failed says so on its own row, verbatim, so
           the gate below is attributable to a run rather than to the panel. */
        meta: ['run ' + r.id, r.redactionState || null],
        tail: r.when, chip: sc.chip, chipTone: sc.tone,
        inline: [
          ['play', live ? 'Watch this run' : 'Open receipt'],
          ['ext', 'Open run detail']
        ],
        actions: [
          { value: 'watch', label: 'Watch', disabled: !live,
            reason: !live ? 'run_status_queued_or_running' : '',
            sentence: !live ? 'Only a queued or running test can be watched.' : '' },
          live
            ? strong('cancel', 'Cancel run',
                'Cancels run ' + r.id + ', ' + r.name + ', which is ' + r.status +
                ' as of ' + r.when + '. Tests still executing stop where they ' +
                'are, the run records a cancelled result, and it cannot be ' +
                'resumed - only started again as a new run.')
            : { value: 'cancel', label: 'Cancel run', danger: true, disabled: true,
                reason: 'run_status_queued_or_running',
                sentence: 'This run has already reached a terminal state.' },
          { value: 'receipt', label: 'Open receipt', disabled: live,
            reason: live ? 'run_status_terminal' : '',
            sentence: live
              ? 'The receipt opens once the run reaches a terminal state.' : '' },
          { type: 'sep' },
          strong('export', 'Export bundle',
            egressSay('The bundle for run ' + r.id + ', ' + r.name + ','))
        ]
      });
    });

    /* ---- 2. active_run_detail ---- */
    var detail = sec(C, {
      label: 'Active run', count: A.retry, open: true,
      more: [
        { value: 'receipt', label: 'Open receipt' },
        { value: 'export', label: 'Export bundle' }
      ], moreTip: 'Active run actions'
    });
    /* The active run is the one thing in this panel that is genuinely in
       flight, so its cancel says what is lost: the tests already executed and
       the retry budget, which is the fixture's own "2 of 2". */
    var cancelSay = 'Cancels the active run ' + A.name + ' on ' + A.lane +
      ', retry ' + A.retry + ', ' + A.elapsed + ' elapsed. ' + A.done + ' of ' +
      A.total + ' tests have run, ' + A.passed + ' passed and ' + A.failed +
      ' failed; the result is recorded as cancelled and the remaining ' +
      (A.total - A.done) + ' are not run.';
    detail += lrow(C, {
      status: A.status, id: A.name, idKind: 'path', key: A.name + ' on ' + A.lane,
      meta: [A.lane, 'retry ' + A.retry], tail: A.elapsed,
      chip: aSc.chip, chipTone: aSc.tone,
      inline: [['play', 'Watch this run'],
               ['stop', 'Cancel this run', false, cancelSay, 'Cancel run']],
      actions: [
        { value: 'watch', label: 'Watch' },
        strong('cancel', 'Cancel run', cancelSay)
      ]
    });
    detail += kvs([
      K.kv('Progress', A.done + ' / ' + A.total, 'token', b),
      K.kv('Passed', String(A.passed), 'token', b),
      K.kv('Failed', String(A.failed), 'token', b),
      K.kv('Skipped', String(A.skipped), 'token', b)
    ]);
    /* Contextual pair at 240/320; never four buttons in a 224px band. */
    /* The Cancel BUTTON is gated too, and it keeps its one-word label so the
       four-button row is exactly as wide as it was: the gate is two
       attributes, and the sheet's own heading carries the long form. */
    detail += btnrow(b >= 2 ? [
      K.btn('Watch', { tip: 'Watch the live run' }),
      dbtn('Cancel', cancelSay, { act: 'Cancel run',
        tip: 'Cancel and record status cancelled' }),
      K.btn('Receipt', { disabled: true,
        tip: 'Enabled when the run reaches a terminal state' }),
      K.btn('Export', { disabled: true,
        tip: 'Enabled when log or visual artifacts exist' })
    ] : [
      K.btn('Watch', { tip: 'Watch the live run' }),
      dbtn('Cancel', cancelSay, { act: 'Cancel run',
        tip: 'Cancel and record status cancelled' })
    ]);

    /* ---- 3. failure_list ---- */
    var failures = sec(C, {
      label: 'Failures', count: String(T.failures.length), open: true,
      more: [{ value: 'rerun', label: 'Rerun failed tests' }],
      moreTip: 'Failure list actions',
      sort: [{ value: 'name', label: 'Sort by test' }],
      filter: 'Filter failures'
    });
    T.failures.forEach(function (f) {
      failures += lrow(C, {
        /* no chip: the gutter and the section name already say "failed", and
           the assertion text needs every pixel of line 2 it can get */
        status: 'failed', id: f.test, idKind: 'path',
        meta: [f.message],
        inline: [['ext', 'Open failure record']],
        actions: [
          { value: 'open', label: 'Open failure', hint: f.message },
          { value: 'copy', label: 'Copy assertion' }
        ]
      });
    });

    /* ---- 4. redaction_notice: above the preview, and not dismissible ---- */
    var redaction = sec(C, {
      label: 'Redaction notice',
      count: gated ? RF.failed + ' of ' + RF.attempted : String(T.redaction.fields),
      open: true
    }) + K.blocked({
      code: gated ? RF.reason : want,
      /* Both fixture sentences, in full: the first states the block, the
         second names the profile that could not load and the run whose
         secrets went unmasked. Clipping either is how a display gate becomes
         a decoration. */
      sentence: gated ? RF.sentence + ' ' + RF.detail : (RS ? RS.line : T.redaction.note),
      actions: redactionActions()
    }, gated ? 'err' : null);
    if (gated) {
      redaction += kvs([
        K.kv('State', RF.state, 'token', b),
        K.kv('Profile', RF.profileId, 'measure', b),
        K.kv('Affected run', RF.affectedRunId, 'token', b)
      ]);
    }

    /* ---- 5. artifact_preview ---- */
    var artifacts = sec(C, {
      label: 'Artifacts', count: String(T.artifacts.length), open: true,
      more: [strong('export', 'Export bundle',
        egressSay('The bundle of ' + T.artifacts.length + ' run artifacts'),
        { hint: 'Export leaves the app' })],
      moreTip: 'Artifact actions',
      sort: [{ value: 'kind', label: 'Group by kind' }],
      filter: 'Filter artifacts'
    });
    if (preview !== 'render') {
      /* WITHHELD, not decorated. redactionFailed.blocks names artifact_preview
         and the state row says preview 'suppress', so the region renders the
         gate and the names of what is being held back - never the rows. The
         count stays on the header: the artifacts exist, they are not
         displayable. The only way past this is the authorize route, which is
         destructive and marked needsConfirm in the fixture, so it is the sole
         action offered here and it is not a plain "dismiss". */
      artifacts += K.blocked({
        code: RS ? RS.id : want,
        sentence: RS ? RS.line : '',
        actions: (gated && RF.authorize)
          ? [{ id: RF.authorize.id, label: RF.authorize.label }] : []
      }, 'err');
      if (gated) {
        artifacts += kvs([
          K.kv('Withheld', RF.affectedArtifacts.join(', '), 'prose', b),
          K.kv('Blocks', RF.blocks.join(', '), 'token', b)
        ]);
      }
    } else {
      T.artifacts.forEach(function (a) {
        artifacts += lrow(C, {
          status: 'ok', id: a.name, idKind: 'path', key: a.name,
          meta: [a.kind], tail: a.size,
          inline: [['ext', 'Open ' + a.name]],
          actions: [
            { value: 'open', label: 'Open', hint: a.kind + ', ' + a.size },
            strong('export', 'Export artifact',
              egressSay('The ' + a.kind + ' ' + a.name + ', ' + a.size + ','))
          ]
        });
      });
    }

    /* ---- 0. capability_header: per adapter, last because it is policy ---- */
    var caps = sec(C, {
      label: 'Capabilities', count: String(T.policy.capabilities.length),
      open: b >= 1,
      more: [
        { value: 'settings', label: 'Open Settings' },
        { value: 'visibility', label: 'Visibility: ' + T.policy.visibility }
      ], moreTip: 'Capability policy'
    });
    if (b >= 1) {
      T.policy.capabilities.forEach(function (c) {
        var sc = stateChip(c.state);
        caps += lrow(C, {
          status: c.state, id: c.label, meta: ['mode ' + c.mode],
          chip: sc.chip, chipTone: sc.tone,
          inline: [['info', 'Explain this capability state']],
          actions: [
            { value: 'settings', label: 'Open in Settings' },
            { value: 'auto', label: 'Auto' },
            { value: 'on', label: 'On' },
            { value: 'off', label: 'Off' }
          ]
        });
        if (c.reason) {
          caps += K.blocked({
            code: c.reason, sentence: c.sentence,
            actions: [{ label: c.state === 'prohibited'
              ? 'Open Settings' : 'Request authority' }]
          }, c.state === 'prohibited' ? 'err' : null);
        }
      });
    }

    return shell([head, s1,
      list(grp(runs) + grp(detail) + grp(failures) + grp(redaction) +
           grp(artifacts) + grp(caps))]);
  }

  /* =====================================================================
     AGENTS
     Sections ARE the lifecycle vocabulary - running, blocked, remediation,
     queued, completed - then the registry mirror last. The five tokens are
     contractual and must not be paraphrased or merged, and sticky section
     headers are how the ledger encodes them without five scrollers.
     Row overflow carries the lineage entrypoints verbatim from
     D.agents.lineageTargets, which is the one behaviour F3-452 mandates.
     Concurrent blocked episodes never collapse: each blocked row keeps its
     own reason code and its own ordered actions.
     Available rows deliberately have NO status gutter. They are registry
     entries, not live things, and no token in the shared vocabulary
     truthfully describes them - the missing rail is the cheapest honest way
     to say so, and it keeps the accessible label from lying.
     ===================================================================== */
  function pAgents(D, state) {
    var C = ctx(D, state), b = C.b, G = D.agents;

    var lineage = [{ type: 'head', label: 'Lineage' }].concat(
      G.lineageTargets.map(function (t, i) { return { value: 'lin' + i, label: t }; }));

    /* -------------------------------------------------- lifecycle bucketing
       The sections ARE the contractual vocabulary (FinalGUISpec.md:L1720-
       L1728, F3-147). Selecting rows whose RENDERING token happens to spell
       three of those words dropped every agent whose token is 'attention',
       'stale' or 'prohibited' - three of fifteen active rows landed in no
       section and rendered nowhere at any width.

       The two vocabularies are different lists and the mapping is stated
       rather than assumed: 'attention' and 'stale' are health annotations on
       an agent that is still live (lane-c web worker is 9m into a failing
       test; Dependency Steward has made no progress for 46m), and
       'prohibited' carries a reason code and a sentence exactly as a blocked
       row does. specStatus is the spec token and wins wherever the fixture
       supplies it. Nothing is merged: every row still renders its own status
       word, glyph, rail and accessible label, so the states stay distinct
       inside the section that holds them. An unmapped token is bucketed as
       live rather than discarded - a row must never vanish. */
    var LIFE = { running: 'running', attention: 'running', stale: 'running',
                 queued: 'queued', blocked: 'blocked', prohibited: 'blocked' };
    var byLife = { running: [], queued: [], blocked: [] };
    G.active.forEach(function (a) {
      var k = (a.specStatus && byLife[a.specStatus]) ? a.specStatus
            : (LIFE[a.status] || 'running');
      byLife[k].push(a);
    });
    var running = byLife.running;
    var blocked = byLife.blocked;
    var queued = byLife.queued;
    var remediation = G.completed.filter(function (a) {
      return a.outcome === 'remediation';
    });
    var done = G.completed.filter(function (a) { return a.outcome !== 'remediation'; });

    var head = K.head('Agents',
      b >= 2 ? running.length + ' running ' + DOT + ' ' + blocked.length + ' blocked'
             : String(running.length + blocked.length),
      K.overflow([
        { value: 'activity', label: 'Open Agent Activity' },
        { value: 'config', label: 'Open Agent Config' },
        { type: 'sep' },
        { type: 'head', label: 'Filter' },
        { value: 'running', label: 'Running' },
        { value: 'blocked', label: 'Blocked' },
        { value: 'remediation', label: 'Remediation' },
        { value: 'queued', label: 'Queued' },
        { value: 'completed', label: 'Completed' }
      ], 'Agents'));

    var s1 = K.strip(
      grow(K.filter('Filter agents')) +
      textMenu(blocked.length + ' blocked',
        blocked.length + ' blocked episodes - each stays a distinct actionable item',
        blocked.map(function (a) {
          return { value: a.name, label: a.name, hint: a.reason, disabled: true,
                   reason: a.reason, sentence: a.sentence };
        })));

    function activeRow(a) {
      var sc = stateChip(a.status);
      return lrow(C, {
        status: a.status, id: a.name, key: a.name,
        meta: [a.persona, a.target, a.thread, a.note || null],
        tail: a.elapsed !== '--' ? a.elapsed : null,
        chip: sc.chip, chipTone: sc.tone,
        inline: [['branch', 'Open lineage for ' + a.name], ['play', 'Watch this run']],
        actions: [
          { value: 'lineage', label: 'Open lineage' },
          { value: 'thread', label: 'Open owning thread', hint: a.thread },
          { value: 'watch', label: 'Watch' },
          /* The scope of an agent cancel is the NODE, not the thread: the
             sheet says which run and which owning thread survive it, because
             "Cancel run" beside a lineage list reads as if it might take the
             lineage with it. */
          strong('cancel', 'Cancel run',
            'Cancels ' + a.name + ', the ' + a.persona + ' working on ' +
            a.target + (a.run ? ' in ' + a.run : '') + ' for ' + a.thread +
            (a.elapsed !== '--' ? ', ' + a.elapsed + ' elapsed' : '') +
            '. The node stops and records a cancelled result; the owning ' +
            'thread and the lineage are kept.'),
          { type: 'sep' }
        ].concat(lineage)
      });
    }

    function lifecycleSection(label, rows) {
      return sec(C, {
        label: label, count: String(rows.length), open: true,
        more: [
          { value: 'filter', label: 'Show only ' + label.toLowerCase() },
          { value: 'activity', label: 'Open Agent Activity' }
        ], moreTip: label + ' actions',
        sort: [
          { value: 'recent', label: 'Sort by most recent' },
          { value: 'thread', label: 'Group by owning thread' }
        ],
        filter: 'Filter ' + label.toLowerCase()
      });
    }

    var sRun = lifecycleSection('Running', running);
    running.forEach(function (a) { sRun += activeRow(a); });

    var sBlk = lifecycleSection('Blocked', blocked);
    blocked.forEach(function (a) {
      sBlk += activeRow(a);
      /* The action bar is the row's OWN allowed_action_ids, in the row's own
         order. The fixed triple this replaces was correct on one of five
         rows: it offered Abort node beside Schema Cartographer's sentence
         ("The session is restoring from a checkpoint. No action is needed
         yet."), whose only allowed action is open_for_edit, and it never
         offered grant_authority, the single thing that can unblock Deploy
         Sentinel. It also has to stay a read for the remediation ceiling row,
         where remediation.autoRetry is false and a Retry button would break
         the ceiling outright (FinalGUISpec.md:L3749-L3760) - the allowed set
         contains no retry, so none is drawn. */
      /* The whole payload, not a rebuilt one: allowedActionIds go to the kit
         as they are, so each button keeps its command id on it
         (data-pm-action) instead of being a label that dispatches nothing. */
      sBlk += K.blocked({
        code: a.reason, sentence: a.sentence,
        allowedActionIds: a.allowedActionIds
      }, a.status === 'prohibited' ? 'err' : null);
    });

    var sRem = lifecycleSection('Remediation', remediation);
    remediation.forEach(function (a) {
      var sc = stateChip(a.status);
      sRem += lrow(C, {
        status: a.status, id: a.name, key: a.name,
        meta: [a.persona, a.outcome], tail: a.when,
        chip: sc.chip, chipTone: sc.tone,
        inline: [['branch', 'Open remediation lineage']],
        actions: [
          { value: 'lineage', label: 'Open remediation lineage' },
          { value: 'replan', label: 'Replan node' },
          strong('abort', 'Abort node',
            'Aborts the remediation node ' + a.name + ', the ' + a.persona +
            ' whose outcome is ' + a.outcome + ' as of ' + a.when +
            '. The remediation ends here: it is not retried, and the lineage ' +
            'stays readable afterwards.'),
          { type: 'sep' }
        ].concat(lineage)
      });
    });

    var sQ = lifecycleSection('Queued', queued);
    queued.forEach(function (a) { sQ += activeRow(a); });

    var sDone = lifecycleSection('Completed', done);
    done.forEach(function (a) {
      var sc = stateChip(a.status);
      sDone += lrow(C, {
        status: a.status, id: a.name, meta: [a.persona, a.outcome], tail: a.when,
        chip: sc.chip, chipTone: sc.tone,
        inline: [['branch', 'Open lineage for ' + a.name], ['ext', 'Open artifacts']],
        actions: [
          { value: 'lineage', label: 'Open lineage' },
          { value: 'artifacts', label: 'Open artifacts' },
          { type: 'sep' }
        ].concat(lineage)
      });
    });

    var sAvail = sec(C, {
      label: 'Available', count: String(G.available.length), open: b >= 1,
      more: [
        { value: 'config', label: 'Open Agent Config' },
        { value: 'sheet', label: 'Open the full registry' }
      ], moreTip: 'Registry actions',
      sort: [
        { value: 'name', label: 'Sort by name' },
        { value: 'persona', label: 'Group by persona' }
      ],
      filter: 'Filter registry'
    });
    if (b >= 1) {
      G.available.forEach(function (a) {
        sAvail += lrow(C, {
          /* the registry name and its resolved Persona coincide for every
             bundled entry, and repeating it says nothing */
          status: null, id: a.name,
          meta: [a.persona === a.name ? 'registry' : a.persona],
          inline: [['ext', 'Open ' + a.name + ' in Agent Config']],
          actions: [
            { value: 'config', label: 'Open in Agent Config' },
            { value: 'lineage', label: 'Open lineage', disabled: true,
              reason: 'child_run_exists',
              sentence: 'This entry has no child run yet, so there is no lineage to open.' }
          ]
        });
      });
    }

    return shell([head, s1,
      list(grp(sRun) + grp(sBlk) + grp(sRem) + grp(sQ) + grp(sDone) + grp(sAvail))]);
  }

  /* =====================================================================
     RUNTIME ARTIFACTS
     The critical finding: the envelope has no title field, and the kind
     token runs to 21 characters (before_after_snapshot) which is about
     143px, 65% of the 224px band, before the label gets a pixel. So the
     kind is NEVER a leading chip in this version. It is a line-2 metadata
     segment at buckets 0-2 and the first line-1 segment at bucket 3, which
     costs nothing, because line 2 exists only to carry metadata and the
     kind IS metadata.
     Exactly ONE state chip, and never for a healthy row: projection
     freshness and health are orthogonal and do not collapse, so a green
     chip on every row would spend the slot saying nothing.
     Bundle members lead with evidence_role, not kind: the role enum is six
     values, short, and deterministically ordered.
     ===================================================================== */
  function pArtifacts(D, state) {
    var C = ctx(D, state), b = C.b, R = D.artifacts, B = R.bundle;

    var all = null;
    R.families.forEach(function (f) { if (f.id === 'all') all = f; });

    /* EGRESS, three times over. Export record, Export bundle and Export view
       are the only actions in this panel that leave it, and each one leaves
       with a different SCOPE - one record, one investigation, or everything
       the current filter shows. The gate states which, and states the
       retention class the copy escapes, which is a field the audit records as
       read by nobody in ten designs. */
    var head = K.head('Artifacts',
      b >= 2 ? all.count + ' ' + DOT + ' ' + R.families.length + ' families'
             : String(all.count),
      K.overflow([
        strong('export_record', 'Export record',
          'Export leaves the app with one artifact record and its metadata. ' +
          'Select a row first: this panel holds ' + all.count + ' artifacts ' +
          'across ' + R.families.length + ' families, and each carries its own ' +
          'retention class.'),
        strong('export_bundle', 'Export bundle',
          'Export leaves the app with the whole investigation ' + B.id + ', ' +
          B.title + ': ' + B.members.length + ' members, outcome ' + B.outcome +
          ', confidence ' + B.confidence + '. Retention classes travel with the ' +
          'members but stop being enforced once the bundle is outside.'),
        strong('export_view', 'Export view',
          'Export leaves the app with every artifact the current view lists: ' +
          all.count + ' rows. It is the widest of the three exports and the ' +
          'copy is no longer governed by the retention class each row carries.'),
        { type: 'sep' },
        { value: 'compare', label: 'Set compare target' },
        { value: 'older', label: 'Load older artifacts' },
        { value: 'refresh', label: 'Refresh snapshot' }
      ], 'Artifacts'));

    var s1 = K.strip(K.lenses(R.families, 'all', b, 'Artifact family'));
    var s2 = b >= 2 ? K.strip(grow(K.filter('Filter artifacts')) +
      menuBtn('filter', 'Filter by kind and evidence role', [
        { type: 'head', label: 'Evidence role' },
        { value: 'baseline', label: 'baseline' },
        { value: 'repro', label: 'repro' },
        { value: 'diagnosis', label: 'diagnosis' },
        { value: 'fix', label: 'fix' },
        { value: 'verification', label: 'verification' },
        { value: 'cleanup', label: 'cleanup' }
      ])) : '';

    /* ---- the investigation bundle, a group in the same scroller ---- */
    var bundle = sec(C, {
      label: B.title,
      count: b >= 2
        ? B.outcome + ' ' + DOT + ' ' + B.confidence + ' ' + DOT + ' ' + B.members.length
        : String(B.members.length),
      open: true,
      more: [
        strong('export', 'Export investigation',
          'Export leaves the app with ' + B.id + ', ' + B.title + ': all ' +
          B.members.length + ' members in evidence-role order, outcome ' +
          B.outcome + ', confidence ' + B.confidence + '. What was not carried ' +
          'forward into the bundle is not exported either.'),
        { value: 'omitted', label: 'What was not carried forward' },
        { type: 'sep' },
        { value: 'open', label: 'Open bundle ' + B.id }
      ], moreTip: 'Investigation actions',
      sort: [
        { value: 'role', label: 'Order by evidence role' },
        { value: 'time', label: 'Order by time' }
      ],
      filter: 'Filter members'
    });
    B.members.forEach(function (m) {
      bundle += lrow(C, {
        status: 'ok', id: m.role, meta: [m.kind, B.id],
        inline: [['ext', 'Open this ' + m.kind]],
        actions: [
          { value: 'open', label: 'Open', hint: m.kind },
          { value: 'usage', label: 'Show in Usage' },
          { value: 'ledger', label: 'Show in Ledger' }
        ]
      });
    });

    /* ---- the flat list ---- */
    var rows = sec(C, {
      label: 'All artifacts', count: String(all.count), open: true,
      more: [
        { value: 'older', label: 'Load older artifacts' },
        { value: 'compare', label: 'Set compare target' },
        { type: 'sep' },
        strong('export', 'Export view',
          'Export leaves the app with every artifact this list shows: ' +
          all.count + ' rows, each with its own retention class, which stops ' +
          'being enforced on the copy that leaves.')
      ], moreTip: 'List actions',
      sort: [
        { value: 'time', label: 'Sort by created' },
        { value: 'kind', label: 'Group by kind' },
        { value: 'family', label: 'Group by family' }
      ],
      filter: 'Filter artifacts'
    });
    R.rows.forEach(function (r) {
      var sc = stateChip(r.status);
      var m = r.meta.slice();
      var when = m.pop();                 /* the last segment is the relative time */
      var acts = [
        { value: 'open', label: 'Open', hint: r.preview },
        { value: 'preview', label: 'Preview',
          hint: 'Demand-loaded; rows stay metadata-first' },
        { value: 'usage', label: 'Show in Usage' },
        { value: 'ledger', label: 'Show in Ledger' }
      ];
      if (r.provenance) {
        acts.push({ type: 'sep' },
          { value: 'why', label: 'Explain this artifact', hint: r.provenance });
      }
      acts.push({ type: 'sep' },
        { value: 'bridges', label: 'Bridge fields' },
        /* The row knows its own retention class, its id and its kind, so the
           gate can say precisely what escapes and what stops applying to it.
           retention is on all 47 rows and no version read it. */
        strong('export', 'Export record',
          'Export leaves the app with ' + K.artifactLabel(r) + ': a ' +
          r.kind.replace(/_/g, ' ') + ' from the ' + r.family + ' family, id ' +
          r.id + ', retention ' + r.retention + ', ' + r.freshness + ' and ' +
          r.health + '. Retention ' + r.retention + ' stops being enforced on ' +
          'the exported copy.'));
      rows += lrow(C, {
        status: r.status, id: K.artifactLabel(r), key: r.id,
        meta: [r.kind].concat(m),
        tail: when, chip: sc.chip, chipTone: sc.tone,
        inline: [['ext', 'Open this artifact'], ['info', r.preview]],
        actions: acts
      });
    });

    return shell([head, s1, s2, list(grp(bundle) + grp(rows))]);
  }

  /* =========================================================== expand wiring
     The harness has no per-version event bus, so the ledger wires its own,
     once, by delegation - the same shape vC and vD already use.

     PMM.expand owns the animation; this owns aria-expanded, because the
     accessible state is not the motion layer's to fake (GI-004 requires the
     header be a real button with a real expanded state). The open/closed
     truth is read off the WRAPPER, never off the attribute: the two disagree
     on Docker's unavailable subviews, where the body is visible under an
     aria-expanded="false" header, and one click should reconcile them rather
     than collapse a section the reader can see.

     No repaint, no re-render: the rows stay in the DOM, so nothing is
     measured, nothing is rebuilt, and a section that was scrolled to stays
     where it was. */
  function onSecClick(e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var btn = t.closest('.pmk-sec');
    if (!btn) return;
    var stage = btn.closest('.pm-stage');
    if (!stage || stage.getAttribute('data-pm-version') !== 'vA') return;
    var head = btn.closest('.vA-sec');
    var body = head && head.nextElementSibling;
    if (!body || !body.hasAttribute('data-va-body')) return;
    var open = body.classList.contains('is-open');
    btn.setAttribute('aria-expanded', open ? 'false' : 'true');
    if (window.PMM) window.PMM.expand(body, !open);
    else body.classList.toggle('is-open', !open);
  }

  /* ======================================================== the confirm gate
     Three entry points, one sheet. See the header note: a menu item that is
     enabled, danger and carries a sentence IS a gated action; a button says
     so with data-va-gate; and a blocked-banner action is gated when the
     FIXTURE marks it destructive or needsConfirm.

     Delegated on document, once, and scoped to this version's stages the same
     way the section wiring is - a fit sweep builds thousands of stages and
     none of them should pay for a listener no sweep fires. */
  function vaStage(node) {
    var s = node && node.closest && node.closest('.pm-stage');
    return (s && s.getAttribute('data-pm-version') === 'vA') ? s : null;
  }

  /** The row's own identity, UN-elided (PMK.row writes it to data-pm-key), so
      the sheet names the file, branch, container or run rather than whatever
      the label had room to show. Empty for panel- and section-level actions,
      whose scope is stated inside the sentence instead. */
  function scopeOf(node) {
    var row = node && node.closest && node.closest('[data-pm-row]');
    return row ? (row.getAttribute('data-pm-key') || '') : '';
  }

  function gateSheet(from, action, label, scope, consequence) {
    var PMc = window.PM && window.PM.confirm;
    /* No sheet, no action. A gate that silently degrades to a one-click
       destructive command is worse than no gate at all. */
    if (!PMc || !consequence) return;
    PMc({
      title: label + (scope ? ' - ' + scope : ''),
      body: consequence,
      confirmLabel: label,
      cancelLabel: 'Cancel',
      danger: true,
      from: from
    }).then(function (ok) {
      /* Cancel is the default: Escape, the scrim and the Cancel button all
         resolve false, and only an explicit true counts as consent. The
         decision is dispatched rather than executed - this is a prototype and
         it must not really discard anybody's files - so the port has exactly
         one place to bind the command to. */
      from.dispatchEvent(new CustomEvent('pm:gate', {
        bubbles: true,
        detail: { action: action, label: label, scope: scope, confirmed: ok === true }
      }));
    });
  }

  /** The fixture marks its own strong actions and nobody reads the flags:
      tests.redactionFailed.authorize carries destructive:true and
      needsConfirm:true. Reading them beats keeping a second list here, which
      would drift the moment the fixture named another one. */
  function fixtureConfirm(id) {
    var D = window.PM_DATA;
    var RF = D && D.tests && D.tests.redactionFailed;
    var a = RF && RF.authorize;
    if (!a || a.id !== id || !(a.needsConfirm || a.destructive)) return null;
    return {
      label: a.label,
      say: 'Authorizing shows the artifacts the redaction gate is holding back. ' +
        RF.sentence + ' ' + RF.detail + ' ' + RF.affectedArtifacts.join(' and ') +
        ' from run ' + RF.affectedRunId + ' would display with ' + RF.failed +
        ' of ' + RF.attempted + ' fields unmasked.'
    };
  }

  function onMenuGate(e) {
    var d = e.detail || {}, it = d.item || {};
    /* Enabled + danger + a sentence. A DISABLED danger item keeps the old
       reading - its sentence says why it cannot run - and the kit refuses the
       click before this listener ever sees it. */
    if (!it.danger || it.disabled || !it.sentence) return;
    if (!vaStage(e.target)) return;
    /* AFTER the menu closes, not during. pm-menu dispatches this event and
       then calls close(true), which refocuses its own trigger - so a sheet
       opened synchronously here has its focus stolen back out of the dialog
       one line later, which is exactly the failure aria-modal exists to
       prevent. Measured: focus landed on .pm-menu-trigger with the dialog
       open. Deferring by one task lets the menu finish, so PM.confirm's own
       focus call lands last and its prevFocus is the trigger, which is also
       where focus belongs again on Cancel. */
    var from = e.target, act = d.action, scope = scopeOf(from);
    setTimeout(function () {
      gateSheet(from, act, it.label, scope, it.sentence);
    }, 0);
  }

  function onClickGate(e) {
    var t = e.target;
    if (!t || !t.closest) return;

    var btn = t.closest('[data-va-gate]');
    if (btn) {
      if (!vaStage(btn)) return;
      e.preventDefault();
      gateSheet(btn, btn.getAttribute('data-va-label'),
        btn.getAttribute('data-va-label') || (btn.textContent || '').trim(),
        scopeOf(btn), btn.getAttribute('data-va-gate'));
      return;
    }

    var act = t.closest('[data-pm-action]');
    if (!act || !vaStage(act)) return;
    var spec = fixtureConfirm(act.getAttribute('data-pm-action'));
    if (!spec) return;
    e.preventDefault();
    gateSheet(act, act.getAttribute('data-pm-action'), spec.label,
              scopeOf(act), spec.say);
  }

  if (!window.__vALedgerBound) {
    window.__vALedgerBound = true;
    document.addEventListener('click', onSecClick);
    document.addEventListener('click', onClickGate);
    document.addEventListener('pm:menuaction', onMenuGate);
  }

  /* ===================================================================== */
  PM_BAKEOFF.register('vA', {
    name: 'Ledger',
    blurb: 'Two-line receipts under sticky section headers. Zero nesting.',
    panels: {
      search: pSearch,
      source: pSource,
      git: pGit,
      docker: pDocker,
      tests: pTests,
      agents: pAgents,
      artifacts: pArtifacts
    }
  });
})();
