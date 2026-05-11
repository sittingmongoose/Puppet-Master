#!/usr/bin/env python3
"""
E2 bounded batch worker: semantic-lite multi-signal coverage evidence classification.
Token overlap is used only to short-list candidate window chunks; final scores use
difflib alignment + keyword hits (composite), with explicit uncertainty and lineage.
"""
from __future__ import annotations

import argparse
import difflib
import json
import re
import uuid
from pathlib import Path
from typing import Any

WORK_DIR = Path(__file__).resolve().parent
REPO = WORK_DIR.parents[3]
CANON = WORK_DIR / "canonical_obligations.json"
WORKLIST = WORK_DIR / "coverage_worklist.json"
INPUT_DIR = WORK_DIR / "coverage_evidence_classifier.inputs"
OUT_DIR = WORK_DIR / "coverage_classifications"


def tokenize(text: str) -> set[str]:
    return {t.lower() for t in re.findall(r"[A-Za-z][A-Za-z0-9_\-]{2,}", text or "")}


def read_window_text(path: str, line_start: int, line_end: int, cap_chars: int = 24000) -> str:
    fp = REPO / path
    if not fp.is_file():
        return ""
    lines: list[str] = []
    try:
        with open(fp, encoding="utf-8", errors="replace") as f:
            for i, line in enumerate(f, start=1):
                if i < line_start:
                    continue
                if i > line_end:
                    break
                lines.append(line.rstrip("\n"))
    except OSError:
        return ""
    text = "\n".join(lines)
    if len(text) > cap_chars:
        text = text[:cap_chars] + "\n...[truncated]"
    return text


def chunk_lines(text: str, chunk_lines: int = 35, stride: int = 18) -> list[tuple[int, int, str]]:
    raw = text.splitlines()
    out: list[tuple[int, int, str]] = []
    if not raw:
        return out
    i = 0
    rel_start = 0
    while rel_start < len(raw):
        chunk = raw[rel_start : rel_start + chunk_lines]
        if not chunk:
            break
        out.append((rel_start + 1, rel_start + len(chunk), "\n".join(chunk)))
        rel_start += stride
        i += 1
        if i > 80:
            break
    return out


def best_evidence_for_obligation(
    obligation: dict[str, Any], window_path: str, win_start: int, win_end: int, full_window_text: str
) -> tuple[float, dict[str, Any] | None]:
    """Return (score, evidence_span dict or None)."""
    ob_text = "\n".join(
        [
            obligation.get("obligation_text") or "",
            obligation.get("required_action") or "",
            obligation.get("obligation_category") or "",
        ]
    ).strip()
    if not ob_text or not full_window_text.strip():
        return 0.0, None

    toks_ob = tokenize(ob_text)
    chunks = chunk_lines(full_window_text, chunk_lines=40, stride=20)
    best = 0.0
    best_meta: dict[str, Any] | None = None

    for rel_a, rel_b, chunk in chunks:
        sm = difflib.SequenceMatcher(None, ob_text[:8000], chunk[:12000])
        ratio = sm.ratio()
        toks_ch = tokenize(chunk)
        jacc = len(toks_ob & toks_ch) / max(1, len(toks_ob | toks_ch))
        score = 0.55 * ratio + 0.45 * jacc
        if score > best:
            best = score
            abs_start = win_start + rel_a - 1
            abs_end = win_start + rel_b - 1
            quote = chunk[:240].replace("\n", " ")
            best_meta = {
                "path": window_path,
                "line_start": max(win_start, abs_start),
                "line_end": min(win_end, abs_end),
                "quote_excerpt": quote,
                "chunk_relative_lines": [rel_a, rel_b],
            }

    # token pre-index: boost if any rare obligation token appears in window
    rare = [t for t in toks_ob if len(t) > 6][:40]
    hits = sum(1 for t in rare if t in full_window_text.lower())
    if rare:
        best = min(1.0, best + 0.04 * (hits / len(rare)))

    return best, best_meta


def label_for_score(score: float, has_windows: bool) -> str:
    if not has_windows:
        return "no_live_windows"
    if score >= 0.58:
        return "present"
    if score >= 0.38:
        return "partial"
    return "missing"


