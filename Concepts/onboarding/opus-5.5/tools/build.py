#!/usr/bin/env python3
"""Build Concepts/TestOpus5.5PmConcept.html from the pinned TestPMConcept.html plus ./src (onboarding, tour, Settings).

Usage:
  python3 Concepts/onboarding/opus-5.5/tools/build.py          # build TestOpus only
  python3 Concepts/onboarding/opus-5.5/tools/build.py --publish-pm7  # build, then publish the exact bytes as Concepts/PMConcept7.html
  python3 Concepts/onboarding/opus-5.5/tools/build.py --check  # verify the built file is current, every guard holds, and PMConcept7.html is byte-identical

The base file is read-only. The legacy Product Onboarding and Guided Tour blocks are removed, the O55 modules are
spliced between <!-- O55:*:START/END --> markers, and a short list of guarded, exactly-once patches re-point the shell's
few remaining references (hover-tag overlay ids, labels, Doctor quiet actions, Teacher persona, owner exposures).
Concepts/PMConcept7.html is published only from here (2026-09-26 user direction): --publish-pm7 writes the same built
bytes to both outputs, and --check fails while PMConcept7.html is missing or differs by even one byte.
"""
from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path

import settings_layer

TOOLS = Path(__file__).resolve().parent
PKG = TOOLS.parent
CONCEPTS = PKG.parents[1]
SOURCE = CONCEPTS / 'TestPMConcept.html'
TARGET = CONCEPTS / 'TestOpus5.5PmConcept.html'
PM7_TARGET = CONCEPTS / 'PMConcept7.html'
SRC = PKG / 'src'
BASE_SHA256 = 'b3888fad4993f484ab4548e9ff212ec0042fa0a912947a7f316514db939326be'

EMOJI = re.compile('[\U0001F000-\U0001FAFF☀-➿⬀-⯿️]')
BANNED_COPY = re.compile(r'\b(repository|repositories|forge|runtime|adapter|endpoint|execution host|credential profile|'
                         r'unleash|supercharge|ai magic|shell)\b', re.I)


class BuildError(RuntimeError):
    pass


def need(cond: bool, message: str) -> None:
    if not cond:
        raise BuildError(message)


def remove_block(text: str, tag: str, element_id: str) -> str:
    """Remove <tag id=element_id>...</tag> exactly once (style/script: no nesting)."""
    rx = re.compile(r'<' + tag + r'\b[^>]*\bid="' + re.escape(element_id) + r'"[^>]*>[\s\S]*?</' + tag + r'>\n?')
    text, n = rx.subn('', text, count=1)
    need(n == 1, f'expected exactly one <{tag} id="{element_id}">')
    return text


def remove_element(text: str, element_id: str) -> str:
    """Remove a balanced element by id (handles nesting of the same tag)."""
    m = re.search(r'<(?P<tag>[\w-]+)\b[^>]*\bid="' + re.escape(element_id) + r'"[^>]*>', text)
    need(m is not None, f'missing element #{element_id}')
    tag, depth = m.group('tag'), 1
    for item in re.finditer(r'</?' + re.escape(tag) + r'\b[^>]*>', text[m.end():], re.I):
        depth += -1 if item.group().startswith('</') else 1
        if depth == 0:
            end = m.end() + item.end()
            if text[end:end + 1] == '\n':
                end += 1
            return text[:m.start()] + text[end:]
    raise BuildError(f'unclosed element #{element_id}')


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    need(count == 1, f'patch "{label}": anchor found {count} times (need exactly 1)')
    return text.replace(old, new, 1)


def read_parts(folder: Path, suffix: str) -> str:
    files = sorted(p for p in folder.rglob(f'*{suffix}') if p.is_file())
    out = []
    for p in files:
        body = p.read_text(encoding='utf-8')
        out.append(f'/* ---- {p.relative_to(SRC).as_posix()} ---- */\n{body.rstrip()}\n')
    return '\n'.join(out)


