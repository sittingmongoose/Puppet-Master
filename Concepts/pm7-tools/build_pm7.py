#!/usr/bin/env python3
"""build_pm7.py -- PM7 refactor pipeline (Phases A-E: transforms T01-T19).

PMConcept7 is ALWAYS a build artifact derived from the pinned base
(base/PM7-base.html, byte-identical to the shipped Jul 15 PMConcept6.html).
Never hand-edit the output. Never write anything under Concepts/pm6-build/
(read-only; its emoji checker is invoked read-only as a gate).

Pipeline shape:
  1. Load base, assert sha256 == BASE_SHA (escape hatch: --allow-new-base).
  2. Segment the document into style/script blocks by tag scan (census
     asserted: 29 blocks = 12 style + 17 script; the original design memo
     said 28 -- ground truth on the pinned base is 29 and is recorded here).
  3. Run ordered content-anchored transforms. Every transform carries
     mandatory pre/post assertions; any failure aborts the build.
  4. Write output + JSON build report; run final static gates:
       - per-style-block brace balance
       - var(--x)-used-implies-defined (baseline-relative vs the base)
       - per-script extraction + `node --check`
       - Concepts/pm6-build/checks/check_no_emoji.py on the output (read-only)

Flags: --until N, --skip NAME (repeatable), --report, --out FILE,
       --outdir DIR (report/tmp destination; use the session scratchpad),
       --allow-new-base, --base FILE.
"""

import argparse
import hashlib
import json
import os
import re
import subprocess
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]
sys.path.insert(0, str(HERE))

import css_audit  # noqa: E402  (segmentation + CSS rule scanner)
import dead_selectors  # noqa: E402  (frozen human-reviewed dead list)
import home_workspace_source as home_source  # noqa: E402  (authored T20 source)

BASE_DEFAULT = HERE / "base" / "PM7-base.html"
BASE_SHA = "3d82a850dad0e412e3abafe1b3f0717e34071425152efd93d3c49fa6e85408c3"

# Segmentation census measured on the pinned base (design memo said 28
# blocks; actual scan of the pinned base finds 29 -- recorded adaptation).
EXPECTED_BLOCKS = 31
EXPECTED_STYLE_BLOCKS = 13
EXPECTED_SCRIPT_BLOCKS = 18

# T01 removal band. Design memo band was 40-60KB assuming family-level
# approval including wt-*; the harvester proved wt- is a real dynamic prefix
# ('wt-bind-btn wt-' + data.state) so wt-* is protected, and doubt-exclusions
# (chat-/wizard-/files-/pm-/... families) also stay. Adapted hard band below;
# the report records the measured value against the original design band.
T01_BYTE_BAND = (30000, 65000)
T01_DESIGN_BAND = (40960, 61440)

NO_EMOJI_CHECKER = REPO / "Concepts" / "pm6-build" / "checks" / "check_no_emoji.py"


class TransformAbort(Exception):
    pass


def need(cond, msg):
    if not cond:
        raise TransformAbort(msg)


def sha256_text(text):
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


# --------------------------------------------------------------------------
# helpers
# --------------------------------------------------------------------------

def remove_exact_once(doc, snippet, label):
    need(doc.count(snippet) == 1,
         "%s: expected exactly 1 occurrence of anchor, found %d" % (
             label, doc.count(snippet)))
    return doc.replace(snippet, "", 1)


def replace_exact_once(doc, old, new, label):
    need(doc.count(old) == 1,
         "%s: expected exactly 1 occurrence of anchor, found %d" % (
             label, doc.count(old)))
    return doc.replace(old, new, 1)


def whole_line_span(doc, start, end):
    """Extend a span to full lines when it occupies whole lines (so rule
    deletion also removes the now-empty line). Returns (start, end)."""
    s = start
    while s > 0 and doc[s - 1] in " \t":
        s -= 1
    if s > 0 and doc[s - 1] != "\n":
        s = start
    e = end
    while e < len(doc) and doc[e] in " \t":
        e += 1
    if e < len(doc) and doc[e] == "\n":
        e += 1
    else:
        e = end
    return s, e


# --------------------------------------------------------------------------
# T01 -- frozen dead CSS selector removal
# --------------------------------------------------------------------------

def t01_dead_css_selectors(doc, notes):
    dead = set(dead_selectors.DEAD_SELECTORS)
    need(len(dead) > 0, "T01: frozen dead list is empty")

    blocks = css_audit.segment_blocks(doc)
    style_blocks = [b for b in blocks if b.kind == "style"]

    # pre-assert: every frozen selector is present at least once right now
    present = set()
    rules_by_block = []
    for b in style_blocks:
        rules = css_audit.iter_rules(b.content(doc))
        rules_by_block.append((b, rules))
        for rule in rules:
            if rule.kind != "rule":
                continue
            for sel in css_audit.split_selector_list(rule.selector):
                norm = css_audit.normalize_selector(sel)
                if norm in dead:
                    present.add(norm)
    missing = dead - present
    need(not missing,
         "T01: %d frozen selectors not found in current doc (base drift?): %s"
         % (len(missing), sorted(missing)[:5]))

    edits = []  # (abs_start, abs_end, replacement)
    rules_deleted = 0
    rules_spliced = 0
    for b, rules in rules_by_block:
        for rule in rules:
            if rule.kind != "rule":
                continue
            sels = css_audit.split_selector_list(rule.selector)
            norms = [css_audit.normalize_selector(s) for s in sels]
            dead_flags = [n in dead for n in norms]
            if not any(dead_flags):
                continue
            if all(dead_flags):
                a = b.content_start + rule.start
                z = b.content_start + rule.end
                a, z = whole_line_span(doc, a, z)
                edits.append((a, z, ""))
                rules_deleted += 1
            else:
                live = [s for s, d in zip(sels, dead_flags) if not d]
                a = b.content_start + rule.start
                z = b.content_start + rule.body_open
                edits.append((a, z, ", ".join(
                    css_audit.normalize_selector(s) for s in live) + " "))
                rules_spliced += 1

    edits.sort(key=lambda e: e[0])
    for i in range(1, len(edits)):
        need(edits[i][0] >= edits[i - 1][1], "T01: overlapping edits")
    out = []
    pos = 0
    for a, z, rep in edits:
        out.append(doc[pos:a])
        out.append(rep)
        pos = z
    out.append(doc[pos:])
    doc2 = "".join(out)

    # keyframes pass: delete @keyframes with zero remaining animation refs
    kf_removed = []
    blocks2 = css_audit.segment_blocks(doc2)
    kf_edits = []
    for b in blocks2:
        if b.kind != "style":
            continue
        for rule in css_audit.iter_rules(b.content(doc2)):
            if rule.kind != "keyframes" or not rule.name:
                continue
            refs = css_audit.count_name_refs(rule.name, doc2)
            if refs == 0:
                a = b.content_start + rule.start
                z = b.content_start + rule.end
                a, z = whole_line_span(doc2, a, z)
                kf_edits.append((a, z))
                kf_removed.append(rule.name)
    kf_edits.sort()
    out = []
    pos = 0
    for a, z in kf_edits:
        out.append(doc2[pos:a])
        pos = z
    out.append(doc2[pos:])
    doc3 = "".join(out)

    # post-asserts
    for b in css_audit.segment_blocks(doc3):
        if b.kind != "style":
            continue
        for rule in css_audit.iter_rules(b.content(doc3)):  # re-parse = balance
            if rule.kind != "rule":
                continue
            for sel in css_audit.split_selector_list(rule.selector):
                need(css_audit.normalize_selector(sel) not in dead,
                     "T01: dead selector survived: %s" % sel)
    removed = len(doc) - len(doc3)
    need(T01_BYTE_BAND[0] <= removed <= T01_BYTE_BAND[1],
         "T01: removed %d bytes, outside band %r" % (removed, T01_BYTE_BAND))
    notes.update({
        "selectors_frozen": len(dead),
        "rules_deleted": rules_deleted,
        "rules_spliced": rules_spliced,
        "keyframes_removed": sorted(kf_removed),
        "bytes_removed": removed,
        "design_band": list(T01_DESIGN_BAND),
        "in_design_band": T01_DESIGN_BAND[0] <= removed <= T01_DESIGN_BAND[1],
    })
    return doc3


# --------------------------------------------------------------------------
# T02 -- shimmer guard removal
# --------------------------------------------------------------------------

T02_COMMENT = ("    /* --- transitional guard: shimmer overlay div until "
               "removed from part 11 --- */\n")
T02_RULE = "    .gl-shimmer-overlay { display: none; }\n"


def t02_shimmer_guard(doc, notes):
    # ADAPTATION vs design memo: memo pre-asserted "exactly 2 occurrences";
    # on the pinned base the token occurs exactly ONCE (the guard rule) and
    # the adjacent comment names it in prose without the literal token.
    need(doc.count("gl-shimmer-overlay") == 1,
         "T02: token count != 1 (markup may use the overlay again)")
    doc = remove_exact_once(doc, T02_COMMENT + T02_RULE, "T02 guard block")
    need(doc.count("gl-shimmer-overlay") == 0, "T02: token survived")
    notes["removed"] = "guard comment + display:none rule"
    return doc


# --------------------------------------------------------------------------
# T03 -- pm-sheen ::before killer removal
# --------------------------------------------------------------------------

T03_OLD_COMMENT = ("    /* --- .pm-sheen hover utility: lift + accent "
                   "ring/glow (the old ::before\n       sweep is killed via "
                   "content:none; class stays in markup) --- */\n")
T03_NEW_COMMENT = ("    /* --- .pm-sheen hover utility: lift + accent "
                   "ring/glow --- */\n")
T03_KILLER = ("    .pm-sheen::before { content: none; }   "
              "/* kills the sweep everywhere */\n")


def t03_pm_sheen_killer(doc, notes):
    need(doc.count("pm-sheen::before") == 1,
         "T03: expected the killer to be the only ::before rule for pm-sheen")
    need(doc.count(".pm-sheen") >= 3, "T03: pm-sheen utility rules missing")
    doc = replace_exact_once(doc, T03_OLD_COMMENT, T03_NEW_COMMENT,
                             "T03 comment rewrite")
    doc = remove_exact_once(doc, T03_KILLER, "T03 killer rule")
    need(doc.count("pm-sheen::before") == 0, "T03: killer survived")
    need(doc.count(".pm-sheen:hover") >= 1, "T03: hover rule lost")
    notes["removed"] = "content:none ::before killer; comment rewritten"
    return doc


# --------------------------------------------------------------------------
# T04 -- setBreadcrumb stub removal
# --------------------------------------------------------------------------

T04_DEF = ("  /* ================= breadcrumb (strip removed; stub kept for "
           "call sites) ================= */\n"
           "  function setBreadcrumb() {}\n")
T04_SUBSCRIBER = ("    D.on('page.changed', safe(function (p) { if (p) "
                  "setBreadcrumb(p.page, p.subTab); }));\n")
T04_BOOT = "    try { setBreadcrumb('dashboard'); } catch (e) {}\n"


def t04_breadcrumb_stub(doc, notes):
    # ADAPTATION (2026-07-29): the deferred-cleanup wave excised the inert
    # legacy panel JS from the pm6-js-panels part upstream, which already
    # removed the stub def + page.changed subscriber + boot call, so the
    # token may be absent (mirrors the T05 upstream-skip adaptation).
    n = doc.count("setBreadcrumb")
    if n == 0:
        notes["decision"] = "SKIP (already applied upstream in pm6 parts)"
        notes["removed"] = None
        return doc
    need(n == 3,
         "T04: expected exactly 3 setBreadcrumb occurrences, found %d" % n)
    doc = remove_exact_once(doc, T04_DEF, "T04 stub def")
    doc = remove_exact_once(doc, T04_SUBSCRIBER, "T04 page.changed subscriber")
    doc = remove_exact_once(doc, T04_BOOT, "T04 boot call")
    need(doc.count("setBreadcrumb") == 0, "T04: occurrences survived")
    notes["removed"] = "no-op stub def + subscriber line + boot call"
    return doc


# --------------------------------------------------------------------------
# T05 -- dead chat suggestions field
# --------------------------------------------------------------------------

T05_OLD = "footer: null, suggestions: null, composerChips: null"
T05_NEW = "footer: null, composerChips: null"


def t05_chat_suggestions_field(doc, notes):
    # ADAPTATION (2026-07-22 base): the pm6-build parts backport already
    # dropped `suggestions: null` upstream, so the field may be absent.
    n = doc.count("suggestions: null")
    if n == 0:
        need(T05_NEW in doc or "composerChips: null" in doc,
             "T05: suggestions already gone but composerChips anchor missing")
        need(re.search(r"\.\s*suggestions\b", doc) is None,
             "T05: found a .suggestions property read; field is not dead")
        notes["decision"] = "SKIP (already applied upstream in pm6 parts)"
        notes["removed"] = None
        return doc
    need(n == 1,
         "T05: expected exactly 1 'suggestions: null' outside the settings "
         "JSON line, found %d" % n)
    need(re.search(r"\.\s*suggestions\b", doc) is None,
         "T05: found a .suggestions property read; field is not dead")
    doc = replace_exact_once(doc, T05_OLD, T05_NEW, "T05 field removal")
    need(doc.count("suggestions: null") == 0, "T05: field survived")
    notes["removed"] = "suggestions: null in chat default-thread literal"
    return doc


