#!/usr/bin/env python3
"""POST-HOC DIAGNOSTIC ONLY (not the frozen treatment): re-score stage-1 quotes with a corrected normalizer
(unescape \\" and \\n, fold curly quotes/apostrophes/dashes, split on ... or … and require every segment of >=12 chars)."""
import json, re, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from build_evidence_bundle import parse
LAB = Path("/home/sittingmongoose/PM-Experiments/external-research-v6-20260926")
cat = {s["handle"]: s for s in json.loads((LAB / "case_bundle/catalog.json").read_text())["sources"]}
FOLD = str.maketrans({"“": '"', "”": '"', "‘": "'", "’": "'", "–": "-", "—": "-", " ": " "})
def norm(t):
    t = t.replace('\\"', '"').replace("\\n", " ").replace("\\'", "'").translate(FOLD)
    t = re.sub(r"[*`_]", "", t)
    return re.sub(r"\s+", " ", t).strip().lower()
out = {}
for slot in sys.argv[1:]:
    rows = parse((LAB / "runs" / slot / "frozen/stage1/observations.md").read_text(errors="replace"))
    st = {"exact_at_cited_lines": 0, "all_segments_at_cited_lines": 0, "found_elsewhere_in_cited_source": 0, "not_found": 0, "no_quote": 0}
    for r in rows:
        if not r["quotes"]:
            st["no_quote"] += 1; continue
        for q in r["quotes"]:
            segs = [s for s in (norm(x) for x in re.split(r"\.\.\.|…", q)) if len(s) >= 12] or [norm(q)]
            best = "not_found"
            for h, a, b in r["cites"]:
                if h not in cat: continue
                lines = (LAB / "case_bundle" / cat[h]["file"]).read_text(errors="replace").split("\n")
                win, whole = norm(" ".join(lines[max(0, a - 3):b + 2])), norm(" ".join(lines))
                if all(s in win for s in segs):
                    best = "exact_at_cited_lines" if len(segs) == 1 else "all_segments_at_cited_lines"; break
                if all(s in whole for s in segs): best = "found_elsewhere_in_cited_source"
            st[best] += 1
    out[slot] = st
    print(slot, st)
(LAB / "ledger/quote-check-v2-diagnostic.json").write_text(json.dumps(out, indent=1) + "\n")
