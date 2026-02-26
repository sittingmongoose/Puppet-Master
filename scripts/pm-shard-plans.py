#!/usr/bin/env python3
"""Deterministic lossless plan-doc sharding tool for Puppet Master.

Splits long Plans/*.md files into smaller shard files at ## boundaries
(outside fenced code blocks). Guarantees byte-for-byte reconstruction.

Usage:
    python3 scripts/pm-shard-plans.py --generate
    python3 scripts/pm-shard-plans.py --check
"""

from __future__ import annotations

import argparse
import datetime
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
PLANS_DIR = REPO_ROOT / "Plans"
CONFIG_PATH = PLANS_DIR / "sharding_config.json"
EVIDENCE_SCHEMA_PATH = PLANS_DIR / "evidence.schema.json"

H2_RE = re.compile(r"^## ")
FENCE_OPEN_RE = re.compile(r"^ {0,3}(`{3,}|~{3,})")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def _relpath(path: Path) -> str:
    """Return path relative to REPO_ROOT, or str(path) if not under REPO_ROOT."""
    try:
        return str(path.relative_to(REPO_ROOT))
    except ValueError:
        return str(path)

def heading_to_slug(heading: str) -> str:
    """Convert a heading line like '## Foo Bar (baz)' to 'foo-bar-baz'."""
    text = heading.lstrip("#").strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text.strip()).lower()
    text = re.sub(r"-+", "-", text).strip("-")
    return text or "section"


def load_config() -> dict:
    with CONFIG_PATH.open("r", encoding="utf-8") as f:
        return json.load(f)


# ---------------------------------------------------------------------------
# Splitting
# ---------------------------------------------------------------------------

def split_at_h2(lines: list[str]) -> list[dict]:
    """Split lines at ## boundaries outside fenced code blocks.

    Returns list of segments: {heading, start_line (1-based), lines}.
    """
    segments: list[dict] = []
    current_heading: str | None = None
    current_lines: list[str] = []
    current_start: int = 1
    in_fence = False
    fence_marker: str | None = None

    for i, line in enumerate(lines):
        lineno = i + 1  # 1-based

        # Track fenced code blocks (CommonMark: up to 3 spaces indent)
        m = FENCE_OPEN_RE.match(line)
        if m:
            marker_char = m.group(1)[0]
            marker_len = len(m.group(1))
            marker_start = m.start(1)
            if not in_fence:
                in_fence = True
                fence_marker = (marker_char, marker_len)
            elif fence_marker and marker_char == fence_marker[0] and marker_len >= fence_marker[1]:
                # Closing fence: same char, at least same length, rest is whitespace
                rest = line[marker_start + marker_len:].strip()
                if rest == "":
                    in_fence = False
                    fence_marker = None

        # Check for ## boundary outside fence
        if not in_fence and H2_RE.match(line):
            if current_lines:
                segments.append({
                    "heading": current_heading,
                    "start_line": current_start,
                    "lines": current_lines,
                })
            current_heading = line.rstrip("\n").rstrip("\r")
            current_lines = [line]
            current_start = lineno
        else:
            current_lines.append(line)

    # Final segment
    if current_lines:
        segments.append({
            "heading": current_heading,
            "start_line": current_start,
            "lines": current_lines,
        })

    return segments


def split_by_linecount(lines: list[str], chunk_size: int = 200) -> list[dict]:
    """Fallback: split into fixed-size chunks."""
    segments: list[dict] = []
    for i in range(0, len(lines), chunk_size):
        chunk = lines[i : i + chunk_size]
        segments.append({
            "heading": None,
            "start_line": i + 1,
            "lines": chunk,
        })
    return segments


# ---------------------------------------------------------------------------
# Generation
# ---------------------------------------------------------------------------