def copy_json() -> dict:
    path = SRC / 'copy.json'
    return json.loads(path.read_text(encoding='utf-8')) if path.exists() else {}


# Embedded font files (src/settings/nier/fonts) are inlined by settings_layer.py, never read as text.
BINARY_SUFFIXES = {'.woff2', '.woff', '.ttf', '.otf'}


def lint_sources() -> list[str]:
    problems = []
    for p in sorted(SRC.rglob('*')):
        if not p.is_file() or p.suffix in BINARY_SUFFIXES:
            continue
        text = p.read_text(encoding='utf-8')
        if EMOJI.search(text):
            problems.append(f'emoji glyph in {p.relative_to(PKG)}')
        if p.suffix == '.css':
            # A :has() whose subject is html/body/:root makes every DOM insertion restyle the whole ~17k-node document
            # (measured ~90 ms each); that is what made Settings lag. Settings styles use no :has() at all.
            for m in re.finditer(r'(?:^|[\s,}])(?:html|body|:root)\b[^{},]*:has\(', text):
                problems.append(f'page-wide :has() in {p.relative_to(PKG)}: {m.group(0).strip()[:80]}')
            if 'settings' in p.relative_to(SRC).parts and ':has(' in text:
                problems.append(f':has() in Settings styles {p.relative_to(PKG)}')
            for m in re.finditer(r'border-(?:left|inline-start)\s*:\s*([^;]+);', text):
                width = re.search(r'(\d+(?:\.\d+)?)px', m.group(1))
                if width and float(width.group(1)) >= 2:
                    problems.append(f'left accent border in {p.relative_to(PKG)}: {m.group(0)}')
    def walk(node, path):
        if isinstance(node, dict):
            for k, v in node.items():
                walk(v, f'{path}.{k}')
        elif isinstance(node, list):
            for i, v in enumerate(node):
                walk(v, f'{path}[{i}]')
        elif isinstance(node, str):
            # PJCT-007/PWIZ-021 fix these two recovery action labels exactly.
            owner_labels = {'.creating.recovery.open': 'Open Repository', '.creating.recovery.delete': 'Delete Repository'}
            if BANNED_COPY.search(node) and not path.split('.')[-1].startswith('detail') and owner_labels.get(path) != node:
                problems.append(f'banned word in copy.json{path}: {node[:80]}')
    walk(copy_json(), '')
    problems.extend(duplicate_keys())
    return problems


def duplicate_keys() -> list[str]:
    """A key given twice in one screen or tour-step definition: JavaScript keeps the later one without a word, which
    once dropped the backup access fields' handlers (a second `bind:` further down the protect screen). Top-level keys
    are the 4-space-indented `key:` / `key(` / `async key(` lines of each def('id', {...}) or S({ id: ... })."""
    out = []
    for p in sorted((SRC / 'js').glob('*.js')):
        cur, keys = None, {}
        for n, line in enumerate(p.read_text(encoding='utf-8').split('\n'), 1):
            m = re.match(r"\s*(?:def|S)\((?:'([\w-]+)',\s*)?\{(?:\s*id:\s*'([\w-]+)')?", line)
            if m and (m.group(1) or m.group(2)):
                cur, keys = m.group(1) or m.group(2), {}
                for k in re.findall(r"[,{]\s*(\w+)\s*:", line):
                    if k != 'id':
                        keys.setdefault(k, []).append(n)
                continue
            if cur is None:
                continue
            m = re.match(r"^    (?:async\s+)?(\w+)\s*(?::|\()", line)
            if m:
                keys.setdefault(m.group(1), []).append(n)
            if re.match(r"^  \S", line):
                out += [f'duplicate key {k!r} in {cur} ({p.name} lines {ns})' for k, ns in keys.items() if len(ns) > 1]
                cur = None
    return out


