/* PANEL BAKEOFF — x-artifacts: three one-off explorations of the ONE panel
   =========================================================================
   Artifacts has the worst observed truncation of all seven panels. Rendering
   the shipped panel at 220px produces

       validation_test  carg…  pass on retry

   — the label cut to four characters while a 15-character kind token and a
   13-character state chip both render in full. The root cause is not the
   flex rules. It is that the runtime-artifact envelope guarantees only
   artifact_id and artifact_type; summary is optional and unbounded, so the
   ONE string that is always present is also the longest and the least
   informative. before_after_snapshot is 21 characters, about 143px, roughly
   65% of the 224px band at 240px BEFORE the label gets a single pixel.

   A leading kind chip is therefore arithmetically impossible below 360px.
   These three variants are three different answers to the same question:

       what identifies an artifact row when its type is too long to show
       and its title may not exist?

     xA1 GLYPH COLUMN  the kind becomes a 20px drawing. 19 distinct glyphs,
                       one per canonical kind, sharing a 27px gutter with the
                       status rail. The whole rest of the band is identity.
     xA2 CASEFILE      the kind stops being the row's business. The
                       investigation is the primary object, members lead with
                       evidence_role, and unfiled artifacts carry a 3-letter
                       kind CODE instead of a token.
     xA3 MONOCULTURE   the kind is a SECTION, never a row field. The list is
                       a sequence of homogeneous runs under sticky type
                       headers, so the type is stated once per run and the
                       row shape specialises to it.

   Three different encodings of the same field: picture, abbreviation,
   heading. That is deliberate — it is the axis the bakeoff should compare.

   -------------------------------------------------------------------------
   DECISIONS SHARED BY ALL THREE (so the comparison is about layout only)
   -------------------------------------------------------------------------
   1. STATE PRECEDENCE. The owner doc never specifies one, so this file picks
      one and states it. Exactly one state word may render on a row:

          prohibited > blocked > failed > stale > redacted
                     > attention > running > queued > ok

      ok is NEVER painted (research/artifacts.md section 6: never paint
      healthy). Redaction outranks attention and running because a redacted
      recording is a disclosure fact, not a progress fact; it loses to failed
      and stale because those change whether the bytes can be trusted at all.
      Redaction is read from the fixture meta run ("redacted 2"), which is the
      only place the fixtures carry redaction_profile_id's effect.

   2. STATUS SURVIVES WITHOUT ITS WORD. Below 360px the state word is often
      dropped. Four non-colour channels remain, per FinalGUISpec.md:1237:
      the pip/mark GLYPH SHAPE, the rail DASH pattern, the accessible label
      on the gutter, and the state word once it returns at bucket 2.

   3. IDENTITY IS COMPUTED, NOT READ. There is no title field. Every variant
      treats the fixture title as a best-effort overlay over artifact_id, and
      every variant leaves the identity as the ONE slot allowed to grow and
      the ONE slot allowed to elide. Every other slot is dropped WHOLE by an
      explicit width budget computed in JS — never by CSS shrinkage, because
      Slint cannot measure text mid-layout and must reach the same decision
      from the same numbers.

   4. ROWS OPEN BY IDENTITY (RAP-008). The first overflow item is always
      "Open artifact" and it means artifact_id, not a path. Preview strings
      that happen to contain paths (src/services/import.rs, 0002_ratings.sql)
      render as dim secondary text and are never the click target.

   5. 14 OF 19 PER-KIND SCHEMAS ARE {"type":"object","minProperties":1}.
      No per-kind metadata is designable from spec for those. Only
      api_web_call, browser_recording, cost_usage, tool_llm_trace and
      restore_point constrain their payload. xA3 makes that visible; xA1 and
      xA2 simply refuse to invent per-kind fields for the other 14.

   6. WHAT NONE OF THEM DO. No leading kind chip below bucket 2 at any width.
      No var(--display-font) under 12px. No id= attributes, no emoji, no
      backtick or dollar-brace in markup, no new color-mix(), no new
      backdrop-filter. Every select is PMK.select, every icon-only control
      carries data-pm-tip, every interactive row clears 24px.

   7. STRONG ACTIONS PASS THROUGH PM.confirm. Every egress in this panel --
      Export record (panel and row), Export bundle, Export view, Import
      bundle, Export investigation -- and every mutating route the fixture
      authorises through allowedActionIds[] states its SCOPE and its
      CONSEQUENCE in a modal sheet before it runs. See BLIND SPOT 20 below.
      Reads are never gated, on purpose.

   8. THE REQUIRED ENVELOPE FIELDS ARE READ, ALL OF THEM. retention_class on
      every row (blind spot 4), projection_health on the seven that are not
      healthy, projection_freshness in the accessible name, and the four
      availability states the fixture poses -- an expired provider URL with
      its clock, a truncation gap with its class, an evicted payload with its
      eviction reason, and a degraded projection with its reason code (blind
      spot 13). Each is its own line under the row from 360px, never folded
      into one chip, because RAP:L2042 forbids exactly that fold.
      Each variant answers retention differently, which is the comparison the
      bakeoff is for: xA1 gives it the surviving slot of the meta run, xA2
      makes it a scope on the casefile selector and a line-2 field, xA3 finds
      that 17 of 19 types are retained UNIFORMLY and states it once per run
      header, per-row only in the two runs that are mixed.
   ========================================================================= */