# --------------------------------------------------------------------------
# T06 -- dead terminal clockTick interval
# --------------------------------------------------------------------------

T06_FIELD = "        clockTick: 0,\n"
T06_INTERVAL = "          setInterval(function() { state.clockTick++; }, 1000);\n"


def t06_terminal_dead_interval(doc, notes):
    # ADAPTATION vs design memo: memo pre-asserted "exactly 2 occurrences" of
    # clockTick. The pinned base has 4: the 2 dead terminal-demo ones removed
    # here, plus 'function clockTick()' / 'setInterval(safe(clockTick, ...)'
    # in pm6-js-demo-engine -- that is the LIVE master demo clock (same
    # symbol name, different subsystem) and MUST stay.
    need(doc.count("clockTick") == 4,
         "T06: expected 4 clockTick occurrences (2 dead + 2 live master "
         "clock), found %d" % doc.count("clockTick"))
    need(doc.count("state.clockTick") == 1,
         "T06: state.clockTick gained readers; not dead")
    need(doc.count("function clockTick()") == 1 and
         doc.count("safe(clockTick") == 1,
         "T06: live master-clock anchors changed")
    doc = remove_exact_once(doc, T06_FIELD, "T06 state field")
    doc = remove_exact_once(doc, T06_INTERVAL, "T06 interval line")
    need(doc.count("clockTick") == 2, "T06: expected only master clock left")
    need(doc.count("state.clockTick") == 0, "T06: state field survived")
    notes["removed"] = "clockTick state field + 1s counter interval (never read)"
    return doc


# ==========================================================================
# Phase B -- timers / listeners (T07-T10)
# ==========================================================================

# --------------------------------------------------------------------------
# T07 -- merge the two document-level pointermove listeners
# --------------------------------------------------------------------------
# The PM8 magnet+spotlight pointermove (pm6-js-globals) becomes a dispatcher
# over a window.PM7_PMOVE hook array; the parallax writer (pm6-js-panels
# wireParallax) pushes its hook into that array instead of registering a
# second document listener, keeps an addEventListener fallback if the array
# is absent, and gains a per-event guard: inert unless data-theme starts with
# 'glass' (per-event, NOT boot-time, so a later live theme switch to
# glass-depth still gets parallax exactly like PM6).

T07_JIGGLE_OLD = """\
    document.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      var blocked = document.body.classList.contains('pm-ab-dragging') || reduced();
      hitTarget = blocked ? null : e.target;   /* real hit target - distinguishes the gap from an occluder */
      var t = null;
      if (!blocked && e.target && e.target.closest) {
        t = e.target.closest(PM8_SEL);
        while (t && t.parentElement && t.parentElement.closest) {
          var up = t.parentElement.closest(PM8_SEL);   /* nested target: outer box owns it */
          if (!up) break;
          t = up;
        }
      }
      px = e.clientX; py = e.clientY;
      havePointer = true;
      if (t !== hoverEl) {
        if (hoverEl) stateFor(hoverEl).hover = false;
        hoverEl = t;
        if (t) {
          var s = stateFor(t);
          s.hover = true;
          t.classList.add('pm8-live');
          liveSet.add(s);
        }
      }
      start();
    });
"""

T07_JIGGLE_NEW = """\
    /* PM7 T07: single document-level pointermove listener for the whole
       app. The PM8 handler and the panels parallax hook both run off the
       shared window.PM7_PMOVE hook array (dispatcher below). */
    window.PM7_PMOVE = window.PM7_PMOVE || [];
    window.PM7_PMOVE.push(function (e) {
      if (e.pointerType === 'touch') return;
      var blocked = document.body.classList.contains('pm-ab-dragging') || reduced();
      hitTarget = blocked ? null : e.target;   /* real hit target - distinguishes the gap from an occluder */
      var t = null;
      if (!blocked && e.target && e.target.closest) {
        t = e.target.closest(PM8_SEL);
        while (t && t.parentElement && t.parentElement.closest) {
          var up = t.parentElement.closest(PM8_SEL);   /* nested target: outer box owns it */
          if (!up) break;
          t = up;
        }
      }
      px = e.clientX; py = e.clientY;
      havePointer = true;
      if (t !== hoverEl) {
        if (hoverEl) stateFor(hoverEl).hover = false;
        hoverEl = t;
        if (t) {
          var s = stateFor(t);
          s.hover = true;
          t.classList.add('pm8-live');
          liveSet.add(s);
        }
      }
      start();
    });
    document.addEventListener('pointermove', function (e) {
      var hooks = window.PM7_PMOVE;
      for (var i = 0; i < hooks.length; i++) { try { hooks[i](e); } catch (err) {} }
    });
"""

T07_PARALLAX_OLD = """\
    var px = 0, py = 0, raf = null;
    document.addEventListener('pointermove', function (e) {
      px = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
      py = (e.clientY / Math.max(1, window.innerHeight)) * 2 - 1;
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = null;
        try {
          bg.style.setProperty('--par-x', px.toFixed(3));
          bg.style.setProperty('--par-y', py.toFixed(3));
        } catch (e2) {}
      });
    }, { passive: true });
"""

T07_PARALLAX_NEW = """\
    var px = 0, py = 0, raf = null;
    /* PM7 T07: routed through the shared PM7_PMOVE pointermove dispatcher
       (pm6-js-globals) instead of a second document-level listener. Guarded
       per event: inert unless a glass theme is active (only glass-depth
       consumes --par-x/--par-y), and the guard re-evaluates on every event so
       a live theme switch to glass behaves exactly like PM6. */
    var pm7ParallaxHook = function (e) {
      if ((document.documentElement.getAttribute('data-theme') || '').indexOf('glass') !== 0) return;
      px = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
      py = (e.clientY / Math.max(1, window.innerHeight)) * 2 - 1;
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = null;
        try {
          bg.style.setProperty('--par-x', px.toFixed(3));
          bg.style.setProperty('--par-y', py.toFixed(3));
        } catch (e2) {}
      });
    };
    if (window.PM7_PMOVE && window.PM7_PMOVE.push) window.PM7_PMOVE.push(pm7ParallaxHook);
    else document.addEventListener('pointermove', pm7ParallaxHook, { passive: true });
"""

T07_FALLBACK_LINE = ("    else document.addEventListener('pointermove', "
                     "pm7ParallaxHook, { passive: true });\n")


def t07_merge_pointermove(doc, notes):
    need(doc.count("document.addEventListener('pointermove'") == 2,
         "T07: expected exactly 2 document-level pointermove registrations "
         "(magnet + parallax), found %d"
         % doc.count("document.addEventListener('pointermove'"))
    need(doc.count("PM7_PMOVE") == 0, "T07: PM7_PMOVE already present")
    doc = replace_exact_once(doc, T07_JIGGLE_OLD, T07_JIGGLE_NEW,
                             "T07 magnet dispatcher")
    doc = replace_exact_once(doc, T07_PARALLAX_OLD, T07_PARALLAX_NEW,
                             "T07 parallax hook")
    # Post: statically there are 2 occurrences of the literal, but one is the
    # guarded fallback branch (dead when the dispatcher exists, i.e. always in
    # PM7 -- globals is assembled before panels). Runtime probe asserts the
    # actual registration count is 1.
    need(doc.count("document.addEventListener('pointermove'") == 2,
         "T07: unexpected pointermove literal count after transform")
    need(doc.count(T07_FALLBACK_LINE) == 1,
         "T07: guarded fallback registration line missing/duplicated")
    # 3 = magnet push + parallax presence-check + parallax push
    need(doc.count("window.PM7_PMOVE.push") == 3 and
         doc.count("window.PM7_PMOVE = window.PM7_PMOVE || []") == 1,
         "T07: hook array wiring incomplete")
    # magnet guards survive verbatim inside the pushed hook
    for g in ("e.pointerType === 'touch'", "pm-ab-dragging",
              "t.classList.add('pm8-live')", "PM8_SEL"):
        need(doc.count(g) >= 1, "T07: magnet guard lost: %s" % g)
    need(doc.count("--par-x") >= 3, "T07: parallax var writes lost")
    notes["adaptation"] = ("post-assert adapted: 1 UNCONDITIONAL document "
                           "registration (dispatcher) + 1 guarded fallback "
                           "occurrence; runtime listener count == 1 verified "
                           "by Playwright probe")
    return doc


# --------------------------------------------------------------------------
# T08 -- cooldown DOM-write gating (dashboard 1s + usage 1s intervals)
# --------------------------------------------------------------------------
# State decrements and completion side-effects keep their exact schedule;
# ONLY the per-second textContent writes gain an is-page-active guard, with a
# flush-on-activation via the existing 'page.changed' bus event (emitted by
# PM_PAGES.go after class toggling, so the page is already active when the
# flush runs). Scope note (recorded adaptation): on the usage page the local
# 1s ticker stands down ~2s after boot when the demo engine takes ownership
# (cooldown.external), after which the recurring writer is PM6_USAGE
# .setCooldown (driven by usage.tick every ~2s) -- its textContent write is
# gated through the same helper + dirty flag, otherwise the transform would
# gate a writer that is dead after 2 seconds.

T08_USAGE_TICK_OLD = """\
              var cooldown = { seconds: 2472, external: false };
              function tickCooldown() {
                if (cooldown.seconds <= 0) return;
                cooldown.seconds--;
                var el = UP.querySelector('#pm6UsageCd');
                if (el) {
                  el.textContent = fmtCd(cooldown.seconds);
"""

T08_USAGE_TICK_NEW = """\
              var cooldown = { seconds: 2472, external: false };
              /* PM7 T08: cooldown state keeps its exact schedule; only the
                 per-second textContent write is gated to the active usage
                 page. pm7FlushCooldown (exposed on PM6_USAGE) repaints on
                 page.changed -> usage. */
              var pm7CdDirty = false;
              function pm7CdWrite(el, sec) {
                if (UP.classList.contains('active')) { el.textContent = fmtCd(sec); pm7CdDirty = false; }
                else { pm7CdDirty = true; }
              }
              function tickCooldown() {
                if (cooldown.seconds <= 0) return;
                cooldown.seconds--;
                var el = UP.querySelector('#pm6UsageCd');
                if (el) {
                  pm7CdWrite(el, cooldown.seconds);
"""

T08_SETCOOLDOWN_OLD = """\
                  var el = UP.querySelector('#pm6UsageCd');
                  if (el) el.textContent = fmtCd(sec);
                },
"""

T08_SETCOOLDOWN_NEW = """\
                  var el = UP.querySelector('#pm6UsageCd');
                  if (el) pm7CdWrite(el, sec);
                },
                pm7FlushCooldown: function () {
                  if (!pm7CdDirty) return;
                  var el = UP.querySelector('#pm6UsageCd');
                  if (el) { el.textContent = fmtCd(cooldown.seconds); pm7CdDirty = false; }
                },
"""

T08_USAGE_PAGECHANGED_OLD = """\
      pd.on('page.changed', function (p) {
        try {
          if (p && p.page === 'usage' && U()) U().injectIcons();
        } catch (e) {}
      });
"""

T08_USAGE_PAGECHANGED_NEW = """\
      pd.on('page.changed', function (p) {
        try {
          if (p && p.page === 'usage' && U()) {
            if (U().pm7FlushCooldown) U().pm7FlushCooldown(); /* PM7 T08 */
            U().injectIcons();
          }
        } catch (e) {}
      });
"""

T08_DASH_OLD = """\
    // cooldown countdown on the ambient usage warning card
    setInterval(function () {
      if (document.hidden) return;
      var el = document.getElementById('pm6DashCooldown');
      if (!el) return;
      D.cooldown = Math.max(0, D.cooldown - 1);
      el.textContent = fmtCooldown(D.cooldown);
    }, 1000);
"""

T08_DASH_NEW = """\
    // cooldown countdown on the ambient usage warning card
    // PM7 T08: the decrement keeps its exact schedule; only the DOM write is
    // gated to the active dashboard page and flushed on page.changed.
    var pm7DashCdDirty = false;
    setInterval(function () {
      if (document.hidden) return;
      var el = document.getElementById('pm6DashCooldown');
      if (!el) return;
      D.cooldown = Math.max(0, D.cooldown - 1);
      if (root().classList.contains('active')) { el.textContent = fmtCooldown(D.cooldown); pm7DashCdDirty = false; }
      else { pm7DashCdDirty = true; }
    }, 1000);
    on('page.changed', function (p) {
      if (!p || p.page !== 'dashboard' || !pm7DashCdDirty) return;
      pm7DashCdDirty = false;
      var el = document.getElementById('pm6DashCooldown');
      if (el) el.textContent = fmtCooldown(D.cooldown);
    });
"""


