#!/usr/bin/env python3
"""css_audit.py -- unused-CSS-selector detector for the PM7 refactor pipeline.

Scans a single-file HTML concept (PM7-base.html), segments it into style /
script / html regions exactly the way a browser tokenizer would (HTML comments
skipped in HTML context; raw-text scan to the literal close tag inside style
and script elements), then audits every CSS rule:

  * brace-balanced rule scanner that recurses into @media / @supports /
    @container grouping at-rules and treats @keyframes / @font-face as atomic
  * class / id token extraction per individual selector; tokens inside
    functional pseudo-classes (:not/:is/:where/:has/:nth-*) and attribute
    selectors are IGNORED (they are not required for a match, so they can
    never prove a selector dead)
  * non-CSS corpus = whole document minus style-block contents (HTML + all JS,
    which includes the PM_SETTINGS_DATA JSON line)
  * a selector is LIVE if every one of its required tokens either appears
    verbatim (whole-token, boundary chars not in [A-Za-z0-9_-]) in the corpus
    OR starts with a dynamic prefix. Dynamic prefixes are harvested from JS
    string-concat patterns ('prefix-' + expr, "... prefix-" + expr) and
    template literals (`... prefix-${expr}`), plus a static protected set.
  * selectors with no class/id token at all (attribute / pseudo / element /
    universal only) are ALWAYS kept
  * @keyframes are reported with their reference count; a keyframes block is
    only a delete candidate when zero animation references remain anywhere

Output: CSV with columns  selector, family, bytes, verdict, evidence
Optional --freeze mode applies the frozen human-review rules (approved
families + protections) and emits a dead_selectors.py module body.

This tool is read-only with respect to the repo: it only writes the CSV /
module text to the paths you pass (use the session scratchpad).

Usage:
  python3 css_audit.py --input base/PM7-base.html --csv /scratch/audit.csv
  python3 css_audit.py --input base/PM7-base.html --csv /scratch/audit.csv \
      --freeze /scratch/dead_selectors.generated.py
"""

import argparse
import hashlib
import re
import sys
from pathlib import Path

BOUND_CHARS = set("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-")

# Static protected dynamic prefixes (known string-built class families; keep
# even if the harvester misses them).
STATIC_PROTECTED_PREFIXES = (
    "st-", "role-", "size-", "count-", "graph-", "hs-", "vs-",
)

# Families confirmed dead-at-selector-granularity by the PM7 exploration
# rounds (Explore C + design track 2 ground-truth corrections). Only DEAD
# candidates whose proving token belongs to one of these families are
# auto-approved by --freeze; everything else is excluded and noted.
APPROVED_FAMILIES = (
    "orch-", "terminal-", "interview-", "inspector-", "widget-", "bento-",
    "wt-", "sc-", "pm6-", "artifact-", "plan-", "msg-",
)

GROUPING_AT_RULES = ("media", "supports", "container", "layer", "scope", "document")
ATOMIC_AT_RULES = ("keyframes", "font-face", "page", "counter-style",
                   "font-feature-values", "property", "viewport")


# --------------------------------------------------------------------------
# Document segmentation
# --------------------------------------------------------------------------

class Block(object):
    __slots__ = ("kind", "tag_id", "open_start", "content_start", "content_end", "end")

    def __init__(self, kind, tag_id, open_start, content_start, content_end, end):
        self.kind = kind
        self.tag_id = tag_id
        self.open_start = open_start
        self.content_start = content_start
        self.content_end = content_end
        self.end = end

    def content(self, text):
        return text[self.content_start:self.content_end]


def _is_tag_at(lower, pos, name):
    """True when lower[pos:] starts an actual <name ...> opener."""
    if not lower.startswith("<" + name, pos):
        return False
    j = pos + 1 + len(name)
    return j >= len(lower) or lower[j] in " \t\r\n>/"