PATCHES = [
    # Hover-tag layer: recognise the new overlay roots instead of the removed pm7 ones.
    ("function activeOverlay(){var tour=document.getElementById('pm7-guided-tour'),onboarding=document.getElementById('pm7-onboarding');",
     "function activeOverlay(){var tour=document.getElementById('pm-o55-tour'),onboarding=document.getElementById('pm-o55-onboarding');",
     'hover-tag activeOverlay'),
    ("function isProductOverlayRoot(el){return !!(el&&el.nodeType===1&&(el.id==='pm7-guided-tour'||el.id==='pm7-onboarding'));}",
     "function isProductOverlayRoot(el){return !!(el&&el.nodeType===1&&(el.id==='pm-o55-tour'||el.id==='pm-o55-onboarding'));}",
     'hover-tag isProductOverlayRoot'),
    ("added.querySelector('#pm7-guided-tour[data-open=\"true\"],#pm7-onboarding[data-open=\"true\"]')",
     "added.querySelector('#pm-o55-tour[data-open=\"true\"],#pm-o55-onboarding[data-open=\"true\"]')",
     'hover-tag overlayTransitionRoot'),
    ("this.active.closest('.pm7gt-callout,.pm7ob-window')",
     "this.active.closest('.o55t-callout,.o55-win')",
     'hover-tag teaching panel'),
    ("el.closest('.pm7gt')?'Shows where you are in this tour.'",
     "el.closest('.o55t-root')?'Shows where you are in this tour.'",
     'hover-tag tour status'),
    # Labels: Run Onboarding Again / Replay Guided Tour, separate from Doctor.
    ('<span>Run setup wizard</span>', '<span>Run Onboarding Again</span>', 'home menu label'),
    ('<span class="setup-label">Run setup wizard</span><span class="setup-meta">Start or replay the simple guided setup</span>',
     '<span class="setup-label">Run Onboarding Again</span><span class="setup-meta">Go through the first-time setup again</span>',
     'settings essential setup: onboarding row'),
    ('<span class="setup-label">Guided Tour</span><span class="setup-meta">Learn the live workspace with a local teacher</span>',
     '<span class="setup-label">Replay Guided Tour</span><span class="setup-meta">Try the main actions again with a local example</span>',
     'settings essential setup: tour row'),
    ("'settings.onboarding.run_again':['Run setup again','Review your setup choices from the beginning.']",
     "'settings.onboarding.run_again':['Run Onboarding Again','Go through the first-time setup again.']",
     'hover label settings.onboarding.run_again'),
    ("'run-onboarding':['Run setup again','Review your setup choices from the beginning.']",
     "'run-onboarding':['Run Onboarding Again','Go through the first-time setup again.']",
     'hover label run-onboarding'),
    ("return ['Run setup again','Review your setup choices from the beginning.'];",
     "return ['Run Onboarding Again','Go through the first-time setup again.'];",
     'hover label onboarding signal'),
    ("'ui.guided_tour.finish':['Finish tour','Keep Teacher on the right and return to your work.']",
     "'ui.guided_tour.finish':['Finish tour','End the tour and open Planning Wizard.']",
     'hover label tour finish'),
    # Doctor stays findings-only: the replay actions move out of its quiet row.
    ("      { label: 'Replay setup', action: 'replay-onboarding', data: { 'ui-action-id': 'settings.onboarding.run_again', 'source-surface': 'settings_rerun' } },\n"
     "      { label: 'Guided Tour', action: 'start-guided-tour', data: { 'ui-action-id': 'settings.guided_tour.replay' } },\n",
     '', 'doctor quiet actions'),
    # Settings lag: with this rule's universal subject, every DOM insertion anywhere restyled the whole document
    # (~90 ms each; the hover-tag layer inserts one description per control it binds, so scrolling and index jumps in
    # Settings ran at 2-6 fps). The :has() is implied by the descendant part; the doubled class keeps (0,3,0).
    (".pm7u-card:has(.pm7u-setup-cta) .pm7u-setup-cta > * {",
     ".pm7u-card .pm7u-setup-cta.pm7u-setup-cta > * {",
     'usage card cta :has restyle'),
    # Notification sounds: a built-in sound may carry its own recipe (sound.tones), so the library can hold more,
    # and more varied, sounds than the name-matched demo tones. A note may glide to a second pitch and set its level.
    ("    const profileFor = sound => {\n      const key = `${sound && sound.id || ''} ${sound && sound.name || ''}`.toLowerCase();",
     "    const profileFor = sound => {\n      if (sound && Array.isArray(sound.tones) && sound.tones.length) return sound.tones;\n      const key = `${sound && sound.id || ''} ${sound && sound.name || ''}`.toLowerCase();",
     'sound recipe from the sound'),
    ("        for (const [frequency, offset, length, type] of profileFor(sound)) {",
     "        for (const [frequency, offset, length, type, glideTo, level] of profileFor(sound)) {",
     'sound recipe note fields'),
    ("          oscillator.frequency.setValueAtTime(frequency, noteStart);\n          envelope.gain.setValueAtTime(.0001, noteStart);\n          envelope.gain.exponentialRampToValueAtTime(.42, noteStart + Math.min(.025, duration * .04));",
     "          oscillator.frequency.setValueAtTime(frequency, noteStart);\n          if (glideTo) oscillator.frequency.exponentialRampToValueAtTime(glideTo, noteEnd);\n          envelope.gain.setValueAtTime(.0001, noteStart);\n          envelope.gain.exponentialRampToValueAtTime(level || .42, noteStart + Math.min(.025, duration * .04));",
     'sound recipe glide and level'),
    # The Settings rail and Home count the real AI services (the list grew from 13 to 22 and each one's state is
    # live), not a fixed "7 ready · 2 need attention". Providers & Accounts defines window.O55ProviderSummary.
    ("<strong>AI Providers</strong><small>7 ready · 2 need attention</small>",
     "<strong>AI Providers</strong><small>${window.O55ProviderSummary ? window.O55ProviderSummary() : ''}</small>",
     'settings rail provider count'),
    ('<span class="setup-meta">7 ready · 2 need attention · install, sign in, choose models</span>',
     '<span class="setup-meta">${window.O55ProviderSummary ? window.O55ProviderSummary() + \' · \' : \'\'}install, sign in, choose models</span>',
     'settings home provider count'),
    # Teacher is a real persona in the Assistant Chat guide picker.
    ("var PERSONA_CATALOG = ['Product Manager', 'Architect Reviewer', 'Rust Engineer'];",
     "var PERSONA_CATALOG = ['Product Manager', 'Architect Reviewer', 'Rust Engineer', 'Teacher'];",
     'teacher persona'),
]


