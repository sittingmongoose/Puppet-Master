#!/usr/bin/env python3
"""Project the canonical Settings inventory into the concept data module.

    python3 tools/gen-inventory.py            # writes shared2/pm2-inventory.js
    python3 tools/gen-inventory.py --check    # verifies the emitted file is current

Source (READ ONLY, never edited by this script):

    Plans/settings_inventory.json   pm.settings_inventory.v1, 828 records, 12 categories

The 2026-08-18 packet requires the seven new concepts to index and route the ACTUAL
product inventory rather than a hand-authored fixture, so this script is the single
provenance path from canon into `shared2/pm2-inventory.js`. Three projections happen
here and nowhere else:

1.  Legacy `scope` metadata (`global`, `run`, `persona`, `account`, `provider`) is
    recorded as `legacyScope` for the candidate impact registers and is NEVER a
    user-facing editing scope. Every editable record applies to the current Project.

2.  Each canonical subgroup is cut into readable sections of three to eight adjacent
    related rows, because a 75-row page is not a readable page. Section identity is
    derived from the record ids themselves, so it is stable across regenerations and
    is not an invented taxonomy layered on top of canon.

3.  A deterministic demo state is attached to every row (seeded from the record id,
    never random) so all seven concepts show the same realistic mix of default,
    changed, recommended, automatic, not-configured, managed and unavailable rows,
    and so a screenshot taken today reproduces exactly tomorrow.

Nothing here mutates canon; `--check` is what CI-style verification would call.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
MODEL_FOLDER = HERE.parent
REPO = MODEL_FOLDER.parents[2]
SOURCE = REPO / "Plans" / "settings_inventory.json"
TARGET = MODEL_FOLDER / "shared2" / "pm2-inventory.js"

# --------------------------------------------------------------------------- sections

# A canonical subgroup can hold seventy-five records. The packet's density rule asks
# for roughly four to eight related settings before the next heading, so each page is
# cut into adjacent sections and each section is named from the words its own rows
# already use. Nothing invents a topic: a section either finds a subject its members
# genuinely share, or it falls back to naming the page it belongs to.

STOP = set("""a an and or the to of for in on at by with from this that it its is are be as
when how much default defaults mode modes enable enabled disable show hide auto max min
custom use allow policy setting settings set new only per level type behavior behaviour
option options value values things them you your do does can will what where which who
other more""".split())

# Tokens whose plain title-casing would read as jargon or would lose an acronym.
DISPLAY = {
    "api": "API",
    "cli": "Command line",
    "dockerhub": "Docker Hub",
    "eli5": "Plain-language explanations",
    "github": "GitHub",
    "gpu": "Graphics acceleration",
    "k8s": "Kubernetes",
    "key": "Keys and tokens",
    "keys": "Keys and tokens",
    "lsp": "Language server",
    "mcp": "MCP servers",
    "ocr": "Text recognition",
    "opencode": "OpenCode",
    "prd": "Requirements builder",
    "sign": "Sign-in",
    "sso": "Single sign-on",
    "ssh": "SSH hosts",
    "tls": "Certificates",
    "tts": "Speech",
    "ui": "Interface",
    "unraid": "Unraid",
    "vram": "Video memory",
    "wsl": "Windows Subsystem for Linux",
    "xml": "Template files",
}

MIN_SECTION = 4
MAX_SECTION = 8

# Used when a section has no subject of its own; each page walks down the list so
# two headings on one page never read identically.
QUALIFIER = ["More", "Further", "Additional", "Other", "Remaining"]


def head(word: str) -> str:
    return DISPLAY.get(word, word[:1].upper() + word[1:])


def tail(word: str) -> str:
    shown = DISPLAY.get(word)
    return shown.lower() if shown else word.lower()


def label_words(text: str) -> list:
    return [w for w in re.split(r"[^A-Za-z0-9]+", text.lower()) if len(w) > 2 and w not in STOP]


def id_words(setting_id: str) -> list:
    name = setting_id.split(".", 2)[2]
    return [w for w in re.split(r"[-_]", name) if len(w) > 2 and w not in STOP]


def cut_sections(page_id: str, page_title: str, rows: list) -> list:
    """Cut one canonical subgroup into adjacent sections of four to eight rows.

    Canonical file order already groups related records, so the only question is
    where to break. A break is taken when the next record shares no word with the
    previous one and the open section is already big enough to stand alone.
    """
    chunks: list = []
    current: list = []
    for row in rows:
        if current:
            unrelated = not (set(id_words(current[-1]["id"])) & set(id_words(row["id"])))
            if len(current) >= MAX_SECTION or (unrelated and len(current) >= MIN_SECTION):
                chunks.append(current)
                current = []
        current.append(row)
    if current:
        # A trailing scrap joins the section above it rather than becoming a heading
        # with two rows under it.
        if chunks and len(current) < 3:
            chunks[-1].extend(current)
        else:
            chunks.append(current)

    fallback = page_title.lower()
    used = set()
    spare = 0
    out = []
    for i, chunk in enumerate(chunks, start=1):
        title = None
        # Strongest shared subject first, then a weaker one, then the page itself.
        for candidate in (section_title(chunk), section_title(chunk, relaxed=True)):
            if candidate and candidate.lower() not in used:
                title = candidate
                break
        if title:
            used.add(title.lower())
        else:
            title = page_title if i == 1 else "%s %s" % (QUALIFIER[min(spare, len(QUALIFIER) - 1)], fallback)
            spare += 1
        out.append({
            "id": "%s.s%02d" % (page_id, i),
            "title": title,
            "order": i,
            "items": chunk,
        })
    return out


def section_title(chunk: list, relaxed: bool = False):
    """The subject the rows of this section actually share, or None.

    `relaxed` lowers the bar to any word two rows have in common, which is only
    consulted when the strong subject was already claimed by an earlier section
    on the same page.
    """
    unigram: dict = {}
    bigram: dict = {}
    for row in chunk:
        words = label_words(row["label"])
        tokens = id_words(row["id"])
        # Sorted, because a set's iteration order is not stable between processes and
        # this file must regenerate byte-identically.
        for w in sorted(set(words + tokens)):
            unigram[w] = unigram.get(w, 0) + 1
        for pair in list(zip(words, words[1:])) + list(zip(tokens, tokens[1:])):
            bigram[pair] = bigram.get(pair, 0) + 1

    need = 2 if relaxed else max(2, (len(chunk) + 1) // 2)
    # A two-word subject beats a one-word subject at the same frequency; ties below
    # that are broken alphabetically so the outcome never depends on dict order.
    candidates = []
    for pair, count in bigram.items():
        if count >= need:
            candidates.append((count + 0.5, head(pair[0]) + " " + tail(pair[1])))
    for word, count in unigram.items():
        if count >= need:
            candidates.append((float(count), head(word)))
    if not candidates:
        return None
    candidates.sort(key=lambda c: (-c[0], len(c[1]), c[1]))
    return candidates[0][1]


# ----------------------------------------------------------------------- demo state

def digest(text: str) -> int:
    return int(hashlib.sha1(text.encode("utf-8")).hexdigest()[:8], 16)


# The row-state mix the packet asks for, minus every inheritance state: a Project's
# settings do not inherit from anywhere in this design. Weights are out of 1000.
STATE_MIX = [
    ("default", 604),
    ("custom", 198),
    ("recommended", 48),
    ("auto", 45),
    ("notConfigured", 47),
    ("managed", 32),
    ("unavailable", 26),
]

CHANGED_WHEN = [
    "2 hours ago", "yesterday", "3 days ago", "last week", "2 weeks ago",
    "on 4 August", "on 28 July", "this morning",
]

MANAGED_BY = [
    "Workspace policy", "Host policy", "Security baseline", "Installation owner",
]

UNAVAILABLE_WHY = [
    "This host does not provide the capability.",
    "The feature needs a provider that is not connected.",
    "The required tool is not installed for this environment.",
    "Not supported on this platform.",
]


def default_value(rec: dict):
    """The canonical default, coerced to something a control can hold."""
    value = rec.get("default")
    kind = rec.get("type")
    if value is None:
        if kind == "toggle":
            return False
        if kind in ("list", "multiselect", "keyvalue"):
            return []
        if kind == "number" or kind == "slider":
            return 0
        return ""
    if kind == "toggle" and isinstance(value, str):
        return value.strip().lower() in ("on", "true", "yes", "enabled")
    return value


def alternate_value(rec: dict, seed: int):
    """A different-from-default value, so a `Changed` row really did change."""
    kind = rec.get("type")
    base = default_value(rec)
    options = rec.get("options") or []
    if kind == "toggle":
        return not bool(base)
    if options:
        pool = [o for o in options if o != base]
        if pool:
            return pool[seed % len(pool)]
        return base
    if kind in ("number", "slider"):
        try:
            n = float(base)
        except (TypeError, ValueError):
            n = 0.0
        step = [2, 5, 10, 30, 60][seed % 5]
        out = n + step
        return int(out) if float(out).is_integer() else round(out, 2)
    if kind in ("list", "multiselect", "keyvalue"):
        return base
    if isinstance(base, str) and base:
        return base
    return base


def demo_state(rec: dict) -> dict:
    seed = digest(rec["id"])
    roll = seed % 1000
    running = 0
    source = "default"
    for name, weight in STATE_MIX:
        running += weight
        if roll < running:
            source = name
            break

    kind = rec.get("type")
    # An action row has no value to change; it is either available or it is not.
    if kind == "action" and source in ("custom", "recommended", "auto"):
        source = "default"
    # A record with no options cannot honestly be shown as "Recommended: X".
    if source == "recommended" and not rec.get("recommended"):
        source = "custom"

    base = default_value(rec)
    state: dict = {
        "source": source,
        "value": base,
        "defaultValue": base,
        "isDefault": True,
        "restart": "required" if "restart" in (rec.get("badges") or []) else "none",
    }

    if source == "custom":
        state["value"] = alternate_value(rec, seed >> 4)
        state["isDefault"] = state["value"] == base
        if not state["isDefault"]:
            state["changedAt"] = CHANGED_WHEN[(seed >> 8) % len(CHANGED_WHEN)]
        else:
            state["source"] = "default"
    elif source == "recommended":
        state["value"] = rec.get("recommended")
        state["isDefault"] = state["value"] == base
    elif source == "auto":
        state["autoNote"] = "Chosen automatically from what this host reports."
    elif source == "notConfigured":
        state["value"] = "" if kind in ("text", "path", "select", "radio") else base
        state["setupLabel"] = "Set up"
    elif source == "managed":
        state["managedBy"] = MANAGED_BY[(seed >> 12) % len(MANAGED_BY)]
        state["managedNote"] = "Set by %s. Details explain where this came from." % state["managedBy"]
    elif source == "unavailable":
        state["reason"] = UNAVAILABLE_WHY[(seed >> 16) % len(UNAVAILABLE_WHY)]

    return state


def exposure_of(rec: dict) -> str:
    ident = rec["id"]
    if re.search(r"(debug|trace|diagnostic|verbos|telemetry|log-level)", ident):
        return "diagnostic"
    if rec.get("tier") == "simple":
        return "standard"
    if re.search(r"(experimental|unsafe|override|raw|internal|force)", ident):
        return "expert"
    return "advanced"


# --------------------------------------------------------------------------- emit

def build() -> dict:
    canon = json.loads(SOURCE.read_text())
    by_page: dict[str, list] = {}
    for rec in canon["settings"]:
        cat, sub, _ = rec["id"].split(".", 2)
        by_page.setdefault("%s.%s" % (cat, sub), []).append(rec)

    domains = []
    settings = []
    section_index = []
    for cat in canon["categories"]:
        pages = []
        for sub in cat["subgroups"]:
            page_id = "%s.%s" % (cat["id"], sub["id"])
            rows = by_page.get(page_id, [])
            sections = cut_sections(page_id, sub["title"], rows)
            page_sections = []
            for sec in sections:
                ids = []
                for rec in sec["items"]:
                    ids.append(rec["id"])
                    settings.append({
                        "id": rec["id"],
                        "label": rec["label"],
                        "desc": rec["desc"],
                        "kind": rec["type"],
                        "options": rec.get("options") or [],
                        "default": default_value(rec),
                        "recommended": rec.get("recommended"),
                        "tier": rec.get("tier"),
                        "curated": bool(rec.get("curated")),
                        "badges": rec.get("badges") or [],
                        "related": rec.get("related_features") or [],
                        "search": rec.get("search") or [],
                        "domainId": cat["id"],
                        "pageId": page_id,
                        "sectionId": sec["id"],
                        "exposure": exposure_of(rec),
                        # Legacy metadata, reported never rendered. See module header.
                        "legacyScope": rec.get("scope") or [],
                        "state": demo_state(rec),
                    })
                page_sections.append({
                    "id": sec["id"], "title": sec["title"], "order": sec["order"],
                    "count": len(ids),
                })
                section_index.append({"id": sec["id"], "pageId": page_id, "title": sec["title"]})
            pages.append({
                "id": page_id,
                "domainId": cat["id"],
                "title": sub["title"],
                "summary": sub["description"],
                "count": len(rows),
                "sections": page_sections,
            })
        domains.append({
            "id": cat["id"],
            "title": cat["title"],
            "pages": pages,
            "count": sum(p["count"] for p in pages),
        })

    return {
        "schema": "pm2.inventory.projection.v1",
        "source": "Plans/settings_inventory.json",
        "sourceSchema": canon.get("schema_id"),
        "sourceVersion": canon.get("schema_version"),
        "sourceGenerated": canon.get("generated_at_utc"),
        "provenance": "canonical-inventory",
        "settingsCount": len(settings),
        "domainCount": len(domains),
        "pageCount": sum(len(d["pages"]) for d in domains),
        "sectionCount": len(section_index),
        "domains": domains,
        "settings": settings,
    }


BANNER = """/* Opus 5 — the canonical Settings inventory, projected for concepts 05-11.
 *
 * GENERATED FILE. Do not hand-edit. Regenerate with:
 *     python3 tools/gen-inventory.py
 *
 * Source: Plans/settings_inventory.json (%(sourceSchema)s %(sourceVersion)s,
 * generated %(sourceGenerated)s) — %(settingsCount)d settings across %(domainCount)d
 * categories, cut into %(pageCount)d pages and %(sectionCount)d readable sections.
 *
 * The 2026-08-18 packet requires the new concepts to index and route the real
 * product inventory, so this is the whole inventory, not a sample of it and not a
 * generated stand-in. `shared2/pm2-scale.js` carries the separate synthetic volume
 * used for performance evidence; nothing in this file is synthetic.
 *
 * Three projections are applied by the generator and are documented in its header:
 * legacy `scope` metadata is recorded as `legacyScope` and is never an editing
 * scope; each subgroup is cut into three-to-eight-row sections; and every row
 * carries a deterministic demo state seeded from its own id.
 */
"""


def render(payload: dict) -> str:
    body = json.dumps(payload, ensure_ascii=False, separators=(",", ":"), sort_keys=False)
    return (BANNER % payload) + "(function () {\n  \"use strict\";\n  window.PM2Inventory = " + body + ";\n})();\n"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="verify the emitted module is current")
    args = ap.parse_args()

    text = render(build())
    if args.check:
        if not TARGET.exists():
            print("MISSING %s" % TARGET, file=sys.stderr)
            return 1
        current = TARGET.read_text()
        if current != text:
            print("STALE %s — rerun tools/gen-inventory.py" % TARGET, file=sys.stderr)
            return 1
        print("current: %s" % TARGET.name)
        return 0

    TARGET.parent.mkdir(parents=True, exist_ok=True)
    TARGET.write_text(text)
    print("wrote %s (%d bytes)" % (TARGET, len(text)))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