def segment_blocks(text):
    """Segment the document into style/script blocks, browser-tokenizer style.

    In HTML context, <!-- --> comments are skipped (a literal </script> inside
    an HTML comment, as at the pm6-js-demo-engine sibling note, is inert).
    Inside a style/script element we raw-text scan for the literal close tag,
    exactly like the HTML parser -- guaranteed correct for any document that
    actually works in a browser.
    """
    blocks = []
    lower = text.lower()
    n = len(text)
    i = 0
    while i < n:
        lt = lower.find("<", i)
        if lt == -1:
            break
        if lower.startswith("<!--", lt):
            close = lower.find("-->", lt + 4)
            i = n if close == -1 else close + 3
            continue
        kind = None
        if _is_tag_at(lower, lt, "style"):
            kind = "style"
        elif _is_tag_at(lower, lt, "script"):
            kind = "script"
        if kind is None:
            i = lt + 1
            continue
        gt = text.find(">", lt)
        if gt == -1:
            raise ValueError("unterminated %s opener at offset %d" % (kind, lt))
        opentag = text[lt:gt + 1]
        m = re.search(r'id\s*=\s*"([^"]*)"', opentag)
        tag_id = m.group(1) if m else ""
        close = lower.find("</" + kind, gt + 1)
        if close == -1:
            raise ValueError("unterminated %s block at offset %d" % (kind, lt))
        close_gt = text.find(">", close)
        if close_gt == -1:
            raise ValueError("unterminated %s close tag at offset %d" % (kind, close))
        blocks.append(Block(kind, tag_id, lt, gt + 1, close, close_gt + 1))
        i = close_gt + 1
    return blocks


def build_corpus(text, blocks):
    """Non-CSS corpus: the whole document minus style-block CONTENTS."""
    pieces = []
    pos = 0
    for b in blocks:
        if b.kind != "style":
            continue
        pieces.append(text[pos:b.content_start])
        pos = b.content_end
    pieces.append(text[pos:])
    return "\n".join(pieces)


def script_corpus(text, blocks):
    return "\n".join(b.content(text) for b in blocks if b.kind == "script")


# --------------------------------------------------------------------------
# CSS rule scanner
# --------------------------------------------------------------------------

def strip_css_comments(css):
    """Replace /* ... */ with spaces, preserving length/offsets."""
    out = []
    i = 0
    n = len(css)
    while i < n:
        j = css.find("/*", i)
        if j == -1:
            out.append(css[i:])
            break
        out.append(css[i:j])
        k = css.find("*/", j + 2)
        if k == -1:
            out.append(" " * (n - j))
            break
        out.append(" " * (k + 2 - j))
        i = k + 2
    return "".join(out)


def _match_brace(s, open_idx):
    """Index just past the matching '}' for the '{' at open_idx.
    Skips quoted strings. s must be comment-stripped."""
    depth = 0
    i = open_idx
    n = len(s)
    while i < n:
        c = s[i]
        if c in "\"'":
            q = c
            i += 1
            while i < n and s[i] != q:
                if s[i] == "\\":
                    i += 1
                i += 1
        elif c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                return i + 1
        i += 1
    raise ValueError("unbalanced braces starting at offset %d" % open_idx)


class CssRule(object):
    __slots__ = ("selector", "start", "body_open", "end", "contexts", "kind", "name")

    def __init__(self, selector, start, body_open, end, contexts, kind="rule", name=""):
        self.selector = selector      # raw selector text (or at-rule prelude)
        self.start = start            # offset of first selector char (block-relative)
        self.body_open = body_open    # offset of '{'
        self.end = end                # offset just past matching '}'
        self.contexts = contexts      # tuple of enclosing at-rule preludes
        self.kind = kind              # 'rule' | 'keyframes' | 'atomic-at' | 'statement-at'
        self.name = name              # keyframes name when kind == 'keyframes'