def nier_paint(var: str) -> str:
    """The family to paint for a chosen `var`: window.PM_THEME_PAINT_FAMILY(var) when the hook is present and answers a
    real family, else `var` itself (the hook never decides alone: a throw or an unknown answer paints the choice)."""
    return ("(function(f){try{var p=typeof window.PM_THEME_PAINT_FAMILY==='function'?window.PM_THEME_PAINT_FAMILY(f):f;"
            "return /^(friendly|glass|retro|basic)$/.test(p)?p:f;}catch(e){return f;}})(" + var + ")")


# NieR Mode (src/settings/kit.d/18-nier.js) is a hidden theme painted over the Basic family. The paint hook
# window.PM_THEME_PAINT_FAMILY(family) answers the family to paint: 'basic' while NieR Mode is on, the family itself
# while it is off. PM_THEME's themeState keeps the chosen family and mode, so turning NieR Mode off paints exactly what
# was chosen. Every writer of <html data-theme> that can run while NieR Mode is on goes through the hook:
#   - PM_THEME.themeApply (setFamily / setMode / set, the Auto scheme listener, the boot adoption in wireTheme);
#   - the legacy #themeSelect change bridge, which copies the menu's chosen slug back onto <html>;
#   - PM7_SETTINGS_TOME.applyPaint (its slug and its no-PM_THEME fallback). Its repaint test compared <html> with the
#     chosen slug, which under NieR Mode differs on every save, and never noticed a themeState left behind by the
#     boot adoption; it now compares the painted slug and the chosen family.
# The head boot script only ever writes basic-<scheme> (its family is the literal 'basic'), so it needs no hook.
# PM_THEME_PAINT_LABEL() names the painted look in the title-bar menu ('' while NieR Mode is off).
NIER_PATCHES = [
    ("    var slug = family + '-' + themeResolveScheme(mode);\n    var prev = document.documentElement.getAttribute('data-theme');",
     "    var slug = " + nier_paint('family') + " + '-' + themeResolveScheme(mode);\n"
     "    var prev = document.documentElement.getAttribute('data-theme');",
     'nier paint hook: themeApply'),
    ("      var title = 'Theme: ' + PM_THEME_FAMILIES[family] +\n        (mode === 'auto' ? ' (Auto)' : ' (' + PM_THEME_SLUGS[slug] + ')');",
     "      var paintLabel = typeof window.PM_THEME_PAINT_LABEL === 'function' ? window.PM_THEME_PAINT_LABEL() : '';\n"
     "      var title = paintLabel ? 'Theme: ' + paintLabel + (mode === 'auto' ? ' (Auto)' : ' (' + (scheme === 'light' ? 'Light' : 'Dark') + ')') :\n"
     "        'Theme: ' + PM_THEME_FAMILIES[family] +\n        (mode === 'auto' ? ' (Auto)' : ' (' + PM_THEME_SLUGS[slug] + ')');",
     'nier paint hook: theme menu title'),
    ("    if (label) label.textContent = PM_THEME_FAMILIES[family] || family;",
     "    if (label) label.textContent = (typeof window.PM_THEME_PAINT_LABEL === 'function' && window.PM_THEME_PAINT_LABEL()) || PM_THEME_FAMILIES[family] || family;",
     'nier paint hook: theme menu label'),
    ("              if (v) document.documentElement.setAttribute('data-theme', v);",
     "              var pm = /^([a-z]+)-(light|dark)$/.exec(v || '');\n"
     "              if (pm) v = " + nier_paint('pm[1]') + " + '-' + pm[2];\n"
     "              if (v) document.documentElement.setAttribute('data-theme', v);",
     'nier paint hook: legacy themeSelect bridge'),
    ("var slug=family+'-'+(mode==='auto'?(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):mode);",
     "var slug=" + nier_paint('family') + "+'-'+(mode==='auto'?(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):mode);",
     'nier paint hook: applyPaint slug'),
    ("if(themeKey!==lastPaintThemeKey||currentSlug!==slug){",
     "if(themeKey!==lastPaintThemeKey||currentSlug!==slug||(window.PM_THEME&&typeof window.PM_THEME.getFamily==='function'&&window.PM_THEME.getFamily()!==family)){",
     'nier paint hook: applyPaint repaint test'),
]

