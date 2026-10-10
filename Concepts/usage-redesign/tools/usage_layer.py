#!/usr/bin/env python3
"""Usage layer: replace the Prism Usage page of the built concept with the redesigned Usage page in ../src.

opus-5.5 tools/build.py applies it at its step 2b (after the PATCHES loop, before the O55 splice), which publishes
PMConcept7.html (build.md section 9, Proposal B):

  text, notes = usage_layer.apply(text, need)   # text = build_text() at step 2b; need = build.need
  problems = usage_layer.lint()                 # source rules for ../src
  problems = usage_layer.syntax_check(text)     # node --check of <script id="pm-usage-js">

What apply() does, every step guarded so it happens exactly once or the build stops:
  1. Finds the #panel-usage band (`<div class="page page-usage" id="panel-usage">` .. `</div><!-- page-usage -->`).
  2. Keeps from it only what the rest of the concept needs: the chat context module's rules from the anonymous T21
     stylesheet (63 rules plus the context halves of 6 shared rules), the two concept-wide Retro Light rules of
     pm7-t29-usage-final, and the global status bar and Home dashboard rules of pm7-t32-final (61 rules plus 1
     rewritten). Both filtered stylesheets keep their ids and their order, so the cascade outside Usage is unchanged.
     pm7-t31-usage-final, the old markup and the old Usage script go with the band.
  3. Extracts the chat context module (window.PM7_CONTEXT) from the old Usage script, pinned by sha256, and runs it
     inside a shim that routes its Usage-side effects to the new page's window.PM7_USAGE.
  4. Writes the new band: the open tag, <!-- USAGE:BODY:START -->, <style id="pm-usage-ctx-css">, the filtered
     pm7-t29-usage-final and pm7-t32-final, <style id="pm-usage-css"> (src/css), src/markup.html,
     <script id="pm-usage-js"> (window.PM_USAGE_COPY, src/js, the context module), <!-- USAGE:BODY:END -->, the close tag.
  5. Outside the band: removes pm7-t24-usage-readability-and-fit and filters the Usage rules out of
     pm7-t23-adjustments (75 kept, 215 dropped). Shared blocks that merely name a pm7u- class are left alone: with the
     new pmu- namespace those selectors match nothing.
  6. Merges the review roster (src/roster.json) into the Settings providers fixture and seeds saved Settings states once
     (roster_patch), then adds the new page's class names to the NieR Mode selector lists (NIER_SELECTOR_PATCHES).
"""
from __future__ import annotations

import hashlib
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

TOOLS = Path(__file__).resolve().parent
PKG = TOOLS.parent
SRC = PKG / 'src'
CONCEPTS = PKG.parent
OPUS_TOOLS = CONCEPTS / 'onboarding' / 'opus-5.5' / 'tools'

OPEN_TAG = '<div class="page page-usage" id="panel-usage">'
CLOSE_TAG = '</div><!-- page-usage -->'
BODY_START = '<!-- USAGE:BODY:START -->'
BODY_END = '<!-- USAGE:BODY:END -->'
T21_ANCHOR = '<!-- PM7 SECTION 14/32: usage-prism-css'
CTX_JS_START = '  /* U11 context module, mounted into every Assistant header. */'
CTX_JS_END = '  window.PM7_CONTEXT = { enhance: enhanceContext, openDetails: openContextDetails, compact: compactContext };'
# The context module as the old Usage script carries it. A change upstream must be looked at before it is carried over.
CTX_JS_SHA256 = '5fb115273b346fb26bf7ea81246caae88b57bdb5e17f5878f510563477480c1e'

# Exact rule counts of each filtered stylesheet. Any drift in the base fails the build instead of passing silently.
EXPECT = {
    't21 context rules': {'kept_rules': 63, 'rewritten_rules': 6, 'dropped_rules': 248, 'dropped_keyframes': 1},
    'pm7-t29-usage-final': {'kept_rules': 2, 'rewritten_rules': 0, 'dropped_rules': 277, 'dropped_keyframes': 0},
    'pm7-t32-final': {'kept_rules': 61, 'rewritten_rules': 1, 'dropped_rules': 159, 'dropped_keyframes': 0},
    'pm7-t23-adjustments': {'kept_rules': 75, 'rewritten_rules': 0, 'dropped_rules': 215, 'dropped_keyframes': 1},
}
# Inside the band and removed with it (each must be there exactly once, so a moved block cannot survive unnoticed).
BAND_ONLY = ['id="pm7UsageApp"', 'id="pm7uBoard"', '<style id="pm7-t29-usage-final">', '<style id="pm7-t31-usage-final">',
             '<style id="pm7-t32-final">', T21_ANCHOR, CTX_JS_START, CTX_JS_END]
# Whole Usage-only stylesheets outside the band.
DROP_WHOLE = ['pm7-t24-usage-readability-and-fit']
# What a built page with this layer must no longer carry, and what it must still carry (the old page's outside
# contracts: the chat context module, the usage bridge, the status bar, Home, Retro Light's green). opus-5.5 build.py
# check() enforces both on the published page.
REMOVED = ['id="pm7UsageApp"', 'id="pm7uBoard"', 'pm7-t24-usage-readability-and-fit', 'pm7-t31-usage-final',
           'PM7 SECTION 15/32: usage-prism-js']
KEPT = ['window.PM7_CONTEXT =', '<script id="pm6-js-usage">', '.pm7-statusbar', '<style id="pm7-t32-final">',
        '<style id="pm7-t29-usage-final">', '<style id="pm-usage-ctx-css">', '<style id="pm-usage-css">',
        '<script id="pm-usage-js">', 'id="pmuApp"', '[data-theme="retro-light"]{--accent-lime:#2f7a3d']