def iter_rules(css, base=0, contexts=()):
    """Yield CssRule records for a stylesheet string. Offsets are relative to
    the original css string (plus base). Grouping at-rules are recursed;
    @keyframes / @font-face etc. are yielded atomically."""
    s = strip_css_comments(css)
    i = 0
    n = len(s)
    out = []
    while i < n:
        while i < n and s[i] in " \t\r\n;":
            i += 1
        if i >= n:
            break
        start = i
        if s[i] == "@":
            m = re.match(r"@(-[a-zA-Z]+-)?([a-zA-Z-]+)", s[i:])
            at_name = m.group(2).lower() if m else ""
            brace = s.find("{", i)
            semi = s.find(";", i)
            if brace == -1 or (semi != -1 and semi < brace):
                stop = (semi + 1) if semi != -1 else n
                out.append(CssRule(s[start:stop].strip(), base + start, -1,
                                   base + stop, contexts, kind="statement-at"))
                i = stop
                continue
            end = _match_brace(s, brace)
            prelude = s[start:brace].strip()
            if at_name in GROUPING_AT_RULES:
                inner = css[brace + 1:end - 1]
                out.extend(iter_rules(inner, base + brace + 1,
                                      contexts + (prelude,)))
            elif at_name == "keyframes":
                km = re.match(r"@(?:-[a-zA-Z]+-)?keyframes\s+([A-Za-z0-9_-]+)", prelude)
                out.append(CssRule(prelude, base + start, base + brace,
                                   base + end, contexts, kind="keyframes",
                                   name=km.group(1) if km else ""))
            else:
                out.append(CssRule(prelude, base + start, base + brace,
                                   base + end, contexts, kind="atomic-at"))
            i = end
            continue
        brace = s.find("{", i)
        if brace == -1:
            break
        end = _match_brace(s, brace)
        out.append(CssRule(s[start:brace], base + start, base + brace,
                           base + end, contexts))
        i = end
    return out


# --------------------------------------------------------------------------
# Selector token extraction
# --------------------------------------------------------------------------

def _blank_bracketed(s, open_ch, close_ch):
    out = list(s)
    depth = 0
    for idx, c in enumerate(s):
        if c == open_ch:
            depth += 1
            out[idx] = " "
        elif c == close_ch:
            depth = max(0, depth - 1)
            out[idx] = " "
        elif depth > 0:
            out[idx] = " "
    return "".join(out)


def _blank_functional_pseudo(s):
    """Blank out :func( ... ) argument lists (tokens inside are not required)."""
    res = list(s)
    i = 0
    n = len(s)
    while i < n:
        m = re.match(r"::?[A-Za-z-]+\(", s[i:])
        if m:
            open_idx = i + m.end() - 1
            depth = 0
            j = open_idx
            while j < n:
                if s[j] == "(":
                    depth += 1
                elif s[j] == ")":
                    depth -= 1
                    if depth == 0:
                        break
                j += 1
            for k in range(open_idx, min(j + 1, n)):
                res[k] = " "
            i = j + 1
        else:
            i += 1
    return "".join(res)


def selector_tokens(selector):
    """Return (class_tokens, id_tokens, has_escape) for one selector."""
    has_escape = "\\" in selector
    s = _blank_bracketed(selector, "[", "]")
    s = _blank_functional_pseudo(s)
    classes = re.findall(r"\.(-?[A-Za-z_][A-Za-z0-9_-]*)", s)
    ids = re.findall(r"#(-?[A-Za-z_][A-Za-z0-9_-]*)", s)
    return classes, ids, has_escape


def normalize_selector(sel):
    return re.sub(r"\s+", " ", sel).strip()


def split_selector_list(sel_text):
    """Split a rule's selector list on top-level commas (paren/bracket aware)."""
    parts = []
    depth = 0
    cur = []
    for c in sel_text:
        if c in "([":
            depth += 1
        elif c in ")]":
            depth = max(0, depth - 1)
        if c == "," and depth == 0:
            parts.append("".join(cur))
            cur = []
        else:
            cur.append(c)
    parts.append("".join(cur))
    return [p for p in (x.strip() for x in parts) if p]