# Owner exposures (Astra precedent): hand the real owners to onboarding/tour without a second implementation.
SETTINGS_ANCHOR = "closeTransientUi:()=>{settingsSoundPreview.stop('settings-surface-close');"
SETTINGS_EXPOSE = r"""o55SettingsTransfer:(()=>{const pending=new Map();return {sources:()=>settingsCopySources(),categoryFor:(id)=>transferCategoryForId(id),categories:()=>{const s=new Set();const snap=Object.values(window.PM12_REFERENCE?.byCat||{}).flatMap(c=>c.settings||[]);for(const r of snap){if(!r||!r.id||TRANSFER_CREDENTIAL_IDS.has(r.id)||r.credential_ref_only)continue;const c=transferCategoryForId(r.id);if(c)s.add(c);}return [...s];},draftPreview:(sourceId,categories)=>{const snapshot=window.PM7_SETTINGS_TOME.projectSnapshot(sourceId);if(!snapshot?.settings)return {ok:false,reason:'This Project has no readable settings yet.'};const rows=Object.values(window.PM12_REFERENCE?.byCat||{}).flatMap(c=>c.settings||[]),canon=new Map(rows.map(r=>[r.id,r]));const pick=Array.isArray(categories)&&categories.length?new Set(categories):null,groups={},excluded=[];for(const [id,value] of Object.entries(snapshot.settings)){const row=canon.get(id);if(!row)continue;if(TRANSFER_CREDENTIAL_IDS.has(id)||row.credential_ref_only){excluded.push(id);continue;}const cat=transferCategoryForId(id);if(!cat||(pick&&!pick.has(cat)))continue;(groups[cat]=groups[cat]||[]).push({id,label:row.label||id,value});}return {ok:true,sourceId,groups,excludedCount:excluded.length,applied:false};},apply:(sourceId,categories,options)=>applyDetachedSettingsCopy(sourceId,categories,options||{}),applyPending:(sourceId,reservation,categories,options={})=>{
 if(window.PM_SETTINGS_REGISTRY)return {ok:false,reason:'The Settings owner has not supplied a current draft rebind and reserved-destination transaction.'};
 const dest=reservation?.destination_project_id,finalId=reservation?.fixture_project_id;
 if(!sourceId||!dest||!finalId||sourceId===dest||sourceId===finalId||!reservation.draft_ref||!Number.isInteger(reservation.draft_revision))return {ok:false,reason:'A distinct current draft reservation is required.'};
 const selection=transferSelection(categories);if(!selection.ok)return selection;
 const snapshot=window.PM7_SETTINGS_TOME.projectSnapshot(sourceId);if(!snapshot?.settings)return {ok:false,reason:'Source Settings unavailable.'};
 if(options.credentials==='Reference compatible saved accounts')return {ok:false,reason:'Saved account references require the Settings owner.'};
 const canon=new Map(Object.values(window.PM12_REFERENCE?.byCat||{}).flatMap(c=>c.settings||[]).map(r=>[r.id,r]));
 const values={},excluded=new Set(options.excludedSettings||[]),changes=[];
 for(const [id,value] of Object.entries(snapshot.settings)){
  const row=canon.get(id);if(!row||!selection.ids.has(id)||excluded.has(id)||TRANSFER_CREDENTIAL_IDS.has(id)||row.credential_ref_only)continue;
  if(JSON.stringify(value)===JSON.stringify(row.default))continue;
  const keep=options.conflicts==='Keep destination on conflicts';
  changes.push({id,decision:keep?'Keep destination':'Use source'});if(!keep)values[id]=JSON.parse(JSON.stringify(value));
 }
 const key=dest+'|'+reservation.draft_ref+'|'+reservation.draft_revision,receipt='fixture:settings-pending:'+key;
 pending.set(key,{dest,finalId,draft_ref:reservation.draft_ref,draft_revision:reservation.draft_revision,sourceId,sourceJson:JSON.stringify(snapshot.settings),values,receipt});
 return {ok:true,reservation_key:key,destination_project_id:dest,source_project_id:sourceId,draft_revision:reservation.draft_revision,count:Object.keys(values).length,receipt,fixtureMode:true,changes};
},
publishPending:(key,projectId,binding)=>{
 const staged=pending.get(key);if(!staged)return {ok:false,reason:'The pending Settings preview is no longer available.'};
 if(window.PM_SETTINGS_REGISTRY)return {ok:false,reason:'The Settings owner must rebind this draft before publication.'};
 if(projectId!==staged.finalId||binding?.draft_ref!==staged.draft_ref||binding?.draft_revision!==staged.draft_revision)return {ok:false,reason:'The listed Project does not match the pending draft reservation.'};
 const current=window.PM7_SETTINGS_TOME.projectSnapshot(staged.sourceId);
 if(!current?.settings||JSON.stringify(current.settings)!==staged.sourceJson)return {ok:false,reason:'Source Settings changed after preview.'};
 const snaps=window.PM_SETTINGS_PROJECT_SNAPSHOTS||{};
 if(Object.prototype.hasOwnProperty.call(snaps,projectId)||window.PM7_SETTINGS_TOME.project()?.id===projectId)return {ok:false,reason:'The reserved destination already exists.'};
 // The only public fixture write, after matching terminal Project evidence and before selection.
 window.PM_SETTINGS_PROJECT_SNAPSHOTS=snaps;
 snaps[projectId]={label:projectId,settings:JSON.parse(JSON.stringify(staged.values)),fixture:true,receipt_id:staged.receipt};
 pending.delete(key);return {ok:true,project_id:projectId,count:Object.keys(staged.values).length,receipt:staged.receipt,fixtureMode:true};
},
discardPending:(key)=>({ok:true,discarded:pending.delete(key)})};})(),"""
LAYOUT_ANCHOR = '    failNextPersistenceWrite: function () { faults.failNextWrite = true; },'
LAYOUT_EXPOSE = ('    o55RestoreSnapshot: function (snapshot) { var problem = validateLayout(snapshot); '
                 'if (problem) return { ok: false, reason: problem }; '
                 'var result = commitLayout(JSON.parse(JSON.stringify(snapshot)), "restore", "cmd.workspace.layout.restore", { source: "guided_tour_restore" }); '
                 'return { ok: result !== false, result: result }; },\n')