def t08_cooldown_dom_gating(doc, notes):
    need(doc.count("D.cooldown = Math.max(0, D.cooldown - 1);") == 1,
         "T08: dashboard cooldown decrement anchor drifted")
    need(doc.count("pm7CdDirty") == 0 and doc.count("pm7DashCdDirty") == 0,
         "T08: already applied")
    doc = replace_exact_once(doc, T08_USAGE_TICK_OLD, T08_USAGE_TICK_NEW,
                             "T08 usage tickCooldown")
    doc = replace_exact_once(doc, T08_SETCOOLDOWN_OLD, T08_SETCOOLDOWN_NEW,
                             "T08 usage setCooldown + flush")
    doc = replace_exact_once(doc, T08_USAGE_PAGECHANGED_OLD,
                             T08_USAGE_PAGECHANGED_NEW,
                             "T08 usage page.changed flush hook")
    doc = replace_exact_once(doc, T08_DASH_OLD, T08_DASH_NEW,
                             "T08 dashboard interval")
    # post: completion side-effect untouched, schedules untouched
    need(doc.count("if (cooldown.seconds === 0) { renderAccounts();") == 1,
         "T08: usage completion side-effect lost")
    need(doc.count("pm7CdWrite") == 3, "T08: usage write helper wiring != 3")
    # 4 = comment mention + method definition + presence check + call
    need(doc.count("pm7FlushCooldown") == 4, "T08: usage flush wiring != 4")
    # 5 = declaration + clear-on-write + set-on-skip + flush check + flush clear
    need(doc.count("pm7DashCdDirty") == 5, "T08: dashboard dirty wiring != 5")
    notes["scope"] = ("usage: tickCooldown + setCooldown writes gated (local "
                      "ticker stands down after engine sync; setCooldown is "
                      "the live writer); dashboard: 1s interval write gated; "
                      "both flush via page.changed")
    return doc


# --------------------------------------------------------------------------
# T09 -- ambient terminal feed gating (buffer model VERIFIED on base)
# --------------------------------------------------------------------------
# Verified: PM_TERMINAL_DEMO keeps per-pane line state (p.lines, cap 400) and
# renderAll()/renderPane() rebuild pane bodies from that state via
# renderTranscript. appendToSession therefore: always appends to state;
# skips the live DOM append when the bottom panel is collapsed or the
# Terminal tab is inactive (marks state dirty); every reveal path rebuilds:
# revealSession/focusSession already call renderAll(), the bottom-tab switch
# flushes in syncTerminalTabBar('terminal'), and the #collapseBottom expand
# click flushes via PM_TERMINAL_DEMO.pm7FlushIfDirty.

T09_APPEND_OLD = """\
              p.lines.push({ t: 'line', c: text });
              if (p.lines.length > 400) p.lines.splice(0, p.lines.length - 400);
              var body = document.querySelector('.terminal-pane[data-pane-id="' + pid + '"] .terminal-pane-body');
"""

T09_APPEND_NEW = """\
              p.lines.push({ t: 'line', c: text });
              if (p.lines.length > 400) p.lines.splice(0, p.lines.length - 400);
              if (pm7TermHidden()) { state.pm7TermDirty = true; continue; } /* PM7 T09 */
              var body = document.querySelector('.terminal-pane[data-pane-id="' + pid + '"] .terminal-pane-body');
"""

T09_RENDERALL_OLD = """\
      function renderAll() {
        var host = document.getElementById('bottomTerminalHost');
        if (!host) return;
"""

T09_RENDERALL_NEW = """\
      function renderAll() {
        var host = document.getElementById('bottomTerminalHost');
        if (!host) return;
        state.pm7TermDirty = false; /* PM7 T09: rebuild consumes the dirty flag */
"""

T09_HELPERS = """\
      /* PM7 T09: live terminal DOM appends are skipped while the bottom
         panel is collapsed or the Terminal tab is inactive; per-session line
         state still accumulates (p.lines) and every reveal path rebuilds the
         bodies from state via renderAll(). */
      function pm7TermHidden() {
        var bp = document.getElementById('bottomPanel');
        if (bp && bp.classList.contains('collapsed')) return true;
        var host = document.getElementById('bottomTerminalHost');
        return !!(host && !host.classList.contains('active'));
      }
      function pm7TermFlushIfDirty() {
        if (state.pm7TermDirty) renderAll();
      }
"""

T09_PMTD_ANCHOR = "      window.PM_TERMINAL_DEMO = {\n"

T09_EXPOSE_OLD = "        renderAll: renderAll,\n"
T09_EXPOSE_NEW = ("        renderAll: renderAll,\n"
                  "        pm7FlushIfDirty: pm7TermFlushIfDirty,\n")

T09_SYNC_OLD = """\
        if (tabName === 'terminal') {
          if (outer) outer.style.display = '';
          if (wrap) wrap.style.display = '';
          if (chrome) chrome.style.display = '';
          renderTerminalChromeBar();
"""

T09_SYNC_NEW = """\
        if (tabName === 'terminal') {
          if (outer) outer.style.display = '';
          if (wrap) wrap.style.display = '';
          if (chrome) chrome.style.display = '';
          pm7TermFlushIfDirty(); /* PM7 T09: rebuild buffered lines on reveal */
          renderTerminalChromeBar();
"""

T09_COLLAPSE_OLD = """\
                if (bottomPanel.classList.contains('collapsed')) {
                    bottomPanel.style.height = '';
                    bottomPanel.style.flex = '';
                }
"""

T09_COLLAPSE_NEW = """\
                if (bottomPanel.classList.contains('collapsed')) {
                    bottomPanel.style.height = '';
                    bottomPanel.style.flex = '';
                } else if (window.PM_TERMINAL_DEMO && PM_TERMINAL_DEMO.pm7FlushIfDirty) {
                    PM_TERMINAL_DEMO.pm7FlushIfDirty(); /* PM7 T09 */
                }
"""


def t09_terminal_feed_gating(doc, notes):
    # conditional-verify pre-asserts: the buffer model must exist
    need(doc.count("p.lines.push({ t: 'line', c: text });") == 1,
         "T09: per-pane line-state append not found -- buffer model absent, "
         "transform must be skipped")
    need(doc.count("renderTranscript(body, p.lines);") == 1,
         "T09: renderPane does not rebuild from p.lines -- buffer model "
         "absent, transform must be skipped")
    need(doc.count("pm7TermHidden") == 0, "T09: already applied")
    doc = replace_exact_once(doc, T09_APPEND_OLD, T09_APPEND_NEW,
                             "T09 appendToSession gate")
    doc = replace_exact_once(doc, T09_RENDERALL_OLD, T09_RENDERALL_NEW,
                             "T09 renderAll dirty-clear")
    doc = replace_exact_once(doc, T09_PMTD_ANCHOR, T09_HELPERS + T09_PMTD_ANCHOR,
                             "T09 helpers insertion")
    doc = replace_exact_once(doc, T09_EXPOSE_OLD, T09_EXPOSE_NEW,
                             "T09 pm7FlushIfDirty exposure")
    doc = replace_exact_once(doc, T09_SYNC_OLD, T09_SYNC_NEW,
                             "T09 tab-switch flush")
    doc = replace_exact_once(doc, T09_COLLAPSE_OLD, T09_COLLAPSE_NEW,
                             "T09 bottom-expand flush")
    need(doc.count("pm7TermHidden") == 2, "T09: hidden helper wiring != 2")
    need(doc.count("pm7TermDirty") == 3, "T09: dirty flag wiring != 3")
    # pm7FlushIfDirty: expose + collapse-hook presence check + call = 3
    # pm7TermFlushIfDirty: definition + expose + tab-switch call = 3
    need(doc.count("pm7FlushIfDirty") == 3 and
         doc.count("pm7TermFlushIfDirty") == 3,
         "T09: flush wiring incomplete")
    notes["verified_buffer_model"] = ("p.lines state append (cap 400) + "
                                      "renderTranscript(body, p.lines) rebuild "
                                      "confirmed on base before gating")
    return doc


# --------------------------------------------------------------------------
# T10 -- snapshot-handler page gating (measure-gated)
# --------------------------------------------------------------------------
# Census evidence (PM6 base, 30s parked on Settings, ambient running):
#   usage.tick 16, demo.log 12, web.op 8, chat.card 7, term.feed 2,
#   docker.stats 1, runtime_artifact.created 1, run.state 0.
# Decisions:
#   - dashboard 'usage.tick' handler: HOT (only recurring snapshot event) and
#     snapshot-idempotent (renders cooldown/pct/quota widget purely from the
#     latest payload; the pct-change comparison against D.usagePct still
#     works with latest-only delivery)  -> WRAPPED in pm7PageGate.
#   - dashboard 'run.state' handler (design's verified-safe candidate):
#     0 emissions in 30s idle -> NOT HOT, skipped per the measure gate (also
#     avoids the chip-stickiness edge when an intermediate stage payload is
#     dropped by latest-only delivery).
#   - panels renderAgents ('run.state'): 0 emissions in 30s -> NOT HOT, skip.
#   - bottom-panel candidates (term.feed/web.op/chat.state) + run.gate CTAs +
#     usage.alert toasts: event-semantic (appends/notifications), EXCLUDED.
#   - orchestrator: already gated (pageIsActive()/mark idiom), untouched.

T10_GATE_ANCHOR = ("  /* ---- PM_DEMO guard-shim: replaced wholesale by "
                   "pm6-js-demo-engine, which is\n")

T10_GATE_HELPER = """\
  /* ---- PM7 T10: page-gate for snapshot-idempotent bus subscribers. While
     the page is inactive the latest payload is retained and replayed once
     when page.changed activates the page (PM_PAGES.go toggles the .active
     class BEFORE it emits page.changed, so the flush already sees an active
     page). Event-semantic handlers (toasts, CTA raises, appends) must NOT
     be wrapped. ---- */
  window.pm7PageGate = function (pageId, handler) {
    var pending = false, lastP = null, lastT = null;
    function isActive() {
      var el = document.querySelector('.primary-content > .page.page-' + pageId);
      return !!(el && el.classList.contains('active'));
    }
    try {
      if (window.PM_DEMO && window.PM_DEMO.on) {
        window.PM_DEMO.on('page.changed', function (pp) {
          if (!pp || pp.page !== pageId || !pending) return;
          pending = false;
          var p = lastP, t = lastT;
          lastP = null; lastT = null;
          handler(p, t);
        });
      }
    } catch (e) {}
    return function (p, t) {
      if (isActive()) { pending = false; handler(p, t); return; }
      pending = true; lastP = p; lastT = t;
    };
  };

"""

T10_WRAP_OPEN_OLD = "\n  on('usage.tick', function (p) {\n"
T10_WRAP_OPEN_NEW = ("\n  /* PM7 T10: snapshot-idempotent + hot (census: 16 "
                     "emissions/30s idle) -> page-gated */\n"
                     "  on('usage.tick', window.pm7PageGate('dashboard', "
                     "function (p) {\n")

T10_WRAP_CLOSE_OLD = """\
      }
    }
  });
  on('usage.alert', function (p) {
"""

T10_WRAP_CLOSE_NEW = """\
      }
    }
  }));
  on('usage.alert', function (p) {
"""


def t10_snapshot_handler_gating(doc, notes):
    need(doc.count("pm7PageGate") == 0, "T10: already applied")
    need(doc.count(T10_WRAP_OPEN_OLD) == 1,
         "T10: dashboard usage.tick subscriber anchor drifted")
    doc = replace_exact_once(doc, T10_GATE_ANCHOR,
                             T10_GATE_HELPER + T10_GATE_ANCHOR,
                             "T10 pm7PageGate helper insertion")
    doc = replace_exact_once(doc, T10_WRAP_OPEN_OLD, T10_WRAP_OPEN_NEW,
                             "T10 usage.tick wrap open")
    doc = replace_exact_once(doc, T10_WRAP_CLOSE_OLD, T10_WRAP_CLOSE_NEW,
                             "T10 usage.tick wrap close")
    # 2 = window.pm7PageGate definition + the one wrapped subscriber
    need(doc.count("pm7PageGate") == 2, "T10: helper wiring != 2")
    # excluded handlers stay untouched
    # ADAPTATION (2026-07-29): the deferred-cleanup wave excised the inert
    # panels renderAgents subscription upstream, so 0 occurrences is now
    # valid (nothing left to gate); any other count is an unexpected mutation.
    n_panels_ra = doc.count("D.on('run.state', safe(renderAgents));")
    need(n_panels_ra in (0, 1),
         "T10: panels renderAgents subscription must stay untouched")
    need(doc.count("\n  on('run.state', function (p) {\n") == 1,
         "T10: dashboard run.state subscriber must stay untouched")
    notes["wrapped"] = ["pm6-js-dashboard on('usage.tick') -> "
                       "pm7PageGate('dashboard', ...)"]
    notes["skipped_not_hot"] = {
        "dashboard run.state": "0 emissions in 30s idle census",
        "panels renderAgents (run.state)":
            ("excised upstream in the 2026-07-29 deferred-cleanup wave"
             if n_panels_ra == 0 else "0 emissions in 30s idle census"),
    }
    notes["excluded_event_semantic"] = [
        "run.gate CTAs", "usage.alert toasts", "bottom term.feed/web.op",
        "orchestrator (already page-gated upstream)"]
    return doc