def token_family(token):
    idx = token.find("-")
    if idx <= 0:
        return "(no-dash)"
    return token[:idx + 1]


# --------------------------------------------------------------------------
# Liveness
# --------------------------------------------------------------------------

def token_in_corpus(token, corpus, cache):
    hit = cache.get(token)
    if hit is not None:
        return hit
    found = False
    start = 0
    tl = len(token)
    cl = len(corpus)
    while True:
        k = corpus.find(token, start)
        if k == -1:
            break
        before_ok = k == 0 or corpus[k - 1] not in BOUND_CHARS
        after_i = k + tl
        after_ok = after_i >= cl or corpus[after_i] not in BOUND_CHARS
        if before_ok and after_ok:
            found = True
            break
        start = k + 1
    cache[token] = found
    return found


def harvest_dynamic_prefixes(js_text):
    """Prefixes from '... foo-' + expr  and  `... foo-${expr}` patterns."""
    prefixes = set()
    # string literal (single or double quoted) followed by '+'
    for m in re.finditer(r"(['\"])((?:[^'\"\\\n]|\\.)*?)\1\s*\+", js_text):
        lit = m.group(2)
        tm = re.search(r"([A-Za-z][A-Za-z0-9_-]*-)$", lit)
        if tm:
            prefixes.add(tm.group(1))
    # template literal interpolation heads: ...foo-${
    for m in re.finditer(r"([A-Za-z][A-Za-z0-9_-]*-)\$\{", js_text):
        prefixes.add(m.group(1))
    return prefixes


def token_protected(token, prefixes):
    for p in prefixes:
        if token.startswith(p):
            return p
    return None


# --------------------------------------------------------------------------
# Audit
# --------------------------------------------------------------------------

def count_name_refs(name, text):
    """Whole-token occurrences of an animation name, excluding the ones that
    immediately follow an @keyframes declaration head."""
    refs = 0
    start = 0
    nl = len(name)
    tl = len(text)
    while True:
        k = text.find(name, start)
        if k == -1:
            break
        before_ok = k == 0 or text[k - 1] not in BOUND_CHARS
        after_i = k + nl
        after_ok = after_i >= tl or text[after_i] not in BOUND_CHARS
        if before_ok and after_ok:
            head = text[max(0, k - 64):k]
            if not re.search(r"@(?:-[a-zA-Z]+-)?keyframes\s+$", head):
                refs += 1
        start = k + 1
    return refs