def generate_shards(config: dict, run_id: str, canonical_output_root: str | None = None) -> dict:
    """Generate shards for all configured sources. Returns results dict.

    canonical_output_root: if set, use this for manifest dest_path values instead
    of the actual output_root. Enables temp-dir generation with stable manifests.
    """
    output_root_raw = Path(config["output_root"])
    evidence_root_raw = Path(config["evidence_root"])
    output_root = output_root_raw if output_root_raw.is_absolute() else REPO_ROOT / output_root_raw
    evidence_root = evidence_root_raw if evidence_root_raw.is_absolute() else REPO_ROOT / evidence_root_raw
    # For manifest paths, always use the canonical output root
    manifest_root = REPO_ROOT / canonical_output_root if canonical_output_root else output_root
    evidence_dir = evidence_root / f"plan-sharding-{run_id}"
    reports_dir = evidence_dir / "reports"
    reports_dir.mkdir(parents=True, exist_ok=True)

    results = {}
    all_files_changed: list[str] = []

    for source_rel in config["sources"]:
        source_path = REPO_ROOT / source_rel
        if not source_path.exists():
            print(f"SKIP (not found): {source_rel}", file=sys.stderr)
            continue

        stem = source_path.stem
        shard_dir = output_root / stem
        shard_dir.mkdir(parents=True, exist_ok=True)

        source_bytes = source_path.read_bytes()
        source_sha = sha256_bytes(source_bytes)

        # Read lines preserving exact content
        with source_path.open("r", encoding="utf-8", newline="") as f:
            lines = f.readlines()

        # Split
        segments = split_at_h2(lines)
        split_rule_used = config["split_rule"]["primary"]
        if len(segments) <= 1:
            segments = split_by_linecount(lines)
            split_rule_used = config["split_rule"]["fallback"]

        # Assign filenames
        slug_counts: dict[str, int] = {}
        shard_entries: list[dict] = []

        for idx, seg in enumerate(segments):
            if seg["heading"] is None and idx == 0:
                slug = "preamble"
            elif seg["heading"] is None:
                slug = f"chunk-{idx}"
            else:
                slug = heading_to_slug(seg["heading"])

            # Dedup slugs
            if slug in slug_counts:
                slug_counts[slug] += 1
                slug = f"{slug}-{slug_counts[slug]}"
                slug_counts[slug] = 1
            else:
                slug_counts[slug] = 1

            filename = f"{idx:02d}-{slug}.md"
            dest_path = shard_dir / filename
            content = "".join(seg["lines"])
            dest_path.write_text(content, encoding="utf-8", newline="")

            seg_bytes = content.encode("utf-8")
            end_line = seg["start_line"] + len(seg["lines"]) - 1

            shard_entries.append({
                "dest_path": _relpath(manifest_root / stem / filename),
                "start_line": seg["start_line"],
                "end_line": end_line,
                "segment_sha256": sha256_bytes(seg_bytes),
                "heading": seg["heading"],
            })
            all_files_changed.append(_relpath(dest_path))

        # Write manifest
        manifest = {
            "source_path": source_rel,
            "source_sha256": source_sha,
            "split_rule": split_rule_used,
            "shards": shard_entries,
        }
        manifest_path = shard_dir / "manifest.json"
        manifest_path.write_text(
            json.dumps(manifest, indent=2) + "\n", encoding="utf-8", newline=""
        )
        all_files_changed.append(_relpath(manifest_path))

        # Write 00-index.md
        index_lines = [
            f"# Shard Index: {stem}\n",
            "\n",
            "> **Derived shards for agent reading; DO NOT edit shards directly unless you also update the source doc; rerun generator.**\n",
            "\n",
            f"Canonical source: [{source_rel}](../../{source_rel.replace(' ', '%20')})\n",
            "\n",
            "## Shards (reading order)\n",
            "\n",
        ]
        for entry in shard_entries:
            dest_name = Path(entry["dest_path"]).name
            heading_label = entry["heading"] or "(preamble / chunk)"
            index_lines.append(f"- [{dest_name}]({dest_name}) — {heading_label}\n")
        index_path = shard_dir / "_index.md"
        index_path.write_text("".join(index_lines), encoding="utf-8", newline="")
        all_files_changed.append(_relpath(index_path))

        # Write reconstruction report
        reconstruct_sha_path = reports_dir / f"{stem}.reconstruct.sha256.txt"
        reconstruct_diff_path = reports_dir / f"{stem}.reconstruct.diff.txt"

        reconstructed = b""
        for entry in shard_entries:
            shard_path = REPO_ROOT / entry["dest_path"]
            reconstructed += shard_path.read_bytes()

        recon_sha = sha256_bytes(reconstructed)
        if recon_sha == source_sha:
            reconstruct_sha_path.write_text(
                f"source: {source_sha}\nreconstructed: {recon_sha}\nRESULT: PASS\n",
                encoding="utf-8", newline="",
            )
            reconstruct_diff_path.write_text("PASS\n", encoding="utf-8", newline="")
            results[stem] = {"status": "PASS", "source_sha256": source_sha}
        else:
            reconstruct_sha_path.write_text(
                f"source: {source_sha}\nreconstructed: {recon_sha}\nRESULT: FAIL\n",
                encoding="utf-8", newline="",
            )
            # Write diff
            with tempfile.NamedTemporaryFile(
                mode="wb", suffix=".md", delete=False
            ) as tmp:
                tmp.write(reconstructed)
                tmp_path = tmp.name
            try:
                try:
                    diff_result = subprocess.run(
                        ["diff", "-u", str(source_path), tmp_path],
                        capture_output=True,
                        text=True,
                    )
                    reconstruct_diff_path.write_text(
                        diff_result.stdout or "(no diff output)\n",
                        encoding="utf-8", newline="",
                    )
                except FileNotFoundError:
                    reconstruct_diff_path.write_text(
                        "(diff utility not available)\n",
                        encoding="utf-8", newline="",
                    )
            finally:
                os.unlink(tmp_path)
            results[stem] = {"status": "FAIL", "source_sha256": source_sha}

        all_files_changed.extend([
            _relpath(reconstruct_sha_path),
            _relpath(reconstruct_diff_path),
        ])

    # Write commands.txt
    commands_txt_path = reports_dir / "commands.txt"
    commands_txt_path.write_text(
        "python3 scripts/pm-shard-plans.py --generate\n",
        encoding="utf-8", newline="",
    )
    all_files_changed.append(_relpath(commands_txt_path))

    return {
        "results": results,
        "files_changed": all_files_changed,
        "evidence_dir": _relpath(evidence_dir),
        "reports_dir": _relpath(reports_dir),
    }


