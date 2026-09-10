"""T50: Settings managers refresh for the published TestPMConcept.

Never hand-edit TestPMConcept.html.  This authored transform is applied on the
pinned published checkpoint by ``build_testpm_settings_refresh.py`` and is also
registered as T50 in ``build_pm7.py``.  It:

* replaces the provider, hosted-forge and sound fixtures inside the Settings
  data IIFE with the canonical inventories from ``settings_refresh/data.json``;
* makes every built-in sound row a labelled generated demonstration tone;
* exports the reference row factory (``referenceRow``) from the data IIFE and
  widens the two large engine walkers (``allSettingsCatalog``,
  ``buildSearchIndex``) to any workspace that carries ``sections`` so the
  canonical settings placed inside managers by wave S stay searchable;
* injects ``settings_refresh/styles.css`` as ``<style id="pm51-settings-refresh">``
  before ``</head>`` (after the pm50 layout block);
* appends the manager kit and the rewritten manager renderers
  (``settings_refresh/kit.js`` + ``settings_refresh/managers/*.js``) to the
  Settings engine immediately before ``boot()``, after the T49 and narrow v3
  modules, so the re-assigned renderers win.  The module carries
  ``PM51_DATA`` (fixtures) and ``PM51_PLACEMENT`` (``settings_refresh/placement.json``,
  validated at build time by ``validate_placement``).

Every non-Settings ``<script>`` is asserted byte-identical before/after.
"""
from __future__ import annotations

import fnmatch
import hashlib
import json
import os
import re
from collections import Counter, OrderedDict
from pathlib import Path

HERE = Path(__file__).resolve().parent
SRC = HERE / "settings_refresh"
MARKER = "PM51_SETTINGS_REFRESH"
STYLE_ID = "pm51-settings-refresh"

EMOJI_RE = re.compile("[\U0001F000-\U0001FAFF☀-➿⬀-⯿️]")
ACCENT_RE = re.compile(r"border-(left|top|right|bottom)\s*:\s*[2-9]px\s+solid\s+var\(--k3-accent")
CHECK_LABEL_RE = re.compile(r"^(check\b|test\b|test all|simulate|validate all|run all|test lab|preview effective)", re.I)
HAND_CANONICAL_RE = re.compile(r"setting\('([a-z]+\.[a-z0-9-]+\.[a-z0-9.-]+)'")


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


def _no_dup_keys(pairs):
    seen = set()
    for key, _ in pairs:
        if key in seen:
            raise ValueError("duplicate key in placement.json: " + key)
        seen.add(key)
    return OrderedDict(pairs)


def load_placement() -> dict:
    return json.loads(_read("placement.json"), object_pairs_hook=_no_dup_keys)


def module_source() -> str:
    kit = _read("kit.js")
    managers = sorted((SRC / "managers").glob("*.js"))
    only = os.environ.get("PM51_MANAGERS")  # dev aid: comma-separated filename prefixes to include
    if only:
        prefixes = [x.strip() for x in only.split(",") if x.strip()]
        managers = [p for p in managers if any(p.name.startswith(x) for x in prefixes)]
    parts = [f"/* ---- {p.name} ---- */\n" + p.read_text(encoding="utf-8") for p in managers]
    data = load_data()
    placement = load_placement()
    body = ("const PM51_DATA = " + json.dumps(data["extras"], ensure_ascii=False) + ";\n"
            + "const PM51_PLACEMENT = " + json.dumps(placement, ensure_ascii=False) + ";\n"
            + kit + "\n" + "\n".join(parts))
    return "(function pm51SettingsRefresh(){\n'use strict';\n" + body + "\n})();\n"


def _deep_merge(base, extra):
    if isinstance(base, dict) and isinstance(extra, dict):
        out = dict(base)
        for key, value in extra.items():
            out[key] = _deep_merge(base[key], value) if key in base else value
        return out
    return extra


def load_data() -> dict:
    """data.json plus every settings_refresh/data.d/*.json (sorted), deep-merged so each manager can
    own its fixture file without rewriting the shared one."""
    data = json.loads(_read("data.json"))
    extra_dir = HERE / "settings_refresh" / "data.d"
    if extra_dir.is_dir():
        for path in sorted(extra_dir.glob("*.json")):
            data = _deep_merge(data, json.loads(path.read_text(encoding="utf-8")))
    return data


