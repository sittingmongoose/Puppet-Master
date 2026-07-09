#!/usr/bin/env python3
"""check_hooks.py — every MUST-EXIST hook in contracts/HOOKS.md appears in the
assembled HTML (id hooks: count must equal the baseline count, normally exactly
once; selector hooks: probe token present); every inline on*= handler function
symbol is defined in some <script>. Exit 0 = pass."""
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
BUILD = HERE.parent

BUILTINS = {"alert", "confirm", "prompt", "open", "setTimeout", "clearTimeout",
            "setInterval", "clearInterval", "requestAnimationFrame", "parseInt",
            "parseFloat", "encodeURIComponent", "decodeURIComponent", "String",
            "Number", "Boolean", "Date", "Array", "Object", "getComputedStyle",
            "scrollTo", "print", "if", "for", "while", "switch", "return",
            "function", "typeof", "new", "catch"}


def main():
    assembled = Path(sys.argv[1]) if len(sys.argv) > 1 else BUILD / "PMConcept6.assembled.html"
    hooks_md = (BUILD / "contracts" / "HOOKS.md").read_text(encoding="utf-8")
    text = assembled.read_text(encoding="utf-8")
    try:
        baseline_dups = json.loads((HERE / "baseline_dup_ids.json").read_text(encoding="utf-8"))
    except FileNotFoundError:
        baseline_dups = {}

    id_counts = {}
    for m in re.finditer(r'\bid="([^"]+)"', text):
        id_counts[m.group(1)] = id_counts.get(m.group(1), 0) + 1

    fails = []

    # ---- collect MUST-EXIST hooks from HOOKS.md ----
    must_ids = set()
    must_probes = set()  # (probe_kind, token) for selector hooks
    section = None
    for ln in hooks_md.split("\n"):
        if ln.startswith("## "):
            section = ln[3:4]
            continue
        if not ln.startswith("|") or ln.startswith("|--") or "| id |" in ln or "| selector |" in ln:
            continue
        cells = [c.strip() for c in ln.strip("|").split("|")]
        if section == "A":
            if "CLAIMABLE" in ln:
                continue  # optional hooks — enforced only if present (below)
            for m in re.finditer(r"`#([^`]+)`", cells[0]):
                must_ids.add(m.group(1))
        elif section == "B" and len(cells) >= 6 and cells[5] == "MUST-EXIST":
            sel = cells[0].strip("`")
            ids = re.findall(r"#([\w-]+)", sel)
            if cells[1] == "byId":
                must_ids.add(sel.lstrip("#"))
            elif ids:
                must_ids.update(ids)
            else:
                cm = re.search(r"\.([\w-]+)", sel) or re.search(r"\[([\w-]+)", sel)
                if cm:
                    must_probes.add(cm.group(1))
        elif section == "D" and len(cells) >= 4 and cells[3] == "MUST-EXIST":
            m = re.search(r"`#([\w-]+)`", cells[0])
            if m:
                must_ids.add(m.group(1))

    for i in sorted(must_ids):
        want = baseline_dups.get(i, 1)
        got = id_counts.get(i, 0)
        if got != want:
            fails.append(f'MUST-EXIST id "{i}": found x{got}, want x{want}')

    # CLAIMABLE hooks: if present, must be unique
    for i in ("pmSetTermFont", "pmSetTermLH"):
        if id_counts.get(i, 0) > 1:
            fails.append(f'claimable id "{i}" duplicated x{id_counts[i]}')

    for tok in sorted(must_probes):
        if not re.search(r'class="[^"]*\b%s\b' % re.escape(tok), text) and \
           (tok + "=") not in text and ("'" + tok) not in text and ('"' + tok) not in text:
            fails.append(f'MUST-EXIST selector token "{tok}" not found anywhere in assembled')

    # ---- inline handler symbols defined in some script ----
    scripts = "\n".join(m.group(1) for m in
                        re.finditer(r"<script\b[^>]*>(.*?)</script\s*>", text, re.S))
    html_only = re.sub(r"<script\b[^>]*>.*?</script\s*>", "", text, flags=re.S)

    def defined(fn):
        pats = [r"\bfunction\s+%s\s*\(", r"\b(?:var|let|const)\s+%s\s*=",
                r"\bwindow\.%s\s*=", r"\b%s\s*=\s*(?:async\s*)?function",
                r"\b%s\s*=\s*\([^)]*\)\s*=>", r"\b%s\s*=\s*[\w$]+\s*=>"]
        return any(re.search(p % re.escape(fn), scripts) for p in pats)

    handler_bodies = re.findall(
        r'\bon(?:click|change|input|keydown|keyup|mousedown|mouseup|submit|dblclick|focus|blur)\s*=\s*"([^"]*)"',
        html_only)
    called = set()
    for body in handler_bodies:
        # strip single-quoted string literals (attr is double-quoted, so inner
        # strings are single-quoted) — words inside them are not call symbols
        stripped = re.sub(r"'(?:[^'\\]|\\.)*'", "''", body)
        for m in re.finditer(r"(?<![\w$.])([A-Za-z_$][\w$]*)\s*\(", stripped):
            called.add(m.group(1))
    called -= BUILTINS
    undefined = sorted(fn for fn in called if not defined(fn))
    for fn in undefined:
        fails.append(f'inline handler calls "{fn}()" but no script defines it')

    if fails:
        print("check_hooks: FAIL")
        for x in fails[:50]:
            print("  -", x)
        if len(fails) > 50:
            print(f"  … +{len(fails)-50} more")
        sys.exit(1)
    print(f"check_hooks: OK ({len(must_ids)} id hooks, {len(must_probes)} selector probes, {len(called)} inline handler symbols all defined)")


if __name__ == "__main__":
    main()
