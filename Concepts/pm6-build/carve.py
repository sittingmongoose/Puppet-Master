#!/usr/bin/env python3
"""carve.py — slice pm6-build/PMConcept6.working.html into parts/ per contracts/PARTS.md.

- Verifies every start marker occurs EXACTLY once (exceptions: part 02 `<style>` =
  first occurrence; part 30 `</body>` = last occurrence) and that markers are in order.
- Slices line-wise: a part's marker line starts that part; the part runs to the line
  before the next part's marker. Part 01 starts at line 1; part 30 runs to EOF.
- Part 28 (js-settings-data) is exactly 2 lines: the `<script id="pm4-settings-js">`
  line + the `window.PM_SETTINGS_DATA = …;` line. Part 29 starts on the next line.
- Creates empty NEW stub parts (10x-pm6-css-*, 29x-pm6-js-*) if missing (never
  overwrites a stub that has content).
- Emits manifest.json (assembly order + insertion rules), manifest.lock (per-part
  sha256 / line count / tag deltas), and checks/baseline_dup_ids.json.

Refuses to overwrite existing carved parts unless --force (protects Wave-1 edits).
"""
import argparse
import hashlib
import json
import re
import sys
from datetime import date
from pathlib import Path

HERE = Path(__file__).resolve().parent
WORKING = HERE / "PMConcept6.working.html"
PARTS_DIR = HERE / "parts"
CHECKS_DIR = HERE / "checks"

# (num, name, marker, mode, owner) — mode: unique | first | last | after-prev
CARVED = [
    ("01", "head-prelude",       None,                                               "start",  "theme-tokens"),
    ("02", "css-tokens",         "<style>",                                          "first",  "theme-tokens"),
    ("03", "css-glass-a",        "LIQUID GLASS multi-layer panels",                  "unique", "theme-glass"),
    ("04", "css-glass-b",        "Glass Dark: colored tint backgrounds + neon glow", "unique", "theme-glass"),
    ("05", "css-shell",          "* { box-sizing: border-box",                       "unique", "FROZEN->polish"),
    ("06", "css-components-a",   "Agent-Config 7-section layout",                    "unique", "FROZEN->polish"),
    ("07", "css-components-b",   "Inline diff line backgrounds",                     "unique", "FROZEN->polish"),
    ("08", "css-components-c",   "Browser Tab Content (workspace_preview",           "unique", "FROZEN->polish"),
    ("09", "css-bento-themes",   "NEW PANELS CSS",                                   "unique", "theme-retro-basic"),
    ("10", "css-settings",       'id="pm4-settings-css"',                            "unique", "settings"),
    ("11", "html-shell-open",    "</head>",                                          "unique", "shell-chrome"),
    ("12", "html-side-panels",   'id="panel-files"',                                 "unique", "side-panels"),
    ("13", "html-shell-mid",     '<div class="center-column">',                      "unique", "shell-chrome"),
    ("14", "page-dashboard",     'id="panel-dashboard"',                             "unique", "dashboard"),
    ("15", "page-projects",      'id="panel-projects"',                              "unique", "projects"),
    ("16", "page-wizard",        'id="panel-wizard"',                                "unique", "wizard"),
    ("17", "page-orchestrator",  'id="panel-orchestrator"',                          "unique", "orchestrator"),
    ("18", "page-usage",         'id="panel-usage"',                                 "unique", "usage"),
    ("19", "page-settings-shell",'id="panel-settings"',                              "unique", "settings"),
    ("20", "html-bottom-panel",  'id="terminalResizer"',                             "unique", "bottom-panel"),
    ("21", "html-chat-panel",    '<aside class="chat-panel',                         "unique", "chat"),
    ("22", "html-status-toast",  'id="pmToastStack"',                                "unique", "bottom-panel"),
    ("23", "html-floating-chat", 'class="floating-chat"',                            "unique", "chat"),
    ("24", "js-main",            'id="pixelGrid"',                                   "unique", "FROZEN->js-integration"),
    ("25", "js-terminal-demo",   "window.PM_TERMINAL_DEMO = {",                      "unique", "demo-engine"),
    ("26", "js-prd-annotations", "function showPRDMock",                             "unique", "FROZEN->js-integration"),
    ("27", "js-shimmer-filters", "Liquid Glass SVG Filters",                         "unique", "theme-glass"),
    ("28", "js-settings-data",   '<script id="pm4-settings-js">',                    "unique", "ASSEMBLER-INJECTED"),
    ("29", "js-settings-engine", None,                                               "after-prev", "settings"),
    ("30", "html-close",         "</body>",                                          "last",   "pipeline"),
]

