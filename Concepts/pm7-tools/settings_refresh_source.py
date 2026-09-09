"""T50: Settings managers refresh for the published TestPMConcept.

Never hand-edit TestPMConcept.html.  This authored transform is applied on the
pinned published checkpoint by ``build_testpm_settings_refresh.py`` and is also
registered as T50 in ``build_pm7.py``.  It:

* replaces the provider, hosted-forge and sound fixtures inside the Settings
  data IIFE with the canonical inventories from ``settings_refresh/data.json``;
* makes every built-in sound row a labelled generated demonstration tone;
* injects ``settings_refresh/styles.css`` as ``<style id="pm51-settings-refresh">``
  before ``</head>`` (after the pm50 layout block);
* appends the manager kit and the rewritten manager renderers
  (``settings_refresh/kit.js`` + ``settings_refresh/managers/*.js``) to the
  Settings engine immediately before ``boot()``, after the T49 and narrow v3
  modules, so the re-assigned renderers win.

Every non-Settings ``<script>`` is asserted byte-identical before/after.
"""
from __future__ import annotations

import hashlib
import json
import os
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
SRC = HERE / "settings_refresh"
MARKER = "PM51_SETTINGS_REFRESH"
STYLE_ID = "pm51-settings-refresh"

EMOJI_RE = re.compile("[\U0001F000-\U0001FAFF☀-➿⬀-⯿️]")
ACCENT_RE = re.compile(r"border-(left|top|right|bottom)\s*:\s*[2-9]px\s+solid\s+var\(--k3-accent")


def _read(name: str) -> str:
    return (SRC / name).read_text(encoding="utf-8")