def audit_document(text):
    """Full audit. Returns (rows, meta). Each row is a dict."""
    blocks = segment_blocks(text)
    style_blocks = [b for b in blocks if b.kind == "style"]
    corpus = build_corpus(text, blocks)
    js = script_corpus(text, blocks)
    harvested = harvest_dynamic_prefixes(js)
    prefixes = set(STATIC_PROTECTED_PREFIXES) | harvested
    cache = {}
    rows = []
    keyframes_names = {}

    for bi, b in enumerate(style_blocks):
        css = b.content(text)
        for rule in iter_rules(css):
            rule_bytes = rule.end - rule.start
            label = b.tag_id or ("style#%d" % bi)
            if rule.kind == "keyframes":
                keyframes_names.setdefault(rule.name, []).append((label, rule_bytes))
                continue
            if rule.kind in ("atomic-at", "statement-at"):
                rows.append({
                    "selector": normalize_selector(rule.selector),
                    "family": "(at-rule)",
                    "bytes": rule_bytes,
                    "verdict": "KEEP_AT_RULE",
                    "evidence": "block=%s" % label,
                })
                continue
            selectors = split_selector_list(rule.selector)
            share = rule_bytes // max(1, len(selectors))
            for sel in selectors:
                norm = normalize_selector(sel)
                classes, ids, has_escape = selector_tokens(sel)
                tokens = classes + ids
                ctx = ("@[" + " & ".join(rule.contexts) + "] ") if rule.contexts else ""
                if has_escape:
                    rows.append({"selector": norm, "family": "(escaped)",
                                 "bytes": share, "verdict": "KEEP_DOUBT",
                                 "evidence": ctx + "backslash escape in selector; block=%s" % label})
                    continue
                if not tokens:
                    rows.append({"selector": norm, "family": "(structural)",
                                 "bytes": share, "verdict": "KEEP_STRUCTURAL",
                                 "evidence": ctx + "attribute/pseudo/element-only; block=%s" % label})
                    continue
                dead_tokens = []
                live_evidence = []
                for t in tokens:
                    p = token_protected(t, prefixes)
                    if p is not None:
                        live_evidence.append("%s~prefix:%s" % (t, p))
                    elif token_in_corpus(t, corpus, cache):
                        live_evidence.append("%s~corpus" % t)
                    else:
                        dead_tokens.append(t)
                if dead_tokens:
                    rows.append({
                        "selector": norm,
                        "family": token_family(dead_tokens[0]),
                        "bytes": share,
                        "verdict": "DEAD",
                        "evidence": ctx + "dead-tokens=" + "+".join(dead_tokens) +
                                    "; block=%s" % label,
                    })
                else:
                    rows.append({
                        "selector": norm,
                        "family": token_family(tokens[0]),
                        "bytes": share,
                        "verdict": "LIVE",
                        "evidence": ctx + " ".join(live_evidence[:4]) +
                                    ("; block=%s" % label),
                    })

    # keyframes liveness (current-state reference counts)
    for name, sites in sorted(keyframes_names.items()):
        total_bytes = sum(sz for _, sz in sites)
        refs = count_name_refs(name, text)
        rows.append({
            "selector": "@keyframes " + name,
            "family": "(keyframes)",
            "bytes": total_bytes,
            "verdict": "LIVE_KEYFRAMES" if refs > 0 else "DEAD_KEYFRAMES_CANDIDATE",
            "evidence": "refs=%d defs=%d blocks=%s" % (
                refs, len(sites), "+".join(lbl for lbl, _ in sites)),
        })

    meta = {
        "blocks_total": len(blocks),
        "style_blocks": len(style_blocks),
        "script_blocks": len([b for b in blocks if b.kind == "script"]),
        "harvested_prefixes": sorted(harvested),
        "static_prefixes": list(STATIC_PROTECTED_PREFIXES),
        "corpus_bytes": len(corpus),
    }
    return rows, meta


# --------------------------------------------------------------------------
# Freeze (review-rule application)
# --------------------------------------------------------------------------

def apply_review_rules(rows):
    """Split DEAD candidates into approved vs protected per the frozen review
    rules. Returns (approved_rows, protected_rows)."""
    approved, protected = [], []
    for r in rows:
        if r["verdict"] != "DEAD":
            continue
        m = re.search(r"dead-tokens=([^;]+)", r["evidence"])
        dead_tokens = m.group(1).split("+") if m else []
        fams = set(token_family(t) for t in dead_tokens)
        if ".pm-sheen" == r["selector"]:
            protected.append((r, "pm-sheen is live by decree"))
            continue
        if not dead_tokens:
            protected.append((r, "no proving token (doubt)"))
            continue
        bad = [f for f in fams if f not in APPROVED_FAMILIES]
        if bad:
            protected.append((r, "family not in approved set: %s" % "+".join(sorted(bad))))
            continue
        approved.append(r)
    return approved, protected