# ---- placement (wave S) -------------------------------------------------------

def reference_rows(js: str) -> list:
    """The 892 canonical rows from the engine's window.PM12_REFERENCE literal."""
    anchor = "window.PM12_REFERENCE = "
    start = js.index(anchor) + len(anchor)
    end = js.index("\n", start)
    ref = json.loads(js[start:end].rstrip(";"))
    return [row for cat in ref["byCat"].values() for row in cat.get("settings", [])]


def resolve_placement(placement: dict, rows: list, hand_rendered: set):
    """Mirror of the kit's resolver: hand-rendered -> first matching override -> subgroup -> page default.
    Returns (resolved: id -> section id or None for hand rows, hits: rule index -> count, problems: [str])."""
    rules = placement.get("overrides", [])
    hits = Counter()
    resolved = {}
    problems = []
    for row in rows:
        sid = row["id"]
        if sid in hand_rendered:
            resolved[sid] = None
            continue
        matched = []
        for index, rule in enumerate(rules):
            hit = sid in rule.get("ids", []) or (rule.get("glob") and fnmatch.fnmatchcase(sid, rule["glob"]))
            if hit:
                hits[index] += 1
                matched.append(rule["section"])
        if len(set(matched)) > 1:
            problems.append(f"{sid} matched by rules for {sorted(set(matched))}")
        section = matched[0] if matched else placement["subgroups"].get(f"{row['cat']}.{row['sub']}") or placement["page_defaults"].get(row["cat"])
        if not section:
            problems.append(f"{sid} resolves nowhere")
        resolved[sid] = section
    return resolved, hits, problems