SETTINGS_NOTES: dict = {}


def build_text() -> str:
    original = SOURCE.read_bytes()
    need(hashlib.sha256(original).hexdigest() == BASE_SHA256,
         'TestPMConcept.html changed since the pin; review the strip boundaries and patches, then re-pin BASE_SHA256.')
    text = original.decode('utf-8')

    # 0. Settings: swap the base's T50 managers layer for the Opus 5.5 fork in src/settings.
    text, SETTINGS_NOTES['layer'] = settings_layer.apply(text, need)

    # 1. Strip the legacy Product Onboarding + Guided Tour.
    text = remove_block(text, 'style', 'pm7-onboarding-css')
    text = remove_block(text, 'style', 'pm7-guided-tour-css')
    text = remove_block(text, 'script', 'pm7-guided-tour-js')
    body_anchor = '<!-- PM7 Product Onboarding: simple cinematic guided setup -->'
    need(text.count(body_anchor) == 1, 'onboarding body anchor comment missing')
    text = text.replace(body_anchor, '<!-- O55:BODY:START -->\n<!-- O55:BODY:END -->', 1)
    for element_id in ['pm7-onboarding', 'pm7-onboarding-resume', 'pm7-guided-tour', 'pm7-guided-tour-resume',
                       'pm7-guided-tour-replay']:
        text = remove_element(text, element_id)
    text = remove_block(text, 'script', 'pm7-onboarding-js')
    tour_comment = '<!-- PM7 Guided Tour: deterministic real-shell teacher -->\n'
    if tour_comment in text:
        text = text.replace(tour_comment, '', 1)

    # 2. Guarded patches.
    for old, new, label in PATCHES + NIER_PATCHES:
        text = replace_once(text, old, new, label)
    text = replace_once(text, SETTINGS_ANCHOR, SETTINGS_EXPOSE + SETTINGS_ANCHOR, 'settings transfer exposure')
    text = replace_once(text, LAYOUT_ANCHOR, LAYOUT_EXPOSE + LAYOUT_ANCHOR, 'layout restore exposure')

    # 3. Splice the O55 modules.
    css = read_parts(SRC / 'css', '.css')
    js = read_parts(SRC / 'js', '.js')
    copy = json.dumps(copy_json(), ensure_ascii=False, separators=(',', ':'))
    head_block = f'<!-- O55:CSS:START -->\n<style id="pm-o55-css">\n{css}\n</style>\n<!-- O55:CSS:END -->\n'
    text = replace_once(text, '</head>', head_block + '</head>', 'head css splice')
    body_block = (f'<!-- O55:BODY:START -->\n<script id="pm-o55-js">\n'
                  f'window.O55_COPY={copy};\n{js}\n</script>\n<!-- O55:BODY:END -->')
    text = text.replace('<!-- O55:BODY:START -->\n<!-- O55:BODY:END -->', body_block, 1)
    text = re.sub(r'<title>.*?</title>', '<title>TestOpus5.5 · Puppet Master</title>', text, count=1, flags=re.S)
    note = ('<!-- TestOpus5.5PmConcept (Opus 5.5): TestPMConcept.html with a rebuilt Product Onboarding and Guided Tour. '
            'Built by Concepts/onboarding/opus-5.5/tools/build.py; never hand-edit. -->\n')
    return note + text