# ==========================================================================
# Phase C -- parse deferrals (T11-T14)
# ==========================================================================

# --------------------------------------------------------------------------
# T11 -- PM_SETTINGS_DATA parse defer (JS literal -> inert JSON + lazy getter)
# --------------------------------------------------------------------------
# The 341KB one-line object literal is re-emitted as an inert
# <script type="application/json"> sibling placed immediately before the
# settings-js block (same document position; data still precedes its single
# consumer) and window.PM_SETTINGS_DATA becomes a self-replacing lazy
# accessor: first read JSON.parses the block and swaps in a plain data
# property. Single consumer verified: pm6SettingsBoot (DCL-deferred) reads it
# once; nothing reads it during script evaluation.

T11_OPENER = '<script id="pm4-settings-js">\n'
T11_PREFIX = "window.PM_SETTINGS_DATA = "

T11_ACCESSOR = """\
/* PM7 T11: PM_SETTINGS_DATA lives as inert JSON in #pm7-settings-data (the
   application/json block right above) and is parsed lazily on first access;
   the parsed object then replaces this accessor as a plain data property.
   Single consumer: pm6SettingsBoot (DOMContentLoaded). */
(function () {
  Object.defineProperty(window, 'PM_SETTINGS_DATA', {
    configurable: true,
    get: function () {
      var v = { categories: [], settings: [] };
      try {
        var el = document.getElementById('pm7-settings-data');
        if (el) v = JSON.parse(el.textContent);
      } catch (e) { try { console.error('[PM7 settings-data]', e); } catch (e0) {} }
      Object.defineProperty(window, 'PM_SETTINGS_DATA', { configurable: true, writable: true, value: v });
      return v;
    },
    set: function (v) {
      Object.defineProperty(window, 'PM_SETTINGS_DATA', { configurable: true, writable: true, value: v });
    }
  });
})();
"""


def t11_settings_data_defer(doc, notes):
    import json as _json
    need(doc.count(T11_OPENER) == 1, "T11: settings-js opener not unique")
    need(doc.count(T11_PREFIX) == 1, "T11: settings-data assignment not unique")
    need(doc.count('id="pm7-settings-data"') == 0, "T11: already applied")
    s = doc.index(T11_PREFIX) + len(T11_PREFIX)
    e = doc.index("\n", s)
    lit = doc[s:e]
    need(lit.endswith(";"), "T11: assignment does not end the line with ';'")
    lit = lit[:-1]
    need(lit.startswith("{") and lit.endswith("}"),
         "T11: literal is not a single one-line object")
    low = lit.lower()
    need("</script" not in low and "<script" not in low and "<!--" not in lit,
         "T11: literal contains script-data-unsafe substrings")
    data = _json.loads(lit)  # raises -> aborts the build
    need(data.get("version") == 1, "T11: unexpected data version")
    need(len(data.get("categories", [])) == 12, "T11: category count != 12")
    need(len(data.get("settings", [])) == 818, "T11: settings count != 818")
    need(_json.loads(_json.dumps(data)) == data,
         "T11: Python deep-equal round-trip failed")
    # single consumer + no eval-time read: consumer sits inside
    # pm6SettingsBoot which is registered for DOMContentLoaded
    need(doc.count("window.PM_SETTINGS_DATA || { categories: [], settings: [] }") == 1,
         "T11: consumer count != 1")
    need(doc.count("function pm6SettingsBoot()") == 1,
         "T11: pm6SettingsBoot anchor missing")
    old_region = T11_OPENER + T11_PREFIX + lit + ";\n"
    need(doc.count(old_region) == 1, "T11: replacement region not unique")
    new_region = ('<script type="application/json" id="pm7-settings-data">'
                  + lit + "</script>\n" + T11_OPENER + T11_ACCESSOR)
    doc = doc.replace(old_region, new_region, 1)
    need(doc.count('id="pm7-settings-data"') == 1 and
         doc.count("getElementById('pm7-settings-data')") == 1,
         "T11: JSON block + accessor lookup wiring incomplete")
    need(doc.count(T11_PREFIX) == 0, "T11: eager assignment survived")
    notes["literal_bytes"] = len(lit)
    notes["deep_equal"] = True
    return doc


# --------------------------------------------------------------------------
# T12 / T13 -- chat-data / demo-files defer: DEFAULT-SKIP (audited, recorded)
# --------------------------------------------------------------------------

def t12_chat_data_defer(doc, notes):
    # No document change. Audit + probe evidence recorded:
    need(doc.count("window.PM6_CHAT_THREADS = {") == 1,
         "T12: chat-data assignment anchor drifted")
    notes["decision"] = "SKIP (per design default)"
    notes["evidence"] = (
        "pm6-js-chat-data is a JS object literal (single-quoted strings; not "
        "JSON) consumed via THREADS() during the initial docked-chat render. "
        "Instrumented probe (probes/defer_access.js, 6 runs on the pinned "
        "base): first window.PM6_CHAT_THREADS read lands -1ms..+4ms around "
        "first-paint and BEFORE first-paint in 2 of 6 runs -- post-first-"
        "paint access is NOT proven, so the text/plain + indirect-eval defer "
        "is not implemented.")
    return doc


def t13_demo_files_defer(doc, notes):
    need(doc.count('<script id="pm6-js-demo-files">') == 1,
         "T13: demo-files block anchor drifted")
    notes["decision"] = "SKIP (per design default)"
    notes["evidence"] = (
        "Timing alone would pass: probe (probes/defer_access.js, 6 runs) "
        "shows the first PM_DEMO_TEXT.files read (key src/main.rs) at a "
        "stable +89..+93ms after first-paint. The block is nevertheless NOT "
        "deferred: it is executable code (IIFE with highlight helpers), not "
        "a data literal, and its eval mutates the engine-shared "
        "PM_DEMO_TEXT.files object consumed via multiple independent read "
        "paths (pm6-js-dashboard pm6RenderFile, the engine's inline "
        "file-render fallback reading its TEXT closure, chat editor "
        "docking). A lazy trigger would need accessor juggling on a live "
        "engine object with reentrancy handling (the block itself reads "
        "T.files during eval). The ~56KB parse win (~1-3ms) does not justify "
        "that risk -> design default-skip stands.")
    return doc


# --------------------------------------------------------------------------
# T14 -- page-init defer: AUDITED, ALL CANDIDATES INELIGIBLE (no code change)
# --------------------------------------------------------------------------

def t14_page_init_defer(doc, notes):
    # Anchors proving the audited facts still hold on this base:
    need(doc.count("onRunState(null); /* pick up whatever state the engine already holds */") == 1,
         "T14: projects boot anchor drifted")
    need(doc.count("d.on('wizard.state', resync);") == 1,
         "T14: wizard resync subscription anchor drifted")
    need(doc.count("if (typeof p.cooldownSec === 'number') U().setCooldown(p.cooldownSec);") == 1,
         "T14: usage bridge anchor drifted")
    notes["decision"] = "SKIP -- all three candidates fail the eligibility audit"
    notes["audit"] = {
        "projects": (
            "boot does NOT render from PM_DEMO.state snapshots: the pickup "
            "call onRunState(null) is a no-op (guard `(p && (p.state||p.status)) "
            "|| ''`), so card chips depend on LIVE run.state/run.gate "
            "subscriptions registered at eval; deferring would leave stale "
            "chips after a chapter jump until the next run.state emission "
            "(which never comes while idle: census 0/30s). INELIGIBLE."),
        "wizard": (
            "boot resync() does reconstruct from the wizard snapshot, BUT the "
            "wizard.topic subscription fires a GLOBAL toast (say() on topic "
            "unlock) while the page is hidden -- a cross-page side effect "
            "registered at boot. Deferring loses those toasts (PM6 shows them "
            "from any page). Doubt rule -> ship eager. INELIGIBLE."),
        "usage": (
            "pm6-js-usage does stateful event ACCUMULATION, not snapshot "
            "renders: usage.tick appends only unseen engine-ledger rows and "
            "seeds its `seen` set from the backlog AT INIT TIME -- deferred "
            "init would permanently drop every row that arrived before first "
            "visit (PM6 appends them live into the hidden page). INELIGIBLE."),
    }
    notes["consequence"] = ("PM7_LAZY registry not installed (would be dead "
                            "code with zero registered pages); PM_PAGES.go "
                            "untouched")
    return doc


# ==========================================================================
# Phase D -- Slint-portability passes (T15-T16)
# ==========================================================================

# --------------------------------------------------------------------------
# T15 -- static color-mix() precompute: MEASURED SKIP (yield 2, threshold 30)
# --------------------------------------------------------------------------
# Only color-mix() calls with ZERO var() references are safely precomputable
# to rgb()/rgba() literals (per CSS Color 4 srgb interpolation). Everything
# else depends on --glass-alpha or theme tokens at runtime (the slider is a
# feature). The design gate: include only if yield > ~30 sites.

T15_YIELD_THRESHOLD = 30


def _colormix_sites(doc):
    sites = []
    for m in re.finditer(r"color-mix\(", doc):
        i = m.end()
        depth = 1
        while i < len(doc) and depth:
            if doc[i] == "(":
                depth += 1
            elif doc[i] == ")":
                depth -= 1
            i += 1
        sites.append(doc[m.start():i])
    return sites


def t15_static_colormix_precompute(doc, notes):
    sites = _colormix_sites(doc)
    novar = [s for s in sites if "var(" not in s]
    need(len(novar) <= T15_YIELD_THRESHOLD,
         "T15: zero-var color-mix yield %d exceeds the skip threshold %d -- "
         "re-decide (the design includes T15 only above ~30 sites)"
         % (len(novar), T15_YIELD_THRESHOLD))
    notes["decision"] = "SKIP (measured yield below design threshold)"
    notes["colormix_total"] = len(sites)
    notes["colormix_zero_var"] = len(novar)
    notes["zero_var_sites"] = sorted(set(novar))
    notes["threshold"] = T15_YIELD_THRESHOLD
    return doc


# --------------------------------------------------------------------------
# T16 -- glass wallpaper pre-bake (JARED-APPROVED visual change)
# --------------------------------------------------------------------------
# The runtime glass cloudscape (CSS gradients under filter: blur/saturate,
# plus the pm-sky-drift animation) is replaced by pre-baked WebP wallpapers
# generated by bake_wallpaper.mjs and frozen at baked_wallpaper.json:
#   mesh    -> one baked composition per theme on .pm6-gbg-mesh-layer
#   depth   -> baked base sky on the container + baked far-billow image on
#              .pm6-par-far::before; the parallax wrappers (--par-x/--par-y)
#              and the 6 live .pm6-gbg-shape floats keep working (float
#              colors pre-saturated numerically: the container saturate is
#              gone), pm-float animation stays
#   minimal -> untouched (static gradients only; verified no filter/drift)
# The ONLY backdrop-filter budget is unchanged (30 substring hits on the
# 2026-07-23 base — prior 25 + title-bar notify glass card/panel/item blurs),
# --glass-alpha untouched.
# Approved removals: runtime wallpaper blur/saturate + sky drift. Nothing
# else. Cap: 180KB total base64 across the 6 data URIs.

T16_ASSETS = HERE / "baked_wallpaper.json"
T16_CAP_BYTES = 180 * 1024
T16_GLASS_START_ANCHOR = "GLASS BACKGROUND STAGE"
T16_GLASS_END_ANCHOR = ("/* --- Glassmorphic: LIQUID GLASS multi-layer "
                        "panels --- */")
T16_MARKUP_ANCHOR = '<div id="glass-bg" aria-hidden="true">'

# billow image maps onto the viewport inside the -8%-inset wrapper:
# wrapper = 116% of viewport, 100/116 = 86.2069%
T16_BILLOW_SIZE = "86.2069% 86.2069%"

T16_HEADER_OLD = """\
         mesh    = full cloudscape (base sky + billow layer) + slow drift
         depth   = same + second parallax billow layer (--par-x/--par-y)
         minimal = base gradient sky only, static
       The whole layer is blurred so the billows fuse photographically.
       Drift is transform-only and killed globally by [data-motion="reduced"]
       / prefers-reduced-motion (see pm6-css-global "#glass-bg *" rules).
       ==================================================================== */
"""