CSS_STUBS = ["global", "dashboard", "projects", "wizard", "orchestrator",
             "usage", "chat", "bottom", "panels"]
JS_STUBS = ["globals", "demo-engine", "dashboard", "projects", "wizard",
            "orchestrator", "usage", "chat", "bottom", "panels"]

TAGS = ["div", "span", "style", "script", "template"]


def tag_deltas(text):
    out = {}
    for t in TAGS:
        opens = len(re.findall(r"<%s\b" % t, text))
        closes = len(re.findall(r"</%s\b" % t, text))
        out[t] = opens - closes
    return out


def sha256(data):
    return hashlib.sha256(data if isinstance(data, bytes) else data.encode("utf-8")).hexdigest()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true",
                    help="overwrite existing carved parts (stubs with content are never overwritten)")
    args = ap.parse_args()

    if not WORKING.exists():
        sys.exit(f"ERROR: {WORKING} not found (cp ../PMConcept4.html PMConcept6.working.html; python3 rename_vocab.py)")

    text = WORKING.read_text(encoding="utf-8")
    lines = text.splitlines(keepends=True)
    n = len(lines)
    print(f"carve.py — working copy: {n} lines, sha256 {sha256(text)[:16]}…")

    # ---- locate markers ----
    starts = {}  # num -> 0-based start index
    prev_idx = -1
    for num, name, marker, mode, _owner in CARVED:
        if mode == "start":
            starts[num] = 0
            prev_idx = 0
            continue
        if mode == "after-prev":
            # resolved after part 28 end is known (handled below)
            starts[num] = None
            continue
        hits = [i for i, ln in enumerate(lines) if marker in ln]
        if mode == "unique":
            if len(hits) != 1:
                sys.exit(f"ERROR: marker for part {num} ({marker!r}) occurs {len(hits)}x — expected exactly 1: lines {[h+1 for h in hits][:10]}")
            idx = hits[0]
        elif mode == "first":
            if not hits:
                sys.exit(f"ERROR: marker for part {num} ({marker!r}) not found")
            idx = hits[0]
        elif mode == "last":
            if not hits:
                sys.exit(f"ERROR: marker for part {num} ({marker!r}) not found")
            idx = hits[-1]
        if idx <= prev_idx and num != "01":
            sys.exit(f"ERROR: marker for part {num} at line {idx+1} is not after previous part start (line {prev_idx+1})")
        starts[num] = idx
        prev_idx = idx

    # part 28 is exactly 2 lines: <script id=pm4-settings-js> + data line; 29 follows
    i28 = starts["28"]
    data_line = lines[i28 + 1]
    if not re.match(r"^window\.PM_SETTINGS_DATA = \{.*\};\n?$", data_line):
        sys.exit("ERROR: line after pm4-settings-js open tag is not the PM_SETTINGS_DATA assignment")
    starts["29"] = i28 + 2
    if not (starts["28"] < starts["29"] <= starts["30"]):
        sys.exit("ERROR: part 28/29/30 ordering broken")

    # ---- slice ----
    PARTS_DIR.mkdir(exist_ok=True)
    order = [num for num, *_ in CARVED]
    ranges = {}
    for i, num in enumerate(order):
        a = starts[num]
        b = starts[order[i + 1]] if i + 1 < len(order) else n
        if num == "28":
            b = i28 + 2
        ranges[num] = (a, b)

    existing = sorted(p.name for p in PARTS_DIR.glob("[0-9][0-9]-*.part.html"))
    if existing and not args.force:
        sys.exit(f"ERROR: parts/ already contains {len(existing)} carved parts — re-carving would clobber Wave-1 edits. Use --force only for a from-scratch rebuild.")

    manifest = []
    lock_parts = {}
    files = {}

    def emit(fname, content, kind, entry_extra):
        path = PARTS_DIR / fname
        path.write_text(content, encoding="utf-8")
        files[fname] = content
        lc = content.count("\n") + (1 if content and not content.endswith("\n") else 0)
        lock_parts[fname] = {"sha256": sha256(content), "lines": lc,
                             "div_delta": tag_deltas(content)["div"],
                             "deltas": tag_deltas(content)}
        e = {"file": fname, "kind": kind}
        e.update(entry_extra)
        manifest.append(e)

    def stub(fname, kind, entry_extra):
        path = PARTS_DIR / fname
        if not path.exists():
            path.write_text("", encoding="utf-8")
        content = path.read_text(encoding="utf-8")
        files[fname] = content
        lock_parts[fname] = {"sha256": sha256(content),
                             "lines": content.count("\n") + (1 if content and not content.endswith("\n") else 0),
                             "div_delta": tag_deltas(content)["div"],
                             "deltas": tag_deltas(content)}
        e = {"file": fname, "kind": kind}
        e.update(entry_extra)
        manifest.append(e)

    meta = {num: (name, marker, mode, owner) for num, name, marker, mode, owner in CARVED}
    for num in order:
        name, marker, mode, owner = meta[num]
        a, b = ranges[num]
        content = "".join(lines[a:b])
        first = lines[a].rstrip("\n")
        if marker and marker not in first:
            sys.exit(f"ERROR: part {num} first line does not contain its marker")
        extra = {"name": name, "marker": marker, "marker_rule": mode, "owner": owner,
                 "carved_from_lines": [a + 1, b],
                 "inject": "regenerate-from-sidecar(sidecar/pm_settings_data.json)" if num == "28" else None}
        emit(f"{num}-{name}.part.html", content, "carved", extra)
        # insertion points for stubs
        if num == "10":
            for s in CSS_STUBS:
                stub(f"10x-pm6-css-{s}.part.html", "new-stub-css",
                     {"name": f"pm6-css-{s}", "marker": None, "marker_rule": "stub",
                      "owner": "theme-tokens" if s == "global" else s,
                      "insertion": "immediately before </head> (between parts 10 and 11); global FIRST, then listed order",
                      "expected_shape": f'<style id="pm6-css-{s}">…</style>'})
        if num == "29":
            for s in JS_STUBS:
                stub(f"29x-pm6-js-{s}.part.html", "new-stub-js",
                     {"name": f"pm6-js-{s}", "marker": None, "marker_rule": "stub",
                      "owner": {"globals": "demo-engine", "demo-engine": "demo-engine"}.get(s, s),
                      "insertion": "after part 29; globals FIRST, demo-engine SECOND, then listed order",
                      "expected_shape": f'<script id="pm6-js-{s}">…</script>'})

    # ---- verify reassembly is byte-identical ----
    reassembled = "".join(files[e["file"]] for e in manifest)
    ok = reassembled == text
    print(f"carve round-trip byte-identical (stubs empty): {ok}")
    if not ok:
        sys.exit("ERROR: carve round-trip failed")

    # ---- manifest.json ----
    man = {
        "version": 1,
        "generated": str(date.today()),
        "source": "PMConcept6.working.html",
        "working_sha256": sha256(text),
        "assembly": "concatenate parts in listed order; part 28-js-settings-data is regenerated from sidecar/pm_settings_data.json (minified, </ escaped as <\\/, wrapped as window.PM_SETTINGS_DATA = {...};). If the re-minified body's sha256 equals _meta.original_minified_sha256, the byte-original line from the part file is used (G0 round-trip).",
        "parts": manifest,
    }
    (HERE / "manifest.json").write_text(json.dumps(man, indent=1) + "\n", encoding="utf-8")

    # ---- manifest.lock ----
    glob_deltas = tag_deltas(text)
    lock = {
        "generated": str(date.today()),
        "working_sha256": sha256(text),
        "global": {"deltas": glob_deltas,
                   "body_open_count": len(re.findall(r"<body\b", text)),
                   "lines": n},
        "parts": lock_parts,
    }
    (HERE / "manifest.lock").write_text(json.dumps(lock, indent=1) + "\n", encoding="utf-8")

    # ---- baseline duplicate ids ----
    ids = {}
    for m in re.finditer(r'\bid="([^"]+)"', text):
        ids[m.group(1)] = ids.get(m.group(1), 0) + 1
    dups = {k: v for k, v in sorted(ids.items()) if v > 1}
    CHECKS_DIR.mkdir(exist_ok=True)
    (CHECKS_DIR / "baseline_dup_ids.json").write_text(json.dumps(dups, indent=1) + "\n", encoding="utf-8")

    print(f"parts written: {len(manifest)} ({sum(1 for e in manifest if e['kind']=='carved')} carved + {sum(1 for e in manifest if e['kind']!='carved')} stubs)")
    print(f"baseline duplicate ids: {len(dups)} -> checks/baseline_dup_ids.json")
    print("manifest.json + manifest.lock written")
    print("\n{:<34} {:>7} {:>10}".format("part", "lines", "div-delta"))
    for e in manifest:
        lp = lock_parts[e["file"]]
        print("{:<34} {:>7} {:>10}".format(e["file"].replace(".part.html", ""), lp["lines"], lp["div_delta"]))


if __name__ == "__main__":
    main()