def check(built: str) -> list[str]:
    problems = lint_sources() + syntax_check(built)
    for removed in ['id="pm7-onboarding"', 'id="pm7-guided-tour"', 'pm7-onboarding-js', 'pm7-guided-tour-js',
                    'pm7-onboarding-css', 'pm7-guided-tour-css', "'.pm7gt-callout", ".closest('.pm7gt')",
                    "getElementById('pm7-onboarding')", "getElementById('pm7-guided-tour')"]:
        if removed in built:
            problems.append(f'removed reference still present: {removed}')
    for marker in ['<!-- O55:CSS:START -->', '<!-- O55:CSS:END -->', '<!-- O55:BODY:START -->', '<!-- O55:BODY:END -->']:
        if built.count(marker) != 1:
            problems.append(f'marker {marker} appears {built.count(marker)} times')
    expected = built.encode('utf-8')
    if not TARGET.exists():
        problems.append('Concepts/TestOpus5.5PmConcept.html is missing; run build.py')
    elif TARGET.read_bytes() != expected:
        problems.append('Concepts/TestOpus5.5PmConcept.html is stale; run build.py')
    if not PM7_TARGET.exists():
        problems.append('Concepts/PMConcept7.html is missing; run build.py --publish-pm7')
    elif PM7_TARGET.read_bytes() != expected:
        problems.append('Concepts/PMConcept7.html differs from a fresh build; run build.py --publish-pm7')
    return problems