T16_HEADER_NEW = """\
         mesh    = one pre-baked cloudscape wallpaper (sky + billows)
         depth   = baked base sky + baked far-billow layer under pointer
                   parallax (--par-x/--par-y) + live cloud-puff floats
         minimal = base gradient sky only, static (never needed baking)
       PM7 T16 (approved visual change): the blurred cloudscapes are
       PRE-BAKED WebP images (Concepts/pm7-tools/bake_wallpaper.mjs) --
       the runtime wallpaper filter (blur/saturate) and the slow sky-drift
       animation are gone; float colors are pre-saturated numerically.
       Floats are transform-only and killed globally by
       [data-motion="reduced"] / prefers-reduced-motion (see pm6-css-global
       "#glass-bg *" rules). The single app-shell backdrop blur is unchanged.
       ==================================================================== */
"""

T16_MESH_BLOCK_OLD = """\
    /* --- mode: mesh (default) - one cloudscape layer (+billow pseudo),
           one very slow transform-only drift --- */
    .pm6-gbg-mesh .pm6-gbg-mesh-layer {
      position: absolute;
      inset: -8%;
      will-change: transform;
      animation: pm-sky-drift 140s ease-in-out infinite alternate;
    }
    .pm6-gbg-mesh .pm6-gbg-mesh-layer::before {
      content: "";
      position: absolute;
      inset: 0;
    }
    @keyframes pm-sky-drift {
      to { transform: translate3d(-1.6%, 1.1%, 0) scale(1.05); }
    }
"""

T16_MESH_BLOCK_NEW = """\
    /* --- mode: mesh (default) - one pre-baked cloudscape wallpaper
           (PM7 T16: base sky + billows baked together, blur included) --- */
    .pm6-gbg-mesh .pm6-gbg-mesh-layer {
      position: absolute;
      inset: 0;
    }
"""

T16_DEPTH_COMMENT_OLD = """\
    /* --- mode: depth - same cloudscape + a second parallax billow layer.
           Base sky + blur live on the container; the two wrappers keep the
           pointer-parallax transform (so drift stays on their ::before /
           the cloud-puff shapes, never fighting the parallax). --- */
"""

T16_DEPTH_COMMENT_NEW = """\
    /* --- mode: depth - baked base sky on the container + baked far-billow
           wallpaper on .pm6-par-far::before (PM7 T16); the wrappers keep the
           pointer-parallax transform and the cloud-puff floats stay live.
           The billow image is sized 86.2069% (= 100/116) of the -8%-inset
           wrapper so it maps exactly onto the viewport. --- */
"""

T16_FARBEFORE_OLD = """\
    .pm6-gbg-depth .pm6-par-far::before {
      content: "";
      position: absolute;
      inset: 0;
      will-change: transform;
      animation: pm-sky-drift 160s ease-in-out infinite alternate;
    }
"""

T16_FARBEFORE_NEW = """\
    .pm6-gbg-depth .pm6-par-far::before {
      content: "";
      position: absolute;
      inset: 0;
    }
"""

T16_PUFF_COMMENT_OLD = ("    /* cloud puffs — flat white/dusk ellipses, "
                        "transform-only float */\n")
T16_PUFF_COMMENT_NEW = ("    /* cloud puffs - flat white/dusk ellipses, "
                        "transform-only float (PM7 T16: rgba colors "
                        "pre-saturated x1.12 light / x1.15 dark, replacing "
                        "the removed container saturate) */\n")

T16_SATURATE = {"glass-light": 1.12, "glass-dark": 1.15}


def _t16_saturate_rgb(r, g, b, s):
    """CSS filter saturate() color matrix (sRGB, per Filter Effects L1)."""
    rows = (
        (0.213 + 0.787 * s, 0.715 - 0.715 * s, 0.072 - 0.072 * s),
        (0.213 - 0.213 * s, 0.715 + 0.285 * s, 0.072 - 0.072 * s),
        (0.213 - 0.213 * s, 0.715 - 0.715 * s, 0.072 + 0.928 * s),
    )
    out = []
    for row in rows:
        v = row[0] * r + row[1] * g + row[2] * b
        out.append(int(round(max(0.0, min(255.0, v)))))
    return tuple(out)


def _t16_glass_span(doc):
    ai = doc.index(T16_GLASS_START_ANCHOR)
    start = doc.rindex("/* ==", 0, ai)
    end = doc.index(T16_GLASS_END_ANCHOR, ai)
    return start, end


def _t16_glass_sha(doc):
    a, z = _t16_glass_span(doc)
    css = doc[a:z]
    mi = doc.index(T16_MARKUP_ANCHOR)
    markup = doc[mi:doc.index("\n", mi)].strip()
    return sha256_text(css + "\n" + markup)


def _t16_rule_span(doc, opener, label):
    need(doc.count(opener) == 1,
         "T16 %s: rule opener not unique (%d)" % (label, doc.count(opener)))
    a = doc.index(opener)
    z = doc.index("}", a) + 1
    need("{" not in doc[a + len(opener):z - 1],
         "T16 %s: unexpected nested brace" % label)
    return a, z


def _t16_replace_rule(doc, opener, new_text, label):
    a, z = _t16_rule_span(doc, opener, label)
    if new_text is None:
        a, z = whole_line_span(doc, a, z)
        return doc[:a] + doc[z:]
    return doc[:a] + new_text + doc[z:]


def t16_glass_wallpaper_prebake(doc, notes):
    need(T16_ASSETS.exists(),
         "T16: frozen bake assets missing at %s (run bake_wallpaper.mjs)"
         % T16_ASSETS)
    assets = json.loads(T16_ASSETS.read_text(encoding="utf-8"))
    imgs = assets.get("images", {})
    for k in ("mesh_light", "mesh_dark", "depth_base_light",
              "depth_base_dark", "depth_billow_light", "depth_billow_dark"):
        need(k in imgs and imgs[k]["data_uri"].startswith("data:image/webp"),
             "T16: bake asset %s missing/not webp" % k)
    total = sum(v["bytes"] for v in imgs.values())
    need(total <= T16_CAP_BYTES,
         "T16: baked assets total %d exceeds hard cap %d" % (total,
                                                             T16_CAP_BYTES))
    need(assets.get("glass_section_sha256") == _t16_glass_sha(doc),
         "T16: bake assets are STALE -- glass CSS/markup sha mismatch; "
         "re-run bake_wallpaper.mjs against the current pre-T16 output")

    # pre-asserts on the live wallpaper CSS
    a, z = _t16_glass_span(doc)
    sect = doc[a:z]
    need(doc.count("pm-sky-drift") == 3, "T16: pm-sky-drift count != 3")
    need(sect.count("filter: blur(14px) saturate(") == 4,
         "T16: wallpaper filter count != 4")
    # ADAPTATION (2026-07-28 UI-fix base): frosted chrome moved backdrop-filter
    # onto ::before (friendly title/status/bottom + glass notify cards) so text
    # stays sharp; substring count 30 -> 27. Live wallpaper sites unchanged.
    # ADAPTATION (rev 9): the frosted scroll-under sweep added ~11 header
    # sites, each contributing the prefixed+unprefixed pair plus its
    # [data-theme^="glass"] `none` fallback pair; the edge-dissolve band
    # dropped from two stacked blur layers to one. Net 69 -> 127 (measured after T01 removes its dead rules). This is a
    # base-drift tripwire, not a perf budget: the glass one-blur-per-pane
    # rule is still enforced by the per-site fallbacks.
    need(doc.count("backdrop-filter") == 134,
         "T16: global backdrop-filter budget drifted from 134")
    glass_alpha_before = doc.count("--glass-alpha")
    need(doc.count("data:image/webp") == 0, "T16: already applied")
    need(doc.count("@keyframes pm-float") == 1 and
         doc.count("animation: pm-float") == 1,
         "T16: pm-float anchors drifted")
    # minimal mode never needed a bake: static gradients only
    mi_a = sect.index("mode: minimal")
    minimal_txt = sect[mi_a:]
    need("filter" not in minimal_txt and "animation" not in minimal_txt,
         "T16: minimal mode unexpectedly has filter/animation")

    def uri(key):
        return imgs[key]["data_uri"]

    # 1. stage header comment
    doc = replace_exact_once(doc, T16_HEADER_OLD, T16_HEADER_NEW,
                             "T16 header comment")
    # 2. mesh: base rule + ::before scaffold + drift keyframes collapse
    doc = replace_exact_once(doc, T16_MESH_BLOCK_OLD, T16_MESH_BLOCK_NEW,
                             "T16 mesh scaffold")
    # 3. mesh per-theme rules -> baked wallpaper; ::before billow rules go
    for theme, key in (("glass-light", "mesh_light"),
                       ("glass-dark", "mesh_dark")):
        opener = ('[data-theme="%s"] .pm6-gbg-mesh .pm6-gbg-mesh-layer {'
                  % theme)
        aa, zz = _t16_rule_span(doc, opener, "mesh " + theme)
        need("filter: blur(14px) saturate(%s)" % T16_SATURATE[theme]
             in doc[aa:zz], "T16 mesh %s: filter anchor missing" % theme)
        doc = _t16_replace_rule(
            doc, opener,
            opener + " background: url(%s) center / cover no-repeat; }"
            % uri(key),
            "mesh " + theme)
        doc = _t16_replace_rule(
            doc,
            '[data-theme="%s"] .pm6-gbg-mesh .pm6-gbg-mesh-layer::before {'
            % theme,
            None, "mesh ::before " + theme)
    # 4. depth comment + container base rules + far-billow rules
    doc = replace_exact_once(doc, T16_DEPTH_COMMENT_OLD, T16_DEPTH_COMMENT_NEW,
                             "T16 depth comment")
    for theme, key in (("glass-light", "depth_base_light"),
                       ("glass-dark", "depth_base_dark")):
        opener = '[data-theme="%s"] .pm6-gbg-depth {' % theme
        aa, zz = _t16_rule_span(doc, opener, "depth base " + theme)
        need("filter: blur(14px) saturate(%s)" % T16_SATURATE[theme]
             in doc[aa:zz], "T16 depth %s: filter anchor missing" % theme)
        doc = _t16_replace_rule(
            doc, opener,
            opener + " background: url(%s) center / cover no-repeat; }"
            % uri(key),
            "depth base " + theme)
    doc = replace_exact_once(doc, T16_FARBEFORE_OLD, T16_FARBEFORE_NEW,
                             "T16 far-billow scaffold")
    for theme, key in (("glass-light", "depth_billow_light"),
                       ("glass-dark", "depth_billow_dark")):
        opener = ('[data-theme="%s"] .pm6-gbg-depth .pm6-par-far::before {'
                  % theme)
        doc = _t16_replace_rule(
            doc, opener,
            opener + " background: url(%s) center / %s no-repeat; }"
            % (uri(key), T16_BILLOW_SIZE),
            "depth billow " + theme)
    # 5. cloud-puff float colors: numeric pre-saturation (12 rules)
    doc = replace_exact_once(doc, T16_PUFF_COMMENT_OLD, T16_PUFF_COMMENT_NEW,
                             "T16 puff comment")
    sat_notes = {}
    line_re = re.compile(
        r'^( *\[data-theme="(glass-light|glass-dark)"\] \.pm6-par-'
        r'(?:far|near) +\.pm6-gbg-shape:nth-child\(\d\) \{ background: '
        r'radial-gradient\(closest-side, )rgba\((\d+),(\d+),(\d+),(\.\d+)\)'
        r'(, transparent 75%\); \})$',
        re.M)
    matches = list(line_re.finditer(doc))
    need(len(matches) == 12,
         "T16: expected 12 float color rules, found %d" % len(matches))
    out = []
    pos = 0
    for m in matches:
        theme = m.group(2)
        r0, g0, b0 = int(m.group(3)), int(m.group(4)), int(m.group(5))
        r1, g1, b1 = _t16_saturate_rgb(r0, g0, b0, T16_SATURATE[theme])
        sat_notes["rgba(%d,%d,%d,%s) %s" % (r0, g0, b0, m.group(6), theme)] \
            = "rgba(%d,%d,%d,%s)" % (r1, g1, b1, m.group(6))
        out.append(doc[pos:m.start()])
        out.append(m.group(1) + "rgba(%d,%d,%d,%s)" % (r1, g1, b1, m.group(6))
                   + m.group(7))
        pos = m.end()
    out.append(doc[pos:])
    doc = "".join(out)

    # post-asserts
    need(doc.count("pm-sky-drift") == 0, "T16: pm-sky-drift survived")
    a, z = _t16_glass_span(doc)
    sect = doc[a:z]
    need("filter:" not in sect and "blur(" not in sect,
         "T16: runtime filter survived in wallpaper scope")
    # post-assert: the transform must not have changed the count it saw.
    need(doc.count("backdrop-filter") == 134,
         "T16: backdrop-filter budget changed")
    need(doc.count("--glass-alpha") == glass_alpha_before,
         "T16: --glass-alpha wiring changed")
    need(doc.count("data:image/webp") == 6, "T16: expected 6 baked images")
    need(doc.count("@keyframes pm-float") == 1 and
         doc.count("animation: pm-float") == 1,
         "T16: pm-float float animation lost")
    need(doc.count("var(--par-x, 0)") == 2 and doc.count("var(--par-y, 0)") == 2,
         "T16: parallax wrapper transforms lost")
    notes["assets"] = {
        "file": str(T16_ASSETS),
        "tier": assets.get("tier"),
        "viewport": assets.get("viewport"),
        "quality": assets.get("quality"),
        "per_image_bytes": {k: v["bytes"] for k, v in imgs.items()},
        "total_data_uri_bytes": total,
        "cap_bytes": T16_CAP_BYTES,
    }
    notes["float_colors_presaturated"] = sat_notes
    notes["approved_visual_change"] = (
        "wallpaper blur/saturate baked into images; pm-sky-drift removed; "
        "floats+parallax stay live; ONE app-shell backdrop-filter unchanged")
    return doc


