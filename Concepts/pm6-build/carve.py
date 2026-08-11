#!/usr/bin/env python3
"""carve.py — slice pm6-build/PMConcept6.working.html into parts/ per contracts/PARTS.md.

Inventory source of truth: manifest.json (the same list assemble.py concatenates).
Carve never falls back to a builtin stub list — if the manifest is missing or a
listed part file is absent when required, it hard-errors with a clear message.

- Verifies every start marker occurs EXACTLY once (exceptions: part 02 `<style>` =
  first occurrence; part 30 `</body>` = last occurrence) and that markers are in order.
- Slices line-wise: a part's marker line starts that part; the part runs to the line
  before the next part's marker. Part 01 starts at line 1; part 30 runs to EOF.
- Comment-ownership rule: a contiguous block comment immediately preceding a
  boundary-marker line belongs to the FOLLOWING part (it documents that part).
- Part 28 (js-settings-data) is assembler-injected from sidecar/pm_settings_data.json.
  Carve verifies that injecting the existing part reproduces the working slice, then
  keeps the existing part bytes (does not overwrite from the working slice).
- Stub parts (10x-pm6-css-*, 29x-pm6-js-*) are derived from manifest.json order;
  existing stub content is never overwritten. Missing stubs are created empty with
  an explicit notice.
- Emits/refreshes manifest.json (assembly order + insertion rules), manifest.lock
  (per-part sha256 / line count / tag deltas), and checks/baseline_dup_ids.json.

Refuses to overwrite existing carved parts unless --force (protects Wave edits).
"""
import argparse
import hashlib
import importlib.util
import json
import re
import sys
from datetime import date
from pathlib import Path

HERE = Path(__file__).resolve().parent
WORKING = HERE / "PMConcept6.working.html"
PARTS_DIR = HERE / "parts"
CHECKS_DIR = HERE / "checks"
MANIFEST_PATH = HERE / "manifest.json"

# Marker contract for carved parts — cross-checked against manifest.json carved
# entries (file / marker / marker_rule). mode: unique | first | last | after-prev | start
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

TAGS = ["div", "span", "style", "script", "template"]
HTML_TAGS = ["div", "span", "template"]
SCRIPT_BODY = re.compile(r"(<script\b[^>]*>)(.*?)(</script)", re.S | re.I)


def tag_deltas(text):
    stripped = SCRIPT_BODY.sub(r"\1\3", text)
    out = {}
    for t in TAGS:
        src = stripped if t in HTML_TAGS else text
        opens = len(re.findall(r"<%s\b" % t, src))
        closes = len(re.findall(r"</%s\b" % t, src))
        out[t] = opens - closes
    return out


def sha256(data):
    return hashlib.sha256(data if isinstance(data, bytes) else data.encode("utf-8")).hexdigest()