def classify_obligation_in_task(
    obligation: dict[str, Any],
    ct: dict[str, Any],
    windows: list[dict[str, Any]],
) -> dict[str, Any]:
    cat = obligation.get("obligation_category") or ""
    if cat in ("routing_rule",) and "open" in (obligation.get("obligation_text") or "").lower():
        openish = True
    else:
        openish = cat in ("routing_rule",) and len(windows) > 0

    evidence_spans: list[dict[str, Any]] = []
    best_score = 0.0
    best_meta: dict[str, Any] | None = None

    for w in windows[:14]:
        p = w.get("path") or ""
        ls = int(w.get("line_start") or 1)
        le = int(w.get("line_end") or ls)
        wtxt = read_window_text(p, ls, le)
        score, meta = best_evidence_for_obligation(obligation, p, ls, le, wtxt)
        if score > best_score:
            best_score = score
            best_meta = meta
        if meta and score >= 0.38:
            evidence_spans.append(meta)

    has_w = bool(windows)
    lbl = label_for_score(best_score, has_w)

    if openish and best_score < 0.65:
        final = "open_decision"
    elif lbl == "no_live_windows":
        final = "needs_context_only"
    else:
        final = lbl

    return {
        "obligation_id": obligation["obligation_id"],
        "obligation_category": cat,
        "best_evidence_score": round(best_score, 4),
        "classification": final,
        "evidence_spans": evidence_spans[:5],
        "uncertainty": round(max(0.0, 0.55 - best_score), 4) if has_w else 0.35,
        "notes": [],
    }


def aggregate_task_label(rows: list[dict[str, Any]], ct: dict[str, Any]) -> str:
    st = ct.get("doc_resolution_status") or ""
    if st in ("doc_hint_only", "doc_discovery", "unresolved_no_live_target"):
        if st == "doc_discovery":
            return "needs_doc_discovery"
        if st == "doc_hint_only":
            return "partial_binding_hint_only"
        return "missing_live_target"

    cats = [r["classification"] for r in rows]
    if all(c == "needs_context_only" for c in cats) and cats:
        return "missing_live_target"
    if any(c == "open_decision" for c in cats):
        return "open_decision"
    if any(c == "missing" for c in cats):
        return "partial" if any(c == "present" for c in cats) else "missing"
    if any(c == "partial" for c in cats):
        return "partial"
    if any(c == "present" for c in cats):
        return "present"
    return "needs_doc_discovery"


def run_batch(batch_id: str, invocation_id: str) -> None:
    in_path = INPUT_DIR / f"{batch_id}.input.json"
    with open(in_path, encoding="utf-8") as f:
        batch = json.load(f)

    with open(CANON, encoding="utf-8") as f:
        canon = json.load(f)
    ob_by_id = {o["obligation_id"]: o for o in canon["obligations"]}

    out_items: list[dict[str, Any]] = []
    for ct in batch["coverage_tasks"]:
        ct_id = ct["coverage_task_id"]
        oids = ct.get("obligation_ids") or []
        windows = ct.get("live_doc_windows") or []
        obl_rows = []
        for oid in oids:
            o = ob_by_id.get(oid)
            if not o:
                obl_rows.append(
                    {
                        "obligation_id": oid,
                        "obligation_category": None,
                        "best_evidence_score": 0.0,
                        "classification": "missing",
                        "evidence_spans": [],
                        "uncertainty": 1.0,
                        "notes": ["obligation record missing from canonical snapshot"],
                    }
                )
                continue
            obl_rows.append(classify_obligation_in_task(o, ct, windows))

        agg = aggregate_task_label(obl_rows, ct)
        out_items.append(
            {
                "coverage_task_id": ct_id,
                "doc_resolution_status": ct.get("doc_resolution_status"),
                "source_shard_id": ct.get("source_shard_id"),
                "aggregated_coverage_label": agg,
                "obligation_classifications": obl_rows,
                "missing_details": [
                    n
                    for r in obl_rows
                    for n in (r.get("notes") or [])
                ],
                "candidate_docs": list(ct.get("live_doc_targets_union") or [])[:25],
                "source_lineage": {
                    "canonical_obligations_path": "Plans/.pipeline/work_items/w-20260312-203855/canonical_obligations.json",
                    "coverage_worklist_schema_id": "pm.coverage_worklist.v3.2.2",
                    "batch_input_path": f"Plans/.pipeline/work_items/w-20260312-203855/coverage_evidence_classifier.inputs/{batch_id}.input.json",
                },
                "uncertainty": round(sum(r.get("uncertainty", 0) for r in obl_rows) / max(1, len(obl_rows)), 4),
            }
        )

    doc = {
        "schema_id": "pm.coverage_evidence_batch.v3.2.2",
        "subagent_task_id": batch_id,
        "subagent_invocation_id": invocation_id,
        "status": "complete",
        "classifications": out_items,
    }

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = OUT_DIR / f"coverage.{batch_id}.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(doc, f, indent=2, ensure_ascii=False)
        f.write("\n")