# The two deliberate edits to the extracted context module: a compaction writes the new page's data and re-renders its
# Context room. (Toasts go to window.toast through the shim's toast(); the old one wrote into the Usage page's own
# hidden toast element, so a compaction started from Chat on another page showed nothing.)
CTX_JS_EDITS = [
    ('    var context = DATA.context;\n',
     '    var usage = window.PM7_USAGE, context = usage && usage.data && usage.data.context;\n'
     '    if (!context) return;\n',
     'context projection target'),
    ("    if (state.room === 'context') render();\n  }\n",
     "    if (typeof usage.rerender === 'function') usage.rerender('context');\n  }\n",
     'context projection re-render'),
]

# NieR Mode selector lists in the Settings script (built from opus-5.5 src/settings/kit.d/19-nier-parts.js). The new
# page's class names go here (ARCHITECTURE.md section 7.1). An empty list skips that patch. The CSS half of the cursor
# (the ink bar and its paper text) is Usage's own src/css/90-nier-shell.css: the app's CSS lists name the retired .pm7u-
# rows and Usage's rows need their own exceptions (disabled rows, icon boxes, the Attention count). Lane f-nier
# (2026-10-09) added the range strip to the cursor and chosen lists and the confirm / cancel menu sounds.
NIER_NAMES = {
    'cursor': ['.pmu-navbtn', '.pmu-poprow', '.pmu-range button'],   # items that become the NieR ink-bar menu cursor
    'chosen': ['.pmu-navbtn', '.pmu-range button'],             # places a click chooses (the brackets lock on)
    'strip': ['.pmu-range button', '.pmu-seg button'],          # items in a horizontal strip (the cursor sits under them)
    'titles': ['#pmuRoomTitle', '.pmu-brand h1'],               # the Usage page's titles for the NieR decode
    'confirm': ['.pmu-usebtn', '.pmu-inspact.primary'],         # a click that commits (Menu sounds: confirm)
    'cancel': ['#pmuInspClose'],                                # a click that closes without choosing (Menu sounds: cancel)
}


def nier_selector_patches(names: dict | None = None) -> list[tuple[str, str, str]]:
    names = NIER_NAMES if names is None else names
    out = []
    if names.get('cursor'):
        old = "'.pm51-menu-item', '.pm7u-navbtn', '.pm7u-poprow',"
        out.append((old, old[:-1] + ', ' + ', '.join(f"'{s}'" for s in names['cursor']) + ',', 'nier cursor list'))
    if names.get('chosen'):
        old = '.orch-tab, .pm7u-navbtn, .domain-link'
        out.append((old, '.orch-tab, .pm7u-navbtn, ' + ', '.join(names['chosen']) + ', .domain-link', 'nier chosen list'))
    if names.get('strip'):
        old = ".pm6-tt-mode, .pm7u-range button';"
        out.append((old, '.pm6-tt-mode, .pm7u-range button, ' + ', '.join(names['strip']) + "';", 'nier strip list'))
    if names.get('titles'):
        old = "usage: '#pm7uRoomTitle, .pm7u-brand h1',"
        out.append((old, "usage: '" + ', '.join(names['titles']) + "',", 'nier page titles'))
    if names.get('confirm'):
        old = """.o55-btn-primary, [data-o55-preview="keep"]';"""
        out.append((old, """.o55-btn-primary, [data-o55-preview="keep"], """ + ', '.join(names['confirm']) + "';", 'nier confirm sound list'))
    if names.get('cancel'):
        old = """[data-o55-preview="back"], [data-o55-nier-note="close"]';"""
        out.append((old, """[data-o55-preview="back"], [data-o55-nier-note="close"], """ + ', '.join(names['cancel']) + "';", 'nier cancel sound list'))
    return out


NIER_SELECTOR_PATCHES = nier_selector_patches()

# ---------------------------------------------------------------------------------------------------------------------
# CSS rule filter (ported from understand/tools/strip_probe.py, proven 2026-10-01)

USAGE = re.compile(r'pm7u-|pm7u[A-Z]|pm6-usage|pm7UsageApp')
CTX = re.compile(r'pm7ctx|context-usage|context-hover-module')
GROUP = re.compile(r':(?:is|where|not|has)\(')


def split_top(sel: str) -> list[str]:
    """Split a selector list on its top-level commas."""
    out, depth, cur = [], 0, ''
    for ch in sel:
        if ch in '([':
            depth += 1
        elif ch in ')]':
            depth -= 1
        if ch == ',' and depth == 0:
            out.append(cur)
            cur = ''
        else:
            cur += ch
    out.append(cur)
    return out


def part_is_usage(part: str) -> bool:
    """A selector is Usage-only if it names a Usage class outside any :is()/:where() group, or inside a group whose
    every alternative is Usage. `[data-theme=retro-light] :is(.ok,.pm7u-x .ok)` is not Usage (it styles .ok)."""
    s = part
    while True:
        m = GROUP.search(s)
        if not m:
            break
        i, depth = m.end(), 1
        while i < len(s) and depth:
            depth += {'(': 1, ')': -1}.get(s[i], 0)
            i += 1
        alts = split_top(s[m.end():i - 1])
        all_usage = all(USAGE.search(a) for a in alts)
        s = s[:m.start()] + (' pm7u-GROUP ' if all_usage and not m.group().startswith(':not') else ' ') + s[i:]
    return bool(USAGE.search(s))


def blank_comments(css: str) -> str:
    return re.sub(r'/\*[\s\S]*?\*/', lambda m: re.sub(r'[^\n]', ' ', m.group()), css)


def stats0() -> dict:
    return {'kept_rules': 0, 'rewritten_rules': 0, 'dropped_rules': 0, 'dropped_keyframes': 0, 'dropped_at': 0}


