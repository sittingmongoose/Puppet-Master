#!/usr/bin/env python3
"""R1b candidate treatment: host-built source-centred evidence bundle, v3 (mechanical only).

Repairs over v1 (R1): every cited line is delivered (merged windows are paged, never truncated);
lines longer than LONG are shown in part with an explicit omitted-character locator; the nearest
preceding heading/title line is supplied as governing context when outside the window; quote status
is a retrieval locator from quote_locator (not approval); each source file is read once.
The full corpus remains available to the verifier; this bundle is only a first view.
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from quote_locator import locate_field  # noqa: E402

CONTEXT = 8
PAGE = 160
LONG = 2000
HANDLE_RANGE = re.compile(r"\b(S\d{3})\b(?:\.txt)?[^\n;,]*?\blines?\s*(\d+)(?:\s*(?:-|–|—|to|\.\.)\s*(\d+))?", re.I)
QUOTE_FIELD = re.compile(r"^\s*[-*]?\s*\**quotes?\**\s*:\s*(.+)$", re.I)
OBS = re.compile(r"^#{2,4}\s*(O-\d+[A-Za-z0-9-]*)\b(.*?)(?=^#{2,4}\s*O-\d+|\Z)", re.M | re.S)
HEADING = re.compile(r'^\s*(#{1,6}\s+\S|\d+(\.\d+)*\.?\s+[A-Z"]\S*|"title":\s)')


def strip_carrier_quotes(text):
    text = text.strip()
    if len(text) >= 2 and text[0] in "\"“'`" and text[-1] in "\"”'`":
        text = text[1:-1]
    return text.strip()


def parse(observations):
    rows = []
    for m in OBS.finditer(observations):
        oid, body = m.group(1), m.group(2)
        cites = [(h.upper(), int(a), int(b) if b else int(a)) for h, a, b in HANDLE_RANGE.findall(body)]
        quotes = []
        for line in body.split("\n"):
            fm = QUOTE_FIELD.match(line)
            if fm:
                quotes.append(fm.group(1).strip())
            elif line.lstrip().startswith(">"):
                quotes.append(line.lstrip()[1:].strip())
        rows.append({"id": oid, "cites": cites, "quotes": [q for q in quotes if q]})
    return rows


class Sources:
    def __init__(self, case_dir, catalog):
        self.case_dir, self.catalog, self.cache, self.reads = case_dir, catalog, {}, 0

    def lines(self, handle):
        if handle not in self.cache:  # v1 used setdefault, which re-read on every call
            self.reads += 1
            self.cache[handle] = (self.case_dir / self.catalog[handle]["file"]).read_text(errors="replace").split("\n")
        return self.cache[handle]


def heading_before(lines, start):
    for n in range(start - 1, max(0, start - 400), -1):
        if HEADING.match(lines[n - 1][:300]):
            return n, lines[n - 1][:300]
    return None


def render_line(n, text, located_cols):
    if len(text) <= LONG:
        return [f"{n:>6}| {text}\n"]
    out = [f"{n:>6}| {text[:LONG]}\n"]
    shown = [(0, LONG)]
    for col in located_cols:
        lo, hi = max(LONG, col - 1000), min(len(text), col + 1000)
        if lo < hi:
            out.append(f"{n:>6}| [chars {lo + 1}-{hi}] {text[lo:hi]}\n")
            shown.append((lo, hi))
    shown.sort()
    gaps, cur = [], 0
    for lo, hi in shown:
        if lo > cur:
            gaps.append((cur + 1, lo))
        cur = max(cur, hi)
    if cur < len(text):
        gaps.append((cur + 1, len(text)))
    for lo, hi in gaps:
        out.append(f"{n:>6}| [OMITTED chars {lo}-{hi} of {len(text)}; open the source file for them]\n")
    return out


def build(case_dir, observations_path, out_dir):
    case_dir, out_dir = Path(case_dir), Path(out_dir)
    catalog = {s["handle"]: s for s in json.loads((case_dir / "catalog.json").read_text())["sources"]}
    src = Sources(case_dir, catalog)
    rows = parse(Path(observations_path).read_text(encoding="utf-8", errors="replace"))
    by_source, checks, omitted, out_of_range = {}, [], [], []
    for r in rows:
        for h, a, b in r["cites"]:
            by_source.setdefault(h, []).append((min(a, b), max(a, b), r["id"]))
    for r in rows:
        known = [(h, a, b) for h, a, b in r["cites"] if h in catalog]
        for q in r["quotes"]:
            best = None
            for h in dict.fromkeys(x[0] for x in known):
                res = locate_field(q, src.lines(h), [(a, b) for hh, a, b in known if hh == h])
                res["source"] = h
                if best is None or (best["class"] == "not_located" and res["class"] != "not_located"):
                    best = res
                if res.get("exact") and res["class"].endswith("_at_cited_lines"):
                    best = res
                    break
            checks.append({"observation": r["id"], "quote": q,
                           **(best or {"class": "no_citable_source", "line": None, "exact": False, "note": "no known handle cited"})})
    unknown = sorted(h for h in by_source if h not in catalog)
    parts = ["# Host-built evidence bundle v3 (mechanical, TEST_ONLY_NEVER_PROMOTE)\n\n",
             f"Every line range cited in stage1/observations.md, grouped by source, with {CONTEXT} lines of context on each "
             f"side, paged at {PAGE} lines (no cited line is dropped). Lines over {LONG} characters are shown in part with an "
             "explicit OMITTED locator. The nearest preceding heading or title is given when it lies outside the window. "
             "Quote status is a retrieval locator, not approval: `not_located` does not mean a fact is absent. "
             "The whole corpus in case/sources/ remains available.\n\n",
             f"Observations parsed: {len(rows)}; without a parseable citation: {sum(1 for r in rows if not r['cites'])}; "
             f"unknown handles: {', '.join(unknown) or 'none'}.\n"]
    cited_lines_total, delivered = 0, set()
    for h in sorted(by_source):
        if h not in catalog:
            continue
        lines = src.lines(h)
        n_lines = len(lines)
        cited = set()
        for a, b, _ in by_source[h]:
            cited.update(range(max(1, a), min(n_lines, b) + 1))
        cited_lines_total += len(cited)
        for a, b, oid in by_source[h]:
            if b > n_lines:
                out_of_range.append({"source": h, "observation": oid, "cited": [a, b], "source_lines": n_lines})
        spans = sorted((min(n_lines, max(1, a - CONTEXT)), min(n_lines, b + CONTEXT), oid) for a, b, oid in by_source[h])
        merged = []
        for a, b, oid in spans:
            if merged and a <= merged[-1][1] + 1:
                merged[-1][1] = max(merged[-1][1], b)
                merged[-1][2].add(oid)
            else:
                merged.append([a, b, {oid}])
        cols = {}
        for c in checks:
            if c.get("source") == h and c.get("line"):
                q = c["quote"].replace('\\"', '"')[:60]
                col = lines[c["line"] - 1].find(q[:30]) if c["line"] <= n_lines else -1
                if col >= 0:
                    cols.setdefault(c["line"], []).append(col)
        uri = "; ".join(sorted({x["uri"] for x in catalog[h]["aliases"]}))
        parts.append(f"\n## {h}: {catalog[h]['file']} ({n_lines} lines; {uri})\n")
        for a, b, oids in merged:
            head = heading_before(lines, a)
            for p_start in range(a, b + 1, PAGE):
                p_end = min(b, p_start + PAGE - 1)
                parts.append(f"\n### {h} lines {p_start}-{p_end}"
                             f"{' (page of merged window ' + str(a) + '-' + str(b) + ')' if (a, b) != (p_start, p_end) else ''}"
                             f", cited by {', '.join(sorted(oids))}\n")
                if head and p_start == a:
                    parts.append(f"Governing context: line {head[0]}: {head[1]}\n")
                parts.append("\n```text\n")
                for n in range(p_start, p_end + 1):
                    text = lines[n - 1]
                    rendered = render_line(n, text, cols.get(n, []))
                    if len(rendered) > 1:
                        omitted.append({"source": h, "line": n, "chars": len(text)})
                    parts.extend(rendered)
                    delivered.add((h, n))
                parts.append("```\n")
        missing = [n for n in cited if (h, n) not in delivered]
        if missing:
            raise AssertionError(f"cited lines not delivered for {h}: {missing[:10]}")
    if out_of_range:
        parts.append("\n## Citations beyond the end of their source (not deliverable; the cited lines do not exist)\n\n")
        for o in out_of_range:
            parts.append(f"- {o['observation']}: {o['source']} lines {o['cited'][0]}-{o['cited'][1]} (source has {o['source_lines']} lines)\n")
    parts.append("\n## Quote locator results (retrieval evidence only)\n\n")
    for c in checks:
        where = f" {c.get('source')} line {c['line']}" if c.get("line") else ""
        parts.append(f"- {c['observation']}: {c['class']}{where}. \"{c['quote'][:200]}\"\n")
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "evidence-bundle.md").write_text("".join(parts), encoding="utf-8")
    summary = {"observations": len(rows), "observations_without_citation": sum(1 for r in rows if not r["cites"]),
               "sources": len([h for h in by_source if h in catalog]), "unknown_handles": unknown,
               "cited_lines": cited_lines_total, "citations_beyond_source_end": out_of_range, "delivered_lines": len(delivered), "long_lines_partially_shown": omitted,
               "quotes": len(checks), "source_file_reads": src.reads,
               "quote_classes": {k: sum(1 for c in checks if c["class"] == k) for k in sorted({c["class"] for c in checks})}}
    (out_dir / "evidence-check.json").write_text(json.dumps({"summary": summary, "checks": checks, "citations": rows},
                                                            indent=1, ensure_ascii=False) + "\n")
    return summary


if __name__ == "__main__":
    print(json.dumps(build(*sys.argv[1:4])))