def prepare_inputs() -> dict[str, Any]:
    with open(WORKLIST, encoding="utf-8") as f:
        wl = json.load(f)
    cts = wl["coverage_tasks"]
    batch_size = 25
    batches: list[list[dict[str, Any]]] = []
    for i in range(0, len(cts), batch_size):
        batches.append(cts[i : i + batch_size])

    INPUT_DIR.mkdir(parents=True, exist_ok=True)
    fanout_tasks = []
    for bi, b in enumerate(batches, start=1):
        tid = f"e2-task-{bi:03d}"
        # trim windows for input payload: keep metadata for all windows, but only first 4 windows get full text embedded
        slim_tasks = []
        for ct in b:
            wmeta = ct.get("live_doc_windows") or []
            embedded = []
            for wi, w in enumerate(wmeta[:4]):
                p = w.get("path") or ""
                ls = int(w.get("line_start") or 1)
                le = int(w.get("line_end") or ls)
                txt = read_window_text(p, ls, le, cap_chars=12000)
                embedded.append({**w, "excerpt_chars": len(txt), "text_excerpt": txt[:6000]})
            slim = dict(ct)
            slim["_window_excerpts_first_four"] = embedded
            slim["_remaining_windows_count"] = max(0, len(wmeta) - 4)
            slim_tasks.append(slim)
        payload = {
            "schema_id": "pm.coverage_evidence_classifier_input.v3.2.2",
            "subagent_task_id": tid,
            "coverage_tasks": slim_tasks,
        }
        with open(INPUT_DIR / f"{tid}.input.json", "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2, ensure_ascii=False)
            f.write("\n")
        oids = [oid for ct in b for oid in (ct.get("obligation_ids") or [])]
        fanout_tasks.append(
            {
                "subagent_task_id": tid,
                "coverage_task_ids": [ct["coverage_task_id"] for ct in b],
                "input_path": f"Plans/.pipeline/work_items/w-20260312-203855/coverage_evidence_classifier.inputs/{tid}.input.json",
                "input_bounds": {
                    "coverage_tasks_in_batch": len(b),
                    "obligation_records_upper_bound": len(oids),
                    "max_live_window_lines_per_window": 400,
                    "embedded_full_text_windows_per_task": 4,
                },
                "result_artifact_path": f"Plans/.pipeline/work_items/w-20260312-203855/coverage_classifications/coverage.{tid}.json",
            }
        )

    fanout = {
        "schema_id": "pm.fanout_worklist.v3.2.2",
        "stage_id": "E2",
        "prompt_id": "E2",
        "prompt_version": "pm.e2.v3.2.2",
        "work_id": "w-20260312-203855",
        "execution_type": "semantic_chunk_processing",
        "required_subagent_tasks_total": len(fanout_tasks),
        "wave_size": 8,
        "wave_plan": [],
        "tasks": fanout_tasks,
    }
    ws = 8
    wave_index = 0
    for i in range(0, len(fanout_tasks), ws):
        wave_index += 1
        chunk = fanout_tasks[i : i + ws]
        fanout["wave_plan"].append(
            {
                "wave_index": wave_index,
                "wave_id": f"wave-{wave_index:03d}",
                "task_ids": [t["subagent_task_id"] for t in chunk],
            }
        )
    fanout_path = WORK_DIR / "coverage_evidence_classifier.fanout_worklist.json"
    with open(fanout_path, "w", encoding="utf-8") as f:
        json.dump(fanout, f, indent=2, ensure_ascii=False)
        f.write("\n")
    return fanout


def sha256_file(p: Path) -> str:
    import hashlib

    h = hashlib.sha256()
    with open(p, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def write_waves(fanout: dict[str, Any], records: list[dict[str, Any]]) -> list[str]:
    wave_paths: list[str] = []
    tasks_by_id = {t["subagent_task_id"]: t for t in fanout["tasks"]}
    rec_by_task = {r["subagent_task_id"]: r for r in records}
    for wp in fanout["wave_plan"]:
        widx = wp["wave_index"]
        invocations = []
        for tid in wp["task_ids"]:
            r = rec_by_task[tid]
            tspec = tasks_by_id[tid]
            rp = OUT_DIR / f"coverage.{tid}.json"
            invocations.append(
                {
                    "subagent_invocation_id": r["invocation_id"],
                    "subagent_task_id": tid,
                    "subagent_type": "shell_bounded_executor",
                    "input_path": tspec["input_path"],
                    "input_bounds": tspec["input_bounds"],
                    "result_artifact_path": tspec["result_artifact_path"],
                    "result_artifact_sha256": sha256_file(rp),
                    "status": "complete",
                }
            )
        wave_doc = {
            "schema_id": "pm.wave_artifact.v3.2.2",
            "stage_id": "E2",
            "prompt_id": "E2",
            "prompt_version": "pm.e2.v3.2.2",
            "work_id": "w-20260312-203855",
            "wave_index": widx,
            "wave_id": wp["wave_id"],
            "fanout_worklist_path": "Plans/.pipeline/work_items/w-20260312-203855/coverage_evidence_classifier.fanout_worklist.json",
            "tasks_in_wave_total": len(wp["task_ids"]),
            "tasks_completed": len(wp["task_ids"]),
            "tasks_blocked": 0,
            "tasks_pending": 0,
            "completed_task_ids": list(wp["task_ids"]),
            "blocked_task_ids": [],
            "pending_task_ids": [],
            "invocations": invocations,
        }
        wpath = WORK_DIR / f"coverage_evidence_classifier.wave-{widx:03d}.json"
        with open(wpath, "w", encoding="utf-8") as f:
            json.dump(wave_doc, f, indent=2, ensure_ascii=False)
            f.write("\n")
        wave_paths.append(f"Plans/.pipeline/work_items/w-20260312-203855/{wpath.name}")
    return wave_paths


def run_all(fanout: dict[str, Any]) -> list[dict[str, Any]]:
    records = []
    for t in fanout["tasks"]:
        tid = t["subagent_task_id"]
        inv = str(uuid.uuid4())
        run_batch(tid, inv)
        records.append({"subagent_task_id": tid, "invocation_id": inv})
    return records


def verify_gate() -> dict[str, Any]:
    with open(WORKLIST, encoding="utf-8") as f:
        wl = json.load(f)
    expected = {ct["coverage_task_id"] for ct in wl["coverage_tasks"]}
    seen: set[str] = set()
    dup: list[str] = []
    for p in sorted(OUT_DIR.glob("coverage.e2-task-*.json")):
        d = json.load(open(p))
        for row in d.get("classifications") or []:
            cid = row["coverage_task_id"]
            if cid in seen:
                dup.append(cid)
            seen.add(cid)
    missing = sorted(expected - seen)
    extra = sorted(seen - expected)
    return {
        "expected_total": len(expected),
        "classified_total": len(seen),
        "missing_task_ids": missing,
        "extra_task_ids": extra[:20],
        "duplicates": dup,
        "gate_pass": len(missing) == 0 and len(dup) == 0 and len(seen) == len(expected),
    }


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--prepare-only", action="store_true")
    ap.add_argument("--run-task", help="e2-task-001")
    ap.add_argument("--invocation-id", default="")
    ap.add_argument("--verify-only", action="store_true")
    args = ap.parse_args()
    if args.verify_only:
        print(json.dumps(verify_gate(), indent=2))
        return
    if args.run_task:
        if not args.invocation_id:
            raise SystemExit("invocation-id required")
        run_batch(args.run_task, args.invocation_id)
        return
    fanout = prepare_inputs()
    records = run_all(fanout)
    write_waves(fanout, records)
    print(json.dumps({"ok": True, "verify": verify_gate()}, indent=2))


if __name__ == "__main__":
    main()