def syntax_check(built: str) -> list[str]:
    """node --check the scripts this package writes (the Settings engine with its managers, and the O55 module)."""
    import subprocess
    import tempfile
    out = []
    for sid in ('pm4-settings-js', 'pm-o55-js'):
        m = re.search(r'<script\b[^>]*\bid="' + sid + r'"[^>]*>(.*?)</script>', built, re.S)
        if not m:
            out.append(f'script {sid} missing')
            continue
        with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as fh:
            fh.write(m.group(1))
            path = fh.name
        r = subprocess.run(['node', '--check', path], capture_output=True, text=True)
        Path(path).unlink(missing_ok=True)
        if r.returncode:
            out.append(f'syntax error in {sid}: ' + ' | '.join(r.stderr.strip().splitlines()[-4:])[:600])
    return out


def main() -> int:
    try:
        built = build_text()
    except BuildError as exc:
        print(f'BUILD FAILED: {exc}', file=sys.stderr)
        return 2
    if '--check' in sys.argv:
        problems = check(built)
        for p in problems:
            print('CHECK:', p)
        print('check', 'ok' if not problems else f'failed ({len(problems)})')
        return 0 if not problems else 1
    problems = lint_sources() + syntax_check(built)
    if problems:
        for p in problems:
            print('LINT:', p)
        return 1
    TARGET.write_text(built, encoding='utf-8')
    data = built.encode('utf-8')
    summary = {'output': str(TARGET.relative_to(CONCEPTS.parent)), 'bytes': len(data),
               'sha256': hashlib.sha256(data).hexdigest()[:16],
               'base_sha256': BASE_SHA256[:16]}
    if '--publish-pm7' in sys.argv:
        PM7_TARGET.write_text(built, encoding='utf-8')
        summary['pm7_output'] = str(PM7_TARGET.relative_to(CONCEPTS.parent))
        summary['pm7_bytes'] = len(data)
        summary['pm7_sha256'] = hashlib.sha256(data).hexdigest()
    print(json.dumps(summary))
    return 0


if __name__ == '__main__':
    sys.exit(main())