def validate_placement(placement: dict, js: str, need) -> dict:
    """Assert the placement map against the engine text and the manager files; return the census."""
    rows = reference_rows(js)
    by_id = {row["id"]: row for row in rows}
    need(len(by_id) == len(rows), "T50 placement: reference ids are not unique")
    text = json.dumps(placement, ensure_ascii=False)
    need(not EMOJI_RE.search(text), "T50 placement: emoji code point in placement.json")

    sections = placement["sections"]
    managers = placement["managers"]
    pages = placement["pages"]
    need(not (set(managers) & set(pages)), "T50 placement: a manager id collides with a page id")

    # every section points at a manager or a page; tabs exist in the manager files
    manager_files = {p.name: p.read_text(encoding="utf-8") for p in sorted((SRC / "managers").glob("*.js"))}
    file_of = {}
    for mid, meta in managers.items():
        owners = [name for name, body in manager_files.items() if f"const ID = '{mid}';" in body]
        need(len(owners) == 1, f"T50 placement: manager '{mid}' must be defined by exactly one manager file (found {owners})")
        need(f"PM51.manager('{meta['type']}'" in manager_files[owners[0]], f"T50 placement: manager '{mid}' type '{meta['type']}' not registered in {owners[0]}")
        file_of[mid] = owners[0]
        file_tabs = set(re.findall(r"\{ id: '([a-z-]+)', label: '", manager_files[owners[0]]))
        for tab in meta.get("tabs", {}):
            need(tab in file_tabs, f"T50 placement: manager '{mid}' tab '{tab}' is not defined in {owners[0]}")
    for pid in pages:
        need(f"id: '{pid}'" in js or f"workspace: '{pid}'" in js, f"T50 placement: page '{pid}' does not exist in the engine")
    for sid, section in sections.items():
        to = section["to"]
        need(to in managers or to in pages, f"T50 placement: section '{sid}' points at unknown destination '{to}'")
        if to in managers:
            tabs = managers[to].get("tabs", {})
            if tabs:
                need(section.get("tab") in tabs, f"T50 placement: section '{sid}' needs a tab of manager '{to}'")
            else:
                need(not section.get("tab"), f"T50 placement: section '{sid}' names a tab but manager '{to}' has none")
        else:
            need(not section.get("tab"), f"T50 placement: page section '{sid}' cannot have a tab")
            if section.get("hand_section"):
                need(f"id: '{section['hand_section']}', label:" in js, f"T50 placement: hand section '{section['hand_section']}' missing")
    for rule in placement.get("overrides", []):
        need(rule["section"] in sections, f"T50 placement: rule points at unknown section '{rule['section']}'")
        for sid in rule.get("ids", []):
            need(sid in by_id, f"T50 placement: rule id '{sid}' is not a canonical setting")
    for key, sid in placement["subgroups"].items():
        need(sid in sections, f"T50 placement: subgroup '{key}' points at unknown section '{sid}'")
    declared = {f"{row['cat']}.{row['sub']}" for row in rows}
    ref_subgroups = {f"{cat}.{sub['id']}" for cat, meta in json.loads(js[js.index("window.PM12_REFERENCE = ") + len("window.PM12_REFERENCE = "):js.index("\n", js.index("window.PM12_REFERENCE = "))].rstrip(";"))["byCat"].items() for sub in meta.get("subgroups", [])}
    need(set(placement["subgroups"]) == ref_subgroups, "T50 placement: subgroups must cover exactly the declared reference subgroups")
    for cat, sid in placement["page_defaults"].items():
        need(sid in sections and sections[sid]["to"] in pages, f"T50 placement: page default for '{cat}' must be a page section")
    for move in placement.get("hand_moves", []):
        need(move["to_section"] in sections, f"T50 placement: hand move to unknown section '{move['to_section']}'")
        if move.get("section"):
            need(js.count(f"id: '{move['section']}', label:") == 1, f"T50 placement: hand section '{move['section']}' missing")
        for sid in move.get("ids", []):
            need(js.count(f"setting('{sid}',") == 1, f"T50 placement: hand id '{sid}' missing")
    for wid in placement.get("retire_workspaces", []):
        need(f"id:'{wid}'" in js or f"id: '{wid}'" in js, f"T50 placement: retired workspace '{wid}' does not exist")

    hand_rendered = set(HAND_CANONICAL_RE.findall(js))
    need(hand_rendered <= set(by_id), "T50 placement: a hand-rendered dotted id is not canonical: " + ", ".join(sorted(hand_rendered - set(by_id))))
    resolved, hits, problems = resolve_placement(placement, rows, hand_rendered)
    need(not problems, "T50 placement: " + "; ".join(problems[:6]))
    for index, rule in enumerate(placement.get("overrides", [])):
        need(hits[index] >= 1, f"T50 placement: rule #{index} ({rule.get('glob') or rule.get('ids')}) hits no id")
    need(len(resolved) == len(rows) and all(sid in resolved for sid in by_id), "T50 placement: not every id resolved exactly once")

    # no inline action row whose label trips the one-check rule outside Advanced
    offenders = []
    for sid, section_id in resolved.items():
        if not section_id:
            continue
        section = sections[section_id]
        if section.get("advanced") or section["to"] in pages:
            continue
        row = by_id[sid]
        if row.get("type") == "action" and CHECK_LABEL_RE.search(str(row.get("label", ""))):
            offenders.append(f"{sid} ({row['label']}) in {section_id}")
    need(not offenders, "T50 placement: check-labelled action rows placed inline: " + "; ".join(offenders))

    # census
    per_section = Counter(sid for sid in resolved.values() if sid)
    per_destination = Counter()
    per_manager_tab = {}
    advanced_rows = composed_rows = 0
    for section_id, count in per_section.items():
        section = sections[section_id]
        per_destination[section["to"]] += count
        if section.get("advanced"):
            advanced_rows += count
        if section.get("composed"):
            composed_rows += count
        if section["to"] in managers:
            per_manager_tab.setdefault(section["to"], Counter())[section.get("tab") or "main"] += count
    reference_pages = re.findall(r"workspace: '([a-z]+-reference)' \}", js)
    deleted_pages = [p for p in reference_pages if p not in pages]
    orphans = [row["id"] for row in rows if f"{row['cat']}.{row['sub']}" not in declared or f"{row['cat']}.{row['sub']}" not in placement["subgroups"]]
    fallback = sum(count for section_id, count in per_section.items() if section_id in set(placement["page_defaults"].values()))
    need(fallback == 0, f"T50 placement: {fallback} rows fell back to a page default")
    return {
        "version": placement.get("version"),
        "ids": len(rows),
        "hand_rendered": sorted(hand_rendered),
        "orphan_ids": sorted(orphans),
        "sections": len(sections),
        "sections_used": len(per_section),
        "rules": len(placement.get("overrides", [])),
        "rows_per_destination": dict(sorted(per_destination.items())),
        "rows_per_manager_tab": {mid: dict(sorted(tabs.items())) for mid, tabs in sorted(per_manager_tab.items())},
        "manager_rows": sum(count for to, count in per_destination.items() if to in managers),
        "page_rows": sum(count for to, count in per_destination.items() if to in pages) + len(hand_rendered),
        "advanced_rows": advanced_rows,
        "composed_rows": composed_rows,
        "fallback_rows": fallback,
        "retired_workspaces": placement.get("retire_workspaces", []),
        "deleted_reference_pages": deleted_pages,
        "surviving_pages": {pid: meta["label"] for pid, meta in pages.items()},
        "hand_moves": placement.get("hand_moves", []),
        "manager_files": file_of,
    }


