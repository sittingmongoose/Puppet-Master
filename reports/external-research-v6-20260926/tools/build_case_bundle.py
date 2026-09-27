#!/usr/bin/env python3
"""Build the candidate-visible OME-Zarr case bundle, identical for all four R1 arms.

Mechanical only (no model, no evaluator input):
- one file per unique source content (126), handle S001.. in first-catalog-appearance order;
- every original catalog entry kept as an alias (source_id, URI or 'local-capture');
- JSON-parseable sources get a pretty-printed line view (json.dumps indent=1,
  ensure_ascii=False); the original sha256 and parser settings are recorded, originals
  stay in the immutable baseline. Other sources are byte-identical copies.
Normalization applies to control and candidate alike.
"""
import hashlib
import json
import sys
from pathlib import Path

BASE = Path("/home/sittingmongoose/PM-Experiments/external-research-v6-20260926/baseline/ome-zarr-thin")
PARSER = "python3 json.loads -> json.dumps(indent=1, ensure_ascii=False) + LF"


def sha(data):
    return hashlib.sha256(data).hexdigest()


def main(out):
    out = Path(out)
    (out / "sources").mkdir(parents=True)
    (out / "plan").mkdir()
    case = json.loads((BASE / "case.json").read_text())
    catalog = json.loads((BASE / "source_catalog.json").read_text())["sources"]
    (out / "brief.md").write_bytes((BASE / "brief.md").read_bytes())
    (out / "plan" / "Viewer.md").write_bytes((BASE / "plan" / "Viewer.md").read_bytes()
                                             if (BASE / "plan" / "Viewer.md").exists()
                                             else (BASE / "plans" / "Plans" / "Viewer.md").read_bytes())
    handles = {}
    rows = []
    for entry in catalog:
        if entry["scope"] == "plan":
            continue
        original = (BASE / entry["snapshot_path"]).read_bytes()
        assert sha(original) == entry["sha256"], entry["source_id"]
        uri = entry["source_uri"]
        alias = {"source_id": entry["source_id"],
                 "uri": "local-capture (origin URL not recorded)" if uri.startswith("/") else uri,
                 "version": entry["version"]}
        if entry["sha256"] in handles:
            rows[handles[entry["sha256"]]]["aliases"].append(alias)
            continue
        handle = f"S{len(rows) + 1:03d}"
        view = original
        view_kind = "original_bytes"
        try:
            parsed = json.loads(original)
            view = (json.dumps(parsed, indent=1, ensure_ascii=False) + "\n").encode("utf-8")
            view_kind = "json_pretty_projection"
        except (ValueError, UnicodeDecodeError):
            pass
        (out / "sources" / f"{handle}.txt").write_bytes(view)
        handles[entry["sha256"]] = len(rows)
        rows.append({"handle": handle, "file": f"sources/{handle}.txt",
                     "original_sha256": entry["sha256"], "original_bytes": entry["bytes"],
                     "view_kind": view_kind, "view_parser": PARSER if view_kind != "original_bytes" else None,
                     "view_sha256": sha(view), "view_bytes": len(view),
                     "view_lines": view.count(b"\n") + (0 if view.endswith(b"\n") or not view else 1),
                     "aliases": [alias]})
    catalog_out = {"schema": "er6.case_catalog.v1", "case_id": case["case_id"],
                   "baseline_case_json_sha256": sha((BASE / "case.json").read_bytes()),
                   "baseline_catalog_sha256": case["source_catalog_sha256"],
                   "plan_file": "plan/Viewer.md", "brief_file": "brief.md",
                   "unique_sources": len(rows), "catalog_entries": len(catalog), "sources": rows}
    (out / "catalog.json").write_text(json.dumps(catalog_out, indent=1, ensure_ascii=False) + "\n")
    (out / "README.md").write_text(
        "# Case bundle (read-only)\n\n"
        "- `brief.md`: the product research brief.\n"
        "- `plan/Viewer.md`: the frozen thin Plan snapshot.\n"
        "- `catalog.json`: every admitted source, one handle (S001..) per unique content, with its "
        "catalog aliases (original source IDs, URI or 'local-capture', version), sizes and line counts.\n"
        "- `sources/<handle>.txt`: the pinned source text. JSON API captures are shown as a "
        "pretty-printed line view of the original bytes (parser recorded in the catalog); all other "
        "sources are the original bytes.\n\n"
        "This is a fixed-source case: the admitted corpus is exactly these files. No live fetching.\n")
    manifest = {p.relative_to(out).as_posix(): sha(p.read_bytes()) for p in sorted(out.rglob("*")) if p.is_file()}
    (out / "MANIFEST.sha256.json").write_text(json.dumps(manifest, indent=1) + "\n")
    print(json.dumps({"unique_sources": len(rows), "json_views": sum(r["view_kind"] != "original_bytes" for r in rows),
                      "bundle_sha256": sha(json.dumps(manifest, sort_keys=True).encode())}))


if __name__ == "__main__":
    main(sys.argv[1])
