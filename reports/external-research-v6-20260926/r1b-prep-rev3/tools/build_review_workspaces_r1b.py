#!/usr/bin/env python3
"""R1b rev2: build the two blinded reviewer workspaces after ALL block-1 slots are terminal (B8).

Reviewer-visible: case/ corpus, key/ (OME reference subset + SCORING.md), results/X1|X2/ with delivered.md and the
shared upstream stage-1 files. Treatment artifacts (evidence bundles, decisions, receipts) are withheld. The build
refuses if an operational arm/slot marker appears in a reviewer-visible file name or a delivered title; mentions
inside verifier-authored text are substantive output and are reported in leak-scan.json, never edited away.
"""
import hashlib
import json
import re
import secrets
import shutil
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from run_arm import readonly, manifest  # noqa: E402
sys.path.insert(0, str(HERE))
import run_r1b  # noqa: E402

LAB = HERE.parent.parent
EV = Path("/mnt/Cursor/PuppetMaster-Evidence/tests/research-shapes-20260920/phase1-20260921/evaluation")
KEY_SHA = "54fdca6a4aa9a6356da545a0c195c835557c2a8b1fe16feb9356d0d09a83fbde"
MARKERS = re.compile(r"R1b-|\bP[12]-|-(?:candidate|control)\b|host-bundle|evidence-bundle|evidence-check|arm-receipt|\bvariant\b", re.I)
PAIRS = {"REV-M": ["R1b-M-P1-control", "R1b-M-P1-candidate"], "REV-Z": ["R1b-Z-P1-candidate", "R1b-Z-P1-control"]}


class LeakRefused(RuntimeError):
    pass


def scan(ws):
    hits = []
    for p in sorted(ws.rglob("*")):
        rel = p.relative_to(ws).as_posix()
        if rel.startswith("case/") or rel.startswith("key/"):
            continue
        if MARKERS.search(rel):
            raise LeakRefused(f"operational marker in reviewer-visible path: {rel}")
        if p.is_file():
            lines = p.read_text(errors="replace").split("\n")
            if p.name == "delivered.md" and MARKERS.search(lines[0]):
                raise LeakRefused(f"operational marker in delivered title: {rel}: {lines[0]}")
            for n, line in enumerate(lines, 1):
                if MARKERS.search(line):
                    hits.append({"file": rel, "line": n, "text": line[:200]})
    return hits


def build(pairs=PAIRS, runs=LAB / "r1b/runs", out_root=LAB / "r1b/eval", ev=EV):
    for slots in pairs.values():
        for s in slots:
            st = json.loads((runs / s / "status.json").read_text())
            if st.get("state") != "terminal":
                raise LeakRefused(f"slot {s} is not terminal; evaluation must wait for all slots")
    ref_path = ev / "reference/fixed-reference.json"
    if hashlib.sha256(ref_path.read_bytes()).hexdigest() != KEY_SHA:
        raise LeakRefused("evaluator key hash changed")
    ref = json.loads(ref_path.read_text())
    key = {k: ref[k] for k in ("schema", "exhaustive", "historical_reference_requires_pinned_source_revalidation", "ome")}
    blind, leaks = {}, {}
    for pair, slots in pairs.items():
        ws = out_root / pair
        ws.mkdir(parents=True)
        (ws / "case").mkdir()
        run_r1b.copy_listed_corpus(LAB / "case_bundle", ws / "case")
        (ws / "key").mkdir()
        (ws / "key/ome-reference.json").write_text(json.dumps(key, indent=1, ensure_ascii=False) + "\n")
        shutil.copy2(ev / "SCORING.md", ws / "key/SCORING.md")
        order = slots[:] if secrets.randbelow(2) else slots[::-1]
        upstream = []
        for i, slot in enumerate(order, 1):
            d = ws / "results" / f"X{i}"
            (d / "upstream").mkdir(parents=True)
            arm = runs / slot
            final = arm / "frozen/delivered/delivered.md"
            if final.exists():
                shutil.copy2(final, d / "delivered.md")
            else:
                (d / "NO_DELIVERED_RESULT.txt").write_text("No designated final exists for this result; it is unscorable.\n")
            pkg = json.loads((arm / "arm-receipt.json").read_text()).get("package")
            for f in ("observations.md", "draft.md"):
                shutil.copy2(LAB / "runs" / pkg / "frozen/stage1" / f, d / "upstream" / f)
            upstream.append({f: hashlib.sha256((d / "upstream" / f).read_bytes()).hexdigest() for f in ("observations.md", "draft.md")})
            blind[f"{pair}/X{i}"] = slot
        if upstream[0] != upstream[1]:
            raise LeakRefused(f"{pair}: upstream files differ between results")
        leaks[pair] = scan(ws)
        for p in ("case", "key", "results"):
            readonly(ws / p)
        (ws / "out").mkdir()
        (out_root / f"{pair}-input-manifest.json").write_text(json.dumps(manifest(ws), indent=1) + "\n")
    (out_root / "blind-map.PRIVATE.json").write_text(json.dumps(blind, indent=1) + "\n")
    (out_root / "leak-scan.json").write_text(json.dumps(leaks, indent=1) + "\n")
    return blind, leaks


if __name__ == "__main__":
    b, l = build()
    print(json.dumps({"built": sorted(b), "content_mentions": {k: len(v) for k, v in l.items()}}))