# ==========================================================================
# Phase E -- T17 Slint clarity layer
# ==========================================================================
# A reading layer for the Slint-porting agent: a PM7-README comment right
# after <head> (lineage, regenerate-never-hand-edit, FEATURE-vs-ARTIFACT
# porting table, name-based TOC) plus a grep-able banner comment before every
# style/script block. All text lives here as constants; ASCII only. NOTE:
# the design memo says "29 blocks" (the pinned-base census); the built
# document has 30 because T11 adds the inert settings-data JSON block --
# the TOC and banners cover all 30 (recorded adaptation).

# (index -> kind, tag_id, short-name, purpose) -- asserted against the doc.
T17_BLOCKS = [
    ("script", "", "theme-boot",
     "applies persisted theme prefs (pm.theme / pm.glassBg / pm.glassAlpha) "
     "before first CSS paint"),
    ("style", "", "core-css",
     "PM4-era core stylesheet: tokens for all 8 themes, glass one-pane "
     "composition + pre-baked wallpaper stage (T16), shell chrome, "
     "editor/terminal/bento components"),
    ("style", "pm4-settings-css", "settings-css",
     "settings page (s4 search-first surface) styles"),
    ("style", "pm6-css-global", "global-css",
     "cross-page chrome: unified tabstrips, toasts, PM8 magnet+spotlight "
     "hover (replaced pm6 jiggle), reduced-motion kill-switches"),
    ("style", "pm6-css-dashboard", "dashboard-css",
     "dashboard page + widget grid styles"),
    ("style", "pm6-css-projects", "projects-css", "projects page styles"),
    ("style", "pm6-css-wizard", "wizard-css",
     "planning wizard + PRD builder styles"),
    ("style", "pm6-css-orchestrator", "orchestrator-css",
     "orchestrator page styles (tabs, run graph, inspector, ledger)"),
    ("style", "pm6-css-usage", "usage-accent-css",
     "usage page accent styles (small; the main usage grid CSS is the "
     "later unlabeled usage-grid-css block)"),
    ("style", "pm6-css-chat", "chat-css",
     "docked/floating chat styles incl. footer pill + FAB stack"),
    ("style", "pm6-css-bottom", "bottom-css",
     "bottom panel + terminal workgroup styles"),
    ("style", "pm6-css-panels", "panels-css",
     "side panel styles (file manager, source control, testing, agents, "
     "notifications)"),
    ("style", "pm6-css-cozy-shelves", "cozy-shelves-css",
     "Cozy Shelves rail panel layer (2026-07-27 reconciliation port): "
     "shelf expanders, --cat-* palette, pill-fit machinery, Debug & Run "
     "panel + bottom Debug tab"),
    ("style", "", "usage-grid-css",
     "usage page widget-composed grid styles (unlabeled block)"),
    ("script", "", "usage-page-js",
     "usage page widget engine (pm6UsagePageInit: ambient baseline data + "
     "renderers)"),
    ("script", "", "pm4-app-js",
     "PM4-era app script: wizard steps, editor panes + tabs, terminal "
     "workgroups/splits, bottom panel, misc page wiring"),
    ("script", "", "prd-annotations-js",
     "PRD mock content + annotation/popover wiring (legacy hooks "
     "null-guarded)"),
    ("script", "pm7-settings-data", "settings-data-json",
     "inert JSON payload for PM_SETTINGS_DATA (T11 parse defer); parsed "
     "lazily on first settings access"),
    ("script", "pm4-settings-js", "settings-js",
     "settings engine: fuzzy search, chips + bloom modal, shelves, "
     "control renderers, LIVE_APPLY"),
    ("script", "pm6-js-globals", "globals-js",
     "toasts, PM8 magnet+spotlight hover engine (replaced pm6 jiggle), "
     "shared PM7_PMOVE pointermove dispatcher (T07)"),
    ("script", "pm6-js-demo-engine", "demo-engine-js",
     "PM_DEMO virtual-clock engine: beats, director/chapters, facades, "
     "action registry (the beat script doubles as a product-behavior spec)"),
    ("script", "pm6-js-demo-files", "demo-files-js",
     "demo file corpus + syntax highlight helpers (PM_DEMO_TEXT.files)"),
    ("script", "pm6-js-dashboard", "dashboard-js",
     "dashboard widgets, editor panes + tab overflow (+N more chip), "
     "drag layout"),
    ("script", "pm6-js-projects", "projects-js", "projects page wiring"),
    ("script", "pm6-js-wizard", "wizard-js",
     "wizard stages, topic workspace, replay"),
    ("script", "pm6-js-orchestrator", "orchestrator-js",
     "orchestrator tabs, run graph, node inspector, ledger, history"),
    ("script", "pm6-js-usage", "usage-bridge-js",
     "usage page demo bridge (engine ledger/cooldown sync)"),
    ("script", "pm6-js-chat-data", "chat-data-js",
     "pre-serialized chat thread corpus (PM6_CHAT_THREADS)"),
    ("script", "pm6-js-chat", "chat-js",
     "chat UI: threads, composer, selector row, popouts, floating "
     "layouts, footer pill + FABs"),
    ("script", "pm6-js-bottom", "bottom-js",
     "bottom panel tabs, problems/ports/output, terminal demo feeds"),
    ("script", "pm6-js-panels", "panels-js",
     "side panel wiring, resizers, glass parallax hook"),
    ("script", "pm6-js-cozy-shelves", "cozy-shelves-js",
     "Cozy Shelves behavior layer (2026-07-27 port): accordion/menus/"
     "pill-fit, file manager machinery, command registrations, PM_RD_DEMO "
     "debug session store"),
]

T17_README_HEAD = """\
<!-- =========================================================================
PM7-README (PMConcept7.html)

WHAT THIS FILE IS
  A BUILD ARTIFACT derived from Concepts/PMConcept6.html (shipped Jul 15
  2026, sha256 %s)
  by the scripted pipeline Concepts/pm7-tools/build_pm7.py (transforms
  T01-T20). REGENERATE, NEVER HAND-EDIT: if something is wrong here, fix
  the transform (or its frozen inputs) and rebuild.
  NOTE: Concepts/pm6-build/ is PMConcept6's parts pipeline, NOT this
  file's -- PMConcept7.html is produced only by pm7-tools. The canonical
  product spec lives in Plans/** ; this concept is source-lineage
  material, never the spec itself.

WHY IT EXISTS
  Same look and behavior as PMConcept6 -- one approved visual change: the
  glass wallpaper blur/saturate is pre-baked into WebP images and the slow
  sky-drift animation is removed (see the GLASS BACKGROUND STAGE section)
  -- minus dead code, always-on idle work, and eval-time parses, and
  structured so a Slint-porting agent can read it without inheriting
  HTML-demo artifacts.

FEATURE vs ARTIFACT (Slint porting table)
  ARTIFACTS - HTML-demo patterns; do NOT port them:
    250ms polling master clock      -> event-driven timers
    innerHTML thread swaps (chat)   -> Repeater model swaps
    body-portaled popouts/popovers  -> PopupWindow
    string-built UI (HTML concat)   -> declarative components
    per-mousemove style writes      -> bound properties
    measure-then-write overlay math -> layout constraints
  FEATURES - product behavior; keep them (cheap to spec natively):
    pre-blurred wallpaper + ONE backdrop blur (this file demonstrates it)
    --glass-alpha transparency slider (per-theme clamps)
    footer anchor constraints (footer-clearing chat layout)
    drag resizers (side panels, chat, terminal)
    cached canvas minimaps
    the PM_DEMO beat script as a product-behavior spec

TABLE OF CONTENTS -- style/script blocks in document order. Find each block
by its "PM7 SECTION n/total" banner comment (names, never byte offsets).
"""

T17_README_TAIL = """\
========================================================================== -->
"""


def t17_slint_clarity_layer(doc, notes):
    need(doc.count("PM7 SECTION") == 0, "T17: already applied")
    blocks = css_audit.segment_blocks(doc)
    need(len(blocks) == len(T17_BLOCKS),
         "T17: block census %d != table %d" % (len(blocks), len(T17_BLOCKS)))
    for i, (kind, tid, _nm, _p) in enumerate(T17_BLOCKS):
        b = blocks[i]
        need(b.kind == kind and (b.tag_id or "") == tid,
             "T17: block %d is %s#%s, table says %s#%s"
             % (i + 1, b.kind, b.tag_id or "", kind, tid))

    n = len(T17_BLOCKS)
    toc_lines = []
    for i, (kind, tid, nm, purpose) in enumerate(T17_BLOCKS):
        label = "%s#%s" % (kind, tid) if tid else "%s, no id" % kind
        toc_lines.append("  %2d. %-18s (%s) - %s" % (i + 1, nm, label, purpose))
    readme = (T17_README_HEAD % BASE_SHA + "\n".join(toc_lines) + "\n"
              + T17_README_TAIL)
    need(all(ord(c) < 128 for c in readme), "T17: README not ASCII")
    need("-->" not in readme[:-4], "T17: premature comment close in README")

    # banners before every block, inserted back-to-front so offsets hold
    for i in range(n - 1, -1, -1):
        b = blocks[i]
        kind, tid, nm, purpose = T17_BLOCKS[i]
        label = "%s#%s" % (kind, tid) if tid else "%s, no id" % kind
        banner = ("<!-- PM7 SECTION %d/%d: %s - %s (%s) -->"
                  % (i + 1, n, nm, purpose, label))
        need(all(ord(c) < 128 for c in banner), "T17: banner not ASCII")
        ls = doc.rfind("\n", 0, b.open_start) + 1
        indent = doc[ls:b.open_start]
        if indent.strip() == "":
            doc = doc[:ls] + indent + banner + "\n" + doc[ls:]
        else:
            doc = doc[:b.open_start] + banner + "\n" + doc[b.open_start:]

    need(doc.count("<head>") == 1, "T17: <head> not unique")
    doc = doc.replace("<head>", "<head>\n" + readme, 1)

    # post-asserts
    need(doc.count("PM7 SECTION") == n + 1,
         "T17: banner census mismatch (want %d banners + 1 TOC mention)" % n)
    blocks2 = css_audit.segment_blocks(doc)
    need(len(blocks2) == n, "T17: block structure changed by insertion")
    notes["readme_bytes"] = len(readme)
    notes["banners"] = n
    notes["adaptation"] = ("design memo said 31 blocks; built doc has 32 "
                           "(T11 settings-data JSON block) -- all bannered")
    return doc


# --------------------------------------------------------------------------
# T18 -- PM7 visual cleanup (assertion-guarded, source-owned)
# --------------------------------------------------------------------------