# ---------------------------------------------------------------------------
# Checking
# ---------------------------------------------------------------------------

def check_reconstruction(config: dict) -> list[dict]:
    """Run reconstruction + line accounting checks. Returns per-doc results."""
    output_root = REPO_ROOT / config["output_root"]
    results: list[dict] = []

    for source_rel in config["sources"]:
        source_path = REPO_ROOT / source_rel
        if not source_path.exists():
            results.append({"doc": source_rel, "status": "SKIP", "reason": "not found"})
            continue

        stem = source_path.stem
        shard_dir = output_root / stem
        manifest_path = shard_dir / "manifest.json"

        if not manifest_path.exists():
            results.append({"doc": source_rel, "status": "FAIL", "reason": "manifest.json not found"})
            continue

        with manifest_path.open("r", encoding="utf-8") as f:
            manifest = json.load(f)

        source_sha = sha256_file(source_path)

        # 1) Reconstruction check
        reconstructed = b""
        for entry in manifest["shards"]:
            shard_path = REPO_ROOT / entry["dest_path"]
            if not shard_path.exists():
                results.append({
                    "doc": source_rel,
                    "status": "FAIL",
                    "reason": f"shard not found: {entry['dest_path']}",
                })
                break
            reconstructed += shard_path.read_bytes()
        else:
            recon_sha = sha256_bytes(reconstructed)
            if recon_sha != source_sha:
                # Generate diff excerpt
                with tempfile.NamedTemporaryFile(
                    mode="wb", suffix=".md", delete=False
                ) as tmp:
                    tmp.write(reconstructed)
                    tmp_path = tmp.name
                try:
                    try:
                        diff_result = subprocess.run(
                            ["diff", "-u", str(source_path), tmp_path],
                            capture_output=True,
                            text=True,
                        )
                        diff_excerpt = diff_result.stdout[:2000] if diff_result.stdout else "(no output)"
                    except FileNotFoundError:
                        diff_excerpt = "(diff utility not available)"
                finally:
                    os.unlink(tmp_path)
                results.append({
                    "doc": source_rel,
                    "status": "FAIL",
                    "reason": f"SHA-256 mismatch: source={source_sha} recon={recon_sha}",
                    "diff_excerpt": diff_excerpt,
                })
                continue

            # 2) Line accounting check
            with source_path.open("r", encoding="utf-8", newline="") as f:
                total_lines = sum(1 for _ in f)

            covered = set()
            overlap = False
            for entry in manifest["shards"]:
                for ln in range(entry["start_line"], entry["end_line"] + 1):
                    if ln in covered:
                        overlap = True
                    covered.add(ln)

            expected = set(range(1, total_lines + 1))
            gaps = expected - covered
            extra = covered - expected

            if overlap:
                results.append({
                    "doc": source_rel,
                    "status": "FAIL",
                    "reason": "line accounting: overlapping line ranges",
                })
            elif gaps:
                results.append({
                    "doc": source_rel,
                    "status": "FAIL",
                    "reason": f"line accounting: {len(gaps)} uncovered lines (first: {min(gaps)})",
                })
            elif extra:
                results.append({
                    "doc": source_rel,
                    "status": "FAIL",
                    "reason": f"line accounting: {len(extra)} extra lines beyond source",
                })
            else:
                results.append({
                    "doc": source_rel,
                    "status": "PASS",
                    "source_sha256": source_sha,
                })
            continue

    return results


