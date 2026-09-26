"""O55 Settings layer: swap the pinned base's T50 Settings refresh for the Opus 5.5 fork in ../src/settings.

The pinned base (Concepts/TestPMConcept.html) is the T50 lane's output: its Settings engine carries the T50 fixture
bands (providers, forges, events, sounds) and the appended pm51 kit + managers module, and its head carries
<style id="pm51-settings-refresh">. This step replaces exactly those pieces with the fork, so the managers are
authored as real source files here instead of as patches:

* src/settings/kit.js, managers/*.js, data.json + data.d/*.json, placement.json, styles.css — forked from
  Concepts/pm7-tools/settings_refresh (T50) and reworked for Opus 5.5;
* the T50 transform's own one-time edits (name renames, sound factory, reference-row export, widened walkers) are
  already in the base and are kept; the fork may add `o55EngineRenames` ([old, new] pairs applied exactly once to
  the engine outside the module) for copy that lives in the engine.

The placement validator and module assembly are the T50 functions, pointed at the fork's folder.
"""
from __future__ import annotations

import importlib.util
import json
import re
from pathlib import Path

TOOLS = Path(__file__).resolve().parent
PKG = TOOLS.parent
FORK = PKG / 'src' / 'settings'
T50_SOURCE = PKG.parents[1] / 'pm7-tools' / 'settings_refresh_source.py'
MARKER = '/* PM51_SETTINGS_REFRESH */\n'
BOOT = '  boot();\n})();'
STYLE_OPEN = '<style id="pm51-settings-refresh">\n'


def _t50():
    """Load the T50 transform module with its source folder re-pointed at the fork."""
    spec = importlib.util.spec_from_file_location('o55_t50_settings_source', T50_SOURCE)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    mod.SRC = FORK
    mod.HERE = FORK.parent  # load_data() reads HERE / 'settings_refresh' / 'data.d'; re-pointed below
    mod.load_data = _load_data
    return mod


def _deep_merge(base, extra):
    if isinstance(base, dict) and isinstance(extra, dict):
        out = dict(base)
        for key, value in extra.items():
            out[key] = _deep_merge(base[key], value) if key in base else value
        return out
    return extra


def _load_data() -> dict:
    data = json.loads((FORK / 'data.json').read_text(encoding='utf-8'))
    for path in sorted((FORK / 'data.d').glob('*.json')):
        data = _deep_merge(data, json.loads(path.read_text(encoding='utf-8')))
    return data


def _band(text: str, start: str, end: str, replacement: str, need, label: str) -> str:
    need(text.count(start) == 1, f'O55 settings: band start {label!r} found {text.count(start)} times')
    i = text.index(start)
    j = text.find(end, i)
    need(j > i, f'O55 settings: band end {label!r} missing')
    return text[:i] + replacement + text[j:]


def apply(doc: str, need) -> tuple[str, dict]:
    t50 = _t50()
    data = _load_data()
    placement = t50.load_placement()
    css = (FORK / 'styles.css').read_text(encoding='utf-8')
    for bad in ['backdrop-filter', 'url(#']:
        need(bad not in css, 'O55 settings: unsupported paint primitive in CSS: ' + bad)

    m = re.search(r'(<script\b[^>]*\bid="pm4-settings-js"[^>]*>)(.*?)(</script>)', doc, re.S)
    need(m is not None, 'O55 settings: Settings engine script missing')
    js = m.group(2)
    need(js.count(MARKER) == 1 and js.count(BOOT) == 1, 'O55 settings: T50 module marker or boot anchor drift')
    start = js.index(MARKER) + len(MARKER)
    end = js.index(BOOT, start)
    engine = js[:js.index(MARKER)] + js[end:]  # the engine as T50 saw it, without any appended module

    census = t50.validate_placement(placement, engine, need)
    js = js[:start] + t50.module_source() + '\n' + js[end:]

    band_js = lambda value: json.dumps(value, ensure_ascii=False, indent=2)
    js = _band(js, '  const providers = [', '  const freeRoutes = [',
               '  const providers = ' + band_js(data['providers']) + ';\n\n', need, 'providers')
    js = _band(js, '    forges: [', '    repositories: [', '    forges: ' + band_js(data['forges']) + ',\n', need, 'forges')
    js = _band(js, '    events: [', '    sounds: [', '    events: ' + band_js(data['events']) + ',\n', need, 'events')
    js = _band(js, '    sounds: [', '    packs: [', '    sounds: ' + band_js(data['sounds']) + ',\n', need, 'sounds')
    module_at = js.index(MARKER)
    for old, new in data.get('o55EngineRenames', []):
        head = js[:module_at]
        need(head.count(old) == 1, f'O55 settings: engine rename anchor found {head.count(old)} times: {old[:60]!r}')
        js = head.replace(old, new, 1) + js[module_at:]
        module_at = js.index(MARKER)
    doc = doc[:m.start()] + m.group(1) + js + m.group(3) + doc[m.end():]

    need(doc.count(STYLE_OPEN) == 1, 'O55 settings: pm51 style block missing')
    s = doc.index(STYLE_OPEN) + len(STYLE_OPEN)
    e = doc.index('\n</style>', s)
    doc = doc[:s] + css + doc[e:]
    return doc, {'providers': [p['id'] for p in data['providers']], 'rows': census['ids'],
                 'manager_rows': census['manager_rows'], 'advanced_rows': census['advanced_rows']}