def t18_pm7_visual_cleanup(doc, notes):
    """Apply the four PMConcept7 visual corrections in one final transform.

    This deliberately runs after T17 so the generated metadata and all
    section banners are already present. Each edit is anchored to the
    current PM7 source shape; a base drift or an already-applied change
    aborts the build instead of silently broadening the visual override.
    """
    marker = "PM7 T18: preview header owns the frost"
    need(marker not in doc, "T18: visual cleanup already applied")

    # Search results keep the transparent layout rail, but no longer paint a
    # category-colored rail on hover.
    search_hover_old = (
        ".sh-hit:hover { background: color-mix(in srgb, var(--cat) 9%, "
        "transparent); border-left-color: var(--cat); }"
    )
    search_hover_new = (
        ".sh-hit:hover { background: color-mix(in srgb, var(--cat) 9%, "
        "transparent); }"
    )
    doc = replace_exact_once(doc, search_hover_old, search_hover_new,
                             "T18 search-result hover rail")
    need("border-left: 2px solid transparent" in doc,
         "T18 search-result layout rail was removed")
    need(search_hover_old not in doc,
         "T18 search-result colored hover rail survived")

    # Remove only the selected-thread inset stripe. The regex is restricted
    # to complete box-shadow declarations containing the exact 3px-left
    # layer, then removes that layer while leaving every other shadow layer
    # byte-for-byte intact.
    stripe = "inset 3px 0 0 0"
    need(doc.count(stripe) == 14,
         "T18: expected 14 selected-thread inset stripes, found %d"
         % doc.count(stripe))
    shadow_re = re.compile(
        r"box-shadow:(?P<body>[^;]*" + re.escape(stripe) + r"[^;]*);",
        re.S,
    )
    shadow_matches = list(shadow_re.finditer(doc))
    need(len(shadow_matches) == 14,
         "T18: expected 14 selected-thread shadow declarations, found %d"
         % len(shadow_matches))

    def strip_selected_thread_stripe(match):
        body = match.group("body")
        body, removed = re.subn(
            r"(?m)^[ \t]*inset 3px 0 0 0 [^,\n;]+,[ \t]*\n",
            "",
            body,
            count=1,
        )
        if stripe in body:
            body, removed_last = re.subn(
                r",[ \t]*\n?[ \t]*inset 3px 0 0 0 [^,\n;]+(?=\s*$)",
                "",
                body,
                count=1,
            )
            removed += removed_last
        need(removed == 1,
             "T18: selected-thread shadow did not expose exactly one stripe")
        need(stripe not in body,
             "T18: selected-thread stripe survived its shadow rewrite")
        return "box-shadow:" + body + ";"

    doc = shadow_re.sub(strip_selected_thread_stripe, doc)
    need(stripe not in doc, "T18: selected-thread inset stripe survived")
    need(".chat-thread-item.active" in doc and
         ".chat-thread-sidebar.collapsed .chat-thread-item.active" in doc,
         "T18: selected-thread state selectors were lost")

    # The topic list is lifted by a measured 22px header. Give the frosted
    # header a matching minimum box so fractional text metrics cannot leave a
    # one-pixel upward seam between the header and the scroller.
    topic_head_old = """    .pm6-wiz-topics > .pm6-wiz-col-head {
      position: relative;
      z-index: 5;
      background: color-mix(in srgb, var(--surface) 72%, transparent);
      -webkit-backdrop-filter: blur(11px) saturate(140%);
      backdrop-filter: blur(11px) saturate(140%);
    }
"""
    topic_head_new = """    .pm6-wiz-topics > .pm6-wiz-col-head {
      position: relative;
      z-index: 5;
      min-height: var(--pm6-wiz-colhead-h, 22px);
      box-sizing: border-box;
      background: color-mix(in srgb, var(--surface) 72%, transparent);
      -webkit-backdrop-filter: blur(11px) saturate(140%);
      backdrop-filter: blur(11px) saturate(140%);
    }
"""
    doc = replace_exact_once(doc, topic_head_old, topic_head_new,
                             "T18 topic-map header geometry")
    need("min-height: var(--pm6-wiz-colhead-h, 22px)" in doc,
         "T18 topic-map header minimum height missing")

    # PM_FROST still measures the same header row, but its old comment
    # described a wrapper pseudo-element. Keep the generated metadata honest.
    frost_registry_old = """      /* the plan preview's caption, so its plate overlay can find the card's
         top edge (the plate lives on the wrapper, not inside the card) */
"""
    frost_registry_new = """      /* the plan preview header owns the frost and publishes the measured
         height used to lift the document behind it. */
"""
    doc = replace_exact_once(doc, frost_registry_old, frost_registry_new,
                             "T18 preview frost registry metadata")

    # Move the frost to the preview header row. The document is lifted behind
    # that row, then receives the same measured top padding so its title stays
    # fully visible at scroll position zero.
    preview_start_marker = "    /* Frosted scroll-under for the plan preview.\n"
    preview_end_marker = "    .pm6-wiz-doc-sec {"
    preview_start = doc.find(preview_start_marker)
    preview_end = doc.find(preview_end_marker, preview_start)
    need(preview_start >= 0 and preview_end > preview_start,
         "T18: preview frost block anchors missing")
    preview_old = doc[preview_start:preview_end]
    need(preview_old.count(".pm6-wiz-preview::after") == 2,
         "T18: preview pseudo frost block shape changed")
    preview_new = """    /* PM7 T18: preview header owns the frost. The document is lifted
       behind the measured header row and re-padded so the title remains
       fully visible at scroll position zero. */
    .pm6-wiz-preview {
      --pm6-wiz-previewhead-h: 28px;
    }
    .pm6-wiz-preview > .pm6-wiz-col-head {
      position: relative;
      z-index: 5;
      background: color-mix(in srgb, var(--surface-elevated) 72%, transparent);
      -webkit-backdrop-filter: blur(11px) saturate(140%);
      backdrop-filter: blur(11px) saturate(140%);
    }
    /* glass blur budget: no nested backdrop-filter inside the pane */
    [data-theme^="glass"] .pm6-wiz-preview > .pm6-wiz-col-head {
      -webkit-backdrop-filter: none;
      backdrop-filter: none;
      background: color-mix(in srgb, var(--surface-elevated) 88%, transparent);
    }
    .pm6-wiz-preview > .pm6-wiz-doc {
      margin-top: calc(-1 * var(--pm6-wiz-previewhead-h, 28px));
      padding-top: var(--pm6-wiz-previewhead-h, 28px);
    }
"""
    doc = doc[:preview_start] + preview_new + doc[preview_end:]
    need(".pm6-wiz-preview::after" not in doc,
         "T18: preview pseudo-element frost survived")
    need(".pm6-wiz-preview > .pm6-wiz-col-head" in doc and
         "padding-top: var(--pm6-wiz-previewhead-h, 28px)" in doc,
         "T18: preview header frost or document padding missing")

    notes.update({
        "search_result_hover": "transparent layout rail retained; colored rail removed",
        "selected_chat_thread_stripes_removed": 14,
        "topic_map_header_min_height": "--pm6-wiz-colhead-h (22px fallback)",
        "preview_frost_owner": ".pm6-wiz-preview > .pm6-wiz-col-head",
        "preview_document_lift": "negative measured header margin + matching top padding",
    })
    return doc


def t19_pm7_preview_fit(doc, notes):
    """Inset the preview frost to the document's visible border edge."""
    marker = "PM7 T19: preview frost fitted to the document edge"
    need(marker not in doc, "T19: preview fit already applied")

    preview_header_old = """    .pm6-wiz-preview > .pm6-wiz-col-head {
      position: relative;
      z-index: 5;
      background: color-mix(in srgb, var(--surface-elevated) 72%, transparent);
      -webkit-backdrop-filter: blur(11px) saturate(140%);
      backdrop-filter: blur(11px) saturate(140%);
    }
"""
    preview_header_new = """    /* PM7 T19: preview frost fitted to the document edge. The document's
       1px border remains visible instead of being covered by the header plate. */
    .pm6-wiz-preview > .pm6-wiz-col-head {
      position: relative;
      z-index: 5;
      margin-inline: 1px;
      background: color-mix(in srgb, var(--surface-elevated) 72%, transparent);
      -webkit-backdrop-filter: blur(11px) saturate(140%);
      backdrop-filter: blur(11px) saturate(140%);
    }
"""
    doc = replace_exact_once(doc, preview_header_old, preview_header_new,
                             "T19 preview header inset")
    need(doc.count(marker) == 1, "T19: preview fit marker missing")
    need(doc.count("margin-inline: 1px;") == 1,
         "T19: preview header inset is not unique")
    notes.update({
        "preview_header_inset": "1px inline inset preserves the document border edge",
    })
    return doc


def t20_home_workspace(doc, notes):
    """Install the model-first Home Workspace as an authored PM7 layer.

    The transform injects into existing PM6 style/script blocks so the block
    census remains stable. The old surface-level HTML5/CSS-order swap handler is
    removed by a bounded regex; editor-tab DnD and terminal-pane DnD remain
    domain-local and are not touched.
    """
    marker = home_source.HOME_TRANSFORM_MARKER
    need(marker not in doc, "T20: Home transform already applied")
    need(doc.count("<body>") == 1, "T20: body anchor is not unique")
    need(doc.count('<style id="pm6-css-dashboard">') == 1,
         "T20: dashboard style anchor is not unique")
    need(doc.count('<script id="pm6-js-dashboard">') == 1,
         "T20: dashboard script anchor is not unique")

    legacy_re = re.compile(home_source.LEGACY_SURFACE_DND_PATTERN, re.S)
    legacy_matches = list(legacy_re.finditer(doc))
    need(len(legacy_matches) == 1,
         "T20: expected one legacy surface DnD band, found %d" %
         len(legacy_matches))
    replacement = (
        "\n        // PM7 T20: surface DnD is Pointer Events/model-first; "
        "editor-tab DnD remains local.\n"
        "        " + home_source.LEGACY_SURFACE_DND_ANCHOR
    )
    doc = legacy_re.sub(replacement, doc, count=1)
    need("draggedPaneId" not in doc,
         "T20: legacy CSS-order surface swap survived")

    # The Home reset action belongs under Settings > General & Appearance >
    # Startup & Recovery. The authored record is inserted before the first
    # existing general.startup row so the settings renderer owns its normal
    # search, grouping, and responsive behavior.
    settings_anchor = home_source.HOME_SETTINGS_INSERT_BEFORE
    need(doc.count(settings_anchor) == 1,
         "T20: Home settings insertion anchor is not unique")
    need("general.startup.reset-home-layout" not in doc,
         "T20: Home settings reset record already exists")
    doc = doc.replace(settings_anchor,
                      home_source.HOME_SETTINGS_RECORD + settings_anchor, 1)

    markup = "<!-- %s -->\n%s" % (marker, home_source.HOME_MARKUP)
    doc = doc.replace("<body>", "<body>\n" + markup, 1)

    style_open = '<style id="pm6-css-dashboard">'
    style_start = doc.index(style_open)
    style_close = doc.index("</style>", style_start)
    doc = doc[:style_close] + "\n" + home_source.HOME_STYLE + doc[style_close:]

    script_open = '<script id="pm6-js-dashboard">'
    script_start = doc.index(script_open)
    script_close = doc.index("</script>", script_start)
    doc = doc[:script_close] + "\n" + home_source.HOME_SCRIPT + doc[script_close:]

    # T17 owns the generated artifact lineage note and names the complete
    # pipeline, including this authored Home transform.
    need(doc.count("T01-T20") >= 1, "T20: T17 complete lineage note missing")

    need(doc.count(marker) == 1, "T20: transform marker count is not 1")
    need(doc.count('id="pm-home-workspace"') == 1,
         "T20: Home workspace root is not unique")
    topbar_markup = home_source.HOME_MARKUP.split(
        '<div id="pm-home-more-menu"', 1)[1].split(
            '<div id="pm-home-open-panel-flyout"', 1)[0]
    # 2026-08-13 wave: the menu gained a fourth row, Reset Layout (dual-surface
    # with the Settings row; both route cmd.workspace_layout.reset).
    need(topbar_markup.count("data-pm-home-top-action=") == 4,
         "T20: Home top-bar menu must contain exactly four actions")
    for label in ("Open Panel", "Open Browser in Panel",
                  "Collapse Bottom Terminal", "Reset Layout"):
        need(topbar_markup.count(label) == 1,
             "T20: Home top-bar menu label is missing or duplicated: %s" %
             label)
    for forbidden in ("File Manager",
                      "Move or dock", "Pop Out", "Close Panel",
                      "Terminal sections", "Layout revision", "Recovery status",
                      "Diagnostics"):
        need(forbidden not in topbar_markup,
             "T20: forbidden oversized-menu content survived: %s" %
             forbidden)
    need(doc.count("general.startup.reset-home-layout") == 3,
         "T20: Settings reset record and handler must both be present")
    need(doc.count("PM_HOME_WORKSPACE") >= 2,
         "T20: public controller marker missing")
    need("setPointerCapture" in doc and "pointercancel" in doc,
         "T20: Pointer Events capture/cancellation hooks missing")
    need("cmd.workspace_layout.move_surface" in doc and
         "cmd.workspace_layout.resize_surface" in doc,
         "T20: semantic layout command hooks missing")
    need("pm.homeWorkspaceLayout:v1:" in doc,
         "T20: project/workspace localStorage key missing")
    resizer_blur_anchor = "        window.addEventListener('blur', () => endDrag(null));"
    need(doc.count(resizer_blur_anchor) == 1,
         "T20: shared resizer blur anchor is not unique")
    resizer_bridge = (
        "        window.PM_CANCEL_RESIZER = function() { endDrag(null); };\n"
    )
    doc = doc.replace(resizer_blur_anchor, resizer_bridge + resizer_blur_anchor, 1)
    need(doc.count("window.PM_CANCEL_RESIZER = function()") == 1,
         "T20: shared resizer cancellation bridge is not unique")

    # 2026-08-13 wave: retire the base chat overlay/detached window modes in
    # PM7. The guard routes every non-docked layout request into the Home
    # float layer (PM_HOME_WORKSPACE.popOutChat), so chat pops out INSIDE the
    # workspace instead of covering it with a fixed, scrimmed window -- and a
    # T20 re-render can no longer resurrect the docked chat alongside the
    # overlay (the two-chats defect). The scrim CSS becomes dead code and is
    # deliberately left in place (block census unchanged).
    chat_layout_anchor = "    LAYOUT = mode;"
    need(doc.count(chat_layout_anchor) == 1,
         "T20: chat applyLayout assignment anchor is not unique")
    chat_layout_guard = (
        "    /* PM7 T20: overlay/detached chat is retired; chat pops out into\n"
        "       the Home float layer instead of covering the workspace. */\n"
        "    if (mode !== 'docked' && window.PM_HOME_WORKSPACE &&\n"
        "        window.PM_HOME_WORKSPACE.popOutChat) {\n"
        "      var pm7FloatChat = document.getElementById('floatingChat');\n"
        "      if (pm7FloatChat) pm7FloatChat.style.display = 'none';\n"
        "      window.PM_HOME_WORKSPACE.popOutChat();\n"
        "      return;\n"
        "    }\n"
    )
    doc = doc.replace(chat_layout_anchor,
                      chat_layout_guard + chat_layout_anchor, 1)
    need(doc.count("PM7 T20: overlay/detached chat is retired") == 1,
         "T20: chat overlay retirement guard is not unique")
    notes.update({
        "marker": marker,
        "markup_bytes": len(home_source.HOME_MARKUP.encode("utf-8")),
        "style_bytes": len(home_source.HOME_STYLE.encode("utf-8")),
        "script_bytes": len(home_source.HOME_SCRIPT.encode("utf-8")),
        "legacy_surface_dnd_removed": True,
        "legacy_surface_swap_token_absent": True,
        "topbar_menu_actions": [
            "Open Panel",
            "Open Browser in Panel",
            "Collapse Bottom Terminal",
            "Reset Layout"
        ],
        "topbar_menu_action_count": 4,
        "settings_reset_id": "general.startup.reset-home-layout",
        "injection_blocks": ["pm6-css-dashboard", "pm6-js-dashboard"],
        "model_identity": [
            "editor_panel_1",
            "editor_panel_2",
            "editor_panel_3",
            "editor_panel_4",
            "dashboard",
            "chat",
            "terminal_section:<terminal_section_id>"
        ],
        "hosts": [
            "home_main",
            "dock_left",
            "dock_right",
            "dock_top",
            "dock_bottom",
            "floating"
        ],
        "commit_rule": "preview local; one command/event/persist on semantic end",
        "native_authority": "Slint 1.17.1 multi-window; web in-canvas floating fallback"
    })
    return doc