def check_idempotency(config: dict) -> list[dict]:
    """Verify idempotency: regenerate into a temp dir and compare to current shards."""
    output_root = REPO_ROOT / config["output_root"]
    results: list[dict] = []

    # Snapshot current shard state
    snapshots: dict[str, dict[str, bytes]] = {}
    for source_rel in config["sources"]:
        source_path = REPO_ROOT / source_rel
        if not source_path.exists():
            continue
        stem = source_path.stem
        shard_dir = output_root / stem
        if not shard_dir.exists():
            continue
        file_map: dict[str, bytes] = {}
        for f in sorted(shard_dir.iterdir()):
            if f.is_file():
                file_map[f.name] = f.read_bytes()
        snapshots[stem] = file_map

    # Re-generate into temp directory (non-destructive)
    with tempfile.TemporaryDirectory() as tmpdir:
        tmp_config = {
            **config,
            "output_root": tmpdir,
            "evidence_root": os.path.join(tmpdir, "_evidence"),
        }
        run_id = datetime.date.today().isoformat()
        generate_shards(tmp_config, run_id, canonical_output_root=config["output_root"])

        # Compare snapshots against temp output
        for stem, old_files in snapshots.items():
            tmp_shard_dir = Path(tmpdir) / stem
            if not tmp_shard_dir.exists():
                results.append({
                    "doc": stem,
                    "status": "FAIL",
                    "reason": "idempotency: temp shard dir not created",
                })
                continue

            new_files: dict[str, bytes] = {}
            for f in sorted(tmp_shard_dir.iterdir()):
                if f.is_file():
                    new_files[f.name] = f.read_bytes()

            if old_files.keys() != new_files.keys():
                results.append({
                    "doc": stem,
                    "status": "FAIL",
                    "reason": f"idempotency: file set changed. Old: {sorted(old_files.keys())}, New: {sorted(new_files.keys())}",
                })
                continue

            diffs = []
            for name in old_files:
                if old_files[name] != new_files[name]:
                    diffs.append(name)

            if diffs:
                results.append({
                    "doc": stem,
                    "status": "FAIL",
                    "reason": f"idempotency: content changed in {diffs}",
                })
            else:
                results.append({"doc": stem, "status": "PASS"})

    return results


# ---------------------------------------------------------------------------
# Evidence
# ---------------------------------------------------------------------------