(function (global) {
  'use strict';

  var K = global.PMK;
  var esc = K.esc;
  var DOT = '·';

  /* =======================================================================
     THE 19 KIND GLYPHS
     -----------------------------------------------------------------------
     One drawing per canonical artifact_type. They are deliberately built
     from different PRIMITIVES rather than different details — a frame, a
     circle, a page, a shield, a staircase, a fan — because at 18px a
     difference of detail is not a difference at all. Stroke only, so they
     inherit currentColor and cost nothing per theme.
     ======================================================================= */
  var KIND_PATH = {
    /* evidence family ------------------------------------------------- */
    code_diff:
      '<line x1="4" y1="7" x2="12" y2="7"/><line x1="8" y1="3" x2="8" y2="11"/>' +
      '<line x1="12" y1="17" x2="20" y2="17"/><line x1="4" y1="13" x2="7" y2="13"/>',
    validation_test:
      '<path d="M9 3v6l-5 9a2 2 0 0 0 1.8 3h12.4a2 2 0 0 0 1.8-3l-5-9V3"/>' +
      '<line x1="8" y1="3" x2="16" y2="3"/><line x1="7" y1="15" x2="17" y2="15"/>',
    screenshot:
      '<rect x="3" y="6" width="18" height="13" rx="2"/><circle cx="12" cy="12.5" r="3.4"/>' +
      '<line x1="8" y1="6" x2="9.5" y2="3.5"/>',
    before_after_snapshot:
      '<rect x="2.5" y="5" width="19" height="14" rx="2"/><line x1="12" y1="5" x2="12" y2="19"/>' +
      '<polyline points="15 9.5 17.5 12 15 14.5"/>',
    tool_llm_trace:
      '<circle cx="4.5" cy="18" r="2"/><circle cx="19.5" cy="6" r="2"/>' +
      '<path d="M6.5 17c5-1.5 4-5 6.5-6.5S17 8 17.5 7.5"/><circle cx="12" cy="12" r="1.4"/>',
    context_snapshot:
      '<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 7 4l-7 4z"/>' +
      '<line x1="12" y1="4" x2="12" y2="12"/>',
    implementation_plan:
      '<line x1="11" y1="6" x2="21" y2="6"/><line x1="11" y1="12" x2="21" y2="12"/>' +
      '<line x1="11" y1="18" x2="21" y2="18"/><polyline points="3 5.5 4.8 7.3 7.5 4.2"/>' +
      '<polyline points="3 11.5 4.8 13.3 7.5 10.2"/>',
    reasoning_summary:
      '<path d="M4 5h16v10H10l-6 5z"/><line x1="8" y1="9" x2="16" y2="9"/>' +
      '<line x1="8" y1="12" x2="13" y2="12"/>',
    suggested_next_steps:
      '<polyline points="3 19 8 19 8 13.5 13 13.5 13 8 18 8"/>' +
      '<polyline points="15.5 5 18.5 8 15.5 11"/>',
    document:
      '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/>' +
      '<polyline points="14 3 14 8 19 8"/><line x1="8.5" y1="13" x2="15" y2="13"/>' +
      '<line x1="8.5" y1="16.5" x2="13" y2="16.5"/>',
    artifact_version:
      '<polygon points="12 2.6 21 7.5 12 12.4 3 7.5"/><polyline points="3 12 12 16.9 21 12"/>' +
      '<polyline points="3 16.5 12 21.4 21 16.5"/>',
    evidence:
      '<path d="M12 2.6 20 5.6v6.2c0 5-3.4 8.2-8 9.6-4.6-1.4-8-4.6-8-9.6V5.6z"/>' +
      '<polyline points="8.6 11.8 11 14.2 15.4 9.4"/>',
    failed_attempts:
      '<path d="M20.5 12a8.5 8.5 0 1 1-2.9-6.4"/><polyline points="20.5 3.5 20.5 8.5 15.5 8.5"/>' +
      '<line x1="9.5" y1="9.5" x2="14.5" y2="14.5"/><line x1="14.5" y1="9.5" x2="9.5" y2="14.5"/>',
    subagent_lineage:
      '<circle cx="4.5" cy="12" r="2"/><circle cx="19.5" cy="6" r="2"/>' +
      '<circle cx="19.5" cy="18" r="2"/><path d="M6.5 12h5V6h6"/><path d="M11.5 12v6h6"/>',
    /* web / browser --------------------------------------------------- */
    api_web_call:
      '<circle cx="12" cy="12" r="8.5"/><line x1="3.5" y1="12" x2="20.5" y2="12"/>' +
      '<path d="M12 3.5a13.5 13.5 0 0 1 0 17 13.5 13.5 0 0 1 0-17"/>',
    browser_recording:
      '<rect x="2.5" y="4" width="19" height="16" rx="2"/><line x1="2.5" y1="9" x2="21.5" y2="9"/>' +
      '<circle cx="12" cy="14.6" r="2.8"/><line x1="5.5" y1="6.5" x2="5.5" y2="6.5"/>',
    /* receipt --------------------------------------------------------- */
    cost_usage:
      '<circle cx="12" cy="12" r="8.5"/><line x1="12" y1="5.5" x2="12" y2="18.5"/>' +
      '<path d="M15 9.4c-.7-1-1.9-1.5-3.1-1.5-1.8 0-3.1 1-3.1 2.2s1.3 2.1 3.1 2.1 3.1 1 3.1 2.2-1.3 2.2-3.1 2.2c-1.2 0-2.4-.6-3.1-1.5"/>',
    restore_point:
      '<path d="M3.5 12a8.5 8.5 0 1 0 3-6.4"/><polyline points="3.5 3.5 3.5 8.5 8.5 8.5"/>' +
      '<polyline points="12 7.5 12 12 15.5 14"/>',
    hitl_approval:
      '<circle cx="9.5" cy="7.5" r="3.4"/><path d="M3.5 20.5c0-3.6 2.8-5.6 6-5.6 1 0 2 .2 2.9.6"/>' +
      '<polyline points="14.5 16.5 16.8 18.8 21 13.4"/>'
  };

  /* Three-letter codes, xA2's answer. Chosen so no two share a prefix and
     each is guessable from the token's own first syllables. */
  var KIND_CODE = {
    code_diff: 'DIF', validation_test: 'TST', screenshot: 'SHT',
    before_after_snapshot: 'B/A', tool_llm_trace: 'TRC', context_snapshot: 'CTX',
    implementation_plan: 'PLN', reasoning_summary: 'RSN', suggested_next_steps: 'NXT',
    document: 'DOC', artifact_version: 'VER', evidence: 'EVD',
    failed_attempts: 'ATT', subagent_lineage: 'LIN', api_web_call: 'WEB',
    browser_recording: 'REC', cost_usage: 'CST', restore_point: 'RST',
    hitl_approval: 'HIL'
  };

  /* The five kinds whose per-type schema actually constrains type_payload.
     research/artifacts.md section 1: the other 14 are
     {"type":"object","minProperties":1} and no per-kind metadata is
     designable from spec for them. */
  var STRICT = {
    api_web_call: 1, browser_recording: 1, cost_usage: 1,
    tool_llm_trace: 1, restore_point: 1
  };

  function kindSvg(kind, px) {
    var p = KIND_PATH[kind] || '<circle cx="12" cy="12" r="8"/>';
    return '<svg class="x-kg" width="' + px + '" height="' + px + '" viewBox="0 0 24 24" ' +
      'fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" ' +
      'stroke-linejoin="round" aria-hidden="true">' + p + '</svg>';
  }

  /* ---------------------------------------------------------------- pips
     The status channel that survives when the gutter's main glyph has been
     spent on the KIND. Shape only, 9px, drawn from a separate primitive set
     so it can never be confused with a kind drawing. ok has no pip at all. */
  var PIP_PATH = {
    running: '<circle cx="6" cy="6" r="3.6"/><circle cx="6" cy="6" r="1.3" fill="currentColor"/>',
    queued: '<circle cx="6" cy="6" r="3.6"/>',
    attention: '<path d="M6 1.5 11 10.5H1z"/>',
    blocked: '<rect x="1" y="4.2" width="10" height="3.6" rx="1"/>',
    failed: '<line x1="2.2" y1="2.2" x2="9.8" y2="9.8"/><line x1="9.8" y1="2.2" x2="2.2" y2="9.8"/>',
    stale: '<circle cx="6" cy="6" r="4.2"/><polyline points="6 3.2 6 6 8.2 7.3"/>',
    prohibited: '<circle cx="6" cy="6" r="4.2"/><line x1="3" y1="3" x2="9" y2="9"/>',
    disabled: '<rect x="2" y="2" width="8" height="8" rx="1"/>',
    redacted: '<line x1="1.4" y1="6" x2="10.6" y2="6" stroke-width="3.4"/>'
  };

  function pipSvg(token) {
    var p = PIP_PATH[token];
    if (!p) return '';
    return '<span class="x-pip"><svg width="9" height="9" viewBox="0 0 12 12" fill="none" ' +
      'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ' +
      'aria-hidden="true">' + p + '</svg></span>';
  }

  /* =======================================================================
     STATE — ONE CHIP MAXIMUM, ONE PRECEDENCE ORDER
     ======================================================================= */
  /* The precedence order, extended by two tokens the fixture now poses and
     in the position _pm-data.js:1975 itself states for the ONE indicator a
     240px row can hold: blocked > expired > degraded > redacted. `expired`
     and `evicted` are not envelope statuses -- they are availability facts
     that OUTRANK the envelope status word, exactly as `redacted` already did
     here, and the gutter still draws the envelope status so the glyph, the
     rail and the accessible label are untouched.

     Why they earn the word. The generated-media row ships status 'failed'
     and rendered the bare word `failed`, which is true and useless: it was a
     provider URL that aged out of a 24h window, not a run that failed, and
     RAP-033:L475 asks for a persistent expiry indicator on a real clock. The
     evicted row ships status 'disabled', whose vocabulary word is
     "disabled" and whose accessible label is "Unavailable" -- so the row
     said one thing to the eye and another to a screen reader, and neither of
     them was the true one (`availability: 'evicted'`). Both words now come
     from the row's own availability field. */
  var RANK = {
    prohibited: 0, blocked: 1, expired: 2, evicted: 3, failed: 4, stale: 5,
    redacted: 6, attention: 7, running: 8, queued: 9, disabled: 10, ok: 11
  };

  /* ------------------------------------------------------- retention_class
     BLIND SPOT 4 / audit-artifacts R18. A REQUIRED envelope field, present on
     all 47 rows, and the audit's finding was exact: "read by no version, in
     no menu, in no sheet". All three now read it, all three put it in a menu,
     and the confirmation gate below puts it in a sheet.

     The token renders VERBATIM. There is no abbreviation table here, and that
     is a deliberate difference from ROLE_SHORT and KIND_CODE above: those two
     abbreviate enums whose spelling nobody disputes, whereas retention has
     TWO incompatible vocabularies in play -- the envelope schema's
     ephemeral | session | project | governed | debug_retained, which is what
     the fixture carries and what validates, against RAP:L174-L177's
     durable | session_bounded | ephemeral_view (_pm-data.js:1603). Inventing
     a third spelling on top of an unresolved two is how a fixture note
     becomes a shipped vocabulary. The order below is the schema enum's own,
     shortest-lived first, so counts always read in the same sequence. */
  var RETENTION_ORDER = ['ephemeral', 'session', 'project', 'governed', 'debug_retained'];

  function retOf(r) {
    return (r && r.retention) ? String(r.retention) : '';
  }

  /** Counts per class, in enum order, as "governed 12 · session 16 · ...".
   *  Used by the confirm sheets and the panel menu; never by a row. */
  function retMix(rows) {
    var n = {};
    (rows || []).forEach(function (r) {
      var k = retOf(r);
      if (k) n[k] = (n[k] || 0) + 1;
    });
    return { counts: n, text: RETENTION_ORDER.filter(function (k) { return n[k]; })
      .map(function (k) { return k + ' ' + n[k]; }).join(' ' + DOT + ' ') };
  }

  function metaOf(r) {
    return (r && r.meta && r.meta.length) ? r.meta.slice() : [];
  }
  function timeOf(r) {
    var m = metaOf(r);
    return m.length ? String(m[m.length - 1]) : '';
  }
  function bodyMeta(r) {
    var m = metaOf(r);
    return m.length > 1 ? m.slice(0, m.length - 1) : [];
  }
  function redactionOf(r) {
    var found = null;
    metaOf(r).forEach(function (s) {
      if (/^redacted\b/i.test(String(s))) found = String(s);
    });
    return found;
  }

  /* ------------------------------------------------- the blocked vocabulary
     RAP:L2060 names FIVE non-interchangeable blocked presentations —
     permission denial, approval-required, storage-read-only, integrity-block,
     preflight-drift — and forbids collapsing them into a generic failure.
     The envelope carries the exact token on every row that has one
     (blocked_reason_code), so the code is READ, never derived. Deriving it
     from the envelope status is what made three of the five render
     approval_required above a sentence that said the storage was mounted
     read-only: a row that contradicts itself, which is worse than a row that
     says nothing.

     Two rows predate the field and carry no code (the policy-prohibited web
     fetch and the original hitl_approval receipt). For those the envelope
     status is unambiguous — prohibited is a denial, blocked is the approval
     wait — and the pair below is the historical spelling. Every row that
     ships a code gets its own; the fallback can never overwrite one.
     FIXTURE GAP: blockedReasonCode on those two rows would remove the last
     invented string on this line. Reported, not patched here. */
  function blockedCode(r) {
    if (r && r.blockedReasonCode) return String(r.blockedReasonCode);
    return (r && r.status === 'prohibited') ? 'policy_denied' : 'approval_required';
  }

  /* The one sentence that renders beside the code. sentence is the field
     the blocked rows ship for exactly this line and it is the one that
     matches the code; provenance carries it for the policy denial; preview
     is the last resort and is already on line 2, so it is the duplicate
     reading, not the preferred one. */
  function blockedSay(r) {
    return (r && (r.sentence || r.provenance || r.preview)) || null;
  }

  /* An expired provider URL. RAP-033:L475 requires provider receipt metadata,
     the ORIGINAL provider URL ref, a durable local ref and an expiry warning
     driven by a real clock; the fixture ships every one of those on
     art-6d2f90ba and this is the first read of any of them. */
  function expiryOf(r) {
    var m = r && r.media;
    return (m && m.expired) ? m : null;
  }

  /* An artifact whose RECORD survives and whose payload does not (RAP:L314,
     :L2056, RAP-020). "A missing row is never an empty row." */
  function recordOnlyOf(r) {
    return (r && (r.recordOnly || r.availability)) ? String(r.availability || 'record only') : null;
  }

  /* Returns { tone, mark, word, reason }.
       mark   the token the gutter draws (always the envelope status)
       word   the single state word, or null when the row is plainly healthy
       reason a sentence for the blocked/prohibited presentations only */
  function stateOf(r) {
    var st = (r && r.status) ? r.status : 'ok';
    var red = redactionOf(r);
    var exp = expiryOf(r);
    var rec = recordOnlyOf(r);
    var rank = RANK[st] == null ? RANK.ok : RANK[st];
    var winner = st, word = null;
    if (exp && RANK.expired < rank) { winner = 'expired'; rank = RANK.expired; }
    if (rec && RANK.evicted < rank) { winner = 'evicted'; rank = RANK.evicted; }
    if (red && RANK.redacted < rank) { winner = 'redacted'; rank = RANK.redacted; }
    if (winner === 'redacted') word = red;
    else if (winner === 'expired') word = 'expired ' + (exp.expiredAgo || '');
    else if (winner === 'evicted') word = rec;
    else if (winner !== 'ok') word = K.statusOf(winner).word;
    var reason = null;
    if (st === 'prohibited' || st === 'blocked') reason = blockedSay(r);
    return { tone: K.statusOf(st).tone, mark: st, word: word, reason: reason,
             redacted: !!red, expired: exp, record: rec };
  }

  /* The blocked/prohibited disclosure line, emitted from ONE place by all
     three variants. It used to be three copies of the same six lines, and
     one wrong ternary repeated three times is precisely how a shared block
     turns a single mistake into three defects.

     px is the sentence budget the calling variant computed against the code
     this file used to emit; a longer code eats into it one character for
     one, because the code is the one thing on this line that must never
     elide. 118px was the old fixed reserve (the longest of the two derived
     spellings, mono at --fs-2xs), so it stays the zero point and the rows
     that already fitted keep the budget they had. */
  function note(code, say, px, theme, cls) {
    code = String(code == null ? '' : code);
    var over = Math.max(0, Math.ceil(code.length * 6.2) + 8 - 118);
    return '<div class="x-blk' + (cls ? ' ' + cls : '') + '">' +
      '<span class="x-blk-code">' + esc(code) + '</span>' +
      '<span class="x-blk-say">' +
      esc(K.elide(say || '', 'default', fits(px - over, theme))) + '</span></div>';
  }

  function blockedNote(r, s, px, theme) {
    return note(blockedCode(r), s.reason || '', px, theme, '');
  }

  /* ------------------------------------------------------------ the notes
     BLIND SPOT 13 and audit-artifacts R29 / S34, in one place for all three
     variants, on the same mechanism and the same width budget the blocked
     disclosure already used.

     THE RULE IS ADDITIVE, AND THAT IS THE POINT. RAP:L2042 forbids collapsing
     projection_freshness and projection_health into one axis, and
     _pm-data.js:1919 poses the case deliberately: art-b74c1e93 is degraded
     AND truncated, "independent facts -- a design that shows one chip has to
     choose, and RAP:L2042 says choosing is not allowed." So this emits EVERY
     line that applies rather than the highest-ranked one. The single state
     WORD on the row still has to choose (a 240px row holds one), and the
     precedence above is where that choice is made and stated; the disclosure
     lines below are where nothing is chosen away.

     Cost: 7 rows of 47 gain one extra line, and the one row the fixture built
     to be un-collapsible gains two. Nothing is emitted below 360px, where the
     rail dash, the pip shape and the gutter's accessible label carry the same
     facts -- the same gate the blocked line has always used.

     WHAT IS STILL NOT HERE, honestly: truncation.classes[] ships the whole
     five-value gap vocabulary and only this row's own class is rendered; the
     other four have no row to belong to, and printing an enum a row is not in
     is a legend, not a state. truncation.inferFromTimestamps:false is a
     PROHIBITION on the reader, not a fact about the artifact, so it governs
     what this file does not do (nothing here derives a gap boundary from the
     time column) rather than something it prints. */
  function stateNotes(r, s, px, theme, b) {
    if (b < 2) return '';
    var out = '';
    if (s.reason) out += blockedNote(r, s, px, theme);

    var m = s.expired;
    if (m) {
      /* The clock, spelled as the fixture spells it: how long ago against the
         window it was granted. "expired" alone is a state; "expired 4h of a
         24h window" is the only version of it a user can act on. */
      out += note('expired ' + (m.expiredAgo || '') + ' of ' + (m.expiryWindow || ''),
                  r.sentence || '', px, theme, 'x-blk--media');
      /* S34, provider-native detail. Four ids that identify WHICH provider
         entry, WHICH account and WHICH route produced this, unread by every
         version until now. They are the receipt, so they render at 480px
         where there is room for a receipt; below that they stay in the row
         menu, where they are one press away at every width. */
      if (b >= 3) {
        out += note(m.providerEntryId || '',
          [m.provider, m.route, m.accountProfileRef, m.mediaRouteId]
            .filter(Boolean).join(' ' + DOT + ' '), px, theme, 'x-blk--soft');
      }
    }

    var t = r && r.truncation;
    if (t) out += note(t.gapClass || t.state || '', t.sentence || '', px, theme, 'x-blk--media');

    if (s.record) {
      out += note(r.evictionReason || s.record, r.sentence || '', px, theme, 'x-blk--soft');
    }

    /* projection_health, which six rows carry and no version painted. Its own
       line rather than a segment folded into another one, because folding it
       is the collapse RAP:L2042 names. degradedReason is present on two of
       the seven and is the whole reason when it is there. */
    if (r && r.health && r.health !== 'healthy') {
      out += note(r.health, r.degradedReason || '', px, theme, 'x-blk--soft');
    }
    return out;
  }

  /* The gutter's accessible name carries BOTH facts, because at bucket 0 it
     is the only place either of them is spelled out. */
  /* Every envelope-required classification, in one string, at EVERY width --
     including 240px, where the visible row has room for none of them. kind,
     status, retention_class, projection_freshness and projection_health are
     all guaranteed by the envelope, so the accessible name is the one place
     they can all be stated without a width budget. freshness in particular
     renders nowhere else in this file, and saying so here is cheaper and more
     honest than a sixth token fighting for the same 224px band. */
  function gutterLabel(r) {
    var s = stateOf(r);
    var bits = [r && r.kind ? String(r.kind).replace(/_/g, ' ') : 'artifact',
                K.statusOf(s.mark).label];
    /* The word only earns a slot when it says something the status LABEL does
       not. PM_DATA.status spells the two differently on purpose -- label
       "Needs attention", word "attention" -- so an equality test let the pair
       through and the gutter announced "Needs attention. attention." A
       containment test in both directions is the right one: it keeps
       "expired 4h", "evicted" and "redacted 2", which are the words that
       outrank the status, and drops the ones that merely restate it. */
    var lbl = String(bits[1]).toLowerCase(), wrd = s.word ? s.word.toLowerCase() : '';
    if (wrd && lbl.indexOf(wrd) < 0 && wrd.indexOf(lbl) < 0) bits.push(s.word);
    if (retOf(r)) bits.push('retention ' + retOf(r));
    if (r && r.freshness && r.freshness !== 'current') bits.push('freshness ' + r.freshness);
    if (r && r.health && r.health !== 'healthy') bits.push('health ' + r.health);
    return bits.join(' ' + DOT + ' ');
  }

  /** The kit's status mark, re-labelled with the full envelope name above.
   *  xA2 and xA3 use PMK.statusMark rather than this file's own gutter, and
   *  the kit's accessible name is the status label alone -- correct for the
   *  kit, one channel short here, and there is no reason two of the three
   *  variants should speak less than the first. String surgery on the kit's
   *  output rather than an edit to _pm-kit.js, the vD nav() idiom: statusMark
   *  taking an optional lead clause is the right home for this and every
   *  version needs it, but the shared file is not this one's to change.
   *  REPORTED, not patched. */
  function markOf(r, s) {
    return K.statusMark(s.mark).replace(/aria-label="[^"]*"/,
      'aria-label="' + esc(gutterLabel(r)) + '"');
  }

  var DASH = { blocked: 'dashed', stale: 'dotted', prohibited: 'dotted' };

  /* rail + kind glyph + status pip, in ONE gutter. */
  function gutter(r, px, cls) {
    var s = stateOf(r);
    var dash = DASH[s.mark] ? ' pmk-rail--' + DASH[s.mark] : '';
    var pip = s.mark === 'ok' ? (s.redacted ? pipSvg('redacted') : '') : pipSvg(s.mark);
    return '<span class="' + cls + ' pmk-t-' + s.tone + '" role="img" aria-label="' +
      esc(gutterLabel(r)) + '">' +
      '<span class="pmk-rail' + dash + '"></span>' +
      '<span class="x-gw">' + kindSvg(r.kind, px) + pip + '</span></span>';
  }

  /* ------------------------------------------------------------ measuring
     Rough advance width per character, per theme family. basic-* is the
     worst case (Inter 15px plus 0.02em tracking), retro narrowest (Rajdhani
     is condensed). Slint gets the same three constants. */
  /* 5.7 for retro rather than the kit's 5.4: Rajdhani is condensed on
     lowercase but not on the digits, colons and capitals these identity
     strings are full of ("Searching Web: USDA FoodData Central"), and 5.4
     under-measures that mix by ~2px per 32 characters — enough to make the
     computed elision one character too generous and hand the clip back to
     CSS. Costing retro two characters is the cheaper mistake. */
  function px1(theme) {
    return /^basic/.test(theme || '') ? 6.6 : /^retro/.test(theme || '') ? 5.7 : 6.2;
  }
  function fits(px, theme) {
    return Math.max(8, Math.floor(px / px1(theme)));
  }

  /* ------------------------------------------------------------- identity
     audit-artifacts R3. All three variants used `r.title || r.kind`, which
     the re-audit scored `~` for three named reasons: it skips `summary` (and
     art-3ab77f10 HAS one), it terminates at the kind so two title-less
     context_snapshots are indistinguishable, and it duplicates a token the
     row already shows as a glyph, a 3-letter code or a run header.

     PMK.artifactLabel is the kit's answer and it fixes all three at once:
     title -> summary -> kind-derived label CARRYING THE SHORT ID. It is the
     policy half of the same argument that puts elision and the status
     vocabulary in the kit -- one identity rule for fifteen designs, because a
     version that gets it wrong is wrong invisibly. */
  function identLabel(r) {
    return K.artifactLabel(r);
  }

  /* Titles that read as paths keep their basename; everything else is a
     plain tail elision. Delegated to the kit so the policy is identical
     across all six systems and these three. */
  function idKindOf(r) {
    var t = String(identLabel(r) || '');
    if (/^https?:|^[a-z0-9.-]+\.(com|app|org|io)\//i.test(t)) return 'path';
    return t.indexOf('/') >= 0 ? 'path' : 'default';
  }

  /** K.elide, with the path branch's floor closed.
   *  PMK.elide's `path` case has a hard floor: once "first/…/base" does not
   *  fit it returns "…/base" REGARDLESS of max, so a long basename busts the
   *  budget anyway and the clip falls back to CSS. Measured, at the sweep
   *  after the fixture gained the evicted browser recording
   *  ("localhost:5173/recipes/import from paprika export"): a W1 on .xA1-id,
   *  .xA2-id and .xA3-id at 240px in all eight themes and at 320px in
   *  basic-*, 4-26px cut. That is a styled ellipsis on the identity slot,
   *  which is the one thing this file says it never does.
   *  The second pass keeps the TAIL (the kit's `ref` kind) rather than the
   *  head, because the basename is the identifying part of a path -- the
   *  kit's own reason for having a path branch at all.
   *  The floor belongs in PMK.elide; the shared file is not this one's to
   *  change, so it is REPORTED and worked around here. */
  function elideIdent(text, kind, max) {
    var out = K.elide(text, kind, max);
    if (out.length > max) out = K.elide(out, 'ref', max);
    return out;
  }

  /* Common row actions. First item is identity-native open (RAP-008).
     The head carries BOTH envelope classifications the row cannot always
     show -- artifact_type and retention_class -- so the required field is
     reachable at every width including 240px, which is the width at which
     the audit's "in no menu" complaint actually bites. */
  function rowActions(r) {
    var rec = recordOnlyOf(r);
    var acts = [
      { type: 'head', label: String(r.kind) + ' ' + DOT + ' ' + (retOf(r) || 'retention absent') },
      { value: 'open', label: 'Open artifact' },
      /* RAP-020: an evicted artifact is browsable as a RECORD and its preview
         is not merely missing, it is unavailable FOR A STATED REASON. The
         disabled-with-reason rendering is the kit's, so the code and the
         sentence are both reachable by keyboard. */
      { value: 'preview', label: 'Load preview', disabled: !!rec,
        reason: rec ? (r.evictionReason || rec) : '',
        sentence: rec ? (r.sentence || '') : '' }
    ];
    if (r.family === 'receipt' || r.kind === 'cost_usage' || r.kind === 'tool_llm_trace') {
      acts.push({ value: 'usage', label: 'Show in Usage' });
      acts.push({ value: 'ledger', label: 'Show in Ledger' });
    }
    if (r.kind === 'browser_recording') {
      acts.push({ value: 'watch', label: 'Watch recording' });
    }
    if (r.kind === 'api_web_call') {
      acts.push({ value: 'sources', label: 'Open sources' });
    }
    if (STRICT[r.kind]) acts.push({ value: 'raw', label: 'Preview mode: Curated / Raw' });

    /* ---- S34 provider-native detail, the whole receipt ----------------
       providerEntryId, accountProfileRef and mediaRouteId are the three ids
       RAP-032:L432 names, and they are ROUTES, not captions: each one is the
       thing you open when the image is wrong and you need to know which
       account and which route produced it. The two disabled entries are the
       honest half -- durableLocalRef is null and provenancePresent is false,
       so the controls exist, are reachable, and say which field made them
       unavailable rather than being silently omitted. */
    var m = r.media;
    if (m) {
      acts.push({ type: 'sep' });
      acts.push({ type: 'head',
        label: String(m.provider || '') + ' ' + DOT + ' ' + String(m.route || '') });
      if (m.providerEntryId) {
        acts.push({ value: 'provider_entry', label: 'Open provider entry', hint: m.providerEntryId });
      }
      if (m.accountProfileRef) {
        acts.push({ value: 'account_profile', label: 'Open account profile', hint: m.accountProfileRef });
      }
      if (m.mediaRouteId) {
        acts.push({ value: 'media_route', label: 'Open media route', hint: m.mediaRouteId });
      }
      acts.push({ value: 'provider_url', label: 'Open provider URL',
        disabled: !!m.expired,
        reason: m.expired ? ('expired ' + (m.expiredAgo || '') + ' of ' + (m.expiryWindow || '')) : '',
        sentence: m.expired ? (r.sentence || '') : '' });
      acts.push({ value: 'durable_copy', label: 'Open durable copy',
        disabled: !m.durableLocalRef, reason: 'durableLocalRef',
        sentence: m.durableLocalRef ? '' : (r.sentence || '') });
      acts.push({ value: 'provenance', label: 'Open provenance manifest',
        disabled: !m.provenancePresent, reason: String(m.provenanceStandard || ''),
        sentence: m.caveat || '' });
    }

    /* ---- R29, the gap this row actually has ---------------------------- */
    var t = r.truncation;
    if (t) {
      acts.push({ type: 'sep' });
      acts.push({ type: 'head',
        label: String(t.state || '') + ' ' + DOT + ' ' + String(t.gapClass || '') });
      acts.push({ value: 'gap_range', label: 'Open the gap', hint: t.byteRange || t.sequenceRange || '' });
    }

    acts.push({ type: 'sep' });
    acts.push({ value: 'compare', label: 'Set compare target' });
    acts.push({ value: 'export', label: 'Export record' });

    /* ---- the route OUT of a blocked state ------------------------------
       BLIND SPOT 1 in its artifacts form. Five rows ship allowedActionIds[]
       and the panel told the user they were blocked while withholding the
       only route out, which is the exact failure GI-017 exists to prevent.
       PMK.blockedActions is the kit's one reader of that field (it merges any
       hand-written actions[] first, without duplicates) and PMK.actionLabel
       derives the wording from the id, so nothing here invents a label. */
    var allowed = K.blockedActions(r);
    if (allowed.length) {
      acts.push({ type: 'sep' });
      allowed.forEach(function (a) { acts.push({ value: a.id, label: a.label }); });
    }
    if (r.permissionSnapshotId) {
      acts.push({ value: 'perm_snapshot', label: 'Open permission snapshot',
                  hint: r.permissionSnapshotId });
    }
    if (r.approvalScopeKey) {
      acts.push({ value: 'approval_scope', label: 'Open approval scope',
                  hint: r.approvalScopeKey });
    }
    if (r.status === 'prohibited' || r.status === 'blocked') {
      acts.push({ type: 'sep' });
      acts.push({
        value: 'apply', label: 'Apply', disabled: true,
        reason: blockedCode(r),
        sentence: blockedSay(r) || ''
      });
    }
    return acts;
  }

  function ctxTemplate(items) {
    return '<template data-pm-items>' + (items || []).map(function (it) {
      if (it.type === 'sep') return '<div data-sep></div>';
      if (it.type === 'head') return '<div data-head>' + esc(it.label) + '</div>';
      return '<div data-value="' + esc(it.value || '') + '"' +
        (it.disabled ? ' data-disabled' : '') +
        (it.reason ? ' data-reason="' + esc(it.reason) + '"' : '') +
        (it.sentence ? ' data-sentence="' + esc(it.sentence) + '"' : '') +
        '>' + esc(it.label) + '</div>';
    }).join('') + '</template>';
  }

  /* =======================================================================
     BLIND SPOT 20 — THE CONFIRMATION GATE
     -----------------------------------------------------------------------
     GitHub_Integration.md:L156 requires SCOPE, CONSEQUENCE and CONFIRMATION
     before a strong action executes. This panel shipped five egress actions
     as one-press menu items: Export record (panel), Export bundle, Export
     view, Import bundle, Export investigation, plus Export record on every
     one of 47 rows. Nothing asked, nothing stated a scope, and an export is
     the one action here that cannot be undone from inside the app, because
     the bytes have already left.

     PM.confirm has existed the whole time -- _pm-components.js:498, a modal
     sheet with a scrim, role="dialog", aria-modal, focus capture and no
     auto-close, documented at :9 as "replaces confirm()". Zero versions
     called it. Closing this needed no new component and no shared-layer
     change; it is wiring, and this is the wiring.

     WHERE THE TWO CLAUSES COME FROM, spelled so a reader can tell them apart:
       SCOPE is always the fixture and always UN-ELIDED. A row may be showing
       21 characters of a title; a sheet that names a truncated object has not
       named it, so the sheet states artifact_id, artifact_type and
       retention_class in full. Panel-level scopes state the real counts --
       47 of 421 -- rather than "all artifacts".
       CONSEQUENCE is the fixture wherever the fixture has one. Every gate
       driven by an allowedActionIds[] entry uses the ROW'S OWN `sentence`,
       which is exactly the consequence clause for that action and was written
       by the fixture for this purpose. For the four export/import gates the
       fixture ships no per-command consequence catalogue, so this file writes
       one short clause AT THE CALL SITE below. That is a REPORTED GAP, not a
       silent invention: _pm-data.js has no id-to-consequence map, the same
       absence already reported for command labels.

     THE ATTESTATION, and the one thing that is genuinely missing. An export
     bundle is an egress that carries a redaction profile, so it needs an
     ATTESTATION rather than an acknowledgement. PM.confirm has no checkbox
     and no second gate; what it has is a labelled confirm button, so the
     attestation is carried by the verb -- the button reads "Attest and
     export", and the body states, from the data, exactly what is being
     attested: 8 redactions across 4 records, and the bundle that
     artifact_preflight_drift currently blocks under its approval scope. That
     is the best available fix inside this file. A real attestation control
     (a checkbox that gates the confirm button) is a _pm-components.js change
     and is REPORTED, not patched here.

     WHAT IS NOT GATED, deliberately. Open, Load preview, Show in Usage /
     Ledger, Watch recording, Open sources, Set compare target, Refresh
     snapshot, Load older, and every one of the provider/gap/permission routes
     are reads. Gating a read teaches the user that the sheet means nothing,
     which is how a confirmation becomes a click-through.
     ======================================================================= */
  var GATED = {
    export_record:  { verb: 'Export records', danger: false },
    export_bundle:  { verb: 'Attest and export', danger: true },
    export_view:    { verb: 'Export view', danger: false },
    'import':       { verb: 'Import bundle', danger: true },
    export_inv:     { verb: 'Export investigation', danger: false },
    'export':       { verb: 'Export record', danger: false },
    'artifacts.regenerate':    { verb: 'Regenerate', danger: true },
    'artifacts.retry_write':   { verb: 'Retry write', danger: true },
    'artifacts.reseal_bundle': { verb: 'Re-seal bundle', danger: true },
    'artifacts.reverify':      { verb: 'Re-verify', danger: false }
  };

  /* Panel-wide facts, all counted from the rows rather than asserted. */
  function projFacts(R) {
    var rows = R.rows || [], p = R.paging || {};
    var f = { rows: rows.length, total: p.total == null ? rows.length : p.total,
              redRows: 0, redTotal: 0, record: 0, blocked: 0,
              retText: retMix(rows).text };
    rows.forEach(function (r) {
      var red = redactionOf(r);
      if (red) {
        f.redRows += 1;
        var n = /(\d+)/.exec(red);
        f.redTotal += n ? parseInt(n[1], 10) : 1;
      }
      if (recordOnlyOf(r)) f.record += 1;
      if (r.status === 'blocked' || r.status === 'prohibited') f.blocked += 1;
    });
    return f;
  }

  function redClause(f) {
    return f.redRows
      ? 'Redactions in scope: ' + f.redTotal + ' across ' + f.redRows + ' records.'
      : 'No redactions are in scope.';
  }

  /** The un-elided identity of ONE row, with both required classifications. */
  function rowScope(r) {
    return [r.id, r.kind, 'retention ' + (retOf(r) || 'absent')].join(' ' + DOT + ' ');
  }

  function gateCopy(act, R, r) {
    var f = projFacts(R);
    var scope, say, title;

    if (r && act !== 'export') {
      /* Driven by allowedActionIds[]: the row's own sentence IS the
         consequence, so nothing here is written by this file. */
      return { title: K.actionLabel(act) + '?',
               body: 'Scope: ' + rowScope(r) + '. ' + (r.sentence || '') };
    }
    if (act === 'export') {
      if (!r) return null;
      scope = rowScope(r);
      say = 'This record leaves the workspace.';
      var red = redactionOf(r);
      if (red) say += ' It carries ' + red + '.';
      if (r.status === 'blocked' || r.status === 'prohibited') {
        say += ' ' + blockedCode(r) + ' currently blocks it.';
      }
      if (recordOnlyOf(r)) say += ' The payload was ' + recordOnlyOf(r) + '; only the record exists.';
      return { title: 'Export this record?', body: 'Scope: ' + scope + '. ' + say };
    }
    if (act === 'export_bundle') {
      var bundles = R.bundles || [], members = 0, blockedBundle = null;
      bundles.forEach(function (bu) { members += (bu.members || []).length; });
      (R.rows || []).forEach(function (row) {
        if (!blockedBundle && row.family === 'bundle' && row.status === 'blocked') blockedBundle = row;
      });
      say = 'The bundle leaves the workspace with its redaction profile applied. ' + redClause(f);
      if (blockedBundle) {
        say += ' ' + blockedCode(blockedBundle) + ' blocks 1 bundle under approval scope ' +
               (blockedBundle.approvalScopeKey || 'unset') + '.';
      }
      say += ' Confirming attests the redaction profile.';
      return { title: 'Export evidence bundle?',
               body: 'Scope: ' + bundles.length + ' bundles ' + DOT + ' ' + members +
                     ' members. ' + say };
    }
    if (act === 'export_inv') {
      var inv = (R.bundles || []).length, mem = 0;
      (R.bundles || []).forEach(function (bu) { mem += (bu.members || []).length; });
      return { title: 'Export investigation?',
               body: 'Scope: ' + inv + ' casefiles ' + DOT + ' ' + mem +
                     ' members. The investigation record leaves the workspace. ' + redClause(f) };
    }
    if (act === 'import') {
      return { title: 'Import bundle?',
               body: 'Scope: this projection, ' + f.rows + ' of ' + f.total +
                     ' records. Imported records join the projection and are ' +
                     'attributed to the bundle they arrive in.' };
    }
    /* export_record and export_view: the whole projection. */
    title = act === 'export_view' ? 'Export this view?' : 'Export ' + f.rows + ' artifact records?';
    scope = f.rows + ' of ' + f.total + ' records ' + DOT + ' ' + f.retText;
    say = (act === 'export_view' ? 'The view leaves the workspace.'
                                 : 'These records leave the workspace.') + ' ' + redClause(f);
    if (f.record) say += ' ' + f.record + ' has no payload.';
    if (f.blocked) say += ' ' + f.blocked + ' are blocked and will not be included.';
    return { title: title, body: 'Scope: ' + scope + '. ' + say };
  }

  function rowFor(R, key) {
    var hit = null;
    (R.rows || []).forEach(function (r) { if (!hit && r && r.id === key) hit = r; });
    return hit;
  }

  function askGate(node, act) {
    var g = GATED[act];
    if (!g || !global.PM || !global.PM.confirm || !global.PM_DATA) return false;
    var R = global.PM_DATA.artifacts;
    var host = node && node.closest ? node.closest('[data-pm-key]') : null;
    var copy = gateCopy(act, R, host ? rowFor(R, host.getAttribute('data-pm-key')) : null);
    if (!copy) return false;

    /* DEFERRED BY ONE TASK, and the reason is a defect vF measured first.
       pm-menu dispatches pm:menuaction and THEN calls close(true), which
       calls trigger.focus(). Opening the sheet synchronously put the modal up
       and let the closing menu pull focus back out of it a moment later --
       document.activeElement reading .pm-menu-trigger with an aria-modal
       dialog open, which defeats the focus capture PM.confirm exists to
       provide. One macrotask lets the menu finish closing and refocus; the
       sheet then captures from there, which also makes the kebab the correct
       restore target on cancel. */
    global.setTimeout(function () {
      global.PM.confirm({
        title: copy.title,
        body: copy.body,
        confirmLabel: g.verb,
        cancelLabel: g.keep || 'Cancel',
        danger: !!g.danger,
        from: node
      });
    }, 0);
    return true;
  }

  function panelMenu(extra, R) {
    var mix = retMix((R && R.rows) || []);
    return K.overflow(([
      { type: 'head', label: 'Artifacts' },
      { value: 'export_record', label: 'Export record' },
      { value: 'export_bundle', label: 'Export bundle' },
      { value: 'export_view', label: 'Export view' },
      { value: 'import', label: 'Import bundle' },
      { type: 'sep' },
      { value: 'older', label: 'Load older artifacts' },
      { value: 'refresh', label: 'Refresh snapshot' },
      { value: 'compare', label: 'Set compare target' },
      /* retention_class as a panel-level axis. The audit's phrasing was "in
         no menu"; this is the menu, it is present at every width in all three
         variants, and the counts are the fixture's own. */
      { type: 'sep' },
      { type: 'head', label: 'Retention class' }
    ]).concat(RETENTION_ORDER.filter(function (k) { return mix.counts[k]; })
      .map(function (k) {
        return { value: 'ret:' + k, label: k, hint: String(mix.counts[k]) };
      })).concat(extra || []), 'Artifacts options');
  }

  function footer(R, cls) {
    var p = R.paging || {};
    var shown = p.shown == null ? (R.rows || []).length : p.shown;
    var total = p.total == null ? shown : p.total;
    return '<div class="' + cls + '">' +
      '<span class="pmk-note">showing ' + esc(shown) + ' of ' + esc(total) + '</span>' +
      K.btn('Load older') + '</div>';
  }

  /* =======================================================================
     STYLES — one element, three prefixes. Nothing here introduces a new
     color-mix() or backdrop-filter; --accent-soft is the :root-declared one.
     ======================================================================= */
  var CSS = [
    /* ---- shared atoms ---- */
    /* The pip lives INSIDE the 24px cell, never hanging off it. An
       absolutely positioned child that pokes past a position:relative
       parent enlarges that parent's scroll overflow, which is an R1
       clipped-overflow finding on every row in every combo. Four pixels of
       badge is not worth 38 findings. */
    '.x-gw{position:relative;display:flex;align-items:center;justify-content:center;',
    /* overflow:hidden is load-bearing, not cosmetic. The pip is absolutely
       positioned at the corner; any sub-pixel or theme-driven overhang past
       this box enlarges the parent's scroll overflow and lands as an R1 on
       EVERY row in EVERY combination -- measured at 1,248 findings, all of
       them "content is 4px wider than the box". Clipping a decorative badge
       at the gutter edge is invisible; the finding was not. */
    'flex:none;width:24px;height:24px;overflow:hidden}',
    '.x-kg{display:block;color:var(--text-muted)}',
    '.x-pip{position:absolute;right:0;bottom:0;width:12px;height:12px;',
    'border-radius:var(--radius-pill);background:var(--surface-elevated);',
    'display:flex;align-items:center;justify-content:center}',
    '.x-pip svg{display:block}',
    '.x-foot{display:flex;align-items:center;gap:var(--md);padding:var(--md);',
    'border-top:1px solid var(--border-light,var(--border));min-width:0}',
    '.x-foot .pmk-note{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;',
    'white-space:nowrap}',
    '.x-blk{display:flex;gap:var(--sm);padding:2px var(--md) var(--md) 34px;min-width:0;',
    'font-size:var(--fs-2xs);color:var(--text-secondary)}',
    '.x-blk-code{flex:none;font-family:var(--mono-font);color:var(--accent-warning)}',
    '.x-blk-say{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    /* The disclosure lines come in two weights, and the weight IS the
       distinction. A blocked reason, an expired provider URL and a truncation
       gap are things the user has to act on, so they keep the warning colour
       the blocked line has always had. A provider receipt, an eviction record
       and a projection_health token are things the user has to KNOW; painting
       seven extra warning-coloured lines onto a 47-row list would flatten the
       three that mean "act" into the four that mean "note". Same geometry,
       same budget, same elision -- one colour token apart. */
    '.x-blk--soft .x-blk-code{color:var(--text-secondary);font-weight:400}',

    /* ================================ xA1 ================================ */
    '.xA1-strip{gap:var(--sm)}',
    /* The legend WRAPS; it does not scroll. 19 x 26px is 494px against a
       364px band at 380px, so a single scrolling row hides five of the
       nineteen glyphs — which is a broken legend, and the fit checker
       agrees: every off-band button reads as R2 escapes-content-box. Two
       wrapped rows cost ~30px more height and hide nothing. */
    '.xA1-legend{gap:0;padding:var(--xs) var(--sm);min-height:32px;flex-wrap:wrap}',
    '.xA1-gbtn{flex:0 0 26px;width:26px;min-height:26px;display:flex;align-items:center;',
    'justify-content:center;border:0;background:transparent;cursor:pointer;padding:0;',
    'border-radius:var(--radius-xs);color:var(--text-muted)}',
    '.xA1-gbtn:hover{background:var(--accent-soft);color:var(--text-primary)}',
    '.xA1-gbtn:focus-visible{outline:2px solid var(--accent-primary);outline-offset:-2px}',
    '.xA1-gbtn[aria-pressed="true"]{background:var(--accent-soft);color:var(--text-primary)}',

    '.xA1-row{display:flex;align-items:center;gap:var(--sm);min-height:30px;',
    'padding:3px var(--md) 3px 0;min-width:0;cursor:pointer;',
    'color:var(--text-primary);font-size:var(--fs-xs);border-radius:var(--radius-xs)}',
    '.xA1-row:hover{background:var(--accent-soft)}',
    '.xA1-row:focus-visible{outline:2px solid var(--accent-primary);outline-offset:-2px}',
    '[data-theme^="friendly"] .xA1-row{min-height:34px}',
    '[data-theme^="retro"] .xA1-row{border-radius:0}',
    '.xA1-g{flex:0 0 31px;display:flex;align-items:stretch;gap:var(--sm);align-self:stretch}',
    '.xA1-g .pmk-rail{flex:0 0 3px;align-self:stretch;min-height:18px}',
    '.xA1-g .x-gw{align-self:center}',
    '.xA1-b{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:1px}',
    '.xA1-l1{display:flex;align-items:baseline;gap:var(--sm);min-width:0}',
    '.xA1-id{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    /* 138px, not 120: before_after_snapshot is 21 mono characters, which
       measures 126px in most families and 133px in basic-*. A kind label
       that ellipsizes is worse than no kind label, because the elided tail
       is exactly where the nineteen kinds differ from each other. */
    '.xA1-kt{flex:0 0 auto;max-width:138px;font-family:var(--mono-font);',
    'font-size:var(--fs-2xs);color:var(--text-muted);white-space:nowrap;overflow:hidden;',
    'text-overflow:ellipsis}',
    '.xA1-l2,.xA1-l3{display:flex;align-items:baseline;gap:var(--sm);min-width:0;',
    'overflow:hidden;font-size:var(--fs-2xs);color:var(--text-muted)}',
    '.xA1-prev{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.xA1-w{flex:0 0 auto;font-weight:600;white-space:nowrap}',
    '.xA1-w--warn{color:var(--accent-warning)}',
    '.xA1-w--err{color:var(--accent-error)}',
    '.xA1-t{flex:0 0 30px;width:30px;text-align:right;white-space:nowrap;overflow:hidden;',
    'text-overflow:ellipsis;font-size:var(--fs-2xs);color:var(--text-muted);',
    'font-variant-numeric:tabular-nums;align-self:flex-start;padding-top:1px}',

    /* ================================ xA2 ================================ */
    '.xA2-hd{display:flex;align-items:center;gap:var(--sm);width:100%;min-height:30px;',
    'padding:var(--sm) var(--md);border:0;background:var(--surface);cursor:pointer;',
    'text-align:left;color:var(--text-primary);font-family:var(--body-font);',
    'font-size:var(--fs-xs);font-weight:700;position:sticky;top:0;z-index:2;',
    'border-left:3px solid var(--accent-primary);min-width:0}',
    '.xA2-hd:hover{color:var(--text-primary);background:var(--accent-soft)}',
    '.xA2-hd:focus-visible{outline:2px solid var(--accent-primary);outline-offset:-2px}',
    '.xA2-hd-chev{flex:none;width:10px;height:10px;transform:rotate(90deg)}',
    /* STATE, not motion: the collapsed chevron. No transition is declared on
       it, because a rotating chevron is not one of the six shared primitives
       and a bespoke one here would need its own reduced-motion kill. The
       drawer itself is what moves (.pmm-sheet); the chevron just states which
       way it is. Never applies in the fit rig, which only ever builds the
       default open state. */
    '.xA2-hd[aria-expanded="false"] .xA2-hd-chev{transform:rotate(0deg)}',
    '.xA2-hd-t{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.xA2-hd-n{flex:none;font-weight:500;color:var(--text-muted);font-size:var(--fs-2xs)}',
    '.xA2-sum{display:flex;align-items:center;gap:var(--sm);min-width:0;overflow:hidden;',
    'padding:0 var(--md) var(--sm) 25px;font-size:var(--fs-2xs);color:var(--text-muted)}',
    '.xA2-ladder{display:flex;align-items:center;gap:0;min-width:0;overflow:hidden}',
    '.xA2-step{flex:none;padding:0 5px;white-space:nowrap}',
    '.xA2-step--on{color:var(--text-primary);font-weight:700}',
    '.xA2-sep{flex:none;width:8px;text-align:center;opacity:.5}',

    '.xA2-row{display:flex;align-items:center;gap:var(--sm);min-height:30px;',
    'padding:3px var(--md) 3px 0;min-width:0;cursor:pointer;color:var(--text-primary);',
    'font-size:var(--fs-xs);border-radius:var(--radius-xs)}',
    '.xA2-row:hover{background:var(--accent-soft)}',
    '.xA2-row:focus-visible{outline:2px solid var(--accent-primary);outline-offset:-2px}',
    '[data-theme^="friendly"] .xA2-row{min-height:34px}',
    '[data-theme^="retro"] .xA2-row{border-radius:0}',
    '.xA2-role{flex:0 0 44px;width:44px;white-space:nowrap;overflow:hidden;',
    'text-overflow:ellipsis;font-family:var(--display-font-sm,var(--body-font));',
    'font-size:var(--fs-2xs);font-weight:700;letter-spacing:.04em;color:var(--text-secondary)}',
    '.xA2-role--w{flex-basis:78px;width:78px}',
    '.xA2-code{flex:0 0 32px;width:32px;text-align:center;font-family:var(--mono-font);',
    'font-size:var(--fs-2xs);font-weight:600;color:var(--text-muted);white-space:nowrap;',
    'overflow:hidden}',
    '.xA2-b{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:1px}',
    '.xA2-id{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.xA2-id--rec{color:var(--text-muted);font-family:var(--mono-font)}',
    /* An EVICTED artifact keeps its real identity -- the record survived, so
       the title did too -- and only loses weight. --text-secondary rather
       than --text-muted so this needs no per-family AA exception. */
    '.xA2-id--dim{color:var(--text-secondary)}',
    '.xA2-l2{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;',
    'font-size:var(--fs-2xs);color:var(--text-muted)}',
    '.xA2-t{flex:0 0 30px;width:30px;text-align:right;white-space:nowrap;overflow:hidden;',
    'text-overflow:ellipsis;font-size:var(--fs-2xs);color:var(--text-muted);',
    'font-variant-numeric:tabular-nums}',

    /* ================================ xA3 ================================ */
    '.xA3-kh{display:flex;align-items:center;gap:var(--sm);width:100%;min-height:28px;',
    'padding:var(--xs) var(--md);border:0;background:var(--surface);cursor:pointer;',
    'text-align:left;position:sticky;top:0;z-index:2;min-width:0;',
    'border-bottom:1px solid var(--border-light,var(--border))}',
    '.xA3-kh:hover{background:var(--accent-soft)}',
    '.xA3-kh:focus-visible{outline:2px solid var(--accent-primary);outline-offset:-2px}',
    '.xA3-kh-chev{flex:none;width:10px;height:10px;color:var(--text-muted);transform:rotate(90deg)}',
    '.xA3-kh[aria-expanded="false"] .xA3-kh-chev{transform:rotate(0deg)}',
    '.xA3-kh-g{flex:none;display:flex;align-items:center;color:var(--text-muted)}',
    '.xA3-ktok{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;',
    'white-space:nowrap;font-family:var(--mono-font);font-size:var(--fs-2xs);',
    'font-weight:600;color:var(--text-primary);letter-spacing:.02em}',
    '.xA3-kn{flex:none;font-size:var(--fs-2xs);color:var(--text-muted);font-weight:500}',
    /* The run's retention class. Plain text, not a badge: the strict/open
       badge beside it is a claim about the SCHEMA and this is a fact about
       the rows, and two pills in one header would read as one control. */
    '.xA3-kret{flex:none;font-size:var(--fs-2xs);color:var(--text-secondary);',
    'font-weight:500;white-space:nowrap}',
    '.xA3-ret{color:var(--text-secondary);font-weight:500}',
    '.xA3-kc{flex:none;font-size:var(--fs-2xs);font-weight:600;padding:0 5px;',
    'border-radius:var(--radius-pill);border:1px solid var(--border-light,var(--border));',
    'color:var(--text-muted);white-space:nowrap}',
    '.xA3-kc--strict{color:var(--accent-primary);border-color:var(--accent-primary)}',

    '.xA3-row{display:flex;align-items:center;gap:var(--sm);min-height:30px;',
    'padding:3px var(--md) 3px 0;min-width:0;cursor:pointer;color:var(--text-primary);',
    'font-size:var(--fs-xs);border-radius:var(--radius-xs)}',
    '.xA3-row:hover{background:var(--accent-soft)}',
    '.xA3-row:focus-visible{outline:2px solid var(--accent-primary);outline-offset:-2px}',
    '[data-theme^="friendly"] .xA3-row{min-height:34px}',
    '[data-theme^="retro"] .xA3-row{border-radius:0}',
    '.xA3-b{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:1px}',
    '.xA3-id{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.xA3-l2{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;',
    'font-size:var(--fs-2xs);color:var(--text-muted)}',
    '.xA3-col{flex:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;',
    'font-size:var(--fs-2xs);color:var(--text-muted);text-align:right}',
    '.xA3-col--1{flex-basis:64px;width:64px}',
    '.xA3-col--2{flex-basis:92px;width:92px}',
    '.xA3-col--3{flex-basis:120px;width:120px}',
    '.xA3-w{font-weight:600}',
    '.xA3-w--warn{color:var(--accent-warning)}',
    '.xA3-w--err{color:var(--accent-error)}',
    '.xA3-t{flex:0 0 30px;width:30px;text-align:right;white-space:nowrap;overflow:hidden;',
    'text-overflow:ellipsis;font-size:var(--fs-2xs);color:var(--text-muted);',
    'font-variant-numeric:tabular-nums}',

    /* ---- basic-* AA floor. FinalGUISpec 13.1 mandates AA in the basic
       family specifically, and all three variants lean on --text-muted for
       the gutter glyph, line 2, the columns and the time. Scoped per
       version so this cannot repaint another version's stage. ---- */
    '[data-pm-version="xA1"][data-theme^="basic"] .x-kg,',
    '[data-pm-version="xA1"][data-theme^="basic"] .xA1-l2,',
    '[data-pm-version="xA1"][data-theme^="basic"] .xA1-l3,',
    '[data-pm-version="xA1"][data-theme^="basic"] .xA1-kt,',
    '[data-pm-version="xA1"][data-theme^="basic"] .xA1-t,',
    '[data-pm-version="xA1"][data-theme^="basic"] .xA1-gbtn,',
    '[data-pm-version="xA1"][data-theme^="basic"] .pmk-note,',
    '[data-pm-version="xA1"][data-theme^="basic"] .pmk-meta,',
    '[data-pm-version="xA1"][data-theme^="basic"] .pmk-meta-seg,',
    '[data-pm-version="xA1"][data-theme^="basic"] .pmk-meta-more,',
    '[data-pm-version="xA1"][data-theme^="basic"] .pmk-head-count{color:var(--text-secondary)}',
    '[data-pm-version="xA2"][data-theme^="basic"] .xA2-l2,',
    '[data-pm-version="xA2"][data-theme^="basic"] .xA2-t,',
    '[data-pm-version="xA2"][data-theme^="basic"] .xA2-code,',
    '[data-pm-version="xA2"][data-theme^="basic"] .xA2-sum,',
    '[data-pm-version="xA2"][data-theme^="basic"] .xA2-hd-n,',
    '[data-pm-version="xA2"][data-theme^="basic"] .xA2-empty,',
    '[data-pm-version="xA2"][data-theme^="basic"] .xA2-id--rec,',
    '[data-pm-version="xA2"][data-theme^="basic"] .pmk-note,',
    '[data-pm-version="xA2"][data-theme^="basic"] .pmk-sec-n,',
    '[data-pm-version="xA2"][data-theme^="basic"] .pmk-head-count{color:var(--text-secondary)}',
    '[data-pm-version="xA3"][data-theme^="basic"] .xA3-l2,',
    '[data-pm-version="xA3"][data-theme^="basic"] .xA3-t,',
    '[data-pm-version="xA3"][data-theme^="basic"] .xA3-col,',
    '[data-pm-version="xA3"][data-theme^="basic"] .xA3-kn,',
    '[data-pm-version="xA3"][data-theme^="basic"] .xA3-kc,',
    '[data-pm-version="xA3"][data-theme^="basic"] .xA3-kh-g,',
    '[data-pm-version="xA3"][data-theme^="basic"] .x-kg,',
    '[data-pm-version="xA3"][data-theme^="basic"] .pmk-note,',
    '[data-pm-version="xA3"][data-theme^="basic"] .pmk-head-count{color:var(--text-secondary)}',

    /* The state word is the one string a user must actually read, and
       --accent-warning on --surface measures 3.20:1 in the basic family —
       under the AA floor section 13.1 mandates for Basic specifically. Same
       two exceptions the kit already makes for .pmk-blocked-code, applied
       to the word that replaced the chip. The other six families clear it. */
    '[data-pm-version="xA1"][data-theme="basic-light"] .xA1-w--warn,',
    '[data-pm-version="xA3"][data-theme="basic-light"] .xA3-w--warn{color:#8A5200}',
    '[data-pm-version="xA1"][data-theme="basic-dark"] .xA1-w--warn,',
    '[data-pm-version="xA3"][data-theme="basic-dark"] .xA3-w--warn{color:#FFC14D}',
    '[data-pm-version="xA1"][data-theme="basic-light"] .xA1-w--err,',
    '[data-pm-version="xA3"][data-theme="basic-light"] .xA3-w--err{color:#A11212}',
    '[data-pm-version="xA1"][data-theme="basic-dark"] .xA1-w--err,',
    '[data-pm-version="xA3"][data-theme="basic-dark"] .xA3-w--err{color:#FF8B8B}',
    /* Same floor for the blocked reason code, which GI-017 requires the user
       actually read. This file owns .x-blk-code, so it owns the fix. */
    '[data-pm-version="xA1"][data-theme="basic-light"] .x-blk-code,',
    '[data-pm-version="xA2"][data-theme="basic-light"] .x-blk-code,',
    '[data-pm-version="xA3"][data-theme="basic-light"] .x-blk-code{color:#8A5200}',
    '[data-pm-version="xA1"][data-theme="basic-dark"] .x-blk-code,',
    '[data-pm-version="xA2"][data-theme="basic-dark"] .x-blk-code,',
    '[data-pm-version="xA3"][data-theme="basic-dark"] .x-blk-code{color:#FFC14D}',
    /* ...and the soft weight has to win back in the basic family, or the two
       rules above repaint every provider receipt, eviction record and health
       token as a warning and the distinction the weight exists to draw is
       gone in exactly the family that most needs it. Four selector tokens
       against three, so it outranks them; --text-secondary already clears the
       AA floor those rules were written to restore. */
    '[data-pm-version="xA1"][data-theme^="basic"] .x-blk--soft .x-blk-code,',
    '[data-pm-version="xA2"][data-theme^="basic"] .x-blk--soft .x-blk-code,',
    '[data-pm-version="xA3"][data-theme^="basic"] .x-blk--soft .x-blk-code{',
    'color:var(--text-secondary)}'
  ].join('');

  (function injectOnce() {
    if (!global.document) return;
    if (document.querySelector('style[data-pm-xart]')) return;
    var s = document.createElement('style');
    s.setAttribute('data-pm-xart', 'artifacts');
    s.appendChild(document.createTextNode(CSS));
    document.head.appendChild(s);
  })();

  /* =======================================================================
     xA1 — GLYPH COLUMN
     -----------------------------------------------------------------------
     THESIS. The kind is a picture, not a string. 19 canonical types get 19
     distinct 20px drawings, and that drawing shares one 31px gutter with
     the status rail and a 9px status pip — 31px total for two orthogonal
     facts, against the 21px the kit already spends on status alone and the
     45px a status mark plus a separate kind glyph would cost. Everything
     the gutter saves goes to the identity, which is the field the shipped
     panel starves. At 240px the identity measures 135px even in basic-*,
     the widest face — about 20 characters, against the four the shipped
     panel renders.

     The glyph column is also the FILTER. The legend strip above the list is
     not a lookup table you consult and leave; it is 19 toggle buttons in the
     same drawings, so the mapping is learned by using it. That is the only
     honest way to teach 19 icons, and it costs 32px of vertical chrome.

     ROW ANATOMY
       | rail | glyph+pip | Import quantity parser fix        |  6m |  ...
         3px    24px cell   identity: grows, elides, min 96px   30px  24px

     WIDTH LADDER (keyed off PM_DATA.bucket, never a continuum)
                    | 240 (b0)   | 320 (b1)      | 380 (b2)   | 480 (b3)
       lines        | 1          | 1, or 2 when  | 2          | 3
                    |            | state is not  |            |
                    |            | default       |            |
       identity px  | 135        | 215           | 275        | 241-320
        (measured in basic-light, the widest face; the JS budget below
         reserves ~16px more than this, deliberately, so no theme can be
         the one that overflows)
       legend strip | portaled   | portaled menu | 19 glyph   | 19 glyph
                    | menu       |               | toggles    | toggles
       line 2       | -          | state word    | word+meta  | preview
       line 3       | -          | -             | -          | word+meta
       meta cap     | -          | -             | 2 segments | 3 segments
       kind as TEXT | -          | -             | -          | right of id
       state word   | pip+rail   | pip+rail+word | + word     | + word
       blocked/proh | pip+rail   | pip+rail      | + reason   | + reason
                      + a11y lbl   + a11y lbl      sentence     sentence

     b1 is the interesting rung: rows are one line UNLESS the row has a
     non-default state, which is research/artifacts.md section 10's own
     recommendation ("line 2 exists only when a non-default state applies").
     It keeps a 38-row list dense while never hiding a blocked, stale,
     failed or redacted row.

     SLINT MAPPING. The gutter is a fixed-width HorizontalLayout holding a
     Rectangle (rail) and an Image or a Path set selected by an int
     kind-index — 19 compile-time Path constants, no runtime string work.
     The pip is a second Path in the same 20px cell, positioned by absolute
     x/y, which Slint does natively. The identity is the single
     horizontal-stretch Text with elide; every other slot is a fixed width
     included or excluded by the bucket int computed once in Rust. The
     legend strip is a Flickable with 19 TouchAreas. Nothing here needs a
     text measurement at layout time.

     HONEST WEAKNESS. Nineteen icons is past the number a person memorises,
     and the four evidence-document kinds (implementation_plan,
     reasoning_summary, suggested_next_steps, document) are the four most
     confusable drawings in the set precisely because they are the four most
     semantically adjacent kinds. Below 360px the legend collapses to a text
     menu, so at the exact width where the glyph is doing the most work the
     visual key is furthest away — the mapping is only recoverable per-row
     via hover tip or the overflow menu head. And the kind never appears as
     text on a row until 480px, so a user who cannot name the drawing cannot
     copy the type either.

     ACCEPTED ELLIPSIS. Titles run to 53 characters (the seriouseats fetch)
     against 20 at 240px and 42 at 380px, so long titles ellipsize at b0-b2.
     That is the correct slot to spend: the identity is the one compressible
     field by design, the kind and the state are dropped whole and never
     clipped, and the untruncated title is one tap down in the row menu.
     Note the ellipsis is COMPUTED, never styled — a sweep over all 8 themes
     and 4 widths finds zero rows where CSS had to clip the identity box.
     That claim went STALE when the fixture gained the evicted browser
     recording, and the sweep said so: PMK.elide's path branch has a floor
     ("…/basename" regardless of max) which handed the last 4-26px back to
     CSS on .xA1-id, .xA2-id and .xA3-id. elideIdent() re-elides past that
     floor, so the claim is true again and is measured rather than asserted.

     Also accepted, and not this file's to fix: PMK.lenses ships its chips at
     flex:0 1 auto, so the six family labels shrink and "Evidence 19" cuts by
     5-14px at 380px in the wider faces. That is shared kit behaviour, it is
     identical in every version that calls PMK.lenses, and overriding it here
     would hide a defect all of them share rather than fixing it.
     ======================================================================= */
  /* The legend's toggle state. A set of artifact_type keys; empty means "no
     kind filter". Module scope, like every other interactive variant in this
     bakeoff (x-source, x-docker, vC): a contact sheet holds eight stages and
     only the clicked one repaints, so the state is shared and the repaint is
     per-stage. Nothing here is read by the fit sweep, which builds fresh
     stages and never clicks. */
  var A1 = { kinds: {} };

  function panelGlyphColumn(D, state) {
    var b = D.bucket(state.width);
    var R = D.artifacts;
    var rows = (R.rows || []).slice();
    var theme = state.theme;

    /* --- explicit width budget, in JS, exactly as Slint would do it.
       Every fixed slot is counted WITH its gap, and a slot is taken only if
       what remains still clears the 96px identity floor. Nothing here
       shrinks: slots are present or absent. --- */
    var band = state.width - 16;             /* panel padding */
    var GUT = 31, PAD = 8, OF = 24, TIME = 30, GAP = 4;
    var avail = band - PAD - (GUT + GAP) - (OF + GAP) - (TIME + GAP);
    var kindTx = 0;
    if (b >= 3 && avail - (138 + GAP) >= 96) { kindTx = 138; avail -= kindTx + GAP; }
    var idMax = fits(Math.max(96, avail), theme);
    /* metaRun budgets in its own 6.2px/char units; basic-* runs 6.6, so the
       run is handed 85% of the true space rather than 100% of a number that
       is 6% optimistic in the widest theme. */
    var metaCap = [1, 1, 2, 3][b];
    var metaPx = function (hasWord) {
      return Math.max(56, Math.floor((avail - (hasWord ? 78 : 0)) * 0.85));
    };

    /* --- kind census, in fixture order, used by the legend strip ---
       Always taken over ALL rows, never the filtered set: the legend is a
       fixed 19-glyph key, and a legend that loses buttons as you filter stops
       being a key and becomes a second, worse list. */
    var order = [], census = {};
    rows.forEach(function (r) {
      if (!r || !r.kind) return;
      if (census[r.kind] == null) { census[r.kind] = 0; order.push(r.kind); }
      census[r.kind] += 1;
    });

    /* The legend IS the filter (see THESIS above), so it finally filters.
       Nothing else in the panel is keyed off this: the budget arithmetic, the
       census and the glyph set are identical filtered or not, which is why a
       filter change is a pure list swap and can be handed straight to the
       motion layer's list-enter primitive. */
    var picked = order.filter(function (k) { return !!A1.kinds[k]; });
    var shown = picked.length
      ? rows.filter(function (r) { return !!A1.kinds[r.kind]; })
      : rows;

    var head = K.head('Artifacts',
      b >= 2
        ? shown.length + ' ' + DOT + ' ' + (picked.length || order.length) + ' kinds'
        : String(shown.length),
      panelMenu(null, R));

    /* The kind menu appears ONLY below 360px. From 360px the legend strip
       below is itself the kind picker, and shipping both would put two
       controls for one axis in a 28px strip while squeezing the family
       lenses by 28px they need for their labels. */
    var strip = '<div class="pmk-strip xA1-strip">' +
      K.lenses((R.families || []).map(function (f) {
        return { id: f.id, label: f.label, count: String(f.count) };
      }), 'all', b, 'Artifact family') +
      (b >= 2 ? '' : K.overflow(
        (picked.length
          ? [{ value: 'all_kinds', label: 'Clear kind filter' }, { type: 'sep' }]
          : []).concat(order.map(function (k) {
            return { value: k, label: k + '  ' + census[k],
                     hint: A1.kinds[k] ? 'on' : '' };
          })), 'Kind legend and filter')) +
      '</div>';

    /* The legend strip: the glyph column's Rosetta stone AND the kind
       filter, in one control. Below 360px there is no room for 19 x 26px
       against a 224-304px band, so it collapses into the strip menu above.
       That is arithmetic (19 x 26 = 494px), not preference. */
    var legend = '';
    if (b >= 2) {
      legend = '<div class="pmk-strip xA1-legend" role="toolbar" ' +
        'aria-label="Filter by artifact kind">' +
        order.map(function (k) {
          return '<button type="button" class="xA1-gbtn" aria-pressed="' +
            (A1.kinds[k] ? 'true' : 'false') + '" data-xa1-kind="' + esc(k) + '" ' +
            'data-pm-tip="' + esc(k + ' (' + census[k] + ')') + '">' +
            kindSvg(k, 16) + '</button>';
        }).join('') + '</div>';
    }

    var body = '';
    shown.forEach(function (r) {
      var s = stateOf(r);
      var when = timeOf(r);
      /* retention_class LEADS the meta run. It is the one segment on this
         line the envelope guarantees -- 'lane-c' and 'node n-19' are payload
         conventions and may not exist at all -- so it takes the slot that
         survives longest, and PMK.metaRun's px budget drops from the tail
         with a +N exactly as it always did.
         The filter is a second, smaller fix: the state WORD is drawn from the
         meta run for a redacted row and from availability for an evicted one,
         so both used to print twice on the same line ("redacted 1" as the
         word and again as a segment). A segment that has been promoted to the
         word is no longer a segment. */
      var mrun = [retOf(r)].concat(bodyMeta(r)).filter(function (sg) {
        return sg && String(sg) !== s.word;
      });
      var wordTone = s.mark === 'failed' || s.mark === 'prohibited' ? ' xA1-w--err'
        : (s.mark === 'ok' ? '' : ' xA1-w--warn');
      var wordHtml = s.word
        ? '<span class="xA1-w' + wordTone + '">' + esc(s.word) + '</span>' : '';

      var l1 = '<span class="xA1-l1"><span class="xA1-id">' +
        esc(elideIdent(identLabel(r), idKindOf(r), idMax)) + '</span>' +
        (kindTx ? '<span class="xA1-kt">' + esc(r.kind) + '</span>' : '') + '</span>';

      var stack = l1;
      if (b === 1 && s.word) {
        stack += '<span class="xA1-l2">' + wordHtml + '</span>';
      } else if (b === 2) {
        stack += '<span class="xA1-l2">' + wordHtml +
          K.metaRun(mrun, b, { cap: metaCap, maxPx: metaPx(!!s.word) }) + '</span>';
      } else if (b >= 3) {
        stack += '<span class="xA1-l2"><span class="xA1-prev">' +
          esc(K.elide(r.preview || '', 'default', fits(avail, theme))) + '</span></span>';
        stack += '<span class="xA1-l3">' + wordHtml +
          K.metaRun(mrun, b, { cap: metaCap, maxPx: metaPx(!!s.word) }) + '</span>';
      }

      /* data-pm-key is the row's UN-ELIDED identity. The visible text may be
         a computed ellipsis, and a confirmation sheet that names a truncated
         object has not named it -- so the gate reads the id from here, never
         from the DOM text. Not an `id` attribute: panel markup carries none.
         Same attribute PMK.row already stamps, so the kit's list model and
         this file's gate agree without either knowing the other. */
      body += '<div class="xA1-row" tabindex="0" role="button" data-pm-ctx="Artifact actions"' +
        ' data-pm-key="' + esc(r.id || '') + '">' +
        gutter(r, 20, 'xA1-g') +
        '<span class="xA1-b">' + stack + '</span>' +
        '<span class="xA1-t">' + esc(when) + '</span>' +
        K.overflow(rowActions(r), 'Artifact actions') +
        ctxTemplate(rowActions(r)) +
        '</div>';

      /* Blocked and prohibited never hide their reason (GI-017 / RAP L2060),
         and neither now do an expired provider URL, a truncation gap, an
         evicted payload or a degraded projection. Below 360px the pip shape,
         the dashed rail and the gutter's accessible label carry all of them;
         from 360px each fact gets its own line under the row. */
      body += stateNotes(r, s, band - 42 - 118, theme, b);
    });

    return '<div class="pmk-panel">' + head + strip + legend +
      K.body(body, false) + footer(R, 'x-foot') + '</div>';
  }

  /* =======================================================================
     xA2 — CASEFILE
     -----------------------------------------------------------------------
     THESIS. Evidence is consumed by investigation, not by type. So the
     investigation is the primary object and the flat list is inverted: the
     panel opens as three casefiles whose members are ordered by the one
     axis that survives 240px — evidence_role, a 6-value closed enum with a
     deterministic order (baseline, repro, diagnosis, fix, verification,
     cleanup). Artifacts that belong to no casefile are not hidden; they
     become an explicitly labelled Unfiled pool, sectioned by family.

     Two consequences fall out and both are wins.

     First, inside a casefile the ROLE leads the row and the kind is
     demoted, exactly as research/artifacts.md section 5 requires. Role is
     3-12 characters against the kind's 9-21, it is ordered, and it answers
     "what is this row doing here", which the kind never does.

     Second, members are BOUND to real artifact rows. The fixtures give
     bundles as {role, kind} pairs and give 38 artifacts separately; the
     binding matches on kind, preferring a row whose meta names the bundle
     (two rows literally carry inv-import-7x and inv-scaling-3b). A bound
     member renders the artifact's own identity instead of repeating its
     type. Unbound members degrade to a mono kind token and read as
     record-only, which is exactly the RAP-020 posture for an evicted row:
     a missing member is never a missing line.

     Time is DROPPED from member rows at 240px. That is a deliberate
     exception to "relative time is never droppable": inside a casefile the
     ordering key is the role ladder, not the clock, so the age is the
     cheapest thing in the row. It returns at 320px. Unfiled rows keep their
     time at every width, because there the clock IS the order.

     ROW ANATOMY
       casefile   | > Mixed-fraction quantity collapse         fixed  5 |
                  |   strong  baseline > repro > diagnosis > fix > ver  |
       member     | |X| verif  cargo test - import worker suite    5m |
       unfiled    | |X| DIF   Servings scaling clamp and roundin   18m |

     WIDTH LADDER
                     | 240 (b0)  | 320 (b1)   | 380 (b2)    | 480 (b3)
       role column   | 44px, ab- | 44px, abb- | 78px, full  | 78px, full
                     | breviated | reviated   | words       | words
       kind on
        member row   | menu head | menu head  | line 2      | line 2
       kind on
        unfiled row  | menu head | 3-ltr code | code+line 2 | code+line 2
       member time   | dropped   | 30px       | 30px        | 30px
       unfiled time  | 30px      | 30px       | 30px        | 30px
       case header   | title+n   | + outcome  | + confidence| + role ladder
                     |           |            | + ladder    | + omitted
       identity px   | 131 mem   | 177 mem    | 203 mem     | 303 mem
        (measured,   | 145 unf   | 189 unf    | 249 unf     | 349 unf
         basic-light)
       role ladder   | -         | -          | budgeted, drops from the
                     |           |            | tail with a +N

     Role abbreviations at b0/b1 are a fixed table over a closed enum, not a
     text truncation: baseline->base, diagnosis->diag, verification->verif,
     cleanup->clean, attempts->tries, rollback->undo. A 6-value enum can
     afford a lookup; a 19-value one (the kind) cannot, which is the whole
     reason role leads and kind does not.

     SLINT MAPPING. Two struct types, one repeater each, inside one
     ListView: a casefile header row and an artifact row. The role column is
     a fixed-width Text bound to an enum-indexed string array (both the full
     and the abbreviated table are compile-time constants selected by the
     bucket int). The member binding is computed in Rust when the projection
     is built, not in the view, so the .slint file sees a flat
     [CaseGroup{header, members[]}] and never performs a join.

     HONEST WEAKNESS. With this fixture the inversion does not pay. Three
     bundles claim 17 member slots, only 15 bind to real rows (two render
     record-only), and 23 of the 38 artifacts land in the Unfiled pool — so
     23 of 40 rows, 58% of the panel, are the "exception", and the primary
     object covers a minority of the content.
     The design is right for a project with high bundling coverage and wrong
     for one without, and nothing in the panel can tell which you have until
     you scroll. Worse, the grouping fields it depends on are the ones the
     envelope cannot carry at all: investigation_id, evidence_role and
     verification_strength are absent from an additionalProperties:false
     envelope (research section 5), so every casefile here is built on a
     contract that is unvalidatable today.
     ======================================================================= */
  var ROLE_ORDER = ['baseline', 'repro', 'diagnosis', 'attempts', 'fix',
                    'verification', 'rollback', 'cleanup'];
  var ROLE_SHORT = {
    baseline: 'base', repro: 'repro', diagnosis: 'diag', attempts: 'tries',
    fix: 'fix', verification: 'verif', rollback: 'undo', cleanup: 'clean'
  };

  function bindCasefiles(R) {
    var used = {}, cases = [];
    (R.bundles || []).forEach(function (bu) {
      if (!bu) return;
      var members = (bu.members || []).map(function (m) {
        var pick = null;
        (R.rows || []).forEach(function (r, i) {          /* pass 1: named */
          if (pick || used[i] || !r || r.kind !== m.kind) return;
          if (metaOf(r).join(' ').indexOf(bu.id) < 0) return;
          pick = { r: r, i: i };
        });
        (R.rows || []).forEach(function (r, i) {          /* pass 2: kind */
          if (pick || used[i] || !r || r.kind !== m.kind) return;
          pick = { r: r, i: i };
        });
        if (pick) used[pick.i] = true;
        return { role: m.role, kind: m.kind, row: pick ? pick.r : null };
      });
      members.sort(function (a, c) {
        var ia = ROLE_ORDER.indexOf(a.role), ic = ROLE_ORDER.indexOf(c.role);
        return (ia < 0 ? 99 : ia) - (ic < 0 ? 99 : ic);
      });
      cases.push({ bundle: bu, members: members });
    });
    var unfiled = [];
    (R.rows || []).forEach(function (r, i) { if (!used[i]) unfiled.push(r); });
    return { cases: cases, unfiled: unfiled };
  }

  function panelCasefile(D, state) {
    var b = D.bucket(state.width);
    var R = D.artifacts;
    var theme = state.theme;
    var split = bindCasefiles(R);

    var PAD = 8, OF = 24, MARK = 21, GAP = 4, TIME = 30;
    var roleW = b >= 2 ? 78 : 44;
    var band = state.width - 16;
    var memTime = b >= 1;
    var memId = band - PAD - (MARK + GAP) - (roleW + GAP) - (OF + GAP) -
                (memTime ? TIME + GAP : 0);
    var codeW = b >= 1 ? 32 : 0;
    var unfId = band - PAD - (MARK + GAP) - (codeW ? codeW + GAP : 0) -
                (OF + GAP) - (TIME + GAP);
    var memMax = fits(Math.max(96, memId), theme);
    var unfMax = fits(Math.max(96, unfId), theme);

    var head = K.head('Artifacts',
      b >= 2
        ? split.cases.length + ' casefiles ' + DOT + ' ' + split.unfiled.length + ' unfiled'
        : split.cases.length + '/' + (R.rows || []).length,
      panelMenu([
        { type: 'sep' },
        { type: 'head', label: 'Investigation' },
        { value: 'export_inv', label: 'Export investigation' },
        { value: 'omitted', label: 'What was not carried forward' }
      ], R));

    var scopeOpts = [{ value: 'all', label: 'All casefiles', hint: String(split.cases.length) }];
    split.cases.forEach(function (c) {
      scopeOpts.push({ value: c.bundle.id, label: c.bundle.id, hint: String(c.members.length) });
    });
    scopeOpts.push({ value: 'unfiled', label: 'Unfiled only', hint: String(split.unfiled.length) });
    /* Retention as a SCOPE, not a decoration. In a casefile panel the
       question retention answers is which evidence will still exist when the
       investigation is reopened, so it belongs on the same control that picks
       what you are looking at. PMK.select's option template carries no
       separator or heading, so the class token is prefixed instead -- the
       cheapest honest way to keep two vocabularies apart in one flat list. */
    var retCount = retMix(R.rows || []).counts;
    RETENTION_ORDER.forEach(function (k) {
      if (retCount[k]) {
        scopeOpts.push({ value: 'ret:' + k, label: 'Retention: ' + k, hint: String(retCount[k]) });
      }
    });

    var strip = '<div class="pmk-strip">' +
      K.select('all', scopeOpts, { style: 'flex:1 1 96px' }) +
      (b >= 2 ? '<span class="pmk-strip-grow">' + K.filter('Filter evidence') + '</span>' : '') +
      '</div>';

    function memberRow(m) {
      var r = m.row;
      var proxy = r || { kind: m.kind, status: 'stale', meta: [], title: m.kind };
      var s = stateOf(proxy);
      var role = b >= 2 ? m.role : (ROLE_SHORT[m.role] || m.role);
      var acts = r ? rowActions(r) : [
        { type: 'head', label: m.kind },
        { value: 'record', label: 'Open owning record' },
        { value: 'why', label: 'Why this member is record-only' }
      ];
      var ident = r
        ? '<span class="xA2-id">' + esc(elideIdent(identLabel(r), idKindOf(r), memMax)) + '</span>'
        : '<span class="xA2-id xA2-id--rec">' + esc(K.elide(m.kind, 'default', memMax)) + '</span>';
      var l2 = '';
      if (b >= 2) {
        /* kind · retention · state. An unbound member has no envelope, so it
           has no retention_class either, and printing one would be inventing
           the exact field this design is being audited for. */
        l2 = '<span class="xA2-l2">' +
          esc(K.elide(m.kind + (r && retOf(r) ? ' ' + DOT + ' ' + retOf(r) : '') +
              (r ? '' : ' ' + DOT + ' record only') +
              (s.word ? ' ' + DOT + ' ' + s.word : ''), 'default', fits(memId, theme))) +
          '</span>';
      }
      var h = '<div class="xA2-row" tabindex="0" role="button" data-pm-ctx="Evidence actions"' +
        ' data-pm-key="' + esc((r && r.id) || '') + '">' +
        (r ? markOf(r, s) : K.statusMark(s.mark)) +
        '<span class="xA2-role' + (b >= 2 ? ' xA2-role--w' : '') + '" data-pm-tip="' +
        esc('evidence_role ' + DOT + ' ' + m.role) + '">' + esc(role) + '</span>' +
        '<span class="xA2-b">' + ident + l2 + '</span>' +
        (memTime ? '<span class="xA2-t">' + esc(timeOf(r)) + '</span>' : '') +
        K.overflow(acts, 'Evidence actions') + ctxTemplate(acts) + '</div>';
      /* A blocked row does not stop being blocked by being filed. The
         integrity-block row binds into a casefile as a member, so without
         this the casefile projection rendered four of the five mandated
         presentations and artifact_integrity_mismatch was the one that
         vanished -- silence, which RAP:L2060 treats the same as a collapse.
         Same gate, same budget and the same shared emitter as unfiledRow, so
         a member and an unfiled row spell the identical state identically.
         Guarded on r: an unbound member has no envelope to read a code from,
         and inventing one is the defect this whole block exists to undo. */
      if (r) h += stateNotes(r, s, band - 42 - 118, theme, b);
      return h;
    }

    function unfiledRow(r) {
      var s = stateOf(r);
      var acts = rowActions(r);
      var l2 = '';
      if (b >= 2) {
        l2 = '<span class="xA2-l2">' +
          esc(K.elide(r.kind + (retOf(r) ? ' ' + DOT + ' ' + retOf(r) : '') +
                      (s.word ? ' ' + DOT + ' ' + s.word : ''),
                      'default', fits(unfId, theme))) + '</span>';
      }
      /* B11. This design was pass 1's only holder of the record-backed view
         (RAP-020) and the re-audit dropped it to `~` for an exact reason: the
         mechanism was keyed to an UNBOUND BUNDLE MEMBER, not to artifact
         state, so when the fixture finally shipped a real evicted artifact
         carrying availability, recordOnly, an evictionReason and a sentence,
         the one design that models eviction rendered it as an ordinary row.
         The record-only treatment is now keyed to the STATE: the same mono
         dimmed identity a record-only member gets, the same disabled preview
         with its reason, and the eviction line under the row. */
      var rec = recordOnlyOf(r);
      var h = '<div class="xA2-row" tabindex="0" role="button" data-pm-ctx="Artifact actions"' +
        ' data-pm-key="' + esc(r.id || '') + '">' +
        markOf(r, s) +
        (codeW ? '<span class="xA2-code" data-pm-tip="' + esc(r.kind) + '">' +
          esc(KIND_CODE[r.kind] || '---') + '</span>' : '') +
        '<span class="xA2-b"><span class="xA2-id' + (rec ? ' xA2-id--dim' : '') + '">' +
        esc(elideIdent(identLabel(r), idKindOf(r), unfMax)) + '</span>' + l2 + '</span>' +
        '<span class="xA2-t">' + esc(timeOf(r)) + '</span>' +
        K.overflow(acts, 'Artifact actions') + ctxTemplate(acts) + '</div>';
      /* Blocked and prohibited never hide their reason, and neither do the
         four states beside them. Below 360px the dashed rail, the mark glyph
         and the accessible label carry them; from 360px each renders its own
         code and its own sentence inline. */
      h += stateNotes(r, s, band - 42 - 118, theme, b);
      return h;
    }

    var body = '';
    split.cases.forEach(function (c) {
      var bu = c.bundle;
      var bound = 0;
      c.members.forEach(function (m) { if (m.row) bound += 1; });
      var titleMax = fits(Math.max(96, band - 8 - 10 - 4 - 40 - (b >= 1 ? 62 : 0)), theme);

      body += '<button type="button" class="xA2-hd" aria-expanded="true">' +
        K.icon('chev', 10, 'xA2-hd-chev') +
        '<span class="xA2-hd-t">' + esc(K.elide(bu.title || bu.id, 'default', titleMax)) + '</span>' +
        (b >= 1 ? K.chip(bu.outcome, bu.outcome === 'fixed' ? 'ok' : 'warn') : '') +
        '<span class="xA2-hd-n">' + c.members.length + '</span></button>';

      /* Everything below the header is the DRAWER: the summary line and the
         member rows, collected into one string and wrapped once. The header
         itself stays outside it -- .xA2-hd is position:sticky inside .pmk-body
         and a clipping wrapper around a sticky element kills the stick
         (_pm-motion.css, "no animation on .pmk-sec itself"). */
      var inner = '';

      if (b >= 2) {
        /* The role ladder is the one run in this design that can genuinely
           bust its box: six steps of 3-6 characters plus separators measure
           ~300px against a 263px summary line at 380px. So it is budgeted in
           JS and steps are dropped WHOLE from the tail with a +N, exactly
           like PMK.metaRun -- the ladder is ordered, so dropping from the
           tail keeps the phases the user reads first. */
        var recW = (b >= 3 && bound < c.members.length) ? 104 : 0;
        var lbudget = Math.max(56, band - 25 - 8 - 80 - recW -
                               (c.members.length > 3 ? 28 : 0));
        var lused = 0, lshown = [], lhidden = 0;
        c.members.forEach(function (m) {
          var lbl = ROLE_SHORT[m.role] || m.role;
          var w = String(lbl).length * px1(theme) + 10 + (lshown.length ? 8 : 0);
          if (!lhidden && lused + w <= lbudget) { lused += w; lshown.push({ m: m, lbl: lbl }); }
          else lhidden += 1;
        });
        if (!lshown.length && c.members.length) {
          lshown.push({ m: c.members[0], lbl: ROLE_SHORT[c.members[0].role] || c.members[0].role });
          lhidden = c.members.length - 1;
        }
        var ladder = '<span class="xA2-ladder">' + lshown.map(function (e, i) {
          return (i ? '<span class="xA2-sep" aria-hidden="true">' + DOT + '</span>' : '') +
            '<span class="xA2-step' + (e.m.row ? ' xA2-step--on' : '') + '">' +
            esc(e.lbl) + '</span>';
        }).join('') +
          (lhidden ? '<span class="xA2-step">+' + lhidden + '</span>' : '') + '</span>';
        inner += '<div class="xA2-sum">' + K.chip(bu.confidence, 'ok') + ladder +
          (b >= 3 && bound < c.members.length
            ? '<span class="xA2-step">' + (c.members.length - bound) + ' record only</span>' : '') +
          '</div>';
      }

      c.members.forEach(function (m) { inner += memberRow(m); });

      /* MOTION primitive 4 (sheet). The in-flow variant, because the drawer
         pushes the next casefile down rather than covering it. Rendered OPEN
         and SETTLED: is-open is the state, pmm-settled releases the clip that
         only matters while the box is moving, so with no JS run yet (the fit
         rig never clicks) this measures byte-for-byte what it measured before
         -- one grid row at 1fr holding one block child at overflow:visible.
         Exactly one element child, which is what .pmm-sheet requires; two or
         more and PMM.sheet degrades to the no-animation static path. */
      body += '<div class="pmm-sheet is-open pmm-settled">' +
        '<div class="pmm-sheet-in">' + inner + '</div></div>';
    });

    /* The Unfiled pool, sectioned by family. It is a peer of the casefiles,
       not a footnote, because with this fixture it is the majority. */
    var fams = [];
    split.unfiled.forEach(function (r) { if (fams.indexOf(r.family) < 0) fams.push(r.family); });
    if (!split.unfiled.length) {
      body += K.empty('no-data', 'Every artifact is filed',
        'All artifacts in this projection belong to a casefile.');
    }
    fams.forEach(function (fam) {
      var inFam = split.unfiled.filter(function (r) { return r.family === fam; });
      var label = fam;
      (R.families || []).forEach(function (f) { if (f.id === fam) label = f.label; });
      body += K.section('Unfiled ' + DOT + ' ' + label, inFam.length, true);
      inFam.forEach(function (r) { body += unfiledRow(r); });
    });

    return '<div class="pmk-panel">' + head + strip +
      K.body(body, false) + footer(R, 'x-foot') + '</div>';
  }

  /* =======================================================================
     xA3 — MONOCULTURE
     -----------------------------------------------------------------------
     THESIS. If the kind cannot fit on the row, take it off the row. The
     list is never heterogeneous: it is a sequence of homogeneous RUNS under
     sticky type headers, so artifact_type is stated exactly once per run,
     full-width, unabbreviated, in mono, at the one place there is room for
     21 characters — and a row never spends a pixel on it. The row's leading
     slot is therefore the status mark and nothing else, and the identity
     starts 21px from the panel edge at every width including 240.

     Because every row inside a run shares a type, the row shape can
     SPECIALISE to it, which no flat list can do:

       - api_web_call strips the redundant "Searching Web: " / "Fetching
         Web: " prefix from the identity — the run header already said the
         type — and recovers those 15 characters for the query itself. The
         lost search-vs-fetch distinction returns as the run's own column,
         derived from cmd.chat.web.<op>, which is the strict schema's
         web_operation field.
       - browser_recording's column is the redaction count.
       - code_diff's is the file count, validation_test's the retry
         relation, cost_usage/restore_point/hitl_approval the settlement
         word.

     And the header states, from bucket 2, whether the type has a payload
     contract at all. Five of nineteen do (api_web_call, browser_recording,
     cost_usage, tool_llm_trace, restore_point); the other fourteen are
     literally {"type":"object","minProperties":1}, so their rows can only
     carry envelope fields. Every other design in this bakeoff silently
     invents per-kind metadata for kinds that have none. This one labels the
     run "open" and renders envelope fields only. That is the honest
     surface, and it is a spec finding made visible rather than a caption.

     Note what the sectioning reveals: document, screenshot and
     before_after_snapshot each appear in TWO families. Kind cuts across
     family, which is why the family chips the shipped panel leads with are
     the wrong primary axis.

     WIDTH LADDER
                     | 240 (b0)  | 320 (b1)  | 380 (b2)   | 480 (b3)
       type          | run header| run header| run header | run header
       scope control | PMK.select (all / 5 families / 19 kinds), all widths
       per-kind col  | -         | 64px,     | 92px, kind-| 120px, kind-
                     |           | shortest  | native seg | native seg
                     |           | segment   |            |
       identity px   | 145       | 157       | 189        | 261
        (measured in basic-light, the widest face)
       line 2        | -         | -         | preview    | preview
       payload badge | -         | -         | strict/open| strict/open
       header glyph  | -         | -         | 14px kind  | 14px kind
       state word    | mark only | mark only | in line 2  | in line 2
       blocked/proh  | mark only | mark only | + reason   | + reason

     The column is dropped WHOLE by an arithmetic budget, never shrunk: a
     column is taken only if what remains still clears the 96px identity
     floor. At b1 it shows the SHORTEST segment of the meta run and from b2
     the kind-native one, because a 64px column cannot hold "retry 2 of 2"
     and clipping it would say less than "lane-b" says.

     SLINT MAPPING. One ListView with two delegate types (run header, row)
     selected by a discriminant on a flat model — Slint has no nested
     ListView and this design does not need one. The per-kind column is a
     string precomputed in Rust when the projection is built, so the view
     performs no per-kind branching at all; the .slint file sees
     [Section{type_token, count, strict:bool}] and [Row{ident, col, time}].
     The scope selector is a ComboBox over one flat option list.

     HONEST WEAKNESS. Nineteen sticky headers cost about 550px of pure
     chrome for 38 rows in the default all-kinds scope — a third of the
     1,676px scroll height at 240px and a quarter of the 2,127px at 480px —
     and the smallest runs are a header over a single row. The design only pays for itself once you have filtered — which is
     what filter-as-structure means, but it also means the user who never
     touches the selector gets the LEAST dense list of the three variants,
     not the most. And filter state is not in artifact_panel_state.v1
     (research section 4), so the scope this design depends on resets on
     reload: the one variant that requires filtering is the one whose filter
     does not persist.
     ======================================================================= */
  var COL_PREF = {
    api_web_call: [/^cmd\.chat\.web\./, /sources?$/],
    browser_recording: [/^redacted/],
    code_diff: [/files?$/],
    validation_test: [/retry/],
    screenshot: [/captures?$/],
    before_after_snapshot: [/states?$/],
    tool_llm_trace: [/^cache/],
    cost_usage: [/^measured|^estimated/],
    restore_point: [/^verified/],
    hitl_approval: [/^pending/],
    context_snapshot: [/^pre-|^post-/],
    implementation_plan: [/^revision/],
    reasoning_summary: [/^redacted/],
    suggested_next_steps: [/^advisory/],
    document: [/^draft|^snapshot/],
    artifact_version: [/^v\d/],
    subagent_lineage: [/^inv-/],
    evidence: [/^inv-/],
    failed_attempts: [/^inv-/]
  };

  /* `skip` is the row's state word. The column picks a kind-native segment out
     of the meta run, and the meta run is also where two of the state words
     come from -- redaction from "redacted 2", availability from "evicted" --
     so promoting one of those to the word turned the column into an echo of
     it ("evicted · session   evicted"). A segment that is already the word is
     not kind-native information; it is the same fact twice, and the column's
     whole job is to say something the row does not. */
  function colOf(r, b, skip) {
    var segs = bodyMeta(r).filter(function (s) { return String(s) !== skip; });
    if (!segs.length) return '';
    if (b <= 1) {                                  /* shortest informative */
      var best = segs[0];
      segs.forEach(function (s) { if (String(s).length < String(best).length) best = s; });
      return String(best);
    }
    var prefs = COL_PREF[r.kind] || [];
    var hit = null;
    prefs.forEach(function (re) {
      if (hit) return;
      segs.forEach(function (s) { if (!hit && re.test(String(s))) hit = String(s); });
    });
    if (!hit) hit = String(segs[0]);
    /* api_web_call's command id is 19 characters and the run header already
       names the type; only the operation is new information. */
    var op = /^cmd\.chat\.web\.(\w+)$/.exec(hit);
    return op ? op[1] : hit;
  }

  var IDENT_STRIP = {
    searchingweb: 1, fetchingweb: 1, savedpage: 1, browsercapture: 1,
    investigationlineage: 1, evidencebundle: 1
  };

  function identOf(r) {
    var t = String(identLabel(r) || '');
    var at = t.indexOf(': ');
    if (at > 0 && at <= 24) {
      var key = t.slice(0, at).toLowerCase().replace(/[^a-z]/g, '');
      if (IDENT_STRIP[key]) return t.slice(at + 2);
    }
    return t;
  }

  function panelMonoculture(D, state) {
    var b = D.bucket(state.width);
    var R = D.artifacts;
    var rows = (R.rows || []).slice();
    var theme = state.theme;

    var PAD = 8, OF = 24, MARK = 21, GAP = 4, TIME = 30;
    var band = state.width - 16;
    var colW = [0, 64, 92, 120][b] || 0;
    var idPx = band - PAD - (MARK + GAP) - (OF + GAP) - (TIME + GAP);
    var useCol = colW > 0 && (idPx - (colW + GAP)) >= 96;
    if (useCol) idPx -= colW + GAP;
    var idMax = fits(Math.max(96, idPx), theme);

    /* retOf[kind] collects the DISTINCT retention classes inside each run.
       This is the monoculture-native answer to blind spot 4 and it falls
       straight out of the thesis: 17 of the 19 types are retained uniformly
       (every code_diff is `project`, every validation_test is `governed`,
       every tool_llm_trace is `debug_retained`), so for 17 runs the class is
       a property of the RUN and belongs in the header exactly where the type
       token already is -- stated once, unabbreviated, costing the rows
       nothing. Only screenshot and browser_recording are mixed, and those two
       runs pay for it per row, on line 2, which is the correct place for a
       fact that varies inside a run. A flat list cannot make that
       distinction; this one gets it for free. */
    var order = [], census = {}, famOf = {}, retSet = {};
    rows.forEach(function (r) {
      if (!r || !r.kind) return;
      if (census[r.kind] == null) {
        census[r.kind] = 0; order.push(r.kind); famOf[r.kind] = {}; retSet[r.kind] = [];
      }
      census[r.kind] += 1;
      famOf[r.kind][r.family] = 1;
      if (retOf(r) && retSet[r.kind].indexOf(retOf(r)) < 0) retSet[r.kind].push(retOf(r));
    });
    function uniformRet(kind) {
      var v = retSet[kind] || [];
      return v.length === 1 ? v[0] : '';
    }

    var head = K.head('Artifacts',
      b >= 2 ? rows.length + ' in ' + order.length + ' types' : String(rows.length),
      panelMenu([
        { type: 'sep' },
        { value: 'schema', label: 'Which types constrain their payload' }
      ], R));

    var scopeOpts = [{ value: 'all', label: 'All kinds', hint: String(rows.length) }];
    (R.families || []).forEach(function (f) {
      if (f.id === 'all') return;
      scopeOpts.push({ value: 'fam:' + f.id, label: f.label + ' family', hint: String(f.count) });
    });
    order.forEach(function (k) {
      scopeOpts.push({
        value: 'kind:' + k, label: k, hint: String(census[k]) + (STRICT[k] ? '  strict' : '')
      });
    });

    var strip = '<div class="pmk-strip">' +
      K.select('all', scopeOpts, { style: 'flex:1 1 96px' }) +
      (b >= 2 ? '<span class="pmk-strip-grow">' + K.filter('Filter artifacts') + '</span>' : '') +
      '</div>';

    var body = '';
    order.forEach(function (kind) {
      var famList = Object.keys(famOf[kind] || {});
      var uret = uniformRet(kind);
      body += '<button type="button" class="xA3-kh" aria-expanded="true">' +
        K.icon('chev', 10, 'xA3-kh-chev') +
        (b >= 2 ? '<span class="xA3-kh-g">' + kindSvg(kind, 14) + '</span>' : '') +
        '<span class="xA3-ktok">' + esc(kind) + '</span>' +
        (b >= 2 && uret ? '<span class="xA3-kret" data-pm-tip="' +
          esc('retention_class ' + DOT + ' every artifact in this run is ' + uret) + '">' +
          esc(uret) + '</span>' : '') +
        (b >= 2
          ? '<span class="xA3-kc' + (STRICT[kind] ? ' xA3-kc--strict' : '') + '" data-pm-tip="' +
            esc(STRICT[kind]
              ? 'This type constrains type_payload, so its rows can carry kind-native fields'
              : 'type_payload is unconstrained for this type, so rows carry envelope fields only') +
            '">' + (STRICT[kind] ? 'strict' : 'open') + '</span>'
          : '') +
        '<span class="xA3-kn">' + census[kind] +
        (b >= 3 && famList.length > 1 ? ' ' + DOT + ' ' + famList.length + ' families' : '') +
        '</span></button>';

      /* The run body, collected then wrapped once. The sticky .xA3-kh header
         stays OUTSIDE the wrapper: .pmm-expand is a clipping grid box and
         wrapping a position:sticky element in one kills the stick, which is
         the whole load-bearing idea of this design. */
      var run = '';

      rows.forEach(function (r) {
        if (r.kind !== kind) return;
        var s = stateOf(r);
        var acts = rowActions(r);
        var wordTone = s.mark === 'failed' || s.mark === 'prohibited' ? ' xA3-w--err'
          : (s.mark === 'ok' ? '' : ' xA3-w--warn');
        var l2 = '';
        if (b >= 2) {
          /* LINE 2 IS A BUDGET, NOT A CONCATENATION. Three runs compete for
             it -- the state word, the row's own retention class (mixed runs
             only, since a uniform run states it once in the header) and the
             preview -- and each is taken WHOLE only if what is left still
             holds it. Priority is act > guaranteed > courtesy: the state word
             is what a user has to respond to, retention_class is the field
             the envelope promises on every row, and the preview is the one
             that can be recovered by opening the artifact.

             THE PREVIEW HAS NO FLOOR, and removing that floor is the fix.
             `Math.max(8, prevMax)` forced eight characters of preview into a
             line that had room for none, and the row then overran .xA3-l2 and
             took a CSS ellipsis -- a styled clip on a line this file says is
             always computed. Measured at basic-* 380px on the two
             debug_retained recordings, 4-7px cut. PMK.metaRun deleted its own
             identical floor for the identical reason. */
          var budget = fits(idPx, theme);
          var runs = [];
          if (s.word) runs.push({ cls: 'xA3-w' + wordTone, txt: String(s.word) });
          if (!uret && retOf(r)) runs.push({ cls: 'xA3-ret', txt: retOf(r) });
          var used = 0, kept = [];
          runs.forEach(function (rn) {
            var cost = rn.txt.length + (kept.length ? 3 : 0);
            if (used + cost <= budget) { used += cost; kept.push(rn); }
          });
          var room = budget - used - (kept.length ? 3 : 0);
          var prev = room >= 8 ? K.elide(r.preview || '', 'default', room) : '';
          l2 = '<span class="xA3-l2">' +
            kept.map(function (rn, i) {
              return (i ? '<span aria-hidden="true"> ' + DOT + ' </span>' : '') +
                '<span class="' + rn.cls + '">' + esc(rn.txt) + '</span>';
            }).join('') +
            (prev
              ? (kept.length ? '<span aria-hidden="true"> ' + DOT + ' </span>' : '') + esc(prev)
              : '') + '</span>';
        }
        var col = useCol ? colOf(r, b, s.word) : '';
        run += '<div class="xA3-row" tabindex="0" role="button" data-pm-ctx="Artifact actions"' +
          ' data-pm-key="' + esc(r.id || '') + '">' +
          markOf(r, s) +
          '<span class="xA3-b"><span class="xA3-id">' +
          esc(elideIdent(identOf(r), idKindOf(r), idMax)) + '</span>' + l2 + '</span>' +
          (useCol
            ? '<span class="xA3-col xA3-col--' + b + '">' +
              esc(K.elide(col, 'default', fits(colW - 6, theme))) + '</span>'
            : '') +
          '<span class="xA3-t">' + esc(timeOf(r)) + '</span>' +
          K.overflow(acts, 'Artifact actions') + ctxTemplate(acts) + '</div>';

        run += stateNotes(r, s, idPx, theme, b);
      });

      /* MOTION primitive 1 (expand). Rendered open and settled, so the
         default state is identical to what this design measured before: 1fr
         and overflow:visible. The inner div is the ONE element child
         .pmm-expand needs -- 0fr sizes the first grid row only, so a wrapper
         holding 6 rows directly would not collapse. */
      body += '<div class="pmm-expand is-open pmm-settled"><div>' + run + '</div></div>';
    });

    return '<div class="pmk-panel">' + head + strip +
      K.body(body, false) + footer(R, 'x-foot') + '</div>';
  }

  /* =======================================================================
     MOTION — three primitives from the shared layer, one per variant
     -----------------------------------------------------------------------
     This file declares NO @keyframes, no transition and no duration of its
     own. Everything below either adds a shared class or calls a PMM helper,
     so all three variants inherit the same per-family personality (retro
     snappy, basic 2px and no stagger, glass fluid, friendly springy) and the
     same reduced-motion kill, which lives once in _pm-motion.css and is
     honoured by [data-motion="reduced"] and prefers-reduced-motion alike.

         xA1  primitive 3, list enter   .pmm-enter via PMM.enter()
         xA2  primitive 4, sheet        .pmm-sheet  via PMM.sheet()
         xA3  primitive 1, expand       .pmm-expand via PMM.expand()

     WHAT MOVES, AND WHY ONLY THAT
     A dense IDE panel earns motion only where a thing genuinely changed
     identity. Each variant has exactly one such moment and it is the one the
     design is built around: xA1's legend is the filter, so the list it
     produces is what re-enters; xA2's casefile is a drawer of members; xA3's
     run is a collapsible homogeneous block. Nothing animates on a plain
     render — the harness rebuilds every stage on every width-slider input
     event, and a list that fades in 60 times a second while you drag is not
     motion design, it is a strobe. The row list re-enters when the FILTER
     changed, never when the panel merely repainted.

     NOT USED, DELIBERATELY
       push/pop  none of the three is a navigation stack; they are all one
                 flat scroller.
       lens      xA1's family strip is the F3-445 strip and the indicator
                 would fit it, but a filter change here rebuilds the whole
                 panel, so the indicator element is destroyed and recreated
                 and has no previous position to travel FROM. A slide that
                 cannot slide is worse than the kit's static underline, which
                 is also what the strip paints before any JS has run at all.
       flash     nothing in an artifact projection changes under the user;
                 the fixture is a snapshot.

     WHAT THIS COST STRUCTURALLY (the whole list)
       1. xA2 wraps each casefile's summary + members in
          .pmm-sheet > .pmm-sheet-in, xA3 wraps each run's rows in
          .pmm-expand > div. Both primitives size a grid row from 0fr to 1fr
          and BOTH require exactly one element child, so the wrapper pair is
          the mechanism, not decoration. Both render is-open + pmm-settled,
          which is 1fr with overflow:visible — the same box the fit checker
          measured before. Sticky headers stay OUTSIDE the wrapper.
       2. The legend buttons gained data-xa1-kind, and the b0/b1 kind menu
          gains a "Clear kind filter" item ONLY while a filter is on.
       3. Two static (unanimated) rules flip the chevron when a header is
          collapsed — a state, not a motion.
     No spacing, no sizing, no content and no width arithmetic changed.
     ======================================================================= */
  function stageOf(node, ver) {
    var s = node && node.closest ? node.closest('.pm-stage') : null;
    return s && s.getAttribute('data-pm-version') === ver ? s : null;
  }

  /* Rebuild the config FROM THE STAGE, never from PM_BAKEOFF.state: contact
     mode paints eight stages at eight themes at once, and the shell already
     records what happens when a renderer is handed the control bar's config
     instead of its own. */
  function cfgOf(stage) {
    var w = parseInt(stage.style.getPropertyValue('--files-panel-w'), 10);
    return {
      version: stage.getAttribute('data-pm-version'),
      panel: stage.getAttribute('data-pm-panel'),
      theme: stage.getAttribute('data-theme') || 'glass-dark',
      width: w > 0 ? w : 380,
      density: stage.getAttribute('data-density') || 'comfortable',
      motion: stage.getAttribute('data-motion') || 'full'
    };
  }

  function repaint(stage, fn) {
    if (!stage || stage.getAttribute('data-pm-panel') !== 'artifacts') return null;
    var view = stage.querySelector('[data-pm-panelview]');
    if (!view) return null;
    view.innerHTML = fn(global.PM_DATA, cfgOf(stage));
    if (global.PM && global.PM.mountAll) global.PM.mountAll(view);
    return view;
  }

  /* xA1. Swap the list, then hand the fresh scroller to primitive 3. Its
     children are the rows, the cascade is capped at four steps by the CSS,
     and basic-* sets the step to 0ms so the accessibility theme gets one
     collective 2px fade with no cascade at all. PMM.enter is a no-op under
     reduced motion; the rows are already at their natural opacity. */
  function refilterA1(stage, focusKind) {
    var view = repaint(stage, panelGlyphColumn);
    if (!view) return;
    if (global.PMM) global.PMM.enter(view.querySelector('.pmk-body'));
    if (!focusKind) return;
    /* The clicked button was destroyed by the repaint. Find its replacement
       by value rather than by index: the legend is a fixed census over all
       rows, so the same kind is always present. */
    var btns = view.querySelectorAll('[data-xa1-kind]');
    for (var i = 0; i < btns.length; i++) {
      if (btns[i].getAttribute('data-xa1-kind') === focusKind) { btns[i].focus(); return; }
    }
  }

  function toggleKind(k) {
    if (!k) return;
    if (A1.kinds[k]) delete A1.kinds[k]; else A1.kinds[k] = 1;
  }

  /* xA2 and xA3. The drawer is the header's next sibling, so no id, no
     data-value round trip and no selector escaping. The caller keeps
     aria-expanded: GI-004 requires the header be a real button with a real
     accessible state, and that state is not the motion layer's to fake.
     The classList fallback keeps open/close correct if PMM never loaded. */
  function toggleBox(hd, prim) {
    var box = hd && hd.nextElementSibling;
    if (!box) return;
    var open = hd.getAttribute('aria-expanded') !== 'true';
    hd.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (global.PMM && typeof global.PMM[prim] === 'function') global.PMM[prim](box, open);
    else box.classList.toggle('is-open', open);
  }

  function onArtClick(e) {
    var t = e.target;
    if (!t || !t.closest) return;

    var s1 = stageOf(t, 'xA1');
    if (s1) {
      var g = t.closest('[data-xa1-kind]');
      if (!g) return;
      var k = g.getAttribute('data-xa1-kind');
      toggleKind(k);
      refilterA1(s1, k);
      return;
    }
    var s2 = stageOf(t, 'xA2');
    if (s2) {
      var hd = t.closest('.xA2-hd');
      if (hd) toggleBox(hd, 'sheet');
      return;
    }
    var s3 = stageOf(t, 'xA3');
    if (s3) {
      var kh = t.closest('.xA3-kh');
      if (kh) toggleBox(kh, 'expand');
    }
  }

  /* Below 360px the 19 glyph toggles do not fit (19 x 26px = 494px against a
     224-304px band) and collapse into the strip's portaled menu, so the same
     filter arrives as a menu action instead of a click. Scoped to .pmk-strip:
     the panel menu lives in .pmk-head and every row menu inside a row. */
  function onArtMenu(e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var stage = stageOf(t, 'xA1');
    if (!stage || !t.closest('.pmk-strip')) return;
    var act = e.detail && e.detail.action;
    if (!act) return;
    if (act === 'all_kinds') A1.kinds = {};
    else if (KIND_PATH[act]) toggleKind(act);
    else return;
    refilterA1(stage, null);
  }

  /* THE GATE, wired once for all three variants. It runs on the same
     pm:menuaction the kind filter already used, and it is deliberately a
     SEPARATE listener from onArtMenu: the filter is xA1-only and strip-only,
     the gate is every variant and every menu, and folding them together is
     how one of them later grows a condition that silently disarms the other.
     Row menus and the panel menu both bubble here; the row is found by
     data-pm-key, and its absence is what makes a gate panel-scoped. */
  function onArtGate(e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var stage = t.closest('.pm-stage');
    if (!stage || stage.getAttribute('data-pm-panel') !== 'artifacts') return;
    var v = stage.getAttribute('data-pm-version');
    if (v !== 'xA1' && v !== 'xA2' && v !== 'xA3') return;
    var act = e.detail && e.detail.action;
    if (act) askGate(t, act);
  }

  if (global.document && !global.__xArtifactsBound) {
    global.__xArtifactsBound = true;
    document.addEventListener('click', onArtClick);
    document.addEventListener('pm:menuaction', onArtMenu);
    document.addEventListener('pm:menuaction', onArtGate);
  }

  /* ===================================================================== */
  global.PM_BAKEOFF.register('xA1', {
    name: 'Artifacts: Glyph Column',
    blurb: 'The kind becomes one of 19 drawings sharing a 27px gutter with the status rail; the legend strip is also the kind filter.',
    panels: { artifacts: panelGlyphColumn }
  });

  global.PM_BAKEOFF.register('xA2', {
    name: 'Artifacts: Casefile',
    blurb: 'The investigation is the primary object: members lead with evidence_role and bind to real rows; unfiled artifacts are a labelled peer pool.',
    panels: { artifacts: panelCasefile }
  });

  global.PM_BAKEOFF.register('xA3', {
    name: 'Artifacts: Monoculture',
    blurb: 'The kind is a sticky run header, never a row field, so rows specialise per type and the identity starts 21px from the edge at 240px.',
    panels: { artifacts: panelMonoculture }
  });
})(window);