def emit_dead_module(approved, protected, meta, base_sha, out_path):
    sels = sorted(set(r["selector"] for r in approved))
    fam_bytes = {}
    fam_count = {}
    for r in approved:
        fam_bytes[r["family"]] = fam_bytes.get(r["family"], 0) + r["bytes"]
        fam_count[r["family"]] = fam_count.get(r["family"], 0) + 1
    lines = []
    lines.append('"""dead_selectors.py -- FROZEN human-reviewed dead-selector list (PM7 T01).')
    lines.append("")
    lines.append("GENERATED by css_audit.py --freeze and then human-reviewed. Do not hand-edit")
    lines.append("casually; re-derive with the recipe in README.md when the base changes.")
    lines.append('"""')
    lines.append("")
    lines.append('BASE_SHA = "%s"' % base_sha)
    lines.append("")
    lines.append("# Per-family byte tallies (audit-time estimates, rule bytes split across")
    lines.append("# selector lists):")
    lines.append("FAMILY_BYTES = {")
    for fam in sorted(fam_bytes):
        lines.append('    "%s": %d,  # %d selectors' % (fam, fam_bytes[fam], fam_count[fam]))
    lines.append("}")
    lines.append("")
    lines.append("# Harvested dynamic prefixes at freeze time (protection set):")
    lines.append("HARVESTED_PREFIXES = %r" % (sorted(meta["harvested_prefixes"]),))
    lines.append("")
    lines.append("# Dead candidates EXCLUDED by review (kept in the file), with reasons:")
    seen = set()
    for r, reason in protected:
        key = r["selector"]
        if key in seen:
            continue
        seen.add(key)
        lines.append("#   EXCLUDED %-60s %s" % (key[:60], reason))
    lines.append("")
    lines.append("DEAD_SELECTORS = [")
    for s in sels:
        lines.append("    %r," % s)
    lines.append("]")
    lines.append("")
    Path(out_path).write_text("\n".join(lines), encoding="utf-8")
    return sels, fam_bytes


def main(argv=None):
    ap = argparse.ArgumentParser(description="PM7 unused-CSS-selector audit")
    ap.add_argument("--input", required=True)
    ap.add_argument("--csv", help="write full audit CSV here")
    ap.add_argument("--freeze", help="write generated dead_selectors module here")
    args = ap.parse_args(argv)

    text = Path(args.input).read_text(encoding="utf-8")
    base_sha = hashlib.sha256(text.encode("utf-8")).hexdigest()
    rows, meta = audit_document(text)

    if args.csv:
        import csv as _csv
        with open(args.csv, "w", newline="", encoding="utf-8") as f:
            w = _csv.DictWriter(f, fieldnames=["selector", "family", "bytes",
                                               "verdict", "evidence"])
            w.writeheader()
            for r in rows:
                w.writerow(r)

    verd = {}
    for r in rows:
        verd[r["verdict"]] = verd.get(r["verdict"], 0) + 1
    print("input sha256: %s" % base_sha)
    print("blocks: total=%d style=%d script=%d corpus_bytes=%d" % (
        meta["blocks_total"], meta["style_blocks"], meta["script_blocks"],
        meta["corpus_bytes"]))
    print("harvested prefixes (%d): %s" % (len(meta["harvested_prefixes"]),
                                           " ".join(meta["harvested_prefixes"])))
    for k in sorted(verd):
        print("  %-26s %d" % (k, verd[k]))
    dead_bytes = sum(r["bytes"] for r in rows if r["verdict"] == "DEAD")
    print("DEAD candidate bytes (est): %d" % dead_bytes)

    if args.freeze:
        approved, protected = apply_review_rules(rows)
        sels, fam_bytes = emit_dead_module(approved, protected, meta, base_sha,
                                           args.freeze)
        print("freeze: approved=%d selectors (%d unique), protected=%d, "
              "approved bytes (est)=%d" % (
                  len(approved), len(sels), len(protected),
                  sum(fam_bytes.values())))
        print("wrote %s" % args.freeze)
    return 0


if __name__ == "__main__":
    sys.exit(main())