TRANSFORMS = [
    ("T01_dead_css_selectors", t01_dead_css_selectors),
    ("T02_shimmer_guard", t02_shimmer_guard),
    ("T03_pm_sheen_killer", t03_pm_sheen_killer),
    ("T04_breadcrumb_stub", t04_breadcrumb_stub),
    ("T05_chat_suggestions_field", t05_chat_suggestions_field),
    ("T06_terminal_dead_interval", t06_terminal_dead_interval),
    ("T07_merge_pointermove", t07_merge_pointermove),
    ("T08_cooldown_dom_gating", t08_cooldown_dom_gating),
    ("T09_terminal_feed_gating", t09_terminal_feed_gating),
    ("T10_snapshot_handler_gating", t10_snapshot_handler_gating),
    ("T11_settings_data_defer", t11_settings_data_defer),
    ("T12_chat_data_defer", t12_chat_data_defer),
    ("T13_demo_files_defer", t13_demo_files_defer),
    ("T14_page_init_defer", t14_page_init_defer),
    ("T15_static_colormix_precompute", t15_static_colormix_precompute),
    ("T16_glass_wallpaper_prebake", t16_glass_wallpaper_prebake),
    ("T17_slint_clarity_layer", t17_slint_clarity_layer),
    ("T18_pm7_visual_cleanup", t18_pm7_visual_cleanup),
    ("T19_pm7_preview_fit", t19_pm7_preview_fit),
    ("T20_home_workspace", t20_home_workspace),
]


# --------------------------------------------------------------------------
# Static gates
# --------------------------------------------------------------------------

def gate_brace_balance(doc):
    result = {"name": "brace_balance", "pass": True, "detail": []}
    for b in css_audit.segment_blocks(doc):
        if b.kind != "style":
            continue
        css = css_audit.strip_css_comments(b.content(doc))
        depth = 0
        ok = True
        i = 0
        n = len(css)
        while i < n:
            c = css[i]
            if c in "\"'":
                q = c
                i += 1
                while i < n and css[i] != q:
                    if css[i] == "\\":
                        i += 1
                    i += 1
            elif c == "{":
                depth += 1
            elif c == "}":
                depth -= 1
                if depth < 0:
                    ok = False
                    break
            i += 1
        if depth != 0:
            ok = False
        label = b.tag_id or ("style@%d" % b.open_start)
        result["detail"].append({"block": label, "balanced": ok})
        if not ok:
            result["pass"] = False
    return result


def collect_defined_vars(doc):
    defined = set(re.findall(r"(--[A-Za-z0-9_-]+)\s*:", doc))
    defined |= set(re.findall(r"setProperty\(\s*['\"](--[A-Za-z0-9_-]+)['\"]",
                              doc))
    return defined


def gate_css_vars(doc, base_doc):
    used = set(re.findall(r"var\(\s*(--[A-Za-z0-9_-]+)", doc))
    undef = used - collect_defined_vars(doc)
    base_used = set(re.findall(r"var\(\s*(--[A-Za-z0-9_-]+)", base_doc))
    base_undef = base_used - collect_defined_vars(base_doc)
    new_undef = undef - base_undef
    return {"name": "css_vars_defined", "pass": not new_undef,
            "undefined_new": sorted(new_undef),
            "undefined_preexisting_in_base": sorted(base_undef)}


def gate_js_syntax(doc, tmpdir):
    tmpdir = Path(tmpdir)
    tmpdir.mkdir(parents=True, exist_ok=True)
    result = {"name": "js_node_check", "pass": True, "detail": []}
    for idx, b in enumerate(css_audit.segment_blocks(doc)):
        if b.kind != "script":
            continue
        # skip non-JS script blocks (e.g. the T11 application/json data block)
        open_tag = doc[b.open_start:b.content_start].lower()
        m = re.search(r'type\s*=\s*["\']([^"\']+)["\']', open_tag)
        if m and m.group(1) not in ("text/javascript", "module",
                                    "application/javascript"):
            result["detail"].append({"block": b.tag_id or "script@%d" % b.open_start,
                                     "pass": True,
                                     "skipped": "non-JS type: %s" % m.group(1)})
            continue
        label = b.tag_id or ("script@%d" % b.open_start)
        path = tmpdir / ("block%02d_%s.js" % (idx, re.sub(r"[^\w-]", "_", label)))
        path.write_text(b.content(doc), encoding="utf-8")
        proc = subprocess.run(["node", "--check", str(path)],
                              capture_output=True, text=True)
        ok = proc.returncode == 0
        rec = {"block": label, "pass": ok}
        if not ok:
            rec["stderr"] = proc.stderr[-800:]
            result["pass"] = False
        result["detail"].append(rec)
    return result


def gate_no_emoji(out_path):
    if not NO_EMOJI_CHECKER.exists():
        return {"name": "no_emoji", "pass": False,
                "error": "checker not found at %s" % NO_EMOJI_CHECKER}
    proc = subprocess.run([sys.executable, str(NO_EMOJI_CHECKER),
                           str(out_path)], capture_output=True, text=True)
    return {"name": "no_emoji", "pass": proc.returncode == 0,
            "stdout": proc.stdout[-1200:], "stderr": proc.stderr[-400:]}


# --------------------------------------------------------------------------
# main
# --------------------------------------------------------------------------

def main(argv=None):
    ap = argparse.ArgumentParser(description="PM7 build pipeline (Phase A)")
    ap.add_argument("--base", default=str(BASE_DEFAULT))
    ap.add_argument("--out", help="output HTML path (default: OUTDIR/PM7-phaseA.html)")
    ap.add_argument("--outdir", required=True,
                    help="directory for report/tmp files (use the scratchpad)")
    ap.add_argument("--until", type=int, default=None,
                    help="run only transforms 1..N")
    ap.add_argument("--skip", action="append", default=[],
                    help="skip a transform by name or Txx prefix (repeatable)")
    ap.add_argument("--report", action="store_true",
                    help="also print the JSON report to stdout")
    ap.add_argument("--allow-new-base", action="store_true",
                    help="skip the BASE_SHA pin assertion (records actual sha)")
    args = ap.parse_args(argv)

    outdir = Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)
    out_path = Path(args.out) if args.out else outdir / "PM7-phaseA.html"

    base_text = Path(args.base).read_text(encoding="utf-8")
    base_sha = sha256_text(base_text)
    if base_sha != BASE_SHA and not args.allow_new_base:
        print("FATAL: base sha mismatch.\n  pinned : %s\n  actual : %s\n"
              "Re-run css_audit + review + refreeze dead_selectors.py, then "
              "use --allow-new-base intentionally." % (BASE_SHA, base_sha),
              file=sys.stderr)
        return 2

    report = {
        "generated": time.strftime("%Y-%m-%d %H:%M:%S"),
        "base": str(args.base),
        "base_sha256": base_sha,
        "base_sha_pinned": BASE_SHA,
        "base_pin_ok": base_sha == BASE_SHA,
        "base_bytes": len(base_text.encode("utf-8")),
        "transforms": [],
        "gates": [],
    }

    blocks = css_audit.segment_blocks(base_text)
    census = {
        "total": len(blocks),
        "style": len([b for b in blocks if b.kind == "style"]),
        "script": len([b for b in blocks if b.kind == "script"]),
    }
    report["block_census"] = census
    if not (census["total"] == EXPECTED_BLOCKS and
            census["style"] == EXPECTED_STYLE_BLOCKS and
            census["script"] == EXPECTED_SCRIPT_BLOCKS):
        print("FATAL: block census %r != expected (%d/%d/%d)" % (
            census, EXPECTED_BLOCKS, EXPECTED_STYLE_BLOCKS,
            EXPECTED_SCRIPT_BLOCKS), file=sys.stderr)
        return 2

    doc = base_text
    skip = set(args.skip)

    def skipped(name):
        return name in skip or any(name.startswith(s) for s in skip)

    for i, (name, fn) in enumerate(TRANSFORMS, start=1):
        if args.until is not None and i > args.until:
            report["transforms"].append({"name": name, "status": "not-run"})
            continue
        if skipped(name):
            report["transforms"].append({"name": name, "status": "skipped"})
            continue
        before = len(doc.encode("utf-8"))
        notes = {}
        try:
            doc = fn(doc, notes)
        except TransformAbort as e:
            report["transforms"].append({"name": name, "status": "FAILED",
                                         "error": str(e)})
            report_path = outdir / "build_report.json"
            report_path.write_text(json.dumps(report, indent=2),
                                   encoding="utf-8")
            print("ABORT in %s: %s" % (name, e), file=sys.stderr)
            print("report: %s" % report_path, file=sys.stderr)
            return 1
        after = len(doc.encode("utf-8"))
        report["transforms"].append({
            "name": name, "status": "ok",
            "bytes_before": before, "bytes_after": after,
            "bytes_delta": after - before, "notes": notes,
        })

    out_path.write_text(doc, encoding="utf-8")
    report["output"] = str(out_path)
    report["output_bytes"] = len(doc.encode("utf-8"))
    report["output_sha256"] = sha256_text(doc)
    report["total_bytes_removed"] = report["base_bytes"] - report["output_bytes"]

    report["gates"].append(gate_brace_balance(doc))
    report["gates"].append(gate_css_vars(doc, base_text))
    report["gates"].append(gate_js_syntax(doc, outdir / "tmp_js"))
    report["gates"].append(gate_no_emoji(out_path))
    gates_ok = all(g.get("pass") for g in report["gates"])
    report["gates_all_pass"] = gates_ok

    report_path = outdir / "build_report.json"
    report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")

    for t in report["transforms"]:
        if t["status"] == "ok":
            print("%-28s %8d bytes" % (t["name"], t["bytes_delta"]))
        else:
            print("%-28s %s" % (t["name"], t["status"]))
    print("output: %s (%d bytes, removed %d)" % (
        out_path, report["output_bytes"], report["total_bytes_removed"]))
    for g in report["gates"]:
        print("gate %-20s %s" % (g["name"], "PASS" if g.get("pass") else "FAIL"))
    print("report: %s" % report_path)
    if args.report:
        print(json.dumps(report, indent=2))
    return 0 if gates_ok else 1


if __name__ == "__main__":
    sys.exit(main())