def filter_css(css: str, stats: dict, keep_ctx_only: bool = False) -> str:
    """Drop Usage-only rules and the Usage parts of mixed selector lists, drop @keyframes pm7u-*, recurse into
    @media/@supports/@container/@layer. keep_ctx_only additionally drops every rule with no context-module part (to
    extract the chat context rules from the T21 stylesheet). A rule's leading whitespace and comments go with it."""
    nc = blank_comments(css)
    out, i, n, last = [], 0, len(css), 0
    while i < n:
        j = nc.find('{', i)
        if j < 0:
            break
        k, depth = j + 1, 1
        while k < n and depth:
            depth += {'{': 1, '}': -1}.get(nc[k], 0)
            k += 1
        sel_raw = css[i:j]
        sel = nc[i:j].strip()
        body = css[j + 1:k - 1]
        lead = sel_raw[:len(sel_raw) - len(sel_raw.lstrip())]
        if sel.startswith(('@media', '@supports', '@container', '@layer')):
            inner = filter_css(body, stats, keep_ctx_only)
            if inner.strip():
                out.append(css[i:j + 1] + inner + '}')
            else:
                stats['dropped_at'] += 1
        elif sel.startswith('@keyframes'):
            name = sel[len('@keyframes'):].strip()
            if name.startswith('pm7u-') or (keep_ctx_only and not CTX.search(name)):
                stats['dropped_keyframes'] += 1
            else:
                out.append(css[i:k])
        elif sel.startswith('@'):
            out.append(css[i:k])
        else:
            parts = split_top(sel)
            keep = [p for p in parts if not part_is_usage(p)]
            if keep_ctx_only:
                keep = [p for p in keep if CTX.search(p)]
            if not keep:
                stats['dropped_rules'] += 1
            elif len(keep) == len(parts):
                stats['kept_rules'] += 1
                out.append(css[i:k])
            else:
                stats['rewritten_rules'] += 1
                out.append(lead + ',\n'.join(p.strip() for p in keep) + '{' + body + '}')
        i = last = k
    out.append(css[last:] if css[last:].strip() == '' else '')
    return ''.join(out)


# ---------------------------------------------------------------------------------------------------------------------
# guarded helpers (the same contracts as opus-5.5 build.py's, raising through the caller's need())

def _count_once(need, text: str, needle: str, where: str) -> int:
    count = text.count(needle)
    need(count == 1, f'usage layer: {needle[:80]!r} found {count} times in {where} (need exactly 1)')
    return text.index(needle)