def apply(doc: str, notes: dict, need) -> str:
    need(MARKER not in doc, "T50 is already applied")
    data = load_data()
    placement = load_placement()
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
    notes["placement"] = validate_placement(placement, js, need)

    # ---- data bands ---------------------------------------------------------
    js = _replace_band(js, "  const providers = [", "  const freeRoutes = [",
                       "  const providers = " + _js(data["providers"]) + ";\n\n", need, "providers")
    js = _replace_band(js, "    { id: 'free-community',", "  ];\n\n  const webRoutes = [", "", need, "free-community route removed")
    js = _replace_band(js, "    forges: [", "    repositories: [",
                       "    forges: " + _js(data["forges"]) + ",\n", need, "forges")
    if "events" in data:
        js = _replace_band(js, "    events: [", "    sounds: [",
                           "    events: " + _js(data["events"]) + ",\n", need, "events")
    js = _replace_band(js, "    sounds: [", "    packs: [",
                       "    sounds: " + _js(data["sounds"]) + ",\n", need, "sounds")
    for old, new in data.get("providerNameRenames", []):
        need(js.count(old) >= 1, "T50: provider name rename anchor missing: " + old)
        js = js.replace(old, new)
    for old, new in data.get("eventSoundRenames", []):
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

    # ---- wave S: reference row factory exported from the data IIFE -----------
    # The per-row body of buildReferenceWorkspaces becomes referenceRow(row) so the kit can
    # build rows for ids the reference pages dropped (the five orphan prefixes) or re-home.
    row_start, row_end = "            const control = refControlFor(row);\n", "          }).filter(Boolean)\n"
    need(js.count(row_start) == 1 and js.count(row_end) == 1, "T50: reference row body anchors drift")
    body = js[js.index(row_start):js.index(row_end)]
    js = _replace_band(js, row_start, row_end, "            return referenceRow(row);\n", need, "reference row body")
    js = _replace_once(js, "  const buildReferenceWorkspaces = () => {\n",
                       "  const referenceRow = (row) => {\n" + body + "  };\n  const buildReferenceWorkspaces = () => {\n",
                       need, "referenceRow factory")
    js = _replace_once(js, "    details, setting, domains, providers,", "    details, setting, referenceRow, domains, providers,", need, "referenceRow export")

    # ---- wave S: the two large walkers accept any workspace with sections -------
    js = _replace_once(js,
        "      if(workspace.type!=='settings')continue;\n      for(const section of workspace.sections||[])for(const setting of section.settings||[]){",
        "      if(workspace.type!=='settings'&&!Array.isArray(workspace.sections))continue;\n      for(const section of workspace.sections||[])for(const setting of section.settings||[]){",
        need, "allSettingsCatalog walker")
    js = _replace_once(js,
        "        if (workspace.type !== 'settings') continue;\n        for (const section of workspace.sections || []) {\n          for (const s of section.settings || []) {",
        "        if (workspace.type !== 'settings' && !Array.isArray(workspace.sections)) continue;\n        for (const section of workspace.sections || []) {\n          for (const s of section.settings || []) {",
        need, "buildSearchIndex walker")

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
        "placement_sha256": _sha(_read("placement.json")),
        "manager_files": [p.name for p in sorted((SRC / "managers").glob("*.js"))],
        "engine_before_sha256": _sha(before_js),
        "engine_after_sha256": _sha(js),
        "providers": [p["id"] for p in data["providers"]],
        "forges": [f["id"] for f in data["forges"]],
        "sounds": [s["id"] for s in data["sounds"]],
        "engine_anchors": ["reference row body", "referenceRow factory", "referenceRow export", "allSettingsCatalog walker", "buildSearchIndex walker"],
        "scope": "Settings engine (data fixtures, sound factory, reference row factory export, two widened walkers, appended pm51 module) and one head style block; no other script changed",
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
