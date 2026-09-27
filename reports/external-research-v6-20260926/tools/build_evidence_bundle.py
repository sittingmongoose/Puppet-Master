#!/usr/bin/env python3
"""Candidate treatment (the single R1 variable): host-built source-centered evidence bundle.

Mechanical only. Parses the frozen stage-1 out/observations.md for cited source handles/line
ranges and quoted text, then writes, grouped by source (each source read once by code):
  - evidence-bundle.md: merged cited windows (+/- CONTEXT lines, numbered), the observation IDs
    citing each window, and a mechanical quote-match status;
  - evidence-check.json: the same facts as data.
It never selects, ranks, summarizes or interprets evidence; it copies the cited lines verbatim.
A quote match proves only that the text exists at those lines, not that the claim is right.
"""
import json
import re
import sys
from pathlib import Path

CONTEXT = 8
MAX_WINDOW = 160
HANDLE_RANGE = re.compile(r"\b(S\d{3})\b(?:\.txt)?[^\n;,]*?\blines?\s*(\d+)(?:\s*(?:-|–|—|to|\.\.)\s*(\d+))?", re.I)
QUOTE = re.compile(r"[\"“”](.{8,}?)[\"“”]", re.S)
QUOTE_FIELD = re.compile(r"^\s*[-*]?\s*\**quotes?\**\s*:\s*(.+)$", re.I)
OBS = re.compile(r"^#{2,4}\s*(O-\d+[A-Za-z0-9-]*)\b(.*?)(?=^#{2,4}\s*O-\d+|\Z)", re.M | re.S)


def norm(text):
    return re.sub(r"\s+", " ", text.replace("\\n", " ")).strip().lower()


def parse(observations):
    rows = []
    for m in OBS.finditer(observations):
        oid, body = m.group(1), m.group(2)
        cites = [(h.upper(), int(a), int(b) if b else int(a)) for h, a, b in HANDLE_RANGE.findall(body)]
        quotes = []
        for line in body.split("\n"):
            fm = QUOTE_FIELD.match(line)
            if fm:
                q = fm.group(1).strip().strip("\"“”'`").strip()
                if len(q) >= 4:
                    quotes.append(q)
            elif line.lstrip().startswith(">"):
                q = line.lstrip()[1:].strip().strip("\"“”'`").strip()
                if len(q) >= 4:
                    quotes.append(q)
        if not quotes:
            quotes = [q.strip() for q in QUOTE.findall(body)]
        rows.append({"id": oid, "cites": cites, "quotes": quotes})
    return rows


def main(case_dir, observations_path, out_dir):
    case_dir, out_dir = Path(case_dir), Path(out_dir)
    catalog = {s["handle"]: s for s in json.loads((case_dir / "catalog.json").read_text())["sources"]}
    rows = parse(Path(observations_path).read_text(encoding="utf-8", errors="replace"))
    by_source = {}
    for r in rows:
        for h, a, b in r["cites"]:
            if a > b:
                a, b = b, a
            by_source.setdefault(h, []).append((a, b, r["id"]))
    checks = []
    lines_cache = {}
    for r in rows:
        for q in r["quotes"]:
            nq = norm(q)
            status, where = "not_found_in_cited_sources", None
            for h, a, b in r["cites"]:
                if h not in catalog:
                    continue
                lines = lines_cache.setdefault(h, (case_dir / catalog[h]["file"]).read_text(errors="replace").split("\n"))
                window = norm(" ".join(lines[max(0, a - 3):b + 2]))
                if nq and nq in window:
                    status, where = "exact_at_cited_lines", [h, a, b]
                    break
                whole = norm(" ".join(lines))
                if nq and nq in whole and where is None:
                    status, where = "found_elsewhere_in_cited_source", [h, None, None]
            checks.append({"observation": r["id"], "quote": q, "status": status, "where": where})
    unknown = sorted(h for h in by_source if h not in catalog)
    parts = ["# Host-built evidence bundle (mechanical, TEST_ONLY_NEVER_PROMOTE)\n",
             f"Cited windows from stage1/observations.md, grouped by source, +/-{CONTEXT} lines of context, "
             f"windows capped at {MAX_WINDOW} lines. A quote match proves only that the text exists there.\n",
             f"Observations parsed: {len(rows)}; with no parseable citation: "
             f"{sum(1 for r in rows if not r['cites'])}; unknown handles: {', '.join(unknown) or 'none'}.\n"]
    bundle_lines = 0
    for h in sorted(by_source):
        if h not in catalog:
            continue
        src = catalog[h]
        lines = lines_cache.setdefault(h, (case_dir / src["file"]).read_text(errors="replace").split("\n"))
        spans = sorted((max(1, a - CONTEXT), min(len(lines), b + CONTEXT), oid) for a, b, oid in by_source[h])
        merged = []
        for a, b, oid in spans:
            if merged and a <= merged[-1][1] + 1:
                merged[-1][1] = max(merged[-1][1], b)
                merged[-1][2].add(oid)
            else:
                merged.append([a, b, {oid}])
        uri = "; ".join(sorted({x["uri"] for x in src["aliases"]}))
        parts.append(f"\n## {h} — {src['file']} ({src['view_lines']} lines; {uri})\n")
        for a, b, oids in merged:
            end = min(b, a + MAX_WINDOW - 1)
            parts.append(f"\n### {h} lines {a}-{end}{' (truncated from ' + str(b) + ')' if end < b else ''}"
                         f" — cited by {', '.join(sorted(oids))}\n\n```text\n")
            for n in range(a, end + 1):
                text = lines[n - 1]
                if len(text) > 2000:
                    text = text[:2000] + " [line truncated at 2000 chars; open the source]"
                parts.append(f"{n:>6}| {text}\n")
            parts.append("```\n")
            bundle_lines += end - a + 1
    parts.append("\n## Mechanical quote checks\n\n")
    for c in checks:
        parts.append(f"- {c['observation']}: {c['status']}{' ' + str(c['where']) if c['where'] else ''} — \"{c['quote'][:200]}\"\n")
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "evidence-bundle.md").write_text("".join(parts), encoding="utf-8")
    summary = {"observations": len(rows), "observations_without_citation": sum(1 for r in rows if not r["cites"]),
               "sources": len([h for h in by_source if h in catalog]), "unknown_handles": unknown,
               "bundle_lines": bundle_lines, "quotes": len(checks),
               "quote_status": {s: sum(1 for c in checks if c["status"] == s) for s in {c["status"] for c in checks}}}
    (out_dir / "evidence-check.json").write_text(json.dumps({"summary": summary, "checks": checks,
                                                             "citations": rows}, indent=1) + "\n")
    print(json.dumps(summary))


if __name__ == "__main__":
    main(*sys.argv[1:4])