def replace_once(need, text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    need(count == 1, f'usage layer patch "{label}": anchor found {count} times (need exactly 1)')
    return text.replace(old, new, 1)


def remove_block(need, text: str, tag: str, element_id: str) -> str:
    rx = re.compile(r'<' + tag + r'\b[^>]*\bid="' + re.escape(element_id) + r'"[^>]*>[\s\S]*?</' + tag + r'>\n?')
    need(len(rx.findall(text)) == 1, f'usage layer: expected exactly one <{tag} id="{element_id}">')
    return rx.sub('', text, count=1)


def style_body(need, text: str, sid: str, where: str) -> re.Match:
    found = list(re.finditer(r'<style id="' + re.escape(sid) + r'">([\s\S]*?)</style>', text))
    need(len(found) == 1, f'usage layer: <style id="{sid}"> found {len(found)} times in {where} (need exactly 1)')
    return found[0]


def expect(need, label: str, stats: dict) -> None:
    want = EXPECT[label]
    got = {k: stats[k] for k in want}
    need(got == want, f'usage layer: {label} rule census changed upstream: got {got}, expected {want}; '
                      'review the filter (tools/usage_layer.py EXPECT) before re-pinning')


def read_parts(folder: Path, suffix: str) -> str:
    files = sorted(p for p in folder.rglob(f'*{suffix}') if p.is_file())
    return '\n'.join(f'/* ---- {p.relative_to(SRC).as_posix()} ---- */\n{p.read_text(encoding="utf-8").rstrip()}\n'
                     for p in files)


def copy_parts() -> tuple[dict, list[str]]:
    """src/copy.json merged with every src/copy.d/*.json (sorted). Each file owns its top-level keys; a key that two
    files define is a problem (the build fails on it), so the three builders never write the same copy file."""
    merged: dict = {}
    owner: dict = {}
    problems: list[str] = []
    files = [SRC / 'copy.json'] + sorted((SRC / 'copy.d').glob('*.json'))
    for path in files:
        if not path.exists():
            continue
        rel = path.relative_to(SRC).as_posix()
        try:
            part = json.loads(path.read_text(encoding='utf-8'))
        except json.JSONDecodeError as exc:
            problems.append(f'usage {rel} is not valid JSON: {exc}')
            continue
        if not isinstance(part, dict):
            problems.append(f'usage {rel} must hold a JSON object')
            continue
        for key, value in part.items():
            if key in merged:
                problems.append(f'usage copy key {key!r} is defined in both {owner[key]} and {rel}')
                continue
            merged[key] = value
            owner[key] = rel
    return merged, problems


def copy_json() -> dict:
    return copy_parts()[0]


def roster_json() -> dict:
    """src/roster.json: the review roster (ARCHITECTURE.md section 7). Absent means no roster."""
    path = SRC / 'roster.json'
    return json.loads(path.read_text(encoding='utf-8')) if path.exists() else {}


CTX_SHIM_HEAD = r"""/* ---- pm7ctx: the Assistant chat context module (window.PM7_CONTEXT) ---- */
(function () {
  'use strict';
  /* The block between the >>> and <<< lines is the chat context module, extracted at build time from the Prism Usage
     script it used to live in (pinned by sha256 in tools/usage_layer.py). This shim gives it the helpers it used from
     that script and routes its Usage-side effects to the new page: commands, receipts and events go through
     window.PM7_USAGE, a compaction writes PM7_USAGE.data.context and re-renders the Context room, and toasts go to the
     app's own window.toast. */
  var $ = function (selector, root) { return (root || document).querySelector(selector); };
  var $$ = function (selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); };
  function usage() { return window.PM7_USAGE || null; }
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }
  function tok(value) {
    if (value >= 1000000) return (value / 1000000).toFixed(value >= 10000000 ? 1 : 2).replace(/\.0$/, '') + 'M';
    if (value >= 1000) return (value / 1000).toFixed(value >= 100000 ? 0 : 1).replace(/\.0$/, '') + 'k';
    return String(value);
  }
  var fallbackSequence = 0;
  function command(commandId, payload, result, options) {
    var u = usage();
    if (u && typeof u.command === 'function') return u.command(commandId, payload, result, options);
    var deferred = !!(options && options.defer_receipt === true);
    return { receipt_id: 'usage-context-receipt-' + (++fallbackSequence), command_id: commandId, status: deferred ? 'pending' : 'accepted',
      result: result || {}, completed_at: deferred ? null : new Date().toISOString() };
  }
  function completeCommandReceipt(receipt, result, status) {
    var u = usage();
    if (u && typeof u.completeCommandReceipt === 'function') return u.completeCommandReceipt(receipt, result, status);
    if (receipt && receipt.status === 'pending') {
      receipt.result = Object.assign({}, receipt.result || {}, result || {});
      receipt.status = status || 'accepted'; receipt.completed_at = new Date().toISOString();
    }
    return receipt;
  }
  function usageEvent(eventType, payload) { var u = usage(); return u && typeof u.usageEvent === 'function' ? u.usageEvent(eventType, payload) : null; }
  function toast(text) { if (typeof window.toast === 'function') window.toast(text); }
  var state = { get room() { var u = usage(); return u && u.state ? u.state.room : null; } };
  function render() { var u = usage(); if (u && typeof u.rerender === 'function') u.rerender(); }
  /* >>> extracted context module */
"""
CTX_SHIM_TAIL = """  /* <<< extracted context module */
  enhanceContext(document);
})();
"""


def build_script(ctx_js: str) -> str:
    """The body of <script id="pm-usage-js">: the copy, the page (src/js in one strict wrapper, so the files share one
    scope; a boot failure is reported and cannot take the chat context module down with it), then the context module."""
    merged, problems = copy_parts()
    if problems:
        raise ValueError('; '.join(problems))
    copy = json.dumps(merged, ensure_ascii=False, separators=(',', ':'))
    roster = roster_json()
    facts = {k: roster[k] for k in ('version', 'seed', 'facts', 'switch_log', 'live') if k in roster}
    roster_js = json.dumps(facts, ensure_ascii=False, separators=(',', ':'))
    js = read_parts(SRC / 'js', '.js')
    return (f'window.PM_USAGE_COPY={copy};\n'
            f'window.PM_USAGE_ROSTER={roster_js};\n'
            'try {\n(function () {\n\'use strict\';\n' + js + '})();\n'
            "} catch (error) { try { console.error('[pm-usage] boot failed', error); } catch (_) {} }\n"
            + CTX_SHIM_HEAD + ctx_js + CTX_SHIM_TAIL)


def apply(text: str, need) -> tuple[str, dict]:
    notes: dict = {'bytes_in': len(text.encode('utf-8'))}

    # 1. the band
    a = _count_once(need, text, OPEN_TAG, 'the page')
    _count_once(need, text, CLOSE_TAG, 'the page')
    z = text.index(CLOSE_TAG) + len(CLOSE_TAG)
    need(a < z, 'usage layer: #panel-usage close tag precedes its open tag')
    band = text[a:z]
    for marker in BAND_ONLY:
        _count_once(need, text, marker, 'the page')
        _count_once(need, band, marker, '#panel-usage')
    for marker in (BODY_START, BODY_END):
        need(marker not in text, f'usage layer: {marker} already in the input (layer applied twice?)')

    # 2. what the rest of the concept needs from the band's stylesheets
    t21 = list(re.finditer(re.escape(T21_ANCHOR) + r'[^\n]*-->\n\s*<style>([\s\S]*?)</style>', band))
    need(len(t21) == 1, f'usage layer: T21 stylesheet after its section comment found {len(t21)} times')
    st = stats0()
    ctx_css = filter_css(t21[0].group(1), st, keep_ctx_only=True)
    expect(need, 't21 context rules', st)
    notes['t21 context rules'] = st
    kept_styles = []
    for sid in ('pm7-t29-usage-final', 'pm7-t32-final'):
        m = style_body(need, band, sid, '#panel-usage')
        st = stats0()
        css = filter_css(m.group(1), st)
        expect(need, sid, st)
        notes[sid] = st
        kept_styles.append(f'<style id="{sid}">{css}</style>')

    # 3. the chat context module
    js_a = band.index(CTX_JS_START)
    js_z = band.index('\n', band.index(CTX_JS_END)) + 1
    ctx_js = band[js_a:js_z]
    sha = hashlib.sha256(ctx_js.encode('utf-8')).hexdigest()
    need(sha == CTX_JS_SHA256, f'usage layer: the chat context module changed upstream (sha256 {sha}); review the '
                               'change and the shim in tools/usage_layer.py, then re-pin CTX_JS_SHA256')
    for old, new, label in CTX_JS_EDITS:
        ctx_js = replace_once(need, ctx_js, old, new, label)
    notes['context module'] = {'bytes': len(band[js_a:js_z].encode('utf-8')), 'sha256': sha[:16], 'edits': len(CTX_JS_EDITS)}

    # 4. the new band
    _, copy_problems = copy_parts()
    need(not copy_problems, 'usage layer: ' + '; '.join(copy_problems))
    css = read_parts(SRC / 'css', '.css')
    markup = (SRC / 'markup.html').read_text(encoding='utf-8')
    script = build_script(ctx_js)
    for name, chunk in (('src/css', css), ('src/markup.html', markup), ('src/js + copy.json', script)):
        for marker in (BODY_START, BODY_END, '<!-- O55:CSS:START -->', '<!-- O55:CSS:END -->',
                       '<!-- O55:BODY:START -->', '<!-- O55:BODY:END -->'):
            need(marker not in chunk, f'usage layer: {name} contains the build marker {marker}')
    need(not re.search(r'</style', css, re.I), 'usage layer: src/css contains "</style"')
    need(not re.search(r'</script', script, re.I), 'usage layer: src/js or copy.json contains "</script"')
    new_band = (OPEN_TAG + '\n' + BODY_START + '\n'
                + f'<style id="pm-usage-ctx-css">{ctx_css}</style>\n'
                + '\n'.join(kept_styles) + '\n'
                + f'<style id="pm-usage-css">\n{css}</style>\n'
                + markup.strip() + '\n'
                + f'<script id="pm-usage-js">\n{script}</script>\n'
                + BODY_END + '\n' + CLOSE_TAG)
    text = text[:a] + new_band + text[z:]
    notes['band'] = {'old_bytes': len(band.encode('utf-8')), 'new_bytes': len(new_band.encode('utf-8')),
                     'usage_css_bytes': len(css.encode('utf-8')), 'usage_js_bytes': len(script.encode('utf-8'))}

    # 5. outside the band
    for sid in DROP_WHOLE:
        text = remove_block(need, text, 'style', sid)
    m = style_body(need, text, 'pm7-t23-adjustments', 'the page')
    st = stats0()
    css = filter_css(m.group(1), st)
    expect(need, 'pm7-t23-adjustments', st)
    notes['pm7-t23-adjustments'] = st
    text = text[:m.start(1)] + css + text[m.end(1):]
    notes['dropped whole'] = DROP_WHOLE + ['pm7-t31-usage-final (with the band)']

    # 6. the review roster in the Settings fixture, then NieR Mode selector lists
    text = roster_patch(need, text, notes)
    for old, new, label in NIER_SELECTOR_PATCHES:
        text = replace_once(need, text, old, new, label)
    notes['nier selector patches'] = [label for _, _, label in NIER_SELECTOR_PATCHES]

    # 7. app patches for performance that act only while Usage is the active page (DECISIONS, coordinator defaults item 7;
    #    listed with numbers in design/final/PERF-3.md "App patches (round 3)")
    for old, new, label in APP_PATCHES:
        text = patch_once(need, text, old, new, label)
    notes['app patches'] = [label for _, _, label in APP_PATCHES]
    notes['bytes_out'] = len(text.encode('utf-8'))
    return text, notes


# ---------------------------------------------------------------------------------------------------------------------
# app patches (WOW round 3, engine): each anchors on text no other patch uses, acts only while Usage is the active page
# (body.pmu-page-active, set by 90-api.js; html[data-pmu-moment] while a Usage arrival or room change runs), and is
# idempotent (patch_once leaves text that already carries the patch unchanged).

def patch_once(need, text: str, old: str, new: str, label: str) -> str:
    if new in text and old not in text:
        return text
    return replace_once(need, text, old, new, 'app patch ' + label)


APP_PATCHES = [
    # A1: the app's scrollbar reveal wrote --pm6-sb-ink on EVERY hovered element; Chrome then restyled the hovered element's
    # whole subtree on each hover change (pointer entering the Usage board: 1,595 elements, 51-96 ms in one frame on the
    # CPU-only VM). While Usage shows, the hover half stands down; scroll panes still reveal their bar while scrolling
    # (.pm6-sb-active). Every other page keeps the hover reveal.
    ('    :is(.pm6-sb-active, :hover) { --pm6-sb-ink: var(--pm6-sb-thumb); }\n',
     '    .pm6-sb-active, body:not(.pmu-page-active) :hover { --pm6-sb-ink: var(--pm6-sb-thumb); } /* usage layer A1: no hover reveal while Usage shows */\n',
     'A1 scrollbar hover reveal'),
    # A3: the PM8 pointer field reads the rect of every PM8_SEL box and writes inherited custom properties per frame; during
    # a Usage arrival or room change (html[data-pmu-moment]) it rests like it does for a resizer drag and restarts on the
    # next pointer event.
    ('      if (document.body.classList.contains(\'pm-resizing\')) {\n        baseDirty = true;\n        requestAnimationFrame(tick);\n        return;\n      }\n',
     '      if (document.documentElement.hasAttribute(\'data-pmu-moment\')) { baseDirty = true; running = false; return; } /* usage layer A3 */\n'
     '      if (document.body.classList.contains(\'pm-resizing\')) {\n        baseDirty = true;\n        requestAnimationFrame(tick);\n        return;\n      }\n',
     'A3 pointer field rests during a Usage moment'),
    # A6: the NieR scan sweep crosses the window every 12 s on every page (45-104 compositor draws in 3 s of idle); while
    # Usage shows it waits (Usage's own live beats are the only idle motion there).
    ('    sweepTimer = 0; if (!sweep) return;\n    if (!document.hidden && !still() && !onboarding()) {\n',
     '    sweepTimer = 0; if (!sweep) return;\n    if (!document.hidden && !still() && !onboarding() && !document.body.classList.contains(\'pmu-page-active\')) { /* usage layer A6 */\n',
     'A6 NieR sweep waits while Usage shows'),
    # A7 (integrator, round 3): Usage's rail uses the app's liquid ink; its spring read two rects every frame of its travel,
    # and during a Usage room change each read forced the style and layout of the room being built (VM profile of the Costs
    # room change: 6-13 ms of forced style per ink frame, 140 elements). While a Usage moment runs (html[data-pmu-moment])
    # the ink of a strip inside #panel-usage reuses its first measure of the target (the rail does not move during the
    # 250 ms travel); every other ink and every other time measures as before.
    ('      function metrics(el) {\n        /* getBoundingClientRect so nested Usage',
     '      function metrics(el) { /* usage layer A7: the Usage rail ink measures once per target during a Usage moment */\n'
     '        var pmuM = strip._pmuM, pmuC = !!(strip.closest && strip.closest(\'#panel-usage\')) && document.documentElement.hasAttribute(\'data-pmu-moment\');\n'
     '        if (pmuC && pmuM && pmuM.el === el && performance.now() - pmuM.t < 1200) return pmuM.v;\n'
     '        var pmuV = metrics0(el); if (pmuC) strip._pmuM = { el: el, t: performance.now(), v: pmuV }; return pmuV;\n'
     '      }\n'
     '      function metrics0(el) {\n        /* getBoundingClientRect so nested Usage',
     'A7 Usage rail ink measures once per target during a Usage moment'),
    # A8 (integrator, 2026-10-10; panels cross-look review): the demo's usage alerts reached the title-bar notices with
    # internal ids ('Usage threshold crossed — q-claude-5h at 80%', 'suggested: switch effective account',
    # 'rate_limit_pressure'). The three notice texts now say it in user words with the window's own label; the events,
    # their ids and the receipts behind them are unchanged. Acts on every page (these notices are not tied to Usage showing).
    ("      if (a.kind === 'threshold') addNote('Usage threshold crossed — ' + (a.quota || 'quota') + ' at ' + (a.pct || 80) + '%.', 'Usage · suggested: switch effective account', 'usage', null, true);\n",
     "      if (a.kind === 'threshold') addNote((function (id) { var u = window.PM_DEMO && window.PM_DEMO.state && window.PM_DEMO.state.usage, q = ((u && u.quotas) || []).filter(function (x) { return x.id === id; })[0]; return ((q && q.label) || 'A usage window').replace(/\\b5h\\b/, '5-hour').replace(/\\b7d\\b/, 'weekly'); })(a.quota) + ' is at ' + Math.round(a.pct || 80) + '% used.', 'Usage · another signed-in account can take the work', 'usage', null, true); /* usage layer A8: user words */\n",
     'A8 usage alert notices in user words (threshold)'),
    ("      else if (a.kind === 'account_switch') addNote('Effective account switched — reason: rate_limit_pressure.', 'Usage · requested account unchanged', 'usage', null, true);\n",
     "      else if (a.kind === 'account_switch') addNote('Work moved to another account because of rate limits.', 'Usage · the account you chose stays your choice', 'usage', null, true); /* usage layer A8 */\n",
     'A8 usage alert notices in user words (account switch)'),
    ("      if (!silent) say('Effective account switched (rate_limit_pressure) — requested account unchanged');\n",
     "      if (!silent) say('Work moved to another account because of rate limits'); /* usage layer A8 */\n",
     'A8 usage alert notices in user words (switch toast)'),
]


# ---------------------------------------------------------------------------------------------------------------------
# the review roster in the shared Settings fixture (ARCHITECTURE.md section 7)

ROSTER_FIXTURE_ANCHOR = '  const providers = '
ROSTER_SEED_ANCHOR = 'fixture.forEach(fx => { if (!have.has(fx.id)) state.providers.push(clone(fx)); });'
ROSTER_SEED_FLAG = 'usage-review-2026-10-02c'
ROSTER_SEED_JS = (
    " { const s51 = PM51.s(); if (s51 && s51.usageReviewSeed !== '" + ROSTER_SEED_FLAG + "') {"
    " fixture.forEach(fx => { const p = state.providers.find(x => x.id === fx.id); if (!p) return;"
    " (fx.accounts || []).forEach(a => { const x = (p.accounts || []).find(y => y && y.id === a.id); if (x && a.usage) x.usage = clone(a.usage); });"
    " const add = (fx.accounts || []).filter(a => a && a.seed === 'usage-review'); if (!add.length) return;"
    " if (!Array.isArray(p.accounts)) p.accounts = [];"
    " add.forEach(a => { if (!p.accounts.some(x => x.id === a.id)) p.accounts.push(clone(a)); });"
    " ['installed', 'signedIn', 'status'].forEach(k => { if (fx[k] !== undefined) p[k] = fx[k]; });"
    " p.readiness = Object.assign({}, p.readiness || {}, { installed: !!fx.installed, signedIn: !!fx.signedIn });"
    " const ord = (fx.routing && Array.isArray(fx.routing.accountOrder)) ? fx.routing.accountOrder : [];"
    " if (ord.length) p.routing = Object.assign({}, p.routing || {}, { accountOrder: ord.slice() }); });"
    " s51.usageReviewSeed = '" + ROSTER_SEED_FLAG + "'; } } /* usage review roster seed (tools/usage_layer.py) */"
)


def _reset_text(fact: dict) -> str | None:
    """The Settings reset words for one Usage window fact, so both pages read the same reset (one fixture: roster.json
    facts). Relative resets are minutes from page load, the same clock the Usage page reads."""
    if fact.get('truth') == 'unknown':
        return None
    if fact.get('reset_rule') == 'next_month':
        return 'Resets on the 1st'
    m = fact.get('reset_in_min')
    if not isinstance(m, (int, float)):
        return None
    m = int(round(m))
    d, h, mm = m // 1440, (m % 1440) // 60, m % 60
    return f'Resets in {d}d {h}h' if d else f'Resets in {h}h {mm}m' if h else f'Resets in {mm}m'


def align_usage(data: list, facts: dict) -> list[str]:
    """Write each Settings account's usage windows (pct and reset words) from the roster facts (REVIEW-data must-fix 3:
    Settings said "Resets at 4:00 PM" and "Resets Oct 1" where Usage said 06:33 and Nov 1). Only the usage block of an
    account changes; windows the facts mark not exposed or unknown keep what Settings had."""
    changed = []
    for p in data:
        for acc in p.get('accounts', []) or []:
            f = facts.get(f"{p.get('id')}/{acc.get('id')}")
            if not f or not isinstance(f.get('windows'), dict):
                continue
            usage = acc.setdefault('usage', {})
            wins = usage.setdefault('windows', {})
            for key, fact in f['windows'].items():
                if not isinstance(fact.get('pct'), (int, float)):
                    continue
                want = {'pct': fact['pct']}
                words = _reset_text(fact)
                if words:
                    want['reset'] = words
                if wins.get(key) != want:
                    changed.append(f"{p.get('id')}/{acc.get('id')}/{key}: {wins.get(key)} -> {want}")
                    wins[key] = want
    return changed


def roster_patch(need, text: str, notes: dict) -> str:
    """Merge roster.json 'settings' into the Settings providers fixture and seed saved Settings states once. Guarded:
    the fixture must be the one json.dumps(indent=2) array after the anchor, with the 22 providers in order; every
    roster provider must exist, every added account id must be new, and every original account must survive unchanged."""
    roster = roster_json()
    patch = roster.get('settings') or {}
    if not patch:
        notes['roster'] = 'no settings block; skipped'
        return text
    seed = roster.get('seed') or 'usage-review'
    m = list(re.finditer(r'<script id="pm4-settings-js">', text))
    need(len(m) == 1, f'usage layer roster: <script id="pm4-settings-js"> found {len(m)} times')
    s_start = m[0].end()
    s_end = text.index('</script>', s_start)
    script = text[s_start:s_end]
    anchor = ROSTER_FIXTURE_ANCHOR + '[\n'
    need(script.count(anchor) == 1, f'usage layer roster: {anchor!r} found {script.count(anchor)} times in pm4-settings-js')
    a = script.index(anchor) + len(ROSTER_FIXTURE_ANCHOR)
    data, length = json.JSONDecoder().raw_decode(script[a:])
    original = script[a:a + length]
    need(original == json.dumps(data, indent=2, ensure_ascii=False),
         'usage layer roster: the providers fixture is not the json.dumps(indent=2) text it was (review the patch)')
    need(isinstance(data, list) and len(data) == 22, f'usage layer roster: expected 22 providers, got {len(data) if isinstance(data, list) else type(data)}')
    ids = [p.get('id') for p in data]
    strip = lambda accs: [{k: v for k, v in a.items() if k != 'usage'} for a in accs]
    before = {p['id']: json.dumps(strip(p.get('accounts', [])), sort_keys=True) for p in data}
    added = 0
    for pid, block in patch.items():
        need(pid in ids, f'usage layer roster: provider {pid!r} is not in the Settings fixture')
        prov = data[ids.index(pid)]
        accounts = prov.setdefault('accounts', [])
        have = {acc.get('id') for acc in accounts}
        for acc in block.get('accounts', []):
            need(acc.get('id') and acc['id'] not in have, f'usage layer roster: account {pid}/{acc.get("id")} exists already or has no id')
            item = dict(acc)
            item['seed'] = seed
            accounts.append(item)
            have.add(acc['id'])
            added += 1
        flags = block.get('provider') or {}
        for key, value in flags.items():
            need(key in ('installed', 'signedIn', 'status'), f'usage layer roster: provider flag {key!r} is not allowed')
            prov[key] = value
        if flags:
            prov['readiness'] = dict(prov.get('readiness') or {}, installed=bool(prov.get('installed')),
                                     signedIn=bool(prov.get('signedIn')), accountChosen=True)
        order = block.get('accountOrder')
        if order:
            need(sorted(order) == sorted(have), f'usage layer roster: accountOrder for {pid} must list exactly its accounts')
            routing = prov.setdefault('routing', {})
            routing['accountOrder'] = list(order)
            if not prov.get('defaultAccount'):
                prov['defaultAccount'] = order[0]
    aligned = align_usage(data, roster.get('facts') or {})
    for p in data:
        kept = [acc for acc in p.get('accounts', []) if acc.get('seed') != seed]
        need(json.dumps(strip(kept), sort_keys=True) == before[p['id']], f'usage layer roster: an original account of {p["id"]} changed (beyond its usage windows)')
    script = script[:a] + json.dumps(data, indent=2, ensure_ascii=False) + script[a + length:]
    need(script.count(ROSTER_SEED_ANCHOR) == 1, f'usage layer roster: seed anchor found {script.count(ROSTER_SEED_ANCHOR)} times')
    script = script.replace(ROSTER_SEED_ANCHOR, ROSTER_SEED_ANCHOR + ROSTER_SEED_JS, 1)
    notes['roster'] = {'providers': len(patch), 'accounts_added': added, 'seed_flag': ROSTER_SEED_FLAG, 'usage_windows_aligned': len(aligned)}
    return text[:s_start] + script + text[s_end:]


# ---------------------------------------------------------------------------------------------------------------------
# lint and syntax check

def _opus_build():
    """opus-5.5 build.py, for its emoji and banned-copy patterns. Reuses the running module when build.py itself calls
    lint() (Proposal B), imports it otherwise."""
    main = sys.modules.get('__main__')
    if main is not None and hasattr(main, 'BANNED_COPY') and hasattr(main, 'EMOJI') and hasattr(main, 'build_text'):
        return main
    if str(OPUS_TOOLS) not in sys.path:
        sys.path.insert(0, str(OPUS_TOOLS))
    import build  # noqa: E402
    return build


TOP_FUNCTION = re.compile(r'^(?:async\s+)?function\s*\*?\s*([A-Za-z_$][\w$]*)\s*\(')
TOP_BINDING = re.compile(r'^(?:var|let|const)\s+([A-Za-z_$][\w$]*)')
PILL_CSS = re.compile(r'\.(-?[A-Za-z_][\w-]*)')
PILL_MARKUP = [
    re.compile(r'\bclass(?:Name)?\s*=\s*\\?["\'`]([^"\'`\\]*)'),
    re.compile(r'classList\.(?:add|remove|toggle|contains|replace)\(([^)]*)\)'),
    re.compile(r'["\'`]([^"\'`]*\.[\w-]*pill[\w-]*[^"\'`]*)["\'`]', re.I),
]


def lint() -> list[str]:
    build = _opus_build()
    problems = []
    tops: dict[str, list[str]] = {}
    for p in sorted(SRC.rglob('*')):
        if not p.is_file():
            continue
        rel = p.relative_to(PKG).as_posix()
        text = p.read_text(encoding='utf-8')
        if build.EMOJI.search(text):
            problems.append(f'emoji glyph in {rel}')
        if p.suffix == '.css':
            code = blank_comments(text)
            if ':has(' in code:
                problems.append(f':has() in usage CSS {rel} (Usage styles use no :has() at all)')
            for m in re.finditer(r'border-(?:left|inline-start)\s*:\s*([^;}]+)', code):
                width = re.search(r'(\d+(?:\.\d+)?)px', m.group(1))
                if width and float(width.group(1)) >= 2:
                    problems.append(f'left accent border in {rel}: {m.group(0).strip()}')
            for m in re.finditer(r'border-(?:left|inline-start)-width\s*:\s*([^;}]+)', code):
                width = re.search(r'(\d+(?:\.\d+)?)px', m.group(1))
                if width and float(width.group(1)) >= 2:
                    problems.append(f'left accent border in {rel}: {m.group(0).strip()}')
            for sel in re.findall(r'([^{}]+)\{', code):
                for cls in PILL_CSS.findall(sel):
                    if 'pill' in cls.lower():
                        problems.append(f'pill class name in {rel}: .{cls}')
            # the build's page-wide universal lint (opus-5.5 build.py, 29a9ee2595): a selector that starts at
            # html/:root/body with a state and ends in a bare `*` restyles the whole page on each change of that state
            problems.extend(build.lint_page_wide_universal('Concepts/usage-redesign/' + rel, text))
        if p.suffix in ('.html', '.js'):
            code = re.sub(r'/\*[\s\S]*?\*/', ' ', text) if p.suffix == '.js' else re.sub(r'<!--[\s\S]*?-->', ' ', text)
            for rx in PILL_MARKUP:
                for m in rx.finditer(code):
                    if re.search(r'[\w-]*pill[\w-]*', m.group(1), re.I):
                        problems.append(f'pill class name in {rel}: {m.group(0)[:80]}')
        if p.suffix == '.js' and p.parent == SRC / 'js':
            code = re.sub(r'/\*[\s\S]*?\*/', lambda m: re.sub(r'[^\n]', ' ', m.group()), text)
            for n, line in enumerate(code.split('\n'), 1):
                m = TOP_FUNCTION.match(line) or TOP_BINDING.match(line)
                if m:
                    tops.setdefault(m.group(1), []).append(f'{p.name}:{n}')
            if p.name.endswith('-data.js'):
                stripped = re.sub(r"'(?:[^'\\\n]|\\.)*'|\"(?:[^\"\\\n]|\\.)*\"", "''", code)
                for m in re.finditer(r'\b(window|document)\s*[.\[]', stripped):
                    problems.append(f'{rel} reads {m.group(1)} (fixture files are data only)')
    for name, where in sorted(tops.items()):
        if len(where) > 1:
            problems.append(f'top-level name {name!r} declared more than once across src/js: {", ".join(where)}')

    def walk(node, path):
        if isinstance(node, dict):
            for k, v in node.items():
                walk(v, f'{path}.{k}')
        elif isinstance(node, list):
            for i, v in enumerate(node):
                walk(v, f'{path}[{i}]')
        elif isinstance(node, str):
            if build.BANNED_COPY.search(node) and not path.split('.')[-1].startswith('detail'):
                problems.append(f'banned word in usage copy.json{path}: {node[:80]}')
            if build.EMOJI.search(node):
                problems.append(f'emoji glyph in usage copy.json{path}')
    merged, copy_problems = copy_parts()
    problems.extend(copy_problems)
    walk(merged, '')
    try:
        roster_json()
    except json.JSONDecodeError as exc:
        problems.append(f'usage roster.json is not valid JSON: {exc}')
    for need_file in ('markup.html', 'copy.json'):
        if not (SRC / need_file).is_file():
            problems.append(f'usage src/{need_file} is missing')
    return problems


def syntax_check(built: str) -> list[str]:
    """node --check the inner text of <script id="pm-usage-js">."""
    found = re.findall(r'<script\b[^>]*\bid="pm-usage-js"[^>]*>(.*?)</script>', built, re.S)
    if len(found) != 1:
        return [f'script pm-usage-js found {len(found)} times (need exactly 1)']
    with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as fh:
        fh.write(found[0])
        path = fh.name
    try:
        r = subprocess.run(['node', '--check', path], capture_output=True, text=True)
    finally:
        Path(path).unlink(missing_ok=True)
    if r.returncode:
        return ['syntax error in pm-usage-js: ' + ' | '.join(r.stderr.strip().splitlines()[-4:])[:600]]
    return []