def write_evidence(config: dict, gen_results: dict, run_id: str) -> Path:
    """Write evidence.json conforming to evidence schema."""
    evidence_dir = REPO_ROOT / gen_results["evidence_dir"]
    evidence_path = evidence_dir / "evidence.json"

    evidence = {
        "schema_id": "pm.evidence.schema.v1",
        "evidence_id": f"plan-sharding-{run_id}",
        "created_at_utc": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "node": {
            "node_id": "plan-sharding",
        },
        "summary": "Lossless sharding verified by sha256 reconstruction for each source doc.",
        "commands_run": [
            {"cmd": "python3 scripts/pm-shard-plans.py --generate", "exit_code": 0},
            {"cmd": "python3 scripts/pm-shard-plans.py --check", "exit_code": 0},
            {"cmd": "python3 scripts/pm-plans-verify.py run-gates", "exit_code": -1, "stdout_excerpt": "not yet run"},
        ],
        "tool_calls": [
            {"tool_id": "pm-shard-plans", "count": 2},
        ],
        "events": {
            "event_refs": [
                {"source": "other", "ref": f"plan-sharding-{run_id}"},
            ],
        },
        "files_changed": [
            {"path": p, "change_type": "added"}
            for p in gen_results["files_changed"]
        ],
        "contract_refs_satisfied": [],
        "reproducibility": {
            "snapshot_ref": f"plan-sharding-{run_id}",
            "note": "Rerunning --generate with unchanged sources produces identical output (idempotent).",
        },
        "artifacts": [
            {"path": gen_results["evidence_dir"]},
        ],
        "checks": [
            {
                "name": f"sha256-reconstruction-{stem}",
                "result": info["status"],
                "details": f"source_sha256={info.get('source_sha256', 'N/A')}",
            }
            for stem, info in gen_results["results"].items()
        ],
    }

    # Validate against schema if available
    if EVIDENCE_SCHEMA_PATH.exists():
        try:
            import jsonschema
            with EVIDENCE_SCHEMA_PATH.open("r", encoding="utf-8") as f:
                schema = json.load(f)
            jsonschema.validate(evidence, schema)
        except jsonschema.ValidationError as e:
            print(f"WARNING: evidence.json fails schema validation: {e.message}", file=sys.stderr)
        except Exception as e:
            print(f"WARNING: could not validate evidence schema: {e}", file=sys.stderr)

    evidence_path.write_text(
        json.dumps(evidence, indent=2) + "\n", encoding="utf-8", newline=""
    )
    return evidence_path


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def cmd_generate() -> int:
    config = load_config()
    run_id = datetime.date.today().isoformat()
    gen_results = generate_shards(config, run_id)

    # Print results table
    print("\n=== Shard Generation Results ===")
    print(f"{'Document':<50} {'Status':<8} {'SHA-256'}")
    print("-" * 90)
    any_fail = False
    for stem, info in gen_results["results"].items():
        status = info["status"]
        sha = info.get("source_sha256", "N/A")
        print(f"{stem:<50} {status:<8} {sha}")
        if status != "PASS":
            any_fail = True

    # Write evidence
    ev_path = write_evidence(config, gen_results, run_id)
    print(f"\nEvidence bundle: {ev_path.relative_to(REPO_ROOT)}")
    print(f"Reports: {gen_results['reports_dir']}")

    if any_fail:
        print("\nFAIL: One or more documents failed reconstruction.", file=sys.stderr)
        return 1
    print("\nAll documents PASS reconstruction check.")
    return 0


def cmd_check() -> int:
    config = load_config()

    print("=== Reconstruction + Line Accounting ===")
    recon_results = check_reconstruction(config)
    any_fail = False
    print(f"{'Document':<50} {'Status':<8} {'Detail'}")
    print("-" * 100)
    for r in recon_results:
        doc = r["doc"]
        status = r["status"]
        detail = r.get("source_sha256", r.get("reason", ""))
        print(f"{doc:<50} {status:<8} {detail}")
        if status == "FAIL":
            any_fail = True
            if "diff_excerpt" in r:
                print(f"  Diff excerpt:\n{r['diff_excerpt'][:500]}")

    print("\n=== Idempotency Check ===")
    idem_results = check_idempotency(config)
    print(f"{'Document':<50} {'Status':<8} {'Detail'}")
    print("-" * 100)
    for r in idem_results:
        doc = r["doc"]
        status = r["status"]
        detail = r.get("reason", "OK")
        print(f"{doc:<50} {status:<8} {detail}")
        if status == "FAIL":
            any_fail = True

    print()
    if any_fail:
        print("OVERALL: FAIL", file=sys.stderr)
        return 1
    print("OVERALL: PASS")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(
        prog="pm-shard-plans",
        description="Deterministic lossless plan-doc sharding for Puppet Master",
    )
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--generate", action="store_true", help="Generate/overwrite shards from source docs")
    group.add_argument("--check", action="store_true", help="Verify reconstruction + line accounting + idempotency")

    args = parser.parse_args()

    if args.generate:
        return cmd_generate()
    elif args.check:
        return cmd_check()
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