def _sha(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def _js(value) -> str:
    """Serialize fixture data as a JS literal (JSON is valid JS)."""
    return json.dumps(value, ensure_ascii=False, indent=2)


def _replace_once(text: str, old: str, new: str, need, label: str) -> str:
    need(text.count(old) == 1, f"T50: anchor '{label}' count != 1")
    return text.replace(old, new, 1)


def _replace_band(text: str, start_anchor: str, end_anchor: str, replacement: str, need, label: str) -> str:
    need(text.count(start_anchor) == 1, f"T50: band start '{label}' count != 1")
    start = text.index(start_anchor)
    end = text.find(end_anchor, start)
    need(end > start, f"T50: band end '{label}' missing")
    return text[:start] + replacement + text[end:]


def module_source() -> str:
    kit = _read("kit.js")
    managers = sorted((SRC / "managers").glob("*.js"))
    only = os.environ.get("PM51_MANAGERS")  # dev aid: comma-separated filename prefixes to include
    if only:
        prefixes = [x.strip() for x in only.split(",") if x.strip()]
        managers = [p for p in managers if any(p.name.startswith(x) for x in prefixes)]
    parts = [f"/* ---- {p.name} ---- */\n" + p.read_text(encoding="utf-8") for p in managers]
    data = load_data()
    body = "const PM51_DATA = " + json.dumps(data["extras"], ensure_ascii=False) + ";\n" + kit + "\n" + "\n".join(parts)
    return "(function pm51SettingsRefresh(){\n'use strict';\n" + body + "\n})();\n"


def load_data() -> dict:
    return json.loads(_read("data.json"))


def apply(doc: str, notes: dict, need) -> str:
    need(MARKER not in doc, "T50 is already applied")
    data = load_data()
    css = _read("styles.css")
    module = module_source()

    for bad in ["backdrop-filter", "url(#"]:
        need(bad not in css, "T50: unsupported paint primitive in CSS: " + bad)
    need(not ACCENT_RE.search(css), "T50: accent stripe rule found in CSS")
    need(not EMOJI_RE.search(css) and not EMOJI_RE.search(module), "T50: emoji code point in authored source")

    script_pat = r'(<script\b[^>]*\bid="pm4-settings-js"[^>]*>)(.*?)(</script>)'
    matches = list(re.finditer(script_pat, doc, re.S))
    need(len(matches) == 1, "T50 needs exactly one Settings engine script")
    m = matches[0]
    js = m.group(2)
    before_js = js

    # ---- data bands ---------------------------------------------------------
    js = _replace_band(js, "  const providers = [", "  const freeRoutes = [",
                       "  const providers = " + _js(data["providers"]) + ";\n\n", need, "providers")
    js = _replace_band(js, "    { id: 'free-community',", "  ];\n\n  const webRoutes = [", "", need, "free-community route removed")
    js = _replace_band(js, "    forges: [", "    repositories: [",
                       "    forges: " + _js(data["forges"]) + ",\n", need, "forges")
    js = _replace_band(js, "    sounds: [", "    packs: [",
                       "    sounds: " + _js(data["sounds"]) + ",\n", need, "sounds")
    for old, new in data.get("providerNameRenames", []):
        need(js.count(old) >= 1, "T50: provider name rename anchor missing: " + old)
        js = js.replace(old, new)
    for old, new in data["eventSoundRenames"]:
        js = _replace_once(js, f"sound: '{old}'", f"sound: '{new}'", need, f"event sound {old}")

    # ---- sound factory: every built-in row is a labelled demo tone ----------
    js = _replace_once(js, "    const builtinIds = new Set(['attention', 'soft-warning']);",
                       "    const builtinIds = null; /* T50: every built-in row is a labelled demo tone */", need, "builtinIds")
    js = _replace_once(js, "      : sound?.source === 'Built-in' && builtinIds.has(sound?.id) ? 'concept_tone' : 'file_unavailable';",
                       "      : /^Built-in/.test(String(sound?.source || '')) ? 'concept_tone' : 'file_unavailable';", need, "availability")
    js = _replace_once(js,
        "      if (key.includes('soft')) return [\n        [392, 0, .38, 'sine'], [329.63, .42, .48, 'sine']\n      ];\n",
        "      if (key.includes('soft')) return [\n        [392, 0, .38, 'sine'], [329.63, .42, .48, 'sine']\n      ];\n"
        "      if (key.includes('done') || key.includes('success') || key.includes('complete')) return [\n"
        "        [523.25, 0, .16, 'sine'], [659.25, .16, .16, 'sine'], [783.99, .32, .16, 'sine'], [1046.5, .48, .5, 'sine']\n      ];\n"
        "      if (key.includes('blocked') || key.includes('stop')) return [\n"
        "        [329.63, 0, .2, 'square'], [329.63, .3, .2, 'square'], [261.63, .6, .42, 'triangle']\n      ];\n"
        "      if (key.includes('update')) return [\n"
        "        [440, 0, .2, 'sine'], [554.37, .22, .2, 'sine'], [440, .44, .4, 'sine']\n      ];\n",
        need, "profileFor demo tones")

    # ---- rail / home fixture copy -------------------------------------------
    for old, new in data["copyRenames"]:
        js = _replace_once(js, old, new, need, "copy " + old[:24])

    # ---- module ---------------------------------------------------------------
    anchor = "  boot();\n})();"
    need(js.count(anchor) == 1, "T50: Settings boot anchor drift")
    js = js.replace(anchor, "\n/* " + MARKER + " */\n" + module + "\n" + anchor, 1)
    doc = doc[:m.start()] + m.group(1) + js + m.group(3) + doc[m.end():]

    # ---- CSS ------------------------------------------------------------------
    need(doc.count("</head>") == 1, "T50: head anchor drift")
    doc = doc.replace("</head>", f'<style id="{STYLE_ID}">\n' + css + "\n</style>\n</head>", 1)

    notes.update({
        "source": "settings_refresh_source.py",
        "marker": MARKER,
        "kit_sha256": _sha(_read("kit.js")),
        "css_sha256": _sha(css),
        "data_sha256": _sha(_read("data.json")),
        "manager_files": [p.name for p in sorted((SRC / "managers").glob("*.js"))],
        "engine_before_sha256": _sha(before_js),
        "engine_after_sha256": _sha(js),
        "providers": [p["id"] for p in data["providers"]],
        "forges": [f["id"] for f in data["forges"]],
        "sounds": [s["id"] for s in data["sounds"]],
        "scope": "Settings engine (data fixtures, sound factory, appended pm51 module) and one head style block; no other script changed",
        "native_runtime_certified": False,
    })
    return doc


def check_scripts_unchanged(before: str, after: str, need) -> int:
    """Assert every non-Settings script is byte-identical; return the script count."""
    pattern = r'<script\b([^>]*)>(.*?)</script>'
    old = re.findall(pattern, before, re.S)
    new = re.findall(pattern, after, re.S)
    need(len(old) == len(new), "T50: unexpected script added or removed")
    for (attrs0, body0), (attrs1, body1) in zip(old, new):
        need(attrs0 == attrs1, "T50: script identity drift")
        if 'id="pm4-settings-js"' not in attrs0:
            need(body0 == body1, "T50: non-Settings source changed: " + attrs0)
    return len(new)