def load_assemble():
    """Import assemble.py from the same directory (provides regen_settings_part)."""
    path = HERE / "assemble.py"
    if not path.exists():
        sys.exit(f"ERROR: {path} not found (needed for assembler-injected part 28)")
    spec = importlib.util.spec_from_file_location("pm6_assemble", path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def load_manifest():
    """Load manifest.json — single inventory source shared with assemble.py.
    Never falls back to a builtin stub list."""
    if not MANIFEST_PATH.exists():
        sys.exit(
            f"ERROR: {MANIFEST_PATH.name} is missing. Carve derives its part inventory "
            "from the manifest (same list assemble.py concatenates) and will not "
            "fall back to a builtin stub list. Restore or recreate the manifest first."
        )
    man = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    if not isinstance(man.get("parts"), list) or not man["parts"]:
        sys.exit("ERROR: manifest.json has no parts list")
    return man


def cross_check_carved(man_parts):
    """Ensure every CARVED contract entry matches a carved manifest entry."""
    by_file = {}
    for e in man_parts:
        if e.get("kind") == "carved":
            by_file[e["file"]] = e
    for num, name, marker, mode, owner in CARVED:
        fname = f"{num}-{name}.part.html"
        if fname not in by_file:
            sys.exit(f"ERROR: carved contract part {fname} missing from manifest.json")
        e = by_file[fname]
        if e.get("marker") != marker:
            sys.exit(
                f"ERROR: manifest marker for {fname} is {e.get('marker')!r}, "
                f"carve contract expects {marker!r}"
            )
        if e.get("marker_rule") != mode:
            sys.exit(
                f"ERROR: manifest marker_rule for {fname} is {e.get('marker_rule')!r}, "
                f"carve contract expects {mode!r}"
            )
    extra = sorted(set(by_file) - {f"{n}-{nm}.part.html" for n, nm, *_ in CARVED})
    if extra:
        sys.exit(f"ERROR: manifest has carved parts not in carve contract: {extra}")


def absorb_leading_comment(starts, carved_files, lines):
    """Comment-ownership rule.

    A contiguous block comment immediately preceding a boundary-marker line
    belongs to the FOLLOWING part — the comment documents the part it introduces.
    Walk back from a marker whose previous line ends with '*/' to the line that
    opens the block with '/*', floored at the previous carved part's start.
    Skips after-prev parts (their start is fixed by the part-28 two-line rule).
    """
    for k, fname in enumerate(carved_files):
        i = starts[fname]
        if i in (0, None):
            continue
        # after-prev (part 29) is resolved from part 28; do not pull comments into it
        entry_mode = None
        for num, name, _marker, mode, _owner in CARVED:
            if f"{num}-{name}.part.html" == fname:
                entry_mode = mode
                break
        if entry_mode == "after-prev":
            continue
        if i <= 0 or not lines[i - 1].rstrip().endswith("*/"):
            continue
        floor = 0
        if k > 0:
            prev = starts[carved_files[k - 1]]
            if prev is not None:
                floor = prev
        j = i - 1
        while j > floor and "/*" not in lines[j]:
            j -= 1
        if "/*" not in lines[j]:
            continue
        if j != i:
            print(f"comment-ownership: {fname} start line {i + 1} -> {j + 1}")
            starts[fname] = j


def stub_groups(man_parts):
    """Map each carved file to the ordered stub entries that follow it in the
    manifest until the next carved part (or EOF)."""
    groups = {}
    cur = None
    for e in man_parts:
        if e.get("kind") == "carved":
            cur = e["file"]
            groups.setdefault(cur, [])
        else:
            if cur is None:
                sys.exit(f"ERROR: stub {e.get('file')} appears before any carved part")
            groups[cur].append(e)
    return groups


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true",
                    help="overwrite existing carved parts (stubs with content are never overwritten)")
    args = ap.parse_args()

    if not WORKING.exists():
        sys.exit(f"ERROR: {WORKING} not found (cp ../PMConcept4.html PMConcept6.working.html; python3 rename_vocab.py)")

    man_in = load_manifest()
    man_parts = man_in["parts"]
    cross_check_carved(man_parts)

    asm = load_assemble()

    text = WORKING.read_text(encoding="utf-8")
    lines = text.splitlines(keepends=True)
    n = len(lines)
    print(f"carve.py — working copy: {n} lines, sha256 {sha256(text)[:16]}…")
    print(f"inventory: manifest.json ({len(man_parts)} parts)")

    carved_entries = [e for e in man_parts if e.get("kind") == "carved"]
    carved_files = [e["file"] for e in carved_entries]
    groups = stub_groups(man_parts)

    # ---- locate markers (keyed by filename) ----
    starts = {}  # file -> 0-based start index
    prev_idx = -1
    for num, name, marker, mode, _owner in CARVED:
        fname = f"{num}-{name}.part.html"
        if mode == "start":
            starts[fname] = 0
            prev_idx = 0
            continue
        if mode == "after-prev":
            starts[fname] = None
            continue
        hits = [i for i, ln in enumerate(lines) if marker in ln]
        if mode == "unique":
            if len(hits) != 1:
                sys.exit(
                    f"ERROR: marker for {fname} ({marker!r}) occurs {len(hits)}x — "
                    f"expected exactly 1: lines {[h + 1 for h in hits][:10]}"
                )
            idx = hits[0]
        elif mode == "first":
            if not hits:
                sys.exit(f"ERROR: marker for {fname} ({marker!r}) not found")
            idx = hits[0]
        elif mode == "last":
            if not hits:
                sys.exit(f"ERROR: marker for {fname} ({marker!r}) not found")
            idx = hits[-1]
        else:
            sys.exit(f"ERROR: unknown marker_rule {mode!r} for {fname}")
        if idx <= prev_idx:
            sys.exit(
                f"ERROR: marker for {fname} at line {idx + 1} is not after "
                f"previous part start (line {prev_idx + 1})"
            )
        starts[fname] = idx
        prev_idx = idx

    # part 28 is exactly 2 lines: <script id=pm4-settings-js> + data line; 29 follows
    f28 = "28-js-settings-data.part.html"
    f29 = "29-js-settings-engine.part.html"
    f30 = "30-html-close.part.html"
    i28 = starts[f28]
    data_line = lines[i28 + 1]
    if not re.match(r"^window\.PM_SETTINGS_DATA = \{.*\};\n?$", data_line):
        sys.exit("ERROR: line after pm4-settings-js open tag is not the PM_SETTINGS_DATA assignment")
    starts[f29] = i28 + 2
    if not (starts[f28] < starts[f29] <= starts[f30]):
        sys.exit("ERROR: part 28/29/30 ordering broken")

    # Comment-ownership adjust (moves e.g. the W2 block into part 26)
    absorb_leading_comment(starts, carved_files, lines)

    # ---- force guard ----
    existing = sorted(p.name for p in PARTS_DIR.glob("[0-9][0-9]-*.part.html"))
    if existing and not args.force:
        sys.exit(
            f"ERROR: parts/ already contains {len(existing)} carved parts — "
            "re-carving would clobber Wave edits. Use --force only inside a "
            "scratch copy of pm6-build/ (never against the repo parts/)."
        )

    PARTS_DIR.mkdir(exist_ok=True)

    # ---- load / preserve stubs first (needed to excise them from parent slices) ----
    stub_contents = {}
    for e in man_parts:
        if e.get("kind") == "carved":
            continue
        fname = e["file"]
        path = PARTS_DIR / fname
        if not path.exists():
            path.write_text("", encoding="utf-8")
            print(f"NOTICE: created missing stub empty: {fname}")
        stub_contents[fname] = path.read_text(encoding="utf-8")

    # ---- raw carved slices (to next carved marker), then strip trailing stub group ----
    raw_ranges = {}
    for i, fname in enumerate(carved_files):
        a = starts[fname]
        if fname == f28:
            b = i28 + 2
        elif i + 1 < len(carved_files):
            b = starts[carved_files[i + 1]]
        else:
            b = n
        raw_ranges[fname] = (a, b)

    files = {}
    lock_parts = {}
    out_manifest = []

    def record(fname, content, entry):
        files[fname] = content
        lc = content.count("\n") + (1 if content and not content.endswith("\n") else 0)
        lock_parts[fname] = {
            "sha256": sha256(content),
            "lines": lc,
            "div_delta": tag_deltas(content)["div"],
            "deltas": tag_deltas(content),
        }
        out_manifest.append(entry)

    # Walk manifest order so output matches assemble's concatenation order.
    for e in man_parts:
        fname = e["file"]
        if e.get("kind") != "carved":
            # Echo stub metadata from the input manifest (single source of truth).
            content = stub_contents[fname]
            # Never overwrite stub content on disk — already preserved / created above.
            entry = {
                "file": fname,
                "kind": e["kind"],
                "name": e.get("name"),
                "marker": e.get("marker"),
                "marker_rule": e.get("marker_rule", "stub"),
                "owner": e.get("owner"),
                "insertion": e.get("insertion"),
                "expected_shape": e.get("expected_shape"),
            }
            record(fname, content, entry)
            continue

        a, b_raw = raw_ranges[fname]
        content = "".join(lines[a:b_raw])

        # Stub-region excision: a carved part's raw slice runs to the next carved
        # marker, so it currently swallows the stub blocks assembled after it.
        # Strip the exact concatenation of those stub contents (manifest order).
        trailing = "".join(stub_contents[s["file"]] for s in groups.get(fname, []))
        if trailing:
            if not content.endswith(trailing):
                sys.exit(
                    f"ERROR: carved slice for {fname} does not end with its "
                    f"manifest stub group ({len(groups[fname])} stubs, "
                    f"{len(trailing)} bytes). Part-boundary markers or stub "
                    "contents have drifted from the assembled working copy."
                )
            content = content[: len(content) - len(trailing)]

        # Assembler-injected part 28: keep existing part bytes; verify injection
        # of those bytes reproduces the working-copy slice.
        if e.get("inject") or fname == f28:
            path = PARTS_DIR / fname
            if not path.exists():
                sys.exit(
                    f"ERROR: assembler-injected part {fname} is missing from parts/. "
                    "Cannot invent its byte-original; restore it before carving."
                )
            existing_content = path.read_text(encoding="utf-8")
            injected = asm.regen_settings_part(existing_content)
            if injected != content:
                sys.exit(
                    f"ERROR: injecting existing {fname} via assemble.regen_settings_part "
                    "does not reproduce the working-copy slice. Sidecar / part / working "
                    "have drifted in a way carve cannot resolve without changing "
                    "assemble.py or the part file (both out of scope)."
                )
            content = existing_content
            print(f"assembler-injected: kept existing bytes for {fname}")
        else:
            marker = e.get("marker")
            # After comment-ownership, the first line may be a comment opener.
            # Require the marker somewhere inside this part's (pre-stub) slice.
            if marker and marker not in content:
                sys.exit(f"ERROR: part {fname} slice does not contain its marker {marker!r}")
            (PARTS_DIR / fname).write_text(content, encoding="utf-8")

        # carved_from_lines: [1-based start, exclusive end index] — same convention
        # as the original carve (lines[a:b] stored as [a+1, b]).
        n_lines = content.count("\n") + (1 if content and not content.endswith("\n") else 0)
        carved_end = a + n_lines

        entry = {
            "file": fname,
            "kind": "carved",
            "name": e.get("name"),
            "marker": e.get("marker"),
            "marker_rule": e.get("marker_rule"),
            "owner": e.get("owner"),
            "carved_from_lines": [a + 1, carved_end],
            "inject": e.get("inject"),
        }
        if fname == f28 and not entry["inject"]:
            entry["inject"] = "regenerate-from-sidecar(sidecar/pm_settings_data.json)"
        record(fname, content, entry)

    # ---- verify reassembly is byte-identical (apply part-28 injection like assemble) ----
    chunks = []
    for e in out_manifest:
        content = files[e["file"]]
        if e.get("inject") or e["file"] == f28:
            content = asm.regen_settings_part(content)
        chunks.append(content)
    reassembled = "".join(chunks)
    ok = reassembled == text
    print(f"carve round-trip byte-identical (with part-28 injection): {ok}")
    if not ok:
        # Helpful first-diff offset for diagnosis
        for i, (a, b) in enumerate(zip(reassembled, text)):
            if a != b:
                print(f"first char diff at {i}")
                print("reassembled:", repr(reassembled[max(0, i - 40): i + 40]))
                print("working:    ", repr(text[max(0, i - 40): i + 40]))
                break
        else:
            print(f"length mismatch: reassembled={len(reassembled)} working={len(text)}")
        sys.exit("ERROR: carve round-trip failed")

    # ---- manifest.json (preserve assembly blurb; refresh working sha + parts) ----
    man = {
        "version": man_in.get("version", 1),
        "generated": str(date.today()),
        "source": man_in.get("source", "PMConcept6.working.html"),
        "working_sha256": sha256(text),
        "assembly": man_in.get(
            "assembly",
            "concatenate parts in listed order; part 28-js-settings-data is regenerated "
            "from sidecar/pm_settings_data.json (minified, </ escaped as <\\/, wrapped as "
            "window.PM_SETTINGS_DATA = {...};). If the re-minified body's sha256 equals "
            "_meta.original_minified_sha256, the byte-original line from the part file is "
            "used (G0 round-trip).",
        ),
        "parts": out_manifest,
    }
    MANIFEST_PATH.write_text(json.dumps(man, indent=1) + "\n", encoding="utf-8")

    # ---- manifest.lock ----
    glob_deltas = tag_deltas(text)
    lock = {
        "generated": str(date.today()),
        "working_sha256": sha256(text),
        "global": {
            "deltas": glob_deltas,
            "body_open_count": len(re.findall(r"<body\b", text)),
            "lines": n,
        },
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

    n_carved = sum(1 for e in out_manifest if e["kind"] == "carved")
    n_stubs = len(out_manifest) - n_carved
    print(f"parts written: {len(out_manifest)} ({n_carved} carved + {n_stubs} stubs)")
    print(f"baseline duplicate ids: {len(dups)} -> checks/baseline_dup_ids.json")
    print("manifest.json + manifest.lock written")
    print("\n{:<34} {:>7} {:>10}".format("part", "lines", "div-delta"))
    for e in out_manifest:
        lp = lock_parts[e["file"]]
        print("{:<34} {:>7} {:>10}".format(e["file"].replace(".part.html", ""), lp["lines"], lp["div_delta"]))


if __name__ == "__main__":
    main()
