#!/usr/bin/env python3
"""After ALL four slots are frozen: build two blinded reviewer workspaces (one per application pair)."""
import json, secrets, shutil, sys, hashlib
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from run_arm import readonly, manifest
LAB = Path("/home/sittingmongoose/PM-Experiments/external-research-v6-20260926")
EV = Path("/mnt/Cursor/PuppetMaster-Evidence/tests/research-shapes-20260920/phase1-20260921/evaluation")
ref = json.loads((EV / "reference/fixed-reference.json").read_text())
assert hashlib.sha256((EV / "reference/fixed-reference.json").read_bytes()).hexdigest() == "54fdca6a4aa9a6356da545a0c195c835557c2a8b1fe16feb9356d0d09a83fbde"
key = {"schema": ref["schema"], "evaluator_only": True, "exhaustive": ref["exhaustive"],
       "historical_reference_requires_pinned_source_revalidation": ref["historical_reference_requires_pinned_source_revalidation"],
       "ome": ref["ome"], "note": "Subset of fixed-reference.json (OME entries only). Source URIs map to case/catalog.json aliases."}
blind = {}
for pair, slots in (("REV-M", ["M-control", "M-candidate"]), ("REV-Z", ["Z-candidate", "Z-control"])):
    ws = LAB / "eval" / pair
    ws.mkdir(parents=True)
    shutil.copytree(LAB / "case_bundle", ws / "case")
    (ws / "key").mkdir()
    (ws / "key/ome-reference.json").write_text(json.dumps(key, indent=1, ensure_ascii=False) + "\n")
    shutil.copy2(EV / "SCORING.md", ws / "key/SCORING.md")
    order = slots[:] if secrets.randbelow(2) else slots[::-1]
    for i, slot in enumerate(order, 1):
        d = ws / "results" / f"X{i}"
        (d / "upstream").mkdir(parents=True)
        s1, s2 = LAB / "runs" / slot / "frozen/stage1", LAB / "runs" / slot / "frozen/stage2"
        for f in ("delivered.md", "checks.md"):
            if (s2 / f).exists():
                shutil.copy2(s2 / f, d / f)
        if not (d / "delivered.md").exists():
            (d / "NO_DELIVERED_RESULT.txt").write_text("No designated final was produced for this result; it is unscorable. Do not synthesize one.\n")
        for f in ("observations.md", "draft.md"):
            if (s1 / f).exists():
                shutil.copy2(s1 / f, d / "upstream" / f)
        blind[f"{pair}/X{i}"] = slot
    for p in ("case", "key", "results"):
        readonly(ws / p)
    (ws / "out").mkdir()
    (LAB / "eval" / f"{pair}-input-manifest.json").write_text(json.dumps(manifest(ws), indent=1) + "\n")
(LAB / "eval/blind-map.PRIVATE.json").write_text(json.dumps(blind, indent=1) + "\n")
print("built", sorted(blind))
